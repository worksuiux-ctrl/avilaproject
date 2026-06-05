import { useState } from "react";
import { Button, Text, Select } from "@coe/design-system";
import {
  KPI_SCORECARDS,
} from "@data/kpiData";
import {
  KpiScorecardRow,
  KpiIedPanel,
  KpiMasaMonetaria,
  KpiCostoMargen,
  KpiLcrFx,
  KpiCostoSla,
} from "@components/kpi";

const PERIODS = [
  { value: "hoy", label: "Hoy" },
  { value: "semana", label: "Esta semana" },
  { value: "mes", label: "Este mes" },
  { value: "trim", label: "Trimestre" },
];

const CURRENCIES = [
  { value: "USD", label: "USD" },
  { value: "VED", label: "VED" },
  { value: "EUR", label: "EUR" },
  { value: "ALL", label: "Todas" },
];

export function KpiEstrategico() {
  const [period, setPeriod] = useState("semana");
  const [currency, setCurrency] = useState("ALL");

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
            style={{ background: "linear-gradient(135deg, #a855f7, rgba(168,85,247,.5))" }}>
            <span>📊</span>
          </div>
          <div>
            <Text variant="body" className="font-bold text-[15px]">KPIs Estratégicos de Gestión de Efectivo</Text>
            <Text variant="caption" className="text-purple-500 uppercase font-semibold tracking-wider">
              Perfil: Gerencia Ejecutiva · Actualizado hace 3 min
            </Text>
          </div>
        </div>
        <div className="flex gap-1.5 items-center">
          <Select options={PERIODS} value={period} onChange={setPeriod} />
          <Select options={CURRENCIES} value={currency} onChange={setCurrency} />
          <Button variant="outline" size="sm">Exportar</Button>
          <Button variant="primary" size="sm"
            style={{ background: "linear-gradient(135deg, #a855f7, rgba(168,85,247,.6))", border: "none" }}>
            Análisis IA
          </Button>
        </div>
      </div>

      <KpiScorecardRow items={KPI_SCORECARDS} />
      <KpiIedPanel />
      <KpiMasaMonetaria />
      <KpiCostoMargen />
      <KpiLcrFx />
      <KpiCostoSla />
    </div>
  );
}
