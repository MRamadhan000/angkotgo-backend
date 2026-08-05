# Route Paths API

Dokumentasi endpoint untuk manajemen titik koordinat jalur (polyline) trayek.

---

## 1. CREATE — Menambahkan Titik Koordinat Jalur Baru

**Endpoint:** `POST /route-paths`  
**Deskripsi:** Menambahkan satu titik koordinat GPS baru ke jalur trayek.

```bash
curl -X POST http://localhost:3000/route-paths \
  -H "Content-Type: application/json" \
  -d '{
    "routeId": 1,
    "direction": "FORWARD",
    "latitude": -7.942490,
    "longitude": 112.612450,
    "sequenceOrder": 1
  }'
```

---

## 2. READ — Mengambil Daftar Jalur Berdasarkan Route ID & Direction

**Endpoint:** `GET /route-paths`  
**Deskripsi:** Mengambil daftar titik koordinat jalur.  
**Query Parameters:** `routeId` dan `direction`.

```bash
curl -X GET "http://localhost:3000/route-paths?routeId=1&direction=FORWARD"
```

---

## 3. UPDATE — Memperbarui Titik Koordinat Berdasarkan ID

**Endpoint:** `PATCH /route-paths/:id`  
**Deskripsi:** Memperbarui data titik koordinat (latitude, longitude, atau sequenceOrder).

```bash
curl -X PATCH http://localhost:3000/route-paths/1 \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": -7.943000,
    "longitude": 112.613000,
    "sequenceOrder": 2
  }'
```

---

## 4. DELETE — Menghapus Satu Titik Koordinat Berdasarkan ID

**Endpoint:** `DELETE /route-paths/:id`  
**Deskripsi:** Menghapus satu titik koordinat berdasarkan ID-nya.

```bash
curl -X DELETE http://localhost:3000/route-paths/1
```

---

## 5. DELETE BULK — Membersihkan Seluruh Jalur Berdasarkan Route & Direction

**Endpoint:** `DELETE /route-paths/bulk/clear`  
**Deskripsi:** Menghapus semua koordinat jalur pada arah tertentu. Berguna ketika ingin menggambar ulang jalur dari awal.  
**Query Parameters:** `routeId` dan `direction`.

```bash
curl -X DELETE "http://localhost:3000/route-paths/bulk/clear?routeId=1&direction=FORWARD"
```
```
