import { useRef, useEffect } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Grupo } from "../../../stores/gruposStore";
import { useMapMarkers } from "./useMapMarkers";

const VENEZUELA_CENTER: [number, number] = [-66.5, 6.5];
const DEFAULT_ZOOM = 4.9;

const GEOJSON_URL = "/data/venezuela-estados.geojson";

const COE_GREEN = "#22c55e";
const COE_HOVER = "#16a34a";
const COE_BG = "#ffffff";
const COE_BORDER = "#e2e8f0";

function createCoeButton(innerHtml: string, title: string, onClick: () => void): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.className = "maplibregl-ctrl-icon";
  btn.style.cssText = `
    width:36px; height:36px; display:flex; align-items:center; justify-content:center;
    background:${COE_BG}; border:none; cursor:pointer; transition:background .15s;
    color:${COE_GREEN};
  `;
  btn.innerHTML = innerHtml;
  btn.title = title;
  btn.onmouseenter = () => { btn.style.background = "#f0fdf4"; };
  btn.onmouseleave = () => { btn.style.background = COE_BG; };
  btn.onclick = onClick;
  return btn;
}

function createCoeControlGroup(buttons: HTMLButtonElement[]): HTMLDivElement {
  const div = document.createElement("div");
  div.className = "maplibregl-ctrl";
  div.style.cssText = `
    display:flex; flex-direction:column; border-radius:8px; overflow:hidden;
    box-shadow:0 2px 8px rgba(0,0,0,.12); margin:16px;
  `;
  buttons.forEach((b, i) => {
    if (i > 0) {
      b.style.borderTop = `1px solid ${COE_BORDER}`;
    }
    div.appendChild(b);
  });
  return div;
}

function getZoomForSubtipo(subtipo: string): number {
  switch (subtipo) {
    case "Continente": return 4;
    case "País": return 5;
    case "Zona": return 6.5;
    case "Estado/Provincia": return 7.5;
    case "Municipio": return 9;
    case "Ciudad": return 10;
    default: return 6;
  }
}

export interface FlyToTarget {
  lng: number;
  lat: number;
  zoom?: number;
  entityId?: string;
}

interface InteractiveMapProps {
  selectedGroup: Grupo | null;
  flyToTarget?: FlyToTarget | null;
  selectedEntityId?: string | null;
}

export function InteractiveMap({ selectedGroup, flyToTarget, selectedEntityId }: InteractiveMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      center: VENEZUELA_CENTER,
      zoom: DEFAULT_ZOOM,
      attributionControl: false,
    });

    class CoeNavControl implements maplibregl.IControl {
      private container!: HTMLDivElement;

      onAdd() {
        const zoomIn = createCoeButton(
          `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>`,
          "Acercar",
          () => map.zoomIn({ duration: 300 }),
        );

        const zoomOut = createCoeButton(
          `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>`,
          "Alejar",
          () => map.zoomOut({ duration: 300 }),
        );

        const compass = createCoeButton(
          `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12,4 12,12 16,14"/><line x1="12" y1="2" x2="12" y2="4"/></svg>`,
          "Norte arriba",
          () => map.easeTo({ bearing: 0, duration: 600 }),
        );

        const home = createCoeButton(
          `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12L12 3l9 9"/><path d="M9 21V12h6v9"/></svg>`,
          "Vista general Venezuela",
          () => map.flyTo({ center: VENEZUELA_CENTER, zoom: DEFAULT_ZOOM, bearing: 0, pitch: 0, duration: 1000 }),
        );

        this.container = createCoeControlGroup([zoomIn, zoomOut, compass, home]);
        return this.container;
      }

      onRemove() { this.container.remove(); }
    }

    map.addControl(new CoeNavControl(), "top-right");

    map.on("load", () => {
      map.addSource("venezuela-estados", {
        type: "geojson",
        data: GEOJSON_URL,
      });

      map.addLayer({
        id: "estados-fill",
        type: "fill",
        source: "venezuela-estados",
        paint: {
          "fill-color": "transparent",
          "fill-opacity": 0.4,
        },
      });

      map.addLayer({
        id: "estados-outline",
        type: "line",
        source: "venezuela-estados",
        paint: {
          "line-color": "#475569",
          "line-width": 0.5,
        },
      });

      const popup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
      });

      map.on("mousemove", "estados-fill", (e) => {
        if (!e.features || !e.features[0]) return;
        const stateName = e.features[0].properties.shapeName;
        map.getCanvas().style.cursor = "pointer";
        map.setPaintProperty("estados-fill", "fill-color", [
          "case",
          ["==", ["get", "shapeName"], stateName],
          "#86efac",
          "transparent",
        ]);
        popup.setLngLat(e.lngLat).setHTML(`<strong>${stateName}</strong>`).addTo(map);
      });

      map.on("mouseleave", "estados-fill", () => {
        map.getCanvas().style.cursor = "";
        map.setPaintProperty("estados-fill", "fill-color", "transparent");
        popup.remove();
      });

      map.on("click", "estados-fill", (e) => {
        if (!e.features || !e.features[0]) return;
        const stateName = e.features[0].properties.shapeName;
        map.flyTo({ center: e.lngLat, zoom: 7.5, duration: 1000 });
        popup.setLngLat(e.lngLat).setHTML(`<strong>${stateName}</strong>`).addTo(map);
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useMapMarkers(mapRef, selectedEntityId ?? null);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedGroup?.coordenadas) return;
    const lng = parseFloat(selectedGroup.coordenadas.lng);
    const lat = parseFloat(selectedGroup.coordenadas.lat);
    if (isNaN(lng) || isNaN(lat)) return;
    map.flyTo({ center: [lng, lat], zoom: getZoomForSubtipo(selectedGroup.subtipo), duration: 1200 });
  }, [selectedGroup]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !flyToTarget) return;
    map.flyTo({ center: [flyToTarget.lng, flyToTarget.lat], zoom: flyToTarget.zoom ?? 12, duration: 1200 });
  }, [flyToTarget]);

  return (
    <div className="absolute inset-0 rounded-corner-m overflow-hidden">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
