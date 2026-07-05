BEGIN;

------------------------------------------------------------
-- Hapus data lama
------------------------------------------------------------

TRUNCATE TABLE trips, schedules RESTART IDENTITY CASCADE;

------------------------------------------------------------
-- Insert Schedule
------------------------------------------------------------

INSERT INTO schedules (
    driver_id,
    vehicle_id,
    work_date,
    shift
)
VALUES
(1, 1, '2026-07-06', 1),
(2, 2, '2026-07-06', 1),
(3, 3, '2026-07-06', 1),
(4, 4, '2026-07-06', 1),
(5, 5, '2026-07-06', 1),
(6, 6, '2026-07-06', 1),
(7, 7, '2026-07-06', 1),
(8,10, '2026-07-06', 1);

------------------------------------------------------------
-- Trip 1 (AL GO)
------------------------------------------------------------

INSERT INTO trips (
    schedule_id,
    route_id,
    trip_number,
    planned_departure,
    planned_arrival,
    status
)
SELECT
    id,
    1,
    1,
    '06:00:00',
    '07:00:00',
    'SCHEDULED'
FROM schedules;

------------------------------------------------------------
-- Trip 2 (AL RETURN)
------------------------------------------------------------

INSERT INTO trips (
    schedule_id,
    route_id,
    trip_number,
    planned_departure,
    planned_arrival,
    status
)
SELECT
    id,
    2,
    2,
    '07:15:00',
    '08:15:00',
    'SCHEDULED'
FROM schedules;

------------------------------------------------------------
-- Trip 3 (AL GO)
------------------------------------------------------------

INSERT INTO trips (
    schedule_id,
    route_id,
    trip_number,
    planned_departure,
    planned_arrival,
    status
)
SELECT
    id,
    1,
    3,
    '08:30:00',
    '09:30:00',
    'SCHEDULED'
FROM schedules;

------------------------------------------------------------
-- Trip 4 (AL RETURN)
------------------------------------------------------------

INSERT INTO trips (
    schedule_id,
    route_id,
    trip_number,
    planned_departure,
    planned_arrival,
    status
)
SELECT
    id,
    2,
    4,
    '09:45:00',
    '10:45:00',
    'SCHEDULED'
FROM schedules;

------------------------------------------------------------
-- Trip 5 (AL GO)
------------------------------------------------------------

INSERT INTO trips (
    schedule_id,
    route_id,
    trip_number,
    planned_departure,
    planned_arrival,
    status
)
SELECT
    id,
    1,
    5,
    '11:00:00',
    '12:00:00',
    'SCHEDULED'
FROM schedules;

------------------------------------------------------------
-- Trip 6 (AL RETURN)
------------------------------------------------------------

INSERT INTO trips (
    schedule_id,
    route_id,
    trip_number,
    planned_departure,
    planned_arrival,
    status
)
SELECT
    id,
    2,
    6,
    '13:00:00',
    '14:00:00',
    'SCHEDULED'
FROM schedules;

------------------------------------------------------------
-- Trip 7 (AL GO)
------------------------------------------------------------

INSERT INTO trips (
    schedule_id,
    route_id,
    trip_number,
    planned_departure,
    planned_arrival,
    status
)
SELECT
    id,
    1,
    7,
    '14:15:00',
    '15:15:00',
    'SCHEDULED'
FROM schedules;

------------------------------------------------------------
-- Trip 8 (AL RETURN)
------------------------------------------------------------

INSERT INTO trips (
    schedule_id,
    route_id,
    trip_number,
    planned_departure,
    planned_arrival,
    status
)
SELECT
    id,
    2,
    8,
    '15:30:00',
    '16:30:00',
    'SCHEDULED'
FROM schedules;

------------------------------------------------------------
-- Trip 9 (AL GO)
------------------------------------------------------------

INSERT INTO trips (
    schedule_id,
    route_id,
    trip_number,
    planned_departure,
    planned_arrival,
    status
)
SELECT
    id,
    1,
    9,
    '16:45:00',
    '17:45:00',
    'SCHEDULED'
FROM schedules;

------------------------------------------------------------
-- Trip 10 (AL RETURN)
------------------------------------------------------------

INSERT INTO trips (
    schedule_id,
    route_id,
    trip_number,
    planned_departure,
    planned_arrival,
    status
)
SELECT
    id,
    2,
    10,
    '18:00:00',
    '19:00:00',
    'SCHEDULED'
FROM schedules;

COMMIT;