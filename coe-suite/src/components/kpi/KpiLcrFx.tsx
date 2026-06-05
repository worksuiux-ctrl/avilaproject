import { Card, Text, Badge } from "@coe/design-system";
import { Chart } from "@components/charts/Chart";
import { KPI_LCR_CURRENCIES, KPI_FX_EXPOSURE, CHART_LCR_BAR, CHART_LCR_OPTS, CHART_FX_LINE, CHART_FX_OPTS } from "@data/kpiData";

export function KpiLcrFx() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Card variant="outlined" padding="md">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-blue-500 text-sm">💧</span>
          <Text variant="caption" className="uppercase font-bold tracking-wider">Ratio de Cobertura de Liquidez por Moneda</Text>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-2.5">
          {KPI_LCR_CURRENCIES.map((c) => (
            <div key={c.moneda} className="rounded-lg p-2.5 text-center border"
              style={{ borderColor: `${c.color}30`, background: "var(--color-surface-1)" }}>
              <Text variant="caption" className="uppercase text-gray-500 mb-1">{c.moneda} — LCR</Text>
              <div className="font-sans text-xl font-bold" style={{ color: c.color }}>{c.value}</div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1.5">
                <div className="h-full rounded-full transition-all" style={{ width: `${c.pct}%`, background: c.color }} />
              </div>
              <Text variant="caption" className="mt-1"
                style={{ color: c.status === "ok" ? "#22c55e" : c.status === "bajo" ? "#f59e0b" : "#8b5cf6" }}>
                {c.status === "ok" ? "✓ Sobre mínimo (100%)" : c.status === "bajo" ? "⚠ Bajo mínimo regulatorio" : "✓ Excedente (acción requerida)"}
              </Text>
            </div>
          ))}
        </div>
        <div className="h-[110px]">
          <Chart type="bar" data={CHART_LCR_BAR} options={CHART_LCR_OPTS} height={110} />
        </div>
        <div className="mt-2 p-1.5 bg-gray-50 rounded-lg text-[9px] text-gray-500">
          <strong className="text-gray-700">Definición:</strong> HQLA disponibles por moneda ÷ salidas netas proyectadas a 30 días. Mínimo regulatorio: 100%.
        </div>
      </Card>

      <Card variant="outlined" padding="md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-amber-500 text-sm">🔄</span>
            <Text variant="caption" className="uppercase font-bold tracking-wider">Exposición al Riesgo Cambiario</Text>
          </div>
          <Badge variant="warning" size="sm">MONITOREAR</Badge>
        </div>
        <div className="grid grid-cols-3 gap-1.5 mb-2.5">
          <div className="rounded-lg p-2 text-center border border-gray-200 bg-gray-50">
            <Text variant="caption" className="uppercase text-gray-500 mb-1">Total USD</Text>
            <div className="font-sans text-sm font-bold text-green-500">{KPI_FX_EXPOSURE.totalUsd}</div>
            <Text variant="caption" className="text-gray-400">Larga</Text>
          </div>
          <div className="rounded-lg p-2 text-center border border-gray-200 bg-gray-50">
            <Text variant="caption" className="uppercase text-gray-500 mb-1">VED/USD Sens.</Text>
            <div className="font-sans text-sm font-bold text-amber-500">{KPI_FX_EXPOSURE.sensibilidad}</div>
            <Text variant="caption" className="text-gray-400">por ±1% tasa</Text>
          </div>
          <div className="rounded-lg p-2 text-center border border-gray-200 bg-gray-50">
            <Text variant="caption" className="uppercase text-gray-500 mb-1">VaR Cambiario 1d</Text>
            <div className="font-sans text-sm font-bold text-red-500">{KPI_FX_EXPOSURE.var}</div>
            <Text variant="caption" className="text-gray-400">99% confianza</Text>
          </div>
        </div>
        <div className="h-[110px]">
          <Chart type="line" data={CHART_FX_LINE} options={CHART_FX_OPTS} height={110} />
        </div>
        <div className="mt-2 p-1.5 bg-gray-50 rounded-lg text-[9px] text-gray-500">
          <strong className="text-gray-700">Definición:</strong> Pérdida potencial máxima del portafolio ante movimientos adversos del TC, medida mediante VaR a 1 día con 99% de confianza.
        </div>
      </Card>
    </div>
  );
}
