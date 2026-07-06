BEGIN;

------------------------------------------------------------
-- Reset Live Session
------------------------------------------------------------

TRUNCATE TABLE live_locations, live_sessions RESTART IDENTITY CASCADE;

------------------------------------------------------------
-- Buat Session untuk semua Trip ACTIVE
------------------------------------------------------------

INSERT INTO live_sessions (
    trip_id,
    status
)
SELECT
    id,
    'ACTIVE'
FROM trips
WHERE status = 'ACTIVE';

COMMIT;