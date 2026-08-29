# Modul Operasional Penumpang (Reguler & Premium)

## Gambaran Umum

Sistem mendukung dua jenis layanan:

  Layanan   Booking   Pilih Kursi   Peran Kondektur
  --------- --------- ------------- --------------------------------
  Reguler   Tidak     Tidak         Mencatat naik/turun penumpang
  Premium   Wajib     Ya            Scan QR dan validasi penumpang

------------------------------------------------------------------------

# Alur Penumpang Reguler

1.  Penumpang memilih halte asal dan tujuan.
2.  Sistem menampilkan trip yang tersedia beserta sisa kursi reguler.
3.  Penumpang datang ke halte.
4.  Saat kendaraan tiba, penumpang naik.
5.  Kondektur mencatat jumlah penumpang yang naik pada halte tersebut.
6.  Sistem otomatis menghitung okupansi dan sisa kursi.
7.  Di halte berikutnya, kondektur mencatat jumlah penumpang yang turun.
8.  Trip selesai dan laporan okupansi tersimpan.

## Contoh

Halte Blimbing

-   Naik : 3 orang
-   Turun : 1 orang

Perhitungan:

Okupansi Sebelum : 12

-   Naik : 3

-   Turun : 1

Okupansi Setelah : 14

------------------------------------------------------------------------

# Alur Penumpang Premium

1.  Penumpang memilih trip.
2.  Penumpang memilih kursi.
3.  Penumpang melakukan pembayaran.
4.  Setelah pembayaran berhasil:
    -   Booking dikonfirmasi.
    -   Kursi berubah menjadi BOOKED.
    -   Sisa kursi premium berkurang otomatis.
5.  Pada hari keberangkatan penumpang datang ke halte.
6.  Kondektur melakukan scan QR.
7.  Status berubah dari BOOKED menjadi BOARDED.
8.  Saat trip selesai status berubah menjadi COMPLETED.

## Status Booking

AVAILABLE

↓

BOOKED

↓

BOARDED

↓

COMPLETED

Apabila dibatalkan:

BOOKED

↓

CANCELLED

↓

AVAILABLE

------------------------------------------------------------------------

# Peran Driver

-   Login Shift
-   Start Trip
-   Finish Trip
-   Tombol SOS

Driver tidak melakukan pencatatan penumpang.

------------------------------------------------------------------------

# Peran Kondektur

## Reguler

-   Mencatat jumlah penumpang naik
-   Mencatat jumlah penumpang turun
-   Membantu operasional penumpang

## Premium

-   Scan QR Booking
-   Validasi penumpang
-   Menangani kasus QR tidak valid atau No Show

------------------------------------------------------------------------

# Dashboard Kondektur

Contoh informasi:

Premium : 8 / 10

Reguler : 15 / 20

Total : 23 / 30

Aksi:

-   Boarding Reguler (+)
-   Alighting Reguler (-)
-   Scan QR Premium

------------------------------------------------------------------------

# Alur Operasional

``` text
                PENUMPANG
                     │
        ┌────────────┴────────────┐
        │                         │
     REGULER                  PREMIUM
        │                         │
Tidak Booking              Booking Kursi
        │                         │
Naik Kendaraan              Bayar
        │                         │
Boarding oleh               Seat BOOKED
Kondektur                   (Otomatis)
        │                         │
Okupansi Dihitung           Datang ke Halte
Otomatis                    │
        │              Scan QR Kondektur
        └────────────┬────────────┘
                     │
                Trip Berjalan
                     │
            Penumpang Turun
                     │
         Laporan Operasional
```
