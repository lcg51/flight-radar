import { useFlightStore } from '../store/useFlightStore';

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-row">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value}</span>
    </div>
  );
}

function Gauge({ label, value, max, unit }: { label: string; value: number; max: number; unit: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="gauge">
      <div className="gauge-header">
        <span className="gauge-label">{label}</span>
        <span className="gauge-value">
          {value.toLocaleString()} {unit}
        </span>
      </div>
      <div className="gauge-track">
        <div className="gauge-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function FlightDetailPanel() {
  const { flights, selectedFlightId, selectFlight } = useFlightStore();
  const flight = selectedFlightId ? flights[selectedFlightId] : null;

  if (!flight) {
    return (
      <aside className="detail-panel detail-panel--empty">
        <div className="detail-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M12 2C11.4 2 11 2.4 11 3V10L3 14V16L11 13.5V19.5L9 21V23L12 22L15 23V21L13 19.5V13.5L21 16V14L13 10V3C13 2.4 12.6 2 12 2Z" />
          </svg>
          <p>Click a plane on the map to see flight details</p>
        </div>
      </aside>
    );
  }

  const headingLabel = (h: number) => {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return dirs[Math.round(h / 45) % 8];
  };

  return (
    <aside className="detail-panel">
      <header className="detail-header">
        <div>
          <h2 className="detail-callsign">{flight.callsign}</h2>
          <p className="detail-airline">{flight.airline}</p>
        </div>
        <button className="close-btn" onClick={() => selectFlight(null)} aria-label="Close">✕</button>
      </header>

      <section className="detail-section">
        <h3>Route</h3>
        <div className="route-display">
          <div className="route-airport">
            <span className="route-code">{flight.origin}</span>
            <span className="route-name">Origin</span>
          </div>
          <div className="route-arrow">
            <svg width="40" height="16" viewBox="0 0 40 16">
              <line x1="0" y1="8" x2="36" y2="8" stroke="#4a90d9" strokeWidth="1.5" strokeDasharray="4 2" />
              <polygon points="36,4 40,8 36,12" fill="#4a90d9" />
            </svg>
          </div>
          <div className="route-airport">
            <span className="route-code">{flight.destination}</span>
            <span className="route-name">Destination</span>
          </div>
        </div>
      </section>

      <section className="detail-section">
        <h3>Flight Data</h3>
        <Gauge label="Altitude" value={flight.altitude} max={45000} unit="ft" />
        <Gauge label="Speed" value={Math.round(flight.speed)} max={600} unit="kts" />
      </section>

      <section className="detail-section">
        <h3>Details</h3>
        <DetailRow label="Aircraft" value={flight.aircraft} />
        <DetailRow
          label="Heading"
          value={`${Math.round(flight.heading)}° ${headingLabel(flight.heading)}`}
        />
        <DetailRow
          label="Position"
          value={`${flight.lat.toFixed(3)}°, ${flight.lng.toFixed(3)}°`}
        />
        <DetailRow
          label="Altitude"
          value={`${flight.altitude.toLocaleString()} ft / ${Math.round(flight.altitude * 0.3048)} m`}
        />
        <DetailRow label="Ground Speed" value={`${Math.round(flight.speed)} kts`} />
      </section>
    </aside>
  );
}
