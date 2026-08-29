# Routes API

Dokumentasi endpoint untuk manajemen data trayek (routes).

---

## 1. Buat Master Trayek Baru

**Endpoint:** `POST /routes`  
**Deskripsi:** Menambahkan data trayek utama (contoh: Angkot rute Arjosari - Landungsari).

```bash
curl -X POST http://localhost:3000/routes \
  -H "Content-Type: application/json" \
  -d '{
    "routeCode": "ABG",
    "routeName": "Arjosari - Borobudur - Gadang"
  }'
```

---

## 2. Ambil Semua Data Trayek

**Endpoint:** `GET /routes`  
**Deskripsi:** Mengambil daftar seluruh trayek angkot yang terdaftar di sistem.

```bash
curl -X GET http://localhost:3000/routes
```

---

## 3. Ambil Detail Trayek Berdasarkan ID

**Endpoint:** `GET /routes/:id`  
**Deskripsi:** Mengambil informasi spesifik suatu trayek berdasarkan ID.

```bash
curl -X GET http://localhost:3000/routes/1
```

---

## 4. Tambah Titik Koordinat Jalur / Polyline Peta

**Endpoint:** `POST /routes/:id/paths`  
**Deskripsi:** Menambahkan titik GPS (latitude & longitude) secara berurutan (`sequence`) untuk membentuk garis rute di peta.

```bash
curl -X POST http://localhost:3000/routes/1/paths \
  -H "Content-Type: application/json" \
  -d '{
    "direction": "FORWARD",
    "latitude": -7.94500000,
    "longitude": 112.61500000,
    "sequence": 1
  }'
```

---

## 5. Tambah Halte / Titik Pemberhentian

**Endpoint:** `POST /routes/:id/stops`  
**Deskripsi:** Menambahkan titik halte resmi untuk naik-turun penumpang pada trayek tertentu.

```bash
curl -X POST http://localhost:3000/routes/1/stops \
  -H "Content-Type: application/json" \
  -d '{
    "direction": "FORWARD",
    "name": "Terminal Arjosari",
    "latitude": -7.93500000,
    "longitude": 112.64000000,
    "sequence": 1
  }'
```

---

## 6. Update Data Trayek

**Endpoint:** `PATCH /routes/:id`  
**Deskripsi:** Memperbarui informasi trayek (misalnya mengubah nama atau jarak).

```bash
curl -X PATCH http://localhost:3000/routes/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Arjosari - Landungsari via Dinoyo",
    "distanceKm": 13.0
  }'
```

---

## 7. Hapus Trayek

**Endpoint:** `DELETE /routes/:id`  
**Deskripsi:** Menghapus data trayek dari sistem.

```bash
curl -X DELETE http://localhost:3000/routes/1
```
```
