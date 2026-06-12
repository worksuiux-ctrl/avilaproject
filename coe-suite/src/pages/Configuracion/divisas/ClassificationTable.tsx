import { Pencil, Trash2 } from "lucide-react";
import { Switch } from "@coe/design-system";
import { useDivisasStore } from "@stores/divisasStore";
import type { Clasificacion } from "@stores/divisasStore";

interface ClassificationTableProps {
  clasificaciones: Clasificacion[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ClassificationTable({ clasificaciones, onEdit, onDelete }: ClassificationTableProps) {
  const store = useDivisasStore();

  if (clasificaciones.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-[var(--color-neutro-400)] text-[13px]">
        No hay clasificaciones registradas
      </div>
    );
  }

  return (
    <table className="w-full text-[13px]">
      <thead className="bg-[var(--color-neutro-50)] text-[12px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide">
        <tr>
          <th className="text-left px-4 py-3">Nombre</th>
          <th className="text-left px-4 py-3">Descripción</th>
          <th className="text-left px-4 py-3">Color</th>
          <th className="text-center px-4 py-3">Activo</th>
          <th className="text-right px-4 py-3 w-[80px]">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {clasificaciones.map((c) => (
          <tr key={c.id} className={`border-t border-[var(--color-neutro-100)] hover:bg-[var(--color-neutro-50)] transition-colors ${!c.activo ? "opacity-50" : ""}`}>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="font-medium text-[var(--color-neutro-900)]">{c.nombre}</span>
              </div>
            </td>
            <td className="px-4 py-3 text-[var(--color-neutro-500)] max-w-[300px] truncate">{c.descripcion}</td>
            <td className="px-4 py-3 text-[12px] text-[var(--color-neutro-500)] font-mono">{c.color}</td>
            <td className="px-4 py-3 text-center">
              <Switch checked={c.activo} onChange={(v) => store.updateClasificacion(c.id, { activo: v })} />
            </td>
            <td className="px-4 py-3 text-right">
              <div className="flex items-center justify-end gap-1">
                <button
                  className="p-1.5 rounded-corner-m hover:bg-[var(--color-neutro-100)] text-[var(--color-neutro-400)] transition-colors"
                  onClick={() => onEdit(c.id)}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  className="p-1.5 rounded-corner-m hover:bg-red-50 text-red-400 transition-colors"
                  onClick={() => onDelete(c.id)}
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
