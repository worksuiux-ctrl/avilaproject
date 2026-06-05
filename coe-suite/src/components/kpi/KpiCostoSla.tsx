import { Card, Text, Badge } from "@worksuiux-ctrl/my-design-system";
import { Chart } from "@components/charts/Chart";
import { KPI_COSTO_TOTAL, KPI_SLA_TRANSPORTISTAS, CHART_CTGE_DOUGHNUT, CHART_CTGE_OPTS, CHART_SLA_BAR, CHART_SLA_OPTS } from "@data/kpiData";

const BAR_COLORS: Record<string, string> = {
  "Transporte CIT": "#3b82f6",
  "Personal": "#f59e0b",
  "Seguridad": "#ef4444",
  "Tecnología": "#8b5cf6",
  "Costo Oportunidad": "#22c55e",
};

export function KpiCostoSla() {
  const maxVal = Math.max(...KPI_COSTO_TOTAL.desglose.map((d) => d.value));
  return (
    <div className="grid grid-cols-2 gap-3">
      <Card variant="outlined" padding="md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-green-600 text-sm">🪙</span>
            <Text variant="caption" className="uppercase font-bold tracking-wider">Costo Total de Gestión</Text>
          </div>
          <div className="font-mono text-[15px] font-bold text-amber-500">{KPI_COSTO_TOTAL.total}</div>
        </div>
        <div className="space-y-1.5 mb-2.5">
          {KPI_COSTO_TOTAL.desglose.map((d) => {
            const w = (d.value / maxVal) * 100;
            return (
              <div key={d.label}>
                <div className="flex justify-between text-[10px] mb-0.5">
                  <Text variant="caption">{d.label}</Text>
                  <span className="font-mono font-semibold">${d.value.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${w}%`, background: BAR_COLORS[d.label] || "#6b7280" }} />
                </div>
              </div>
            );
          })}
        </div>
        <div className="h-[100px]">
          <Chart type="doughnut" data={CHART_CTGE_DOUGHNUT} options={CHART_CTGE_OPTS} height={100} />
        </div>
        <div className="mt-2 p-1.5 bg-gray-50 rounded-lg text-[9px] text-gray-500">
          <strong className="text-gray-700">Def.:</strong> Costos directos e indirectos del ciclo completo: transporte, personal, seguridad, tecnología y costo de oportunidad.
        </div>
      </Card>

      <Card variant="outlined" padding="md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-blue-500 text-sm">🚚</span>
            <Text variant="caption" className="uppercase font-bold tracking-wider">SLA Transportistas CIT</Text>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge variant="warning" size="sm">{KPI_SLA_TRANSPORTISTAS.cumplimiento}</Badge>
            <Text variant="caption" className="text-gray-400">19–25 May</Text>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-2.5">
          <div className="rounded-lg p-2 text-center border border-gray-200 bg-gray-50">
            <Text variant="caption" className="uppercase text-gray-500 mb-1">Total Servicios</Text>
            <div className="font-mono text-xl font-bold text-gray-700">{KPI_SLA_TRANSPORTISTAS.total}</div>
            <Text variant="caption" className="text-gray-400">esta semana</Text>
          </div>
          <div className="rounded-lg p-2 text-center border border-green-200 bg-green-50/50">
            <Text variant="caption" className="uppercase text-green-600 font-semibold mb-1">En SLA</Text>
            <div className="font-mono text-xl font-bold text-green-500">{KPI_SLA_TRANSPORTISTAS.enSla}</div>
            <Text variant="caption" className="text-gray-400">≤ 4.0h</Text>
          </div>
          <div className="rounded-lg p-2 text-center border border-red-200 bg-red-50/50">
            <Text variant="caption" className="uppercase text-red-600 font-semibold mb-1">Fuera SLA</Text>
            <div className="font-mono text-xl font-bold text-red-500">{KPI_SLA_TRANSPORTISTAS.fueraSla}</div>
            <Text variant="caption" className="text-gray-400">incidencias</Text>
          </div>
        </div>
        <div className="h-[95px] mb-2.5">
          <Chart type="bar" data={CHART_SLA_BAR} options={CHART_SLA_OPTS} height={95} />
        </div>

        <Text variant="caption" className="uppercase font-semibold text-gray-500 tracking-wider mb-1.5 block">
          Incidencias fuera de SLA esta semana
        </Text>
        <table className="w-full text-[9px] border-collapse mb-2.5">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-1 px-1.5 text-gray-500 font-semibold">CIT</th>
              <th className="text-left py-1 px-1.5 text-gray-500 font-semibold">Ruta</th>
              <th className="text-right py-1 px-1.5 text-gray-500 font-semibold">Exceso</th>
              <th className="text-left py-1 px-1.5 text-gray-500 font-semibold">Motivo</th>
            </tr>
          </thead>
          <tbody>
            {KPI_SLA_TRANSPORTISTAS.incidencias.map((inc, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-1 px-1.5">
                  <Badge variant={inc.cit === "CIT-C" ? "warning" : "info"} size="sm">{inc.cit}</Badge>
                </td>
                <td className="py-1 px-1.5 text-gray-500">{inc.ruta}</td>
                <td className="text-right py-1 px-1.5 font-mono"
                  style={{ color: inc.exceso.includes("3.8") ? "#ef4444" : "#f59e0b" }}>
                  {inc.exceso}
                </td>
                <td className="py-1 px-1.5 text-gray-400">{inc.motivo}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between items-center p-1.5 bg-gray-50 rounded-lg text-[9px]">
          <Text variant="caption" className="text-gray-500">Tiempo prom. traslado:</Text>
          <span className="font-mono font-bold text-green-500">{KPI_SLA_TRANSPORTISTAS.promedio}</span>
          <Text variant="caption" className="text-gray-500">Meta:</Text>
          <span className="text-amber-500 font-semibold">≤ 4.0h</span>
          <Badge variant="success" size="sm">20% bajo meta</Badge>
        </div>
      </Card>
    </div>
  );
}
