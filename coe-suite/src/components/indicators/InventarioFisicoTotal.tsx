import { KpiCard } from "@worksuiux-ctrl/my-design-system";

interface InventarioFisicoTotalProps {
  value?: string;
  subtitle?: string;
}

export function InventarioFisicoTotal({ value = "$14.2M", subtitle = "USD · Red completa" }: InventarioFisicoTotalProps) {
  return (
    <KpiCard
      label="Inventario Físico Total"
      value={value}
      variant="verde"
      subtitle={subtitle}
    />
  );
}
