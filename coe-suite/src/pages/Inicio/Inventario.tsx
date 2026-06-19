import { useState, useMemo, useRef } from "react";
import { ChevronDown, ChevronUp, GripVertical, Plus } from "lucide-react";
import { Button, Select } from "@coe/design-system";
import { EntityTree } from "@components/entities";
import { useEntitiesStore } from "@stores/entitiesStore";

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

const ALL_COLUMNS: ColumnDef[] = [
  { key: "tipoPieza", label: "Tipo de Pieza", alwaysVisible: true, getValue: (i) => i.tipoPieza },
  { key: "clasificacion", label: "Clasificación", alwaysVisible: true, getValue: (i) => i.clasificacion },
  { key: "denominacion", label: "Denominación", alwaysVisible: true, getValue: (i) => i.denominacion },
  { key: "cantidadDisponible", label: "Cantidad Disponible", alwaysVisible: true, getValue: (i) => i.cantidadDisponible },
  { key: "montoDisponible", label: "Monto Disponible", alwaysVisible: true, getValue: (i) => i.montoDisponible },
  { key: "cantidadCierre", label: "Cantidad Cierre", alwaysVisible: false, getValue: (i) => i.cantidadCierre },
  { key: "montoCierre", label: "Monto Cierre", alwaysVisible: false, getValue: (i) => i.montoCierre },
  { key: "cantidadTotal", label: "Cantidad Total", alwaysVisible: false, getValue: (i) => i.cantidadTotal },
  { key: "montoTotal", label: "Monto Total", alwaysVisible: false, getValue: (i) => i.montoTotal },
];

type SortDir = "asc" | "desc" | null;

