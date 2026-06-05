import { useState } from "react";
import { Card, Text, Badge, ProgressBar, Divider } from "@worksuiux-ctrl/my-design-system";
import { ChevronRight } from "lucide-react";
import type { WrDenomEntry } from "@data/warRoomData";

export interface WarRoomDenomRowProps {
  label: string;
  denom: WrDenomEntry;
  moneda: string;
  symbol: string;
  uid: string;
}

export function WarRoomDenomRow({ label, denom, moneda, symbol, uid }: WarRoomDenomRowProps) {
  const [open, setOpen] = useState(false);
  const total = denom.pzAp + denom.pzNo;
  const pct = total > 0 ? Math.round((denom.pzAp / total) * 100) : 100;
  const hasMix = denom.pzAp > 0 && denom.pzNo > 0;
  const showCurrency = moneda === "VES" ? `Bs ` : symbol;

  return (
    <Card variant="flat" padding="none" className="overflow-hidden !rounded-corner-xs">
      <div
        className="flex items-center gap-2 px-2.5 py-1.5 cursor-pointer hover:bg-[var(--color-neutro-50)] transition-colors select-none"
        onClick={() => setOpen(!open)}
      >
        <ChevronRight
          className={`w-3 h-3 text-[var(--color-neutro-400)] transition-transform ${open ? "rotate-90" : ""}`}
        />
        <Text variant="caption" as="span" className="font-semibold min-w-[60px]">{label}</Text>
        <div className="flex items-center gap-1.5 flex-1">
          <div className="flex-1 h-1.5 bg-[var(--color-neutro-200)] rounded-corner-full overflow-hidden">
            <div
              className="h-full rounded-corner-full transition-all"
              style={{
                width: `${pct}%`,
                backgroundColor: pct >= 90 ? "var(--color-verde-100)" : pct >= 70 ? "var(--color-naranja-100)" : "var(--color-rojo-100)",
              }}
            />
          </div>
          <Text variant="caption" as="span" className="font-semibold min-w-[32px] text-right">{pct}%</Text>
        </div>
        <Badge
          variant={hasMix ? "warning" : denom.pzNo > 0 ? "error" : "success"}
          size="sm"
          className="!min-w-0 !px-1.5"
        >
          {hasMix ? "Mixto" : denom.pzNo > 0 ? "No Apto" : "Apto"}
        </Badge>
        <div className="text-right leading-tight">
          <Text variant="caption" as="div" className="font-medium">{denom.pzAp.toLocaleString()} apt.</Text>
          {denom.pzNo > 0 && (
            <Text variant="caption" as="div" className="text-[var(--color-rojo-100)]">{denom.pzNo.toLocaleString()} no apt.</Text>
          )}
        </div>
      </div>
      {open && (
        <div className="px-2.5 py-2 border-t border-[var(--color-neutro-200)]">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Text variant="caption" className="text-[var(--color-verde-100)] font-semibold uppercase tracking-wide text-[10px]">Piezas Aptas</Text>
              <Text variant="body" className="font-bold text-[var(--color-verde-100)]">{denom.pzAp.toLocaleString()}</Text>
              <Text variant="caption">piezas</Text>
              <Text variant="body" className="font-bold">{showCurrency}{(denom.apto || 0).toLocaleString()}</Text>
            </div>
            <div>
              <Text variant="caption" className="text-[var(--color-rojo-100)] font-semibold uppercase tracking-wide text-[10px]">Piezas No Aptas</Text>
              {denom.pzNo > 0 ? (
                <>
                  <Text variant="body" className="font-bold text-[var(--color-rojo-100)]">{denom.pzNo.toLocaleString()}</Text>
                  <Text variant="caption">piezas</Text>
                  <Text variant="body" className="font-bold">{showCurrency}{(denom.noApto || 0).toLocaleString()}</Text>
                </>
              ) : (
                <Text variant="body" className="font-bold text-[var(--color-neutro-400)]">—</Text>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
