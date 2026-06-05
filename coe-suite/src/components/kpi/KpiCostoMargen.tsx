import { Card, Text, Badge } from "@coe/design-system";
import { Chart } from "@components/charts/Chart";
import { KPI_COSTO_OPORTUNIDAD, KPI_MARGEN_FINANCIERO, CHART_COO_LINE, CHART_COO_OPTS, CHART_MFN_BAR, CHART_MFN_OPTS } from "@data/kpiData";

export function KpiCostoMargen() {
  const co = KPI_COSTO_OPORTUNIDAD;
  const mf = KPI_MARGEN_FINANCIERO;
  return (
    <div className="grid grid-cols-2 gap-3">
      <Card variant="outlined" padding="md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-amber-500 text-sm">💰</span>
            <Text variant="caption" className="uppercase font-bold tracking-wider">Costo de Oportunidad del Efectivo Ocioso</Text>
          </div>
          <Badge variant={co.badgeVariant} size="sm">{co.badgeText}</Badge>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-2.5">
          <div className="rounded-lg p-2 text-center border border-red-200 bg-red-50/50">
            <Text variant="caption" className="uppercase text-gray-500 mb-1">Efectivo Ocioso</Text>
            <div className="font-sans text-base font-bold text-red-500">{co.ocioso}</div>
            <Text variant="caption" className="text-gray-400">inmovilizado</Text>
          </div>
          <div className="rounded-lg p-2 text-center border border-amber-200 bg-amber-50/50">
            <Text variant="caption" className="uppercase text-gray-500 mb-1">Costo Diario</Text>
            <div className="font-sans text-base font-bold text-amber-500">{co.costoDiario}</div>
            <Text variant="caption" className="text-gray-400">@ tasa 4.25%</Text>
          </div>
          <div className="rounded-lg p-2 text-center border border-lime-200 bg-lime-50/50">
            <Text variant="caption" className="uppercase text-gray-500 mb-1">Costo Semanal</Text>
            <div className="font-sans text-base font-bold text-green-600">{co.costoSemanal}</div>
            <Text variant="caption" className="text-gray-400">oportunidad perdida</Text>
          </div>
        </div>
        <div className="h-[130px]">
          <Chart type="line" data={CHART_COO_LINE} options={CHART_COO_OPTS} height={130} />
        </div>
        <div className="mt-2 p-1.5 bg-gray-50 rounded-lg text-[9px] text-gray-500">
          <strong className="text-gray-700">Definición:</strong> Rendimiento que podría generar el efectivo inmovilizado si se colocara en overnight o inversiones de corto plazo.
        </div>
      </Card>

      <Card variant="outlined" padding="md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-teal-500 text-sm">⚖</span>
            <Text variant="caption" className="uppercase font-bold tracking-wider">Margen Financiero Neto de Tesorería</Text>
          </div>
          <Badge variant={mf.badgeVariant} size="sm">{mf.badgeText}</Badge>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-2.5">
          <div className="rounded-lg p-2 text-center border border-green-200 bg-green-50/50">
            <Text variant="caption" className="uppercase text-gray-500 mb-1">Ingresos Tesorería</Text>
            <div className="font-sans text-base font-bold text-green-500">{mf.ingresos}</div>
          </div>
          <div className="rounded-lg p-2 text-center border border-red-200 bg-red-50/50">
            <Text variant="caption" className="uppercase text-gray-500 mb-1">Costos Operativos</Text>
            <div className="font-sans text-base font-bold text-red-500">{mf.costos}</div>
          </div>
        </div>
        <div className="text-center p-2.5 bg-teal-50/50 border border-teal-200 rounded-lg mb-2.5">
          <Text variant="caption" className="uppercase text-gray-500 mb-1">Margen Financiero Neto</Text>
          <div className="font-sans text-2xl font-bold text-teal-500">{mf.margenNeto}</div>
          <Text variant="caption" className="text-gray-400">
            Ratio: <span className="text-teal-500 font-semibold">{mf.ratio}</span> cobertura
          </Text>
        </div>
        <div className="h-[100px]">
          <Chart type="bar" data={CHART_MFN_BAR} options={CHART_MFN_OPTS} height={100} />
        </div>
        <div className="mt-2 p-1.5 bg-gray-50 rounded-lg text-[9px] text-gray-500">
          <strong className="text-gray-700">Definición:</strong> Diferencia entre ingresos por gestión activa del efectivo y costo total de operar la infraestructura.
        </div>
      </Card>
    </div>
  );
}
