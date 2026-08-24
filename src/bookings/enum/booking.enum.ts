export enum PaymentMethod {
  QRIS = 'QRIS',
  BCA = 'BCA',
  BRI = 'BRI',
  BNI = 'BNI',
  Mandiri = 'Mandiri',
  Bank_Jatim = 'Bank Jatim',
}

export enum BookingStatus {
  PENDING = 'pending', // Menunggu pembayaran
  PAID = 'paid', // Tiket aktif (siap dipakai)
  COMPLETED = 'completed', // QR Code sudah discan sopir / perjalanan selesai
  CANCELLED = 'cancelled', // Dibatalkan
  EXPIRED = 'expired', // Batas waktu pembayaran habis
}
