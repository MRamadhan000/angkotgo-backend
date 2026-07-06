-- Mengosongkan data tabel dengan aman (menghapus data child terlebih dahulu jika ada relasi FK)
TRUNCATE TABLE live_locations, live_sessions RESTART IDENTITY CASCADE;
