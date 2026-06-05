import { useMemo } from "react";
import { Dialog, Text, Badge, Card } from "@worksuiux-ctrl/my-design-system";
import { Building2, Warehouse, Banknote } from "lucide-react";
import type { WrRedGroup } from "@data/warRoomData";
import { WR_RED, WR_VES_DENOMS } from "@data/warRoomData";
import { WarRoomDenomRow } from "./WarRoomDenomRow";

interface WarRoomRedGroupDetailProps {
  groupKey: string | null;
  onClose: () => void;
}

const GROUP_ICONS: Record<string, React.ReactNode> = {
  agencias: <Building2 className="w-5 h-5" />,
  acopios: <Warehouse className="w-5 h-5" />,
  atms: <Banknote className="w-5 h-5" />,
};

const GROUP_LABELS: Record<string, string> = {
  agencias: "Agencias",
  acopios: "Centros de Acopio",
  atms: "ATMs",
};

const KPI_COLORS: Record<string, string> = {
  azul: "#2563eb",
  verde: "#16a34a",
  naranja: "#d97706",
  rojo: "#dc2626",
};

export function WarRoomRedGroupDetail({ groupKey, onClose }: WarRoomRedGroupDetailProps) {
  const group = groupKey ? WR_RED.find((g) => g.key === groupKey) : null;

  const kpis = useMemo(() => {
    if (!group) return null;
    const total = (group.vesApto || 0) + (group.vesNoApto || 0);
    const pct = total > 0 ? Math.round(((group.vesApto || 0) / total) * 100) : 100;
    return { total, pct };
  }, [group]);

  const icon = groupKey ? GROUP_ICONS[groupKey] : null;
  const label = groupKey ? GROUP_LABELS[groupKey] || groupKey : "";

  return (
    <Dialog open={!!groupKey} onClose={onClose} title={`${label} · VES`} size="lg" className="!max-w-5xl">
      <div className="space-y-4">
        <Text variant="caption">Denominaciones · Piezas · Clasificación por unidad</Text>

        {kpis && (
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "VES Total", value: `Bs ${((kpis.total) / 1_000_000).toFixed(1)}M`, color: "azul" },
              { label: "Aptos", value: `Bs ${((group?.vesApto || 0) / 1_000_000).toFixed(1)}M`, color: "verde" },
              { label: "No Aptos", value: (group?.vesNoApto || 0) > 0 ? `Bs ${((group?.vesNoApto || 0) / 1_000_000).toFixed(1)}M` : "—", color: (group?.vesNoApto || 0) > 0 ? "rojo" : "azul" },
              { label: "% Aptitud", value: `${kpis.pct}%`, color: kpis.pct >= 90 ? "verde" : kpis.pct >= 70 ? "naranja" : "rojo" },
            ].map((kpi) => (
              <Card key={kpi.label} variant="flat" padding="sm" className="!p-2">
                <Text variant="caption" className="font-semibold text-[10px] uppercase tracking-wider" style={{ color: KPI_COLORS[kpi.color] }}>{kpi.label}</Text>
                <Text variant="body" className="font-bold text-[13px]" style={{ color: "var(--color-neutro-900)" }}>{kpi.value}</Text>
              </Card>
            ))}
          </div>
        )}

        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {group?.units.map((unit) => {
            const ves = { apto: unit.vesApto || 0, noApto: unit.vesNoApto || 0 };
            const capPct = unit.cupoMax && ves.apto ? Math.round((ves.apto / unit.cupoMax) * 100) : null;
            return (
              <div key={unit.id} className="border border-[var(--color-neutro-200)] rounded-corner-xs overflow-hidden">
                <div className="flex items-center justify-between px-2.5 py-2 bg-[var(--color-neutro-50)] border-b border-[var(--color-neutro-200)]">
                  <div className="flex items-center gap-2">
                    <Text variant="body" className="font-semibold">{unit.name}</Text>
                    <Badge
                      variant={unit.status === "critico" ? "error" : unit.status === "alerta" ? "warning" : "success"}
                      size="sm"
                    >
                      {unit.status === "critico" ? "Crítico" : unit.status === "alerta" ? "Alerta" : "Normal"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <Text variant="caption" className="text-[var(--color-verde-100)] font-semibold">Bs {ves.apto.toLocaleString()}</Text>
                      <Text variant="caption" className="text-[var(--color-verde-100)]">aptos</Text>
                    </div>
                    {ves.noApto > 0 && (
                      <div className="text-right">
                        <Text variant="caption" className="text-[var(--color-rojo-100)] font-semibold">Bs {ves.noApto.toLocaleString()}</Text>
                        <Text variant="caption" className="text-[var(--color-rojo-100)]">no aptos</Text>
                      </div>
                    )}
                    {capPct !== null && (
                      <div className="text-right">
                        <Text variant="caption" className="font-semibold">{capPct}%</Text>
                        <Text variant="caption">del cupo</Text>
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-2.5 space-y-1">
                  {unit.vesDenoms && Object.keys(unit.vesDenoms).length > 0 ? (
                    WR_VES_DENOMS.filter((d) => unit.vesDenoms![d.k]).map((d) => (
                      <WarRoomDenomRow
                        key={`${unit.id}-${d.k}`}
                        label={d.label}
                        denom={unit.vesDenoms![d.k]}
                        moneda="VES"
                        symbol="Bs "
                        uid={`${unit.id}-${d.k}`}
                      />
                    ))
                  ) : (
                    <Text variant="caption" className="text-[var(--color-neutro-400)] px-1">Sin datos de denominaciones VES</Text>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Dialog>
  );
}
