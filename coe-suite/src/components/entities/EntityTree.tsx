import { useState, useMemo, useRef, useEffect } from "react";
import { ChevronRight, FolderOpen, AlertTriangle, Search, X, Filter, Circle } from "lucide-react";
import { Checkbox } from "@coe/design-system";
import { useEntitiesStore, type Entity } from "@stores/entitiesStore";
import { ENTITY_TYPES, getEntityType } from "@data/entityCatalog";
import { isEntityOperable } from "@data/entityRules";
import { EntityIcon } from "./entityIcons";

function groupKey(parentId: string, subtipo: string) {
  return `group-${parentId}-${subtipo}`;
}

function GroupHeader({ parentId, subtipo, count, depth }: { parentId: string; subtipo: string; count: number; depth: number }) {
  const { expandedIds, toggleExpand } = useEntitiesStore();
  const gkey = groupKey(parentId, subtipo);
  const isExpanded = expandedIds.has(gkey);
  const label = `${subtipo}s`;

  return (
    <div>
      <button
        className="w-full flex items-center gap-1.5 px-2 py-1 rounded-corner-m text-left text-[12px] font-semibold uppercase tracking-wider text-[var(--color-neutro-500)] hover:bg-[var(--color-neutro-100)] transition-colors"
        style={{ paddingLeft: `${12 + depth * 20}px` }}
        onClick={() => toggleExpand(gkey)}
      >
        <span className={`shrink-0 w-4 h-4 flex items-center justify-center transition-transform ${isExpanded ? "rotate-90" : ""}`}>
          <ChevronRight className="w-3 h-3" />
        </span>
        <FolderOpen className="w-4 h-4 shrink-0 text-[var(--color-neutro-400)]" />
        <span className="truncate">{label}</span>
        <span className="ml-auto text-[11px] opacity-60 shrink-0">{count}</span>
      </button>
    </div>
  );
}

function TreeNode({ entity, depth, allEntities, hiddenLevels }: { entity: Entity; depth: number; allEntities: Entity[]; hiddenLevels: Set<string> }) {
  const { selectedId, expandedIds, selectEntity, toggleExpand, getChildren } = useEntitiesStore();
  const children = getChildren(entity.id).filter((e) => !hiddenLevels.has(e.nivel));
  const hasChildren = children.length > 0;
  const isExpanded = expandedIds.has(entity.id);
  const isSelected = selectedId === entity.id;
  const tipo = getEntityType(entity.nivel);
  const operable = useMemo(() => isEntityOperable(entity, allEntities), [entity, allEntities]);

  const grouped = useMemo(() => {
    const order: Record<string, number> = {
      "Depósitos": 0,
      "Dispositivos": 1,
      "Oficinas": 2,
    };
    const subOrder: Record<string, number> = {
      "Bóveda": 0,
      "Caja": 1,
      "ATM": 2,
      "Taquilla": 3,
    };
    const sorted = [...children].sort((a, b) => {
      const nivA = order[a.nivel] ?? 99;
      const nivB = order[b.nivel] ?? 99;
      if (nivA !== nivB) return nivA - nivB;
      const subA = subOrder[a.subtipo] ?? 99;
      const subB = subOrder[b.subtipo] ?? 99;
      return subA - subB;
    });
    const groups: Record<string, Entity[]> = {};
    for (const child of sorted) {
      const key = child.subtipo ?? child.nivel;
      if (!groups[key]) groups[key] = [];
      groups[key].push(child);
    }
    return groups;
  }, [children]);

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
        {!operable && entity.nivel !== "Central Administrativa" && <AlertTriangle className="w-3 h-3 text-red-400 shrink-0" />}
        {entity.nivel === "Central Administrativa" && <Circle className="w-2 h-2 fill-[#0891b2] text-[#0891b2] shrink-0" />}
        <EntityIcon nivel={entity.nivel} subtipo={entity.subtipo} className="w-5 h-5 shrink-0" style={{ color: isSelected ? "#fff" : tipo?.color, strokeWidth: 2 }} />
        <span className={`truncate ${!operable && entity.nivel !== "Central Administrativa" ? "text-red-400" : ""}`}>{entity.nombre}</span>
        <span className="ml-auto text-[11px] opacity-60 shrink-0">{entity.codigo}</span>
      </button>
      {hasChildren && isExpanded && (
        <div className="space-y-0.5">
          {Object.entries(grouped).map(([key, group]) =>
            group.length > 1 ? (
              <GroupedChildren
                key={key}
                parentId={entity.id}
                subtipo={key}
                children={group}
                depth={depth + 1}
                allEntities={allEntities}
                hiddenLevels={hiddenLevels}
              />
            ) : (
              <TreeNode key={group[0].id} entity={group[0]} depth={depth + 1} allEntities={allEntities} hiddenLevels={hiddenLevels} />
            )
          )}
        </div>
      )}
    </>
  );
}

