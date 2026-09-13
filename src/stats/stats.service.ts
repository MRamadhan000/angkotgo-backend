import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Driver, DriverStatus } from '../drivers/entities/driver.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { Route } from '../routes/entities/route.entity';
import { RouteStop } from '../routes/entities/route-stop.entity';
import { VehicleAssignment } from 'src/vehicles/entities/vehicle-assignment.entity';
import {
  VehicleStatus,
  AssignmentStatus,
} from 'src/vehicles/enum/vehicle.enum';
import { Cost } from 'src/tarif/entities/cost.entity';
import { SinyalEntity } from 'src/provide-sinyal/entities/provide-sinyal.entity';
import { Payment, PaymentStatus } from 'src/payments/entities/payment.entity';

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
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async getDashboardStatistics() {
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
      this.driverRepository.count({ where: { status: DriverStatus.ACTIVE } }),
      this.driverRepository.count({ where: { status: DriverStatus.OFF_DUTY } }),
      this.vehicleRepository.count({ where: { status: VehicleStatus.ACTIVE } }),
      this.vehicleRepository.count({
        where: { status: VehicleStatus.INACTIVE },
      }),
      this.routeRepository.count(),
      this.routeStopRepository.count(),
      this.costRepository.find(),
    ]);

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

    const totalTodayAssignments = await this.vehicleAssignmentRepository.count({
      where: { assignmentDate: today as any },
    });

    const todayAssignmentsRaw = await this.vehicleAssignmentRepository
      .createQueryBuilder('assignment')
      .select('assignment.status', 'status')
      .addSelect('COUNT(assignment.id)', 'count')
      .where('assignment.assignmentDate = :today', { today })
      .groupBy('assignment.status')
      .getRawMany();

    const assignmentsByStatus: Record<string, number> = {
      [AssignmentStatus.SCHEDULED]: 0,
      [AssignmentStatus.ONGOING]: 0,
      [AssignmentStatus.COMPLETED]: 0,
      [AssignmentStatus.CANCELLED]: 0,
    };

    todayAssignmentsRaw.forEach((item) => {
      if (item.status in assignmentsByStatus) {
        assignmentsByStatus[item.status] = Number(item.count);
      }
    });

    // ambil jumlah penumpang dari tabel payments bukan tabel sinyal
    const topPassengersByAssignmentRaw = await this.paymentRepository
      .createQueryBuilder('payment')
      .innerJoin('payment.vehicleAssignment', 'assignment')
      .innerJoin('assignment.route', 'route')
      .select('payment.vehicleAssignmentId', 'vehicleAssignmentId')
      .addSelect('route.routeName', 'routeName')
      .addSelect('route.routeCode', 'routeCode')
      .addSelect('COUNT(payment.id)', 'totalPassengers')
      .where('assignment.assignmentDate = :today', { today })
      .andWhere('payment.status = :status', { status: PaymentStatus.PAID })
      .groupBy('payment.vehicleAssignmentId')
      .addGroupBy('route.routeName')
      .addGroupBy('route.routeCode')
      .orderBy('totalPassengers', 'DESC')
      .limit(3)
      .getRawMany();

    const topPassengersByAssignment = topPassengersByAssignmentRaw.map(
      (item) => ({
        vehicleAssignmentId: item.vehicleAssignmentId,
        routeCode: item.routeCode,
        routeName: item.routeName,
        totalPassengers: Number(item.totalPassengers),
      }),
    );

    const formattedCosts = tarif.map((cost) => ({
      id: cost.id,
      name: cost.name,
      nominal: Number(cost.nominal),
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
        topPassengersByAssignment,
        mostPopularRoute,
        tariffs: formattedCosts,
      },
    };
  }
}
