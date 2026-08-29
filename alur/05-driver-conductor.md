# Driver & Conductor Module

## Tujuan

Memisahkan tanggung jawab antara driver dan kondektur agar driver fokus
mengemudi dan seluruh aktivitas operasional penumpang ditangani oleh
kondektur.

## Peran Driver

### Sebelum Berangkat

-   Login
-   Memulai shift
-   Melihat trip yang ditugaskan
-   Memulai Trip

### Saat Perjalanan

-   Mengemudi
-   Menggunakan tombol SOS jika darurat
-   Mengakhiri Trip

> Driver **tidak** melakukan boarding penumpang, scan tiket, maupun
> pencatatan kursi.

## Peran Kondektur

### Boarding

-   Membantu penumpang naik/turun
-   Scan QR Premium
-   Mencatat boarding/alighting Reguler

### Monitoring

-   Memastikan okupansi sesuai
-   Membantu validasi penumpang
-   Menangani No Show dan QR tidak valid

## Dashboard Driver

-   Trip Saat Ini
-   Status Trip
-   Tombol Start Trip
-   Tombol Finish Trip
-   Tombol SOS

## Dashboard Kondektur

-   Scan QR Premium
-   Boarding Reguler (+)
-   Alighting Reguler (-)
-   Total Premium
-   Total Reguler
-   Total Okupansi

## Alur Operasional

``` text
Operator
   │
Assign Driver & Vehicle
   │
Driver Login
   │
Start Trip
   │
──────────── Perjalanan ────────────
   │
Kondektur Kelola Boarding
   │
Driver Fokus Mengemudi
   │
Finish Trip
```
