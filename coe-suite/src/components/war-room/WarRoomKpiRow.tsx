import { Card, Text, ProgressBar, Heading } from "@worksuiux-ctrl/my-design-system";
import type { WrKpiItem } from "@data/warRoomData";

interface WarRoomKpiRowProps {
  items: WrKpiItem[];
}

export function WarRoomKpiRow({ items }: WarRoomKpiRowProps) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2">
      {items.map((kpi) => (
        <Card
          key={kpi.id}
          variant="outlined"
          padding="sm"
        >
          <Text variant="caption" className="uppercase tracking-wider font-semibold" style={{ color: kpi.color }}>
            {kpi.label}
          </Text>
          <Heading variant="big" className="font-bold mt-0.5" style={{ color: "var(--color-neutro-900)" }}>
            {kpi.value}
          </Heading>
          <Text variant="caption" className="mt-0.5">{kpi.subtext}</Text>
          <ProgressBar
            value={kpi.progress}
            size="sm"
            variant={kpi.color === "#d97706" ? "warning" : kpi.color === "#dc2626" ? "error" : kpi.color === "#2563eb" ? "info" : "success"}
            className="mt-1.5"
          />
        </Card>
      ))}
    </div>
  );
}
