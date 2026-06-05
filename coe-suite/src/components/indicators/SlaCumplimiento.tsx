import { KpiCard } from "@worksuiux-ctrl/my-design-system";

interface SlaCumplimientoProps {
  value?: string;
  trend?: string;
}

export function SlaCumplimiento({ value = "98.2%", trend = "Sobre meta" }: SlaCumplimientoProps) {
  return (
    <KpiCard
      label="SLA Cumplimiento"
      value={value}
      variant="verde"
      trend={trend}
      trendDirection="up"
    />
  );
}
