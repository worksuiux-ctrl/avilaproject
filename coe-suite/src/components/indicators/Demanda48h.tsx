import { KpiCard } from "@worksuiux-ctrl/my-design-system";

interface Demanda48hProps {
  value?: string;
  subtitle?: string;
}

export function Demanda48h({ value = "$3.8M", subtitle = "Montecarlo · MAE 1.5%" }: Demanda48hProps) {
  return (
    <KpiCard
      label="Demanda 48h (IA)"
      value={value}
      variant="morado"
      subtitle={subtitle}
    />
  );
}
