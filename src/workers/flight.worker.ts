/// <reference lib="webworker" />
/**
 * Flight Worker
 *
 * Responsibility: maintain the authoritative flight state Map, update positions
 * from delta packets, maintain per-flight trails, apply viewport filtering via
 * an R-tree, and post the ready-to-render array back to the main thread.
 *
 * This keeps the heavy data-processing off the main thread so the UI stays
 * responsive at 60 fps even with hundreds of live aircraft.
 */

import RBush from 'rbush';
import type { Flight, FlightDelta, ViewBounds, WorkerInMessage } from '../types/flight';

// ─── State ───────────────────────────────────────────────────────────────────

const flights = new Map<string, Flight>();

interface RBushItem {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  id: string;
}

const tree = new RBush<RBushItem>();
let viewport: ViewBounds | null = null;
const MAX_TRAIL = 12; // keep the last N positions per plane

// ─── Helpers ─────────────────────────────────────────────────────────────────

function rebuildTree() {
  tree.clear();
  const items: RBushItem[] = [];
  for (const [id, f] of flights) {
    items.push({ minX: f.lng, minY: f.lat, maxX: f.lng, maxY: f.lat, id });
  }
  tree.load(items);
}

function applyDelta(delta: FlightDelta) {
  const existing = flights.get(delta.id);
  if (!existing) return;

  const newTrail = [...existing.trail, [existing.lng, existing.lat] as [number, number]];
  if (newTrail.length > MAX_TRAIL) newTrail.shift();

  flights.set(delta.id, {
    ...existing,
    prevLat: existing.lat,
    prevLng: existing.lng,
    lat: delta.lat,
    lng: delta.lng,
    heading: delta.heading,
    altitude: delta.altitude,
    speed: delta.speed,
    trail: newTrail,
    lastUpdate: Date.now(),
  });
}

function getVisibleFlights(): Flight[] {
  if (!viewport) {
    return Array.from(flights.values());
  }
  const { minLng, minLat, maxLng, maxLat } = viewport;
  const items = tree.search({ minX: minLng, minY: minLat, maxX: maxLng, maxY: maxLat });
  return items.map(item => flights.get(item.id)).filter((f): f is Flight => f !== undefined);
}

// ─── Message handler ─────────────────────────────────────────────────────────

self.addEventListener('message', (e: MessageEvent<WorkerInMessage>) => {
  const msg = e.data;

  if (msg.type === 'INIT') {
    flights.clear();
    for (const f of msg.flights) {
      flights.set(f.id, f);
    }
    rebuildTree();
    self.postMessage({ type: 'READY', flights: Array.from(flights.values()) });
    return;
  }

  if (msg.type === 'UPDATE') {
    for (const delta of msg.deltas) {
      applyDelta(delta);
    }
    rebuildTree();
    self.postMessage({ type: 'READY', flights: getVisibleFlights() });
    return;
  }

  if (msg.type === 'VIEWPORT') {
    viewport = msg.bounds;
    self.postMessage({ type: 'READY', flights: getVisibleFlights() });
  }
});
