import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateRouteDto } from '../dto/create/create-route.dto';
import { UpdateRouteDto } from '../dto/update/update-route.dto';
import { Route } from '../entities/route.entity';

@Injectable()
export class RoutesService {
  constructor(
    @InjectRepository(Route)
    private readonly routeRepository: Repository<Route>,
    private readonly dataSource: DataSource,
  ) { }

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
) {
    const query = `
        WITH user_loc AS (
            SELECT ST_SetSRID(
                ST_MakePoint($1, $2),
                4326
            )::geography AS geom
        ),

        dest_loc AS (
            SELECT ST_SetSRID(
                ST_MakePoint($3, $4),
                4326
            )::geography AS geom
        ),

        user_paths AS (
            SELECT
                rp.route_id,
                rp.direction,
                rp.sequence_order AS user_seq,
                rp.geom <-> ul.geom AS jarak_ke_user
            FROM route_paths rp
            CROSS JOIN user_loc ul
            WHERE rp.geom IS NOT NULL
              AND rp.geom <-> ul.geom <= 100
        ),

        ranked_user_paths AS (
            SELECT
                *,
                ROW_NUMBER() OVER (
                    PARTITION BY route_id, direction
                    ORDER BY jarak_ke_user ASC
                ) AS rn
            FROM user_paths
        ),

        destination_paths AS (
            SELECT
                rp.route_id,
                rp.direction,
                rp.sequence_order AS destination_seq,
                rp.geom <-> dl.geom AS jarak_ke_destination
            FROM route_paths rp
            CROSS JOIN dest_loc dl
            WHERE rp.geom IS NOT NULL
              AND rp.geom <-> dl.geom <= 100
        ),

        ranked_destination_paths AS (
            SELECT
                *,
                ROW_NUMBER() OVER (
                    PARTITION BY route_id, direction
                    ORDER BY jarak_ke_destination ASC
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

            ROUND(up.jarak_ke_user::numeric, 2)
                AS "jarakUserKeRuteMeter",

            ROUND(dp.jarak_ke_destination::numeric, 2)
                AS "jarakTujuanKeRuteMeter"

        FROM ranked_user_paths up

        JOIN ranked_destination_paths dp
            ON dp.route_id = up.route_id
            AND dp.direction = up.direction
            AND dp.rn = 1

        JOIN routes r
            ON r.id = up.route_id

        WHERE up.rn = 1

          -- Pastikan perjalanan mengikuti arah rute
          AND up.user_seq < dp.destination_seq

        ORDER BY
            up.jarak_ke_user ASC;
    `;

    const result = await this.dataSource.query(query, [
        userLng,
        userLat,
        destLng,
        destLat,
    ]);

    return result;
}
}