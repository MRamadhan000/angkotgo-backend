# Alur User, Payment, dan WebSocket Driver

Dokumen ini menjelaskan alur aktual dari user mengambil data atau login, membuat pembayaran, sampai driver menerima update payment melalui Socket.IO berdasarkan `vehicleAssignmentId`.

## 1. Konsep utama

`vehicleAssignmentId` adalah kunci penghubung antara payment, kendaraan/driver yang bertugas, dan room WebSocket.

```text
User register/login
        |
        v
User membuat payment untuk vehicleAssignmentId
        |
        v
PaymentsService menyimpan payment sebagai PENDING
        |
        +--> CASH: dibuat sebagai PENDING
        |
        +--> ONLINE: membuat QRIS Xendit
                         |
                         v
                   User membayar QRIS
                         |
                         v
                   Xendit webhook
                         |
                         v
                   Payment menjadi PAID
                         |
                         v
             Driver menerima payment:updated
```

Contoh assignment `12` menggunakan room `payment:assignment:12`.

## 2. Type dan status

### `CreateUserDto`

```ts
{
  email: string;    // format email wajib
  password: string; // minimal 6 karakter
  name: string;
  phone?: string;
}
```

### `LoginUserDto`

```ts
{
  email: string;
  password: string;
}
```

### `CreatePaymentDto`

```ts
{
  vehicleAssignmentId: number;
  paymentType: "CASH" | "ONLINE";
  amount: number; // minimal 1
}
```

Status payment internal:

```text
PENDING    Payment dibuat, belum dianggap lunas
PAID       Payment berhasil dibayar
FAILED     Payment gagal dibuat atau diproses
CANCELLED  Payment dibatalkan
```

## 3. User: register, login, dan fetch data

Base URL lokal: `http://localhost:3001`.

### 3.1 Register user

#### Request

```http
POST /users/register
Content-Type: application/json
```

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "Budi",
  "phone": "081234567890"
}
```

`UsersController.create()` meneruskan body ke `UsersService.create()`. Service mengecek email, membuat user dengan status awal `PENDING`, lalu menyimpan user ke database.

#### Response

```json
{
  "message": "User berhasil dibuat.",
  "data": {
    "id": 10,
    "email": "user@example.com",
    "name": "Budi",
    "phone": "081234567890",
    "status": "PENDING"
  }
}
```

User berstatus `PENDING` belum dapat login. Status harus diubah menjadi `ACTIVE` terlebih dahulu.

### 3.2 Login user

#### Request

```http
POST /users/login
Content-Type: application/json
```

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

`UsersService.login()` mengambil user berdasarkan email, membandingkan password dengan `bcrypt`, lalu menolak user berstatus `PENDING` atau `DEACTIVE`.

#### Response

```json
{
  "message": "Login berhasil.",
  "data": {
    "id": 10,
    "email": "user@example.com",
    "name": "Budi",
    "phone": "081234567890",
    "status": "ACTIVE"
  }
}
```

Saat ini login belum menghasilkan JWT atau access token. Client memakai `data.id` sebagai `userId` ketika membuat payment.

### 3.3 Fetch user

Semua user:

```http
GET /users
```

Satu user:

```http
GET /users/10
```

Contoh response satu user:

```json
{
  "message": "Berhasil mengambil data user.",
  "data": {
    "id": 10,
    "email": "user@example.com",
    "name": "Budi",
    "phone": "081234567890",
    "status": "ACTIVE",
    "createdAt": "2026-09-07T10:00:00.000Z"
  }
}
```

Password tidak ditampilkan pada fetch user karena kolom password memakai `select: false`.

## 4. User membuat payment

### Request

```http
POST /payments/10
Content-Type: application/json
```

```json
{
  "vehicleAssignmentId": 12,
  "paymentType": "ONLINE",
  "amount": 5000
}
```

`PaymentsController.create()` memanggil:

```ts
paymentsService.create(createPaymentDto, 10);
```

`PaymentsService.create()` melakukan langkah berikut:

1. Mencari `VehicleAssignment` berdasarkan `vehicleAssignmentId`.
2. Memvalidasi nominal dan `paymentType`.
3. Membuat `paymentCode`, misalnya `PAY-20260907-X92PL`.
4. Menyimpan payment dengan status `PENDING`.
5. Memanggil `PaymentGateway.broadcastPayment()`.
6. Untuk `CASH`, mengembalikan data payment.
7. Untuk `ONLINE`, membuat payment request QRIS ke Xendit.

### Response CASH

```json
{
  "message": "Pembayaran cash berhasil dibuat",
  "data": {
    "paymentId": 31,
    "paymentCode": "PAY-20260907-X92PL",
    "vehicleAssignmentId": 12,
    "userId": 10,
    "paymentType": "CASH",
    "amount": 5000,
    "status": "PENDING"
  }
}
```

### Response ONLINE

```json
{
  "message": "Pembayaran QRIS berhasil dibuat",
  "data": {
    "paymentId": 31,
    "paymentCode": "PAY-20260907-X92PL",
    "vehicleAssignmentId": 12,
    "userId": 10,
    "amount": 5000,
    "paymentType": "ONLINE",
    "status": "PENDING",
    "xendit": {
      "paymentRequestId": "pr-xxxxxxxx",
      "referenceId": "PAY-20260907-X92PL",
      "status": "PENDING",
      "channelCode": "QRIS",
      "qrString": "000201..."
    }
  }
}
```

Client user menampilkan QRIS dari `data.xendit.qrString`. `paymentRequestId` bukan `vehicleAssignmentId`.

## 5. Xendit mengubah payment menjadi PAID

Xendit memanggil endpoint berikut setelah payment online berhasil:

```http
POST /payments/webhook/xendit
Content-Type: application/json
```

Contoh payload minimum:

```json
{
  "payment_request_id": "pr-xxxxxxxx",
  "status": "SUCCEEDED",
  "created": "2026-09-07T10:05:00.000Z"
}
```

`PaymentsService.handleXenditWebhook()` mencari payment berdasarkan `xenditPaymentRequestId`. Jika status Xendit `SUCCEEDED`, service mengubah status internal menjadi `PAID`, mengisi `xenditPaidAt` dan `paidAt`, menyimpan payment, lalu mengirim payload realtime ke `PaymentGateway`.

Response webhook:

```json
{
  "message": "Webhook berhasil diproses"
}
```

## 6. Driver login dan mendapatkan assignment

### Login driver

```http
POST /drivers/login
Content-Type: application/json
```

```json
{
  "email": "driver@example.com",
  "password": "password123"
}
```

Response dibungkus seperti berikut:

```json
{
  "message": "Login successful",
  "data": {
    "id": 7,
    "name": "Andi",
    "email": "driver@example.com",
    "status": "ACTIVE"
  }
}
```

Driver harus mengetahui `vehicleAssignmentId` yang sedang ditugaskan kepadanya. Login driver saat ini belum otomatis mengembalikan assignment aktif.

## 7. Driver connect ke WebSocket payment

Gateway menggunakan Socket.IO. URL lokalnya adalah `http://localhost:3001`.

