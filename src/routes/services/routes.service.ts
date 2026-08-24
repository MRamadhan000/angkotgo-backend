import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateRouteDto } from '../dto/create/create-route.dto';
import { UpdateRouteDto } from '../dto/update/update-route.dto';
import { Route } from '../entities/route.entity';

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

  async remove(id: number): Promise<{ message: string }> {
    const route = await this.findOne(id);

    await this.routeRepository.remove(route);

    return { message: `Trayek dengan ID ${id} berhasil dihapus.` };
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
}