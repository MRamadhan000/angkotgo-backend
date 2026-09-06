# Vehicle WebSocket

WebSocket digunakan untuk memberikan update posisi kendaraan secara **real-time** kepada user.

Setiap kendaraan/assignment memiliki room sendiri berdasarkan:

```text
assignment:{vehicleAssignmentId}
```

Contoh:

```text
vehicleAssignmentId = 123

room = assignment:123
```

Dengan konsep ini, user hanya menerima update dari `vehicleAssignmentId` yang sedang mereka ikuti.

---

## 1. Arsitektur

Flow keseluruhan:

```text
                    ┌─────────────────────┐
                    │       Driver        │
                    └──────────┬──────────┘
                               │
                               │ POST
                               ▼
                    ┌─────────────────────┐
                    │ Vehicle Controller  │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Vehicle Location    │
                    │ Service             │
                    └──────────┬──────────┘
                               │
                               ▼
                         ┌──────────┐
                         │ Database │
                         └────┬─────┘
                              │
                              │ broadcast
                              ▼
                    ┌─────────────────────┐
                    │   Vehicle Gateway   │
                    └──────────┬──────────┘
                               │
                               │ WebSocket
                               ▼
                    ┌─────────────────────┐
                    │ assignment:123      │
                    └──────────┬──────────┘
                               │
                     ┌─────────┴─────────┐
                     ▼                   ▼
                  User A              User B
```

---

# 2. WebSocket URL

Jika backend berjalan di:

```text
http://localhost:3001
```

maka frontend melakukan koneksi:

```ts
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');
```

Install Socket.IO Client jika belum:

```bash
npm install socket.io-client
```

---

# 3. Connect ke WebSocket

Buat koneksi:

```ts
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

socket.on('connect', () => {
  console.log('Connected:', socket.id);
});
```

Ketika berhasil:

```text
Connected: xxxxxxxxx
```

---

# 4. Join berdasarkan Vehicle Assignment ID

Misalnya user sedang melihat kendaraan dengan:

```text
vehicleAssignmentId = 123
```

Frontend mengirim event:

```ts
socket.emit('vehicle:join', {
  vehicleAssignmentId: 123,
});
```

Gateway akan menjalankan:

```ts
@SubscribeMessage('vehicle:join')
handleJoin(
  @ConnectedSocket() client: Socket,
  @MessageBody()
  data: { vehicleAssignmentId: number },
) {
  const room = `assignment:${data.vehicleAssignmentId}`;

  client.join(room);

  console.log(`${client.id} joined ${room}`);

  return {
    event: 'vehicle:joined',
    data: {
      vehicleAssignmentId: data.vehicleAssignmentId,
    },
  };
}
```

User kemudian berada di:

```text
assignment:123
```

---

# 5. Menerima Update Kendaraan

Ketika driver mengirim lokasi baru melalui REST:

```http
POST /vehicle-locations
```

Backend menyimpan lokasi ke database kemudian menjalankan:

```ts
this.vehicleGateway.broadcastLocation(data);
```

Gateway akan melakukan:

```ts
const room = `assignment:${location.vehicleAssignmentId}`;

this.server.to(room).emit('vehicle:updated', location);
```

Jika:

```text
vehicleAssignmentId = 123
```

maka:

```text
assignment:123
```

akan menerima:

```text
vehicle:updated
```

---

# 6. Frontend menerima update

Frontend cukup listen:

```ts
socket.on('vehicle:updated', (data) => {
  console.log('Vehicle updated:', data);
});
```

Contoh data:

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

Frontend kemudian bisa mengubah posisi marker kendaraan.

---

# 7. Contoh Lengkap untuk User

Contoh sederhana React / Next.js:

```tsx
'use client';

import { useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

export default function VehicleTracking({
  vehicleAssignmentId,
}: {
  vehicleAssignmentId: number;
}) {
  useEffect(() => {
    // Connect
    socket.on('connect', () => {
      console.log('Connected:', socket.id);

      // Join assignment
      socket.emit('vehicle:join', {
        vehicleAssignmentId,
      });
    });

    // Receive vehicle update
    socket.on('vehicle:updated', (data) => {
      console.log('Vehicle updated:', data);

      // Update marker / state
    });

    return () => {
      socket.off('connect');
      socket.off('vehicle:updated');
    };
  }, [vehicleAssignmentId]);

  return (
    <div>
      Monitoring vehicle {vehicleAssignmentId}
    </div>
  );
}
```

Penggunaan:

```tsx
<VehicleTracking vehicleAssignmentId={123} />
```

---

# 8. Apa yang terjadi?

Misalnya user membuka:

```text
/vehicle/123
```

Frontend mendapatkan:

```text
vehicleAssignmentId = 123
```

Kemudian:

```text
Frontend
    │
    │ socket.emit('vehicle:join')
    │ { vehicleAssignmentId: 123 }
    ▼
Gateway
    │
    │ client.join('assignment:123')
    ▼
assignment:123
```

Ketika driver mengirim lokasi:

```text
Driver
   │
   │ POST /vehicle-locations
   ▼
Backend
   │
   ├── Save database
   │
   └── broadcastLocation()
             │
             ▼
       assignment:123
             │
       ┌─────┴─────┐
       ▼           ▼
    User A       User B
```

---

# 9. User Tidak Mendapat Semua Kendaraan

Misalnya terdapat:

```text
assignment:101
assignment:102
assignment:103
```

User A hanya join:

```text
assignment:101
```

Maka:

```text
Vehicle 101
     ↓
assignment:101
     ↓
User A ✅
```

Sedangkan:

```text
Vehicle 102
     ↓
assignment:102
     ↓
User A ❌
```

dan:

```text
Vehicle 103
     ↓
assignment:103
     ↓
User A ❌
```

Jadi user hanya menerima update dari assignment yang dia join.

---

# 10. Overwrite Posisi di Frontend

Database tetap menyimpan history:

```text
08:00 → -7.9830, 112.6210
08:01 → -7.9835, 112.6215
08:02 → -7.9840, 112.6220
```

Tetapi frontend cukup menyimpan posisi terakhir.

Contoh:

```ts
const [vehicleLocation, setVehicleLocation] = useState(null);

socket.on('vehicle:updated', (data) => {
  setVehicleLocation(data);
});
```

Ketika data baru datang:

```text
Data lama
assignment 123
lat -7.9835
lng 112.6215

        ↓

Data baru
assignment 123
lat -7.9840
lng 112.6220

        ↓

Frontend overwrite
```

Sehingga marker selalu menunjukkan posisi terbaru.

---

# 11. Flow Akhir

Untuk AngkotGo, flow yang digunakan:

```text
                    DRIVER
                      │
                      │ REST POST
                      ▼
             /vehicle-locations
                      │
                      ▼
          VehicleLocationsService
                      │
                      ▼
                   DATABASE
                      │
                      ▼
             VehicleGateway
                      │
                      │ emit
                      ▼
             assignment:{id}
                      │
                      ▼
                USER FRONTEND
                      │
                      ▼
             Update marker map
```

### Kesimpulan

```text
REST
→ digunakan driver untuk mengirim lokasi

Database
→ menyimpan history lokasi

WebSocket
→ mengirim perubahan lokasi secara realtime

vehicleAssignmentId
→ digunakan sebagai identitas room

Frontend
→ hanya menerima assignment yang di-join
```

Contoh paling penting:

```ts
// User join
socket.emit('vehicle:join', {
  vehicleAssignmentId: 123,
});

// User menerima update
socket.on('vehicle:updated', (data) => {
  // posisi terbaru assignment 123
});
```
