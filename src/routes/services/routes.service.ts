import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateRouteDto } from '../dto/create/create-route.dto';
import { UpdateRouteDto } from '../dto/update/update-route.dto';
import { Route } from '../entities/route.entity';
import { DirectionType } from '../enums/route.enum';

interface RouteCandidate {
  routeId: number;
  routeCode: string;
  routeName: string;
  direction: string;
  sequenceTitikAwal: number;
  sequenceTitikTujuan: number;
  startLat: string;
  startLng: string;
  destLat: string;
  destLng: string;
  beelineTotal: string;
}

interface MatrixResult {
  distances: (number | null)[][];
  durations: (number | null)[][];
}

// ----
export interface UpcomingVehicleResult {
  assignmentId: number;
  vehicleId: number;
  driverId: number;
  conductorId: number | null;
  status: string;
  hasLocationData: boolean;
  lastLocationAt: Date | null;
  lastLocationAgeSeconds: number | null;
  vehicleLat: number | null;
  vehicleLng: number | null;
  hasPassedUser: boolean | null; // null = belum ada data GPS sama sekali
  distanceToUserMeters: number | null; // null kalau sudah lewat / gak ada data
  vehicleFraction: number | null; // posisi kendaraan di sepanjang rute (0..1)
}

export interface UpcomingVehiclesForUserResult {
  routeLengthMeters: number;
  userFraction: number;
  userOffsetFromRouteMeters: number; // seberapa jauh titik user dari garis rute (indikasi akurasi)
  vehicles: UpcomingVehicleResult[];
}

// ---

@Injectable()
export class RoutesService {
  constructor(
    @InjectRepository(Route)
    private readonly routeRepository: Repository<Route>,
    private readonly dataSource: DataSource,
  ) { }

  // Cache in-memory: key = "lng,lat->lng,lat" (dibulatkan 5 desimal ~1m).
  // Berguna kalau banyak route berbagi titik start/dest yang sama/dekat,
  // atau user query ulang dari lokasi yang mirip dalam window waktu singkat.
  private walkingCache = new Map<
    string,
    { distance: number; duration: number; expiresAt: number }
  >();
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 menit

  async create(createRouteDto: CreateRouteDto): Promise<Route> {
    // Cek apakah kode trayek sudah ada sebelumnya
    const existingRoute = await this.routeRepository.findOne({
      where: { routeCode: createRouteDto.routeCode },
    });

    if (existingRoute) {
      throw new ConflictException(`Trayek dengan kode '${createRouteDto.routeCode}' sudah terdaftar.`);
    }

    const newRoute = this.routeRepository.create(createRouteDto);
    return await this.routeRepository.save(newRoute);
  }

