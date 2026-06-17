import { useState, useMemo, useCallback } from "react";
import { Input } from "@coe/design-system";
import { useGruposStore, type Grupo } from "../../../stores/gruposStore";
import { useEntitiesStore } from "../../../stores/entitiesStore";
import { MapPin, Search, ChevronRight, Globe } from "lucide-react";
import { EntityIcon } from "../../../components/entities/entityIcons";
import { getEntityType } from "../../../data/entityCatalog";
import type { FlyToTarget } from "./InteractiveMap";

interface GrupoNodeProps {
  grupo: Grupo;
  allGeograficos: Grupo[];
  selectedId: string | null;
  onSelect: (g: Grupo) => void;
  onFlyTo: (target: FlyToTarget) => void;
  selectedMemberId: string | null;
  onSelectMember: (id: string, name: string) => void;
  depth: number;
  query: string;
}

function memberMatches(miembro: Grupo["miembros"][0], q: string): boolean {
  return (
    miembro.entityNombre.toLowerCase().includes(q) ||
    miembro.entityCodigo.toLowerCase().includes(q) ||
    miembro.entityNivel.toLowerCase().includes(q) ||
    miembro.entitySubtipo.toLowerCase().includes(q)
  );
}

function GrupoNode({ grupo, allGeograficos, selectedId, onSelect, onFlyTo, selectedMemberId, onSelectMember, depth, query }: GrupoNodeProps) {
  const { expandedIds, toggleExpand, getChildren } = useGruposStore();
  const children = getChildren(grupo.id);
  const isSelected = selectedId === grupo.id;
  const hasExpandable = children.length > 0 || grupo.miembros.length > 0;
  const isExpanded = query.trim() ? true : expandedIds.has(grupo.id);

  const filteredChildren = useMemo(() => {
    if (!query.trim()) return children;
    const q = query.toLowerCase();
    const matchSet = new Set<string>();
    const collect = (g: Grupo) => {
      const memberMatch = g.miembros.some((m) => memberMatches(m, q));
      if (g.nombre.toLowerCase().includes(q) || g.codigo.toLowerCase().includes(q) || memberMatch) matchSet.add(g.id);
      getChildren(g.id).forEach(collect);
    };
    children.forEach(collect);
    return children.filter((c) => matchSet.has(c.id));
  }, [children, query, getChildren]);

  const filteredMembers = useMemo(() => {
    if (!query.trim()) return grupo.miembros;
    const q = query.toLowerCase();
    return grupo.miembros.filter((m) => memberMatches(m, q));
  }, [grupo.miembros, query]);

  const handleFlyToMember = useCallback((entityId: string, entityName: string) => {
    const entity = useEntitiesStore.getState().entities.find((e) => e.id === entityId);
    const coords = entity?.metadata?.coordenadas;
    if (!coords) return;
    const lat = typeof coords.lat === "number" ? coords.lat : parseFloat(coords.lat);
    const lng = typeof coords.lng === "number" ? coords.lng : parseFloat(coords.lng);
    if (isNaN(lat) || isNaN(lng)) return;
    onSelectMember(entityId, entityName);
    onFlyTo({ lat, lng, zoom: 14, entityId, entityName });
  }, [onFlyTo, onSelectMember]);

  return (
    <div>
      <button
        onClick={() => {
          onSelect(grupo);
          if (hasExpandable && !isExpanded) toggleExpand(grupo.id);
        }}
        className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded-corner-m text-left text-[13px] transition-colors ${
          isSelected
            ? "bg-[var(--color-verde-100)] text-white font-semibold"
            : "text-[var(--color-neutro-700)] hover:bg-[var(--color-neutro-100)]"
        }`}
        style={{ paddingLeft: `${12 + depth * 20}px` }}
      >
        <span
          className={`shrink-0 w-4 h-4 flex items-center justify-center transition-transform ${isExpanded ? "rotate-90" : ""}`}
          onClick={(e) => { e.stopPropagation(); if (hasExpandable) toggleExpand(grupo.id); }}
        >
          {hasExpandable ? <ChevronRight className="w-3.5 h-3.5" /> : <span className="w-3.5" />}
        </span>
        <Globe className="w-4 h-4 shrink-0" style={{ color: isSelected ? "#fff" : "#22c55e" }} />
        <span className="flex-1 min-w-0 truncate">{grupo.nombre}</span>
      </button>

      {hasExpandable && isExpanded && (
        <div className="space-y-0.5">
          {filteredChildren.map((child) => (
            <GrupoNode
              key={child.id}
              grupo={child}
              allGeograficos={allGeograficos}
              selectedId={selectedId}
              onSelect={onSelect}
              onFlyTo={onFlyTo}
              selectedMemberId={selectedMemberId}
              onSelectMember={onSelectMember}
              depth={depth + 1}
              query={query}
            />
          ))}

          {filteredMembers.length > 0 && (
            <>
              {children.length > 0 && (
                <div
                  className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-neutro-500)]"
                  style={{ paddingLeft: `${12 + (depth + 1) * 20}px` }}
                >
                  <span className="w-3.5" />
                  <span>Unidades ({filteredMembers.length})</span>
                </div>
              )}
              {filteredMembers.map((miembro) => {
                const tipo = getEntityType(miembro.entityNivel);
                const isMemberSelected = selectedMemberId === miembro.entityId;
                return (
                  <div
                    key={miembro.entityId}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-corner-m text-[13px] cursor-pointer transition-colors ${
                      isMemberSelected
                        ? "bg-[var(--color-verde-100)] text-white font-semibold"
                        : "text-[var(--color-neutro-700)] hover:bg-[var(--color-neutro-100)]"
                    }`}
                    style={{ paddingLeft: `${12 + (depth + (children.length > 0 ? 2 : 1)) * 20}px` }}
                    onClick={() => handleFlyToMember(miembro.entityId, miembro.entityNombre)}
                    title="Ver en el mapa"
                  >
                    <EntityIcon
                      nivel={miembro.entityNivel}
                      subtipo={miembro.entitySubtipo}
                      className="w-4 h-4 shrink-0"
                      style={{ color: isMemberSelected ? "#fff" : tipo?.color ?? "#6B7280" }}
                    />
                    <span className="flex-1 min-w-0 truncate">{miembro.entityNombre}</span>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}

