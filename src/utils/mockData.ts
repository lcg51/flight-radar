import type { Flight, FlightDelta } from '../types/flight';

// ─── Static reference data ───────────────────────────────────────────────────

const AIRLINES = [
  { code: 'UAL', name: 'United Airlines' },
  { code: 'DAL', name: 'Delta Air Lines' },
  { code: 'AAL', name: 'American Airlines' },
  { code: 'BAW', name: 'British Airways' },
  { code: 'AFR', name: 'Air France' },
  { code: 'DLH', name: 'Lufthansa' },
  { code: 'EZY', name: 'EasyJet' },
  { code: 'RYR', name: 'Ryanair' },
  { code: 'QFA', name: 'Qantas' },
  { code: 'SIA', name: 'Singapore Airlines' },
  { code: 'JAL', name: 'Japan Airlines' },
  { code: 'KLM', name: 'KLM Royal Dutch Airlines' },
  { code: 'UAE', name: 'Emirates' },
  { code: 'THY', name: 'Turkish Airlines' },
  { code: 'SVA', name: 'Saudia' },
  { code: 'CCA', name: 'Air China' },
  { code: 'ETH', name: 'Ethiopian Airlines' },
];

const AIRPORTS = [
  'JFK', 'LAX', 'ORD', 'DFW', 'ATL',
  'LHR', 'CDG', 'FRA', 'AMS', 'MAD',
  'DXB', 'DOH', 'AUH', 'SIN', 'HKG',
  'NRT', 'PEK', 'PVG', 'SYD', 'MEL',
  'GRU', 'EZE', 'BOG', 'LIM', 'SCL',
  'JNB', 'CAI', 'NBO', 'DEL', 'BOM',
  'ICN', 'BKK', 'KUL', 'CGK', 'MNL',
];

const AIRCRAFT = ['B737', 'B738', 'B77W', 'B787', 'A320', 'A321', 'A332', 'A359', 'A380', 'A319', 'B739', 'A20N'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Convert knots + heading into degrees/sec lat/lng delta (simulation uses 60× speed-up)
const SPEED_MULTIPLIER = 60; // 60× real speed so planes visibly move
const UPDATE_INTERVAL_SEC = 1;

function moveFlight(flight: Flight): FlightDelta {
  const speedDegPerSec = (flight.speed / 3600) * (1 / 60) * SPEED_MULTIPLIER;
  const headingRad = (flight.heading * Math.PI) / 180;

  const dLat = speedDegPerSec * Math.cos(headingRad) * UPDATE_INTERVAL_SEC;
  const dLng =
    (speedDegPerSec * Math.sin(headingRad) * UPDATE_INTERVAL_SEC) /
    Math.cos((flight.lat * Math.PI) / 180);

  let newLat = flight.lat + dLat;
  let newLng = flight.lng + dLng;
  let newHeading = flight.heading + rand(-3, 3); // gentle turn drift

  // Wrap longitude
  if (newLng > 180) newLng -= 360;
  if (newLng < -180) newLng += 360;

  // Bounce off polar regions
  if (newLat > 75 || newLat < -60) {
    newHeading = (newHeading + 180) % 360;
    newLat = Math.max(-60, Math.min(75, newLat));
  }

  // Slight altitude variation (cruise oscillation ±200 ft)
  const newAlt = flight.altitude + rand(-200, 200);

  return {
    id: flight.id,
    lat: newLat,
    lng: newLng,
    heading: (newHeading + 360) % 360,
    altitude: Math.max(25_000, Math.min(45_000, newAlt)),
    speed: flight.speed + rand(-5, 5),
  };
}

// ─── Public API ──────────────────────────────────────────────────────────────

/** Generate the initial set of mock flights. */
export function generateInitialFlights(count = 150): Flight[] {
  return Array.from({ length: count }, (_, i) => {
    const airline = pick(AIRLINES);
    const flightNum = Math.floor(rand(100, 9999));
    const id = `${airline.code}${flightNum}`;

    let origin = pick(AIRPORTS);
    let destination = pick(AIRPORTS);
    while (destination === origin) destination = pick(AIRPORTS);

    return {
      id,
      callsign: id,
      airline: airline.name,
      aircraft: pick(AIRCRAFT),
      origin,
      destination,
      lat: rand(-55, 72),
      lng: rand(-170, 175),
      heading: rand(0, 360),
      altitude: Math.floor(rand(28_000, 42_000) / 100) * 100,
      speed: Math.floor(rand(400, 560)),
      trail: [],
      lastUpdate: Date.now(),
      prevLat: 0, // set below
      prevLng: 0,
    } satisfies Flight;
  }).map(f => ({ ...f, prevLat: f.lat, prevLng: f.lng }));
}

/**
 * Compute one tick of position deltas for all flights.
 * Called every UPDATE_INTERVAL_MS on the main thread, posted to the worker.
 */
export function computeDeltas(flights: Flight[]): FlightDelta[] {
  return flights.map(moveFlight);
}