function GroupedChildren({
  parentId, subtipo, children: items, depth, allEntities, hiddenLevels,
}: {
  parentId: string; subtipo: string; children: Entity[]; depth: number; allEntities: Entity[]; hiddenLevels: Set<string>;
}) {
  const { expandedIds } = useEntitiesStore();
  const gkey = groupKey(parentId, subtipo);
  const isExpanded = expandedIds.has(gkey);

  return (
    <div className="space-y-0.5">
      <GroupHeader parentId={parentId} subtipo={subtipo} count={items.length} depth={depth} />
      {isExpanded && items.map((child) => (
        <TreeNode key={child.id} entity={child} depth={depth + 1} allEntities={allEntities} hiddenLevels={hiddenLevels} />
      ))}
    </div>
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
          : (() => {
              const internal = entities.filter((e) => e.padreId === null && entityVisible(e) && e.nivel !== "Entidad Bancaria");
              const external = entities.filter((e) => e.padreId === null && entityVisible(e) && e.nivel === "Entidad Bancaria");
              const grupos = internal.reduce<{ nivel: string; items: Entity[] }[]>((acc, e) => {
                const last = acc[acc.length - 1];
                if (last && last.nivel === e.nivel) last.items.push(e);
                else acc.push({ nivel: e.nivel, items: [e] });
                return acc;
              }, []);
              return (
                <>
                  {grupos.map((g) =>
                    g.items.length === 1 ? (
                      <TreeNode key={g.items[0].id} entity={g.items[0]} depth={0} allEntities={entities} hiddenLevels={hiddenLevels} />
                    ) : (
                      <div key={g.nivel} className="border-l-2 border-[var(--color-neutro-200)] ml-2 pl-2 space-y-0.5">
                        {g.items.map((root) => (
                          <TreeNode key={root.id} entity={root} depth={0} allEntities={entities} hiddenLevels={hiddenLevels} />
                        ))}
                      </div>
                    )
                  )}
                  {external.length > 0 && internal.length > 0 && (
                    <div className="border-t border-[var(--color-neutro-200)] my-3" />
                  )}
                  {external.length > 0 && (
                    <div className="px-2 py-1.5">
                      <p className="text-[11px] font-bold text-[var(--color-neutro-400)] uppercase tracking-wide flex items-center gap-1.5">
                        <Circle className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                        Externas
                      </p>
                    </div>
                  )}
                  {external.map((root) => (
                    <TreeNode key={root.id} entity={root} depth={0} allEntities={entities} hiddenLevels={hiddenLevels} />
                  ))}
                </>
              );
            })()}
        {rootIds.length === 0 && (
          <p className="text-[13px] text-[var(--color-neutro-400)] p-4 text-center">
            {query ? "Sin resultados" : hiddenLevels.size === UNIDADES_LEVELS.length ? "Todos los tipos están ocultos" : "No hay entidades"}
          </p>
        )}
      </div>
    </div>
  );
}
