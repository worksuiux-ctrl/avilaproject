import { Plus, X, ArrowRight, Building2, CreditCard, Monitor, Truck, Warehouse, AlertTriangle } from "lucide-react";
import { Button, Input, Select, Switch } from "@coe/design-system";
import { useTransaccionesStore, type TransaccionStep, ENTIDADES, DIVISAS_OPTS, TRANSPORTADORAS } from "@stores/transaccionesStore";

const ENTIDAD_ICONS: Record<string, typeof Building2> = {
  Bóveda: Building2,
  Caja: CreditCard,
  ATM: Monitor,
  Camión: Truck,
  Almacén: Warehouse,
};

export function MotorTransaccionesPage() {
  const store = useTransaccionesStore();
  const { flow, giro, setGiro, setActiveStep } = store;
  const activeStep = flow.steps.find((s) => s.id === flow.activeStepId) ?? null;

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-[18px] font-bold text-[var(--color-neutro-900)]">Motor de Transacciones</h1>
          <p className="text-[13px] text-[var(--color-neutro-500)]">
            Constructor visual de procesos transaccionales — flujo: <span className="font-semibold text-[var(--color-verde-100)]">{flow.nombre}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-medium text-[var(--color-neutro-500)]">Giro:</span>
          <button
            className={`px-3 py-1.5 text-[12px] font-semibold rounded-corner-m border transition-colors ${
              giro === "banco"
                ? "bg-[var(--color-verde-100)] text-white border-[var(--color-verde-100)]"
                : "bg-white text-[var(--color-neutro-500)] border-[var(--color-neutro-200)] hover:border-[var(--color-verde-100)]"
            }`}
            onClick={() => setGiro("banco")}
          >
            Banca
          </button>
          <button
            className={`px-3 py-1.5 text-[12px] font-semibold rounded-corner-m border transition-colors ${
              giro === "retail"
                ? "bg-[var(--color-verde-100)] text-white border-[var(--color-verde-100)]"
                : "bg-white text-[var(--color-neutro-500)] border-[var(--color-neutro-200)] hover:border-[var(--color-verde-100)]"
            }`}
            onClick={() => setGiro("retail")}
          >
            Retail
          </button>
        </div>
      </div>

      {/* Three-column layout */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Column 1: Entity Panel */}
        <EntityPanel />

        {/* Column 2: Flow Canvas */}
        <div className="flex-1 bg-white border border-[var(--color-neutro-200)] rounded-corner-m overflow-y-auto shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="p-3 border-b border-[var(--color-neutro-200)] flex items-center justify-between">
            <p className="text-[12px] font-semibold text-[var(--color-neutro-600)] uppercase tracking-wide">
              Lienzo de Flujo ({flow.steps.length} pasos)
            </p>
            <Button size="sm" iconLeft={<Plus className="w-3.5 h-3.5" />} onClick={() => store.addStep()}>
              Agregar Paso
            </Button>
          </div>
          <div className="p-4 space-y-3">
            {flow.steps.map((step, idx) => (
              <StepCard
                key={step.id}
                step={step}
                index={idx}
                isActive={flow.activeStepId === step.id}
                onSelect={() => setActiveStep(step.id)}
                onUpdateName={(n) => store.updateStepName(step.id, n)}
                onRemove={() => store.removeStep(step.id)}
                onAddExcepcion={() => store.addExcepcion(step.id)}
                onRemoveExcepcion={(exId) => store.removeExcepcion(step.id, exId)}
                onUpdateExcepcionName={(exId, n) => store.updateExcepcionName(step.id, exId, n)}
                total={flow.steps.length}
              />
            ))}
            {flow.steps.length === 0 && (
              <p className="text-[13px] text-[var(--color-neutro-400)] text-center py-8">
                No hay pasos en el flujo. Agregue el primero.
              </p>
            )}
          </div>
        </div>

        {/* Column 3: Property Inspector */}
        <div className="w-[320px] shrink-0 bg-white border border-[var(--color-neutro-200)] rounded-corner-m overflow-y-auto shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="p-3 border-b border-[var(--color-neutro-200)]">
            <p className="text-[12px] font-semibold text-[var(--color-neutro-600)] uppercase tracking-wide">
              Inspector de Propiedades
            </p>
          </div>
          {activeStep ? (
            <PropertyInspector step={activeStep} giro={giro} />
          ) : (
            <div className="flex flex-col items-center justify-center h-[200px] text-center p-4">
              <p className="text-[13px] text-[var(--color-neutro-400)]">
                Seleccione un paso del flujo para ver sus propiedades
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Column 1: Entity Panel ── */
function EntityPanel() {
  const { entidadOrigen, entidadDestino, setEntidadOrigen, setEntidadDestino } = useTransaccionesStore();

  function handleClick(id: string) {
    if (entidadOrigen === id) {
      setEntidadOrigen(null);
      setEntidadDestino(id);
    } else if (entidadDestino === id) {
      setEntidadDestino(null);
    } else {
      setEntidadOrigen(id);
    }
  }

  return (
    <div className="w-[260px] shrink-0 bg-white border border-[var(--color-neutro-200)] rounded-corner-m overflow-y-auto shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="p-3 border-b border-[var(--color-neutro-200)]">
        <p className="text-[12px] font-semibold text-[var(--color-neutro-600)] uppercase tracking-wide">
          Entidades ({ENTIDADES.length})
        </p>
      </div>
      <div className="p-2 space-y-1">
        {ENTIDADES.map((ent) => {
          const Icon = ENTIDAD_ICONS[ent.tipo] || Building2;
          const isOrigen = entidadOrigen === ent.id;
          const isDestino = entidadDestino === ent.id;
          return (
            <button
              key={ent.id}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-corner-m text-left text-[13px] transition-colors ${
                isOrigen || isDestino
                  ? "bg-[var(--color-verde-100)] text-white"
                  : "text-[var(--color-neutro-700)] hover:bg-[var(--color-neutro-100)]"
              }`}
              onClick={() => handleClick(ent.id)}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{ent.nombre}</p>
                <p className={`text-[11px] truncate ${isOrigen || isDestino ? "text-white/70" : "text-[var(--color-neutro-400)]"}`}>
                  {ent.tipo}
                </p>
              </div>
              {isOrigen && (
                <span className="text-[10px] font-bold bg-white/20 px-1.5 py-0.5 rounded-corner-m shrink-0">
                  Origen
                </span>
              )}
              {isDestino && (
                <span className="text-[10px] font-bold bg-white/20 px-1.5 py-0.5 rounded-corner-m shrink-0">
                  Destino
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Column 2: Step Card ── */
function StepCard({
  step, index, isActive, onSelect, onUpdateName, onRemove, onAddExcepcion,
  onRemoveExcepcion, onUpdateExcepcionName, total,
}: {
  step: TransaccionStep;
  index: number;
  isActive: boolean;
  onSelect: () => void;
  onUpdateName: (n: string) => void;
  onRemove: () => void;
  onAddExcepcion: () => void;
  onRemoveExcepcion: (id: string) => void;
  onUpdateExcepcionName: (id: string, n: string) => void;
  total: number;
}) {
  return (
    <div
      className={`border rounded-corner-m transition-all ${
        isActive
          ? "border-[var(--color-verde-100)] ring-1 ring-[var(--color-verde-100)]"
          : "border-[var(--color-neutro-200)]"
      }`}
      onClick={onSelect}
    >
      <div className="p-3">
        <div className="flex items-center gap-3">
          {/* Step number */}
          <span className={`w-7 h-7 flex items-center justify-center rounded-full text-[12px] font-bold shrink-0 ${
            isActive
              ? "bg-[var(--color-verde-100)] text-white"
              : "bg-[var(--color-neutro-100)] text-[var(--color-neutro-500)]"
          }`}>
            {index + 1}
          </span>
          {/* Editable name */}
          <div className="flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
            <Input
              value={step.nombre}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdateName(e.target.value)}
              className="!border-0 !p-0 !text-[14px] !font-semibold !bg-transparent !shadow-none !h-auto"
            />
          </div>
          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              className="p-1 rounded-corner-m hover:bg-[var(--color-neutro-100)] text-[var(--color-neutro-400)] hover:text-amber-500 transition-colors"
              title="Agregar ruta alterna"
              onClick={onAddExcepcion}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
            </button>
            {total > 1 && (
              <button
                className="p-1 rounded-corner-m hover:bg-red-50 text-[var(--color-neutro-400)] hover:text-red-400 transition-colors"
                title="Eliminar paso"
                onClick={onRemove}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Arrow connector to next step */}
        {index < total - 1 && (
          <div className="flex items-center gap-2 pl-[14px] py-1">
            <ArrowRight className="w-3.5 h-3.5 text-[var(--color-neutro-300)]" />
            <span className="text-[10px] text-[var(--color-neutro-300)] font-medium">siguiente</span>
          </div>
        )}

        {/* Excepciones (routes alternas) */}
        {step.excepciones.length > 0 && (
          <div className="mt-2 ml-10 space-y-1">
            {step.excepciones.map((exc) => (
              <div
                key={exc.id}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-corner-m bg-amber-50 border border-amber-200"
              >
                <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                <input
                  value={exc.nombre}
                  onChange={(e) => onUpdateExcepcionName(exc.id, e.target.value)}
                  className="flex-1 text-[12px] bg-transparent border-0 p-0 outline-none text-amber-800 placeholder:text-amber-400"
                  placeholder="Nombre de la excepción..."
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  className="p-0.5 rounded hover:bg-amber-200 text-amber-400 hover:text-red-500 transition-colors"
                  onClick={(e) => { e.stopPropagation(); onRemoveExcepcion(exc.id); }}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Column 3: Property Inspector ── */
function PropertyInspector({ step, giro }: { step: TransaccionStep; giro: "banco" | "retail" }) {
  const { updateStepProperty } = useTransaccionesStore();
  const sid = step.id;

  return (
    <div className="p-3 space-y-4" onClick={(e) => e.stopPropagation()}>
      {/* Step name */}
      <div>
        <p className="text-[11px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide mb-1">Paso activo</p>
        <p className="text-[14px] font-bold text-[var(--color-neutro-900)]">{step.nombre}</p>
      </div>

      {/* Common options */}
      <div className="space-y-2">
        <p className="text-[11px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide">Configuración General</p>
        <label className="flex items-center gap-2 cursor-pointer">
          <Switch checked={step.requiereEscaneoPrecinto} onChange={(v: boolean) => updateStepProperty(sid, "requiereEscaneoPrecinto", v)} />
          <span className="text-[13px] text-[var(--color-neutro-700)]">Requerir Escaneo de Precinto</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <Switch checked={step.asignarResponsable} onChange={(v: boolean) => updateStepProperty(sid, "asignarResponsable", v)} />
          <span className="text-[13px] text-[var(--color-neutro-700)]">Asignar Responsable</span>
        </label>
      </div>

      {/* Giro-specific fields */}
      <div className="border-t border-[var(--color-neutro-100)] pt-3 space-y-3">
        <p className="text-[11px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide">
          {giro === "banco" ? "Configuración Bancaria" : "Configuración Retail"}
        </p>

        {giro === "banco" ? (
          <>
            <div>
              <p className="text-[12px] text-[var(--color-neutro-600)] mb-1">Divisa</p>
              <Select
                options={DIVISAS_OPTS}
                value={step.divisa}
                onChange={(v: string) => updateStepProperty(sid, "divisa", v)}
                placeholder="Seleccionar divisa..."
              />
            </div>
            <div>
              <p className="text-[12px] text-[var(--color-neutro-600)] mb-1">Límite Mínimo</p>
              <Input
                type="number"
                value={step.limiteMin}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateStepProperty(sid, "limiteMin", Number(e.target.value))}
              />
            </div>
            <div>
              <p className="text-[12px] text-[var(--color-neutro-600)] mb-1">Límite Máximo</p>
              <Input
                type="number"
                value={step.limiteMax}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateStepProperty(sid, "limiteMax", Number(e.target.value))}
              />
            </div>
            <div>
              <p className="text-[12px] text-[var(--color-neutro-600)] mb-1">Transportadora de Valores</p>
              <Select
                options={TRANSPORTADORAS}
                value={step.transportadora}
                onChange={(v: string) => updateStepProperty(sid, "transportadora", v)}
                placeholder="Seleccionar transportadora..."
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <p className="text-[12px] text-[var(--color-neutro-600)] mb-1">Fecha de Vencimiento</p>
              <Input
                type="date"
                value={step.fechaVencimiento}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateStepProperty(sid, "fechaVencimiento", e.target.value)}
              />
            </div>
            <div>
              <p className="text-[12px] text-[var(--color-neutro-600)] mb-1">Lote</p>
              <Input
                value={step.lote}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateStepProperty(sid, "lote", e.target.value)}
                placeholder="Número de lote..."
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[12px] text-[var(--color-neutro-600)] mb-1">Temp. Mínima</p>
                <Input
                  type="number"
                  value={step.temperaturaMin}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateStepProperty(sid, "temperaturaMin", Number(e.target.value))}
                />
              </div>
              <div>
                <p className="text-[12px] text-[var(--color-neutro-600)] mb-1">Temp. Máxima</p>
                <Input
                  type="number"
                  value={step.temperaturaMax}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateStepProperty(sid, "temperaturaMax", Number(e.target.value))}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
