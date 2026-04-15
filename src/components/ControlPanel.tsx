import { useFlightStore } from '../store/useFlightStore';
import type { LayerKey } from '../types/flight';

function LayerToggle({ label, layerKey }: { label: string; layerKey: LayerKey }) {
  const { layerVisibility, toggleLayer } = useFlightStore();
  const active = layerVisibility[layerKey];

  return (
    <button
      className={`layer-toggle ${active ? 'layer-toggle--active' : ''}`}
      onClick={() => toggleLayer(layerKey)}
      aria-pressed={active}
    >
      <span className="toggle-dot" />
      {label}
    </button>
  );
}

export function ControlPanel() {
  const { flights } = useFlightStore();
  const count = Object.keys(flights).length;

  return (
    <footer className="control-panel">
      <div className="control-layers">
        <span className="control-label">Layers</span>
        <LayerToggle label="Trails" layerKey="trails" />
        <LayerToggle label="Labels" layerKey="labels" />
      </div>

      <div className="control-stats">
        <span className="stat-item">
          <span className="stat-num">{count}</span>
          <span className="stat-unit">planes on screen</span>
        </span>
        <span className="stat-divider" />
        <span className="stat-item">
          <span className="stat-num">1s</span>
          <span className="stat-unit">update interval</span>
        </span>
        <span className="stat-divider" />
        <span className="stat-item">
          <span className="stat-num">WebGL</span>
          <span className="stat-unit">renderer</span>
        </span>
      </div>

      <div className="control-legend">
        <span className="legend-dot legend-dot--selected" />
        <span>Selected</span>
      </div>
    </footer>
  );
}
