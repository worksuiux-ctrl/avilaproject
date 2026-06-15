import { Input } from "@coe/design-system";
import { GripVertical, Eye, EyeOff } from "lucide-react";
import type { ReporteColumn } from "../data/reportesTypes";

interface ColumnManagerProps {
  columns: ReporteColumn[];
  onToggleVisibility: (key: string) => void;
  onRename: (key: string, newLabel: string) => void;
  onReorder: (key: string, direction: "up" | "down") => void;
}

export function ColumnManager({ columns, onToggleVisibility, onRename, onReorder }: ColumnManagerProps) {
  const visibleColumns = columns.filter((c) => c.visible).sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-2">
      <div className="space-y-1 max-h-[300px] overflow-y-auto">
        {columns
          .sort((a, b) => a.order - b.order)
          .map((col) => {
            const idx = visibleColumns.findIndex((c) => c.key === col.key);
            return (
              <div
                key={col.key}
                className="flex items-center gap-2 px-2 py-1.5 rounded-corner-m bg-white border border-[var(--color-neutro-200)]"
              >
                <span className="shrink-0 text-[var(--color-neutro-400)] cursor-grab">
                  <GripVertical className="w-3.5 h-3.5" />
                </span>
                <Input
                  value={col.label}
                  onChange={(e) => onRename(col.key, e.target.value)}
                  className="flex-1 min-w-0 text-[13px] !h-7"
                />
                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    className="p-1 rounded hover:bg-[var(--color-neutro-100)] text-[var(--color-neutro-400)] disabled:opacity-30"
                    disabled={idx === 0}
                    onClick={() => onReorder(col.key, "up")}
                    title="Mover arriba"
                  >
                    <span className="text-[11px] font-bold">▲</span>
                  </button>
                  <button
                    className="p-1 rounded hover:bg-[var(--color-neutro-100)] text-[var(--color-neutro-400)] disabled:opacity-30"
                    disabled={idx === visibleColumns.length - 1}
                    onClick={() => onReorder(col.key, "down")}
                    title="Mover abajo"
                  >
                    <span className="text-[11px] font-bold">▼</span>
                  </button>
                </div>
                <button
                  className={`p-1 rounded transition-colors ${col.visible ? "text-[var(--color-verde-100)]" : "text-[var(--color-neutro-400)]"} hover:bg-[var(--color-neutro-100)]`}
                  onClick={() => onToggleVisibility(col.key)}
                  title={col.visible ? "Ocultar columna" : "Mostrar columna"}
                >
                  {col.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              </div>
            );
          })}
      </div>
    </div>
  );
}
