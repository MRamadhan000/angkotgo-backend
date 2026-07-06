BEGIN;

------------------------------------------------------------
-- Reset
------------------------------------------------------------

TRUNCATE TABLE trips, schedules RESTART IDENTITY CASCADE;

------------------------------------------------------------
-- Schedule
------------------------------------------------------------

INSERT INTO schedules
(
    driver_id,
    vehicle_id,
    work_date,
    shift
)
VALUES
(1,1,'2026-07-06',1),
(2,2,'2026-07-06',1),
(3,3,'2026-07-06',1),
(4,4,'2026-07-06',1),
(5,5,'2026-07-06',1),
(6,6,'2026-07-06',1),
(7,7,'2026-07-06',1),
(8,10,'2026-07-06',1);

------------------------------------------------------------
-- Driver 1
------------------------------------------------------------

INSERT INTO trips
(schedule_id,route_id,trip_number,planned_departure,planned_arrival,status)
VALUES
(1,1,1,'06:00:00','07:00:00','SCHEDULED'),
(1,2,2,'07:15:00','08:15:00','SCHEDULED');

------------------------------------------------------------
-- Driver 2
------------------------------------------------------------

INSERT INTO trips
(schedule_id,route_id,trip_number,planned_departure,planned_arrival,status)
VALUES
(2,1,1,'06:10:00','07:10:00','SCHEDULED'),
(2,2,2,'07:25:00','08:25:00','SCHEDULED');

------------------------------------------------------------
-- Driver 3
------------------------------------------------------------

INSERT INTO trips
(schedule_id,route_id,trip_number,planned_departure,planned_arrival,status)
VALUES
(3,3,1,'06:00:00','07:00:00','SCHEDULED'),
(3,4,2,'07:15:00','08:15:00','SCHEDULED');

------------------------------------------------------------
-- Driver 4
------------------------------------------------------------

INSERT INTO trips
(schedule_id,route_id,trip_number,planned_departure,planned_arrival,status)
VALUES
(4,3,1,'06:20:00','07:20:00','SCHEDULED'),
(4,4,2,'07:35:00','08:35:00','SCHEDULED');

------------------------------------------------------------
-- Driver 5
------------------------------------------------------------

INSERT INTO trips
(schedule_id,route_id,trip_number,planned_departure,planned_arrival,status)
VALUES
(5,1,1,'08:00:00','09:00:00','SCHEDULED'),
(5,2,2,'09:15:00','10:15:00','SCHEDULED');

------------------------------------------------------------
-- Driver 6
------------------------------------------------------------

INSERT INTO trips
(schedule_id,route_id,trip_number,planned_departure,planned_arrival,status)
VALUES
(6,3,1,'08:00:00','09:00:00','SCHEDULED'),
(6,4,2,'09:15:00','10:15:00','SCHEDULED');

------------------------------------------------------------
-- Driver 7
------------------------------------------------------------

INSERT INTO trips
(schedule_id,route_id,trip_number,planned_departure,planned_arrival,status)
VALUES
(7,1,1,'10:00:00','11:00:00','SCHEDULED'),
(7,2,2,'11:15:00','12:15:00','SCHEDULED');

------------------------------------------------------------
-- Driver 8
------------------------------------------------------------

INSERT INTO trips
(schedule_id,route_id,trip_number,planned_departure,planned_arrival,status)
VALUES
(8,3,1,'10:00:00','11:00:00','SCHEDULED'),
(8,4,2,'11:15:00','12:15:00','SCHEDULED');

COMMIT;