BEGIN;

TRUNCATE TABLE
    trips,
    schedules,
    vehicles
RESTART IDENTITY CASCADE;

COMMIT;