interface GrupoLegendProps {
  selectedGroup: Grupo | null;
  onSelectGrupo: (grupo: Grupo) => void;
  onFlyTo: (target: FlyToTarget) => void;
  selectedMemberId: string | null;
  onSelectMember: (id: string, name: string) => void;
}

export function GrupoLegend({ selectedGroup, onSelectGrupo, onFlyTo, selectedMemberId, onSelectMember }: GrupoLegendProps) {
  const grupos = useGruposStore((s) => s.grupos);
  const [search, setSearch] = useState("");

  const geograficos = useMemo(
    () => grupos.filter((g) => g.tipo === "Geográfico").sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [grupos]
  );

  const roots = useMemo(() => {
    if (!search.trim()) return geograficos.filter((g) => g.padreId === null);
    const q = search.toLowerCase();
    const matched = new Set<string>();
    const walk = (g: Grupo) => {
      const memberMatch = g.miembros.some((m) => memberMatches(m, q));
      if (g.nombre.toLowerCase().includes(q) || g.codigo.toLowerCase().includes(q) || memberMatch) matched.add(g.id);
      geograficos.filter((c) => c.padreId === g.id).forEach(walk);
    };
    geograficos.filter((g) => g.padreId === null).forEach(walk);
    const hasMatch = (g: Grupo): boolean => matched.has(g.id) || geograficos.filter((c) => c.padreId === g.id).some(hasMatch);
    return geograficos.filter((g) => g.padreId === null && hasMatch(g));
  }, [geograficos, search]);

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 pt-3 pb-2 shrink-0 border-b border-[var(--color-neutro-200)]">
        <div className="flex items-center gap-2 mb-2">
          <MapPin size={16} className="text-[var(--color-verde-100)] shrink-0" />
          <span className="text-[13px] font-semibold text-[var(--color-neutro-800)] flex-1 min-w-0 truncate">Grupos Geográficos</span>
          <span className="text-[11px] text-[var(--color-neutro-400)] shrink-0">
            ({roots.length})
          </span>
        </div>
        <Input
          prefix={<Search className="w-4 h-4" />}
          placeholder="Buscar grupo, unidad, tipo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {roots.length === 0 ? (
          <p className="text-[13px] text-[var(--color-neutro-400)] text-center py-6">
            {search ? "Sin resultados" : "No hay grupos geográficos disponibles"}
          </p>
        ) : (
          roots.map((root) => (
            <GrupoNode
              key={root.id}
              grupo={root}
              allGeograficos={geograficos}
              selectedId={selectedGroup?.id ?? null}
              onSelect={onSelectGrupo}
              onFlyTo={onFlyTo}
              selectedMemberId={selectedMemberId}
              onSelectMember={onSelectMember}
              depth={0}
              query={search}
            />
          ))
        )}
      </div>
    </div>
  );
}
