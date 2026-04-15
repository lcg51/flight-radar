import { create } from 'zustand';
import type { Flight, LayerKey, LayerVisibility } from '../types/flight';

interface FlightStore {
  /** All visible flights, keyed by flight ID */
  flights: Record<string, Flight>;
  /** Currently selected flight ID (user clicked a plane) */
  selectedFlightId: string | null;
  /** Search query for the sidebar list */
  searchQuery: string;
  /** Toggle state for map layers */
  layerVisibility: LayerVisibility;
  /** Total number of known flights (for status bar) */
  totalCount: number;

  // Actions
  updateFlights: (flights: Flight[]) => void;
  selectFlight: (id: string | null) => void;
  setSearchQuery: (q: string) => void;
  toggleLayer: (layer: LayerKey) => void;
}

export const useFlightStore = create<FlightStore>((set) => ({
  flights: {},
  selectedFlightId: null,
  searchQuery: '',
  layerVisibility: { trails: true, labels: false },
  totalCount: 0,

  updateFlights: (flights) => {
    const record: Record<string, Flight> = {};
    for (const f of flights) record[f.id] = f;
    set((state) => ({
      flights: record,
      // Keep totalCount as the high-water mark (worker may filter by viewport)
      totalCount: Math.max(state.totalCount, flights.length),
    }));
  },

  selectFlight: (id) => set({ selectedFlightId: id }),

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  toggleLayer: (layer) =>
    set((state) => ({
      layerVisibility: {
        ...state.layerVisibility,
        [layer]: !state.layerVisibility[layer],
      },
    })),
}));
