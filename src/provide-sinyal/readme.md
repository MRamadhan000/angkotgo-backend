# Sinyal Realtime

Fitur **Sinyal Penumpang** digunakan agar penumpang dapat mengirim sinyal permintaan angkot, kemudian driver yang memiliki `vehicleAssignmentId` terkait dapat menerima sinyal tersebut secara realtime melalui WebSocket.

## Arsitektur

```text
                    PENUMPANG
                       │
                       │ POST /sinyal
                       ▼
                SinyalController
                       │
                       ▼
                 SinyalService
                       │
                ┌──────┴──────┐
                │             │
                ▼             ▼
        sinyal_penumpang  sinyal_detail
                │
                ▼
           SinyalGateway
                │
        WebSocket Broadcast
                │
       ┌────────┴────────┐
       ▼                 ▼
 Assignment 101      Assignment 102
       │                 │
       ▼                 ▼
    DRIVER A          DRIVER B
```

---

# 1. Konsep

Satu sinyal dapat ditujukan kepada beberapa kendaraan.

Contoh:

```json
{
  "latitude": -7.9839,
  "longitude": 112.6214,
  "vehicleAssignmentId": [
    "101",
    "102",
    "103"
  ]
}
```

Artinya sinyal dikirim kepada:

```text
Assignment 101
Assignment 102
Assignment 103
```

Setiap driver melakukan subscribe berdasarkan `vehicleAssignmentId`.

---

# 2. Endpoint REST

## Create Sinyal

```http
POST /sinyal
```

Request:

```json
{
  "latitude": -7.9839,
  "longitude": 112.6214,
  "vehicleAssignmentId": [
    "101",
    "102"
  ]
}
```

Response:

```json
{
  "statusCode": 201,
  "message": "Sinyal penumpang berhasil dibuat.",
  "data": {
    "id": "a1234567-xxxx-xxxx-xxxx-xxxxxxxx",
    "totalTargetAngkot": 2
  }
}
```

Setelah database berhasil dibuat, backend akan mengirim event WebSocket ke:

```text
sinyal:assignment:101
sinyal:assignment:102
```

---

# 3. Driver Subscribe

Driver harus melakukan koneksi ke WebSocket.

Install:

```bash
npm install socket.io-client
```

Connect:

```ts
import { io } from "socket.io-client";

const socket = io(
  "http://localhost:3000",
  {
    transports: ["websocket"],
  }
);
```

Setelah connected, driver melakukan join berdasarkan assignment:

```ts
socket.on("connect", () => {
  console.log("Connected:", socket.id);

  socket.emit("sinyal:join", {
    vehicleAssignmentId: "101",
  });
});
```

Driver sekarang berada di room:

```text
sinyal:assignment:101
```

---

# 4. Driver Menerima Sinyal

Driver mendengarkan event:

```ts
socket.on(
  "sinyal:updated",
  (data) => {
    console.log(
      "Sinyal diterima:",
      data
    );
  }
);
```

Payload:

```json
{
  "sinyalId": "a1234567-xxxx-xxxx-xxxx-xxxxxxxx",
  "vehicleAssignmentId": "101",
  "latitude": -7.9839,
  "longitude": 112.6214,
  "status": "ACTIVE"
}
```

Frontend kemudian dapat menampilkan:

```text
🔔 Sinyal Penumpang

Lokasi:
Latitude  : -7.9839
Longitude : 112.6214

Status:
ACTIVE
```

---

# 5. Skenario Create Sinyal

Misalnya terdapat:

```text
Driver A
vehicleAssignmentId = 101

Driver B
vehicleAssignmentId = 102

Driver C
vehicleAssignmentId = 103
```

Driver A subscribe:

```ts
socket.emit("sinyal:join", {
  vehicleAssignmentId: "101",
});
```

Driver B:

```ts
socket.emit("sinyal:join", {
  vehicleAssignmentId: "102",
});
```

Driver C:

```ts
socket.emit("sinyal:join", {
  vehicleAssignmentId: "103",
});
```

Kemudian penumpang membuat sinyal:

```http
POST /sinyal
```

```json
{
  "latitude": -7.9839,
  "longitude": 112.6214,
  "vehicleAssignmentId": [
    "101",
    "102"
  ]
}
```

Backend akan melakukan:

```text
Create Sinyal
      │
      ├── Database
      │
      ├── Room 101 → ACTIVE
      │
      └── Room 102 → ACTIVE
```

Driver A menerima:

```json
{
  "sinyalId": "abc",
  "vehicleAssignmentId": "101",
  "latitude": -7.9839,
  "longitude": 112.6214,
  "status": "ACTIVE"
}
```

Driver B menerima:

```json
{
  "sinyalId": "abc",
  "vehicleAssignmentId": "102",
  "latitude": -7.9839,
  "longitude": 112.6214,
  "status": "ACTIVE"
}
```

Driver C **tidak menerima apa pun** karena tidak termasuk target sinyal.

---

# 6. Driver Mengambil / Menyelesaikan Sinyal

Driver yang menerima sinyal dapat melakukan:

```http
PUT /sinyal/:id/completed
```

Contoh:

```http
PUT /sinyal/abc/completed
```

Body:

```json
{
  "status": "COMPLETED"
}
```

Backend akan:

```text
PUT /sinyal/abc/completed
              │
              ▼
       SinyalService
              │
              ▼
       status = COMPLETED
              │
              ▼
        SinyalGateway
              │
       ┌──────┴──────┐
       ▼             ▼
 Assignment 101   Assignment 102
       │             │
       ▼             ▼
    COMPLETED      COMPLETED
```

Karena satu sinyal memiliki beberapa detail assignment, semua driver yang menjadi target akan menerima perubahan status.

---

# 7. Realtime Status Update

Driver tetap mendengarkan event yang sama:

```ts
socket.on(
  "sinyal:updated",
  (data) => {
    console.log(data);
  }
);
```

Sebelumnya:

```json
{
  "sinyalId": "abc",
  "vehicleAssignmentId": "101",
  "latitude": -7.9839,
  "longitude": 112.6214,
  "status": "ACTIVE"
}
```

Setelah driver menyelesaikan:

```json
{
  "sinyalId": "abc",
  "vehicleAssignmentId": "101",
  "latitude": -7.9839,
  "longitude": 112.6214,
  "status": "COMPLETED"
}
```

Frontend dapat langsung mengubah tampilan:

```text
ACTIVE
  ↓
COMPLETED
```

tanpa harus melakukan polling.

---

# 8. Contoh Implementasi Driver

Contoh sederhana menggunakan React/Next.js:

```tsx
"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

interface SinyalRealtime {
  sinyalId: string;
  vehicleAssignmentId: string;
  latitude: number;
  longitude: number;
  status: "ACTIVE" | "COMPLETED";
}

export default function DriverSinyal({
  vehicleAssignmentId,
}: {
  vehicleAssignmentId: string;
}) {
  const [sinyal, setSinyal] =
    useState<SinyalRealtime | null>(null);

  useEffect(() => {
    if (!vehicleAssignmentId) return;

    const socket = io(
      "http://localhost:3000",
      {
        transports: ["websocket"],
      }
    );

    socket.on("connect", () => {
      console.log(
        "Connected:",
        socket.id
      );

      socket.emit("sinyal:join", {
        vehicleAssignmentId,
      });
    });

    socket.on(
      "sinyal:updated",
      (data: SinyalRealtime) => {
        console.log(
          "Sinyal update:",
          data
        );

        setSinyal(data);
      }
    );

    return () => {
      socket.disconnect();
    };
  }, [vehicleAssignmentId]);

  return (
    <div>
      {sinyal ? (
        <>
          <p>
            Status: {sinyal.status}
          </p>

          <p>
            Latitude: {sinyal.latitude}
          </p>

          <p>
            Longitude: {sinyal.longitude}
          </p>
        </>
      ) : (
        <p>
          Belum ada sinyal
        </p>
      )}
    </div>
  );
}
```

