import { useEffect, useRef } from "react";
import { MapView } from "./components/MapView";
import { FlightDetailPanel } from "./components/FlightDetailPanel";
import { FlightList } from "./components/FlightList";
import { SearchBar } from "./components/SearchBar";
import { ControlPanel } from "./components/ControlPanel";
import { useFlightStore } from "./store/useFlightStore";
import { generateInitialFlights, computeDeltas } from "./utils/mockData";
import type { WorkerOutMessage, ViewBounds } from "./types/flight";

const UPDATE_INTERVAL_MS = 1000;

export default function App() {
  const workerRef = useRef<Worker | null>(null);
  const flightsRef = useRef(generateInitialFlights(150));
  const { updateFlights } = useFlightStore();

  console.log(flightsRef);

  useEffect(() => {
    // ── Spin up the Web Worker ─────────────────────────────────────────────
    const worker = new Worker(
      new URL("./workers/flight.worker.ts", import.meta.url),
      { type: "module" },
    );
    workerRef.current = worker;

    // When the worker sends processed flights, push them into the store
    worker.onmessage = (e: MessageEvent<WorkerOutMessage>) => {
      if (e.data.type === "READY") {
        updateFlights(e.data.flights);
      }
    };

    // ── Seed the worker with the initial snapshot ──────────────────────────
    worker.postMessage({ type: "INIT", flights: flightsRef.current });

    // ── Simulation tick: compute deltas, post to worker ────────────────────
    const intervalId = setInterval(() => {
      const deltas = computeDeltas(flightsRef.current);

      // Apply deltas locally so we can compute the next tick from updated state
      flightsRef.current = flightsRef.current.map((f, i) => {
        const d = deltas[i];
        return {
          ...f,
          prevLat: f.lat,
          prevLng: f.lng,
          lat: d.lat,
          lng: d.lng,
          heading: d.heading,
          altitude: d.altitude,
          speed: d.speed,
          lastUpdate: Date.now(),
        };
      });

      worker.postMessage({ type: "UPDATE", deltas });
    }, UPDATE_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
      worker.terminate();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleViewportChange = (bounds: ViewBounds) => {
    workerRef.current?.postMessage({ type: "VIEWPORT", bounds });
  };

  return (
    <div className='app'>
      <SearchBar />
      <div className='app-body'>
        <FlightList />
        <main className='map-container'>
          <MapView onViewportChange={handleViewportChange} />
        </main>
        <FlightDetailPanel />
      </div>
      <ControlPanel />
    </div>
  );
}
