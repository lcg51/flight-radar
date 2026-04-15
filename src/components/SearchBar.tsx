import { useFlightStore } from '../store/useFlightStore';

export function SearchBar() {
  const { searchQuery, setSearchQuery, totalCount, flights } = useFlightStore();

  return (
    <header className="search-bar">
      {/* Brand */}
      <div className="brand">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#4a90d9">
          <path d="M12 2C11.4 2 11 2.4 11 3V10L3 14V16L11 13.5V19.5L9 21V23L12 22L15 23V21L13 19.5V13.5L21 16V14L13 10V3C13 2.4 12.6 2 12 2Z" />
        </svg>
        <span className="brand-name">FlightRadar</span>
      </div>

      {/* Search input */}
      <div className="search-input-wrap">
        <svg
          className="search-icon"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          className="search-input"
          type="text"
          placeholder="Search callsign, airline, airport…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search flights"
        />
        {searchQuery && (
          <button className="search-clear" onClick={() => setSearchQuery('')} aria-label="Clear search">
            ✕
          </button>
        )}
      </div>

      {/* Live counter */}
      <div className="live-badge">
        <span className="live-dot" />
        <span>{Object.keys(flights).length} live</span>
      </div>
    </header>
  );
}
