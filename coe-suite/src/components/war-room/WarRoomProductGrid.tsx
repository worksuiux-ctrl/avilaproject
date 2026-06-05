import { Card, Text, Heading, Chip } from "@worksuiux-ctrl/my-design-system";
import { Layers } from "lucide-react";
import type { WrProduct } from "@data/warRoomData";
import { formatCurrency } from "@data/warRoomData";

interface WarRoomProductGridProps {
  products: WrProduct[];
  onProductClick: (key: string) => void;
}

export function WarRoomProductGrid({ products, onProductClick }: WarRoomProductGridProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Layers className="w-4 h-4 text-[var(--color-neutro-500)]" />
        <Heading variant="paragraph" as="h3" className="!text-[12px] font-semibold">Posición por Producto</Heading>
        <Text variant="caption" className="ml-auto">Click para detalles</Text>
      </div>
      <div className="grid grid-cols-5 max-xl:grid-cols-3 max-lg:grid-cols-2 gap-2">
        {products.map((p) => {
          const hasNoApto = p.usdNoApto > 0 || p.eurNoApto > 0;
          return (
            <Card key={p.key} variant="outlined" padding="sm" className="cursor-pointer hover:shadow-sm transition-all" onClick={() => onProductClick(p.key)}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-6 h-6 rounded-corner-xs bg-[var(--color-neutro-100)] flex items-center justify-center text-[9px] font-bold text-[var(--color-neutro-600)]">{p.icon}</span>
                <Heading variant="paragraph" as="h4" className="!text-[11px] font-semibold">{p.name}</Heading>
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#0d9488" }} />
                  <Text variant="caption" as="span" className="font-medium text-[var(--color-neutro-500)]">USD</Text>
                  <Text variant="caption" as="span" className="ml-auto font-medium">{formatCurrency(p.usdApto)}</Text>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#2563eb" }} />
                  <Text variant="caption" as="span" className="font-medium text-[var(--color-neutro-500)]">EUR</Text>
                  <Text variant="caption" as="span" className="ml-auto font-medium">{formatCurrency(p.eurApto)}</Text>
                </div>
              </div>
              <div className="mt-1.5 flex items-center gap-1">
                <Chip variant={hasNoApto ? "warning" : "success"} size="sm">
                  {hasNoApto ? "Con no aptos" : "Todo apto"}
                </Chip>
                <Text variant="caption" className="ml-auto text-[var(--color-verde-100)]">Ver detalle →</Text>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