  async findAll(): Promise<Route[]> {
    return await this.routeRepository.find({
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Route> {
    const route = await this.routeRepository.findOne({
      where: { id },
    });

    if (!route) {
      throw new NotFoundException(`Trayek dengan ID ${id} tidak ditemukan.`);
    }

    return route;
  }

  async update(id: number, updateRouteDto: UpdateRouteDto): Promise<Route> {
    const route = await this.findOne(id);

    if (updateRouteDto.routeCode && updateRouteDto.routeCode !== route.routeCode) {
      const existingRoute = await this.routeRepository.findOne({
        where: { routeCode: updateRouteDto.routeCode },
      });

      if (existingRoute) {
        throw new ConflictException(`Kode trayek '${updateRouteDto.routeCode}' sudah digunakan oleh trayek lain.`);
      }
    }

    Object.assign(route, updateRouteDto);

    return await this.routeRepository.save(route);
  }

  async remove(id: number): Promise<void> {
    const route = await this.findOne(id);
    await this.routeRepository.softRemove(route);
  }

  async findAvailableRoutesForJourney(
    userLat: number,
    userLng: number,
    destLat: number,
    destLng: number,
    maxCandidates = 8, // batasi jumlah kandidat sebelum panggil ORS sama sekali
  ) {
    // 1. Cari kandidat route via PostGIS, dibatasi jumlahnya + diurutkan
    //    berdasarkan total jarak beeline (user->start + dest->tujuan) supaya
    //    kandidat yang jelas jauh tidak ikut dihitung walking route-nya.
    const query = `
        WITH user_loc AS (
            SELECT ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography AS geom
        ),
        dest_loc AS (
            SELECT ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography AS geom
        ),
        user_paths AS (
            SELECT rp.route_id, rp.direction, rp.sequence_order AS user_seq,
                   rp.latitude, rp.longitude, rp.geom <-> ul.geom AS distance
            FROM route_paths rp
            CROSS JOIN user_loc ul
            WHERE rp.geom IS NOT NULL AND rp.geom <-> ul.geom <= 1000
        ),
        ranked_user_paths AS (
            SELECT *, ROW_NUMBER() OVER (
                PARTITION BY route_id, direction ORDER BY distance
            ) AS rn
            FROM user_paths
        ),
        destination_paths AS (
            SELECT rp.route_id, rp.direction, rp.sequence_order AS destination_seq,
                   rp.latitude, rp.longitude, rp.geom <-> dl.geom AS distance
            FROM route_paths rp
            CROSS JOIN dest_loc dl
            WHERE rp.geom IS NOT NULL AND rp.geom <-> dl.geom <= 1000
        ),
        ranked_destination_paths AS (
            SELECT *, ROW_NUMBER() OVER (
                PARTITION BY route_id, direction ORDER BY distance
            ) AS rn
            FROM destination_paths
        )
        SELECT
            r.id AS "routeId",
            r.route_code AS "routeCode",
            r.route_name AS "routeName",
            up.direction,
            up.user_seq AS "sequenceTitikAwal",
            dp.destination_seq AS "sequenceTitikTujuan",
            up.latitude AS "startLat",
            up.longitude AS "startLng",
            dp.latitude AS "destLat",
            dp.longitude AS "destLng",
            (up.distance + dp.distance) AS "beelineTotal"
        FROM ranked_user_paths up
        JOIN ranked_destination_paths dp
            ON dp.route_id = up.route_id
            AND dp.direction = up.direction
            AND dp.rn = 1
        JOIN routes r ON r.id = up.route_id
        WHERE up.rn = 1
          AND up.user_seq < dp.destination_seq
        ORDER BY "beelineTotal" ASC
        LIMIT $5
    `;

    const routes: RouteCandidate[] = await this.dataSource.query(query, [
      userLng,
      userLat,
      destLng,
      destLat,
      maxCandidates,
    ]);

    if (routes.length === 0) {
      return [];
    }

    // 2. Hitung walking distance/duration untuk SEMUA kandidat sekaligus
    //    pakai maksimal 2 panggilan ORS Matrix API (bukan 2×N panggilan
    //    Directions API seperti sebelumnya)
    const { walkingToRoute, walkingToDestination } =
      await this.batchWalkingDistances(
        userLat,
        userLng,
        destLat,
        destLng,
        routes,
      );

    // 3. Gabungkan hasil
    const results = routes.map((route, i) => {
      const wtr = walkingToRoute[i];
      const wtd = walkingToDestination[i];

      return {
        ...route,
        walkingToRoute: wtr,
        walkingToDestination: wtd,
        totalWalkingDistance: wtr.distance + wtd.distance,
        totalWalkingDuration: wtr.duration + wtd.duration,
      };
    });

    // 4. Route dengan jalan kaki paling sedikit jadi prioritas
    return results.sort(
      (a, b) => a.totalWalkingDistance - b.totalWalkingDistance,
    );
  }

  /**
   * Hitung walking distance untuk semua kandidat route dalam maksimal
   * 2 panggilan ORS Matrix API, terlepas dari berapa banyak kandidatnya.
   */
  private async batchWalkingDistances(
    userLat: number,
    userLng: number,
    destLat: number,
    destLng: number,
    routes: RouteCandidate[],
  ) {
    const startPoints = routes.map((r) => ({
      lat: Number(r.startLat),
      lng: Number(r.startLng),
    }));
    const destPoints = routes.map((r) => ({
      lat: Number(r.destLat),
      lng: Number(r.destLng),
    }));

    const [walkingToRoute, walkingToDestination] = await Promise.all([
      this.matrixOneToMany({ lat: userLat, lng: userLng }, startPoints),
      this.matrixManyToOne(destPoints, { lat: destLat, lng: destLng }),
    ]);

    return { walkingToRoute, walkingToDestination };
  }

  /** 1 titik asal -> banyak titik tujuan, pakai cache per-pasangan titik. */
  private async matrixOneToMany(
    origin: { lat: number; lng: number },
    destinations: { lat: number; lng: number }[],
  ): Promise<{ distance: number; duration: number }[]> {
    return this.resolveWithCache(
      destinations.map((d) => [origin, d] as const),
      async (uncachedPairs) => {
        if (uncachedPairs.length === 0) return [];
        const locations = [
          [origin.lng, origin.lat],
          ...uncachedPairs.map((p) => [p[1].lng, p[1].lat]),
        ];
        const matrix = await this.callMatrixApi(locations, [0], null);
        return uncachedPairs.map((_, i) => ({
          distance: matrix.distances[0][i + 1] ?? 0,
          duration: matrix.durations[0][i + 1] ?? 0,
        }));
      },
    );
  }

  /** Banyak titik asal -> 1 titik tujuan, pakai cache per-pasangan titik. */
  private async matrixManyToOne(
    origins: { lat: number; lng: number }[],
    destination: { lat: number; lng: number },
  ): Promise<{ distance: number; duration: number }[]> {
    return this.resolveWithCache(
      origins.map((o) => [o, destination] as const),
      async (uncachedPairs) => {
        if (uncachedPairs.length === 0) return [];
        const locations = [
          ...uncachedPairs.map((p) => [p[0].lng, p[0].lat]),
          [destination.lng, destination.lat],
        ];
        const destIndex = locations.length - 1;
        const matrix = await this.callMatrixApi(locations, null, [destIndex]);
        return uncachedPairs.map((_, i) => ({
          distance: matrix.distances[i][0] ?? 0,
          duration: matrix.durations[i][0] ?? 0,
        }));
      },
    );
  }

  /**
   * Helper generik: cek cache dulu untuk tiap pasangan titik, hanya kirim
   * yang belum ada ke ORS, lalu gabungkan hasilnya sesuai urutan asal.
   */
  private async resolveWithCache(
    pairs: readonly (readonly [
      { lat: number; lng: number },
      { lat: number; lng: number },
    ])[],
    fetchUncached: (
      uncachedPairs: (readonly [
        { lat: number; lng: number },
        { lat: number; lng: number },
      ])[],
    ) => Promise<{ distance: number; duration: number }[]>,
  ): Promise<{ distance: number; duration: number }[]> {
    const now = Date.now();
    const keys = pairs.map(([a, b]) => this.cacheKey(a, b));

    const uncachedIndices: number[] = [];
    const uncachedPairs: (typeof pairs)[number][] = [];

    keys.forEach((key, i) => {
      const cached = this.walkingCache.get(key);
      if (!cached || cached.expiresAt < now) {
        uncachedIndices.push(i);
        uncachedPairs.push(pairs[i]);
      }
    });

    const fetched = await fetchUncached(uncachedPairs);

    fetched.forEach((result, i) => {
      const key = keys[uncachedIndices[i]];
      this.walkingCache.set(key, {
        ...result,
        expiresAt: now + this.CACHE_TTL_MS,
      });
    });

    return keys.map((key) => {
      const cached = this.walkingCache.get(key)!;
      return { distance: cached.distance, duration: cached.duration };
    });
  }

  private cacheKey(
    a: { lat: number; lng: number },
    b: { lat: number; lng: number },
  ): string {
    const r = (n: number) => n.toFixed(5); // ~1m presisi
    return `${r(a.lng)},${r(a.lat)}->${r(b.lng)},${r(b.lat)}`;
  }

  /**
   * Panggil ORS Matrix API. sources/destinations null berarti "semua titik".
   * 1 call ini handle banyak-ke-banyak sekaligus, jauh lebih hemat
   * dibanding Directions API yang cuma 1-ke-1 per call.
   */
  private async callMatrixApi(
    locations: number[][],
    sources: number[] | null,
    destinations: number[] | null,
  ): Promise<MatrixResult> {
    const body: Record<string, unknown> = {
      locations,
      metrics: ['distance', 'duration'],
    };
    if (sources) body.sources = sources;
    if (destinations) body.destinations = destinations;

    const response = await fetch(
      'https://api.openrouteservice.org/v2/matrix/foot-walking',
      {
        method: 'POST',
        headers: {
          Authorization: process.env.ORS_API_KEY!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    );

    const responseText = await response.text();

    if (!response.ok) {
      console.error('❌ ORS MATRIX ERROR');
      console.error('Status:', response.status);
      console.error('Response:', responseText);
      throw new Error(`ORS Matrix Error ${response.status}: ${responseText}`);
    }

    return JSON.parse(responseText) as MatrixResult;
  }


  /**
 * Cari angkot di suatu rute+arah yang BELUM melewati titik penjemputan user.
 * Pendekatan: proyeksikan user & posisi GPS terakhir tiap kendaraan ke garis
 * rute (ST_LineLocatePoint) -> dapat "posisi sepanjang rute" (0..1) yang bisa
 * dibandingkan langsung. Lebih akurat dari sekadar cocokkan sequence_order
 * terdekat, karena posisi riil bisa berada di antara dua titik path.
 *
 * Tidak pakai ORS di sini karena kendaraan terikat pada jalur rute yang
 * sudah pasti (bukan jalan bebas kayak pejalan kaki di findAvailableRoutesForJourney).
 */
  async findUpcomingVehiclesForUser(
    routeId: number,
    direction: DirectionType,
    userLat: number,
    userLng: number,
    options: {
      toleranceMeters?: number; // toleransi GPS jitter, default 20m
      metricSrid?: number; // SRID metrik untuk hitung jarak akurat, default 3857
      activeStatuses?: string[]; // status assignment yang dianggap "aktif hari ini"
    } = {},
  ): Promise<UpcomingVehiclesForUserResult> {
    const toleranceMeters = options.toleranceMeters ?? 20;
    // ganti ke UTM zone lokal (mis. 32749 utk Jawa Timur) kalau butuh presisi lebih tinggi
    const metricSrid = options.metricSrid ?? 3857;
    const activeStatuses = options.activeStatuses ?? ['SCHEDULED', 'ONGOING'];

    console.log('=== FIND UPCOMING VEHICLES ===');
    console.log('routeId:', routeId);
    console.log('direction:', direction);
    console.log('userLat:', userLat);
    console.log('userLng:', userLng);
    console.log('options:', options);

    const query = `
      WITH route_line AS (
        SELECT
          ST_Transform(ST_MakeLine(geom::geometry ORDER BY sequence_order), $5::integer) AS line   -- ⬅️
        FROM route_paths
        WHERE route_id = $1 AND direction::text = $2
      ),
      user_point AS (
        SELECT ST_Transform(ST_SetSRID(ST_MakePoint($3, $4), 4326), $5::integer) AS geom            -- ⬅️
      ),
      route_calc AS (
        SELECT
          rl.line,
          ST_Length(rl.line) AS "routeLengthM",
          ST_LineLocatePoint(rl.line, up.geom) AS "userFraction",
          ST_Distance(rl.line, up.geom) AS "userOffsetM"
        FROM route_line rl, user_point up
      ),
      latest_locations AS (
        SELECT DISTINCT ON (vl.vehicle_assignment_id)
          vl.vehicle_assignment_id,
          vl.latitude,
          vl.longitude,
          vl.created_at,
          vl.geom::geometry AS geom
        FROM vehicle_locations vl
        ORDER BY vl.vehicle_assignment_id, vl.created_at DESC
      ),
      active_assignments AS (
        SELECT
          va.id AS "assignmentId",
          va.vehicle_id AS "vehicleId",
          va.driver_id AS "driverId",
          va.conductor_id AS "conductorId",
          va.status AS "status",
          ll.latitude AS "vehicleLat",
          ll.longitude AS "vehicleLng",
          ll.created_at AS "lastLocationAt",
          ll.geom AS "vehicleGeom"
        FROM vehicle_assignments va
        LEFT JOIN latest_locations ll ON ll.vehicle_assignment_id = va.id
        WHERE va.route_id = $1
          AND va.direction::text = $2
          AND va.assignment_date = CURRENT_DATE
          AND va.status = ANY($6)
      )
      SELECT
        aa."assignmentId",
        aa."vehicleId",
        aa."driverId",
        aa."conductorId",
        aa."status",
        aa."vehicleLat",
        aa."vehicleLng",
        aa."lastLocationAt",
        rc."routeLengthM",
        rc."userFraction",
        rc."userOffsetM",
        CASE
          WHEN aa."vehicleGeom" IS NULL THEN NULL
          ELSE ST_LineLocatePoint(rc.line, ST_Transform(aa."vehicleGeom", $5::integer))               -- ⬅️
        END AS "vehicleFraction"
      FROM route_calc rc
      LEFT JOIN active_assignments aa ON true;
    `;
    const rows: any[] = await this.dataSource.query(query, [
      routeId,
      direction,
      userLng,
      userLat,
      metricSrid,
      activeStatuses,
    ]);

    const routeLengthMeters = rows[0]?.routeLengthM != null ? Number(rows[0].routeLengthM) : null;

    if (routeLengthMeters === null || routeLengthMeters === 0) {
      throw new NotFoundException(
        `Trayek dengan ID ${routeId} belum memiliki data jalur (route_paths) untuk arah ${direction}.`,
      );
    }

    const userFraction = Number(rows[0].userFraction);
    const userOffsetFromRouteMeters = Number(rows[0].userOffsetM);
    const toleranceFraction = toleranceMeters / routeLengthMeters;

    const vehicles: UpcomingVehicleResult[] = rows
      .filter((r) => r.assignmentId !== null) // baris "kosong" muncul kalau tidak ada assignment aktif
      .map((r) => {
        const hasLocationData = r.vehicleFraction !== null;
        const vehicleFraction = hasLocationData ? Number(r.vehicleFraction) : null;
        const hasPassedUser = hasLocationData
          ? vehicleFraction! > userFraction + toleranceFraction
          : null;
        const distanceToUserMeters =
          hasLocationData && hasPassedUser === false
            ? Math.max(0, (userFraction - vehicleFraction!) * routeLengthMeters)
            : null;
        const lastLocationAt = r.lastLocationAt ? new Date(r.lastLocationAt) : null;

        return {
          assignmentId: r.assignmentId,
          vehicleId: r.vehicleId,
          driverId: r.driverId,
          conductorId: r.conductorId ?? null,
          status: r.status,
          hasLocationData,
          lastLocationAt,
          lastLocationAgeSeconds: lastLocationAt
            ? Math.round((Date.now() - lastLocationAt.getTime()) / 1000)
            : null,
          vehicleLat: r.vehicleLat !== null ? Number(r.vehicleLat) : null,
          vehicleLng: r.vehicleLng !== null ? Number(r.vehicleLng) : null,
          hasPassedUser,
          distanceToUserMeters,
          vehicleFraction,
        };
      });

    // urutan prioritas: belum lewat & paling dekat -> belum ada data GPS -> sudah lewat
    vehicles.sort((a, b) => {
      const rank = (v: UpcomingVehicleResult) =>
        v.hasPassedUser === false ? 0 : v.hasPassedUser === null ? 1 : 2;
      const diff = rank(a) - rank(b);
      if (diff !== 0) return diff;
      if (rank(a) === 0) {
        return (a.distanceToUserMeters ?? Infinity) - (b.distanceToUserMeters ?? Infinity);
      }
      return 0;
    });

    return { routeLengthMeters, userFraction, userOffsetFromRouteMeters, vehicles };
  }
}