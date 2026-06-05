import { useState } from "react";
import type { WrTab } from "@data/warRoomData";
import { WR_PROD, WR_RED, WR_ALARMS, WR_TRANSIT, formatCurrency } from "@data/warRoomData";
import { WarRoomCommandBar } from "@components/war-room/WarRoomCommandBar";
import { WarRoomKpiRow } from "@components/war-room/WarRoomKpiRow";
import { WarRoomProductGrid } from "@components/war-room/WarRoomProductGrid";
import { WarRoomRedGrid } from "@components/war-room/WarRoomRedGrid";
import { WarRoomVesPuntoGrid } from "@components/war-room/WarRoomVesPuntoGrid";
import { WarRoomCompromisos } from "@components/war-room/WarRoomCompromisos";
import { WarRoomAlarms } from "@components/war-room/WarRoomAlarms";
import { WarRoomProductDetail } from "@components/war-room/WarRoomProductDetail";
import { WarRoomRedGroupDetail } from "@components/war-room/WarRoomRedGroupDetail";

export function WarRoom() {
  const [tab, setTab] = useState<WrTab>("divisas");
  const [productDetail, setProductDetail] = useState<string | null>(null);
  const [groupDetail, setGroupDetail] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <WarRoomCommandBar activeTab={tab} onTabChange={setTab} />

      <WarRoomAlarms alarms={WR_ALARMS} />

      {tab === "divisas" && (
        <>
          <WarRoomKpiRow
            items={[
              { id: "usd-disp", label: "Disponible USD", value: "$4,446,400", subtext: `Aptos $4,510,000 · No aptos $316,400`, color: "#0d9488", progress: 92 },
              { id: "usd-trans", label: "En Tránsito USD", value: formatCurrency(WR_TRANSIT.usd.amount), subtext: `${WR_TRANSIT.usd.ops} operaciones CIT en ruta`, color: "#d97706", progress: 8, isTransit: true },
              { id: "eur-disp", label: "Disponible EUR", value: "€1,191,800", subtext: `Aptos €1,180,000 · No aptos €63,800`, color: "#2563eb", progress: 96 },
              { id: "eur-trans", label: "En Tránsito EUR", value: formatCurrency(WR_TRANSIT.eur.amount, "EUR"), subtext: `${WR_TRANSIT.eur.ops} operación CIT en ruta`, color: "#d97706", progress: 4, isTransit: true },
            ]}
          />
          <WarRoomProductGrid products={WR_PROD} onProductClick={setProductDetail} />
          <WarRoomRedGrid groups={WR_RED.slice(0, 2)} onGroupClick={setGroupDetail} />
        </>
      )}

      {tab === "bolivares" && (
        <>
          <WarRoomKpiRow
            items={[
              { id: "ves-disp", label: "Disponible Bs.", value: "Bs 88.2M", subtext: "Aptos Bs 86.1M · No aptos Bs 6.3M", color: "#d97706", progress: 95 },
              { id: "ves-trans", label: "En Tránsito Bs.", value: formatCurrency(WR_TRANSIT.ves.amount, "VES"), subtext: `${WR_TRANSIT.ves.ops} operaciones en ruta`, color: "#d97706", progress: 5, isTransit: true },
              { id: "ves-piezas", label: "Total Piezas Aptas", value: "—", subtext: "unidades clasificadas", color: "#16a34a", progress: 0 },
              { id: "ves-agencias", label: "Agencias (VES)", value: "—", subtext: "en red de agencias", color: "#2563eb", progress: 0 },
              { id: "ves-atms", label: "ATMs (VES)", value: "—", subtext: "cargados en cajeros", color: "#d97706", progress: 0 },
            ]}
          />
          <WarRoomVesPuntoGrid groups={WR_RED} onGroupClick={setGroupDetail} />
        </>
      )}

      <WarRoomCompromisos />

      <WarRoomProductDetail productKey={productDetail} onClose={() => setProductDetail(null)} />
      <WarRoomRedGroupDetail groupKey={groupDetail} onClose={() => setGroupDetail(null)} />
    </div>
  );
}
