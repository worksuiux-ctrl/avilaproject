import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, RotateCcw, EyeOff, Pencil, ArrowLeft, ArrowRight, Settings2, Sigma, X } from "lucide-react";
import { useGruposStore } from "@stores/gruposStore";
import type { Reporte, ReporteColumn, ReporteRow, ColumnAggregation, GroupByConfig, AggregationType } from "../data/reportesTypes";
import { ColumnManager } from "./ColumnManager";
import { AggregationBar } from "./AggregationBar";

interface ReportPreviewProps {
  report: Reporte;
  columnAggregations: ColumnAggregation[];
  groupByConfig: GroupByConfig;
  onColumnAggregationsChange: (aggs: ColumnAggregation[]) => void;
  onGroupByConfigChange: (config: GroupByConfig) => void;
}

const FILTER_CLASS = "w-full h-[34px] px-2.5 py-1.5 text-[12px] border border-[var(--color-neutro-200)] rounded-corner-m bg-white focus:outline-none focus:ring-1 focus:ring-[var(--color-verde-100)]/30 box-border";

function calcAggregation(
  type: AggregationType,
  numericValues: number[],
  _allRows: ReporteRow[],
  _key: string,
  rawValues?: unknown[]
): number | string {
  switch (type) {
    case "sum":
      return numericValues.reduce((a, b) => a + b, 0);
    case "avg": {
      if (numericValues.length === 0) return "";
      const sum = numericValues.reduce((a, b) => a + b, 0);
      return Math.round((sum / numericValues.length) * 100) / 100;
    }
    case "count":
      return rawValues ? rawValues.length : numericValues.length;
    case "max": {
      if (numericValues.length === 0) return "";
      return Math.max(...numericValues);
    }
    case "min": {
      if (numericValues.length === 0) return "";
      return Math.min(...numericValues);
    }
    case "countUnique": {
      if (rawValues) return new Set(rawValues.map((v) => String(v))).size;
      return new Set(numericValues).size;
    }
    default:
      return "";
  }
}

function getUniqueValues(data: ReporteRow[], key: string): string[] {
  const values = new Set<string>();
  data.forEach((row) => {
    const v = row[key];
    if (v != null && v !== "") values.add(String(v));
  });
  return Array.from(values).sort();
}

