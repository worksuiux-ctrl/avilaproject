import { Card, Text, Heading } from "@coe/design-system";
import type { KpiScorecard } from "@data/kpiData";

interface KpiScorecardRowProps {
  items: KpiScorecard[];
}

export function KpiScorecardRow({ items }: KpiScorecardRowProps) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-2">
      {items.map((item) => (
        <Card key={item.id} variant="outlined" padding="sm" className="text-center">
          <Text variant="caption" className="uppercase tracking-wider font-semibold" style={{ color: item.color }}>
            {item.label}
          </Text>
          <Heading variant="big" className="font-bold mt-0.5">
            {item.value}
          </Heading>
          <Text variant="caption" className="mt-0.5">{item.subtext}</Text>
        </Card>
      ))}
    </div>
  );
}
