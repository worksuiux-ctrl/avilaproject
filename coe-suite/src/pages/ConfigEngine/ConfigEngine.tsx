import { useState } from "react";
import { Card, Badge, Button, Heading, Select, Switch, Slider, Checkbox } from "@worksuiux-ctrl/my-design-system";
import { CoengineLogo } from "@components/ui/CoengineLogo";
import { Play, Upload, Clock, Brain, FlaskConical, Bell, Zap, Hand, AlertTriangle, FolderOpen, BarChart3, DollarSign, TrendingUp, ChevronDown } from "lucide-react";

type Modo = "suggest" | "auto" | "alert";

const modoOptions = [
  { value: "suggest", label: "Sugerencia — requiere aprobación del operador" },
  { value: "auto", label: "Automático — ejecuta sin intervención" },
  { value: "alert", label: "Solo Alertas — notifica sin proponer" },
];

const cycleOptions = [
  { value: "5", label: "Cada 5 minutos" },
  { value: "15", label: "Cada 15 minutos" },
  { value: "30", label: "Cada 30 minutos" },
  { value: "60", label: "Cada hora" },
];

const horizonOptions = [
  { value: "24", label: "24 horas" },
  { value: "48", label: "48 horas" },
  { value: "72", label: "72 horas" },
];

const channelsData = [
  { id: "agencia", label: "Agencia / Sucursal", icon: "🏦", active: true, nextAction: "Hoy 18:00", demand: "+12%" },
  { id: "acopio", label: "Centro de Acopio", icon: "🏛", active: true, nextAction: "Mañana 07:00", demand: "+5%" },
  { id: "taquilla", label: "Taquilla Externa", icon: "💼", active: false, nextAction: "—", demand: "N/A" },
  { id: "atm", label: "ATM", icon: "🏧", active: true, nextAction: "Hoy 14:30", demand: "+41%" },
  { id: "corresp", label: "Corresponsal", icon: "🌐", active: false, nextAction: "—", demand: "N/A" },
];

const modelsData = [
  { name: "Gradient Boosting", scope: "ATMs · Denominaciones", mae: "1.8%", status: "activo" as const },
  { name: "LSTM Neural Net", scope: "Sucursales · Serie 72h", mae: "1.5%", status: "activo" as const },
  { name: "Prophet + Calendar", scope: "Quincenas · Feriados", mae: "2.1%", status: "activo" as const },
  { name: "Montecarlo v3.1", scope: "Red completa · IC 95%", mae: "1.5%", status: "activo" as const },
];

const activityFeed = [
  { type: "success" as const, title: "Propuesta · Agencia / Sucursal", desc: "$180K · 92% confianza", time: "12:34:22" },
  { type: "success" as const, title: "Propuesta · ATM", desc: "$95K · 88% confianza", time: "12:34:20" },
  { type: "info" as const, title: "Ciclo manual iniciado", desc: "Analizando demanda en todos los canales activos...", time: "12:34:18" },
  { type: "warn" as const, title: "Regla activada", desc: "Stock-out por Denominación · R-INV-001", time: "12:30:05" },
];

const activityIcon = { success: Play, warn: AlertTriangle, info: Clock, error: Bell };

