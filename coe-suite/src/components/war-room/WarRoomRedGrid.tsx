import { Card, Text, Heading, Chip } from "@worksuiux-ctrl/my-design-system";
import { Network } from "lucide-react";
import type { WrRedGroup } from "@data/warRoomData";
import { formatCurrency } from "@data/warRoomData";

interface WarRoomRedGridProps {
  groups: WrRedGroup[];
  onGroupClick: (key: string) => void;
}

const chipVariant: Record<string, "success" | "warning" | "error"> = { normal: "success", alerta: "warning", critico: "error" };
const statusLabels: Record<string, string> = { normal: "Normal", alerta: "Alerta", critico: "Crítico" };

export function WarRoomRedGrid({ groups, onGroupClick }: WarRoomRedGridProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Network className="w-4 h-4 text-[var(--color-neutro-500)]" />
        <Heading variant="paragraph" as="h3" className="!text-[12px] font-semibold">Red · Agencias y Centros de Acopio</Heading>
        <Text variant="caption" className="ml-auto">Click para denominaciones y clasificación</Text>
      </div>
      <div className="grid grid-cols-3 max-lg:grid-cols-2 gap-2">
        {groups.map((g) => (
          <Card key={g.key} variant="outlined" padding="sm" className="cursor-pointer hover:shadow-sm transition-all" onClick={() => onGroupClick(g.key)}>
            <div className="flex items-center justify-between mb-1">
              <Heading variant="paragraph" as="h4" className="!text-[12px] font-semibold">{g.name}</Heading>
              <Text variant="caption">{g.units.length} unidades</Text>
            </div>
              <div className="space-y-0.5 mb-1.5">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#0d9488" }} />
                  <Text variant="caption" as="span" className="font-medium text-[var(--color-neutro-500)]">USD</Text>
                  <Text variant="caption" as="span" className="ml-auto font-medium">{formatCurrency(g.usdApto)}</Text>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#2563eb" }} />
                  <Text variant="caption" as="span" className="font-medium text-[var(--color-neutro-500)]">EUR</Text>
                  <Text variant="caption" as="span" className="ml-auto font-medium">{formatCurrency(g.eurApto)}</Text>
                </div>
              </div>
            <div className="flex items-center gap-1">
              <Chip variant={chipVariant[g.status] || "success"} size="sm">{statusLabels[g.status]}</Chip>
              <Text variant="caption" className="ml-auto text-[var(--color-verde-100)]">Ver unidades →</Text>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
