import { Flag } from "lucide-react";

const PRIORIDAD_COLORS: Record<string, string> = {
  baja: "#64748b",
  media: "#2563eb",
  alta: "#d97706",
  critica: "#dc2626",
};

export function PriorityFlag({ prioridad }: { prioridad: string }) {
  const color = PRIORIDAD_COLORS[prioridad] || "#64748b";
  return (
    <span className="inline-flex items-center gap-1.5">
      <Flag className="w-3.5 h-3.5 shrink-0" style={{ color }} />
      <span className="text-[13px] font-medium text-[var(--color-neutro-900)]">
        {prioridad.charAt(0).toUpperCase() + prioridad.slice(1)}
      </span>
    </span>
  );
}
