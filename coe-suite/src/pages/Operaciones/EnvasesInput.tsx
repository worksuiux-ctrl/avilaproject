import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Package } from "lucide-react";
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
  clasificaciones: { id: string; nombre: string }[];
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
    <div className="space-y-2">
      {rows.map((r, ri) => {
        const batch = getBatch(r.clasificacionId);
        const cla = clasificaciones.find((c) => c.id === r.clasificacionId);
        return (
          <div key={r.id} className="border border-[var(--color-neutro-200)] rounded-corner-m bg-white" style={cla ? { borderLeftColor: cla.color, borderLeftWidth: 4 } : undefined}>
                <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--color-neutro-100)] bg-[var(--color-neutro-50)] flex-wrap">
              <span className="text-[13px] font-semibold text-[var(--color-neutro-600)] shrink-0">Envase #{ri + 1}</span>
              <input
                value={r.envase}
                onChange={(e) => updateField(r.id, "envase", e.target.value)}
                className={`text-[14px] px-2.5 py-1 rounded-corner-m border outline-none bg-white w-28 ${dupEnvases.has(r.envase.trim()) ? "border-red-400" : "border-[var(--color-neutro-200)] focus:border-[var(--color-verde-100)]"}`}
                placeholder="N° envase"
              />
              <input
                value={r.precinto}
                onChange={(e) => updateField(r.id, "precinto", e.target.value)}
                className={`text-[14px] px-2.5 py-1 rounded-corner-m border outline-none bg-white w-28 ${dupPrecintos.has(r.precinto.trim()) ? "border-red-400" : "border-[var(--color-neutro-200)] focus:border-[var(--color-verde-100)]"}`}
                placeholder="N° precinto"
              />
              {activeBatch.length > 1 && (
                <div className="w-44">
                  <SearchableSelect
                    options={activeBatch.map((b) => ({ value: b.clasificacionId, label: b.clasificacionNombre ?? "Sin nombre" }))}
                    value={r.clasificacionId}
                    onChange={(v) => updateField(r.id, "clasificacionId", v)}
                    placeholder="Clasificación..."
                    searchPlaceholder="Buscar..."
                  />
                </div>
              )}
              {activeBatch.length <= 1 && cla && (
                <span className="text-[12px] text-[var(--color-neutro-500)] ml-1">{cla.nombre}</span>
              )}
              <button
                type="button"
                className="ml-auto p-1 rounded hover:bg-red-50 text-[var(--color-neutro-400)] hover:text-red-500 transition-colors cursor-pointer"
                onClick={() => removeRow(r.id)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            {batch && batch.items.some((i) => i.cantidad > 0) && (
                <div className="px-3 py-2 space-y-1.5">
                <p className="text-[12px] font-medium text-[var(--color-neutro-700)] px-1">
                  {cla ? `${cla.nombre} — ` : ""}Distribución de fajos por envase
                </p>
                <div className="space-y-1.5">
                  {batch.items.map((item) => {
                    const qty = r.denominaciones[item.nombre] ?? 0;
                    const disp = item.cantidad - (totalPerDenom(r.clasificacionId, item.nombre) - qty);
                    const over = qty > disp;
                    return item.cantidad > 0 ? (
                      <div key={item.nombre} className="flex items-center gap-3 px-2 py-1 hover:bg-[var(--color-neutro-50)] rounded-corner-m">
                        <span className="text-[13px] text-[var(--color-neutro-700)] w-[180px] shrink-0">{item.nombre}</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min={0}
                            value={qty || ""}
                            onChange={(e) => updateDenom(r.id, item.nombre, parseInt(e.target.value) || 0)}
                            className={`w-28 text-[15px] font-medium text-right px-3 py-1.5 rounded-corner-m border outline-none bg-white ${over ? "border-red-400 text-red-600" : "border-[var(--color-neutro-200)] focus:border-[var(--color-verde-100)] focus:ring-1 focus:ring-[var(--color-verde-100)]"}`}
                            placeholder="0"
                          />
                          <span className={`text-[12px] whitespace-nowrap ${disp > 0 ? "text-[var(--color-neutro-400)]" : "text-green-600 font-medium"}`}>
                            / {disp.toLocaleString()} fajos
                          </span>
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}
            {(!batch || !batch.items.some((i) => i.cantidad > 0)) && (
              <div className="px-3 py-2">
                <p className="text-[11px] text-[var(--color-neutro-400)] italic">No hay denominaciones disponibles para esta clasificación.</p>
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
          <div key={b.clasificacionId} className="border border-[var(--color-neutro-200)] rounded-corner-m bg-white px-4 py-2.5" style={{ borderLeftColor: cla?.color, borderLeftWidth: 4 }}>
            <p className="text-[12px] font-semibold text-[var(--color-neutro-700)] mb-2">{cla?.nombre ?? "Sin clasificación"} — Totales por fajo</p>
            <div className="space-y-0.5">
              {totals.map((t) => (
                <div key={t.nombre} className="flex items-center gap-2 text-[13px]">
                  <span className="text-[var(--color-neutro-500)] w-[140px] shrink-0">{t.nombre}</span>
                  <span className={`font-semibold ${t.rem < 0 ? "text-red-600" : t.total === t.cantidad ? "text-green-700" : "text-[var(--color-neutro-900)]"}`}>
                    {t.total.toLocaleString()} / {t.cantidad.toLocaleString()}
                  </span>
                  {t.total > 0 && t.rem >= 0 && t.cantidad - t.total > 0 && (
                    <span className="text-[11px] text-[var(--color-neutro-400)]">(falta {(t.cantidad - t.total).toLocaleString()})</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <button
        type="button"
        className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-corner-m border border-dashed border-[var(--color-neutro-300)] text-[var(--color-neutro-500)] hover:border-[var(--color-verde-100)] hover:text-[var(--color-verde-100)] bg-white transition-colors cursor-pointer"
        onClick={addRow}
      >
        <Plus className="w-3.5 h-3.5" />
        Agregar envase
      </button>

      {rows.length === 0 && (
        <p className="text-[11px] text-[var(--color-neutro-400)] italic flex items-center gap-1.5">
          <Package className="w-3.5 h-3.5" />
          Agregue envases y distribuya las denominaciones en cada uno
        </p>
      )}

      {!allValid && (
        <p className="text-[11px] text-red-600">Hay denominaciones que exceden la cantidad disponible en su clasificación. Verifique la distribución.</p>
      )}
      {dupEnvases.size > 0 && (
        <p className="text-[11px] text-red-600">Números de envase duplicados: {[...dupEnvases].join(", ")}. Cada envase debe tener un número único.</p>
      )}
      {dupPrecintos.size > 0 && (
        <p className="text-[11px] text-red-600">Números de precinto duplicados: {[...dupPrecintos].join(", ")}. Cada precinto debe tener un número único.</p>
      )}
    </div>
  );
}
