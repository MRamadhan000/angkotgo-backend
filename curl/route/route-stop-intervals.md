# Stop Intervals API

Dokumentasi endpoint untuk manajemen data interval antar halte (jarak & estimasi waktu).

---

## 1. CREATE — Menambahkan Interval Baru Antar Halte

**Endpoint:** `POST /stop-intervals`  
**Deskripsi:** Menambahkan data interval (jarak dan estimasi waktu tempuh) antara dua halte.

```bash
curl -X POST http://localhost:3000/stop-intervals \
  -H "Content-Type: application/json" \
  -d '{
    "routeId": 1,
    "fromStopId": 1,
    "toStopId": 2,
    "direction": "FORWARD",
    "distanceMeters": 750.5,
    "durationSeconds": 180,
    "sequenceOrder": 1
  }'
```

---

## 2. READ BY ROUTE & DIRECTION — Mengambil Daftar Interval

**Endpoint:** `GET /stop-intervals`  
**Deskripsi:** Mengambil daftar interval berdasarkan trayek dan arah.  
**Query Parameters:** `routeId` dan `direction`.

```bash
curl -X GET "http://localhost:3000/stop-intervals?routeId=1&direction=FORWARD"
```

---

## 3. READ ONE — Mengambil Detail Satu Interval

**Endpoint:** `GET /stop-intervals/:id`  
**Deskripsi:** Mengambil detail satu data interval berdasarkan ID.

```bash
curl -X GET http://localhost:3000/stop-intervals/1
```

---

## 4. UPDATE — Memperbarui Data Interval

**Endpoint:** `PATCH /stop-intervals/:id`  
**Deskripsi:** Memperbarui data interval (misalnya estimasi waktu atau jarak karena kondisi lalu lintas).

```bash
curl -X PATCH http://localhost:3000/stop-intervals/1 \
  -H "Content-Type: application/json" \
  -d '{
    "durationSeconds": 210,
    "distanceMeters": 780.0
  }'
```

---

## 5. DELETE — Menghapus Data Interval

**Endpoint:** `DELETE /stop-intervals/:id`  
**Deskripsi:** Menghapus data interval berdasarkan ID.

```bash
curl -X DELETE http://localhost:3000/stop-intervals/1
```
```
