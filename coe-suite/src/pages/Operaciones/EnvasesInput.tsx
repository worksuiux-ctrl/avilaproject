import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Package, Shield, Truck, AlertCircle } from "lucide-react";
import { SearchableSelect } from "@components/ui/SearchableSelect";

export interface ClasificacionBatchItem {
  nombre: string;
  cantidad: number;
  valor: number;
  total: number;
  fajoId?: string;
  fajoNombre?: string | null;
  denominacionId?: string;
  denominacionNombre?: string;
  cantidadBilletes?: number;
}

export interface ClasificacionBatch {
  clasificacionId: string;
  clasificacionNombre: string | null;
  items: ClasificacionBatchItem[];
}

interface EnvaseRow {
  id: string;
  envase: string;
  precinto: string;
  clasificacionId: string;
  denominaciones: Record<string, number>;
}

interface EnvasesInputProps {
  value: string;
  onChange: (value: string) => void;
  batchData: ClasificacionBatch[];
  clasificaciones: { id: string; nombre: string; color: string }[];
}

let envIdCounter = 0;
function makeEnvId() { return `env-${++envIdCounter}`; }

function parseValue(v: string): EnvaseRow[] {
  try {
    const parsed = JSON.parse(v);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatNum(n: number): string {
  return n.toLocaleString("es-VE");
}

export function EnvasesInput({ value, onChange, batchData, clasificaciones }: EnvasesInputProps) {
  const activeBatch = batchData.filter((b) => b.items.some((i) => i.cantidad > 0));

  const [rows, setRows] = useState<EnvaseRow[]>(() => {
    const parsed = parseValue(value);
    if (parsed.length > 0) return parsed;
    if (activeBatch.length > 0) {
      return activeBatch.map((b) => ({
        id: makeEnvId(),
        envase: "",
        precinto: "",
        clasificacionId: b.clasificacionId,
        denominaciones: {},
      }));
    }
    return [];
  });

  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current && rows.length > 0 && !value) {
      initialized.current = true;
      onChange(JSON.stringify(rows));
    }
  }, []);

  useEffect(() => {
    const parsed = parseValue(value);
    if (parsed.length > 0 && JSON.stringify(parsed) !== JSON.stringify(rows)) {
      setRows(parsed);
    }
  }, [value]);

  function updateRows(newRows: EnvaseRow[]) {
    setRows(newRows);
    onChange(JSON.stringify(newRows));
  }

  function addRow() {
    const firstCla = activeBatch[0]?.clasificacionId ?? "";
    updateRows([...rows, { id: makeEnvId(), envase: "", precinto: "", clasificacionId: firstCla, denominaciones: {} }]);
  }

  function updateField(id: string, field: "envase" | "precinto" | "clasificacionId", val: string) {
    const newRows = rows.map((r) => (r.id === id ? { ...r, [field]: val, denominaciones: field === "clasificacionId" ? {} : r.denominaciones } : r));
    updateRows(newRows);
  }

  function updateDenom(id: string, label: string, qty: number) {
    updateRows(rows.map((r) =>
      r.id === id
        ? { ...r, denominaciones: { ...r.denominaciones, [label]: Math.max(0, qty || 0) } }
        : r,
    ));
  }

  function removeRow(id: string) {
    updateRows(rows.filter((r) => r.id !== id));
  }

  function getBatch(clasificacionId: string) {
    return activeBatch.find((b) => b.clasificacionId === clasificacionId);
  }

  function totalPerDenom(clasificacionId: string, label: string): number {
    return rows
      .filter((r) => r.clasificacionId === clasificacionId)
      .reduce((s, r) => s + (r.denominaciones[label] ?? 0), 0);
  }

  function remaining(clasificacionId: string, label: string): number {
    const batch = getBatch(clasificacionId);
    const item = batch?.items.find((i) => i.nombre === label);
    if (!item) return 0;
    return item.cantidad - totalPerDenom(clasificacionId, label);
  }

  function isClasificationValid(clasificacionId: string): boolean {
    const batch = getBatch(clasificacionId);
    if (!batch) return true;
    return batch.items.every((i) => remaining(clasificacionId, i.nombre) >= 0);
  }

  const allValid = activeBatch.every((b) => isClasificationValid(b.clasificacionId));

  const envaseVals = rows.map((r) => r.envase.trim()).filter(Boolean);
  const precintoVals = rows.map((r) => r.precinto.trim()).filter(Boolean);
  const dupEnvases = new Set(envaseVals.filter((v, i, a) => a.indexOf(v) !== i));
  const dupPrecintos = new Set(precintoVals.filter((v, i, a) => a.indexOf(v) !== i));

  return (
    <div className="space-y-3">
      {rows.map((r, ri) => {
        const batch = getBatch(r.clasificacionId);
        const cla = clasificaciones.find((c) => c.id === r.clasificacionId);
        return (
          <div key={r.id} className="border border-[var(--color-neutro-200)] border-l-2 rounded-lg bg-white shadow-sm overflow-hidden" style={cla ? { borderLeftColor: cla.color } : undefined}>
            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[var(--color-neutro-50)] to-white border-b border-[var(--color-neutro-200)]">
              <div className="flex items-center gap-2 shrink-0">
                <Package className="w-4 h-4 text-[var(--color-neutro-400)]" />
                <span className="text-[13px] font-bold text-[var(--color-neutro-700)]">Envase #{ri + 1}</span>
              </div>
              <div className="flex items-center gap-2 flex-1 flex-wrap">
                <div className="flex flex-col gap-0.5">
                  <label className="text-[9px] font-semibold text-[var(--color-neutro-400)] uppercase tracking-wide">N° Envase</label>
                  <input
                    value={r.envase}
                    onChange={(e) => updateField(r.id, "envase", e.target.value)}
                    className={`text-[14px] px-3 py-1.5 rounded-md border outline-none bg-white w-32 font-medium ${dupEnvases.has(r.envase.trim()) ? "border-red-400 ring-1 ring-red-200" : "border-[var(--color-neutro-200)] focus:border-[var(--color-verde-100)] focus:ring-1 focus:ring-[var(--color-verde-100)]"}`}
                    placeholder="Ej: ENV-001"
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <label className="text-[9px] font-semibold text-[var(--color-neutro-400)] uppercase tracking-wide">N° Precinto</label>
                  <input
                    value={r.precinto}
                    onChange={(e) => updateField(r.id, "precinto", e.target.value)}
                    className={`text-[14px] px-3 py-1.5 rounded-md border outline-none bg-white w-32 font-medium ${dupPrecintos.has(r.precinto.trim()) ? "border-red-400 ring-1 ring-red-200" : "border-[var(--color-neutro-200)] focus:border-[var(--color-verde-100)] focus:ring-1 focus:ring-[var(--color-verde-100)]"}`}
                    placeholder="Ej: PREC-001"
                  />
                </div>
                {activeBatch.length > 1 && (
                  <div className="flex flex-col gap-0.5 min-w-[180px]">
                    <label className="text-[9px] font-semibold text-[var(--color-neutro-400)] uppercase tracking-wide">Clasificación</label>
                    <SearchableSelect
                      options={activeBatch.map((b) => ({ value: b.clasificacionId, label: b.clasificacionNombre ?? "Sin nombre" }))}
                      value={r.clasificacionId}
                      onChange={(v) => updateField(r.id, "clasificacionId", v)}
                      placeholder="Seleccionar..."
                      searchPlaceholder="Buscar..."
                    />
                  </div>
                )}
                {activeBatch.length <= 1 && cla && (
                  <div className="flex items-center gap-1.5 ml-1 mt-4">
                    <span className="text-[12px] font-medium text-[var(--color-neutro-600)]">{cla.nombre}</span>
                  </div>
                )}
              </div>
              <button
                type="button"
                className="p-1.5 rounded-md hover:bg-red-50 text-[var(--color-neutro-400)] hover:text-red-500 transition-colors cursor-pointer mt-4"
                onClick={() => removeRow(r.id)}
                title="Eliminar envase"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Fajo distribution */}
            {batch && batch.items.some((i) => i.cantidad > 0) && (
              <div className="px-4 py-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-[var(--color-neutro-400)]" />
                  <p className="text-[11px] font-bold text-[var(--color-neutro-500)] uppercase tracking-wide">Distribución de fajos</p>
                </div>
                <div className="space-y-1.5">
                  {batch.items.map((item) => {
                    const qty = r.denominaciones[item.nombre] ?? 0;
                    const disp = item.cantidad - (totalPerDenom(r.clasificacionId, item.nombre) - qty);
                    const over = qty > disp;
                    return item.cantidad > 0 ? (
                      <div key={item.nombre} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[var(--color-neutro-50)] transition-colors">
                        <div className="flex-1 min-w-0">
                          <span className="text-[13px] font-medium text-[var(--color-neutro-800)]">{item.nombre}</span>
                          <span className="text-[11px] text-[var(--color-neutro-400)] ml-2">
                            {item.valor > 0 && <span className="font-semibold text-[var(--color-verde-100)]">${formatNum(item.valor)}</span>}
                            {item.cantidadBilletes && item.cantidadBilletes > 1 ? ` × ${item.cantidadBilletes} billetes` : ""}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex flex-col items-end">
                            <input
                              type="number"
                              min={0}
                              value={qty || ""}
                              onChange={(e) => updateDenom(r.id, item.nombre, parseInt(e.target.value) || 0)}
                              className={`w-24 text-[16px] font-bold text-right px-3 py-1.5 rounded-md border outline-none bg-white ${over ? "border-red-400 ring-1 ring-red-200 text-red-600" : "border-[var(--color-neutro-200)] focus:border-[var(--color-verde-100)] focus:ring-1 focus:ring-[var(--color-verde-100)]"}`}
                              placeholder="0"
                            />
                          </div>
                          <div className="flex flex-col items-start min-w-[80px]">
                            <span className={`text-[10px] ${disp > 0 ? "text-[var(--color-neutro-400)]" : "text-green-600 font-semibold"}`}>disponible</span>
                            <span className={`text-[13px] font-bold ${disp > 0 ? "text-[var(--color-neutro-600)]" : "text-green-600"}`}>{formatNum(disp)}</span>
                          </div>
                          {qty > 0 && (
                            <div className="flex flex-col items-start min-w-[60px]">
                              <span className="text-[10px] text-[var(--color-verde-100)]">asignado</span>
                              <span className="text-[13px] font-bold text-[var(--color-verde-100)]">{formatNum(qty)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}
            {(!batch || !batch.items.some((i) => i.cantidad > 0)) && (
              <div className="px-4 py-3">
                <p className="text-[12px] text-[var(--color-neutro-400)] italic flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  No hay denominaciones disponibles para esta clasificación.
                </p>
              </div>
            )}
          </div>
        );
      })}

      {/* Totales por clasificación */}
      {rows.length > 0 && activeBatch.map((b) => {
        const cla = clasificaciones.find((c) => c.id === b.clasificacionId);
        const totals = b.items.filter((i) => i.cantidad > 0).map((i) => {
          const total = totalPerDenom(b.clasificacionId, i.nombre);
          const rem = remaining(b.clasificacionId, i.nombre);
          return { ...i, total, rem };
        });
        const hasAny = totals.some((t) => t.total > 0);
        if (!hasAny) return null;
        return (
          <div key={b.clasificacionId} className="border border-[var(--color-neutro-200)] border-l-2 rounded-lg bg-white overflow-hidden shadow-sm" style={cla ? { borderLeftColor: cla.color } : undefined}>
            <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[var(--color-neutro-50)] to-white border-b border-[var(--color-neutro-200)]">
              <Truck className="w-4 h-4 text-[var(--color-neutro-400)]" />
              <p className="text-[12px] font-bold text-[var(--color-neutro-700)]">{cla?.nombre ?? "Sin clasificación"} — Totales por fajo</p>
            </div>
            <div className="px-4 py-2.5">
              <div className="grid grid-cols-2 gap-2">
                {totals.map((t) => (
                  <div key={t.nombre} className="flex items-center justify-between px-3 py-2 rounded-md bg-[var(--color-neutro-50)]">
                    <span className="text-[12px] font-medium text-[var(--color-neutro-600)]">{t.nombre}</span>
                    <span className={`text-[14px] font-bold ${t.rem < 0 ? "text-red-600" : t.total === t.cantidad ? "text-green-700" : "text-[var(--color-neutro-900)]"}`}>
                      {formatNum(t.total)} / {formatNum(t.cantidad)}
                      {t.total > 0 && t.rem >= 0 && t.cantidad - t.total > 0 && (
                        <span className="text-[11px] text-amber-600 font-normal ml-1">(falta {formatNum(t.cantidad - t.total)})</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}

      <button
        type="button"
        className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold rounded-lg border-2 border-dashed border-[var(--color-neutro-300)] text-[var(--color-neutro-500)] hover:border-[var(--color-verde-100)] hover:text-[var(--color-verde-100)] hover:bg-green-50/50 bg-white transition-colors cursor-pointer w-full justify-center"
        onClick={addRow}
      >
        <Plus className="w-4 h-4" />
        Agregar envase
      </button>

      {rows.length === 0 && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[var(--color-neutro-50)] border border-[var(--color-neutro-200)]">
          <Package className="w-4 h-4 text-[var(--color-neutro-400)]" />
          <p className="text-[12px] text-[var(--color-neutro-500)]">Agregue envases y distribuya las denominaciones en cada uno</p>
        </div>
      )}

      {/* Validation messages */}
      <div className="space-y-1">
        {!allValid && (
          <p className="text-[12px] text-red-600 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            Hay denominaciones que exceden la cantidad disponible. Verifique la distribución.
          </p>
        )}
        {dupEnvases.size > 0 && (
          <p className="text-[12px] text-red-600 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            Números de envase duplicados: {[...dupEnvases].join(", ")}.
          </p>
        )}
        {dupPrecintos.size > 0 && (
          <p className="text-[12px] text-red-600 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            Números de precinto duplicados: {[...dupPrecintos].join(", ")}.
          </p>
        )}
      </div>
    </div>
  );
}
