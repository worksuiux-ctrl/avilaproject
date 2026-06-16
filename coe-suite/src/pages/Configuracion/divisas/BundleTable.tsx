import { Pencil, Trash2 } from "lucide-react";
import { Switch } from "@coe/design-system";
import { useDivisasStore } from "@stores/divisasStore";
import type { Fajo } from "@stores/divisasStore";

interface BundleTableProps {
  fajos: Fajo[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function BundleTable({ fajos, onEdit, onDelete }: BundleTableProps) {
  const store = useDivisasStore();

  if (fajos.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-[var(--color-neutro-400)] text-[13px]">
        No hay configuraciones de fajos registradas
      </div>
    );
  }

  return (
    <table className="w-full text-[13px]">
      <thead className="bg-[var(--color-neutro-50)] text-[12px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide">
        <tr>
          <th className="text-left px-4 py-3">Divisa</th>
          <th className="text-left px-4 py-3">Denominación</th>
          <th className="text-left px-4 py-3">Nombre del Fajo</th>
          <th className="text-right px-4 py-3">Cantidad</th>
          <th className="text-right px-4 py-3">Peso Unit. (g)</th>
          <th className="text-right px-4 py-3">Peso Total (g)</th>
          <th className="text-center px-4 py-3">Activo</th>
          <th className="text-right px-4 py-3 w-[80px]">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {fajos.map((f) => {
          const denom = store.getDenominacionById(f.denominacionId);
          const div = denom ? store.getDivisaById(denom.divisaId) : null;
          return (
            <tr key={f.id} className={`border-t border-[var(--color-neutro-100)] hover:bg-[var(--color-neutro-50)] transition-colors ${!f.activo ? "opacity-50" : ""}`}>
              <td className="px-4 py-3">
                {div ? (
                  <span className="font-medium text-[var(--color-neutro-900)]">{div.codigoISO}</span>
                ) : (
                  <span className="text-[var(--color-neutro-400)]">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-[var(--color-neutro-700)]">{denom?.nombre ?? "—"}</td>
              <td className="px-4 py-3 font-medium text-[var(--color-neutro-900)]">{f.nombre}</td>
              <td className="px-4 py-3 text-right font-mono font-semibold text-[var(--color-neutro-900)]">{f.cantidadUnidades.toLocaleString()}</td>
              <td className="px-4 py-3 text-right font-mono text-[var(--color-neutro-500)]">{denom ? denom.peso.toFixed(2) : "—"}</td>
              <td className="px-4 py-3 text-right font-mono text-[var(--color-neutro-600)]">{f.pesoEstimado.toFixed(2)}</td>
              <td className="px-4 py-3 text-center">
                <Switch checked={f.activo} onChange={(v) => store.updateFajo(f.id, { activo: v })} />
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-1">
                  <button
                    className="p-1.5 rounded-corner-m hover:bg-[var(--color-neutro-100)] text-[var(--color-neutro-400)] transition-colors"
                    onClick={() => onEdit(f.id)}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    className="p-1.5 rounded-corner-m hover:bg-red-50 text-red-400 transition-colors"
                    onClick={() => onDelete(f.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