const rulesData = [
  {
    section: "Inventario por Denominación y Divisa",
    color: "amber",
    icon: FolderOpen,
    rules: [
      { id: "R-INV-001", active: true, priority: 1, name: "Stock-out por Denominación", desc: "Si el inventario de cualquier denominación en un nodo cae por debajo del umbral mínimo de piezas, generar propuesta de reposición inmediata.", threshold: "$100: min 500 pzas · $50: min 400 · $20: min 600", action: "Propuesta JIT automática al CIT más cercano." },
      { id: "R-INV-002", active: true, priority: 1, name: "Límite Máximo de Bóveda", desc: "Si el inventario supera el límite máximo autorizado de la bóveda, proponer remesa de excedente hacia acopio.", threshold: "Máximo: $5M HQ · $300K Sucursales · $80K ATMs", action: "Propuesta de remesa de excedente a Acopio Norte o Sur." },
      { id: "R-INV-003", active: true, priority: 2, name: "Desequilibrio por Divisa", desc: "Si el mix de divisas en la bóveda se desvía >15% de la demanda proyectada por divisa, proponer intercambio.", threshold: "Desvío tolerado: ±15% respecto a pronóstico de demanda", action: "Propuesta de conversión o transferencia para rebalancear mix." },
    ],
  },
  {
    section: "Demanda Estimada y Estacionalidad",
    color: "blue",
    icon: BarChart3,
    rules: [
      { id: "R-DEM-001", active: true, priority: 1, name: "Pre-carga Fin de Semana", desc: "Todos los viernes antes de las 14:00, verificar nivel de ATMs y sucursales.", threshold: "Trigger: viernes antes de 14:00 h · ATMs < 120% demanda Sáb+Dom", action: "Propuesta de recarga masiva ATMs viernes tarde." },
      { id: "R-DEM-002", active: true, priority: 1, name: "Quincena y Fin de Mes", desc: "7 días antes de quincena o fin de mes, incrementar nivel objetivo.", threshold: "Trigger: 7d antes · Factor quincena +38% · Factor fin mes +17%", action: "Aumento de nivel objetivo → propuestas JIT anticipadas." },
    ],
  },
  {
    section: "Optimización de Costos Logísticos",
    color: "green",
    icon: DollarSign,
    rules: [
      { id: "R-COST-001", active: true, priority: 2, name: "Agrupación de Remesas", desc: "Consolidar múltiples destinos en una sola ruta CIT para minimizar costo unitario.", threshold: "≥2 destinos en misma zona · ventana ≤3h · ahorro ≥$120", action: "Una sola ruta CIT con múltiples paradas." },
      { id: "R-COST-002", active: true, priority: 2, name: "Overnight sobre Exceso", desc: "Excedente sin remesa programada en 4h → colocación overnight.", threshold: "Exceso > $500K en Bóveda HQ · sin remesa en 4h", action: "Propuesta de colocación overnight." },
    ],
  },
  {
    section: "Maximización de Rentabilidad",
    color: "purple",
    icon: TrendingUp,
    rules: [
      { id: "R-RENT-001", active: true, priority: 1, name: "Optimización del Nivel de Inventario", desc: "Mantener inventario mínimo necesario más colchón de seguridad.", threshold: "Nivel objetivo = Demanda 48h × (1 + colchón) · colchón default: 20%", action: "Propuesta de excedente hacia acopio u overnight." },
    ],
  },
];

const priorityLabel = { 1: "ALTA", 2: "MEDIA", 3: "BAJA" } as const;
const priorityColor = { 1: "text-red-500", 2: "text-amber-500", 3: "text-gray-400" } as const;

