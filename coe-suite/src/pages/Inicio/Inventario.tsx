import { useState, useMemo, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp, GripVertical, Plus, Pencil, EyeOff, ArrowLeft, ArrowRight, ArrowUpDown, Sigma, X, Printer } from "lucide-react";
import { Select, Dialog, Button } from "@coe/design-system";
import { EntityTree } from "@components/entities";
import { useEntitiesStore } from "@stores/entitiesStore";
import { useNavStore } from "@stores/navStore";
import { useDivisasStore } from "@stores/divisasStore";

interface InventoryItem {
  id: string;
  tipoPieza: "Billete" | "Moneda";
  clasificacion: string;
  denominacion: string;
  cantidadDisponible: number;
  montoDisponible: number;
  cantidadCierre: number;
  montoCierre: number;
  cantidadTotal: number;
  montoTotal: number;
  divisa: string;
}

interface ColumnDef {
  key: string;
  label: string;
  alwaysVisible: boolean;
  getValue: (item: InventoryItem) => string | number;
}

const DIVISA_OPTIONS = [
  { value: "todas", label: "Todas las divisas" },
  { value: "USD", label: "USD - Dólar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "VED", label: "VED - Bolívar" },
  { value: "COP", label: "COP - Peso" },
];

const CLASIFICACION_OPTIONS = [
  { value: "todas", label: "Todas las clasificaciones" },
  { value: "Aptos", label: "Aptos" },
  { value: "No aptos", label: "No aptos" },
  { value: "Disputa", label: "Disputa" },
  { value: "Dañados", label: "Dañados" },
  { value: "Recuento", label: "Recuento" },
];

const TIPO_PIEZA_OPTIONS = [
  { value: "todos", label: "Todos los tipos" },
  { value: "Billete", label: "Billete" },
  { value: "Moneda", label: "Moneda" },
];

const BOVEDA_OPTIONS_BY_ENTITY: Record<string, { value: string; label: string }[]> = {
  default: [
    { value: "todas", label: "Todas las bóvedas" },
    { value: "Bóveda Principal", label: "Bóveda Principal" },
    { value: "Bóveda Secundaria", label: "Bóveda Secundaria" },
    { value: "Caja Fuerte 01", label: "Caja Fuerte 01" },
  ],
};

const ANAQUEL_OPTIONS_BY_ENTITY: Record<string, { value: string; label: string }[]> = {
  default: [
    { value: "todos", label: "Todos los anaqueles" },
    { value: "Anaquel A1", label: "Anaquel A1" },
    { value: "Anaquel A2", label: "Anaquel A2" },
    { value: "Anaquel B1", label: "Anaquel B1" },
    { value: "Anaquel B2", label: "Anaquel B2" },
    { value: "Anaquel C1", label: "Anaquel C1" },
  ],
};

const DENOMINACIONES: Record<string, string[]> = {
  USD: ["$100", "$50", "$20", "$10", "$5", "$2", "$1", "¢50", "¢25", "¢10", "¢5", "¢1"],
  EUR: ["€500", "€200", "€100", "€50", "€20", "€10", "€5", "¢50", "¢20", "¢10", "¢5", "¢2", "¢1"],
  VED: ["Bs.100", "Bs.50", "Bs.20", "Bs.10", "Bs.5", "Bs.2", "Bs.1", "¢50", "¢25", "¢12.5"],
  COP: ["$100,000", "$50,000", "$20,000", "$10,000", "$5,000", "$2,000", "$1,000", "$500", "$200", "$100", "$50"],
};

const CLASIFICACIONES = ["Aptos", "No aptos", "Disputa", "Dañados", "Recuento"];
const DIVISA_PRIORITY: Record<string, number> = { USD: 0, EUR: 1, VED: 2, COP: 3 };
const CLASIF_PRIORITY: Record<string, number> = { Aptos: 0, "No aptos": 1, Disputa: 2, Dañados: 3, Recuento: 4 };

function generateMockInventory(entityId: string): InventoryItem[] {
  const items: InventoryItem[] = [];
  const divisas = ["USD", "EUR", "VED", "COP"];

  divisas.forEach((divisa) => {
    const dens = DENOMINACIONES[divisa];
    const selected = dens.filter(() => Math.random() > 0.4).slice(0, Math.floor(Math.random() * 6) + 3);

    selected.forEach((denom, i) => {
      CLASIFICACIONES.forEach((clasif, j) => {
        if (Math.random() > 0.55) return;
        const cantidad = Math.floor(Math.random() * 5000) + 10;
        const valorStr = denom.replace(/[^0-9.,]/g, "").replace(",", "");
        const valorUnitario = parseFloat(valorStr) || 1;
        items.push({
          id: `${entityId}-${divisa}-${i}-${j}`,
          tipoPieza: denom.startsWith("¢") ? "Moneda" : "Billete",
          clasificacion: clasif,
          denominacion: denom,
          cantidadDisponible: cantidad,
          montoDisponible: cantidad * valorUnitario,
          cantidadCierre: Math.floor(cantidad * (0.8 + Math.random() * 0.4)),
          montoCierre: 0,
          cantidadTotal: 0,
          montoTotal: 0,
          divisa,
        });
        const last = items[items.length - 1];
        last.cantidadCierre = last.cantidadDisponible - Math.floor(Math.random() * 50);
        last.montoCierre = last.cantidadCierre * valorUnitario;
        last.cantidadTotal = last.cantidadDisponible + last.cantidadCierre;
        last.montoTotal = last.montoDisponible + last.montoCierre;
      });
    });
  });

  return items;
}

function stripSymbols(v: string): string {
  return v.replace(/^[^\d]+/, "");
}

const ALL_COLUMNS: ColumnDef[] = [
  { key: "divisa", label: "Divisa", alwaysVisible: true, getValue: (i) => i.divisa },
  { key: "tipoPieza", label: "Tipo de Pieza", alwaysVisible: true, getValue: (i) => i.tipoPieza },
  { key: "clasificacion", label: "Clasificación", alwaysVisible: true, getValue: (i) => i.clasificacion },
  { key: "denominacion", label: "Denominación", alwaysVisible: true, getValue: (i) => stripSymbols(i.denominacion) },
  { key: "cantidadDisponible", label: "Cantidad Disponible", alwaysVisible: true, getValue: (i) => i.cantidadDisponible },
  { key: "montoDisponible", label: "Monto Disponible", alwaysVisible: true, getValue: (i) => i.montoDisponible },
  { key: "cantidadCierre", label: "Cantidad Cierre", alwaysVisible: false, getValue: (i) => i.cantidadCierre },
  { key: "montoCierre", label: "Monto Cierre", alwaysVisible: false, getValue: (i) => i.montoCierre },
  { key: "cantidadTotal", label: "Cantidad Total", alwaysVisible: false, getValue: (i) => i.cantidadTotal },
  { key: "montoTotal", label: "Monto Total", alwaysVisible: false, getValue: (i) => i.montoTotal },
];

type SortDir = "asc" | "desc" | null;

export function Inventario() {
  const selectedId = useEntitiesStore((s) => s.selectedId);
  const selectedEntity = useEntitiesStore((s) =>
    s.selectedId ? s.entities.find((e) => e.id === s.selectedId) : null
  );

  const [divisa, setDivisa] = useState("todas");
  const [clasificacion, setClasificacion] = useState("todas");
  const [tipoPieza, setTipoPieza] = useState("todos");
  const [boveda, setBoveda] = useState("todas");
  const [anaquel, setAnaquel] = useState("todos");

  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  const [columnOrder, setColumnOrder] = useState<string[]>(
    ALL_COLUMNS.map((c) => c.key)
  );
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(
    new Set(ALL_COLUMNS.filter((c) => !c.alwaysVisible).map((c) => c.key))
  );
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [showPrintMenu, setShowPrintMenu] = useState(false);
  const [showAggregationTools, setShowAggregationTools] = useState(false);
  const [showDeclararModal, setShowDeclararModal] = useState(false);
  const [selectedDivisaForDecl, setSelectedDivisaForDecl] = useState("");
  const [declararPage, setDeclararPage] = useState<"form" | "confirm">("form");
  const [declaredCantidad, setDeclaredCantidad] = useState<Record<string, number>>({});
  const [customDeclaraciones, setCustomDeclaraciones] = useState<{ id: string; tipoPieza: string; clasificacion: string; denominacion: string; valorUnitario: number }[]>([]);
  const [pendingCustom, setPendingCustom] = useState<{ tipoPieza: string; clasificacion: string; denominacion: string } | null>(null);

  const TIPO_PIEZA_DECLARACION_OPTIONS = [
    { value: "Billete", label: "Billete" },
    { value: "Moneda", label: "Moneda" },
  ];

  const CLASIFICACION_DECLARACION_OPTIONS = CLASIFICACIONES.map((c) => ({ value: c, label: c }));
  const [columnLabels, setColumnLabels] = useState<Record<string, string>>({});
  const [groupByKey, setGroupByKey] = useState<string>("");
  type AggType = "sum" | "avg" | "count" | "max" | "min" | "countUnique";
  const [aggregations, setAggregations] = useState<Record<string, AggType>>({});

  const [dragColKey, setDragColKey] = useState<string | null>(null);
  const dragOverIdx = useRef<number | null>(null);
  const [popoverColumn, setPopoverColumn] = useState<string | null>(null);
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const editInputRef = useRef<HTMLInputElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const printMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    useNavStore.setState({ title: "Inventario", description: "Inicio — Inventario" });
  }, []);

  useEffect(() => {
    if (!popoverColumn) return;
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setPopoverColumn(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [popoverColumn]);

  useEffect(() => {
    if (!showPrintMenu) return;
    const handler = (e: MouseEvent) => {
      if (printMenuRef.current && !printMenuRef.current.contains(e.target as Node)) {
        setShowPrintMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showPrintMenu]);

  const rawData = useMemo(() => {
    if (!selectedId) return [];
    return generateMockInventory(selectedId);
  }, [selectedId]);

  function denomValue(d: string): number {
    return parseFloat(d.replace(/^[^\d]+/, "").replace(",", "")) || 0;
  }

  const defaultSortedData = useMemo(() => {
    return [...rawData].sort((a, b) => {
      const dPri = (DIVISA_PRIORITY[a.divisa] ?? 99) - (DIVISA_PRIORITY[b.divisa] ?? 99);
      if (dPri !== 0) return dPri;
      const tPri = (a.tipoPieza === "Billete" ? 0 : 1) - (b.tipoPieza === "Billete" ? 0 : 1);
      if (tPri !== 0) return tPri;
      const cPri = (CLASIF_PRIORITY[a.clasificacion] ?? 99) - (CLASIF_PRIORITY[b.clasificacion] ?? 99);
      if (cPri !== 0) return cPri;
      return denomValue(b.denominacion) - denomValue(a.denominacion);
    });
  }, [rawData]);

  const filtered = useMemo(() => {
    let data = defaultSortedData;
    if (divisa !== "todas") data = data.filter((i) => i.divisa === divisa);
    if (clasificacion !== "todas") data = data.filter((i) => i.clasificacion === clasificacion);
    if (tipoPieza !== "todos") data = data.filter((i) => i.tipoPieza === tipoPieza);
    return data;
  }, [defaultSortedData, divisa, clasificacion, tipoPieza]);

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return filtered;
    const col = ALL_COLUMNS.find((c) => c.key === sortKey);
    if (!col) return filtered;
    return [...filtered].sort((a, b) => {
      const va = col.getValue(a);
      const vb = col.getValue(b);
      if (typeof va === "number" && typeof vb === "number") {
        return sortDir === "asc" ? va - vb : vb - va;
      }
      const sa = String(va);
      const sb = String(vb);
      return sortDir === "asc" ? sa.localeCompare(sb) : sb.localeCompare(sa);
    });
  }, [filtered, sortKey, sortDir]);

  const visibleColumns = useMemo(() => {
    return columnOrder
      .map((key) => {
        const col = ALL_COLUMNS.find((c) => c.key === key)!;
        return col ? { ...col, label: columnLabels[key] || col.label } : col;
      })
      .filter((c) => !hiddenColumns.has(c.key));
  }, [columnOrder, hiddenColumns, columnLabels]);

  const montoTotal = useMemo(() => {
    return sorted.reduce((sum, i) => sum + i.montoDisponible, 0);
  }, [sorted]);

  const divisas = useDivisasStore((s) => s.divisas);
  const divisaBaseId = useDivisasStore((s) => s.divisaBaseId);
  const divisaBase = divisas.find((d) => d.id === divisaBaseId);

  const hasFilters = divisa !== "todas" || clasificacion !== "todas" || tipoPieza !== "todos" || boveda !== "todas" || anaquel !== "todos";

  const montoEnBase = useMemo(() => {
    if (!divisaBase) return 0;
    const rates: Record<string, number> = {};
    divisas.forEach((d) => { rates[d.codigoISO] = d.tasaCambio; });
    return sorted.reduce((sum, item) => {
      const rate = rates[item.divisa] || 1;
      return sum + (item.montoDisponible / rate);
    }, 0);
  }, [sorted, divisas, divisaBase]);

  const declaracionRows = useMemo(() => {
    if (!selectedDivisaForDecl) return [];
    const items = rawData.filter((i) => i.divisa === selectedDivisaForDecl);
    const groups: Record<string, { denominacion: string; tipoPieza: string; clasificacion: string; valorUnitario: number; cantidadActual: number; montoActual: number }> = {};
    items.forEach((item) => {
      const valorUnitario = item.cantidadDisponible > 0 ? Math.round(item.montoDisponible / item.cantidadDisponible) : 0;
      const key = `${item.denominacion}||${item.tipoPieza}||${item.clasificacion}`;
      if (!groups[key]) {
        groups[key] = { denominacion: item.denominacion, tipoPieza: item.tipoPieza, clasificacion: item.clasificacion, valorUnitario, cantidadActual: 0, montoActual: 0 };
      }
      groups[key].cantidadActual += item.cantidadDisponible;
      groups[key].montoActual += item.montoDisponible;
    });
    return Object.values(groups).sort((a, b) => {
      if (a.tipoPieza !== b.tipoPieza) return a.tipoPieza === "Billete" ? -1 : 1;
      return b.valorUnitario - a.valorUnitario;
    });
  }, [rawData, selectedDivisaForDecl]);

  const NUMERIC_COLUMNS = ALL_COLUMNS.filter((c) =>
    ["cantidadDisponible", "montoDisponible", "cantidadCierre", "montoCierre", "cantidadTotal", "montoTotal"].includes(c.key)
  );

  function calcAgg(type: AggType, values: number[], rawValues: unknown[]): number {
    if (type === "sum") return values.reduce((a, b) => a + b, 0);
    if (type === "avg") return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    if (type === "count") return values.length;
    if (type === "max") return values.length ? Math.max(...values) : 0;
    if (type === "min") return values.length ? Math.min(...values) : 0;
    if (type === "countUnique") return new Set(rawValues).size;
    return 0;
  }

  const tableData = useMemo(() => {
    const hasAgg = Object.keys(aggregations).length > 0;
    if (!groupByKey || !hasAgg) return sorted;

    const groups: Record<string, InventoryItem[]> = {};
    sorted.forEach((item) => {
      const key = String((item as any)[groupByKey] ?? "Sin asignar");
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });

    type AugmentedRow = InventoryItem & { _isGroupHeader?: boolean; _groupLabel?: string; _isTotals?: boolean };
    const result: AugmentedRow[] = [];
    const aggKeys = Object.keys(aggregations);

    Object.entries(groups).forEach(([groupVal, items]) => {
      result.push({ id: `group-${groupVal}`, _isGroupHeader: true, _groupLabel: groupVal } as unknown as AugmentedRow);
      items.forEach((item) => result.push({ ...item }));
      const sub: Record<string, unknown> = { id: `subtotal-${groupVal}`, _isTotals: true };
      visibleColumns.forEach((col) => {
        const aggType = aggregations[col.key];
        if (!aggType) { sub[col.key] = ""; return; }
        const values = items.map((i) => Number((i as any)[col.key])).filter((v) => !isNaN(v));
        const rawValues = items.map((i) => (i as any)[col.key]).filter((v) => v != null && v !== "");
        if (aggType === "count" || aggType === "countUnique") {
          sub[col.key] = calcAgg(aggType, values, rawValues);
        } else {
          sub[col.key] = values.length ? calcAgg(aggType, values, rawValues) : "";
        }
      });
      result.push(sub as unknown as AugmentedRow);
    });

    const grandTotal: Record<string, unknown> = { id: "__totals__", _isTotals: true };
    visibleColumns.forEach((col) => {
      const aggType = aggregations[col.key];
      if (!aggType) { grandTotal[col.key] = ""; return; }
      const values = sorted.map((i) => Number((i as any)[col.key])).filter((v) => !isNaN(v));
      const rawValues = sorted.map((i) => (i as any)[col.key]).filter((v) => v != null && v !== "");
      if (aggType === "count" || aggType === "countUnique") {
        grandTotal[col.key] = calcAgg(aggType, values, rawValues);
      } else {
        grandTotal[col.key] = values.length ? calcAgg(aggType, values, rawValues) : "";
      }
    });
    result.push(grandTotal as unknown as AugmentedRow);
    return result;
  }, [sorted, groupByKey, aggregations, visibleColumns]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDir === "asc") setSortDir("desc");
      else if (sortDir === "desc") { setSortKey(null); setSortDir(null); }
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const handleDragStart = (key: string) => {
    setDragColKey(key);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    dragOverIdx.current = idx;
  };

  const handleDrop = (targetKey: string) => {
    if (!dragColKey || dragColKey === targetKey) return;
    setColumnOrder((prev) => {
      const from = prev.indexOf(dragColKey);
      const to = prev.indexOf(targetKey);
      if (from === -1 || to === -1) return prev;
      const next = [...prev];
      next.splice(from, 1);
      next.splice(to, 0, dragColKey);
      return next;
    });
    setDragColKey(null);
  };

  const toggleColumn = (key: string) => {
    setHiddenColumns((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const handleStartRename = (key: string, label: string) => {
    setEditingColumn(key);
    setEditValue(label);
    setPopoverColumn(null);
    setTimeout(() => editInputRef.current?.focus(), 10);
  };

  const commitRename = () => {
    if (editingColumn && editValue.trim()) {
      setColumnLabels((prev) => ({ ...prev, [editingColumn]: editValue.trim() }));
    }
    setEditingColumn(null);
  };

  const handleToggleVisibility = (key: string) => {
    setHiddenColumns((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
    setPopoverColumn(null);
  };

  const handleReorder = (key: string, dir: "up" | "down") => {
    setColumnOrder((prev) => {
      const idx = prev.indexOf(key);
      if (idx === -1) return prev;
      const next = [...prev];
      if (dir === "up" && idx > 0) {
        next[idx] = next[idx - 1];
        next[idx - 1] = key;
      } else if (dir === "down" && idx < next.length - 1) {
        next[idx] = next[idx + 1];
        next[idx + 1] = key;
      }
      return next;
    });
    setPopoverColumn(null);
  };

  const bovedaOptions = BOVEDA_OPTIONS_BY_ENTITY[selectedId ?? ""] ?? BOVEDA_OPTIONS_BY_ENTITY.default;
  const anaquelOptions = ANAQUEL_OPTIONS_BY_ENTITY[selectedId ?? ""] ?? ANAQUEL_OPTIONS_BY_ENTITY.default;

  return (
    <><div className="p-6 h-full flex flex-col">
      <div className="flex items-start justify-between mb-4 gap-4">
        <div>
          <h1 className="text-[18px] font-bold text-[var(--color-neutro-900)]">Inventario</h1>
          <p className="text-[13px] text-[var(--color-neutro-500)]">
            Consulta y ajuste de inventario por entidad, divisa y clasificación
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m px-3 py-1.5">
            <p className="text-[9px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide leading-none mb-0.5">
              Monto Total · {selectedEntity?.nombre || ""}
            </p>
            <p className="text-[15px] font-bold text-[var(--color-verde-100)] leading-none tracking-tight">
              {divisaBase?.simbolo || "$"}{montoEnBase.toLocaleString("es-ES", { maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="relative">
            <button className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-[12px] font-medium rounded-corner-m border border-[var(--color-neutro-300)] text-[var(--color-neutro-600)] hover:bg-[var(--color-neutro-100)] transition-colors cursor-pointer" onClick={() => setShowPrintMenu(!showPrintMenu)}>
              <Printer className="w-3.5 h-3.5" />
              Imprimir
            </button>
            {showPrintMenu && (
              <div ref={printMenuRef} className="absolute right-0 top-full mt-1 z-50 bg-white border border-[var(--color-neutro-200)] rounded-corner-m shadow-lg py-1 min-w-[180px]">
                <button className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-[var(--color-neutro-700)] hover:bg-[var(--color-neutro-100)] transition-colors text-left" onClick={() => setShowPrintMenu(false)}>Formato Resumen</button>
                <button className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-[var(--color-neutro-700)] hover:bg-[var(--color-neutro-100)] transition-colors text-left" onClick={() => setShowPrintMenu(false)}>Formato Detallado</button>
                <button className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-[var(--color-neutro-700)] hover:bg-[var(--color-neutro-100)] transition-colors text-left" onClick={() => setShowPrintMenu(false)}>Formato por Divisa</button>
                <div className="border-t border-[var(--color-neutro-200)] my-1" />
                <button className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-[var(--color-neutro-700)] hover:bg-[var(--color-neutro-100)] transition-colors text-left" onClick={() => setShowPrintMenu(false)}>Exportar a PDF</button>
                <button className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-[var(--color-neutro-700)] hover:bg-[var(--color-neutro-100)] transition-colors text-left" onClick={() => setShowPrintMenu(false)}>Exportar a Excel</button>
              </div>
            )}
          </div>
          <button disabled={!selectedId} className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-[12px] font-semibold rounded-corner-m transition-colors cursor-pointer bg-surface-green border border-surface-white text-neutro-white hover:brightness-90 active:brightness-75 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100" onClick={() => { setShowDeclararModal(true); setSelectedDivisaForDecl(""); setDeclararPage("form"); setDeclaredCantidad({}); setCustomDeclaraciones([]); setPendingCustom(null); }}>Declarar Diferencia</button>
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        <div className="w-[410px] shrink-0 bg-white border border-[var(--color-neutro-200)] rounded-corner-m overflow-y-auto">
          <div className="p-3 border-b border-[var(--color-neutro-200)]">
            <p className="text-[12px] font-semibold text-[var(--color-neutro-600)] uppercase tracking-wide">
              Explorador de Entidades
            </p>
          </div>
          <div className="p-2">
            <EntityTree />
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-4 min-h-0">
          {selectedEntity ? (
            <>
              <div className="flex items-center gap-1 flex-wrap">
                  <Select className="[&>div>button]:!text-[11px] [&>div>button]:!py-0.5 [&>div>button]:!px-2 [&>div>button]:!min-h-0 [&>div>button]:!h-auto [&>div>button]:!leading-tight" options={DIVISA_OPTIONS} value={divisa} onChange={setDivisa} />
                  <Select className="[&>div>button]:!text-[11px] [&>div>button]:!py-0.5 [&>div>button]:!px-2 [&>div>button]:!min-h-0 [&>div>button]:!h-auto [&>div>button]:!leading-tight" options={CLASIFICACION_OPTIONS} value={clasificacion} onChange={setClasificacion} />
                  <Select className="[&>div>button]:!text-[11px] [&>div>button]:!py-0.5 [&>div>button]:!px-2 [&>div>button]:!min-h-0 [&>div>button]:!h-auto [&>div>button]:!leading-tight" options={TIPO_PIEZA_OPTIONS} value={tipoPieza} onChange={setTipoPieza} />
                  <Select className="[&>div>button]:!text-[11px] [&>div>button]:!py-0.5 [&>div>button]:!px-2 [&>div>button]:!min-h-0 [&>div>button]:!h-auto [&>div>button]:!leading-tight" options={bovedaOptions} value={boveda} onChange={setBoveda} />
                  <Select className="[&>div>button]:!text-[11px] [&>div>button]:!py-0.5 [&>div>button]:!px-2 [&>div>button]:!min-h-0 [&>div>button]:!h-auto [&>div>button]:!leading-tight" options={anaquelOptions} value={anaquel} onChange={setAnaquel} />
                  {hasFilters && (
                    <button className="inline-flex items-center justify-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-corner-m border border-[var(--color-neutro-300)] text-[var(--color-neutro-700)] hover:bg-[var(--color-neutro-100)] transition-colors ml-auto" onClick={() => { setDivisa("todas"); setClasificacion("todas"); setTipoPieza("todos"); setBoveda("todas"); setAnaquel("todos"); }}>Limpiar filtros</button>
                  )}
                </div>
                {showAggregationTools && (
                <div className="p-4 bg-[var(--color-neutro-50)] border border-[var(--color-neutro-200)] rounded-corner-m">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px] font-semibold text-[var(--color-neutro-600)] uppercase tracking-wide">Herramientas de datos</span>
                    <button onClick={() => { setShowAggregationTools(false); setGroupByKey(""); setAggregations({}); }} className="p-0.5 text-[var(--color-neutro-400)] hover:text-[var(--color-neutro-600)] cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-start gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <span className="text-[12px] text-[var(--color-neutro-500)] shrink-0">Agrupar por:</span>
                      <Select
                        options={visibleColumns.map((c) => ({ value: c.key, label: c.label }))}
                        placeholder="Sin agrupar"
                        value={groupByKey}
                        onChange={(v) => { setGroupByKey(v); if (!v) setAggregations({}); }}
                        className="[&>div>button]:!text-[11px] [&>div>button]:!py-0.5 [&>div>button]:!px-2 [&>div>button]:!min-h-0 [&>div>button]:!h-auto [&>div>button]:!leading-tight min-w-[180px]"
                      />
                    </div>
                    {groupByKey && (
                      <div className="flex items-center gap-3">
                        <span className="text-[12px] text-[var(--color-neutro-500)] shrink-0">Agregación:</span>
                        <div className="flex items-center gap-2 flex-wrap">
                          {NUMERIC_COLUMNS.filter((c) => !hiddenColumns.has(c.key)).map((col) => {
                            const label = columnLabels[col.key] || col.label;
                            return (
                              <div key={col.key} className="flex items-center gap-1">
                                <span className="text-[12px] text-[var(--color-neutro-700)]">{label}</span>
                                <Select
                                  options={[
                                    { value: "sum", label: "Sumar" },
                                    { value: "avg", label: "Promediar" },
                                    { value: "count", label: "Contar" },
                                    { value: "max", label: "Máximo" },
                                    { value: "min", label: "Mínimo" },
                                    { value: "countUnique", label: "Contar Únicos" },
                                  ]}
                                  placeholder="—"
                                  value={aggregations[col.key] ?? ""}
                                  onChange={(v) => {
                                    setAggregations((prev) => {
                                      const next = { ...prev };
                                      if (v) next[col.key] = v as AggType;
                                      else delete next[col.key];
                                      return next;
                                    });
                                  }}
                                  className="[&>div>button]:!text-[11px] [&>div>button]:!py-0.5 [&>div>button]:!px-2 [&>div>button]:!min-h-0 [&>div>button]:!h-auto [&>div>button]:!leading-tight min-w-[100px]"
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m overflow-hidden flex flex-col min-h-0 flex-1">
                <div className="overflow-auto min-h-0 flex-1">
                  <table className="text-[13px]" style={{ minWidth: "100%", width: "max-content" }}>
                    <thead className="sticky top-0 z-10 bg-white">
                      <tr className="border-b border-[var(--color-neutro-200)] bg-white">
                        {visibleColumns.map((col, idx) => (
                          <th
                            key={col.key}
                            draggable
                            onDragStart={() => handleDragStart(col.key)}
                            onDragOver={(e) => handleDragOver(e, idx)}
                            onDrop={() => handleDrop(col.key)}
                            onDragEnd={() => setDragColKey(null)}
                            className={`px-3 py-2.5 text-left text-[11px] font-semibold text-[var(--color-neutro-600)] uppercase tracking-wide cursor-pointer select-none whitespace-nowrap relative ${
                              dragColKey === col.key ? "opacity-50" : ""
                            } ${dragOverIdx.current === idx ? "bg-[var(--color-verde-100)]/10" : ""} hover:bg-[var(--color-neutro-100)]`}
                            onClick={() => setPopoverColumn(popoverColumn === col.key ? null : col.key)}
                          >
                            <div className="flex items-center gap-1">
                              <GripVertical className="w-3 h-3 text-[var(--color-neutro-300)] cursor-grab shrink-0" />
                              {editingColumn === col.key ? (
                                <input
                                  ref={editInputRef}
                                  className="w-20 px-1 py-0.5 text-[11px] border border-[var(--color-verde-100)] rounded-corner-m bg-white focus:outline-none lowercase"
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
                                <span>{col.label}</span>
                              )}
                              {sortKey === col.key && editingColumn !== col.key && (
                                sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                              )}
                            </div>

                            {popoverColumn === col.key && (
                              <div
                                ref={popoverRef}
                                className="absolute left-0 top-full mt-1 z-50 bg-white border border-[var(--color-neutro-200)] rounded-corner-m shadow-lg py-1 min-w-[170px]"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-[var(--color-neutro-700)] hover:bg-[var(--color-neutro-100)] transition-colors text-left"
                                  onClick={() => handleSort(col.key)}
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
                                  disabled={idx === 0}
                                  onClick={() => handleReorder(col.key, "up")}
                                >
                                  <ArrowLeft className="w-3.5 h-3.5 text-[var(--color-neutro-400)]" />
                                  Mover izquierda
                                </button>
                                <button
                                  className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-[var(--color-neutro-700)] hover:bg-[var(--color-neutro-100)] transition-colors text-left disabled:opacity-30"
                                  disabled={idx === visibleColumns.length - 1}
                                  onClick={() => handleReorder(col.key, "down")}
                                >
                                  <ArrowRight className="w-3.5 h-3.5 text-[var(--color-neutro-400)]" />
                                  Mover derecha
                                </button>
                                <div className="border-t border-[var(--color-neutro-200)] my-1" />
                                <button
                                  className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-[var(--color-neutro-700)] hover:bg-[var(--color-neutro-100)] transition-colors text-left"
                                  onClick={() => { setShowAggregationTools(true); setPopoverColumn(null); }}
                                >
                                  <Sigma className="w-3.5 h-3.5 text-[var(--color-neutro-400)]" />
                                  Herramientas de datos
                                </button>
                              </div>
                            )}
                          </th>
                        ))}
                        <th className="px-3 py-2.5 w-10">
                          <div className="relative">
                            <button
                              className="p-1 rounded hover:bg-[var(--color-neutro-200)] text-[var(--color-neutro-500)] transition-colors"
                              onClick={() => setShowColumnPicker(!showColumnPicker)}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            {showColumnPicker && (
                              <div
                                className="absolute right-0 top-8 bg-white border border-[var(--color-neutro-200)] rounded-corner-m shadow-lg p-2 z-50 min-w-[180px]"
                                onMouseLeave={() => setShowColumnPicker(false)}
                              >
                                <p className="text-[10px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide px-2 py-1">
                                  Columnas adicionales
                                </p>
                                {ALL_COLUMNS.map((col) => (
                                  <label
                                    key={col.key}
                                    className="flex items-center gap-2 px-2 py-1.5 text-[12px] text-[var(--color-neutro-700)] hover:bg-[var(--color-neutro-100)] rounded cursor-pointer whitespace-nowrap"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={!hiddenColumns.has(col.key)}
                                      onChange={() => toggleColumn(col.key)}
                                      className="accent-[var(--color-verde-100)]"
                                    />
                                    {columnLabels[col.key] || col.label}
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.length === 0 ? (
                        <tr>
                          <td colSpan={visibleColumns.length + 1} className="px-3 py-8 text-center text-[13px] text-[var(--color-neutro-400)]">
                            No se encontraron registros de inventario
                          </td>
                        </tr>
                      ) : (tableData as any[]).map((row: any) => {
                        if (row._isGroupHeader) {
                          return (
                            <tr key={row.id} className="bg-[var(--color-verde-100)]/10 border-b border-[var(--color-verde-100)]/20">
                              <td colSpan={visibleColumns.length + 1} className="px-3 py-2 text-[12px] font-bold text-[var(--color-verde-100)] uppercase tracking-wide">
                                {row._groupLabel}
                              </td>
                            </tr>
                          );
                        }
                        if (row._isTotals) {
                          return (
                            <tr key={row.id} className="bg-[var(--color-neutro-100)] font-bold border-t-2 border-[var(--color-neutro-300)]">
                              {visibleColumns.map((col, vi) => {
                                const val = row[col.key];
                                return (
                                  <td key={col.key} className="px-3 py-2 text-[12px] text-[var(--color-neutro-700)] whitespace-nowrap">
                                    {val !== "" && typeof val === "number"
                                      ? val.toLocaleString("es-ES")
                                      : vi === 0 && !groupByKey ? "Totales" : vi === 0 ? "Subtotal" : ""}
                                  </td>
                                );
                              })}
                              <td className="px-3 py-2" />
                            </tr>
                          );
                        }
                        return (
                          <tr key={row.id} className="border-b border-[var(--color-neutro-100)] hover:bg-[var(--color-neutro-50)] transition-colors">
                            {visibleColumns.map((col) => (
                              <td key={col.key} className="px-3 py-2 text-[12px] text-[var(--color-neutro-700)] whitespace-nowrap">
                                {typeof col.getValue(row) === "number"
                                  ? col.getValue(row).toLocaleString("es-ES")
                                  : col.getValue(row)}
                              </td>
                            ))}
                            <td className="px-3 py-2" />
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-white border border-[var(--color-neutro-200)] rounded-corner-m">
              <div className="text-center p-8">
                <p className="text-[14px] font-medium text-[var(--color-neutro-500)]">
                  Seleccione una entidad del árbol para ver su inventario
                </p>
                <p className="text-[12px] text-[var(--color-neutro-400)] mt-1">
                  El panel mostrará el detalle de piezas, montos y clasificaciones
                </p>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>

      <Dialog open={showDeclararModal} onClose={() => setShowDeclararModal(false)} title="Declarar Diferencia" size="lg">
        {declararPage === "form" ? (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[13px] font-medium text-[var(--color-neutro-700)]">Seleccione la divisa:</span>
              <Select
                className="[&>div>button]:!text-[11px] [&>div>button]:!py-0.5 [&>div>button]:!px-2 [&>div>button]:!min-h-0 [&>div>button]:!h-auto [&>div>button]:!leading-tight min-w-[180px]"
                options={DIVISA_OPTIONS.filter((o) => o.value !== "todas")}
                placeholder="Seleccione..."
                value={selectedDivisaForDecl}
                onChange={setSelectedDivisaForDecl}
              />
            </div>
            {selectedDivisaForDecl && (
              <div>
                <div className="overflow-auto max-h-[400px] border border-[var(--color-neutro-200)] rounded-corner-xs">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="bg-[var(--color-neutro-100)] border-b border-[var(--color-neutro-200)]">
                        <th className="px-3 py-2 text-left font-semibold text-[var(--color-neutro-600)]">Denominación</th>
                        <th className="px-3 py-2 text-left font-semibold text-[var(--color-neutro-600)]">Clasificación</th>
                        <th className="px-3 py-2 text-left font-semibold text-[var(--color-neutro-600)]">Tipo</th>
                        <th className="px-3 py-2 text-right font-semibold text-[var(--color-neutro-600)]">Valor Unit.</th>
                        <th className="px-3 py-2 text-right font-semibold text-[var(--color-neutro-600)]">Cant. Actual</th>
                        <th className="px-3 py-2 text-right font-semibold text-[var(--color-neutro-600)]">Cant. Declarada</th>
                        <th className="px-3 py-2 text-right font-semibold text-[var(--color-neutro-600)]">Diferencia</th>
                        <th className="px-3 py-2 text-right font-semibold text-[var(--color-neutro-600)]">Monto Actual</th>
                        <th className="px-3 py-2 text-right font-semibold text-[var(--color-neutro-600)]">Monto Resultante</th>
                      </tr>
                    </thead>
                    <tbody>
                      {declaracionRows.map((row) => {
                        const cantDeclarada = declaredCantidad[`row:${row.denominacion}:${row.tipoPieza}:${row.clasificacion}`] ?? row.cantidadActual;
                        const diff = cantDeclarada - row.cantidadActual;
                        return (
                          <tr key={`row:${row.denominacion}:${row.tipoPieza}:${row.clasificacion}`} className="border-b border-[var(--color-neutro-100)] hover:bg-[var(--color-neutro-50)]">
                            <td className="px-3 py-2 font-medium">{stripSymbols(row.denominacion)}</td>
                            <td className="px-3 py-2">{row.clasificacion}</td>
                            <td className="px-3 py-2">{row.tipoPieza}</td>
                            <td className="px-3 py-2 text-right">{row.valorUnitario.toLocaleString("es-ES")}</td>
                            <td className="px-3 py-2 text-right">{row.cantidadActual.toLocaleString("es-ES")}</td>
                            <td className="px-3 py-2 text-right">
                              <input
                                type="number"
                                min={0}
                                className="w-24 px-2 py-1 text-right border border-[var(--color-neutro-200)] rounded-corner-xs text-[12px] focus:outline-none focus:border-[var(--color-verde-100)]"
                                value={cantDeclarada}
                                onChange={(e) => {
                                  const v = parseInt(e.target.value, 10);
                                  setDeclaredCantidad((prev) => ({ ...prev, [`row:${row.denominacion}:${row.tipoPieza}:${row.clasificacion}`]: isNaN(v) ? 0 : v }));
                                }}
                              />
                            </td>
                            <td className={`px-3 py-2 text-right font-semibold ${diff > 0 ? "text-[var(--color-verde-100)]" : diff < 0 ? "text-[var(--color-ind-rojo)]" : ""}`}>{diff > 0 ? `+${diff}` : diff}</td>
                            <td className="px-3 py-2 text-right">{row.montoActual.toLocaleString("es-ES")}</td>
                            <td className="px-3 py-2 text-right">{(cantDeclarada * row.valorUnitario).toLocaleString("es-ES")}</td>
                          </tr>
                        );
                      })}
                      {customDeclaraciones.map((cr) => {
                        const cantDeclarada = declaredCantidad[`custom:${cr.id}`] ?? 0;
                        const diff = cantDeclarada;
                        return (
                          <tr key={`custom:${cr.id}`} className="border-b border-[var(--color-neutro-100)] hover:bg-[var(--color-neutro-50)] bg-[var(--color-ind-azul)]/5">
                            <td className="px-3 py-2 font-medium">{stripSymbols(cr.denominacion)}</td>
                            <td className="px-3 py-2">{cr.clasificacion}</td>
                            <td className="px-3 py-2">{cr.tipoPieza}</td>
                            <td className="px-3 py-2 text-right">{cr.valorUnitario.toLocaleString("es-ES")}</td>
                            <td className="px-3 py-2 text-right">0</td>
                            <td className="px-3 py-2 text-right">
                              <input
                                type="number"
                                min={0}
                                className="w-24 px-2 py-1 text-right border border-[var(--color-neutro-200)] rounded-corner-xs text-[12px] focus:outline-none focus:border-[var(--color-verde-100)]"
                                value={cantDeclarada}
                                onChange={(e) => {
                                  const v = parseInt(e.target.value, 10);
                                  setDeclaredCantidad((prev) => ({ ...prev, [`custom:${cr.id}`]: isNaN(v) ? 0 : v }));
                                }}
                              />
                            </td>
                            <td className="px-3 py-2 text-right font-semibold text-[var(--color-verde-100)]">{diff > 0 ? `+${diff}` : diff}</td>
                            <td className="px-3 py-2 text-right">0</td>
                            <td className="px-3 py-2 text-right">{(cantDeclarada * cr.valorUnitario).toLocaleString("es-ES")}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <button
                    className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-[var(--color-verde-100)] border border-dashed border-[var(--color-verde-100)] rounded-corner-xs hover:bg-[var(--color-verde-100)]/5 transition-colors cursor-pointer"
                    onClick={() => setPendingCustom({ tipoPieza: "Billete", clasificacion: "Aptos", denominacion: (DENOMINACIONES[selectedDivisaForDecl] || ["$1"])[0] })}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    Agregar denominación
                  </button>
                </div>
                {pendingCustom && (
                  <div className="flex items-center gap-2 mt-2 flex-wrap p-3 bg-[var(--color-neutro-50)] border border-[var(--color-neutro-200)] rounded-corner-xs">
                    <span className="text-[11px] text-[var(--color-neutro-500)]">Nueva declaración:</span>
                    <Select
                      className="[&>div>button]:!text-[11px] [&>div>button]:!py-0.5 [&>div>button]:!px-2 [&>div>button]:!min-h-0 [&>div>button]:!h-auto [&>div>button]:!leading-tight min-w-[80px]"
                      options={TIPO_PIEZA_DECLARACION_OPTIONS}
                      value={pendingCustom.tipoPieza}
                      onChange={(v) => setPendingCustom((prev) => prev ? { ...prev, tipoPieza: v } : null)}
                    />
                    <Select
                      className="[&>div>button]:!text-[11px] [&>div>button]:!py-0.5 [&>div>button]:!px-2 [&>div>button]:!min-h-0 [&>div>button]:!h-auto [&>div>button]:!leading-tight min-w-[80px]"
                      options={CLASIFICACION_DECLARACION_OPTIONS}
                      value={pendingCustom.clasificacion}
                      onChange={(v) => setPendingCustom((prev) => prev ? { ...prev, clasificacion: v } : null)}
                    />
                    <Select
                      className="[&>div>button]:!text-[11px] [&>div>button]:!py-0.5 [&>div>button]:!px-2 [&>div>button]:!min-h-0 [&>div>button]:!h-auto [&>div>button]:!leading-tight min-w-[80px]"
                      options={(DENOMINACIONES[selectedDivisaForDecl] || []).map((d) => ({ value: d, label: stripSymbols(d) }))}
                      value={pendingCustom.denominacion}
                      onChange={(v) => setPendingCustom((prev) => prev ? { ...prev, denominacion: v } : null)}
                    />
                    <button
                      className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-white bg-[var(--color-verde-100)] rounded-corner-xs hover:brightness-90 transition-colors cursor-pointer"
                      onClick={() => {
                        const valorStr = pendingCustom.denominacion.replace(/[^0-9.,]/g, "").replace(",", "");
                        setCustomDeclaraciones((prev) => [...prev, { id: crypto.randomUUID(), ...pendingCustom, valorUnitario: parseFloat(valorStr) || 1 }]);
                        setPendingCustom(null);
                      }}
                    >
                      Agregar
                    </button>
                    <button
                      className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-[var(--color-neutro-600)] border border-[var(--color-neutro-300)] rounded-corner-xs hover:bg-[var(--color-neutro-100)] transition-colors cursor-pointer"
                      onClick={() => setPendingCustom(null)}
                    >
                      Cancelar
                    </button>
                  </div>
                )}
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => setShowDeclararModal(false)}>Cancelar</Button>
                  <Button variant="primary" size="sm" onClick={() => setDeclararPage("confirm")}>Declarar Diferencia</Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <p className="text-[13px] text-[var(--color-neutro-700)] font-medium mb-3">Confirme la declaración para <span className="font-bold">{selectedDivisaForDecl}</span></p>
            {(declaracionRows.some((r) => (declaredCantidad[`row:${r.denominacion}:${r.tipoPieza}:${r.clasificacion}`] ?? r.cantidadActual) !== r.cantidadActual) || customDeclaraciones.some((cr) => (declaredCantidad[`custom:${cr.id}`] ?? 0) > 0)) ? (
              <div className="overflow-auto max-h-[300px] border border-[var(--color-neutro-200)] rounded-corner-xs">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="bg-[var(--color-neutro-100)] border-b border-[var(--color-neutro-200)]">
                      <th className="px-3 py-2 text-left font-semibold text-[var(--color-neutro-600)]">Denominación</th>
                      <th className="px-3 py-2 text-center font-semibold text-[var(--color-neutro-600)]">Clasificación</th>
                      <th className="px-3 py-2 text-center font-semibold text-[var(--color-neutro-600)]">Tipo</th>
                      <th className="px-3 py-2 text-right font-semibold text-[var(--color-neutro-600)]">Actual</th>
                      <th className="px-3 py-2 text-right font-semibold text-[var(--color-neutro-600)]">Declarado</th>
                      <th className="px-3 py-2 text-right font-semibold text-[var(--color-neutro-600)]">Diferencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {declaracionRows.map((row) => {
                      const cantDeclarada = declaredCantidad[`row:${row.denominacion}:${row.tipoPieza}:${row.clasificacion}`] ?? row.cantidadActual;
                      const diff = cantDeclarada - row.cantidadActual;
                      if (diff === 0) return null;
                      return (
                        <tr key={`row:${row.denominacion}:${row.tipoPieza}:${row.clasificacion}`} className="border-b border-[var(--color-neutro-100)]">
                          <td className="px-3 py-2 font-medium">{stripSymbols(row.denominacion)}</td>
                          <td className="px-3 py-2 text-center">{row.clasificacion}</td>
                          <td className="px-3 py-2 text-center">{row.tipoPieza}</td>
                          <td className="px-3 py-2 text-right">{row.cantidadActual.toLocaleString("es-ES")}</td>
                          <td className="px-3 py-2 text-right">{cantDeclarada.toLocaleString("es-ES")}</td>
                          <td className={`px-3 py-2 text-right font-semibold ${diff > 0 ? "text-[var(--color-verde-100)]" : "text-[var(--color-ind-rojo)]"}`}>{diff > 0 ? `+${diff}` : diff}</td>
                        </tr>
                      );
                    })}
                    {customDeclaraciones.map((cr) => {
                      const cantDeclarada = declaredCantidad[`custom:${cr.id}`] ?? 0;
                      if (cantDeclarada === 0) return null;
                      return (
                        <tr key={`custom:${cr.id}`} className="border-b border-[var(--color-neutro-100)] bg-[var(--color-ind-azul)]/5">
                          <td className="px-3 py-2 font-medium">{stripSymbols(cr.denominacion)}</td>
                          <td className="px-3 py-2 text-center">{cr.clasificacion}</td>
                          <td className="px-3 py-2 text-center">{cr.tipoPieza}</td>
                          <td className="px-3 py-2 text-right">0</td>
                          <td className="px-3 py-2 text-right">{cantDeclarada.toLocaleString("es-ES")}</td>
                          <td className="px-3 py-2 text-right font-semibold text-[var(--color-verde-100)]">+{cantDeclarada}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-[12px] text-[var(--color-neutro-400)] text-center py-4">No hay diferencias declaradas</p>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={() => setDeclararPage("form")}>Volver</Button>
              <Button variant="primary" size="sm" onClick={() => { setShowDeclararModal(false); setDeclararPage("form"); setSelectedDivisaForDecl(""); setDeclaredCantidad({}); setCustomDeclaraciones([]); setPendingCustom(null); }}>Confirmar Declaración</Button>
            </div>
          </div>
        )}
      </Dialog>
  </>
  );
}
