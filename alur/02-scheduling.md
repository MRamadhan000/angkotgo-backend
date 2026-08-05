# Desain Database -- Modul Penjadwalan Operasional Angkutan Umum

Dokumen ini menjelaskan struktur tabel yang digunakan untuk mengatur
jadwal operasional angkutan umum. Konsep yang digunakan adalah **travel
time based scheduling**, yaitu sistem menyimpan **durasi perjalanan
antar halte**, kemudian jadwal kedatangan setiap halte dihitung
berdasarkan jam keberangkatan awal (*departure time*).

------------------------------------------------------------------------

# 1. Tabel `routes`

## Tujuan

Menyimpan data master trayek angkutan.

## Struktur Tabel

  Field         Tipe Data      Keterangan
  ------------- -------------- -----------------------------
  id            bigint         Primary Key
  code          varchar(10)    Kode trayek (AG, AL, LG)
  name          varchar(100)   Nama trayek
  description   text           Deskripsi trayek (opsional)
  status        boolean        Status aktif/nonaktif
  created_at    timestamp      Waktu dibuat
  updated_at    timestamp      Waktu diperbarui

### Contoh Data

  id   code   name                     status
  ---- ------ ------------------------ --------
  1    AG     Arjosari - Landungsari   Active

------------------------------------------------------------------------

# 2. Tabel `stops`

## Tujuan

Menyimpan seluruh data halte.

## Struktur Tabel

  Field        Tipe Data       Keterangan
  ------------ --------------- ------------------
  id           bigint          Primary Key
  code         varchar(20)     Kode halte
  name         varchar(100)    Nama halte
  latitude     decimal(10,7)   Latitude
  longitude    decimal(10,7)   Longitude
  address      text            Alamat
  status       boolean         Status halte
  created_at   timestamp       Waktu dibuat
  updated_at   timestamp       Waktu diperbarui

### Contoh Data

  id   code    name
  ---- ------- -------------------
  1    ST001   Terminal Arjosari
  2    ST002   Blimbing
  3    ST003   Kayutangan
  4    ST004   Alun-Alun
  5    ST005   Landungsari

------------------------------------------------------------------------

# 3. Tabel `route_stops`

## Tujuan

Menghubungkan trayek dengan halte sekaligus menentukan urutan halte pada
trayek tersebut.

## Struktur Tabel

  Field        Tipe Data   Keterangan
  ------------ ----------- ------------------
  id           bigint      Primary Key
  route_id     bigint      FK → routes.id
  stop_id      bigint      FK → stops.id
  sequence     integer     Urutan halte
  created_at   timestamp   Waktu dibuat
  updated_at   timestamp   Waktu diperbarui

### Contoh Data

  id   route_id   stop_id   sequence
  ---- ---------- --------- ----------
  1    1          1         1
  2    1          2         2
  3    1          3         3
  4    1          4         4
  5    1          5         5

------------------------------------------------------------------------

# 4. Tabel `route_segments`

## Tujuan

Menyimpan waktu tempuh standar antar halte pada suatu trayek.

> **Catatan:** Tabel ini **tidak menyimpan jam**, melainkan **durasi
> perjalanan** antar dua halte yang berurutan.

## Struktur Tabel

  Field            Tipe Data   Keterangan
  ---------------- ----------- -------------------------------
  id               bigint      Primary Key
  route_id         bigint      FK → routes.id
  from_stop_id     bigint      FK → stops.id
  to_stop_id       bigint      FK → stops.id
  travel_minutes   integer     Estimasi waktu tempuh (menit)
  created_at       timestamp   Waktu dibuat
  updated_at       timestamp   Waktu diperbarui

### Contoh Data

  id   route_id   from_stop_id   to_stop_id   travel_minutes
  ---- ---------- -------------- ------------ ----------------
  1    1          1              2            10
  2    1          2              3            8
  3    1          3              4            9
  4    1          4              5            12

------------------------------------------------------------------------

# 5. Tabel `trip_templates`

## Tujuan

Menyimpan jadwal keberangkatan setiap perjalanan (Trip).

## Struktur Tabel

  Field            Tipe Data     Keterangan
  ---------------- ------------- ------------------------
  id               bigint        Primary Key
  route_id         bigint        FK → routes.id
  trip_code        varchar(20)   Kode Trip
  departure_time   time          Jam keberangkatan awal
  direction        enum          OUTBOUND / INBOUND
  status           boolean       Status aktif
  created_at       timestamp     Waktu dibuat
  updated_at       timestamp     Waktu diperbarui

### Contoh Data

  id   route_id   trip_code   departure_time
  ---- ---------- ----------- ----------------
  1    1          AG-001      08:00
  2    1          AG-002      08:30
  3    1          AG-003      09:00
  4    1          AG-004      09:30

------------------------------------------------------------------------

# Perhitungan Jadwal

Travel time:

  Dari                Ke            Durasi
  ------------------- ------------- ----------
  Terminal Arjosari   Blimbing      10 menit
  Blimbing            Kayutangan    8 menit
  Kayutangan          Alun-Alun     9 menit
  Alun-Alun           Landungsari   12 menit

Jika keberangkatan pukul **08:00**, maka sistem menghasilkan:

  Halte               Arrival Time
  ------------------- --------------
  Terminal Arjosari   08:00
  Blimbing            08:10
  Kayutangan          08:18
  Alun-Alun           08:27
  Landungsari         08:39

------------------------------------------------------------------------

# Relasi Antar Tabel

``` text
routes
   │
   ├──────────────┐
   │              │
   ▼              ▼
route_stops   trip_templates
   │
   ▼
stops
   ▲
   │
route_segments
```

------------------------------------------------------------------------

# Alur Input Data Admin

``` text
1. Tambah Trayek
        │
        ▼
2. Tambah Halte
        │
        ▼
3. Tentukan Urutan Halte pada Trayek
        │
        ▼
4. Tentukan Waktu Tempuh Antar Halte
        │
        ▼
5. Tambahkan Jadwal Keberangkatan
        │
        ▼
6. Sistem Menghitung Jadwal Kedatangan Setiap Halte Secara Otomatis
```