export function ConfigEngine() {
  const [modo, setModo] = useState<Modo>("suggest");
  const [cycle, setCycle] = useState("15");
  const [horizon, setHorizon] = useState("48");
  const [confidence, setConfidence] = useState(85);
  const [botActive, setBotActive] = useState(true);
  const [channels, setChannels] = useState(channelsData);
  const [rules, setRules] = useState(rulesData);
  const [openRule, setOpenRule] = useState<string | null>(null);

  const toggleChannel = (id: string) => {
    setChannels((prev) => prev.map((ch) => (ch.id === id ? { ...ch, active: !ch.active } : ch)));
  };

  const toggleRule = (sectionIdx: number, ruleId: string) => {
    setRules((prev) =>
      prev.map((sec, i) =>
        i === sectionIdx
          ? { ...sec, rules: sec.rules.map((r) => (r.id === ruleId ? { ...r, active: !r.active } : r)) }
          : sec,
      ),
    );
  };

  const actionsToday = 3;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CoengineLogo className="w-8 h-8" />
          <div>
            <Heading variant="title" as="h2">Configuración del Engine</Heading>
            <p className="text-[11px] text-green-600 font-semibold mt-0.5">
              Automatización JIT · Aprovisionamiento Inteligente · Configurable por Canal
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Switch label="" checked={botActive} onChange={setBotActive} />
          <Badge variant={botActive ? "success" : "error"} size="sm">
            {botActive ? "● BOT ACTIVO" : "● BOT DETENIDO"}
          </Badge>
        </div>
      </div>

      {/* Status banner */}
      {botActive && (
        <Card variant="outlined" padding="sm" className="border-green-200 bg-green-50/30">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-900">
                {modo === "auto" ? "⚡ AUTOMÁTICO — ejecuta remesas sin intervención" : modo === "alert" ? "Modo Alerta — solo notifica, no genera propuestas" : "Bot en modo Sugerencia — esperando confirmación del operador"}
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">
                Los modelos ML analizan demanda en tiempo real. Las propuestas de remesa se generan automáticamente y quedan pendientes de aprobación.
              </p>
            </div>
            <Button variant={modo === "auto" ? "primary" : "outline"} size="sm" onClick={() => setModo("auto")}>
              <Zap className="w-3 h-3" />
              Modo Auto
            </Button>
            <Button variant={modo === "suggest" ? "primary" : "outline"} size="sm" onClick={() => setModo("suggest")}>
              <Hand className="w-3 h-3" />
              Modo Sugerencia
            </Button>
          </div>
        </Card>
      )}

      {/* Channel cards */}
      <div>
        <Heading variant="paragraph" as="h3" className="mb-2">Canales Habilitados</Heading>
        <div className="grid grid-cols-5 gap-3">
          {channels.map((ch) => {
            const on = ch.active && botActive;
            return (
              <Card key={ch.id} variant={on ? "outlined" : "flat"} padding="sm" className={on ? "border-green-300" : "opacity-55"}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">{ch.icon}</span>
                  <Switch checked={ch.active} onChange={() => toggleChannel(ch.id)} />
                </div>
                <p className="text-[11px] font-semibold text-gray-700">{ch.label}</p>
                <p className={`text-[9px] font-semibold uppercase tracking-wide mt-0.5 ${on ? "text-green-600" : "text-gray-300"}`}>
                  {on ? "ACTIVO" : "INACTIVO"}
                </p>
                <p className="text-[9px] text-gray-400 mt-1">Próxima: {ch.active ? ch.nextAction : "—"}</p>
                <p className="text-[9px] text-gray-400">
                  Demanda: <span className={`font-semibold ${on ? "text-green-600" : "text-gray-300"}`}>{ch.active ? ch.demand : "—"}</span>
                </p>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Parameters + Activity */}
      <div className="grid grid-cols-[7fr_5fr] gap-3">
        {/* Left: Parameters */}
        <div className="space-y-3">
          <Card variant="outlined" padding="md">
            <Heading variant="paragraph" as="h3" className="mb-3">Parámetros del Engine</Heading>
            <div className="space-y-3">
              <Select label="Modo de operación" options={modoOptions} value={modo} onChange={(v) => setModo(v as Modo)} />
              <Select label="Ciclo de análisis" options={cycleOptions} value={cycle} onChange={setCycle} />
              <Select label="Horizonte de proyección" options={horizonOptions} value={horizon} onChange={setHorizon} />
              <Slider label="Umbral mínimo de confianza" value={confidence} onChange={setConfidence} showValue min={60} max={98} />
              <div>
                <p className="text-[11px] font-semibold text-gray-600 mb-1.5">Notificaciones</p>
                <div className="flex flex-col gap-1.5">
                  <Checkbox label="Alertar al operador al generar propuesta" defaultChecked />
                  <Checkbox label="Notificar stock-outs proyectados con >4h de anticipación" defaultChecked />
                  <Checkbox label="Ejecutar remesas de fin de semana el viernes de forma autónoma" />
                </div>
              </div>
            </div>
          </Card>

          <Card variant="outlined" padding="md">
            <div className="flex items-center justify-between mb-3">
              <Heading variant="paragraph" as="h3">Modelos ML Activos</Heading>
              <Button variant="outline" size="sm">
                <FlaskConical className="w-3 h-3" />
                Calibrar
              </Button>
            </div>
            <div className="space-y-1.5">
              {modelsData.map((m) => (
                <div key={m.name} className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-2.5">
                    <Brain className="w-4 h-4 text-purple-500" />
                    <div>
                      <p className="text-[11px] font-semibold text-gray-900">{m.name}</p>
                      <p className="text-[9px] text-gray-500">{m.scope}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-green-600 font-semibold">MAE {m.mae}</span>
                    <Badge variant="success" size="sm">{m.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right: Live activity */}
        <Card variant="outlined" padding="md" className="flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <Heading variant="paragraph" as="h3">
              <Clock className="w-4 h-4 inline align-text-bottom mr-1" />
              Actividad en Tiempo Real
            </Heading>
            <Badge variant="info" size="sm">{actionsToday} acciones hoy</Badge>
          </div>
          <div className="flex-1 space-y-0.5 overflow-y-auto max-h-[360px] mb-3">
            {activityFeed.map((a, i) => {
              const Icon = activityIcon[a.type];
              const colorMap = { success: "text-green-500", warn: "text-amber-500", info: "text-blue-500", error: "text-red-500" };
              return (
                <div key={i} className="flex items-start gap-2.5 px-2.5 py-2 rounded-lg transition-colors hover:bg-gray-50/50">
                  <Icon className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${colorMap[a.type]}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-[11px] font-semibold text-gray-900 truncate">{a.title}</p>
                      <span className="text-[8px] text-gray-400 shrink-0">{a.time}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 truncate">{a.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-2 pt-3 border-t border-gray-200">
            <Button variant="primary" size="sm" className="flex-1 justify-center">
              <Play className="w-3 h-3" />
              Ejecutar Ciclo Ahora
            </Button>
            <Button variant="outline" size="sm" className="flex-1 justify-center">
              <BarChart3 className="w-3 h-3" />
              Ver Motor
            </Button>
          </div>
        </Card>
      </div>

      {/* Business Rules */}
      <div className="flex items-center justify-between">
        <Heading variant="paragraph" as="h3">Reglas de Negocio del Engine</Heading>
        <Button variant="outline" size="sm">
          <Upload className="w-3 h-3" />
          Cargar Reglas
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {rules.map((sec, si) => {
        const activeCount = sec.rules.filter((r) => r.active).length;
        return (
          <Card key={sec.section} variant="outlined" padding="md">
            <div className="flex items-center gap-2 mb-3">
              <sec.icon className={`w-4 h-4 text-${sec.color}-500`} />
              <Heading variant="paragraph" as="h4">{sec.section}</Heading>
              <Badge variant="info" size="sm">{activeCount}/{sec.rules.length} activas</Badge>
            </div>
            <div className="space-y-1">
              {sec.rules.map((r) => {
                const isOpen = openRule === r.id;
                return (
                  <div key={r.id} className={`border rounded-lg transition-all ${r.active ? (isOpen ? "bg-white border-green-300 shadow-sm" : "bg-white border-gray-200") : "bg-gray-50 border-gray-100 opacity-60"}`}>
                    <div
                      className="flex items-center justify-between p-3 cursor-pointer select-none hover:bg-gray-50/50 transition-colors"
                      onClick={() => setOpenRule(isOpen ? null : r.id)}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="text-[9px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded shrink-0">{r.id}</span>
                        <span className="text-xs font-semibold text-gray-900 truncate">{r.name}</span>
                        <span className={`text-[9px] font-bold shrink-0 ${priorityColor[r.priority as keyof typeof priorityColor]}`}>{priorityLabel[r.priority as keyof typeof priorityLabel]}</span>
                        <span className="text-[10px] text-gray-500 truncate ml-1">{r.threshold}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Switch checked={r.active} onChange={() => toggleRule(si, r.id)} />
                        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                      </div>
                    </div>
                    {isOpen && (
                      <div className="px-3 pb-3 pt-0 border-t border-gray-100 mt-0">
                        <p className="text-[10px] text-gray-600 mt-2 mb-2">{r.desc}</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-gray-50 rounded-lg p-2">
                            <p className="text-[8px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Umbral / Trigger</p>
                            <p className="text-[10px] text-gray-900">{r.threshold}</p>
                          </div>
                          <div className="bg-green-50/50 border border-green-100 rounded-lg p-2">
                            <p className="text-[8px] font-semibold text-green-700 uppercase tracking-wide mb-1">→ Acción del Engine</p>
                            <p className="text-[10px] text-gray-900">{r.action}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })}
      </div>
    </div>
  );
}
