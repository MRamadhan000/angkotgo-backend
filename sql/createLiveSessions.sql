BEGIN;

------------------------------------------------------------
-- Reset
------------------------------------------------------------
TRUNCATE TABLE live_locations, live_sessions RESTART IDENTITY CASCADE;

------------------------------------------------------------
-- AL GO (Route 1) - 4 Trip ACTIVE
-- Posisi lebih banyak di awal
------------------------------------------------------------
INSERT INTO live_sessions (trip_id, status, current_stop_id, current_sequence, next_stop_id, next_sequence, is_at_stop, started_at, updated_at)
VALUES 
(1,  'ACTIVE', 1,  1,   2, 30,  false, NOW(), NOW()),   -- Baru mulai
(3,  'ACTIVE', 1,  1,   2, 30,  false, NOW(), NOW()),   -- Baru mulai (sedikit beda waktu)
(9,  'ACTIVE', 2, 30,   3, 60,  false, NOW(), NOW()),   -- Lewati Stop 30
(13, 'ACTIVE', 2, 30,   3, 60,  false, NOW(), NOW());  -- Lewati Stop 30

------------------------------------------------------------
-- AG GO (Route 3) - 4 Trip ACTIVE
-- Posisi lebih banyak di awal
------------------------------------------------------------
INSERT INTO live_sessions (trip_id, status, current_stop_id, current_sequence, next_stop_id, next_sequence, is_at_stop, started_at, updated_at)
VALUES 
(5,  'ACTIVE', 11,  1,  12, 25,  false, NOW(), NOW()),   -- Baru mulai
(7,  'ACTIVE', 11,  1,  12, 25,  false, NOW(), NOW()),   -- Baru mulai
(11, 'ACTIVE', 12, 25,  13, 50,  false, NOW(), NOW()),   -- Lewati Stop 25
(15, 'ACTIVE', 12, 25,  13, 50,  false, NOW(), NOW());  -- Lewati Stop 25

COMMIT;