import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class PassengerService {
  constructor(private dataSource: DataSource) { }

  // =========================================================================
  // LOGIKA 1: FITUR AUTO-COMPLETE / DROPDOWN HALTE (POSTGRESQL VERSION)
  // =========================================================================
  async searchStopsByName(search: string) {
    return await this.dataSource.query(
      `SELECT DISTINCT ON (name) 
              id AS stop_id, 
              name AS stop_name, 
              latitude, 
              longitude 
       FROM route_stops 
       WHERE name ILIKE $1`, // Menggunakan $1 untuk Postgres & ILIKE supaya case-insensitive (abaikan huruf besar/kecil)
      [`%${search}%`],
    );
  }

  // =========================================================================
  // =========================================================================
  // LOGIKA 2-7: PENCARIAN JALUR, HALTE SEARAH, DAN LIVE BUS
  // =========================================================================
  async findRouteAndActiveBuses(originStopId: number, destinationStopId: number) {

    console.log("========================================");
    console.log("START FIND ROUTE & ACTIVE BUSES");
    console.log("Origin Stop :", originStopId);
    console.log("Destination :", destinationStopId);
    console.log("========================================");

    /**
     * LANGKAH A
     */
    const matchingRoutes = await this.dataSource.query(
      `SELECT s_origin.route_id, s_origin.sequence AS origin_seq, s_dest.sequence AS dest_seq
     FROM route_stops s_origin
     JOIN route_stops s_dest ON s_origin.route_id = s_dest.route_id
     WHERE s_origin.id = $1
       AND s_dest.id = $2
       AND s_origin.sequence < s_dest.sequence
     LIMIT 1`,
      [originStopId, destinationStopId],
    );

    console.log("\n===== STEP A : MATCHING ROUTE =====");
    console.log("Total :", matchingRoutes.length);

    if (matchingRoutes.length > 0) {
      console.log("Data :", matchingRoutes[0]);
    } else {
      console.log("❌ Tidak ditemukan route yang searah.");
    }

    if (matchingRoutes.length === 0) {
      throw new BadRequestException(
        'Rute tidak tersedia atau arah tujuan terbalik.',
      );
    }

    const { route_id, origin_seq, dest_seq } = matchingRoutes[0];

    /**
     * LANGKAH B
     */
    const routeInfo = await this.dataSource.query(
      `SELECT
        id AS route_id,
        name AS route_name,
        distance_km
     FROM routes
     WHERE id = $1`,
      [route_id],
    );

    console.log("\n===== STEP B : ROUTE INFO =====");
    console.log("Total :", routeInfo.length);

    if (routeInfo.length > 0) {
      console.log(routeInfo[0]);
    } else {
      console.log("❌ Route master tidak ditemukan.");
    }

    /**
     * LANGKAH C
     */
    const stops = await this.dataSource.query(
      `SELECT
        id,
        name,
        sequence,
        latitude,
        longitude
     FROM route_stops
     WHERE route_id = $1
       AND sequence BETWEEN $2 AND $3
     ORDER BY sequence ASC`,
      [route_id, origin_seq, dest_seq],
    );

    console.log("\n===== STEP C : ROUTE STOPS =====");
    console.log("Total Stop :", stops.length);

    if (stops.length > 0) {
      console.log("Stop Pertama :", stops[0]);
      console.log("Stop Terakhir :", stops[stops.length - 1]);
    } else {
      console.log("❌ Tidak ada halte.");
    }

    /**
     * LANGKAH D
     */
    const polylinePoints = await this.dataSource.query(
      `SELECT
        latitude,
        longitude
     FROM route_points
     WHERE route_id = $1
     ORDER BY sequence ASC`,
      [route_id],
    );

    console.log("\n===== STEP D : POLYLINE =====");
    console.log("Total Point :", polylinePoints.length);

    if (polylinePoints.length > 0) {
      console.log("First :", polylinePoints[0]);
      console.log("Last  :", polylinePoints[polylinePoints.length - 1]);
    } else {
      console.log("❌ Polyline kosong.");
    }

    /**
     * LANGKAH E
     */
    const activeBuses = await this.dataSource.query(
      `SELECT
        t.id AS trip_id,
        v.vehicle_code,
        v.plate_number,
        d.name AS driver_name,
        ll.latitude,
        ll.longitude,
        ll.speed_kmh,
        ll.heading_degrees,
        ll.created_at AS updated_at
     FROM trips t
     JOIN schedules s
          ON t.schedule_id = s.id
     JOIN drivers d
          ON s.driver_id = d.id
     JOIN vehicles v
          ON s.vehicle_id = v.id
     JOIN live_sessions ls
          ON ls.trip_id = t.id
     JOIN live_locations ll
          ON ll.session_id = ls.id
     WHERE t.status = 'ACTIVE'
       AND t.route_id = $1
       AND ls.status = 'ACTIVE'
       AND ll.created_at = (
            SELECT MAX(created_at)
            FROM live_locations
            WHERE session_id = ls.id
       )`,
      [route_id],
    );

    console.log("\n===== STEP E : ACTIVE BUSES =====");
    console.log("Total Bus :", activeBuses.length);

    if (activeBuses.length > 0) {
      activeBuses.forEach((bus: any, index: number) => {
        console.log(`Bus ${index + 1}`, bus);
      });
    } else {
      console.log("❌ Tidak ada bus aktif.");
    }

    console.log("\n========================================");
    console.log("FINISH");
    console.log("========================================");

    return {
      route_info: routeInfo[0],
      stops,
      polyline_points: polylinePoints,
      active_buses: activeBuses,
    };
  }

}