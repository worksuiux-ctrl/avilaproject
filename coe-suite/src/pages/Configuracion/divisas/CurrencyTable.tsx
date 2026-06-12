import { Pencil, Trash2 } from "lucide-react";
import type { Divisa } from "@stores/divisasStore";

interface CurrencyTableProps {
  divisas: Divisa[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function CurrencyTable({ divisas, onEdit, onDelete }: CurrencyTableProps) {
  if (divisas.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-[var(--color-neutro-400)] text-[13px]">
        No hay divisas registradas
      </div>
    );
  }

  return (
    <table className="w-full text-[13px]">
      <thead className="bg-[var(--color-neutro-50)] text-[12px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide">
        <tr>
          <th className="text-left px-4 py-3">Nombre</th>
          <th className="text-left px-4 py-3">Código ISO</th>
          <th className="text-left px-4 py-3">Símbolo</th>
          <th className="text-left px-4 py-3">País / Región</th>
          <th className="text-left px-4 py-3">Tipo</th>
          <th className="text-right px-4 py-3">Tasa Cambio</th>
          <th className="text-right px-4 py-3">Redondeo</th>
          <th className="text-center px-4 py-3">Estado</th>
          <th className="text-right px-4 py-3 w-[80px]">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {divisas.map((d) => (
          <tr key={d.id} className={`border-t border-[var(--color-neutro-100)] hover:bg-[var(--color-neutro-50)] transition-colors ${!d.activo ? "opacity-50" : ""}`}>
            <td className="px-4 py-3 font-medium text-[var(--color-neutro-900)]">{d.nombre}</td>
            <td className="px-4 py-3 font-mono text-[12px] text-[var(--color-neutro-500)]">{d.codigoISO}</td>
            <td className="px-4 py-3 text-[var(--color-neutro-700)]">{d.simbolo}</td>
            <td className="px-4 py-3 text-[var(--color-neutro-600)]">{d.paisOrigen}</td>
            <td className="px-4 py-3">
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-corner-m bg-[var(--color-verde-100)]/10 text-[var(--color-verde-100)]">
                {d.tipoMoneda}
              </span>
            </td>
            <td className="px-4 py-3 text-right font-mono text-[var(--color-neutro-700)]">{d.tasaCambio}</td>
            <td className="px-4 py-3 text-right font-mono text-[var(--color-neutro-500)]">{d.factorRedondeo}</td>
            <td className="px-4 py-3 text-center">
              <span className={`inline-block w-2 h-2 rounded-full ${d.activo ? "bg-green-500" : "bg-red-400"}`} />
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
