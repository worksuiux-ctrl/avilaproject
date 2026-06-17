import { useRef, useEffect } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Grupo } from "../../../stores/gruposStore";

const VENEZUELA_CENTER: [number, number] = [-66.9036, 8.0];
const DEFAULT_ZOOM = 5.2;

const GEOJSON_URL = "/data/venezuela-estados.geojson";

const REGION_STATES: Record<string, string[]> = {
  Capital: ["Distrito Capital", "Miranda", "La Guaira"],
  Central: ["Aragua", "Carabobo", "Cojedes"],
  "Centro Occidental": ["Falcón", "Lara", "Portuguesa", "Yaracuy"],
  "Los Andes": ["Barinas", "Mérida", "Táchira", "Trujillo"],
  Oriente: ["Anzoátegui", "Monagas", "Sucre", "Nueva Esparta"],
  Guayana: ["Bolívar", "Amazonas", "Delta Amacuro"],
  Llanos: ["Apure", "Guárico"],
  Zuliana: ["Zulia"],
  Insular: ["Nueva Esparta", "Dependencias Federales"],
};

const GROUP_REGION_MAP: Record<string, string> = {
  "grp-2": "Capital",
  "grp-3": "Central",
  "grp-4": "Centro Occidental",
  "grp-5": "Zuliana",
  "grp-6": "Los Andes",
  "grp-7": "Llanos",
  "grp-8": "Oriente",
  "grp-9": "Guayana",
  "grp-10": "Insular",
};

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

function matchGroupToStates(group: Grupo): string[] {
  const key = GROUP_REGION_MAP[group.id];
  if (key) return REGION_STATES[key] ?? [];
  const match = Object.keys(REGION_STATES).find((r) =>
    group.nombre.toLowerCase().includes(r.toLowerCase()),
  );
  return match ? REGION_STATES[match] : [];
}

interface InteractiveMapProps {
  selectedGroup: Grupo | null;
}

export function InteractiveMap({ selectedGroup }: InteractiveMapProps) {
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
      bearingSnap: 0,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    class HomeControl implements maplibregl.IControl {
      private container!: HTMLDivElement;
      onAdd() {
        this.container = document.createElement("div");
        this.container.className = "maplibregl-ctrl maplibregl-ctrl-group";
        const btn = document.createElement("button");
        btn.className = "maplibregl-ctrl-icon";
        btn.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12L12 3l9 9"/><path d="M9 21V12h6v9"/></svg>`;
        btn.title = "Vista general Venezuela";
        btn.onclick = () => map.flyTo({ center: VENEZUELA_CENTER, zoom: DEFAULT_ZOOM, duration: 1000 });
        this.container.appendChild(btn);
        return this.container;
      }
      onRemove() { this.container.remove(); }
    }

    map.addControl(new HomeControl(), "top-right");

    map.on("load", () => {
      map.addSource("venezuela-estados", {
        type: "geojson",
        data: GEOJSON_URL,
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

      map.addLayer({
        id: "estados-fill",
        type: "fill",
        source: "venezuela-estados",
        paint: {
          "fill-color": "transparent",
          "fill-opacity": 0.4,
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

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getSource("venezuela-estados")) return;

    const regionLayerId = "estados-region";

    if (selectedGroup?.tipo !== "Geográfico") {
      if (map.getLayer(regionLayerId)) map.removeLayer(regionLayerId);
    } else {
      if (map.getLayer(regionLayerId)) map.removeLayer(regionLayerId);

      const layer: maplibregl.LayerSpecification = {
        id: regionLayerId,
        type: "fill",
        source: "venezuela-estados",
        paint: {
          "fill-color": "#93c5fd",
          "fill-opacity": 0.4,
        },
      };

      if (selectedGroup.subtipo !== "Continente" && selectedGroup.subtipo !== "País") {
        const states = matchGroupToStates(selectedGroup);
        if (states.length === 0) return;
        layer.filter = ["in", ["get", "shapeName"], ["literal", states]];
      }

      map.addLayer(layer, "estados-fill");
    }

    if (!selectedGroup?.coordenadas) return;
    const lng = parseFloat(selectedGroup.coordenadas.lng);
    const lat = parseFloat(selectedGroup.coordenadas.lat);
    if (isNaN(lng) || isNaN(lat)) return;
    map.flyTo({ center: [lng, lat], zoom: getZoomForSubtipo(selectedGroup.subtipo), duration: 1200 });
  }, [selectedGroup]);

  return (
    <div className="absolute inset-0 rounded-corner-m overflow-hidden">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
