import { useRef, useEffect, useCallback } from "react";
import { createRoot, type Root } from "react-dom/client";
import maplibregl from "maplibre-gl";
import { Button, Text } from "@coe/design-system";
import { useEntitiesStore } from "../../../stores/entitiesStore";
import { getEntityType } from "../../../data/entityCatalog";
import type { Entity } from "../../../stores/entitiesStore";

interface MarkerData {
  entity: Entity;
  marker: maplibregl.Marker;
}

const ICON_PATHS: Record<string, string> = {
  Building2:
    '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18"/><path d="M6 22H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h2"/><path d="M18 22h2a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-2"/><path d="M10 12h4"/><path d="M10 8h4"/><path d="M14 21v-3a2 2 0 0 0-4 0v3"/>',
  CreditCard:
    '<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>',
  Shield:
    '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  Users:
    '<circle cx="9" cy="7" r="4"/><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.128a4 4 0 0 1 0 7.744"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/>',
  Truck:
    '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
  Banknote:
    '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>',
  Package:
    '<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><polyline points="3.29 7 12 12 20.71 7"/><path d="m7.5 4.27 9 5.15"/>',
  PackageOpen:
    '<path d="M12 22v-9"/><path d="M15.17 2.21a1.67 1.67 0 0 1 1.63 0L21 4.57a1.93 1.93 0 0 1 0 3.36L8.82 14.79a1.655 1.655 0 0 1-1.64 0L3 12.43a1.93 1.93 0 0 1 0-3.36z"/><path d="M20 13v3.87a2.06 2.06 0 0 1-1.11 1.83l-6 3.08a1.93 1.93 0 0 1-1.78 0l-6-3.08A2.06 2.06 0 0 1 4 16.87V13"/><path d="M21 12.43a1.93 1.93 0 0 0 0-3.36L8.83 2.2a1.64 1.64 0 0 0-1.63 0L3 4.57a1.93 1.93 0 0 0 0 3.36l12.18 6.86a1.636 1.636 0 0 0 1.63 0z"/>',
};

function getIconSvg(iconName: string): string {
  const paths = ICON_PATHS[iconName] || ICON_PATHS.Building2;
  return `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
}

function extractCoords(entity: Entity): { lat: number; lng: number } | null {
  const c = entity.metadata?.coordenadas;
  if (!c) return null;
  const lat = typeof c.lat === "number" ? c.lat : parseFloat(c.lat);
  const lng = typeof c.lng === "number" ? c.lng : parseFloat(c.lng);
  if (isNaN(lat) || isNaN(lng)) return null;
  return { lat, lng };
}

function createPinElement(color: string, iconSvg: string): HTMLDivElement {
  const el = document.createElement("div");
  el.style.cssText = `
    width:28px; height:28px; border-radius:50%;
    background:${color}; border:2.5px solid #fff;
    box-shadow:0 2px 5px rgba(0,0,0,.3);
    cursor:pointer; display:flex; align-items:center; justify-content:center;
    transition:box-shadow .15s;
  `;
  el.innerHTML = iconSvg;
  el.addEventListener("mouseenter", () => {
    el.style.boxShadow = "0 3px 10px rgba(0,0,0,.45)";
  });
  el.addEventListener("mouseleave", () => {
    el.style.boxShadow = el.dataset.selected === "true"
      ? "0 0 0 4px rgba(34,197,94,0.5), 0 2px 6px rgba(0,0,0,0.3)"
      : "0 2px 5px rgba(0,0,0,.3)";
  });
  return el;
}

export function useMapMarkers(
  mapRef: React.MutableRefObject<maplibregl.Map | null>,
  selectedEntityId: string | null,
) {
  const entities = useEntitiesStore((s) => s.entities);
  const markersRef = useRef<MarkerData[]>([]);
  const popupRef = useRef<{ popup: maplibregl.Popup; root: Root } | null>(null);

  const closePopup = useCallback(() => {
    const current = popupRef.current;
    if (!current) return;
    try { current.root.unmount(); } catch { /* already unmounted */ }
    try { current.popup.remove(); } catch { /* already removed */ }
    popupRef.current = null;
  }, []);

  const buildMarkers = useCallback((map: maplibregl.Map) => {
    markersRef.current.forEach((m) => m.marker.remove());
    markersRef.current = [];
    closePopup();

    const candidates: MarkerData[] = [];

    for (const entity of entities) {
      const coords = extractCoords(entity);
      if (!coords) continue;

      const tipo = getEntityType(entity.nivel);
      const color = tipo?.color ?? "#6B7280";
      const iconSvg = getIconSvg(tipo?.icono ?? "");
      const pinEl = createPinElement(color, iconSvg);

      const marker = new maplibregl.Marker({ element: pinEl })
        .setLngLat([coords.lng, coords.lat])
        .addTo(map);

      pinEl.addEventListener("click", (e) => {
        e.stopPropagation();

        const sameEntity = popupRef.current && pinEl.dataset.entityId === entity.id;
        closePopup();
        if (sameEntity) return;

        pinEl.dataset.entityId = entity.id;

        const container = document.createElement("div");
        container.style.cssText = "padding:8px 4px;min-width:180px;";

        const popup = new maplibregl.Popup({
          offset: 18,
          closeButton: false,
          closeOnClick: false,
        })
          .setDOMContent(container)
          .setLngLat([coords.lng, coords.lat])
          .addTo(map);

        const root = createRoot(container);
        root.render(
          <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
            <div>
              <Text variant="body" as="span" style={{ fontWeight:600, fontSize:"14px" }}>
                {entity.nombre}
              </Text>
              <Text variant="small" as="p" style={{ color:"#6B7280", marginTop:2, fontSize:"12px" }}>
                {entity.codigo} &middot; {tipo?.etiqueta ?? entity.nivel}
              </Text>
            </div>
            <Button variant="outline" size="sm" onClick={() => {}}>
              Ver detalles
            </Button>
          </div>
        );

        popupRef.current = { popup, root };
      });

      candidates.push({ entity, marker });
    }

    markersRef.current = candidates;
  }, [entities, closePopup]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (map.loaded()) {
      buildMarkers(map);
    } else {
      map.once("load", () => buildMarkers(map));
    }

    const onClick = () => closePopup();
    map.on("click", onClick);

    return () => {
      map.off("click", onClick);
      markersRef.current.forEach((m) => m.marker.remove());
      markersRef.current = [];
      closePopup();
    };
  }, [mapRef, buildMarkers, closePopup]);

  useEffect(() => {
    for (const { entity, marker } of markersRef.current) {
      const el = marker.getElement();
      if (entity.id === selectedEntityId) {
        el.dataset.selected = "true";
        el.style.boxShadow = "0 0 0 4px rgba(34,197,94,0.5), 0 2px 6px rgba(0,0,0,0.3)";
        el.style.zIndex = "10";
      } else {
        el.dataset.selected = "false";
        el.style.boxShadow = "0 2px 5px rgba(0,0,0,0.3)";
        el.style.zIndex = "";
      }
    }
  }, [selectedEntityId]);
}
