import { VehicleAssignment } from '../entities/vehicle-assignment.entity'; // Sesuaikan path entity Anda

export function mapAssignmentResponse(
    assignment: VehicleAssignment, 
    estimatedStops?: any[], 
    totalAmount?: number
) {
    return {
        assignmentId: assignment.id,
        date: assignment.assignmentDate,
        status: assignment.status,
        ...(totalAmount !== undefined && { totalAmount }),
        direction: assignment.direction,
        startTime: assignment.startTime,
        endTime: assignment.endTime,
        driver: {
            id: assignment.driver?.id,
            name: assignment.driver?.name,
        },
        conductor: {
            id: assignment.conductor?.id,
            name: assignment.conductor?.name,
        },
        routeCode: assignment.route?.routeCode,
        routeName: assignment.route?.routeName,
        vehicle: {
            id: assignment.vehicle?.id,
            plateNumber: assignment.vehicle?.plateNumber,
            vehicleCode: assignment.vehicle?.vehicleCode,
            capacity: assignment.vehicle?.capacity,
            type: assignment.vehicle?.type,
        },
        currentPassengers: assignment.currentPassengers,
        ...(estimatedStops && { estimatedStopsSchedule: estimatedStops }),
    };
}