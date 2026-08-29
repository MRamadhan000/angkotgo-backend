# Drivers API

Dokumentasi endpoint untuk manajemen data driver.

---

## 1. Register Driver

**Endpoint:** `POST /drivers`  
**Deskripsi:** Mendaftarkan driver baru. Password akan otomatis di-hash oleh service.

```bash
curl -X POST http://localhost:3000/drivers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Budi Santoso",
    "nik": "3507123456780001",
    "email": "budi.santoso@email.com",
    "phone": "081234567890",
    "password": "password123",
    "licenseNumber": "SIM-A-12345678",
    "licenseExpiryDate": "2028-12-31",
    "address": "Jl. Soekarno Hatta No. 10, Malang"
  }'
```

---

## 2. Login Driver

**Endpoint:** `POST /drivers/login`  
**Deskripsi:** Login menggunakan email dan password yang sudah terdaftar.

```bash
curl -X POST http://localhost:3000/drivers/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "budi.santoso@email.com",
    "password": "password123"
  }'
```

---

## 3. Get All Drivers

**Endpoint:** `GET /drivers`  
**Deskripsi:** Mengambil daftar semua data driver.

```bash
curl -X GET http://localhost:3000/drivers
```

---

## 4. Get Driver by ID

**Endpoint:** `GET /drivers/:id`  
**Deskripsi:** Mengambil detail driver berdasarkan ID.

```bash
curl -X GET http://localhost:3000/drivers/1
```

---

## 5. Update Driver

**Endpoint:** `PATCH /drivers/:id`  
**Deskripsi:** Memperbarui sebagian atau seluruh data driver (hanya kirim field yang ingin diubah).

```bash
curl -X PATCH http://localhost:3000/drivers/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Budi Santoso Updated",
    "address": "Jl. Ijen No. 45, Malang"
  }'
```

---

## 6. Update Driver Status

**Endpoint:** `PATCH /drivers/:id/status`  
**Deskripsi:** Mengubah status driver secara dinamis.  
**Nilai status yang diizinkan:** `ACTIVE`, `OFF_DUTY`, `SUSPENDED`  
Endpoint ini juga bisa digunakan untuk verifikasi / mengaktifkan akun.

```bash
curl -X PATCH http://localhost:3000/drivers/1/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "ACTIVE"
  }'
```

---

## 7. Deactivate / Soft Delete Driver

**Endpoint:** `DELETE /drivers/:id`  
**Deskripsi:** Menonaktifkan akun driver (mengubah status menjadi `OFF_DUTY`).

```bash
curl -X DELETE http://localhost:3000/drivers/1
```
```
