# Journey Route Finder — Alur & Penjelasan Teknis

Dokumen ini menjelaskan bagaimana fitur "cari trayek untuk perjalanan"
(`findAvailableRoutesForJourney`) bekerja, kenapa dipakai kombinasi
**PostGIS + OpenRouteService (ORS)**, dan kenapa versi sekarang dioptimasi
pakai **Matrix API** dibanding versi awal yang pakai **Directions API**.

---

## 1. Masalah yang diselesaikan

User punya titik **asal** (`userLat`, `userLng`) dan titik **tujuan**
(`destLat`, `destLng`). Sistem harus jawab: **trayek angkutan mana saja yang
bisa dipakai**, dan **trayek mana yang paling sedikit jalan kakinya** (dari
posisi user ke titik naik, dan dari titik turun ke tujuan akhir).

Ini butuh dua jenis perhitungan jarak yang berbeda sifatnya:

| Jenis jarak | Dipakai untuk | Alat |
|---|---|---|
| Jarak lurus (beeline / euclidean di permukaan bumi) | Cari titik jalur trayek terdekat dari user & tujuan | **PostGIS** |
| Jarak jalan kaki sesungguhnya (mengikuti jalan, trotoar, gang) | Estimasi waktu & jarak jalan kaki yang realistis | **ORS (OpenRouteService)** |

Dua alat ini dipakai berurutan, bukan salah satu saja, karena keduanya
menjawab pertanyaan yang berbeda.

---

## 2. Kenapa PostGIS dulu, baru ORS?

PostGIS **sangat cepat** untuk soal "titik mana yang paling dekat dari
sini" (query spasial di database, pakai index GIST) — tapi jaraknya
**garis lurus**, tidak memperhitungkan jalan, gedung, atau sungai yang
menghalangi.

ORS **akurat** untuk jarak jalan kaki sungguhan — tapi ini adalah
**panggilan API eksternal** yang punya biaya (waktu respons + kuota/limit
request), jadi tidak boleh dipanggil sembarangan untuk ratusan titik
sekaligus.

Strategi di kode ini: **pakai PostGIS untuk menyaring** kandidat sebanyak
mungkin dengan cepat dan gratis, baru **pakai ORS seminim mungkin** untuk
menghitung jarak jalan kaki yang presisi hanya pada kandidat yang benar-benar
relevan.

---

## 3. Alur lengkap `findAvailableRoutesForJourney`

```
userLat, userLng, destLat, destLng
            │
            ▼
┌─────────────────────────────────────────┐
│ STEP 1 — Query PostGIS (route_paths)     │
│                                           │
│ • Cari titik-titik jalur (route_paths)   │
│   dalam radius 1000m dari user           │
│ • Cari titik-titik jalur dalam radius    │
│   1000m dari tujuan                      │
│ • Ambil titik TERDEKAT per (route,       │
│   direction) — pakai ROW_NUMBER()        │
│ • Gabungkan: hanya pasangan yang urutan  │
│   titik naik < urutan titik turun        │
│   (arah perjalanannya masuk akal)        │
│ • Hitung beelineTotal (jarak lurus        │
│   total) untuk tiap kandidat              │
│ • ORDER BY beelineTotal ASC               │
│ • LIMIT 8  ← kandidat dibatasi di sini   │
└─────────────────────────────────────────┘
            │
            ▼  (maksimal 8 kandidat trayek)
┌─────────────────────────────────────────┐
│ STEP 2 — Batch walking distance (ORS)    │
│                                           │
│ • Cek cache in-memory dulu (TTL 5 menit) │
│   untuk tiap pasangan titik              │
│ • Titik yang belum ada di cache →        │
│   dikirim ke ORS Matrix API              │
│                                           │
│   Call #1: 1 titik user → N titik naik   │
│   Call #2: N titik turun → 1 titik tujuan│
│                                           │
│   (2 call ORS TOTAL, bukan 2×N call)     │
│                                           │
│ • Hasil disimpan ke cache untuk dipakai  │
│   ulang di request berikutnya            │
└─────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────┐
│ STEP 3 — Gabung & urutkan hasil          │
│                                           │
│ • totalWalkingDistance = jalan ke        │
│   trayek + jalan dari trayek ke tujuan   │
│ • Sort ASC → trayek dengan jalan kaki    │
│   paling sedikit ditampilkan duluan      │
└─────────────────────────────────────────┘
            │
            ▼
     Array trayek terurut, siap
     dikirim sebagai response API
```

---

## 4. Kenapa pakai ORS, bukan cuma jarak lurus PostGIS untuk semuanya?

Jarak lurus (`ST_Distance` / operator `<->`) bisa sangat menyesatkan untuk
estimasi jalan kaki:

- Ada sungai/rel/tol di antara dua titik → jarak lurus 200m, jarak jalan
  kaki sesungguhnya bisa 1.5km (harus muter cari jembatan).
- Jalan satu arah, gang buntu, area tanpa akses pejalan kaki → jarak lurus
  tidak menangkap ini sama sekali.
- User butuh estimasi **waktu** jalan kaki (`duration`), bukan cuma jarak —
  ini nggak bisa dihitung dari geometri garis lurus.

ORS pakai data jaringan jalan OpenStreetMap yang sudah punya informasi
routing pejalan kaki (`foot-walking` profile), jadi hasilnya jauh lebih
representatif dibanding sekadar garis lurus.

---

## 5. Kenapa ORS Matrix API, bukan Directions API (versi awal)?

### Versi awal (Directions API)
```
untuk setiap kandidat trayek (N trayek):
    call ORS Directions  →  walkingToRoute
    call ORS Directions  →  walkingToDestination
```
Total panggilan ORS = **2 × N**. Kalau ada 10 kandidat trayek → 20 call
ORS, setiap kali ada satu pencarian dari satu user. Ini boros karena:

- ORS API (terutama free tier) punya **rate limit** (± 40 request/menit,
  2000 request/hari) — cepat kena limit kalau traffic mulai ramai.
- Tiap call ORS ada latency jaringan sendiri-sendiri → response API kita
  jadi lambat kalau N besar.
- Directions API mengembalikan **geometry rute lengkap** (semua titik
  polyline jalan), padahal yang kita butuh cuma **angka jarak & durasi**
  — banyak data terbuang percuma.

### Versi sekarang (Matrix API)
```
call ORS Matrix (1x)  →  jarak dari 1 titik user ke SEMUA titik naik trayek
call ORS Matrix (1x)  →  jarak dari SEMUA titik turun trayek ke 1 titik tujuan
```
Total panggilan ORS = **2, tetap 2**, berapa pun jumlah kandidat trayeknya
(selama masih di bawah limit lokasi per-request ORS). Matrix API memang
dirancang untuk kasus "banyak-ke-banyak" seperti ini — dia hanya
mengembalikan angka jarak/durasi dalam bentuk tabel, tanpa geometry, jadi
jauh lebih ringan dan cepat.

**Efek optimasi:**

| | Directions API (lama) | Matrix API (sekarang) |
|---|---|---|
| Jumlah call ORS (10 kandidat) | 20 | 2 |
| Skala terhadap jumlah kandidat | Linear (2×N) | Konstan (selalu 2) |
| Data yang diambil | Geometry lengkap + jarak/durasi | Jarak/durasi saja |
| Risiko kena rate limit | Tinggi | Rendah |

---

## 6. Kenapa ada `LIMIT` + `ORDER BY beelineTotal` di query PostGIS?

Sebelum ORS dipanggil sama sekali, kandidat trayek sudah diurutkan
berdasarkan jarak lurus totalnya dan dibatasi (default `maxCandidates = 8`).
Alasannya: kandidat yang jarak lurusnya saja sudah jauh **hampir pasti**
jarak jalan kakinya juga jauh — tidak perlu dihitung presisi pakai ORS.
Ini mengurangi jumlah titik yang dikirim ke Matrix API, sekaligus menjaga
respons API tetap cepat.

> Kalau butuh lebih banyak/lebih sedikit kandidat, tinggal ubah parameter
> `maxCandidates` saat memanggil `findAvailableRoutesForJourney(...)`.

---

## 7. Kenapa ada cache in-memory?

Banyak trayek kemungkinan **berbagi titik naik/turun yang sama atau
berdekatan** (misal beberapa trayek lewat halte yang sama). Tanpa cache,
titik yang sama bisa dihitung ulang ke ORS setiap kali muncul di kandidat
berbeda, atau setiap kali user query dari lokasi yang mirip dalam waktu
berdekatan.

Cache di sini:
- **Key**: pasangan koordinat, dibulatkan 5 desimal (~1 meter presisi).
- **TTL**: 5 menit — cukup untuk menahan lonjakan request beruntun, tapi
  tidak terlalu lama sehingga data jadi basi (jaringan jalan jarang
  berubah, tapi tetap dijaga agar tidak "selamanya").

**Catatan penting:** cache ini **in-memory per instance server**. Kalau
aplikasi di-deploy dengan banyak instance (load balancer, horizontal
scaling), tiap instance punya cache sendiri-sendiri dan tidak saling
sinkron. Untuk production dengan multi-instance, sebaiknya diganti pakai
**Redis** (`SET key value EX 300`) supaya cache dibagi semua instance.

---

## 8. Kenapa dua arah Matrix API dibuat terpisah (`matrixOneToMany` &
`matrixManyToOne`), bukan digabung jadi satu call?

Bisa digabung jadi 1 call kalau mau lebih hemat lagi (taruh semua titik —
user, tujuan, semua titik naik, semua titik turun — dalam satu array
`locations`, lalu atur `sources`/`destinations` gabungan). Versi sekarang
sengaja dipisah jadi 2 call paralel (`Promise.all`) supaya:

- Kode lebih mudah dibaca dan di-debug (jelas mana yang menghitung
  "jalan ke trayek" dan mana "jalan dari trayek").
- Tetap sangat hemat (2 call, bukan 2×N) — penggabungan jadi 1 call hanya
  menghemat 1 call lagi, dengan trade-off kompleksitas kode yang naik
  cukup signifikan (harus atur index gabungan dengan hati-hati).

Kalau volume trafik nanti sangat tinggi dan 1 call tambahan itu berarti,
bagian ini bisa digabung lebih lanjut.

---

## 9. Ringkasan keputusan desain

| Keputusan | Alasan |
|---|---|
| PostGIS untuk filter awal | Cepat, gratis, jalan di dalam database, cocok untuk "titik terdekat" |
| ORS untuk jarak jalan kaki final | Akurat, mengikuti jaringan jalan sesungguhnya, dapat estimasi waktu |
| Matrix API, bukan Directions API | Skala konstan (2 call) vs skala linear (2×N call) |
| `LIMIT` + `ORDER BY beeline` sebelum ORS | Buang kandidat yang jelas jauh sebelum kena biaya API eksternal |
| Cache in-memory per pasangan titik | Hindari hitung ulang titik yang sering dipakai bersama |
| `foot-walking` profile | Sesuai use case: user jalan kaki dari/ke titik naik-turun trayek |

---

## 10. File terkait

- `routes.service.ts` — implementasi lengkap alur di atas.
- `route-path.entity.ts` — entity `RoutePath` dengan kolom `geom` (PostGIS
  geography) yang otomatis terisi dari `latitude`/`longitude` lewat
  lifecycle hook `@BeforeInsert`/`@BeforeUpdate`.