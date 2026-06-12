import { Pencil, Trash2 } from "lucide-react";
import { Switch } from "@coe/design-system";
import { useDivisasStore } from "@stores/divisasStore";
import type { Denominacion } from "@stores/divisasStore";

interface DenominationTableProps {
  denominaciones: Denominacion[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function DenominationTable({ denominaciones, onEdit, onDelete }: DenominationTableProps) {
  const store = useDivisasStore();

  if (denominaciones.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-[var(--color-neutro-400)] text-[13px]">
        No hay denominaciones registradas para esta divisa
      </div>
    );
  }

  return (
    <table className="w-full text-[13px]">
      <thead className="bg-[var(--color-neutro-50)] text-[12px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide">
        <tr>
          <th className="text-left px-4 py-3">Nombre</th>
          <th className="text-center px-4 py-3">Tipo</th>
          <th className="text-right px-4 py-3">Valor</th>
          <th className="text-center px-4 py-3">Dimensiones (mm)</th>
          <th className="text-right px-4 py-3">Peso (g)</th>
          <th className="text-left px-4 py-3">Color</th>
          <th className="text-left px-4 py-3">Descripción</th>
          <th className="text-center px-4 py-3">Activo</th>
          <th className="text-right px-4 py-3 w-[80px]">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {denominaciones.map((d) => (
          <tr key={d.id} className={`border-t border-[var(--color-neutro-100)] hover:bg-[var(--color-neutro-50)] transition-colors ${!d.activo ? "opacity-50" : ""}`}>
            <td className="px-4 py-3 font-medium text-[var(--color-neutro-900)]">{d.nombre}</td>
            <td className="px-4 py-3 text-center">
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-corner-m ${d.tipo === "Billete" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                {d.tipo}
              </span>
            </td>
            <td className="px-4 py-3 text-right font-mono font-semibold text-[var(--color-neutro-900)]">{d.valor.toLocaleString()}</td>
            <td className="px-4 py-3 text-center font-mono text-[12px] text-[var(--color-neutro-500)]">
              {d.alto} × {d.ancho}
            </td>
            <td className="px-4 py-3 text-right font-mono text-[var(--color-neutro-600)]">{d.peso.toFixed(2)}</td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 rounded-corner-m border border-[var(--color-neutro-200)]" style={{ backgroundColor: d.color }} />
                <span className="text-[12px] text-[var(--color-neutro-500)]">{d.color}</span>
              </div>
            </td>
            <td className="px-4 py-3 text-[var(--color-neutro-500)] max-w-[200px] truncate">{d.descripcion}</td>
            <td className="px-4 py-3 text-center">
              <Switch checked={d.activo} onChange={(v) => store.updateDenominacion(d.id, { activo: v })} />
            </td>
            <td className="px-4 py-3 text-right">
              <div className="flex items-center justify-end gap-1">
                <button
                  className="p-1.5 rounded-corner-m hover:bg-[var(--color-neutro-100)] text-[var(--color-neutro-400)] transition-colors"
                  onClick={() => onEdit(d.id)}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  className="p-1.5 rounded-corner-m hover:bg-red-50 text-red-400 transition-colors"
                  onClick={() => onDelete(d.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
