import { Card, Text, Heading, ProgressBar, Chip } from "@worksuiux-ctrl/my-design-system";
import { Building2 } from "lucide-react";
import type { WrRedGroup } from "@data/warRoomData";
import { formatCurrency } from "@data/warRoomData";

interface WarRoomVesPuntoGridProps {
  groups: WrRedGroup[];
  onGroupClick: (key: string) => void;
}

const chipStatus: Record<string, "success" | "warning" | "error"> = { normal: "success", alerta: "warning", critico: "error" };
const statusLabels: Record<string, string> = { normal: "Normal", alerta: "Alerta", critico: "Crítico" };

const mockVesData: Record<string, { apto: number; noApto: number; piezas: number; aptitude: number }> = {
  agencias: { apto: 32000000, noApto: 4200000, piezas: 18500, aptitude: 88 },
  acopios: { apto: 18000000, noApto: 3600000, piezas: 9200, aptitude: 83 },
  atms: { apto: 9800000, noApto: 1100000, piezas: 4800, aptitude: 90 },
};

export function WarRoomVesPuntoGrid({ groups, onGroupClick }: WarRoomVesPuntoGridProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Building2 className="w-4 h-4 text-[var(--color-neutro-500)]" />
        <Heading variant="paragraph" as="h3" className="!text-[12px] font-semibold">Posición VES por Punto</Heading>
        <Text variant="caption" className="ml-auto">Click para denominaciones, piezas y clasificación</Text>
      </div>
      <div className="grid grid-cols-3 max-lg:grid-cols-2 gap-2">
        {groups.map((g) => {
          const ves = mockVesData[g.key] || { apto: 0, noApto: 0, piezas: 0, aptitude: 0 };
          return (
            <Card key={g.key} variant="outlined" padding="sm" className="cursor-pointer hover:shadow-sm transition-all" onClick={() => onGroupClick(g.key)}>
              <div className="flex items-center justify-between mb-1">
                <Heading variant="paragraph" as="h4" className="!text-[12px] font-semibold">{g.name}</Heading>
                <Text variant="caption">{g.units.length || "12"} unidades</Text>
              </div>
              <div className="mb-1.5">
                <Chip variant={chipStatus[g.status] || "success"} size="sm">{statusLabels[g.status]}</Chip>
              </div>
              <div className="space-y-0.5 mb-1.5">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#d97706" }} />
                  <Text variant="caption" as="span" className="font-medium text-[var(--color-neutro-500)]">VES Aptos</Text>
                  <Text variant="caption" as="span" className="ml-auto font-medium">{formatCurrency(ves.apto, "VES")}</Text>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#dc2626" }} />
                  <Text variant="caption" as="span" className="font-medium text-[var(--color-neutro-500)]">No Aptos</Text>
                  <Text variant="caption" as="span" className="ml-auto font-medium">{formatCurrency(ves.noApto, "VES")}</Text>
                </div>
                <div className="flex items-center gap-1">
                  <Text variant="caption" as="span">Piezas</Text>
                  <Text variant="caption" as="span" className="ml-auto font-medium">{ves.piezas.toLocaleString()}</Text>
                </div>
              </div>
              <div className="flex items-center justify-between mb-0.5">
                <Text variant="caption">Aptitud</Text>
                <Text variant="caption">{ves.aptitude}%</Text>
              </div>
              <ProgressBar value={ves.aptitude} size="sm" variant="success" />
              <div className="mt-1">
                <Text variant="caption" className="text-right block text-[var(--color-verde-100)]">Ver denom. y clasif. →</Text>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
