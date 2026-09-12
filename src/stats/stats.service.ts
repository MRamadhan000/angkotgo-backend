// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { Driver, DriverStatus } from '../drivers/entities/driver.entity';
// import { Vehicle } from '../vehicles/entities/vehicle.entity';
// import { Route } from '../routes/entities/route.entity';
// import { RouteStop } from '../routes/entities/route-stop.entity';
// import { ScheduleTemplate } from '../vehicles/entities/schedule-template.entity';
// import { VehicleAssignment } from 'src/vehicles/entities/vehicle-assignment.entity';
// import { VehicleStatus } from 'src/vehicles/enum/vehicle.enum';
// import { Cost } from 'src/tarif/entities/cost.entity';

// @Injectable()
// export class StatisticsService {
//   constructor(
//     @InjectRepository(Driver)
//     private readonly driverRepository: Repository<Driver>,
//     @InjectRepository(Vehicle)
//     private readonly vehicleRepository: Repository<Vehicle>,
//     @InjectRepository(Route)
//     private readonly routeRepository: Repository<Route>,
//     @InjectRepository(RouteStop)
//     private readonly routeStopRepository: Repository<RouteStop>,
//     @InjectRepository(ScheduleTemplate)
//     private readonly scheduleRepository: Repository<ScheduleTemplate>,
//     @InjectRepository(VehicleAssignment)
//     private readonly vehicleAssignmentRepository: Repository<VehicleAssignment>,
//     @InjectRepository(Cost)
//     private readonly costRepository: Repository<Cost>,
//   ) {}

//   async getDashboardStatistics() {
//     const [
//       totalDrivers,
//       totalActiveDrivers,
//       totalInactiveDrivers,
//       totalActiveVehicles,
//       totalInactiveVehicles,
//       totalRoutes,
//       totalRouteStops,
//       totalSchedules,
//       tarif,
//     ] = await Promise.all([
//       this.driverRepository.count(),
//       this.driverRepository.count({
//         where: { status: DriverStatus.ACTIVE },
//       }),
//       this.driverRepository.count({
//         where: { status: DriverStatus.OFF_DUTY },
//       }),
//       this.vehicleRepository.count({
//         where: { status: VehicleStatus.ACTIVE },
//       }),
//       this.vehicleRepository.count({
//         where: { status: VehicleStatus.INACTIVE }, // Sesuaikan dengan enum status tidak aktif Anda
//       }),
//       this.routeRepository.count(),
//       this.routeStopRepository.count(),
//       this.scheduleRepository.count(),
//       this.costRepository.find(),
//     ]);

//     // 2. Cari rute paling diminati berdasarkan frekuensi di vehicle_assignments
//     const mostPopularRouteRaw = await this.vehicleAssignmentRepository
//       .createQueryBuilder('assignment')
//       .select('assignment.routeId', 'routeId')
//       .addSelect('COUNT(assignment.routeId)', 'totalUsage')
//       .groupBy('assignment.routeId')
//       .orderBy('totalUsage', 'DESC')
//       .limit(1)
//       .getRawOne();

//     let mostPopularRoute: {
//       id: number;
//       routeCode: string;
//       routeName: string;
//       totalUsage: number;
//     } | null = null;
//     if (mostPopularRouteRaw) {
//       const routeDetail = await this.routeRepository.findOne({
//         where: { id: mostPopularRouteRaw.routeId },
//       });

//       if (routeDetail) {
//         mostPopularRoute = {
//           id: routeDetail.id,
//           routeCode: routeDetail.routeCode,
//           routeName: routeDetail.routeName,
//           totalUsage: Number(mostPopularRouteRaw.totalUsage),
//         };
//       }
//     }

//     const formattedCosts = tarif.map((cost) => ({
//       id: cost.id,
//       name: cost.name,
//       nominal: Number(cost.nominal),
//     }));

//     return {
//       success: true,
//       message: 'Statistics fetched successfully',
//       data: {
//         JumlahDriver: totalDrivers,
//         ActiveDrivers: totalActiveDrivers,
//         InactiveDrivers: totalInactiveDrivers,
//         ActiveVehicles: totalActiveVehicles,
//         InactiveVehicles: totalInactiveVehicles,
//         JumlahRoute: totalRoutes,
//         JumlahRouteStop: totalRouteStops,
//         JumlahSchedule: totalSchedules,
//         RutePalingDiminati: mostPopularRoute,
//         tarif: formattedCosts,
//       },
//     };
//   }
// }

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
        costs: formattedCosts,
      },
    };
  }
}
