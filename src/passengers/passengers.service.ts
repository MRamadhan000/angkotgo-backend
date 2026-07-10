import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { RouteStop } from 'src/routes/entities/route-stop.entity';
import { Route } from 'src/routes/entities/route.entity';
import { Trip, TripStatus } from 'src/trips/entities/trip.entity';
import { LiveSession, SessionStatus } from 'src/live-sessions/entities/live-session.entity';
import { LiveLocation } from 'src/live-sessions/entities/live-location.entity';
import { Schedule } from 'src/schedules/entities/schedule.entity';
import { Driver } from 'src/drivers/entities/driver.entity';
import { Vehicle } from 'src/vehicles/entities/vehicle.entity';

@Injectable()
export class PassengerService {
  private readonly logger = new Logger(PassengerService.name);

  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(RouteStop)
    private readonly routeStopRepo: Repository<RouteStop>,

    @InjectRepository(Route)
    private readonly routeRepo: Repository<Route>,

    @InjectRepository(Trip)
    private readonly tripRepo: Repository<Trip>,

    @InjectRepository(LiveSession)
    private readonly liveSessionRepo: Repository<LiveSession>,
  ) { }

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

  async findRouteAndActiveBuses(originStopId: number, destinationStopId: number) {
    this.logger.log('========================================');
    this.logger.log('START FIND ROUTE & ACTIVE BUSES (TypeORM)');
    this.logger.log(`Origin Stop ID : ${originStopId}`);
    this.logger.log(`Destination ID : ${destinationStopId}`);
    this.logger.log('========================================');

    // ==================== STEP A ====================
    const matchingRoute = await this.routeStopRepo
      .createQueryBuilder('origin')
      .innerJoin(
        RouteStop,
        'dest',
        'origin.route_id = dest.route_id AND origin.id = :originId AND dest.id = :destId',
        { originId: originStopId, destId: destinationStopId },
      )
      .select([
        'origin.route_id AS route_id',
        'origin.sequence AS origin_seq',
        'dest.sequence AS dest_seq',
      ])
      .where('origin.sequence < dest.sequence')
      .limit(1)
      .getRawOne();

    this.logger.log('\n===== STEP A : MATCHING ROUTE =====');

    if (matchingRoute) {
      this.logger.log('✅ Route ditemukan');
      this.logger.log(`   Route ID       : ${matchingRoute.route_id}`);
      this.logger.log(`   Origin ID:     : ${originStopId}`);
      this.logger.log(`   Origin Sequence: ${matchingRoute.origin_seq}`);
      this.logger.log(`   DestSequence ID: ${destinationStopId}`);
      this.logger.log(`   Dest Sequence  : ${matchingRoute.dest_seq}`);
    } else {
      this.logger.warn('❌ Tidak ditemukan route yang searah.');
      throw new BadRequestException('Rute tidak tersedia atau arah tujuan terbalik.');
    }

    const { route_id, origin_seq, dest_seq } = matchingRoute;

    // ==================== STEP B ====================
    const routeInfo = await this.routeRepo.findOne({
      where: { id: route_id },
    });

    this.logger.log('\n===== STEP B : ROUTE INFO =====');
    if (routeInfo) {
      this.logger.log('✅ Route Info berhasil diambil');
      this.logger.log(`   ID          : ${routeInfo.id}`);
      this.logger.log(`   Code        : ${routeInfo.code}`);
      this.logger.log(`   Name        : ${routeInfo.name}`);
      this.logger.log(`   Direction   : ${routeInfo.direction}`);
      this.logger.log(`   Color       : ${routeInfo.color}`);
      this.logger.log(`   Distance Km : ${routeInfo.distanceKm}`);
    } else {
      this.logger.warn('❌ Route master tidak ditemukan.');
    }

    // ==================== STEP C ====================
    const stops = await this.routeStopRepo
      .createQueryBuilder('stop')
      .where('stop.route_id = :routeId', { routeId: route_id })
      .andWhere('stop.sequence BETWEEN :originSeq AND :destSeq', {
        originSeq: origin_seq,
        destSeq: dest_seq,
      })
      .orderBy('stop.sequence', 'ASC')
      .getMany();

    this.logger.log('\n===== STEP C : ROUTE STOPS =====');
    this.logger.log(`✅ Total Stop ditemukan: ${stops.length}`);

    if (stops.length > 0) {
      for (let index = 0; index < stops.length; index++) {
        this.logger.log(`   Stop Ke ${index + 1} Loop : ${stops[index].name} (seq: ${stops[index].sequence})  (ID Halte : ${stops[index].id})`);
      }
    }

    // ==================== STEP D ====================
    const polylinePoints = await this.dataSource
      .createQueryBuilder()
      .select(['latitude', 'longitude'])
      .from('route_points', 'rp')
      .where('rp.route_id = :routeId', { routeId: route_id })
      .orderBy('rp.sequence', 'ASC')
      .getRawMany();

    // this.logger.log('\n===== STEP D : POLYLINE =====');
    // this.logger.log(`✅ Total Polyline Points: ${polylinePoints.length}`);

    // ==================== STEP E ====================
    const activeBuses = await this.dataSource
      .createQueryBuilder()
      .select([
        't.id AS trip_id',
        'v.vehicle_code',
        'v.plate_number',
        'd.name AS driver_name',
        'll.latitude',
        'll.longitude',
        'll.speed_kmh',
        'll.heading_degrees',
        'll.created_at AS updated_at',
        'ls.id AS LiveSessionID',


        'ls.currentStop.id AS currentStopID',
        'ls.currentSequence AS currentSequence',

        'ls.nextStop.id AS nextStopID',
        'ls.nextSequence AS nextSequence',

        'ls.isAtStop AS isStopInCurrentStop'

      ])
      .from(Trip, 't')
      .innerJoin(Schedule, 's', 't.schedule_id = s.id')
      .innerJoin(Driver, 'd', 's.driver_id = d.id')
      .innerJoin(Vehicle, 'v', 's.vehicle_id = v.id')
      .innerJoin(LiveSession, 'ls', 'ls.trip_id = t.id')
      .innerJoin(LiveLocation, 'll', 'll.session_id = ls.id')
      .where('t.status = :tripStatus', { tripStatus: TripStatus.ACTIVE })
      .andWhere('t.route_id = :routeId', { routeId: route_id })
      .andWhere('ls.status = :sessionStatus', { sessionStatus: SessionStatus.ACTIVE })
      .andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('MAX(l2.created_at)')
          .from(LiveLocation, 'l2')
          .where('l2.session_id = ll.session_id')
          .getQuery();
        return `ll.created_at = ${subQuery}`;
      })
      .getRawMany();

    this.logger.log('\n===== STEP E : ACTIVE BUSES =====');
    this.logger.log(`✅ Total Bus Aktif ditemukan: ${activeBuses.length}`);

    if (activeBuses.length > 0) {
      activeBuses.forEach((bus: any, index: number) => {
        this.logger.log(
          `   Bus ${index + 1}: ${bus.vehicle_code} | ${bus.plate_number} | ` +
          // Sesuaikan key dengan hasil mapping database (ll_latitude, ll_longitude, currentsequence, nextsequence)
          `Driver: ${bus.driver_name} | Lat: ${bus.ll_latitude}, Lng: ${bus.ll_longitude} Current Seq : ${bus.currentsequence}, nextSequence : ${bus.nextsequence}`
        );
      });
    }

    this.logger.log('========== ACTIVE BUSES ==========');
    this.logger.log(JSON.stringify(activeBuses, null, 2));

    const filteredBuses = this.filterBusesForPassenger(activeBuses, origin_seq);
    this.logger.log('\n===== STEP F : FILTERED ACTIVE BUSES =====');
    this.logger.log(`✅ Total Bus yang menjemput ditemukan: ${filteredBuses.length}`);
    this.logger.log(JSON.stringify(filteredBuses, null, 2));


    this.logger.log('\n========================================');
    this.logger.log('✅ FINISH findRouteAndActiveBuses - Success');
    this.logger.log('========================================\n');

    return {
      route_info: routeInfo,
      stops,
      polyline_points: polylinePoints,
      active_buses: activeBuses,
      filtered_buses: filteredBuses,
    };
  }


  private filterBusesForPassenger(
    activeBuses: any[],
    originSeq: number,
  ): any[] {
    return activeBuses.filter((bus) => {
      const currentSeq = Number(bus.currentsequence);
      const passengerSeq = Number(originSeq);

      const isAtStop =
        bus.isstopincurrentstop === true ||
        bus.isstopincurrentstop === 'true';

      return (
        currentSeq < passengerSeq ||
        (currentSeq === passengerSeq && isAtStop)
      );
    });
  }


}