function formatCurrency(value: number, divisa: string): string {
  const symbols: Record<string, string> = { USD: "$", EUR: "€", VED: "Bs.", COP: "$" };
  const sym = symbols[divisa] || "$";
  return `${sym}${value.toLocaleString("es-ES")}`;
}

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

  const [dragColKey, setDragColKey] = useState<string | null>(null);
  const dragOverIdx = useRef<number | null>(null);

  const rawData = useMemo(() => {
    if (!selectedId) return [];
    return generateMockInventory(selectedId);
  }, [selectedId]);

  const filtered = useMemo(() => {
    let data = rawData;
    if (divisa !== "todas") data = data.filter((i) => i.divisa === divisa);
    if (clasificacion !== "todas") data = data.filter((i) => i.clasificacion === clasificacion);
    if (tipoPieza !== "todos") data = data.filter((i) => i.tipoPieza === tipoPieza);
    return data;
  }, [rawData, divisa, clasificacion, tipoPieza]);

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
      .map((key) => ALL_COLUMNS.find((c) => c.key === key)!)
      .filter((c) => !hiddenColumns.has(c.key));
  }, [columnOrder, hiddenColumns]);

  const montoTotal = useMemo(() => {
    return sorted.reduce((sum, i) => sum + i.montoDisponible, 0);
  }, [sorted]);

  const selectedDivisa = divisa !== "todas" ? divisa : "USD";

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

  const bovedaOptions = BOVEDA_OPTIONS_BY_ENTITY[selectedId ?? ""] ?? BOVEDA_OPTIONS_BY_ENTITY.default;
  const anaquelOptions = ANAQUEL_OPTIONS_BY_ENTITY[selectedId ?? ""] ?? ANAQUEL_OPTIONS_BY_ENTITY.default;

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-[18px] font-bold text-[var(--color-neutro-900)]">Inventario</h1>
          <p className="text-[13px] text-[var(--color-neutro-500)]">
            Consulta y ajuste de inventario por entidad, divisa y clasificación
          </p>
        </div>
        <button className="inline-flex items-center justify-center gap-gap-xs font-semibold rounded-corner-m transition-colors cursor-pointer bg-surface-green border border-surface-white text-neutro-white hover:brightness-90 active:brightness-75 disabled:bg-neutro-300 disabled:text-neutro-500 disabled:border-transparent py-4 px-6 text-base ml-auto">Ajustar inventario</button>
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

        <div className="flex-1 flex flex-col gap-4 min-h-0 overflow-y-auto">
          {selectedEntity ? (
            <>
              <div className="flex items-center gap-1 flex-wrap">
                  <Select options={DIVISA_OPTIONS} value={divisa} onChange={setDivisa} />
                  <Select options={CLASIFICACION_OPTIONS} value={clasificacion} onChange={setClasificacion} />
                  <Select options={TIPO_PIEZA_OPTIONS} value={tipoPieza} onChange={setTipoPieza} />
                  <Select options={bovedaOptions} value={boveda} onChange={setBoveda} />
                  <Select options={anaquelOptions} value={anaquel} onChange={setAnaquel} />
                  <button className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-[12px] font-medium rounded-corner-m border border-[var(--color-neutro-300)] text-[var(--color-neutro-700)] hover:bg-[var(--color-neutro-100)] transition-colors ml-auto">Limpiar filtros</button>
                </div>

              <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m p-5">
                <p className="text-[11px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide mb-1">
                  Monto Total · {selectedEntity.nombre}
                </p>
                <p className="text-[36px] font-bold text-[var(--color-verde-100)] leading-none tracking-tight">
                  {formatCurrency(montoTotal, selectedDivisa)}
                </p>
                <p className="text-[12px] text-[var(--color-neutro-400)] mt-1">
                  {sorted.length} registros · {filtered.length !== sorted.length && `${filtered.length} filtrados`}
                </p>
              </div>

              <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="border-b border-[var(--color-neutro-200)] bg-[var(--color-neutro-50)]">
                        {visibleColumns.map((col, idx) => (
                          <th
                            key={col.key}
                                            draggable
                            onDragStart={() => handleDragStart(col.key)}
                            onDragOver={(e) => handleDragOver(e, idx)}
                            onDrop={() => handleDrop(col.key)}
                            onDragEnd={() => setDragColKey(null)}
                            className={`px-3 py-2.5 text-left text-[11px] font-semibold text-[var(--color-neutro-600)] uppercase tracking-wide cursor-pointer select-none whitespace-nowrap ${
                              dragColKey === col.key ? "opacity-50" : ""
                            } ${dragOverIdx.current === idx ? "bg-[var(--color-verde-100)]/10" : ""}`}
                            onClick={() => handleSort(col.key)}
                          >
                            <div className="flex items-center gap-1">
                              <GripVertical className="w-3 h-3 text-[var(--color-neutro-300)] cursor-grab shrink-0" />
                              <span>{col.label}</span>
                              {sortKey === col.key && (
                                sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                              )}
                            </div>
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
                                {ALL_COLUMNS.filter((c) => !c.alwaysVisible).map((col) => (
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
                                    {col.label}
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sorted.length === 0 ? (
                        <tr>
                          <td
                            colSpan={visibleColumns.length + 1}
                            className="px-3 py-8 text-center text-[13px] text-[var(--color-neutro-400)]"
                          >
                            No se encontraron registros de inventario
                          </td>
                        </tr>
                      ) : sorted.map((item) => (
                        <tr
                          key={item.id}
                          className="border-b border-[var(--color-neutro-100)] hover:bg-[var(--color-neutro-50)] transition-colors"
                        >
                          {visibleColumns.map((col) => (
                            <td key={col.key} className="px-3 py-2 text-[12px] text-[var(--color-neutro-700)] whitespace-nowrap">
                              {["montoDisponible", "montoCierre", "montoTotal"].includes(col.key)
                                ? formatCurrency(Number(col.getValue(item)), item.divisa)
                                : col.getValue(item)}
                            </td>
                          ))}
                          <td className="px-3 py-2" />
                        </tr>
                      ))}
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
  );
}
