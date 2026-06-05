import { useState } from "react";
import { Card, Badge, Button, Table, Select } from "@worksuiux-ctrl/my-design-system";
import { EfectivoGlobal, InventarioFisicoTotal, InventarioBovedas, Demanda48h, NodosAlerta, SlaCumplimiento } from "@components/indicators";
import { Scale, Truck, Check } from "lucide-react";
import { CoengineLogo } from "@components/ui/CoengineLogo";

const conciliacionData = [
  { centro: "TransValores Norte", fisico: "$1,250,000", electronico: "$1,250,000", diferencia: "$0", estado: "success" as const },
  { centro: "Blindados Sur", fisico: "$845,000", electronico: "$844,800", diferencia: "-$200", estado: "warning" as const },
  { centro: "Acopio Oriente", fisico: "$620,000", electronico: "$620,000", diferencia: "$0", estado: "success" as const },
];

const conciliacionColumns = [
  { key: "centro", label: "Centro" },
  { key: "fisico", label: "Físico" },
  { key: "electronico", label: "Electrónico" },
  { key: "diferencia", label: "Diferencia" },
  {
    key: "estado", label: "Estado",
    render: (row: typeof conciliacionData[0]) => (
      <Badge variant={row.estado === "success" ? "success" : "warning"} size="sm">
        {row.estado === "success" ? "OK" : "Disputa"}
      </Badge>
    ),
  },
];

const liquidityOptions = [
  { value: "semana", label: "Esta semana" },
  { value: "mes", label: "Mes actual" },
];

export function Dashboard() {
  const [periodo, setPeriodo] = useState("semana");
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
        <EfectivoGlobal />
        <InventarioFisicoTotal />
        <InventarioBovedas />
        <Demanda48h />
        <NodosAlerta />
        <SlaCumplimiento />
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-3">
        <Card variant="outlined" padding="md">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold">Liquidez Semanal</h3>
            <Select options={liquidityOptions} value={periodo} onChange={setPeriodo} />
          </div>
          <div className="flex gap-3 mb-3 text-[10px] text-gray-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-green-500" />Físico</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-blue-500/80" />Electrónico</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm border border-dashed border-green-500 bg-transparent" />Pronóstico</span>
          </div>
          <div className="grid grid-cols-7 gap-1 h-[72px] items-end">
            {[
              { day: "L", h: 55, c: "bg-green-500" },
              { day: "M", h: 40, c: "bg-green-500" },
              { day: "X", h: 68, c: "bg-green-500" },
              { day: "J", h: 58, c: "bg-green-500" },
              { day: "HOY", h: 82, c: "bg-blue-500" },
              { day: "V", h: 75, dashed: true },
              { day: "S", h: 90, dashed: true },
            ].map((bar) => (
              <div key={bar.day} className="flex flex-col items-center gap-0.5 justify-end h-full">
                <div className={`w-full rounded-t-sm ${bar.dashed ? "h-0 border-t-2 border-dashed border-green-500" : bar.c}`}
                  style={bar.dashed ? {} : { height: `${bar.h}%` }} />
                <span className={`text-[8px] ${bar.day === "HOY" ? "text-green-600 font-bold" : "text-gray-500"}`}>{bar.day}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card variant="outlined" padding="md">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold flex items-center gap-2"><CoengineLogo className="w-4 h-4" />Propuesta COENGINE</h3>
            <Badge variant="success" size="sm">ACTIVO</Badge>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-2">
            <div className="flex justify-between mb-1">
              <div>
                <div className="text-[10px] font-semibold text-green-600 uppercase">Propuesta #ÁV-992</div>
                <div className="text-xs text-gray-900 font-medium mt-0.5">ATM Sambil → Acopio Norte</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-gray-900">$450K</div>
                <div className="text-[9px] text-green-600">Conf. 94.2%</div>
              </div>
            </div>
            <div className="text-[10px] text-gray-500 mb-2">
              CIT: <span className="text-orange-500">TransValores SA</span> · Remesa
            </div>
            <Button variant="primary" size="sm" className="w-full">
              <Check className="w-3.5 h-3.5" />
              Aprobar y Asignar
            </Button>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card variant="outlined" padding="md">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold flex items-center gap-2"><Scale className="w-3.5 h-3.5 text-blue-500" />Conciliación Banco vs CIT</h3>
            <Button variant="outline" size="sm">Matching</Button>
          </div>
          <Table data={conciliacionData} columns={conciliacionColumns} />
        </Card>

        <Card variant="outlined" padding="md">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold flex items-center gap-2"><Truck className="w-3.5 h-3.5 text-blue-500" />Telemetría CIT</h3>
            <Badge variant="info" size="sm">14 UNIDADES</Badge>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-3 mb-2 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-50 text-blue-500 shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-gray-500">V-041 · Blindados SA</div>
              <div className="text-xs font-medium text-gray-900 mt-0.5 truncate">Retail Sur → Acopio Norte</div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
                <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: "65%" }} />
              </div>
            </div>
            <Badge variant="info" size="sm">Tránsito</Badge>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-orange-50 text-orange-500 shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-gray-500">V-082 · TransValores</div>
              <div className="text-xs font-medium text-gray-900 mt-0.5 truncate">Bóveda Oeste (Descargando)</div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
                <div className="h-full rounded-full bg-orange-500" style={{ width: "92%" }} />
              </div>
            </div>
            <Badge variant="warning" size="sm">Destino</Badge>
          </div>
        </Card>
      </div>
    </div>
  );
}