---

# 9. Skenario Lengkap

## Step 1 — Driver Login

Driver login dan mendapatkan:

```text
vehicleAssignmentId = 101
```

---

## Step 2 — Driver Connect WebSocket

```ts
const socket = io(
  "http://localhost:3000"
);
```

---

## Step 3 — Driver Subscribe

```ts
socket.emit("sinyal:join", {
  vehicleAssignmentId: "101",
});
```

Driver masuk:

```text
sinyal:assignment:101
```

---

## Step 4 — Penumpang Membuat Sinyal

```http
POST /sinyal
```

```json
{
  "latitude": -7.9839,
  "longitude": 112.6214,
  "vehicleAssignmentId": [
    "101"
  ]
}
```

---

## Step 5 — Database

Backend membuat:

```text
sinyal_penumpang
----------------
id         = abc
latitude   = -7.9839
longitude  = 112.6214
status     = ACTIVE
```

dan:

```text
sinyal_detail
----------------
id_sinyal            = abc
vehicleAssignmentId  = 101
```

---

## Step 6 — WebSocket Broadcast

Backend mengirim:

```text
sinyal:assignment:101
```

Event:

```text
sinyal:updated
```

Payload:

```json
{
  "sinyalId": "abc",
  "vehicleAssignmentId": "101",
  "latitude": -7.9839,
  "longitude": 112.6214,
  "status": "ACTIVE"
}
```

---

## Step 7 — Driver Menerima

Driver mendapatkan:

```text
🔔 Ada sinyal penumpang
Status: ACTIVE
Lokasi: -7.9839, 112.6214
```

---

## Step 8 — Driver Menyelesaikan

```http
PUT /sinyal/abc/completed
```

```json
{
  "status": "COMPLETED"
}
```

---

## Step 9 — WebSocket Update

Driver menerima:

```json
{
  "sinyalId": "abc",
  "vehicleAssignmentId": "101",
  "latitude": -7.9839,
  "longitude": 112.6214,
  "status": "COMPLETED"
}
```

Frontend mengubah:

```text
ACTIVE
   ↓
COMPLETED
```

---

# 10. Event WebSocket

| Event            | Direction        | Fungsi                         |
| ---------------- | ---------------- | ------------------------------ |
| `sinyal:join`    | Driver → Backend | Subscribe assignment           |
| `sinyal:joined`  | Backend → Driver | Konfirmasi join                |
| `sinyal:updated` | Backend → Driver | Sinyal baru / perubahan status |

---

# 11. Room

Format room:

```text
sinyal:assignment:{vehicleAssignmentId}
```

Contoh:

```text
sinyal:assignment:101
sinyal:assignment:102
sinyal:assignment:103
```

Driver hanya mendapatkan event dari room yang dia join.

```text
Driver A
assignment 101
      │
      ▼
sinyal:assignment:101
      │
      ├── Sinyal A
      └── Sinyal B


Driver B
assignment 102
      │
      ▼
sinyal:assignment:102
      │
      └── Sinyal C
```

---

# 12. Ringkasan

### Penumpang

```text
POST /sinyal
      ↓
Create database
      ↓
Broadcast WebSocket
```

### Driver

```text
Connect WebSocket
      ↓
sinyal:join
      ↓
vehicleAssignmentId
      ↓
Menerima sinyal realtime
```

### Ketika sinyal selesai

```text
PUT /sinyal/:id/completed
      ↓
Update database
      ↓
Broadcast status COMPLETED
      ↓
Driver menerima update realtime
```

Dengan desain ini, **REST API menjadi sumber perubahan data**, sedangkan **WebSocket menjadi jalur notifikasi realtime** kepada driver yang sesuai dengan `vehicleAssignmentId`.
