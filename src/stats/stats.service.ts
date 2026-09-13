import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Driver, DriverStatus } from '../drivers/entities/driver.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { Route } from '../routes/entities/route.entity';
import { RouteStop } from '../routes/entities/route-stop.entity';
import { VehicleAssignment } from 'src/vehicles/entities/vehicle-assignment.entity';
import {
  AssignmentStatus,
  VehicleStatus,
} from 'src/vehicles/enum/vehicle.enum';
import { Cost } from 'src/tarif/entities/cost.entity';
import { SinyalEntity } from 'src/provide-sinyal/entities/provide-sinyal.entity';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
    @InjectRepository(Route)
    private readonly routeRepository: Repository<Route>,
    @InjectRepository(RouteStop)
    private readonly routeStopRepository: Repository<RouteStop>,
    @InjectRepository(VehicleAssignment)
    private readonly vehicleAssignmentRepository: Repository<VehicleAssignment>,
    @InjectRepository(Cost)
    private readonly costRepository: Repository<Cost>,
    @InjectRepository(SinyalEntity)
    private readonly sinyalRepository: Repository<SinyalEntity>,
  ) {}

  async getDashboardStatistics() {
    // Format tanggal hari ini (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];

    const [
      totalDrivers,
      totalActiveDrivers,
      totalInactiveDrivers,
      totalActiveVehicles,
      totalInactiveVehicles,
      totalRoutes,
      totalRouteStops,
      tarif,
    ] = await Promise.all([
      this.driverRepository.count(),
      this.driverRepository.count({
        where: { status: DriverStatus.ACTIVE },
      }),
      this.driverRepository.count({
        where: { status: DriverStatus.OFF_DUTY },
      }),
      this.vehicleRepository.count({
        where: { status: VehicleStatus.ACTIVE },
      }),
      this.vehicleRepository.count({
        where: { status: VehicleStatus.INACTIVE },
      }),
      this.routeRepository.count(),
      this.routeStopRepository.count(),
      this.costRepository.find(),
    ]);

    // 1. Cari rute paling diminati berdasarkan frekuensi di vehicle_assignments
    const mostPopularRouteRaw = await this.vehicleAssignmentRepository
      .createQueryBuilder('assignment')
      .select('assignment.routeId', 'routeId')
      .addSelect('COUNT(assignment.routeId)', 'totalUsage')
      .groupBy('assignment.routeId')
      .orderBy('totalUsage', 'DESC')
      .limit(1)
      .getRawOne();

    let mostPopularRoute: {
      id: number;
      routeCode: string;
      routeName: string;
      totalUsage: number;
    } | null = null;

    if (mostPopularRouteRaw) {
      const routeDetail = await this.routeRepository.findOne({
        where: { id: mostPopularRouteRaw.routeId },
      });

      if (routeDetail) {
        mostPopularRoute = {
          id: routeDetail.id,
          routeCode: routeDetail.routeCode,
          routeName: routeDetail.routeName,
          totalUsage: Number(mostPopularRouteRaw.totalUsage),
        };
      }
    }

    // 2. Hitung total vehicle_assignment hari ini
    const totalTodayAssignments = await this.vehicleAssignmentRepository.count({
      where: { assignmentDate: today as any },
    });

    // 3. Hitung vehicle_assignment hari ini yang dikelompokkan berdasarkan status (GROUP BY status)
    const todayAssignmentsRaw = await this.vehicleAssignmentRepository
      .createQueryBuilder('assignment')
      .select('assignment.status', 'status')
      .addSelect('COUNT(assignment.id)', 'count')
      .where('assignment.assignmentDate = :today', { today })
      .groupBy('assignment.status')
      .getRawMany();
    // Inisialisasi semua status dengan nilai default 0
    const assignmentsByStatus: Record<string, number> = {
      [AssignmentStatus.SCHEDULED]: 0,
      [AssignmentStatus.ONGOING]: 0,
      [AssignmentStatus.COMPLETED]: 0,
      [AssignmentStatus.CANCELLED]: 0,
      // Tambahkan status lain dari enum AssignmentStatus Anda jika ada
    };

    // Timpa dengan data aktual dari hasil query database
    todayAssignmentsRaw.forEach((item) => {
      if (item.status in assignmentsByStatus) {
        assignmentsByStatus[item.status] = Number(item.count);
      }
    });

    // 4. Hitung jumlah penumpang (sinyal_penumpang) berdasarkan vehicle_assignment hari ini
    // Kita ambil ID assignment yang aktif hari ini terlebih dahulu
    const todayAssignments = await this.vehicleAssignmentRepository.find({
      where: { assignmentDate: today as any },
      select: { id: true },
    });
    const todayAssignmentIds = todayAssignments.map((a) => a.id);

    // 5. Grouping jumlah penumpang berdasarkan vehicle_assignment_id dari tabel sinyal_detail untuk hari ini
    const passengersByAssignmentRaw =
      todayAssignmentIds.length > 0
        ? await this.sinyalRepository
            .createQueryBuilder('sinyal')
            .innerJoin('sinyal.details', 'detail')
            .select('detail.vehicleAssignmentId', 'vehicleAssignmentId')
            .addSelect('COUNT(sinyal.id)', 'totalPassengers')
            .where('detail.vehicleAssignmentId IN (:...ids)', {
              ids: todayAssignmentIds,
            })
            .groupBy('detail.vehicleAssignmentId')
            .getRawMany()
        : [];

    // Ubah hasil raw SQL menjadi bentuk object/map yang rapi { [vehicleAssignmentId]: totalPassengers }
    const passengersByAssignment: Record<string, number> = {};
    passengersByAssignmentRaw.forEach((item) => {
      passengersByAssignment[item.vehicleAssignmentId] = Number(
        item.totalPassengers,
      );
    });

    const formattedCosts = tarif.map((cost) => ({
      id: cost.id,
      name: cost.name,
      amount: Number(cost.nominal),
    }));

    return {
      success: true,
      message: 'Statistics fetched successfully',
      data: {
        totalDrivers,
        activeDrivers: totalActiveDrivers,
        inactiveDrivers: totalInactiveDrivers,
        activeVehicles: totalActiveVehicles,
        inactiveVehicles: totalInactiveVehicles,
        totalRoutes,
        totalRouteStops,
        totalTodayAssignments,
        todayAssignmentsByStatus: assignmentsByStatus,
        mostPopularRoute,
        passengersByVehicleAssignmentId: passengersByAssignment,
        costs: formattedCosts,
      },
    };
  }
}
