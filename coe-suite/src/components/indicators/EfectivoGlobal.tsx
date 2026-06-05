import { KpiCard } from "@coe/design-system";

interface EfectivoGlobalProps {
  value?: string;
  trend?: string;
  subtitle?: string;
}

export function EfectivoGlobal({ value = "$14.2M", trend = "+2.4%", subtitle = "semana" }: EfectivoGlobalProps) {
  return (
    <KpiCard
      label="Efectivo Global"
      value={value}
      variant="verde"
      trend={trend}
      trendDirection="up"
      subtitle={subtitle}
    />
  );
}
