# Booking Premium Module

## Tujuan

Mengelola proses pemesanan kursi premium secara online hingga proses
boarding.

## Alur Booking

``` text
Cari Trip
    │
Pilih Halte Asal & Tujuan
    │
Pilih Kursi
    │
Checkout
    │
Pembayaran
    │
Payment Success
    │
Seat = BOOKED
    │
Generate QR Code
```

## Status Booking

  Status      Deskripsi
  ----------- ---------------------------
  AVAILABLE   Kursi tersedia
  BOOKED      Sudah dibayar dan dipesan
  BOARDED     QR berhasil dipindai
  COMPLETED   Perjalanan selesai
  CANCELLED   Booking dibatalkan
  NO_SHOW     Penumpang tidak hadir

## Hari Keberangkatan

1.  Penumpang datang ke halte.
2.  Kondektur melakukan scan QR.
3.  Sistem memvalidasi booking.
4.  Status berubah menjadi **BOARDED**.
5.  Setelah trip selesai status menjadi **COMPLETED**.

## Perhitungan Kursi

Total Premium = 10

Contoh:

-   BOOKED : 6
-   AVAILABLE : 4

Sisa kursi dihitung otomatis dari status booking.

## Keuntungan

-   Tidak perlu input manual jumlah kursi premium.
-   Menghindari double booking.
-   Validasi boarding cepat melalui QR.
-   Data okupansi selalu konsisten.
