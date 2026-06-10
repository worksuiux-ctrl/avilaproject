import { useState, useMemo, useRef, useEffect } from "react";
import { ChevronRight, AlertTriangle, Search, X, Filter } from "lucide-react";
import { Checkbox } from "@coe/design-system";
import { useEntitiesStore, type Entity } from "@stores/entitiesStore";
import { ENTITY_TYPES, getEntityType } from "@data/entityCatalog";
import { isEntityOperable } from "@data/entityRules";

const ICON_MAP: Record<string, string> = {
  FolderTree: "\u{1F333}",
  Building2: "\u{1F3E2}",
  CreditCard: "\u{1F0CF}",
  Safe: "\u{1F6E1}",
  Package: "\u{1F4E6}",
  Truck: "\u{1F69A}",
  PackageOpen: "\u{1F4E2}",
  Users: "\u{1F465}",
  Banknote: "\u{1F4B5}",
};

function TreeNode({ entity, depth, allEntities, hiddenLevels }: { entity: Entity; depth: number; allEntities: Entity[]; hiddenLevels: Set<string> }) {
  const { selectedId, expandedIds, selectEntity, toggleExpand, getChildren } = useEntitiesStore();
  const children = getChildren(entity.id).filter((e) => !hiddenLevels.has(e.nivel));
  const hasChildren = children.length > 0;
  const isExpanded = expandedIds.has(entity.id);
  const isSelected = selectedId === entity.id;
  const tipo = getEntityType(entity.nivel);
  const icono = ICON_MAP[tipo?.icono ?? ""] ?? "\u{2022}";
  const operable = useMemo(() => isEntityOperable(entity, allEntities), [entity, allEntities]);

  return (
    <>
      <button
        className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded-corner-m text-left text-[13px] transition-colors ${
          isSelected
            ? "bg-[var(--color-verde-100)] text-white font-semibold"
            : "text-[var(--color-neutro-700)] hover:bg-[var(--color-neutro-100)]"
        }`}
        style={{ paddingLeft: `${12 + depth * 20}px` }}
        onClick={() => selectEntity(entity.id)}
      >
        <span
          className={`shrink-0 w-4 h-4 flex items-center justify-center transition-transform ${isExpanded ? "rotate-90" : ""}`}
          onClick={(e) => { e.stopPropagation(); if (hasChildren) toggleExpand(entity.id); }}
        >
          {hasChildren ? <ChevronRight className="w-3.5 h-3.5" /> : <span className="w-3.5" />}
        </span>
        {!operable && <AlertTriangle className="w-3 h-3 text-red-400 shrink-0" />}
        <span className="shrink-0">{icono}</span>
        <span className={`truncate ${!operable ? "text-red-400" : ""}`}>{entity.nombre}</span>
        <span className="ml-auto text-[11px] opacity-60 shrink-0">{entity.codigo}</span>
      </button>
      {hasChildren && isExpanded && children.map((child) => (
        <TreeNode key={child.id} entity={child} depth={depth + 1} allEntities={allEntities} hiddenLevels={hiddenLevels} />
      ))}
    </>
  );
}

function matchEntity(e: Entity, query: string): boolean {
  const q = query.toLowerCase();
  return e.nombre.toLowerCase().includes(q) || e.codigo.toLowerCase().includes(q);
}

const UNIDADES_LEVELS = ENTITY_TYPES
  .filter((t) => t.nivel !== "Grupos" && t.nivel !== "Monedas")
  .map((t) => t.nivel);

export function EntityTree() {
  const entities = useEntitiesStore((s) => s.entities);
  const [query, setQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [hiddenLevels, setHiddenLevels] = useState<Set<string>>(new Set());
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    }
    if (filterOpen) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [filterOpen]);

  function toggleLevel(nivel: string) {
    setHiddenLevels((prev) => {
      const next = new Set(prev);
      if (next.has(nivel)) next.delete(nivel);
      else next.add(nivel);
      return next;
    });
  }

  function entityVisible(e: Entity): boolean {
    return !hiddenLevels.has(e.nivel);
  }

  function ancestorsVisible(e: Entity): boolean {
    let pid = e.padreId;
    while (pid) {
      const p = entities.find((x) => x.id === pid);
      if (!p || hiddenLevels.has(p.nivel)) return false;
      pid = p.padreId;
    }
    return true;
  }

  const rootIds = useMemo(() => {
    if (!query.trim()) {
      return entities.filter((e) => e.padreId === null).map((e) => e.id);
    }
    const matched = new Set<string>();
    entities
      .filter((e) => matchEntity(e, query))
      .forEach((e) => {
        matched.add(e.id);
        let pid = e.padreId;
        while (pid) {
          matched.add(pid);
          const parent = entities.find((p) => p.id === pid);
          pid = parent?.padreId ?? null;
        }
      });
    return Array.from(matched);
  }, [entities, query]);

  return (
    <div>
      <div className="flex items-center gap-1 mb-2 px-1">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-neutro-400)]" />
          <input
            className="w-full pl-8 pr-7 py-1.5 text-[13px] border border-[var(--color-neutro-200)] rounded-corner-m bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-verde-100)]/30"
            placeholder="Buscar..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-corner-m hover:bg-[var(--color-neutro-100)] text-[var(--color-neutro-400)]"
              onClick={() => setQuery("")}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div ref={filterRef} className="relative">
          <button
            className={`p-1.5 rounded-corner-m border transition-colors ${
              hiddenLevels.size > 0
                ? "bg-[var(--color-verde-100)] text-white border-[var(--color-verde-100)]"
                : "bg-white text-[var(--color-neutro-400)] border-[var(--color-neutro-200)] hover:bg-[var(--color-neutro-100)]"
            }`}
            onClick={() => setFilterOpen(!filterOpen)}
            title="Filtrar por tipo"
          >
            <Filter className="w-3.5 h-3.5" />
          </button>
          {filterOpen && (
            <div className="absolute top-full right-0 mt-1 w-44 bg-white border border-[var(--color-neutro-200)] rounded-corner-m shadow-lg z-20 p-2">
              <p className="text-[11px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide mb-1.5 px-1">
                Tipos de entidad
              </p>
              {UNIDADES_LEVELS.map((nivel) => {
                const t = ENTITY_TYPES.find((x) => x.nivel === nivel);
                const checked = !hiddenLevels.has(nivel);
                return (
                  <div key={nivel} className="px-1 py-0.5">
                    <Checkbox
                      label={t?.etiqueta ?? nivel}
                      checked={checked}
                      onChange={() => toggleLevel(nivel)}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <div className="space-y-0.5">
        {query.trim()
          ? entities
              .filter((e) => rootIds.includes(e.id) && entityVisible(e) && ancestorsVisible(e))
              .map((e) => {
                let depth = 0;
                let pid = e.padreId;
                const seen = new Set<string>([e.id]);
                while (pid && !seen.has(pid)) {
                  seen.add(pid);
                  depth++;
                  pid = entities.find((p) => p.id === pid)?.padreId ?? null;
                }
                return <TreeNode key={e.id} entity={e} depth={depth} allEntities={entities} hiddenLevels={hiddenLevels} />;
              })
          : entities
              .filter((e) => e.padreId === null && entityVisible(e))
              .map((root) => (
                <TreeNode key={root.id} entity={root} depth={0} allEntities={entities} hiddenLevels={hiddenLevels} />
              ))}
        {rootIds.length === 0 && (
          <p className="text-[13px] text-[var(--color-neutro-400)] p-4 text-center">
            {query ? "Sin resultados" : hiddenLevels.size === UNIDADES_LEVELS.length ? "Todos los tipos están ocultos" : "No hay entidades"}
          </p>
        )}
      </div>
    </div>
  );
}
