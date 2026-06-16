import { useState, useEffect, useRef } from "react";
import { Dialog, Button } from "@coe/design-system";
import { Activity, Zap, Clock, ArrowUpDown } from "lucide-react";
import type { IntegrationItem } from "../data/integracionesTypes";

interface MetricsModalProps {
  open: boolean;
  onClose: () => void;
  item: IntegrationItem;
}

const BAR_COUNT = 30;
const MAX_HEIGHT = 120;

function randomAround(base: number, variance: number) {
  return Math.max(0, Math.round(base + (Math.random() - 0.5) * variance));
}

export function MetricsModal({ open, onClose, item }: MetricsModalProps) {
  const [reqHistory, setReqHistory] = useState<number[]>(() =>
    Array.from({ length: BAR_COUNT }, () => randomAround(60, 40))
  );
  const [latHistory, setLatHistory] = useState<number[]>(() =>
    Array.from({ length: BAR_COUNT }, () => randomAround(30, 20))
  );
  const [uptime, setUptime] = useState(0);
  const [totalReqs, setTotalReqs] = useState(124850);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (!open) return;
    intervalRef.current = setInterval(() => {
      setReqHistory((prev) => {
        const next = [...prev.slice(1), randomAround(item.estado === "Activo" ? 70 : 0, 45)];
        return next;
      });
      setLatHistory((prev) => {
        const next = [...prev.slice(1), randomAround(item.estado === "Activo" ? 28 : 0, 22)];
        return next;
      });
      setUptime((u) => u + 1);
      setTotalReqs((r) => r + randomAround(item.estado === "Activo" ? 3 : 0, 4));
    }, 800);
    return () => clearInterval(intervalRef.current);
  }, [open, item.estado]);

  const maxReq = Math.max(...reqHistory, 1);
  const maxLat = Math.max(...latHistory, 1);

  const statusColor = item.estado === "Activo" ? "#22c55e" : "#ef4444";
  const isLive = item.estado === "Activo";

  const chartLines = ({ data, max }: { data: number[]; max: number }) =>
    data
      .map((v, i) => {
        const x = (i / (BAR_COUNT - 1)) * 100;
        const y = MAX_HEIGHT - (v / max) * MAX_HEIGHT;
        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <Dialog open={open} onClose={onClose} title={`Métricas en vivo — ${item.nombre}`} size="lg">
      <div className="space-y-5">
        {/* KPI row */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-[var(--color-neutro-50)] rounded-corner-m p-3 border border-[var(--color-neutro-200)]">
            <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-neutro-400)] mb-1">
              <Activity className="w-3 h-3" />
              Estado
            </div>
            <span className="text-sm font-bold" style={{ color: statusColor }}>
              {isLive ? "Conectado" : "Desconectado"}
            </span>
          </div>
          <div className="bg-[var(--color-neutro-50)] rounded-corner-m p-3 border border-[var(--color-neutro-200)]">
            <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-neutro-400)] mb-1">
              <Zap className="w-3 h-3" />
              Solicitudes/min
            </div>
            <span className="text-sm font-bold text-[var(--color-neutro-700)]">
              {isLive ? randomAround(145, 30) : 0}
            </span>
          </div>
          <div className="bg-[var(--color-neutro-50)] rounded-corner-m p-3 border border-[var(--color-neutro-200)]">
            <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-neutro-400)] mb-1">
              <Clock className="w-3 h-3" />
              Latencia prom.
            </div>
            <span className="text-sm font-bold text-[var(--color-neutro-700)]">
              {isLive ? `${randomAround(28, 12)}ms` : "—"}
            </span>
          </div>
          <div className="bg-[var(--color-neutro-50)] rounded-corner-m p-3 border border-[var(--color-neutro-200)]">
            <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-neutro-400)] mb-1">
              <ArrowUpDown className="w-3 h-3" />
              Total req.
            </div>
            <span className="text-sm font-bold text-[var(--color-neutro-700)]">
              {totalReqs.toLocaleString("es-ES")}
            </span>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Requests chart */}
          <div className="bg-[var(--color-neutro-50)] rounded-corner-m p-3 border border-[var(--color-neutro-200)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide">
                Solicitudes / segundo
              </span>
              {isLive && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
            </div>
            <svg viewBox={`0 0 100 ${MAX_HEIGHT + 10}`} className="w-full h-28">
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((frac) => (
                <line
                  key={frac}
                  x1="0" y1={MAX_HEIGHT - frac * MAX_HEIGHT}
                  x2="100" y2={MAX_HEIGHT - frac * MAX_HEIGHT}
                  stroke="var(--color-neutro-200)"
                  strokeWidth="0.3"
                />
              ))}
              {/* Area fill */}
              <path
                d={`${chartLines({ data: reqHistory, max: maxReq })} V ${MAX_HEIGHT} H 0 Z`}
                fill={isLive ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.08)"}
              />
              {/* Line */}
              <path
                d={chartLines({ data: reqHistory, max: maxReq })}
                fill="none"
                stroke={isLive ? "#22c55e" : "#ef4444"}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Latency chart */}
          <div className="bg-[var(--color-neutro-50)] rounded-corner-m p-3 border border-[var(--color-neutro-200)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide">
                Latencia (ms)
              </span>
              {isLive && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
            </div>
            <svg viewBox={`0 0 100 ${MAX_HEIGHT + 10}`} className="w-full h-28">
              {[0, 0.25, 0.5, 0.75, 1].map((frac) => (
                <line
                  key={frac}
                  x1="0" y1={MAX_HEIGHT - frac * MAX_HEIGHT}
                  x2="100" y2={MAX_HEIGHT - frac * MAX_HEIGHT}
                  stroke="var(--color-neutro-200)"
                  strokeWidth="0.3"
                />
              ))}
              <path
                d={`${chartLines({ data: latHistory, max: maxLat })} V ${MAX_HEIGHT} H 0 Z`}
                fill={isLive ? "rgba(59,130,246,0.1)" : "rgba(239,68,68,0.08)"}
              />
              <path
                d={chartLines({ data: latHistory, max: maxLat })}
                fill="none"
                stroke={isLive ? "#3b82f6" : "#ef4444"}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Uptime bar */}
        <div className="bg-[var(--color-neutro-50)] rounded-corner-m p-3 border border-[var(--color-neutro-200)]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide">
              Tiempo activo
            </span>
            <span className="text-[12px] font-mono text-[var(--color-neutro-600)]">{formatTime(uptime)}</span>
          </div>
          <div className="w-full h-2 bg-[var(--color-neutro-200)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: isLive ? `${Math.min(100, 85 + Math.random() * 10)}%` : "0%",
                background: isLive
                  ? "linear-gradient(90deg, #22c55e, #16a34a)"
                  : "linear-gradient(90deg, #ef4444, #dc2626)",
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-[var(--color-neutro-200)]">
        <Button variant="outline" size="sm" onClick={onClose}>
          Cerrar
        </Button>
      </div>
    </Dialog>
  );
}
