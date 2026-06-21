import { useState, useMemo } from "react";
import { Dialog, Text, Card, Tabs } from "@coe/design-system";
import type { WrCurrencyDetail } from "@data/warRoomData";
import { WR_PROD, WR_USD_DENOMS, WR_EUR_DENOMS } from "@data/warRoomData";
import { WarRoomDenomRow } from "./WarRoomDenomRow";

interface WarRoomProductDetailProps {
  productKey: string | null;
  onClose: () => void;
}

const SYMBOLS: Record<string, string> = { USD: "$", EUR: "€" };

const DENOM_MAPS: Record<string, { k: string; label: string; val: number }[]> = {
  USD: WR_USD_DENOMS,
  EUR: WR_EUR_DENOMS,
};

const KPI_COLORS: Record<string, string> = {
  azul: "#2563eb", verde: "#16a34a", naranja: "#d97706", rojo: "#dc2626",
};

const PILLS = { USD: "azul", EUR: "verde" } as const;

export function WarRoomProductDetail({ productKey, onClose }: WarRoomProductDetailProps) {
  const product = productKey ? WR_PROD.find((p) => p.key === productKey) : null;
  const currencies = useMemo(() => {
    if (!product?.detail) return [];
    return Object.keys(product.detail);
  }, [product]);

  const [currency, setCurrency] = useState<string>("USD");
  const curData = product?.detail?.[currency as keyof typeof product.detail] as WrCurrencyDetail | undefined;
  const tabs = currencies.map((c) => ({ id: c, label: c }));
  const symbol = SYMBOLS[currency] || "$";
  const denomList = DENOM_MAPS[currency] || WR_USD_DENOMS;

  const kpis = useMemo(() => {
    if (!curData) return null;
    const total = curData.apto + curData.noApto;
    const pct = total > 0 ? Math.round((curData.apto / total) * 100) : 100;
    return { total, pct };
  }, [curData]);

  if (!product) return null;

  return (
    <Dialog open={!!productKey} onClose={onClose} title={product.name} size="lg" className="!max-w-5xl">
      <div className="space-y-4">
        <Text variant="caption">Denominaciones · Piezas · Clasificación — haz click en cada fila para expandir</Text>

        {tabs.length > 1 && (
          <Tabs tabs={tabs} activeTab={currency} onChange={setCurrency} variant="pills" />
        )}

        {kpis && (
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: `Total ${currency}`, value: `${symbol}${(kpis.total / 1000).toFixed(0)}K`, color: PILLS[currency] || "azul" },
              { label: "Aptos", value: `${symbol}${(curData!.apto / 1000).toFixed(0)}K`, color: "verde" },
              { label: "No Aptos", value: curData!.noApto > 0 ? `${symbol}${(curData!.noApto / 1000).toFixed(0)}K` : "—", color: curData!.noApto > 0 ? "rojo" : "azul" },
              { label: "% Aptitud", value: `${kpis.pct}%`, color: kpis.pct >= 90 ? "verde" : kpis.pct >= 70 ? "naranja" : "rojo" },
            ].map((kpi) => (
              <Card key={kpi.label} variant="flat" padding="sm" className="!p-2">
                <Text variant="caption" className="font-semibold text-[10px] uppercase tracking-wider" style={{ color: KPI_COLORS[kpi.color] }}>{kpi.label}</Text>
                <Text variant="body" className="font-bold text-[13px]" style={{ color: "var(--color-neutro-900)" }}>{kpi.value}</Text>
              </Card>
            ))}
          </div>
        )}

        <Text variant="caption" className="font-semibold text-[var(--color-verde-100)]">Denominaciones · click para ver detalle de piezas y clasificación</Text>

        <div className="space-y-1 max-h-[300px] overflow-y-auto">
          {curData && denomList.filter((d) => curData.denoms[d.k]).map((d) => (
            <WarRoomDenomRow
              key={d.k}
              label={d.label}
              denom={curData.denoms[d.k]}
              moneda={currency}
              symbol={symbol}
              uid={`pd-${currency}-${d.k}`}
            />
          ))}
        </div>
      </div>
    </Dialog>
  );
}