export function ReportPreview({
  report,
  columnAggregations,
  groupByConfig,
  onColumnAggregationsChange,
  onGroupByConfigChange,
}: ReportPreviewProps) {
  const [columns, setColumns] = useState<ReporteColumn[]>(() =>
    report.columns.map((c) => ({ ...c }))
  );
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [showColumnManager, setShowColumnManager] = useState(false);
  const [showAggregationTools, setShowAggregationTools] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [popoverColumn, setPopoverColumn] = useState<string | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const dragSourceRef = useRef<string | null>(null);
  const dropTargetRef = useRef<string | null>(null);

  const isPlantilla = report.categoria === "plantilla";

  const grupos = useGruposStore((s) => s.grupos);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setPopoverColumn(null);
      }
    }
    if (popoverColumn) {
      document.addEventListener("mousedown", onMouseDown);
    }
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [popoverColumn]);

  useEffect(() => {
    setColumns(report.columns.map((c) => ({ ...c })));
    setSortKey(null);
    setSortDir("asc");
    setFilters({});
    setSelectedGroupId("");
    setShowColumnManager(false);
    setShowAggregationTools(false);
    setPopoverColumn(null);
    setEditingColumn(null);
    setEditValue("");
  }, [report.id]);

  const sortedFilteredData = useMemo(() => {
    let data = [...report.data];

    const fromKeys = Object.keys(filters).filter((k) => k.endsWith("__from"));
    const toKeys = Object.keys(filters).filter((k) => k.endsWith("__to"));

    Object.entries(filters).forEach(([key, val]) => {
      if (!val.trim()) return;
      if (key.endsWith("__from") || key.endsWith("__to")) return;
      data = data.filter((row) => {
        const cell = String(row[key] ?? "").toLowerCase();
        return cell.includes(val.toLowerCase());
      });
    });

    fromKeys.forEach((k) => {
      const colKey = k.replace("__from", "");
      const fromVal = filters[k];
      if (!fromVal) return;
      data = data.filter((row) => {
        const cell = String(row[colKey] ?? "");
        return cell >= fromVal;
      });
    });

    toKeys.forEach((k) => {
      const colKey = k.replace("__to", "");
      const toVal = filters[k];
      if (!toVal) return;
      data = data.filter((row) => {
        const cell = String(row[colKey] ?? "");
        return cell <= toVal;
      });
    });

    if (selectedGroupId) {
      const selectedGroup = grupos.find((g) => g.id === selectedGroupId);
      if (selectedGroup) {
        const memberTokens = new Set(
          selectedGroup.miembros.flatMap((m) => [m.entityId.toLowerCase(), m.entityNombre.toLowerCase(), m.entityCodigo.toLowerCase()])
        );
        data = data.filter((row) =>
          Object.values(row).some((val) => {
            if (val == null || typeof val === "boolean") return false;
            return memberTokens.has(String(val).toLowerCase());
          })
        );
      }
    }

    if (sortKey) {
      data.sort((a, b) => {
        const va = a[sortKey];
        const vb = b[sortKey];
        if (va == null) return 1;
        if (vb == null) return -1;
        if (typeof va === "number" && typeof vb === "number") {
          return sortDir === "asc" ? va - vb : vb - va;
        }
        return sortDir === "asc"
          ? String(va).localeCompare(String(vb))
          : String(vb).localeCompare(String(va));
      });
    }

    return data;
  }, [report.data, filters, sortKey, sortDir, selectedGroupId, grupos]);

  const divisaFilter = filters["divisa"] ?? "";

  const visibleColumns = useMemo(
    () => columns
      .filter((c) => c.visible)
      .filter((c) => {
        if (!divisaFilter) return true;
        if (c.key.startsWith("usd_") && divisaFilter !== "USD") return false;
        if (c.key.startsWith("ves_") && divisaFilter !== "VES") return false;
        return true;
      })
      .sort((a, b) => a.order - b.order),
    [columns, divisaFilter]
  );

  const handleToggleVisibility = (key: string) => {
    setColumns((prev) => prev.map((c) => (c.key === key ? { ...c, visible: !c.visible } : c)));
    setPopoverColumn(null);
  };

  const handleRename = (key: string, newLabel: string) => {
    setColumns((prev) => prev.map((c) => (c.key === key ? { ...c, label: newLabel } : c)));
    setEditingColumn(null);
  };

  const handleStartRename = (key: string, currentLabel: string) => {
    if (!isPlantilla) return;
    setEditingColumn(key);
    setEditValue(currentLabel);
    setPopoverColumn(null);
    setTimeout(() => editInputRef.current?.focus(), 0);
  };

  const commitRename = () => {
    if (editingColumn && editValue.trim()) {
      handleRename(editingColumn, editValue.trim());
    } else {
      setEditingColumn(null);
    }
  };

  const handleReorder = useCallback((key: string, direction: "up" | "down") => {
    setColumns((prev) => {
      const visible = [...prev].filter((c) => c.visible).sort((a, b) => a.order - b.order);
      const idx = visible.findIndex((c) => c.key === key);
      if (idx === -1) return prev;
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= visible.length) return prev;
      const [moved] = visible.splice(idx, 1);
      visible.splice(swapIdx, 0, moved);
      visible.forEach((c, i) => { c.order = i; });
      return prev.map((c) => {
        const found = visible.find((s) => s.key === c.key);
        return found ? { ...c, order: found.order } : c;
      });
    });
  }, []);

  const handleDragStart = (e: React.DragEvent, key: string) => {
    setIsDragging(true);
    dragSourceRef.current = key;
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, key: string) => {
    e.preventDefault();
    if (!dragSourceRef.current || dragSourceRef.current === key) return;
    e.dataTransfer.dropEffect = "move";
    dropTargetRef.current = key;
  };

  const handleDrop = (e: React.DragEvent, key: string) => {
    e.preventDefault();
    const src = dragSourceRef.current;
    if (!src || src === key) {
      setIsDragging(false);
      dragSourceRef.current = null;
      dropTargetRef.current = null;
      return;
    }
    setColumns((prev) => {
      const visible = [...prev].filter((c) => c.visible).sort((a, b) => a.order - b.order);
      const fromIdx = visible.findIndex((c) => c.key === src);
      const toIdx = visible.findIndex((c) => c.key === key);
      if (fromIdx === -1 || toIdx === -1) return prev;
      const [moved] = visible.splice(fromIdx, 1);
      visible.splice(toIdx, 0, moved);
      visible.forEach((c, i) => { c.order = i; });
      return prev.map((c) => {
        const found = visible.find((s) => s.key === c.key);
        return found ? { ...c, order: found.order } : c;
      });
    });
    setIsDragging(false);
    dragSourceRef.current = null;
    dropTargetRef.current = null;
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    dragSourceRef.current = null;
    dropTargetRef.current = null;
  };

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPopoverColumn(null);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSelectedGroupId("");
    setSortKey(null);
    setSortDir("asc");
    setColumns(report.columns.map((c) => ({ ...c })));
    onColumnAggregationsChange([]);
    onGroupByConfigChange({ columnKey: "", enabled: false });
  };

  const hasActiveFilters =
    Object.values(filters).some((v) => v.trim()) ||
    selectedGroupId ||
    sortKey ||
    columnAggregations.length > 0 ||
    groupByConfig.enabled;

  const numericColumns = columns.filter((c) => c.visible && c.dataType === "number");

  const tableData = useMemo(() => {
    if (!groupByConfig.enabled || !groupByConfig.columnKey) {
      const totalsRow: Record<string, unknown> = { id: "__totals__" };
      visibleColumns.forEach((col) => {
        const agg = columnAggregations.find((a) => a.columnKey === col.key);
        if (!agg) { totalsRow[col.key] = ""; return; }
        if (agg.type === "count" || agg.type === "countUnique") {
          const rawValues = sortedFilteredData.map((r) => r[col.key]).filter((v) => v != null && v !== "");
          totalsRow[col.key] = calcAggregation(agg.type, [], sortedFilteredData, col.key, rawValues);
        } else if (col.dataType === "number") {
          const values = sortedFilteredData.map((r) => Number(r[col.key])).filter((v) => !isNaN(v));
          if (values.length === 0) { totalsRow[col.key] = ""; return; }
          totalsRow[col.key] = calcAggregation(agg.type, values, sortedFilteredData, col.key);
        } else {
          totalsRow[col.key] = "";
        }
      });
      return [...sortedFilteredData, { ...totalsRow, _isTotals: true }];
    }

    const groups: Record<string, ReporteRow[]> = {};
    sortedFilteredData.forEach((row) => {
      const key = String(row[groupByConfig.columnKey] ?? "Sin asignar");
      if (!groups[key]) groups[key] = [];
      groups[key].push(row);
    });

    const result: (ReporteRow & { _isGroupHeader?: boolean; _groupLabel?: string; _isTotals?: boolean })[] = [];
    Object.entries(groups).forEach(([groupVal, rows]) => {
      result.push({ id: `group-${groupVal}`, _isGroupHeader: true, _groupLabel: groupVal });
      rows.forEach((row) => result.push(row));
      const subTotals: Record<string, unknown> = { id: `subtotal-${groupVal}`, _isTotals: true };
      visibleColumns.forEach((col) => {
        const agg = columnAggregations.find((a) => a.columnKey === col.key);
        if (!agg) { subTotals[col.key] = ""; return; }
        if (agg.type === "count" || agg.type === "countUnique") {
          const rawValues = rows.map((r) => r[col.key]).filter((v) => v != null && v !== "");
          subTotals[col.key] = calcAggregation(agg.type, [], rows, col.key, rawValues);
        } else if (col.dataType === "number") {
          const values = rows.map((r) => Number(r[col.key])).filter((v) => !isNaN(v));
          if (values.length === 0) { subTotals[col.key] = ""; return; }
          subTotals[col.key] = calcAggregation(agg.type, values, rows, col.key);
        } else {
          subTotals[col.key] = "";
        }
      });
      result.push(subTotals as ReporteRow);
    });
    return result;
  }, [sortedFilteredData, visibleColumns, columnAggregations, groupByConfig]);

  const setFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-4">
      {isPlantilla && showColumnManager && (
        <div className="p-4 bg-[var(--color-neutro-50)] border border-[var(--color-neutro-200)] rounded-corner-m">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-semibold text-[var(--color-neutro-600)] uppercase tracking-wide">Columnas visibles</span>
            <button onClick={() => setShowColumnManager(false)} className="p-0.5 text-[var(--color-neutro-400)] hover:text-[var(--color-neutro-600)]">
              <X className="w-4 h-4" />
            </button>
          </div>
          <ColumnManager
            columns={columns}
            onToggleVisibility={handleToggleVisibility}
            onRename={handleRename}
            onReorder={handleReorder}
          />
        </div>
      )}
      {isPlantilla && showAggregationTools && (
        <div className="p-4 bg-[var(--color-neutro-50)] border border-[var(--color-neutro-200)] rounded-corner-m">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-semibold text-[var(--color-neutro-600)] uppercase tracking-wide">Herramientas de datos</span>
            <button onClick={() => setShowAggregationTools(false)} className="p-0.5 text-[var(--color-neutro-400)] hover:text-[var(--color-neutro-600)]">
              <X className="w-4 h-4" />
            </button>
          </div>
          <AggregationBar
            columns={columns}
            numericColumns={numericColumns}
            aggregations={columnAggregations}
            groupByConfig={groupByConfig}
            onAggregationsChange={onColumnAggregationsChange}
            onGroupByConfigChange={onGroupByConfigChange}
          />
        </div>
      )}

      {/* Filter row — for plantilla: all columns; for regulatorio: only date + grupo */}
        <div className="flex items-start gap-3 flex-wrap">
          {(divisaFilter
            ? report.columns.filter((c) => {
                if (c.key.startsWith("usd_") && divisaFilter !== "USD") return false;
                if (c.key.startsWith("ves_") && divisaFilter !== "VES") return false;
                return true;
              })
            : report.columns
          )
            .filter((c) => c.visible && (isPlantilla || c.dataType === "date"))
            .sort((a, b) => a.order - b.order)
            .map((col) => {
              const uniqueValues = getUniqueValues(report.data, col.key);
              const useSelect = col.dataType === "text" && uniqueValues.length > 0 && uniqueValues.length <= 8;
              const isDate = col.dataType === "date";
              const fromVal = filters[col.key + "__from"] ?? "";
              const toVal = filters[col.key + "__to"] ?? "";
              const isActive = isDate ? !!(fromVal || toVal) : !!(filters[col.key] ?? "");

              return (
                <div key={col.key} className="relative" style={{ minWidth: isDate ? "165px" : "140px" }}>
                  <label className="block text-[11px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide mb-1">
                    {col.label}
                  </label>
                  {isDate ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="date"
                        className={`${FILTER_CLASS}`}
                        value={fromVal}
                        onChange={(e) => setFilter(col.key + "__from", e.target.value)}
                      />
                      <span className="text-[11px] text-[var(--color-neutro-400)] font-semibold shrink-0">—</span>
                      <input
                        type="date"
                        className={`${FILTER_CLASS}`}
                        value={toVal}
                        onChange={(e) => setFilter(col.key + "__to", e.target.value)}
                      />
                      {isActive && (
                        <button
                          className="p-0.5 text-[var(--color-neutro-400)] hover:text-[var(--color-neutro-600)] shrink-0"
                          onClick={() => {
                            setFilter(col.key + "__from", "");
                            setFilter(col.key + "__to", "");
                          }}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ) : isPlantilla && useSelect ? (
                    <select
                      className={`${FILTER_CLASS} appearance-none cursor-pointer`}
                      value={filters[col.key] ?? ""}
                      onChange={(e) => setFilter(col.key, e.target.value)}
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 6px center",
                        paddingRight: "24px",
                      }}
                    >
                      <option value="">Todos</option>
                      {uniqueValues.map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  ) : isPlantilla ? (
                    <div className="relative">
                      <input
                        className={`${FILTER_CLASS} pr-6`}
                        placeholder="Filtrar..."
                        value={filters[col.key] ?? ""}
                        onChange={(e) => setFilter(col.key, e.target.value)}
                      />
                      {isActive && (
                        <button
                          className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 text-[var(--color-neutro-400)] hover:text-[var(--color-neutro-600)]"
                          onClick={() => setFilter(col.key, "")}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ) : null}
                </div>
              );
            })}

          {/* Grupo Filter */}
          <div className="relative" style={{ minWidth: "180px" }}>
            <label className="block text-[11px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide mb-1">
              Grupo
            </label>
            <select
              className={`${FILTER_CLASS} appearance-none cursor-pointer`}
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 6px center",
                paddingRight: "24px",
              }}
            >
              <option value="">Todos los Grupos</option>
              {grupos.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nombre} ({g.tipo})
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <div className="flex flex-col">
              <span className="block text-[11px] mb-1 select-none opacity-0 pointer-events-none">
                Limpiar
              </span>
              <button
                className="flex items-center gap-1 px-3 h-[34px] text-[12px] font-semibold text-[var(--color-verde-100)] border border-[var(--color-verde-100)] rounded-corner-m hover:bg-[var(--color-verde-100)] hover:text-white transition-colors"
                onClick={handleClearFilters}
              >
                <RotateCcw className="w-3 h-3" />
                Limpiar
              </button>
            </div>
          )}
        </div>

      {/* Table */}
      <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-[var(--color-neutro-200)] bg-[var(--color-neutro-50)]">
              {visibleColumns.map((col) => {
                const colIdx = visibleColumns.findIndex((c) => c.key === col.key);
                return (
                  <th
                    key={col.key}
                    className={`px-3 py-2.5 text-left font-semibold text-[var(--color-neutro-600)] whitespace-nowrap select-none relative ${
                      isPlantilla ? "cursor-pointer hover:bg-[var(--color-neutro-100)]" : ""
                    } ${isDragging && dragSourceRef.current === col.key ? "opacity-50" : ""} ${
                      isDragging && dropTargetRef.current === col.key ? "border-l-2 border-[var(--color-verde-100)]" : ""
                    }`}
                    draggable={isPlantilla}
                    onDragStart={(e) => handleDragStart(e, col.key)}
                    onDragOver={(e) => handleDragOver(e, col.key)}
                    onDrop={(e) => handleDrop(e, col.key)}
                    onDragEnd={handleDragEnd}
                    onClick={() => {
                      if (isPlantilla) setPopoverColumn(popoverColumn === col.key ? null : col.key);
                    }}
                  >
                    <div className="flex items-center gap-1">
                      {editingColumn === col.key ? (
                        <input
                          ref={editInputRef}
                          className="w-24 px-1 py-0.5 text-[12px] border border-[var(--color-verde-100)] rounded-corner-m bg-white focus:outline-none"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={commitRename}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") commitRename();
                            if (e.key === "Escape") setEditingColumn(null);
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span className="text-[13px]">{col.label}</span>
                      )}
                      {isPlantilla && sortKey === col.key && editingColumn !== col.key && (
                        <span className="text-[var(--color-verde-100)]">
                          {sortDir === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                        </span>
                      )}
                    </div>

                    {/* Popover */}
                    {isPlantilla && popoverColumn === col.key && (
                      <div
                        ref={popoverRef}
                        className="absolute left-0 top-full mt-1 z-50 bg-white border border-[var(--color-neutro-200)] rounded-corner-m shadow-lg py-1 min-w-[170px]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-[var(--color-neutro-700)] hover:bg-[var(--color-neutro-100)] transition-colors text-left"
                          onClick={() => toggleSort(col.key)}
                        >
                          <ArrowUpDown className="w-3.5 h-3.5 text-[var(--color-neutro-400)]" />
                          {sortKey === col.key && sortDir === "asc" ? "Ordenar Z-A" : "Ordenar A-Z"}
                        </button>
                        <button
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-[var(--color-neutro-700)] hover:bg-[var(--color-neutro-100)] transition-colors text-left"
                          onClick={() => handleStartRename(col.key, col.label)}
                        >
                          <Pencil className="w-3.5 h-3.5 text-[var(--color-neutro-400)]" />
                          Renombrar
                        </button>
                        <button
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-[var(--color-neutro-700)] hover:bg-[var(--color-neutro-100)] transition-colors text-left"
                          onClick={() => handleToggleVisibility(col.key)}
                        >
                          <EyeOff className="w-3.5 h-3.5 text-[var(--color-neutro-400)]" />
                          Ocultar columna
                        </button>
                        <div className="border-t border-[var(--color-neutro-200)] my-1" />
                        <button
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-[var(--color-neutro-700)] hover:bg-[var(--color-neutro-100)] transition-colors text-left disabled:opacity-30"
                          disabled={colIdx === 0}
                          onClick={() => { handleReorder(col.key, "up"); setPopoverColumn(null); }}
                        >
                          <ArrowLeft className="w-3.5 h-3.5 text-[var(--color-neutro-400)]" />
                          Mover izquierda
                        </button>
                        <button
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-[var(--color-neutro-700)] hover:bg-[var(--color-neutro-100)] transition-colors text-left disabled:opacity-30"
                          disabled={colIdx === visibleColumns.length - 1}
                          onClick={() => { handleReorder(col.key, "down"); setPopoverColumn(null); }}
                        >
                          <ArrowRight className="w-3.5 h-3.5 text-[var(--color-neutro-400)]" />
                          Mover derecha
                        </button>
                        <div className="border-t border-[var(--color-neutro-200)] my-1" />
                        <button
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-[var(--color-neutro-700)] hover:bg-[var(--color-neutro-100)] transition-colors text-left"
                          onClick={() => { setShowColumnManager(true); setShowAggregationTools(false); setPopoverColumn(null); }}
                        >
                          <Settings2 className="w-3.5 h-3.5 text-[var(--color-neutro-400)]" />
                          Configurar columnas
                        </button>
                        <button
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-[var(--color-neutro-700)] hover:bg-[var(--color-neutro-100)] transition-colors text-left"
                          onClick={() => { setShowAggregationTools(true); setShowColumnManager(false); setPopoverColumn(null); }}
                        >
                          <Sigma className="w-3.5 h-3.5 text-[var(--color-neutro-400)]" />
                          Herramientas de datos
                        </button>
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row) => {
              if ("_isGroupHeader" in row && row._isGroupHeader) {
                return (
                  <tr key={row.id} className="bg-[var(--color-verde-100)]/10 border-b border-[var(--color-verde-100)]/20">
                    <td colSpan={visibleColumns.length} className="px-3 py-2 text-[12px] font-bold text-[var(--color-verde-100)] uppercase tracking-wide">
                      {row._groupLabel}
                    </td>
                  </tr>
                );
              }
              if ("_isTotals" in row && row._isTotals) {
                return (
                  <tr key={row.id} className="bg-[var(--color-neutro-100)] font-bold border-t-2 border-[var(--color-neutro-300)]">
                    {visibleColumns.map((col) => (
                      <td key={col.key} className="px-3 py-2 text-[var(--color-neutro-700)] whitespace-nowrap">
                        {row[col.key] !== "" && typeof row[col.key] === "number"
                          ? Number.isInteger(row[col.key] as number)
                            ? (row[col.key] as number).toLocaleString("es-ES")
                            : (row[col.key] as number).toLocaleString("es-ES", { minimumFractionDigits: 2 })
                          : col.order === 0 ? "Totales" : ""}
                      </td>
                    ))}
                  </tr>
                );
              }
              return (
                <tr key={row.id} className="border-b border-[var(--color-neutro-100)] hover:bg-[var(--color-neutro-50)] transition-colors">
                  {visibleColumns.map((col) => (
                    <td key={col.key} className="px-3 py-2 text-[var(--color-neutro-700)] whitespace-nowrap">
                      {col.dataType === "number" && row[col.key] != null
                        ? Number(row[col.key]).toLocaleString("es-ES", { minimumFractionDigits: 2 })
                        : col.dataType === "date"
                          ? new Date(row[col.key] as string).toLocaleDateString("es-ES")
                          : String(row[col.key] ?? "")}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
        {tableData.length === 0 && (
          <div className="p-8 text-center text-[13px] text-[var(--color-neutro-400)]">Sin datos para mostrar</div>
        )}
      </div>
    </div>
  );
}
