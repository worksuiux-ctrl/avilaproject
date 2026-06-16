import { useState, useMemo } from "react";
import { Badge, Input } from "@coe/design-system";
import { useGruposStore, type Grupo } from "../../../stores/gruposStore";
import { MapPin, Search, ChevronRight, Globe } from "lucide-react";

const SUBTIPO_COLORS: Record<string, "success" | "info" | "warning" | "solid" | "outline" | "error"> = {
  Continente: "success",
  Zona: "info",
  "Estado/Provincia": "warning",
  Ciudad: "solid",
};

function SubtipoBadge({ subtipo }: { subtipo: string }) {
  const variant = SUBTIPO_COLORS[subtipo] || "outline";
  return <Badge variant={variant} size="sm">{subtipo}</Badge>;
}

interface GrupoNodeProps {
  grupo: Grupo;
  allGeograficos: Grupo[];
  selectedId: string | null;
  onSelect: (g: Grupo) => void;
  depth: number;
  query: string;
}

function GrupoNode({ grupo, allGeograficos, selectedId, onSelect, depth, query }: GrupoNodeProps) {
  const { expandedIds, toggleExpand, getChildren } = useGruposStore();
  const children = getChildren(grupo.id);
  const isSelected = selectedId === grupo.id;
  const hasChildren = children.length > 0;
  const isExpanded = query.trim() ? true : expandedIds.has(grupo.id);

  const filteredChildren = useMemo(() => {
    if (!query.trim()) return children;
    const q = query.toLowerCase();
    const matchSet = new Set<string>();
    const collect = (g: Grupo) => {
      if (g.nombre.toLowerCase().includes(q) || g.codigo.toLowerCase().includes(q)) matchSet.add(g.id);
      getChildren(g.id).forEach(collect);
    };
    children.forEach(collect);
    return children.filter((c) => matchSet.has(c.id));
  }, [children, query, getChildren]);

  return (
    <div>
      <button
        onClick={() => onSelect(grupo)}
        className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded-corner-m text-left text-[13px] transition-colors ${
          isSelected
            ? "bg-[var(--color-verde-100)] text-white font-semibold"
            : "text-[var(--color-neutro-700)] hover:bg-[var(--color-neutro-100)]"
        }`}
        style={{ paddingLeft: `${12 + depth * 20}px` }}
      >
        <span
          className={`shrink-0 w-4 h-4 flex items-center justify-center transition-transform ${isExpanded ? "rotate-90" : ""}`}
          onClick={(e) => { e.stopPropagation(); if (hasChildren) toggleExpand(grupo.id); }}
        >
          {hasChildren ? <ChevronRight className="w-3.5 h-3.5" /> : <span className="w-3.5" />}
        </span>
        <Globe className="w-4 h-4 shrink-0" style={{ color: isSelected ? "#fff" : "#22c55e" }} />
        <span className="flex-1 min-w-0 truncate">{grupo.nombre}</span>
        <SubtipoBadge subtipo={grupo.subtipo} />
      </button>
      {hasChildren && isExpanded && (
        <div className="space-y-0.5">
          {filteredChildren.map((child) => (
            <GrupoNode
              key={child.id}
              grupo={child}
              allGeograficos={allGeograficos}
              selectedId={selectedId}
              onSelect={onSelect}
              depth={depth + 1}
              query={query}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface GrupoLegendProps {
  selectedGroup: Grupo | null;
  onSelectGrupo: (grupo: Grupo) => void;
}

export function GrupoLegend({ selectedGroup, onSelectGrupo }: GrupoLegendProps) {
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
      if (g.nombre.toLowerCase().includes(q) || g.codigo.toLowerCase().includes(q)) matched.add(g.id);
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
          placeholder="Buscar grupo..."
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
              depth={0}
              query={search}
            />
          ))
        )}
      </div>
    </div>
  );
}
