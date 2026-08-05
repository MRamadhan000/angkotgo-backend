# Route Stops API

Dokumentasi endpoint untuk manajemen data halte (titik pemberhentian) pada trayek.

---

## 1. CREATE — Menambahkan Halte Baru

**Endpoint:** `POST /route-stops`  
**Deskripsi:** Menambahkan halte baru ke trayek tertentu.

```bash
curl -X POST http://localhost:3000/route-stops \
  -H "Content-Type: application/json" \
  -d '{
    "routeId": 1,
    "direction": "FORWARD",
    "stopName": "Halte Terminal Landungsari",
    "latitude": -7.925123,
    "longitude": 112.598765,
    "stopOrder": 1
  }'
```

---

## 2. READ BY ROUTE & DIRECTION — Mengambil Daftar Halte

**Endpoint:** `GET /route-stops`  
**Deskripsi:** Mengambil daftar halte berdasarkan trayek dan arah.  
**Query Parameters:** `routeId` dan `direction`.

```bash
curl -X GET "http://localhost:3000/route-stops?routeId=1&direction=FORWARD"
```

---

## 3. READ ONE — Mengambil Detail Satu Halte

**Endpoint:** `GET /route-stops/:id`  
**Deskripsi:** Mengambil detail satu halte berdasarkan ID.

```bash
curl -X GET http://localhost:3000/route-stops/1
```

---

## 4. UPDATE — Memperbarui Data Halte

**Endpoint:** `PATCH /route-stops/:id`  
**Deskripsi:** Memperbarui data halte (nama, urutan, atau koordinat).

```bash
curl -X PATCH http://localhost:3000/route-stops/1 \
  -H "Content-Type: application/json" \
  -d '{
    "stopName": "Halte Terminal Landungsari (Update)",
    "stopOrder": 2
  }'
```

---

## 5. DELETE — Menghapus Halte

**Endpoint:** `DELETE /route-stops/:id`  
**Deskripsi:** Menghapus halte berdasarkan ID.

```bash
curl -X DELETE http://localhost:3000/route-stops/1
```
```