Install client JavaScript:

```bash
npm install socket.io-client
```

Contoh client driver:

```ts
import { io } from 'socket.io-client';

const vehicleAssignmentId = 12;

const socket = io('http://localhost:3001', {
  transports: ['websocket'],
});

socket.on('connect', () => {
  console.log('connected:', socket.id);

  socket.emit('payment:join', {
    vehicleAssignmentId,
  });
});

socket.on('payment:joined', (data) => {
  console.log('joined payment room:', data);
});

socket.on('payment:updated', (payment) => {
  console.log('payment update:', payment);
  // Update daftar payment atau jumlah penumpang di UI driver.
});

socket.on('payment:error', (error) => {
  console.error('payment websocket error:', error);
});

socket.on('disconnect', (reason) => {
  console.log('disconnected:', reason);
});
```

### Event `payment:join`

Client mengirim:

```json
{
  "vehicleAssignmentId": 12
}
```

Jika valid, socket masuk ke room `payment:assignment:12` dan menerima:

```json
{
  "vehicleAssignmentId": 12,
  "room": "payment:assignment:12"
}
```

Event: `payment:joined`.

### Event `payment:updated`

Event ini dikirim ketika payment baru dibuat atau status payment berubah.

```json
{
  "paymentId": 31,
  "paymentCode": "PAY-20260907-X92PL",
  "vehicleAssignmentId": 12,
  "userId": 10,
  "paymentType": "ONLINE",
  "amount": 5000,
  "status": "PAID",
  "paidAt": "2026-09-07T10:05:00.000Z",
  "createdAt": "2026-09-07T10:00:00.000Z",
  "updatedAt": "2026-09-07T10:05:00.000Z"
}
```

Saat driver baru join, gateway mengambil payment terakhir dari Redis dengan key `payment:latest:<vehicleAssignmentId>`. Jika data tersedia, driver langsung menerima `payment:updated` tanpa menunggu payment baru.

### Event `payment:error`

```json
{
  "message": "vehicleAssignmentId wajib berupa angka positif"
}
```

## 8. Initial load dan sinkronisasi

WebSocket dipakai untuk update realtime. Untuk initial load, rekap, atau sinkronisasi ulang, driver dapat memanggil:

```http
GET /payments/financial/vehicle-assignment/12
```

Response berisi `summary` dan array `payments` untuk assignment tersebut. Pola yang disarankan di client:

1. Login driver.
2. Ambil assignment aktif.
3. Fetch financial data melalui endpoint HTTP.
4. Connect Socket.IO.
5. Emit `payment:join` dengan assignment aktif.
6. Update UI setiap menerima `payment:updated`.

## 9. Catatan keamanan dan implementasi saat ini

- Login user dan driver saat ini belum menghasilkan JWT atau token WebSocket.
- `payment:join` hanya memvalidasi bahwa `vehicleAssignmentId` adalah angka positif. Backend belum mengecek apakah socket tersebut benar-benar driver yang ditugaskan ke assignment itu.
- Jangan menganggap `vehicleAssignmentId` dari client sebagai bukti otorisasi. Untuk production, tambahkan autentikasi Socket.IO dan validasi `driverId` terhadap `VehicleAssignment`.
- Redis diperlukan untuk latest payment dan broadcast realtime. Default `REDIS_URL` adalah `redis://localhost:6379`.
- Environment payment online memerlukan `XENDIT_SECRET_KEY`.
- Payment online baru dikirim sebagai `PAID` setelah webhook Xendit dengan status `SUCCEEDED` diterima.
