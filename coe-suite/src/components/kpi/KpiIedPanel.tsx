import { Card, Text, Badge, Button, ProgressBar } from "@worksuiux-ctrl/my-design-system";
import { Chart } from "@components/charts/Chart";
import { KPI_IED_CURRENCIES, CHART_IED_LINE, CHART_IED_OPTS } from "@data/kpiData";

export function KpiIedPanel() {
  return (
    <Card variant="outlined" padding="md">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-teal-500 text-sm">◈</span>
          <Text variant="caption" className="uppercase font-bold tracking-wider">Índice de Efectivo Diario (IED)</Text>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="warning" size="sm">ALERTA USD+VED</Badge>
          <Button variant="ghost" size="sm">Fuente Contable</Button>
        </div>
      </div>

      <div className="flex items-center gap-2 px-2.5 py-1.5 bg-amber-50/50 border border-amber-200/50 rounded-lg mb-2.5 text-[9px]">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
        <Text variant="caption">
          Captaciones contables: <strong>Entrada manual</strong> · Último corte: <strong>18/05/2026 18:00</strong>
        </Text>
        <Button variant="primary" size="sm" className="ml-auto text-[8px]">Registrar captaciones</Button>
      </div>

      <div className="p-2.5 bg-teal-50/50 border border-teal-200/50 rounded-lg mb-2.5">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-teal-500 text-xs">🌐</span>
            <Text variant="caption" className="uppercase font-bold tracking-wider text-teal-600">
              IED Global — Posición consolidada todas las divisas (USD eq.)
            </Text>
          </div>
          <div className="flex items-center gap-2">
            <Text variant="caption" className="text-gray-500">Pos. $49.4M / Cap. $27.2M</Text>
            <span className="font-mono text-xl font-bold text-amber-500">1.82×</span>
            <Badge variant="warning" size="sm">BAJO META</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Text variant="caption" className="text-gray-500 whitespace-nowrap">0×</Text>
          <div className="flex-1 relative">
            <ProgressBar value={60.7} size="sm" variant="warning" />
            <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-amber-500/80 rounded-full" />
          </div>
          <Text variant="caption" className="text-amber-600 font-semibold whitespace-nowrap">Meta 3.0×</Text>
        </div>
      </div>

      <div className="grid grid-cols-[1.2fr_1fr] gap-2.5">
        <div className="h-[130px]">
          <Chart type="line" data={CHART_IED_LINE} options={CHART_IED_OPTS} height={130} />
        </div>
        <div>
          <table className="w-full text-[10px] border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-1.5 px-2 text-gray-500 font-semibold">Divisa</th>
                <th className="text-right py-1.5 px-2 text-gray-500 font-semibold">Pos. Global</th>
                <th className="text-right py-1.5 px-2 text-gray-500 font-semibold">Captaciones</th>
                <th className="text-right py-1.5 px-2 text-gray-500 font-semibold">IED</th>
                <th className="text-right py-1.5 px-2 text-gray-500 font-semibold">Meta</th>
                <th className="text-center py-1.5 px-2 text-gray-500 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody>
              {KPI_IED_CURRENCIES.map((c) => (
                <tr key={c.moneda} className="border-b border-gray-100">
                  <td className="py-1.5 px-2">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-semibold"
                      style={{ background: `${c.color}15`, color: c.color, border: `1px solid ${c.color}30` }}>
                      {c.moneda}
                    </span>
                  </td>
                  <td className="text-right py-1.5 px-2 font-mono text-gray-700">{c.posicion}</td>
                  <td className="text-right py-1.5 px-2 font-mono text-blue-500">{c.captaciones}</td>
                  <td className="text-right py-1.5 px-2 font-mono font-bold"
                    style={{ color: c.status === "ok" ? "#22c55e" : c.status === "bajo" ? "#f59e0b" : "#ef4444" }}>
                    {c.ied}
                  </td>
                  <td className="text-right py-1.5 px-2 font-mono text-gray-400">{c.meta}</td>
                  <td className="text-center py-1.5 px-2">
                    <Badge variant={c.status === "ok" ? "success" : c.status === "bajo" ? "warning" : "error"} size="sm">
                      {c.status === "ok" ? "OK" : c.status === "bajo" ? "BAJO META" : "DÉFICIT"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-teal-50/50 border-t border-teal-200">
                <td className="py-1.5 px-2 font-bold text-[9px] text-teal-600">
                  <span className="mr-1">🌐</span>GLOBAL
                </td>
                <td className="text-right py-1.5 px-2 font-mono text-[9px] text-gray-500">$49.4M eq.</td>
                <td className="text-right py-1.5 px-2 font-mono text-[9px] text-blue-500">$27.2M eq.</td>
                <td className="text-right py-1.5 px-2 font-mono text-[9px] font-bold text-amber-500">1.82×</td>
                <td className="text-right py-1.5 px-2 font-mono text-[9px] text-gray-400">≥ 3.0×</td>
                <td className="text-center py-1.5 px-2">
                  <Badge variant="warning" size="sm">BAJO META</Badge>
                </td>
              </tr>
            </tfoot>
          </table>
          <div className="mt-2 p-1.5 bg-red-50 border border-red-200 rounded-lg text-[8px] text-red-600">
            <span className="mr-1">⚠</span>
            <strong>VED y USD bajo meta:</strong> IED VED 1.56 y USD 2.96 &lt; meta 3.0×. Acción: incrementar posición global o revisar captaciones contables del Core Bancario.
          </div>
        </div>
      </div>

      <div className="mt-2 p-1.5 bg-gray-50 rounded-lg text-[9px] text-gray-500">
        <strong className="text-gray-700">Definición:</strong> IED = Posición Global de Efectivo ÷ Captaciones Contables (Core Bancario). Meta: IED ≥ 3.0× por divisa.
      </div>
    </Card>
  );
}
