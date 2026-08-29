export enum VehicleStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
}

export enum AssignmentStatus {
  SCHEDULED = 'SCHEDULED',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum DirectionType {
  FORWARD = 'FORWARD',
  RETURN = 'RETURN',
}

export enum ServiceType {
  ROUTINE = 'ROUTINE',
  REPAIR = 'REPAIR',
  INSPECTION = 'INSPECTION',
}

export enum VehicleType {
  PREMIUM = 'PREMIUM',
  REGULER = 'REGULER',
}

export enum StopStatus {
    HEADING_TO = 'HEADING_TO', // Sedang dalam perjalanan menuju halte (`currentStopId`)
    AT_STOP = 'AT_STOP',       // Sedang berhenti / melayani naik-turun penumpang di halte tersebut
}