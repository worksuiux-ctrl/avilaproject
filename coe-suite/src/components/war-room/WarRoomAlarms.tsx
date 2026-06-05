import { useState, useMemo } from "react";
import type { WrAlarm, WrAlarmType } from "@data/warRoomData";

interface WarRoomAlarmsProps {
  alarms: WrAlarm[];
}

const alarmStyles: Record<WrAlarmType, { dot: string; border: string; bg: string }> = {
  red: { dot: "#dc2626", border: "#fecaca", bg: "#fef2f2" },
  amber: { dot: "#d97706", border: "#fde68a", bg: "#fffbeb" },
  green: { dot: "#16a34a", border: "#bbf7d0", bg: "#f0fdf4" },
};

const alarmMeta: Record<WrAlarmType, { emoji: string; label: string }> = {
  red: { emoji: "🔴", label: "críticas" },
  amber: { emoji: "🟡", label: "parcial" },
  green: { emoji: "🟢", label: "info" },
};

export function WarRoomAlarms({ alarms }: WarRoomAlarmsProps) {
  const [expanded, setExpanded] = useState(false);

  const counts = useMemo(() => {
    const red = alarms.filter((a) => a.type === "red").length;
    const amber = alarms.filter((a) => a.type === "amber").length;
    const green = alarms.filter((a) => a.type === "green").length;
    return { red, amber, green, total: alarms.length };
  }, [alarms]);

  if (alarms.length === 0) return null;

  return (
    <div className="border border-[var(--color-neutro-200)] rounded-corner-xs overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-3 py-1.5 bg-white border-none cursor-pointer hover:bg-[var(--color-neutro-50)] transition-colors text-left"
      >
        {[
          { key: "red" as const, count: counts.red },
          { key: "amber" as const, count: counts.amber },
          { key: "green" as const, count: counts.green },
        ].map(({ key, count }) =>
          count > 0 ? (
            <span key={key} className="text-[11px] font-semibold text-[var(--color-neutro-700)]">
              {alarmMeta[key].emoji} {count} {alarmMeta[key].label}
            </span>
          ) : null
        )}
        <span className="ml-auto text-[10px] text-[var(--color-neutro-400)]">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className="px-3 pb-2 border-t border-[var(--color-neutro-200)] pt-2">
          <div className="grid grid-cols-2 max-md:grid-cols-1 gap-1.5">
            {alarms.map((a) => {
              const st = alarmStyles[a.type];
              return (
                <div
                  key={a.id}
                  className="flex items-start gap-2 px-2.5 py-2 rounded-corner-xs border"
                  style={{ backgroundColor: st.bg, borderColor: st.border }}
                >
                  <span className="w-2 h-2 rounded-full mt-0.5 shrink-0" style={{ backgroundColor: st.dot }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-[var(--color-neutro-800)] leading-tight">{a.title}</p>
                    <p className="text-[10px] text-[var(--color-neutro-500)] mt-0.5 leading-snug">{a.body}</p>
                    {a.actions.length > 0 && (
                      <div className="flex gap-1 mt-1.5">
                        {a.actions.map((act) => (
                          <button
                            key={act}
                            className="text-[10px] font-medium px-2 py-0.5 rounded-corner-xs border border-[var(--color-neutro-300)] bg-white text-[var(--color-neutro-600)] cursor-pointer hover:bg-[var(--color-neutro-100)]"
                          >
                            {act}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
