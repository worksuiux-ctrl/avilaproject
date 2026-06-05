import { KpiCard } from "@coe/design-system";

interface InventarioBovedasProps {
  value?: string;
  subtitle?: string;
}

export function InventarioBovedas({ value = "$14.2M", subtitle = "Bóvedas + ATMs + tránsito" }: InventarioBovedasProps) {
  return (
    <KpiCard
      label="Inventario Físico Total"
      value={value}
      variant="naranja"
      subtitle={subtitle}
    />
  );
}
