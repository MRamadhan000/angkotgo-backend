BEGIN;

UPDATE trips
SET
    status = 'ACTIVE',
    actual_departure = NOW()
WHERE trip_number = 1;

COMMIT;