import { useState } from "react";
import { Card, Text, Badge } from "@worksuiux-ctrl/my-design-system";
import { Chart } from "@components/charts/Chart";
import { KPI_MASA_ANUAL, KPI_MASA_MENSUAL_STATS, CHART_MASA_ANUAL_LINE, CHART_MASA_ANUAL_OPTS, CHART_MASA_MENSUAL_BAR, CHART_MASA_MENSUAL_OPTS } from "@data/kpiData";

const FILTERS = ["USD eq.", "USD", "VED", "EUR"];

export function KpiMasaMonetaria() {
  const [filter, setFilter] = useState("USD eq.");
  return (
    <div className="grid grid-cols-2 gap-3">
      <Card variant="outlined" padding="md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-purple-500 text-sm">📈</span>
            <Text variant="caption" className="uppercase font-bold tracking-wider">Masa Monetaria por Divisa — Último Año</Text>
          </div>
          <Badge variant="info" size="sm" className="text-[8px]">Jun '25 → May '26</Badge>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-2.5">
          {KPI_MASA_ANUAL.map((m) => (
            <div key={m.moneda} className="rounded-lg p-2 text-center border"
              style={{ borderColor: `${m.color}30`, background: `${m.color}08` }}>
              <Text variant="caption" className="uppercase font-semibold text-gray-500 mb-1">{m.moneda}</Text>
              <div className="font-mono text-lg font-bold" style={{ color: m.color }}>{m.value}</div>
              <Text variant="caption" className="mt-0.5 text-green-500">
                <span className="text-[8px]">↑</span> {m.growth}
              </Text>
            </div>
          ))}
        </div>
        <div className="h-[130px]">
          <Chart type="line" data={CHART_MASA_ANUAL_LINE} options={CHART_MASA_ANUAL_OPTS} height={130} />
        </div>
        <div className="mt-2 p-1.5 bg-gray-50 rounded-lg text-[9px] text-gray-500">
          <strong className="text-gray-700">Def.:</strong> Volumen total de efectivo gestionado. USD/EUR en M; VED en MM Bs.D (línea punteada).
        </div>
      </Card>

      <Card variant="outlined" padding="md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-blue-500 text-sm">📅</span>
            <Text variant="caption" className="uppercase font-bold tracking-wider">Masa Monetaria Total — Último Mes</Text>
          </div>
          <div className="flex gap-1">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2 py-1 rounded text-[9px] font-semibold cursor-pointer transition-colors ${
                  filter === f
                    ? "bg-blue-500 text-white border border-blue-500"
                    : "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-4 gap-1.5 mb-2.5">
          {KPI_MASA_MENSUAL_STATS.map((s) => (
            <div key={s.label} className="rounded-lg p-2 text-center border"
              style={{ borderColor: `${s.color}30`, background: `${s.color}08` }}>
              <Text variant="caption" className="uppercase font-semibold" style={{ color: s.color }}>{s.label}</Text>
              <div className="font-mono text-[15px] font-bold" style={{ color: s.color }}>{s.value}</div>
              {s.subtext && <Text variant="caption" className="text-gray-400">{s.subtext}</Text>}
            </div>
          ))}
        </div>
        <div className="h-[130px]">
          <Chart type="bar" data={CHART_MASA_MENSUAL_BAR} options={CHART_MASA_MENSUAL_OPTS} height={130} />
        </div>
        <div className="mt-2 p-1.5 bg-gray-50 rounded-lg text-[9px] text-gray-500">
          <strong className="text-gray-700">Def.:</strong> Suma consolidada del efectivo bajo gestión. Usa los botones para ver por divisa individual.
        </div>
      </Card>
    </div>
  );
}
