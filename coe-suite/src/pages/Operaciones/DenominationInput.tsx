import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

interface DenominationRow {
  id: string;
  denominacion: string;
  cantidad: number;
  total: number;
}

interface DenominationInputProps {
  value: string;
  onChange: (value: string) => void;
}

let denomIdCounter = 0;
function makeDenomId() { return `denom-${++denomIdCounter}`; }

const DENOMINACIONES_PREDEFINIDAS = [
  { label: "Billetes de $100", valor: 100 },
  { label: "Billetes de $50", valor: 50 },
  { label: "Billetes de $20", valor: 20 },
  { label: "Billetes de $10", valor: 10 },
  { label: "Billetes de $5", valor: 5 },
  { label: "Billetes de $2", valor: 2 },
  { label: "Billetes de $1", valor: 1 },
  { label: "Monedas de $0.25", valor: 0.25 },
  { label: "Monedas de $0.10", valor: 0.10 },
  { label: "Monedas de $0.05", valor: 0.05 },
  { label: "Monedas de $0.01", valor: 0.01 },
];

function parseValue(v: string): DenominationRow[] {
  try {
    return JSON.parse(v);
  } catch {
    return [];
  }
}

export function DenominationInput({ value, onChange }: DenominationInputProps) {
  const [rows, setRows] = useState<DenominationRow[]>(() => parseValue(value));

  function updateRows(newRows: DenominationRow[]) {
    setRows(newRows);
    onChange(JSON.stringify(newRows.filter((r) => r.cantidad > 0)));
  }

  function addRow(denom: { label: string; valor: number }) {
    const exists = rows.find((r) => r.denominacion === denom.label);
    if (exists) return;
    const newRows = [...rows, { id: makeDenomId(), denominacion: denom.label, cantidad: 0, total: 0 }];
    updateRows(newRows);
  }

  function updateCantidad(id: string, cantidad: number) {
    const newRows = rows.map((r) =>
      r.id === id
        ? { ...r, cantidad, total: cantidad * DENOMINACIONES_PREDEFINIDAS.find((d) => d.label === r.denominacion)?.valor! }
        : r,
    );
    updateRows(newRows);
  }

  function removeRow(id: string) {
    updateRows(rows.filter((r) => r.id !== id));
  }

  const granTotal = rows.reduce((sum, r) => sum + r.total, 0);
  const disponibles = DENOMINACIONES_PREDEFINIDAS.filter((d) => !rows.some((r) => r.denominacion === d.label));

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 mb-2">
        {disponibles.map((d) => (
          <button
            key={d.valor}
            type="button"
            className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-corner-m border border-[var(--color-neutro-200)] bg-white text-[var(--color-neutro-600)] hover:border-[var(--color-verde-100)] hover:text-[var(--color-verde-100)] transition-colors cursor-pointer"
            onClick={() => addRow(d)}
          >
            <Plus className="w-3 h-3" />
            {d.label}
          </button>
        ))}
      </div>

      {rows.length > 0 && (
        <div className="border border-[var(--color-neutro-200)] rounded-corner-m overflow-hidden">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="bg-[var(--color-neutro-50)]">
                <th className="text-left px-3 py-1.5 font-semibold text-[var(--color-neutro-600)]">Denominación</th>
                <th className="text-right px-3 py-1.5 font-semibold text-[var(--color-neutro-600)]">Cantidad</th>
                <th className="text-right px-3 py-1.5 font-semibold text-[var(--color-neutro-600)]">Total</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-[var(--color-neutro-100)]">
                  <td className="px-3 py-1.5 text-[var(--color-neutro-700)]">{r.denominacion}</td>
                  <td className="px-3 py-1.5">
                    <input
                      type="number"
                      min={0}
                      value={r.cantidad || ""}
                      onChange={(e) => updateCantidad(r.id, Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full text-right text-[13px] px-2 py-0.5 rounded-corner-m border border-[var(--color-neutro-200)] outline-none focus:border-[var(--color-verde-100)] bg-white"
                      placeholder="0"
                    />
                  </td>
                  <td className="px-3 py-1.5 text-right font-medium text-[var(--color-neutro-900)]">
                    ${r.total.toLocaleString()}
                  </td>
                  <td className="px-1 py-1.5">
                    <button
                      type="button"
                      className="p-1 rounded hover:bg-red-50 text-[var(--color-neutro-400)] hover:text-red-500 transition-colors cursor-pointer"
                      onClick={() => removeRow(r.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-[var(--color-neutro-200)] bg-[var(--color-neutro-50)]">
                <td className="px-3 py-1.5 font-bold text-[var(--color-neutro-900)]" colSpan={2}>Total general</td>
                <td className="px-3 py-1.5 text-right font-bold text-[var(--color-verde-100)]">
                  ${granTotal.toLocaleString()}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {rows.length === 0 && (
        <p className="text-[11px] text-[var(--color-neutro-400)] italic">
          Seleccione las denominaciones a incluir
        </p>
      )}
    </div>
  );
}
