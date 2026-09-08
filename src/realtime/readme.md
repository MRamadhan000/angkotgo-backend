# Realtime Vehicle dan Sinyal

Dokumen ini menjelaskan cara **driver** dan **user/penumpang** terhubung ke realtime backend AngkotGo.

Backend menggunakan:

- Socket.IO untuk koneksi frontend atau aplikasi driver.
- Redis Pub/Sub untuk meneruskan event antar instance backend.
- REST API untuk driver mengirim lokasi kendaraan dan untuk penumpang membuat sinyal.

Redis tidak perlu diakses langsung oleh frontend atau aplikasi driver.

## 1. Menjalankan Backend dan Redis

Jalankan Redis dengan Docker Compose:

```bash
docker compose up -d redis
```

Secara default backend menggunakan:

```text
REDIS_URL=redis://localhost:6379
```

Jika backend berjalan pada port default:

```text
http://localhost:3001
```

Socket.IO client terhubung ke URL yang sama:

```ts
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001', {
  transports: ['websocket'],
});
```

Install client jika belum:

```bash
npm install socket.io-client
```

Saat backend berhasil terhubung ke Redis, log yang muncul adalah:

```text
[Nest] ... LOG [VehicleGateway] Berhasil connect ke Redis untuk vehicle gateway (vehicle:location)
[Nest] ... LOG [SinyalGateway] Berhasil connect ke Redis untuk sinyal gateway (sinyal:updated)
```

## 2. Alur Driver Mengirim Lokasi

Driver mengirim lokasi melalui REST API:

```http
POST http://localhost:3001/vehicle-locations
Content-Type: application/json
```

Request:

```json
{
  "vehicleAssignmentId": 123,
  "latitude": -7.9839,
  "longitude": 112.6214,
  "stopStatus": "HEADING_TO"
}
```

Backend akan:

```text
Driver
  -> POST /vehicle-locations
  -> Simpan VehicleLocation ke database
  -> Publish Redis channel vehicle:location
  -> VehicleGateway emit vehicle:updated
  -> User yang join assignment:123 menerima lokasi
```

## 3. Alur User Melihat Lokasi Vehicle

User membuat koneksi Socket.IO lalu join room berdasarkan `vehicleAssignmentId`.

```ts
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001', {
  transports: ['websocket'],
});

const vehicleAssignmentId = 123;

socket.on('connect', () => {
  console.log('User connected:', socket.id);

  socket.emit('vehicle:join', {
    vehicleAssignmentId,
  });
});

socket.on('vehicle:joined', (response) => {
  console.log('Joined vehicle room:', response);
});

socket.on('vehicle:updated', (location) => {
  console.log('Vehicle location updated:', location);

  // Update marker kendaraan pada peta.
});
```

Room yang digunakan:

```text
assignment:123
```

Payload event `vehicle:updated`:

```json
{
  "vehicleAssignmentId": 123,
  "latitude": -7.9839,
  "longitude": 112.6214,
  "currentStopId": 10,
  "stopStatus": "HEADING_TO",
  "createdAt": "2026-09-06T02:00:00.000Z"
}
```

User hanya menerima lokasi dari assignment yang di-join.

## 4. Alur Penumpang Membuat Sinyal

Penumpang membuat sinyal melalui REST API:

```http
POST http://localhost:3001/sinyal
Content-Type: application/json
```

Request:

```json
{
  "latitude": -7.9839,
  "longitude": 112.6214,
  "vehicleAssignmentId": ["123", "124"]
}
```

Backend akan mengirim sinyal kepada setiap assignment yang ada di array `vehicleAssignmentId`.

```text
Penumpang
  -> POST /sinyal
  -> Simpan sinyal ke database
  -> Publish Redis channel sinyal:updated
  -> SinyalGateway emit sinyal:updated
  -> Driver pada room sinyal:assignment:123 atau sinyal:assignment:124 menerima sinyal
```

## 5. Alur Driver Menerima Sinyal

Driver join room sinyal sesuai assignment kendaraannya:

```ts
const socket = io('http://localhost:3001', {
  transports: ['websocket'],
});

const vehicleAssignmentId = '123';

socket.on('connect', () => {
  console.log('Driver connected:', socket.id);

  socket.emit('sinyal:join', {
    vehicleAssignmentId,
  });
});

socket.on('sinyal:joined', (response) => {
  console.log('Joined signal room:', response);
});

socket.on('sinyal:updated', (signal) => {
  console.log('Passenger signal received:', signal);

  // Tampilkan lokasi dan status sinyal kepada driver.
});
```

Room yang digunakan:

```text
sinyal:assignment:123
```

Payload event `sinyal:updated`:

```json
{
  "sinyalId": "a1234567-xxxx-xxxx-xxxx-xxxxxxxx",
  "vehicleAssignmentId": "123",
  "latitude": -7.9839,
  "longitude": 112.6214,
  "status": "ACTIVE"
}
```

## 6. Driver Menyelesaikan Sinyal

Driver menyelesaikan sinyal melalui REST API:

```http
PUT http://localhost:3001/sinyal/a1234567-xxxx-xxxx-xxxx-xxxxxxxx/completed
Content-Type: application/json
```

Request:

```json
{
  "status": "COMPLETED"
}
```

Semua driver yang menjadi target sinyal akan menerima event `sinyal:updated` dengan status terbaru:

```json
{
  "sinyalId": "a1234567-xxxx-xxxx-xxxx-xxxxxxxx",
  "vehicleAssignmentId": "123",
  "latitude": -7.9839,
  "longitude": 112.6214,
  "status": "COMPLETED"
}
```

## 7. Ringkasan Event

| Peran | Tujuan | Event | Aksi |
| --- | --- | --- | --- |
| User | Memantau kendaraan | `vehicle:join` | Join room `assignment:{id}` |
| User | Menerima lokasi | `vehicle:updated` | Update marker kendaraan |
| Driver | Menerima sinyal | `sinyal:join` | Join room `sinyal:assignment:{id}` |
| Driver | Menerima sinyal baru/status | `sinyal:updated` | Tampilkan atau perbarui sinyal |

## 8. Membersihkan Listener

Pada React atau frontend lain, lepaskan listener saat halaman/component ditutup:

```ts
socket.off('vehicle:updated');
socket.off('sinyal:updated');
socket.disconnect();
```

Gunakan satu koneksi Socket.IO per halaman atau per sesi realtime agar tidak terjadi listener ganda.
