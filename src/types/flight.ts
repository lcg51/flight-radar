export interface Flight {
  id: string;
  callsign: string;
  airline: string;
  aircraft: string;
  origin: string;
  destination: string;
  /** Current target latitude (degrees) */
  lat: number;
  /** Current target longitude (degrees) */
  lng: number;
  /** Heading clockwise from North (degrees) */
  heading: number;
  /** Altitude in feet */
  altitude: number;
  /** Speed in knots (ground speed) */
  speed: number;
  /** Recent positions as [lng, lat] pairs for trail rendering */
  trail: Array<[number, number]>;
  /** Timestamp of last position update */
  lastUpdate: number;
  /** Position before last update — used for interpolation */
  prevLat: number;
  prevLng: number;
}

/** Lightweight position delta sent from the simulator each tick */
export interface FlightDelta {
  id: string;
  lat: number;
  lng: number;
  heading: number;
  altitude: number;
  speed: number;
}

export interface ViewBounds {
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
}

export type LayerKey = 'trails' | 'labels';

export interface LayerVisibility {
  trails: boolean;
  labels: boolean;
}

/** Worker → Main messages */
export type WorkerOutMessage =
  | { type: 'READY'; flights: Flight[] };

/** Main → Worker messages */
export type WorkerInMessage =
  | { type: 'INIT'; flights: Flight[] }
  | { type: 'UPDATE'; deltas: FlightDelta[] }
  | { type: 'VIEWPORT'; bounds: ViewBounds };
