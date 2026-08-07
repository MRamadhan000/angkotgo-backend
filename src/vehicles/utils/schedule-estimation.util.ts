import { RouteStop } from "src/routes/entities/route-stop.entity";
import { StopInterval } from "src/routes/entities/stop-interval.entity";

export function calculateEstimatedStops(
    targetDate: string,
    startTime: string,
    stops: RouteStop[],
    intervals: StopInterval[],
    bufferTimeMinutes: number = 10,
) {
    const intervalMap = new Map<string, number>();
    intervals.forEach((inv) => {
        intervalMap.set(`${inv.fromStopId}-${inv.toStopId}`, inv.durationInSeconds);
    });

    const baseDateString = `${targetDate}T${startTime}`;
    let cumulativeTimeMs = new Date(baseDateString).getTime();
    const BUFFER_TIME_MS = bufferTimeMinutes * 60 * 1000;

    return stops.map((stop, index) => {
        let arrivalTimeFormatted = '';

        if (index === 0) {
            arrivalTimeFormatted = new Date(cumulativeTimeMs).toTimeString().split(' ')[0];
        } else {
            const prevStop = stops[index - 1];
            const durationSec = intervalMap.get(`${prevStop.id}-${stop.id}`) || 0;
            const travelTimeMs = (durationSec * 1000) + BUFFER_TIME_MS;
            cumulativeTimeMs += travelTimeMs;

            arrivalTimeFormatted = new Date(cumulativeTimeMs).toTimeString().split(' ')[0];
        }

        return {
            stopId: stop.id,
            stopName: stop.stopName,
            stopOrder: stop.stopOrder,
            latitude: stop.latitude,
            longitude: stop.longitude,
            estimatedArrivalTime: arrivalTimeFormatted,
        };
    });
}