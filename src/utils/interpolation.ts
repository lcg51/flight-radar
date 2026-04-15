import type { Flight } from '../types/flight';

/** Linear interpolation between two values. */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Shortest-path interpolation for angles (handles 359° → 1° crossing).
 */
export function lerpAngle(a: number, b: number, t: number): number {
  let diff = b - a;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return (a + diff * t + 360) % 360;
}

export interface InterpolatedFlight extends Flight {
  interpolatedLat: number;
  interpolatedLng: number;
  interpolatedHeading: number;
}

/**
 * Compute smooth interpolated position for a flight given the current time.
 * @param flight - flight with prevLat/prevLng (start) and lat/lng (end)
 * @param now    - current timestamp in ms
 * @param updateIntervalMs - how often positions update (default 1000 ms)
 */
export function interpolateFlight(
  flight: Flight,
  now: number,
  updateIntervalMs = 1000
): InterpolatedFlight {
  const elapsed = now - flight.lastUpdate;
  const t = Math.min(elapsed / updateIntervalMs, 1);

  return {
    ...flight,
    interpolatedLat: lerp(flight.prevLat, flight.lat, t),
    interpolatedLng: lerp(flight.prevLng, flight.lng, t),
    interpolatedHeading: lerpAngle(flight.heading, flight.heading, t),
  };
}
