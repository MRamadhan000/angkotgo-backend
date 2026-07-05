-- 1. Hapus schema public beserta seluruh tabel, views, types, dll di dalamnya
DROP SCHEMA public CASCADE;

-- 2. Buat kembali schema public yang kosong
CREATE SCHEMA public;

-- 3. Atur ulang hak akses default agar bisa digunakan kembali
GRANT ALL ON SCHEMA public TO public;