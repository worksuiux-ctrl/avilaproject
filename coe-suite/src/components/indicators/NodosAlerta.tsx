import { KpiCard } from "@coe/design-system";

interface NodosAlertaProps {
  value?: string;
  trend?: string;
}

export function NodosAlerta({ value = "14", trend = "Stock-out" }: NodosAlertaProps) {
  return (
    <KpiCard
      label="Nodos en Alerta"
      value={value}
      variant="rojo"
      trend={trend}
      trendDirection="up"
    />
  );
}
