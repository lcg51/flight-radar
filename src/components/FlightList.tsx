import { useMemo } from 'react';
import { FixedSizeList, type ListChildComponentProps } from 'react-window';
import { useFlightStore } from '../store/useFlightStore';
import type { Flight } from '../types/flight';

interface RowProps extends ListChildComponentProps {
  data: { flights: Flight[]; selectedId: string | null; onSelect: (id: string) => void };
}

function FlightRow({ index, style, data }: RowProps) {
  const flight = data.flights[index];
  const selected = flight.id === data.selectedId;

  return (
    <div
      style={style}
      className={`flight-row ${selected ? 'flight-row--selected' : ''}`}
      onClick={() => data.onSelect(flight.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && data.onSelect(flight.id)}
    >
      <div className="flight-row-icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C11.4 2 11 2.4 11 3V10L3 14V16L11 13.5V19.5L9 21V23L12 22L15 23V21L13 19.5V13.5L21 16V14L13 10V3C13 2.4 12.6 2 12 2Z" />
        </svg>
      </div>
      <div className="flight-row-info">
        <span className="flight-row-callsign">{flight.callsign}</span>
        <span className="flight-row-route">
          {flight.origin} → {flight.destination}
        </span>
      </div>
      <div className="flight-row-data">
        <span className="flight-row-alt">{Math.round(flight.altitude / 100) * 100} ft</span>
        <span className="flight-row-spd">{Math.round(flight.speed)} kts</span>
      </div>
    </div>
  );
}

export function FlightList() {
  const { flights, selectedFlightId, searchQuery, selectFlight } = useFlightStore();

  const filtered = useMemo(() => {
    const all = Object.values(flights);
    if (!searchQuery.trim()) return all;
    const q = searchQuery.toLowerCase();
    return all.filter(
      (f) =>
        f.callsign.toLowerCase().includes(q) ||
        f.airline.toLowerCase().includes(q) ||
        f.origin.toLowerCase().includes(q) ||
        f.destination.toLowerCase().includes(q)
    );
  }, [flights, searchQuery]);

  const itemData = useMemo(
    () => ({ flights: filtered, selectedId: selectedFlightId, onSelect: selectFlight }),
    [filtered, selectedFlightId, selectFlight]
  );

  return (
    <aside className="flight-list">
      <div className="flight-list-header">
        <span>Live Flights</span>
        <span className="flight-list-count">{filtered.length}</span>
      </div>

      {filtered.length === 0 ? (
        <div className="flight-list-empty">No flights match your search.</div>
      ) : (
        <FixedSizeList
          height={window.innerHeight - 56 - 48 - 44} // total - top bar - bottom bar - list header
          itemCount={filtered.length}
          itemSize={58}
          width="100%"
          itemData={itemData}
          style={{ overflowX: 'hidden' }}
        >
          {FlightRow}
        </FixedSizeList>
      )}
    </aside>
  );
}
