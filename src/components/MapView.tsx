import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import DeckGL from "@deck.gl/react";
import { IconLayer, PathLayer } from "@deck.gl/layers";
import { WebMercatorViewport } from "@deck.gl/core";
import Map from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useFlightStore } from "../store/useFlightStore";
import { interpolateFlight } from "../utils/interpolation";
import { getAirplaneAtlas, ICON_MAPPING } from "../utils/airplaneIcon";
import type { InterpolatedFlight } from "../utils/interpolation";
import type { ViewBounds } from "../types/flight";

// Free CartoDB dark-matter basemap — no API key required
const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

const INITIAL_VIEW_STATE = {
  longitude: 10,
  latitude: 30,
  zoom: 2.8,
  pitch: 0,
  bearing: 0,
  minZoom: 1,
  maxZoom: 18,
};

interface Props {
  onViewportChange?: (bounds: ViewBounds) => void;
}

export function MapView({ onViewportChange }: Props) {
  const { flights, selectedFlightId, layerVisibility, selectFlight } =
    useFlightStore();

  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [renderFlights, setRenderFlights] = useState<InterpolatedFlight[]>([]);
  const rafRef = useRef<number>(0);

  // Lazy-initialise the icon atlas (runs once in the browser)
  const iconAtlas = useMemo(() => getAirplaneAtlas(), []);

  // ── 60 fps interpolation loop ──────────────────────────────────────────────
  useEffect(() => {
    const flightsSnapshot = Object.values(flights);
    const tick = () => {
      const now = Date.now();
      setRenderFlights(flightsSnapshot.map((f) => interpolateFlight(f, now)));
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [flights]); // Re-anchor when store flights update (every ~1 s)

  // ── Viewport → worker ─────────────────────────────────────────────────────
  const handleViewStateChange = useCallback(
    ({ viewState: vs }: { viewState: typeof INITIAL_VIEW_STATE }) => {
      setViewState(vs);
      try {
        const vp = new WebMercatorViewport(vs);
        const [minLng, minLat] = vp.unproject([
          0,
          vp.height ?? window.innerHeight,
        ]);
        const [maxLng, maxLat] = vp.unproject([
          vp.width ?? window.innerWidth,
          0,
        ]);
        onViewportChange?.({ minLng, minLat, maxLng, maxLat });
      } catch {
        // Viewport not fully initialised yet
        console.error("Viewport not fully initialized");
      }
    },
    [onViewportChange],
  );

  // ── deck.gl layers ────────────────────────────────────────────────────────
  const layers = useMemo(() => {
    const trailLayer = layerVisibility.trails
      ? new PathLayer({
          id: "trails",
          data: renderFlights.filter((f) => f.trail.length > 1),
          getPath: (d: InterpolatedFlight) => d.trail as [number, number][],
          getColor: (d: InterpolatedFlight) =>
            d.id === selectedFlightId
              ? [255, 220, 0, 230]
              : [80, 180, 255, 100],
          getWidth: (d: InterpolatedFlight) =>
            d.id === selectedFlightId ? 3 : 1,
          widthUnits: "pixels",
          pickable: false,
          updateTriggers: {
            getColor: selectedFlightId,
            getWidth: selectedFlightId,
          },
        })
      : null;

    const planeLayer = new IconLayer<InterpolatedFlight>({
      id: "planes",
      data: renderFlights,
      pickable: true,
      iconAtlas,
      iconMapping: ICON_MAPPING,
      getIcon: () => "airplane",
      // deck.gl angle is counter-clockwise; heading is clockwise from North
      getAngle: (d) => -d.heading,
      getPosition: (d) => [
        d.interpolatedLng,
        d.interpolatedLat,
        d.altitude * 0.15,
      ],
      getSize: (d) => (d.id === selectedFlightId ? 48 : 28),
      getColor: (d) =>
        d.id === selectedFlightId ? [255, 220, 0, 255] : [100, 210, 255, 220],
      sizeUnits: "pixels",
      billboard: false,
      updateTriggers: {
        getColor: selectedFlightId,
        getSize: selectedFlightId,
      },
    });

    return [trailLayer, planeLayer].filter(Boolean);
  }, [renderFlights, selectedFlightId, layerVisibility.trails, iconAtlas]);

  const handleClick = useCallback(
    ({ object }: { object?: InterpolatedFlight | null }) => {
      selectFlight(object?.id ?? null);
    },
    [selectFlight],
  );

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <DeckGL
        viewState={viewState}
        onViewStateChange={
          handleViewStateChange as Parameters<
            typeof DeckGL
          >[0]["onViewStateChange"]
        }
        controller={true}
        layers={layers}
        onClick={handleClick as Parameters<typeof DeckGL>[0]["onClick"]}
        getTooltip={({ object }: { object?: InterpolatedFlight | null }) =>
          object
            ? {
                html: `<strong>${object.callsign}</strong><br/>${object.airline}<br/>${object.origin} → ${object.destination}<br/>${object.altitude.toLocaleString()} ft · ${Math.round(object.speed)} kts`,
                style: {
                  background: "#1a2233",
                  color: "#e0eaff",
                  fontSize: "12px",
                  borderRadius: "6px",
                  padding: "6px 10px",
                  border: "1px solid #334466",
                },
              }
            : null
        }
      >
        <Map mapStyle={MAP_STYLE} reuseMaps attributionControl={false} />
      </DeckGL>

      {/* Attribution */}
      <div
        style={{
          position: "absolute",
          bottom: 4,
          right: 8,
          fontSize: 10,
          color: "rgba(255,255,255,0.35)",
          pointerEvents: "none",
        }}
      >
        © CartoDB · © OpenStreetMap contributors
      </div>
    </div>
  );
}
