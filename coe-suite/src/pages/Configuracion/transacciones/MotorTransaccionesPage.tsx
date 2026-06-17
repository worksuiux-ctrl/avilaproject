import { useState, useEffect } from "react";
import { Plus, X, ArrowRight, AlertTriangle, Clock, CheckCheck, GripVertical, OctagonX, Save, FolderOpen, Trash2, Pencil, Layers, Package, ChevronDown, Copy, Undo2 } from "lucide-react";
import { Button, Input, Select, Switch, Checkbox } from "@coe/design-system";
import { Modal } from "@components/ui/Modal";
import {
  useTransaccionesStore,
  type TransaccionStep,
  type Excepcion,
  CAMPOS_PREDEFINIDOS,
  TIPOS_CARGA,
  TIPOS_UNIDAD,
  AMBITOS,
  PERFILES_RESPONSABLE,
  EVENTOS_CONTABLES,
  UNIDADES_EVENTO,
  TIPOS_APROBACION,
} from "@stores/transaccionesStore";
import { useDivisasStore } from "@stores/divisasStore";
import { useProveedoresStore } from "@stores/proveedoresStore";
import { CATEGORIAS_SERVICIO } from "@stores/proveedoresStore";

const UNIDADES_POR_AMBITO: Record<string, { value: string; label: string }[]> = {
  interna: [
    { value: "Bóveda", label: "Bóveda" },
    { value: "Caja", label: "Caja" },
    { value: "Taquilla", label: "Taquilla" },
    { value: "Cajero", label: "Cajero / ATM" },
    { value: "Punto de Venta", label: "Punto de Venta" },
    { value: "Almacén", label: "Almacén" },
  ],
  "entre-agencias": [
    { value: "Agencia", label: "Agencia" },
    { value: "Bóveda", label: "Bóveda" },
    { value: "Caja", label: "Caja" },
    { value: "Taquilla", label: "Taquilla" },
    { value: "Cajero", label: "Cajero / ATM" },
    { value: "Camión", label: "Camión" },
    { value: "Almacén", label: "Almacén" },
  ],
  externa: [
    { value: "Agencia", label: "Agencia" },
    { value: "Taquilla Externa", label: "Taquilla Externa" },
    { value: "Camión", label: "Camión" },
    { value: "Banco", label: "Banco" },
    { value: "Almacén", label: "Almacén" },
    { value: "Punto de Venta", label: "Punto de Venta" },
  ],
};

export function MotorTransaccionesPage() {
  const store = useTransaccionesStore();
  const { proceso } = store;
  const [activeTab, setActiveTab] = useState<"operaciones-y-estados">("operaciones-y-estados");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [selectedSavedId, setSelectedSavedId] = useState<string | null>(null);
  const [showNewDialog, setShowNewDialog] = useState(false);

  useEffect(() => {
    if (proceso.nombre === "" && !selectedSavedId && store.procesosFinalizados.length > 0) {
      setSelectedSavedId(store.procesosFinalizados[0].id);
    }
  }, []);

  const savedProceso = selectedSavedId
    ? store.procesosFinalizados.find((p) => p.id === selectedSavedId) ?? null
    : null;
  const isViewingSaved = savedProceso !== null && savedProceso.id !== proceso.id;
  const displayProceso = isViewingSaved ? savedProceso : proceso;

  const hasActiveOperation = proceso.nombre !== "" || selectedSavedId !== null;

  function handleNewOperation() {
    setShowNewDialog(true);
  }

  function handleSelectSaved(id: string) {
    setSelectedSavedId(id);
  }

  function handleEditSaved(id: string, name: string) {
    if (window.confirm(`¿Está seguro de editar "${name}"? Esta operación podría estar en uso en transacciones activas.`)) {
      store.cargarProceso(id);
    }
  }

  const tabs = [
    { id: "operaciones-y-estados" as const, label: "Operaciones y Estados", icon: Package },
  ];

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      {/* Tab bar */}
      <div className="flex items-center gap-1 mb-4 border-b border-[var(--color-neutro-200)]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? "border-[var(--color-verde-100)] text-[var(--color-verde-100)]"
                  : "border-transparent text-[var(--color-neutro-500)] hover:text-[var(--color-neutro-700)] hover:border-[var(--color-neutro-300)]"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "operaciones-y-estados" && (
        <FusionadoTab
          store={store}
          proceso={proceso}
          selectedSavedId={selectedSavedId}
          savedProceso={savedProceso}
          isViewingSaved={isViewingSaved}
          displayProceso={displayProceso}
          hasActiveOperation={hasActiveOperation}
          dragIndex={dragIndex}
          dragOverIndex={dragOverIndex}
          setDragIndex={setDragIndex}
          setDragOverIndex={setDragOverIndex}
          onSelectSaved={handleSelectSaved}
          onEditSaved={handleEditSaved}
          onNewOperation={handleNewOperation}
        />
      )}
      <NewOperationDialog open={showNewDialog} onClose={() => setShowNewDialog(false)} onCreate={(vals) => {
        store.nuevoProceso();
        store.setNombre(vals.nombre);
        store.setTipoCarga(vals.tipoCarga);
        store.setAmbito(vals.ambito);
        store.setModoIngreso(vals.modoIngreso);
        if (vals.origenTipo) store.setOrigenTipo(vals.origenTipo);
        if (vals.destinoTipo) store.setDestinoTipo(vals.destinoTipo);
        store.finalizeProceso();
        const newId = store.procesosFinalizados[store.procesosFinalizados.length - 1].id;
        store.cargarProceso(newId);
        setSelectedSavedId(null);
        setShowNewDialog(false);
      }} />
    </div>
  );
}

/* ── Operaciones Tab ── */
function OperacionesTab({
  store, proceso, selectedSavedId, savedProceso, isViewingSaved, displayProceso,
  onSelectSaved, onEditSaved, onNewOperation,
}: {
  store: ReturnType<typeof useTransaccionesStore>;
  proceso: ReturnType<typeof useTransaccionesStore>["proceso"];
  selectedSavedId: string | null;
  savedProceso: ReturnType<typeof useTransaccionesStore>["procesosFinalizados"][0] | null;
  isViewingSaved: boolean;
  displayProceso: ReturnType<typeof useTransaccionesStore>["proceso"] | NonNullable<typeof savedProceso>;
  onSelectSaved: (id: string) => void;
  onEditSaved: (id: string, name: string) => void;
  onNewOperation: () => void;
}) {
  return (
    <div className="flex-1 flex gap-4 min-h-0">
      {/* Left: saved operations */}
      <div className="w-[260px] shrink-0 bg-white border border-[var(--color-neutro-200)] rounded-corner-m overflow-y-auto shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex flex-col min-h-0">
        <div className="p-3 border-b border-[var(--color-neutro-200)]">
          <p className="text-[12px] font-semibold text-[var(--color-neutro-600)] uppercase tracking-wide">
            Operaciones ({store.procesosFinalizados.length})
          </p>
        </div>
        <div className="p-3 border-b border-[var(--color-neutro-200)]">
          <Button className="w-full !justify-center" size="sm" iconLeft={<Plus className="w-4 h-4" />} onClick={onNewOperation}>
            Crear Nueva Operación
          </Button>
        </div>
        <div className="p-2 space-y-1 flex-1 overflow-y-auto">
          {store.procesosFinalizados.map((p) => (
            <div
              key={p.id}
              className={`flex items-center gap-2 px-3 py-2 rounded-corner-m text-left text-[13px] transition-colors cursor-pointer ${
                selectedSavedId === p.id
                  ? "bg-[var(--color-verde-100)] text-white"
                  : "text-[var(--color-neutro-700)] hover:bg-[var(--color-neutro-100)]"
              }`}
              onClick={() => onSelectSaved(p.id)}
            >
              <FolderOpen className="w-4 h-4 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{p.nombre || "Sin nombre"}</p>
                <p className={`text-[11px] truncate ${selectedSavedId === p.id ? "text-white/70" : "text-[var(--color-neutro-400)]"}`}>
                  {p.tipoCarga} · {p.steps.length} estados
                </p>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  className={`p-1 rounded transition-colors ${selectedSavedId === p.id ? "text-white hover:bg-white/20" : "text-[var(--color-neutro-400)] hover:bg-[var(--color-neutro-100)]"}`}
                  title="Editar operación"
                  onClick={(e) => { e.stopPropagation(); onEditSaved(p.id, p.nombre || "Sin nombre"); }}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  className={`p-1 rounded transition-colors ${selectedSavedId === p.id ? "text-white/70 hover:text-white hover:bg-white/20" : "text-[var(--color-neutro-400)] hover:bg-red-50 hover:text-red-500"}`}
                  title="Eliminar operación"
                  onClick={(e) => { e.stopPropagation(); if (window.confirm(`¿Eliminar "${p.nombre}"? Esta acción no se puede deshacer.`)) { store.eliminarProceso(p.id); if (selectedSavedId === p.id) setSelectedSavedId(null); } }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
          {store.procesosFinalizados.length === 0 && (
            <p className="text-[13px] text-[var(--color-neutro-400)] text-center py-6">No hay operaciones guardadas</p>
          )}
        </div>
      </div>

      {/* Right: operation form */}
      <div className="flex-1 flex flex-col gap-4 min-h-0 overflow-y-auto">
        {/* Card 1: Nombre */}
        <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m shadow-[0_1px_2px_rgba(0,0,0,0.04)] shrink-0">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[var(--color-neutro-100)]">
            <span className="w-2 h-2 rounded-full bg-[var(--color-verde-100)]" />
            <p className="text-[11px] font-bold text-[var(--color-neutro-600)] uppercase tracking-wide">Nombre de la Operación</p>
          </div>
          <div className="p-4">
            {isViewingSaved ? (
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-[16px] font-bold text-[var(--color-neutro-900)]">{displayProceso.nombre || "Sin nombre"}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="px-2 py-0.5 text-[11px] font-medium bg-[var(--color-neutro-100)] text-[var(--color-neutro-600)] rounded-corner-m">{displayProceso.tipoCarga}</span>
                    <span className={`flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-corner-m ${displayProceso.modoIngreso === "fajos" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"}`}>
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        {displayProceso.modoIngreso === "fajos"
                          ? <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          : <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        }
                      </svg>
                      {displayProceso.modoIngreso === "fajos" ? "Fajos" : "Piezas"}
                    </span>
                  </div>
                </div>
                <Button size="sm" iconLeft={<Pencil className="w-4 h-4" />} onClick={() => onEditSaved(displayProceso.id, displayProceso.nombre || "Sin nombre")}>
                  Editar
                </Button>
              </div>
            ) : (
              <>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input value={proceso.nombre} onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.setNombre(e.target.value)} placeholder="Ej: Pase de Caja a ATM..." />
                </div>
                <div className="w-[200px]">
                  <Select options={TIPOS_CARGA} value={proceso.tipoCarga} onChange={(v: string) => store.setTipoCarga(v)} />
                </div>
              </div>
              <div className="flex items-center gap-4 pt-2">
                <p className="text-[11px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide">Modo de ingreso</p>
                <div className="flex bg-[var(--color-neutro-100)] rounded-corner-m p-0.5">
                  <button
                    className={`flex items-center gap-1.5 px-4 py-1.5 text-[12px] font-medium rounded-corner-m transition-all cursor-pointer ${proceso.modoIngreso === "fajos" ? "bg-white text-[var(--color-neutro-900)] shadow-sm ring-1 ring-[var(--color-neutro-200)]" : "text-[var(--color-neutro-500)] hover:text-[var(--color-neutro-700)]"}`}
                    onClick={() => store.setModoIngreso("fajos")}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                    Fajos
                  </button>
                  <button
                    className={`flex items-center gap-1.5 px-4 py-1.5 text-[12px] font-medium rounded-corner-m transition-all cursor-pointer ${proceso.modoIngreso === "piezas" ? "bg-white text-[var(--color-neutro-900)] shadow-sm ring-1 ring-[var(--color-neutro-200)]" : "text-[var(--color-neutro-500)] hover:text-[var(--color-neutro-700)]"}`}
                    onClick={() => store.setModoIngreso("piezas")}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Piezas
                  </button>
                </div>
              </div>
              </>
            )}
          </div>
        </div>

        {/* Card 2: Origen - Destino */}
        <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m shadow-[0_1px_2px_rgba(0,0,0,0.04)] shrink-0">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[var(--color-neutro-100)]">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <p className="text-[11px] font-bold text-[var(--color-neutro-600)] uppercase tracking-wide">Origen - Destino</p>
          </div>
          <div className="p-4">
            {isViewingSaved ? (
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-[11px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide mb-0.5">Origen</p>
                    <p className="text-[14px] font-medium text-[var(--color-neutro-900)]">{displayProceso.origenTipo ?? "—"}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[var(--color-neutro-300)] mt-5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-[11px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide mb-0.5">Destino</p>
                    <p className="text-[14px] font-medium text-[var(--color-neutro-900)]">{displayProceso.destinoTipo ?? "—"}</p>
                  </div>
                </div>
                {displayProceso.ambito && (
                  <p className="text-[12px] text-blue-600 font-medium">
                    {AMBITOS.find((a) => a.value === displayProceso.ambito)?.label ?? displayProceso.ambito}
                  </p>
                )}
                {displayProceso.usaTransportista && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[12px] text-[var(--color-neutro-500)]">Transportista:</span>
                    {displayProceso.transportistasPermitidos.map((tId) => {
                      const t = useProveedoresStore.getState().proveedores.find((p) => p.id === tId && p.tipo === "Transportista de Valores");
                      return t ? <span key={t.id} className="px-2.5 py-0.5 rounded-corner-m text-[12px] bg-blue-500 text-white font-medium">{t.nombre}</span> : null;
                    })}
                  </div>
                )}
                {(displayProceso.divisasPermitidas ?? []).length > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[12px] text-[var(--color-neutro-500)]">Divisas:</span>
                    {(displayProceso.divisasPermitidas ?? []).map((dId) => {
                      const d = useDivisasStore.getState().divisas.find((dv) => dv.id === dId);
                      return d ? <span key={d.id} className="px-2.5 py-0.5 rounded-corner-m text-[12px] bg-emerald-600 text-white font-medium">{d.simbolo} {d.codigoISO}</span> : null;
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-[11px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide mb-0.5">Tipo de origen</p>
                    <Select options={TIPOS_UNIDAD} value={proceso.origenTipo ?? ""} onChange={(v: string) => store.setOrigenTipo(v || null)} placeholder="Seleccionar tipo..." />
                  </div>
                  <ArrowRight className="w-5 h-5 text-[var(--color-neutro-300)] mt-6 shrink-0" />
                  <div className="flex-1">
                    <p className="text-[11px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide mb-0.5">Tipo de destino</p>
                    <Select options={TIPOS_UNIDAD} value={proceso.destinoTipo ?? ""} onChange={(v: string) => store.setDestinoTipo(v || null)} placeholder="Seleccionar tipo..." />
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide mb-0.5">Ámbito</p>
                  <Select options={AMBITOS} value={proceso.ambito} onChange={(v: string) => store.setAmbito(v as "interna" | "entre-agencias" | "externa")} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide mb-0.5">Divisas permitidas</p>
                  <DivisaSelector ids={proceso.divisasPermitidas ?? []} onChange={(ids) => store.setDivisasPermitidas(ids)} />
                </div>
                <hr className="border-[var(--color-neutro-100)]" />
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Switch checked={proceso.usaTransportista} onChange={proceso.ambito === "interna" ? undefined : store.setUsaTransportista} />
                    <span className={`text-[13px] ${proceso.ambito === "interna" ? "text-[var(--color-neutro-400)]" : "text-[var(--color-neutro-700)]"}`}>Usa transportista de valores</span>
                  </label>
                  {proceso.ambito === "interna" && <p className="text-[11px] text-[var(--color-neutro-400)] ml-7">No aplica para operaciones internas</p>}
                </div>
                {proceso.usaTransportista && (
                  <div className="flex flex-wrap gap-2">
                    {useProveedoresStore.getState().proveedores.filter((p) => p.tipo === "Transportista de Valores").map((t) => {
                      const selected = proceso.transportistasPermitidos.includes(t.id);
                      return (
                        <button key={t.id} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-corner-m text-[12px] font-medium border transition-colors cursor-pointer ${selected ? "bg-blue-500 text-white border-blue-500" : "bg-white text-[var(--color-neutro-600)] border-[var(--color-neutro-200)] hover:border-blue-300"}`} onClick={() => store.toggleTransportistaPermitido(t.id)}>
                          {selected && <CheckCheck className="w-3 h-3" />}
                          {t.nombre}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Save button */}
        {!isViewingSaved && (
          <div className="shrink-0">
            <Button className="w-full !justify-center !bg-[var(--color-verde-100)] !text-white" size="sm" iconLeft={<Save className="w-4 h-4" />} onClick={store.finalizeProceso}>
              Guardar Operación
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Estados Tab ── */
function EstadosTab({
  store, isViewingSaved, displayProceso, hasActiveOperation, dragIndex, dragOverIndex,
  setDragIndex, setDragOverIndex, onSwitchTab,
}: {
  store: ReturnType<typeof useTransaccionesStore>;
  isViewingSaved: boolean;
  displayProceso: ReturnType<typeof useTransaccionesStore>["proceso"] | NonNullable<ReturnType<typeof useTransaccionesStore>["procesosFinalizados"][0]>;
  hasActiveOperation: boolean;
  dragIndex: number | null;
  dragOverIndex: number | null;
  setDragIndex: (v: number | null) => void;
  setDragOverIndex: (v: number | null) => void;
  onSwitchTab: () => void;
}) {
  const { proceso } = store;
  const activeStepId = store.activeStepId;
  const activeExceptionId = store.activeExceptionId;

  const displaySteps = isViewingSaved ? displayProceso.steps : proceso.steps;
  const activeStep = displaySteps.find((s) => s.id === activeStepId) ?? null;
  const activeException = activeExceptionId
    ? displaySteps.find((s) => s.id === activeExceptionId.stepId)
        ?.excepciones.find((e) => e.id === activeExceptionId.exId) ?? null
    : null;

  if (!hasActiveOperation) {
    return (
      <>
        {/* Operation header */}
        <div className="flex items-center gap-3 p-3 mb-3 bg-white border border-[var(--color-neutro-200)] rounded-corner-m shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <Package className="w-5 h-5 text-[var(--color-verde-100)] shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-[var(--color-neutro-900)] truncate">Sin operación seleccionada</p>
            <div className="flex items-center gap-2 text-[11px] text-[var(--color-neutro-500)]">
              <span>Seleccione una operación para ver sus estados</span>
            </div>
          </div>
          <div className="w-[240px]">
            <Select
              options={[
                { value: "", label: "Seleccionar operación..." },
                ...store.procesosFinalizados.map((p) => ({ value: p.id, label: p.nombre })),
              ]}
              value=""
              onChange={(v: string) => { if (v) store.cargarProceso(v); }}
            />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Layers className="w-12 h-12 text-[var(--color-neutro-300)] mx-auto mb-3" />
            <h3 className="text-[16px] font-bold text-[var(--color-neutro-900)] mb-2">No hay operación seleccionada</h3>
            <p className="text-[13px] text-[var(--color-neutro-500)] mb-4">
              Seleccione una operación en el selector superior o vaya a la pestaña Operaciones
            </p>
            <Button onClick={onSwitchTab}>
              Ir a Operaciones
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Operation header */}
      <div className="flex items-center gap-3 p-3 mb-3 bg-white border border-[var(--color-neutro-200)] rounded-corner-m shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <Package className="w-5 h-5 text-[var(--color-verde-100)] shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-[var(--color-neutro-900)] truncate">{displayProceso.nombre || "Sin nombre"}</p>
          <div className="flex items-center gap-2 text-[11px] text-[var(--color-neutro-500)]">
            <span>{displayProceso.tipoCarga}</span>
            {displayProceso.origenTipo && (
              <><span>·</span><span>{displayProceso.origenTipo} <ArrowRight className="w-3 h-3 inline" /> {displayProceso.destinoTipo ?? "?"}</span></>
            )}
            <span>·</span>
            <span>{displaySteps.length} estados</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-[200px]">
            <Select
              options={[
                { value: "", label: "Seleccionar operación..." },
                ...store.procesosFinalizados.map((p) => ({ value: p.id, label: p.nombre })),
              ]}
              value={isViewingSaved ? displayProceso.id : proceso.id}
              onChange={(v: string) => { if (v) store.cargarProceso(v); }}
            />
          </div>
          {isViewingSaved && (
            <Button size="sm" iconLeft={<Pencil className="w-4 h-4" />} onClick={() => {
              if (window.confirm(`¿Está seguro de editar "${displayProceso.nombre}"? Esta operación podría estar en uso en transacciones activas.`)) {
                store.cargarProceso(displayProceso.id);
              }
            }}>
              Editar
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Left: step list */}
      <div className="w-[320px] shrink-0 bg-white border border-[var(--color-neutro-200)] rounded-corner-m shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex flex-col min-h-0">
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-[var(--color-neutro-100)]">
          <p className="text-[11px] font-bold text-[var(--color-neutro-600)] uppercase tracking-wide">
            Estados ({displaySteps.length})
          </p>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-[var(--color-neutro-400)]">Inicial</span>
            <span className="w-3 h-3 rounded-full bg-green-400" />
            <span className="mx-1 text-[var(--color-neutro-300)]">···</span>
            <span className="w-3 h-3 rounded-full bg-red-400" />
            <span className="text-[10px] text-[var(--color-neutro-400)]">Terminal</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {displaySteps.map((step, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === displaySteps.length - 1;
            return (
              <EstadoCard
                key={step.id}
                step={step}
                index={idx}
                isActive={activeStepId === step.id}
                isFirst={isFirst}
                isLast={isLast}
                readOnly={isViewingSaved}
                isDragging={dragIndex === idx}
                showDropBefore={dragIndex !== null && dragIndex !== idx && dragOverIndex === idx}
                onSelect={() => store.setActiveStep(step.id)}
                onRemove={isViewingSaved ? undefined : () => store.removeStep(step.id)}
                onAddExcepcion={isViewingSaved ? undefined : () => store.addExcepcion(step.id)}
                onRemoveExcepcion={isViewingSaved ? undefined : (exId) => store.removeExcepcion(step.id, exId)}
                onToggleExcepcionTerminal={isViewingSaved ? undefined : (exId, v) => store.setExcepcionTerminal(step.id, exId, v)}
                onSelectExcepcion={(exId) => store.setActiveException(step.id, exId)}
                activeExceptionId={activeExceptionId ? `${activeExceptionId.stepId}:${activeExceptionId.exId}` : null}
                total={displaySteps.length}
                onDragStart={isViewingSaved ? undefined : () => { setDragIndex(idx); setDragOverIndex(idx); }}
                onDragEnter={isViewingSaved ? undefined : () => { if (dragIndex !== null && dragIndex !== idx) setDragOverIndex(idx); }}
                onDragEnd={isViewingSaved ? undefined : () => { setDragIndex(null); setDragOverIndex(null); }}
                onDrop={isViewingSaved ? undefined : () => { if (dragIndex !== null && dragIndex !== idx) { store.moveStep(dragIndex, idx); } setDragIndex(null); setDragOverIndex(null); }}
              />
            );
          })}
        </div>
        {!isViewingSaved && (
          <div className="p-2 border-t border-[var(--color-neutro-100)]">
            <Button className="w-full !justify-center" size="sm" iconLeft={<Plus className="w-3.5 h-3.5" />} onClick={() => store.addStep()}>
              Agregar Estado
            </Button>
          </div>
        )}
      </div>

      {/* Right: property inspector */}
      <div className="flex-1 bg-white border border-[var(--color-neutro-200)] rounded-corner-m shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-y-auto">
        <div className="p-3 border-b border-[var(--color-neutro-200)]">
          <p className="text-[12px] font-semibold text-[var(--color-neutro-600)] uppercase tracking-wide">
            Inspector de Propiedades
          </p>
        </div>
        {activeException ? (
          <ExceptionPropertyInspector exception={activeException} stepId={activeExceptionId!.stepId} steps={displaySteps} readOnly={isViewingSaved} />
        ) : activeStep ? (
          <PropertyInspector step={activeStep} origenTipo={displayProceso.origenTipo} destinoTipo={displayProceso.destinoTipo} readOnly={isViewingSaved} usaTransportista={displayProceso.usaTransportista} />
        ) : (
          <div className="flex flex-col items-center justify-center h-[200px] text-center p-4">
            <p className="text-[13px] text-[var(--color-neutro-400)]">
              Seleccione un estado o excepción para ver sus propiedades
            </p>
          </div>
        )}
      </div>
    </div>
    </>
  );
}

/* ── Fusionado Tab ── */
function FusionadoTab({
  store, proceso, selectedSavedId, savedProceso, isViewingSaved, displayProceso,
  hasActiveOperation, dragIndex, dragOverIndex, setDragIndex, setDragOverIndex,
  onSelectSaved, onEditSaved, onNewOperation,
}: {
  store: ReturnType<typeof useTransaccionesStore>;
  proceso: ReturnType<typeof useTransaccionesStore>["proceso"];
  selectedSavedId: string | null;
  savedProceso: ReturnType<typeof useTransaccionesStore>["procesosFinalizados"][0] | null;
  isViewingSaved: boolean;
  displayProceso: ReturnType<typeof useTransaccionesStore>["proceso"] | NonNullable<typeof savedProceso>;
  hasActiveOperation: boolean;
  dragIndex: number | null;
  dragOverIndex: number | null;
  setDragIndex: (v: number | null) => void;
  setDragOverIndex: (v: number | null) => void;
  onSelectSaved: (id: string) => void;
  onEditSaved: (id: string, name: string) => void;
  onNewOperation: () => void;
}) {
  const activeStepId = store.activeStepId;
  const activeExceptionId = store.activeExceptionId;

  const displaySteps = isViewingSaved ? displayProceso.steps : proceso.steps;
  const activeStep = displaySteps.find((s) => s.id === activeStepId) ?? null;
  const activeException = activeExceptionId
    ? displaySteps.find((s) => s.id === activeExceptionId.stepId)
        ?.excepciones.find((e) => e.id === activeExceptionId.exId) ?? null
    : null;

  const [collapseDetalles, setCollapseDetalles] = useState(false);

  if (!hasActiveOperation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Layers className="w-12 h-12 text-[var(--color-neutro-300)] mx-auto mb-3" />
          <h3 className="text-[16px] font-bold text-[var(--color-neutro-900)] mb-2">No hay operación seleccionada</h3>
          <p className="text-[13px] text-[var(--color-neutro-500)] mb-4">Seleccione una operación de la lista o cree una nueva</p>
          <Button onClick={onNewOperation}>Crear Nueva Operación</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex gap-4 min-h-0">
      {/* Left: saved operations */}
      <div className="w-[260px] shrink-0 bg-white border border-[var(--color-neutro-200)] rounded-corner-m overflow-y-auto shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex flex-col min-h-0">
        <div className="p-3 border-b border-[var(--color-neutro-200)]">
          <p className="text-[12px] font-semibold text-[var(--color-neutro-600)] uppercase tracking-wide">
            Operaciones ({store.procesosFinalizados.length})
          </p>
        </div>
        <div className="p-3 border-b border-[var(--color-neutro-200)]">
          <Button className="w-full !justify-center" size="sm" iconLeft={<Plus className="w-4 h-4" />} onClick={onNewOperation}>
            Crear Nueva Operación
          </Button>
        </div>
        <div className="p-2 space-y-1 flex-1 overflow-y-auto">
          {store.procesosFinalizados.map((p) => (
            <div
              key={p.id}
              className={`flex items-center gap-2 px-3 py-2 rounded-corner-m text-left text-[13px] transition-colors cursor-pointer ${
                selectedSavedId === p.id
                  ? "bg-[var(--color-verde-100)] text-white"
                  : "text-[var(--color-neutro-700)] hover:bg-[var(--color-neutro-100)]"
              } ${p.activo === false ? "opacity-50" : ""}`}
              onClick={() => onSelectSaved(p.id)}
            >
              <FolderOpen className="w-4 h-4 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{p.nombre || "Sin nombre"}</p>
                <p className={`text-[11px] truncate ${selectedSavedId === p.id ? "text-white/70" : "text-[var(--color-neutro-400)]"}`}>
                  {p.tipoCarga} · {p.steps.length} estados{p.activo === false ? " · Inactivo" : ""}
                </p>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  className={`p-1 rounded transition-colors ${selectedSavedId === p.id ? "text-white hover:bg-white/20" : "text-[var(--color-neutro-400)] hover:bg-[var(--color-neutro-100)]"}`}
                  title="Editar operación"
                  onClick={(e) => { e.stopPropagation(); onEditSaved(p.id, p.nombre || "Sin nombre"); }}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  className={`p-1 rounded transition-colors ${selectedSavedId === p.id ? "text-white hover:bg-white/20" : "text-[var(--color-neutro-400)] hover:bg-[var(--color-neutro-100)]"}`}
                  title="Duplicar operación"
                  onClick={(e) => { e.stopPropagation(); store.duplicarProceso(p.id); }}
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  className={`p-1 rounded transition-colors ${selectedSavedId === p.id ? "text-white/70 hover:text-white hover:bg-white/20" : "text-[var(--color-neutro-400)] hover:bg-red-50 hover:text-red-500"}`}
                  title="Eliminar operación"
                  onClick={(e) => { e.stopPropagation(); if (window.confirm(`¿Eliminar "${p.nombre}"? Esta acción no se puede deshacer.`)) { store.eliminarProceso(p.id); if (selectedSavedId === p.id) onSelectSaved(p.id); } }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
          {store.procesosFinalizados.length === 0 && (
            <p className="text-[13px] text-[var(--color-neutro-400)] text-center py-6">No hay operaciones guardadas</p>
          )}
        </div>
      </div>

      {/* Center: form fields + inspector */}
      <div className="flex-1 flex flex-col gap-4 min-h-0 overflow-y-auto">
        {/* Detalles de la Operación — unificado */}
        <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m shadow-[0_1px_2px_rgba(0,0,0,0.04)] shrink-0">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[var(--color-neutro-100)] cursor-pointer select-none" onClick={() => setCollapseDetalles(!collapseDetalles)}>
            <Package className="w-4 h-4 text-[var(--color-verde-100)]" />
            <p className="flex-1 text-[11px] font-bold text-[var(--color-neutro-600)] uppercase tracking-wide">Detalles de la Operación</p>
            <ChevronDown className={`w-4 h-4 text-[var(--color-neutro-400)] transition-transform ${collapseDetalles ? "-rotate-90" : ""}`} />
          </div>
          {!collapseDetalles && (
          <div className="p-4 space-y-4">
            {isViewingSaved ? (
              /* ── VIEW MODE ── */
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <p className="text-[11px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide mb-0.5">Nombre</p>
                    <p className="text-[16px] font-bold text-[var(--color-neutro-900)]">{displayProceso.nombre || "Sin nombre"}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {displayProceso.activo !== false ? (
                        <span className="px-2 py-0.5 text-[11px] font-medium bg-green-50 text-green-700 rounded-corner-m">Activo</span>
                      ) : (
                        <span className="px-2 py-0.5 text-[11px] font-medium bg-red-50 text-red-700 rounded-corner-m">Inactivo</span>
                      )}
                    </div>
                  </div>
                  <Button size="sm" iconLeft={<Pencil className="w-4 h-4" />} onClick={() => onEditSaved(displayProceso.id, displayProceso.nombre || "Sin nombre")}>
                    Editar
                  </Button>
                </div>

                <hr className="border-[var(--color-neutro-100)]" />

                <div>
                  <p className="text-[11px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide mb-0.5">Mercancía a Transportar</p>
                  <span className="px-2 py-0.5 text-[12px] font-medium bg-[var(--color-neutro-100)] text-[var(--color-neutro-600)] rounded-corner-m">{displayProceso.tipoCarga}</span>
                  {(displayProceso.tipoCarga === "remesas" || displayProceso.tipoCarga === "valores") && (
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[11px] font-medium rounded-corner-m ${displayProceso.modoIngreso === "fajos" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"}`}>
                        {displayProceso.modoIngreso === "fajos" ? "Fajos" : "Piezas"}
                      </span>
                    </div>
                  )}
                </div>

                <hr className="border-[var(--color-neutro-100)]" />

                <p className="text-[12px] text-blue-600 font-medium">{AMBITOS.find((a) => a.value === displayProceso.ambito)?.label ?? displayProceso.ambito}</p>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-[11px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide mb-0.5">Origen</p>
                    <p className="text-[14px] font-medium text-[var(--color-neutro-900)]">{displayProceso.origenTipo ?? "—"}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[var(--color-neutro-300)] mt-5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-[11px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide mb-0.5">Destino</p>
                    <p className="text-[14px] font-medium text-[var(--color-neutro-900)]">{displayProceso.destinoTipo ?? "—"}</p>
                  </div>
                </div>

                {displayProceso.usaTransportista && (
                  <div>
                    <p className="text-[11px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide mb-1">Transportistas permitidos</p>
                    <div className="flex flex-wrap gap-1.5">
                      {displayProceso.transportistasPermitidos.map((tId) => {
                        const t = useProveedoresStore.getState().proveedores.find((p) => p.id === tId && p.tipo === "Transportista de Valores");
                        return t ? (
                          <span key={tId} className="px-2 py-0.5 text-[12px] font-medium bg-blue-50 text-blue-700 rounded-corner-m">{t.nombre}</span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                <hr className="border-[var(--color-neutro-100)]" />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide">Aplica código de remesa</p>
                    <p className="text-[14px] font-medium text-[var(--color-neutro-900)]">{displayProceso.usaCodigoRemesa ? "Sí" : "No"}</p>
                  </div>
                  {displayProceso.usaCodigoRemesa && (
                    <p className="text-[13px] font-medium text-[var(--color-neutro-900)] font-mono">{displayProceso.codigoRemesaFormato ?? "—"}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide">Aplica código de envío</p>
                    <p className="text-[14px] font-medium text-[var(--color-neutro-900)]">{displayProceso.usaCodigoEnvio ? "Sí" : "No"}</p>
                  </div>
                  {displayProceso.usaCodigoEnvio && (
                    <p className="text-[13px] font-medium text-[var(--color-neutro-900)] font-mono">{displayProceso.codigoEnvioFormato ?? "—"}</p>
                  )}
                </div>
              </div>
            ) : (
              /* ── EDIT MODE ── */
              <div className="space-y-4">
                {/* 1. Nombre + Activo */}
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-[11px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide mb-1">Nombre de la operación</p>
                      <Input value={proceso.nombre} onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.setNombre(e.target.value)} placeholder="Ej: Pase de Caja a ATM..." />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer pt-5 shrink-0">
                      <Switch checked={proceso.activo !== false} onChange={(v: boolean) => store.setActivo(v)} />
                      <span className={`text-[12px] font-medium ${proceso.activo !== false ? "text-green-700" : "text-red-700"}`}>{proceso.activo !== false ? "Activo" : "Inactivo"}</span>
                    </label>
                  </div>
                </div>

                <hr className="border-[var(--color-neutro-100)]" />

                {/* 2. Mercancía a Transportar */}
                <div>
                  <p className="text-[11px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide mb-2">Mercancía a Transportar</p>
                  <Select options={TIPOS_CARGA} value={proceso.tipoCarga} onChange={(v: string) => store.setTipoCarga(v)} />
                  {proceso.tipoCarga === "remesas" && (
                    <div className="mt-3 space-y-3">
                      <div>
                        <p className="text-[10px] font-semibold text-[var(--color-neutro-400)] uppercase mb-1">Divisas permitidas</p>
                        <DivisaSelector ids={proceso.divisasPermitidas} onChange={(ids: string[]) => store.setDivisasPermitidas(ids)} />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-[var(--color-neutro-400)] uppercase mb-1">Modo de ingreso</p>
                        <div className="flex bg-[var(--color-neutro-100)] rounded-corner-m p-0.5 w-fit">
                          <button
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-corner-m transition-all cursor-pointer ${proceso.modoIngreso === "fajos" ? "bg-white text-[var(--color-neutro-900)] shadow-sm ring-1 ring-[var(--color-neutro-200)]" : "text-[var(--color-neutro-500)] hover:text-[var(--color-neutro-700)]"}`}
                            onClick={() => store.setModoIngreso("fajos")}
                          >Fajos</button>
                          <button
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-corner-m transition-all cursor-pointer ${proceso.modoIngreso === "piezas" ? "bg-white text-[var(--color-neutro-900)] shadow-sm ring-1 ring-[var(--color-neutro-200)]" : "text-[var(--color-neutro-500)] hover:text-[var(--color-neutro-700)]"}`}
                            onClick={() => store.setModoIngreso("piezas")}
                          >Piezas</button>
                        </div>
                      </div>
                    </div>
                  )}
                  {proceso.tipoCarga === "valores" && (
                    <div className="mt-3">
                      <p className="text-[10px] font-semibold text-[var(--color-neutro-400)] uppercase mb-1">Divisas permitidas (para valoración)</p>
                      <DivisaSelector ids={proceso.divisasPermitidas} onChange={(ids: string[]) => store.setDivisasPermitidas(ids)} />
                    </div>
                  )}
                </div>

                <hr className="border-[var(--color-neutro-100)]" />

                {/* 3. Ámbito */}
                <div>
                  <p className="text-[11px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide mb-2">Ámbito</p>
                  <Select options={AMBITOS} value={proceso.ambito} onChange={(v: string) => {
                    store.setAmbito(v as "interna" | "entre-agencias" | "externa");
                    if (v === "interna") store.setUsaTransportista(false);
                  }} />
                </div>

                {/* 4. Origen - Destino (filtered by ámbito) */}
                <div>
                  <p className="text-[11px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide mb-2">Origen y Destino</p>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex-1">
                      <Select options={[{ value: "", label: "Seleccionar..." }, ...(UNIDADES_POR_AMBITO[proceso.ambito] ?? TIPOS_UNIDAD)]}
                        value={proceso.origenTipo ?? ""} onChange={(v: string) => store.setOrigenTipo(v || null)} placeholder="Tipo de origen..." />
                    </div>
                    <ArrowRight className="w-5 h-5 text-[var(--color-neutro-300)] shrink-0" />
                    <div className="flex-1">
                      <Select options={[{ value: "", label: "Seleccionar..." }, ...(UNIDADES_POR_AMBITO[proceso.ambito] ?? TIPOS_UNIDAD)]}
                        value={proceso.destinoTipo ?? ""} onChange={(v: string) => store.setDestinoTipo(v || null)} placeholder="Tipo de destino..." />
                    </div>
                  </div>
                </div>

                {/* 5. Transportista */}
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Switch checked={proceso.usaTransportista} onChange={proceso.ambito === "interna" ? undefined : store.setUsaTransportista} />
                    <span className={`text-[13px] ${proceso.ambito === "interna" ? "text-[var(--color-neutro-400)]" : "text-[var(--color-neutro-700)]"}`}>Usa transportista de valores</span>
                  </label>
                  {proceso.usaTransportista && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {useProveedoresStore.getState().proveedores.filter((p) => p.tipo === "Transportista de Valores").map((t) => {
                        const selected = proceso.transportistasPermitidos.includes(t.id);
                        return (
                          <button key={t.id} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-corner-m text-[12px] font-medium border transition-colors cursor-pointer ${selected ? "bg-blue-500 text-white border-blue-500" : "bg-white text-[var(--color-neutro-600)] border-[var(--color-neutro-200)] hover:border-blue-300"}`} onClick={() => store.toggleTransportistaPermitido(t.id)}>
                            <CheckCheck className={`w-3 h-3 ${selected ? "block" : "hidden"}`} />
                            {t.nombre}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <hr className="border-[var(--color-neutro-100)]" />

                {/* 6. Códigos de transacción */}
                <div>
                  <p className="text-[11px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide mb-2">Códigos de Transacción</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 shrink-0">
                      <Checkbox label="Código de remesa" checked={proceso.usaCodigoRemesa} onChange={(v: boolean) => store.setUsaCodigoRemesa(v)} />
                    </div>
                    {proceso.usaCodigoRemesa && (
                      <Input value={proceso.codigoRemesaFormato} onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.setCodigoRemesaFormato(e.target.value)} placeholder="Ej: REM-{YYYYMMDD}-{NNNNNN}" className="flex-1" />
                    )}
                    <div className="flex items-center gap-2 shrink-0">
                      <Checkbox label="Código de envío" checked={proceso.usaCodigoEnvio} onChange={(v: boolean) => store.setUsaCodigoEnvio(v)} />
                    </div>
                    {proceso.usaCodigoEnvio && (
                      <Input value={proceso.codigoEnvioFormato} onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.setCodigoEnvioFormato(e.target.value)} placeholder="Ej: ENV-{YYYYMMDD}-{NNNNNN}" className="flex-1" />
                    )}
                  </div>
                  <p className="text-[10px] text-[var(--color-neutro-400)] italic mt-2">
                    <span className="font-mono">{`{YYYY}`}</span> año, <span className="font-mono">{`{MM}`}</span> mes, <span className="font-mono">{`{DD}`}</span> día, <span className="font-mono">{`{N}`}</span> número secuencial
                  </p>
                </div>
              </div>
            )}
          </div>
          )}
        </div>

        {/* Property inspector */}
        <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-y-auto min-h-[200px]">
          <div className="p-3 border-b border-[var(--color-neutro-200)]">
            <p className="text-[12px] font-semibold text-[var(--color-neutro-600)] uppercase tracking-wide">Inspector de Propiedades</p>
          </div>
          {activeException ? (
            <ExceptionPropertyInspector exception={activeException} stepId={activeExceptionId!.stepId} steps={displaySteps} readOnly={isViewingSaved} />
          ) : activeStep ? (
            <PropertyInspector step={activeStep} origenTipo={displayProceso.origenTipo} destinoTipo={displayProceso.destinoTipo} readOnly={isViewingSaved} usaTransportista={displayProceso.usaTransportista} />
          ) : (
            <div className="flex flex-col items-center justify-center h-[200px] text-center p-4">
              <p className="text-[13px] text-[var(--color-neutro-400)]">Seleccione un estado para editar sus propiedades</p>
            </div>
          )}
        </div>

        {/* Save button */}
        {!isViewingSaved && (
          <div className="shrink-0">
            <Button className="w-full !justify-center !bg-[var(--color-verde-100)] !text-white" size="sm" iconLeft={<Save className="w-4 h-4" />} onClick={store.finalizeProceso}>
              Guardar Operación
            </Button>
          </div>
        )}
      </div>

      {/* Right: steps list */}
      <div className="w-[320px] shrink-0 bg-white border border-[var(--color-neutro-200)] rounded-corner-m shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex flex-col min-h-0">
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-[var(--color-neutro-100)]">
          <p className="text-[11px] font-bold text-[var(--color-neutro-600)] uppercase tracking-wide">Estados ({displaySteps.length})</p>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-[var(--color-neutro-400)]">Inicial</span>
            <span className="w-3 h-3 rounded-full bg-green-400" />
            <span className="mx-1 text-[var(--color-neutro-300)]">···</span>
            <span className="w-3 h-3 rounded-full bg-red-400" />
            <span className="text-[10px] text-[var(--color-neutro-400)]">Terminal</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {displaySteps.map((step, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === displaySteps.length - 1;
            return (
              <EstadoCard
                key={step.id}
                step={step}
                index={idx}
                isActive={activeStepId === step.id}
                isFirst={isFirst}
                isLast={isLast}
                readOnly={isViewingSaved}
                isDragging={dragIndex === idx}
                showDropBefore={dragIndex !== null && dragIndex !== idx && dragOverIndex === idx}
                onSelect={() => store.setActiveStep(step.id)}
                onRemove={isViewingSaved ? undefined : () => store.removeStep(step.id)}
                onAddExcepcion={isViewingSaved ? undefined : () => store.addExcepcion(step.id)}
                onRemoveExcepcion={isViewingSaved ? undefined : (exId) => store.removeExcepcion(step.id, exId)}
                onToggleExcepcionTerminal={isViewingSaved ? undefined : (exId, v) => store.setExcepcionTerminal(step.id, exId, v)}
                onSelectExcepcion={(exId) => store.setActiveException(step.id, exId)}
                activeExceptionId={activeExceptionId ? `${activeExceptionId.stepId}:${activeExceptionId.exId}` : null}
                total={displaySteps.length}
                onDragStart={isViewingSaved ? undefined : () => { setDragIndex(idx); setDragOverIndex(idx); }}
                onDragEnter={isViewingSaved ? undefined : () => { if (dragIndex !== null && dragIndex !== idx) setDragOverIndex(idx); }}
                onDragEnd={isViewingSaved ? undefined : () => { setDragIndex(null); setDragOverIndex(null); }}
                onDrop={isViewingSaved ? undefined : () => { if (dragIndex !== null && dragIndex !== idx) { store.moveStep(dragIndex, idx); } setDragIndex(null); setDragOverIndex(null); }}
              />
            );
          })}
        </div>
        {!isViewingSaved && (
          <div className="p-2 border-t border-[var(--color-neutro-100)]">
            <Button className="w-full !justify-center" size="sm" iconLeft={<Plus className="w-3.5 h-3.5" />} onClick={() => store.addStep()}>
              Agregar Estado
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Estado Card (simplified StepCard) ── */
function EstadoCard({
  step, index, isActive, isFirst, isLast, isDragging, showDropBefore,
  readOnly = false,
  onSelect, onRemove, onAddExcepcion,
  onRemoveExcepcion, onToggleExcepcionTerminal,
  onSelectExcepcion, activeExceptionId, total,
  onDragStart, onDragEnter, onDragEnd, onDrop,
}: {
  step: TransaccionStep;
  index: number;
  isActive: boolean;
  isFirst: boolean;
  isLast: boolean;
  isDragging: boolean;
  showDropBefore: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onAddExcepcion: () => void;
  onRemoveExcepcion: (id: string) => void;
  onToggleExcepcionTerminal: (id: string, v: boolean) => void;
  onSelectExcepcion: (id: string) => void;
  activeExceptionId: string | null;
  total: number;
  onDragStart: () => void;
  onDragEnter: () => void;
  onDragEnd: () => void;
  onDrop: () => void;
}) {
  const responsable = step.unidadResponsableId
    ? PERFILES_RESPONSABLE.find((e) => e.value === step.unidadResponsableId)
    : null;

  return (
    <>
      {showDropBefore && <div className="h-1 bg-[var(--color-verde-100)] rounded-full mx-2 transition-all" />}
      <div
        draggable={!readOnly}
        className={`border rounded-corner-m transition-all ${
          isDragging ? "opacity-40 border-dashed border-[var(--color-verde-100)]" : ""
        } ${
          isActive && !isDragging
            ? "border-[var(--color-verde-100)] ring-1 ring-[var(--color-verde-100)]"
            : "border-[var(--color-neutro-200)]"
        }`}
        onClick={onSelect}
        onDragStart={(e: React.DragEvent) => { e.dataTransfer.effectAllowed = "move"; onDragStart(); }}
        onDragOver={(e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
        onDragEnter={onDragEnter}
        onDragEnd={onDragEnd}
        onDrop={onDrop}
      >
        <div className="p-3">
          <div className="flex items-center gap-3">
            {!readOnly && (
              <span className="cursor-grab active:cursor-grabbing text-[var(--color-neutro-300)] hover:text-[var(--color-neutro-500)] transition-colors shrink-0" onMouseDown={(e) => e.stopPropagation()}>
                <GripVertical className="w-4 h-4" />
              </span>
            )}
            <span className={`w-7 h-7 flex items-center justify-center rounded-full text-[12px] font-bold shrink-0 ${
              isFirst ? "bg-green-100 text-green-700" :
              isLast ? "bg-red-100 text-red-700" :
              isActive ? "bg-[var(--color-verde-100)] text-white" :
              "bg-[var(--color-neutro-100)] text-[var(--color-neutro-500)]"
            }`}>
              {index + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-[var(--color-neutro-900)]">{step.nombre}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
              {step.eventoContable !== "ninguno" && (
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-corner-m ${step.eventoContable === "descuenta" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                  {step.eventoContable === "descuenta" ? "-" : "+"}{step.unidadEvento === "emisora" ? " Emi" : step.unidadEvento === "receptora" ? " Rec" : ""}
                </span>
              )}
              {step.timeoutMinutos > 0 && (
                <span className="flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-corner-m bg-amber-100 text-amber-700">
                  <Clock className="w-3 h-3" />{step.timeoutMinutos}m
                </span>
              )}
              {step.camposSeleccionados.length > 0 && (
                <span className="flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-corner-m bg-purple-100 text-purple-700">
                  <span>📋</span> {step.camposSeleccionados.length}
                </span>
              )}
              {!readOnly && (
                <button className="p-1 rounded-corner-m hover:bg-[var(--color-neutro-100)] text-[var(--color-neutro-400)] hover:text-amber-500 transition-colors cursor-pointer" title="Agregar ruta alterna" onClick={onAddExcepcion}>
                  <AlertTriangle className="w-3.5 h-3.5" />
                </button>
              )}
              {!readOnly && total > 2 && (
                <button className="p-1 rounded-corner-m hover:bg-red-50 text-[var(--color-neutro-400)] hover:text-red-400 transition-colors cursor-pointer" title="Eliminar estado" onClick={onRemove}>
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 mt-1.5 ml-14">
            {responsable && <span className="text-[11px] text-[var(--color-neutro-500)]"><span className="font-medium">{responsable.label}</span></span>}
            {step.transferenciaCarga && <span className="text-[11px] font-medium text-[var(--color-verde-100)]">↳ {step.transferenciaCarga === "entrega" ? "Entrega carga" : "Recibe carga"}</span>}
            {step.requiereAprobacion && <span className="text-[11px] font-medium text-blue-600">Apr. {step.tipoAprobacion === "central" ? "Central" : "Agencia"}</span>}
          </div>

          {index < total - 1 && (
            <div className="flex items-center gap-2 pl-[18px] py-1">
              <ArrowRight className="w-3.5 h-3.5 text-[var(--color-neutro-300)]" />
              <span className="text-[10px] text-[var(--color-neutro-300)] font-medium">siguiente</span>
            </div>
          )}

          {step.excepciones.length > 0 && (
            <div className="mt-2 ml-14 space-y-1">
              <p className="text-[10px] font-semibold text-[var(--color-neutro-400)] uppercase tracking-wide px-1">Rutas alternas</p>
              {step.excepciones.map((exc) => {
                const excKey = `${step.id}:${exc.id}`;
                const isExcActive = activeExceptionId === excKey;
                const excResponsable = exc.unidadResponsableId ? PERFILES_RESPONSABLE.find((e) => e.value === exc.unidadResponsableId) : null;
                return (
                  <div key={exc.id} className={`rounded-corner-m border text-[12px] transition-all cursor-pointer ${
                    isExcActive ? "border-[var(--color-verde-100)] ring-1 ring-[var(--color-verde-100)]" :
                    exc.esTerminal ? "border-red-200 hover:border-red-300" : "border-amber-200 hover:border-amber-300"
                  } ${exc.esTerminal ? "bg-red-50/60" : "bg-amber-50/60"}`}
                    onClick={(e) => { e.stopPropagation(); onSelectExcepcion(exc.id); }}
                  >
                    <div className="px-2.5 py-1.5">
                      <div className="flex items-center gap-2">
                        {exc.esTerminal ? <OctagonX className="w-3.5 h-3.5 text-red-500 shrink-0" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                        <span className={`flex-1 text-[12px] font-medium ${exc.esTerminal ? "text-red-800" : "text-amber-800"}`}>{exc.nombre}</span>
                        {exc.eventoContable !== "ninguno" && (
                          <span className={`text-[9px] font-semibold px-1 py-0.5 rounded-corner-m ${exc.eventoContable === "descuenta" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                            {exc.eventoContable === "descuenta" ? "−" : "+"}{exc.unidadEvento === "emisora" ? " Emi" : exc.unidadEvento === "receptora" ? " Rec" : ""}
                          </span>
                        )}
                        {exc.requiereAprobacion && <span className="text-[9px] font-semibold px-1 py-0.5 rounded-corner-m bg-blue-100 text-blue-600">Apr.</span>}
                        {readOnly ? (
                          exc.esTerminal && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-corner-m bg-red-200 text-red-700">FIN</span>
                        ) : (
                          <>
                            {exc.esTerminal ? (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-corner-m bg-red-200 text-red-700">FIN</span>
                            ) : (
                              <button className="p-0.5 rounded hover:bg-amber-200 text-amber-400 hover:text-amber-600 transition-colors cursor-pointer" title="Marcar como terminal" onClick={(e) => { e.stopPropagation(); onToggleExcepcionTerminal(exc.id, true); }}>
                                <OctagonX className="w-3 h-3" />
                              </button>
                            )}
                            <button className="p-0.5 rounded hover:bg-amber-200 text-amber-300 hover:text-red-500 transition-colors cursor-pointer" onClick={(e) => { e.stopPropagation(); onRemoveExcepcion(exc.id); }}>
                              <X className="w-3 h-3" />
                            </button>
                          </>
                        )}
                      </div>
                      {(excResponsable || exc.transferenciaCarga || exc.timeoutMinutos > 0) && (
                        <div className="flex items-center gap-2 mt-1 ml-5">
                          {excResponsable && <span className="text-[10px] text-[var(--color-neutro-500)]">{excResponsable.label}</span>}
                          {exc.transferenciaCarga && <span className="text-[10px] font-medium text-[var(--color-verde-100)]">↳ {exc.transferenciaCarga === "entrega" ? "Entrega" : "Recepción"}</span>}
                          {exc.timeoutMinutos > 0 && <span className="flex items-center gap-0.5 text-[10px] text-amber-600"><Clock className="w-2.5 h-2.5" />{exc.timeoutMinutos}m</span>}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ── Property Inspector ── */
const CATEGORIAS_OPERACIONES = ["Traslado", "Conteo", "Manipulación", "Custodia"];

function PropertyInspector({ step, origenTipo, destinoTipo, readOnly = false, usaTransportista = false }: { step: TransaccionStep; origenTipo: string | null; destinoTipo: string | null; readOnly?: boolean; usaTransportista?: boolean }) {
  const { updateStepProperty, toggleServicioCategoriaEnStep } = useTransaccionesStore();
  const sid = step.id;

  const labelClass = "text-[12px] font-semibold text-[var(--color-neutro-600)] mb-1";
  const valueClass = "text-[13px] text-[var(--color-neutro-900)] py-1";

  return (
    <div className="p-3 space-y-3 overflow-y-auto" onClick={(e) => e.stopPropagation()}>

      {/* ── General ── */}
      <div className="bg-[var(--color-neutro-50)] rounded-corner-m p-3 space-y-3">
        <p className="text-[10px] font-bold text-[var(--color-neutro-400)] uppercase tracking-wide">Información General</p>
        <div>
          {readOnly ? (
            <p className="text-[14px] font-bold text-[var(--color-neutro-900)]">{step.nombre}</p>
          ) : (
            <Input value={step.nombre} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateStepProperty(sid, "nombre", e.target.value)} className="!text-[14px] !font-bold" placeholder="Nombre del estado..." />
          )}
        </div>
      </div>

      {/* ── Operational ── */}
      <div className="bg-[var(--color-neutro-50)] rounded-corner-m p-3 space-y-3">
        <p className="text-[10px] font-bold text-[var(--color-neutro-400)] uppercase tracking-wide">Configuración Operativa</p>

        <div>
          <p className={labelClass}>Evento Contable</p>
          {readOnly ? (
            <p className={valueClass}>
              {EVENTOS_CONTABLES.find((e) => e.value === step.eventoContable)?.label ?? step.eventoContable}
              {step.eventoContable !== "ninguno" && step.unidadEvento && (
                <span className="ml-1 text-[var(--color-neutro-500)]">— {UNIDADES_EVENTO.find((u) => u.value === step.unidadEvento)?.label ?? step.unidadEvento}</span>
              )}
            </p>
          ) : (
            <div className="space-y-1.5">
              <Select options={EVENTOS_CONTABLES} value={step.eventoContable} onChange={(v: string) => {
                updateStepProperty(sid, "eventoContable", v);
                if (v === "ninguno") updateStepProperty(sid, "unidadEvento", null);
                else if (v === "descuenta" && !step.unidadEvento) updateStepProperty(sid, "unidadEvento", "emisora");
                else if (v === "suma" && !step.unidadEvento) updateStepProperty(sid, "unidadEvento", "receptora");
              }} />
              {step.eventoContable !== "ninguno" && (
                <Select options={UNIDADES_EVENTO} value={step.unidadEvento ?? ""} onChange={(v: string) => updateStepProperty(sid, "unidadEvento", v)} />
              )}
            </div>
          )}
        </div>

        <div>
          <p className={labelClass}>Perfil Responsable</p>
          {readOnly ? (
            <p className={valueClass}>{step.unidadResponsableId ? PERFILES_RESPONSABLE.find((e) => e.value === step.unidadResponsableId)?.label ?? step.unidadResponsableId : "Sin asignar"}</p>
          ) : (
            <Select options={[{ value: "", label: "Sin asignar" }, ...PERFILES_RESPONSABLE.map((e) => ({ value: e.value, label: e.label }))]}
              value={step.unidadResponsableId ?? ""} onChange={(v: string) => updateStepProperty(sid, "unidadResponsableId", v || null)} />
          )}
        </div>

        <div>
          <p className={labelClass}>Transferencia de Carga</p>
          {readOnly ? (
            <p className={valueClass}>{step.transferenciaCarga ? (step.transferenciaCarga === "entrega" ? "Entrega carga" : "Recibe carga") : "Sin transferencia"}</p>
          ) : (
            <Select
              options={[
                { value: "", label: "Sin transferencia" },
                { value: "entrega", label: "Entrega carga" },
                { value: "recepcion", label: "Recibe carga" },
              ]}
              value={step.transferenciaCarga ?? ""}
              onChange={(v: string) => updateStepProperty(sid, "transferenciaCarga", v || null)}
            />
          )}
        </div>
      </div>

      {/* ── Control ── */}
      <div className="bg-[var(--color-neutro-50)] rounded-corner-m p-3 space-y-3">
        <p className="text-[10px] font-bold text-[var(--color-neutro-400)] uppercase tracking-wide">Control de Flujo</p>

        <div>
          <p className={labelClass}>Aprobación</p>
          {readOnly ? (
            <p className={valueClass}>{TIPOS_APROBACION.find((t) => t.value === step.tipoAprobacion)?.label ?? step.tipoAprobacion}</p>
          ) : (
            <Select options={TIPOS_APROBACION} value={step.tipoAprobacion} onChange={(v: string) => {
              updateStepProperty(sid, "tipoAprobacion", v);
              updateStepProperty(sid, "requiereAprobacion", v !== "ninguno");
            }} />
          )}
        </div>

        <div>
          <p className={labelClass}>Tiempo máximo (minutos)</p>
          {readOnly ? (
            <p className={valueClass}>{step.timeoutMinutos > 0 ? `${step.timeoutMinutos} min` : "Sin límite"}</p>
          ) : (
            <div className="flex items-center gap-2">
              <Input type="number" value={step.timeoutMinutos} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateStepProperty(sid, "timeoutMinutos", Number(e.target.value))} className="flex-1" />
              <span className="text-[12px] text-[var(--color-neutro-500)]">0 = sin límite</span>
            </div>
          )}
          {step.timeoutMinutos > 0 && (
            <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Se levantará alerta si supera los {step.timeoutMinutos} minutos
            </p>
          )}
        </div>
      </div>

      {/* ── Data Capture ── */}
      <div className="bg-[var(--color-neutro-50)] rounded-corner-m p-3 space-y-3">
        <p className="text-[10px] font-bold text-[var(--color-neutro-400)] uppercase tracking-wide">Captura de Datos</p>

        <div>
          {readOnly ? (
            <div>
              <p className={labelClass}>Variables</p>
              <p className={valueClass}>{step.requiereVariables ? (step.variables || "Sí (sin especificar)") : "No requiere"}</p>
            </div>
          ) : (
            <>
              <label className="flex items-center gap-2 cursor-pointer mb-2">
                <Switch checked={step.requiereVariables} onChange={(v: boolean) => updateStepProperty(sid, "requiereVariables", v)} />
                <span className="text-[13px] text-[var(--color-neutro-700)]">Requiere captura de variables</span>
              </label>
              {step.requiereVariables && (
                <input value={step.variables} onChange={(e) => updateStepProperty(sid, "variables", e.target.value)}
                  className="w-full text-[13px] px-2.5 py-1.5 rounded-corner-m border border-[var(--color-neutro-200)] outline-none focus:border-[var(--color-verde-100)] bg-white"
                  placeholder="Ej: Número de precinto, peso, lote..." />
              )}
            </>
          )}
        </div>

        <CamposFormularioSection stepId={step.id} camposSeleccionados={step.camposSeleccionados} origenTipo={origenTipo} destinoTipo={destinoTipo} readOnly={readOnly} />
      </div>

      {/* ── Servicios ── */}
      <div className="bg-[var(--color-neutro-50)] rounded-corner-m p-3 space-y-3">
        <p className="text-[10px] font-bold text-[var(--color-neutro-400)] uppercase tracking-wide">Servicios al Avanzar</p>
        {(() => {
          const cats = CATEGORIAS_OPERACIONES.filter((cat) => {
            if (cat === "Traslado" && !usaTransportista) return false;
            if (cat === "Manipulación" && !step.transferenciaCarga) return false;
            return true;
          });
          if (cats.length === 0) return <p className="text-[12px] text-[var(--color-neutro-400)]">No hay categorías de servicio disponibles</p>;
          return (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {cats.map((cat) => {
                const sel = (step.serviciosCategorias ?? []).includes(cat);
                return (
                  <div key={cat} className={`px-2 py-1 rounded-corner-m transition-colors ${sel ? "bg-[var(--color-verde-100)]/10" : ""}`}>
                    <Checkbox
                      label={cat}
                      checked={sel}
                      disabled={readOnly}
                      onChange={() => toggleServicioCategoriaEnStep(step.id, cat)}
                    />
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

    </div>
  );
}

/* ── Exception Property Inspector ── */
function ExceptionPropertyInspector({ exception, stepId, readOnly = false, steps }: { exception: Excepcion; stepId: string; readOnly?: boolean; steps?: TransaccionStep[] }) {
  const { updateExcepcionProperty, setExcepcionTerminal } = useTransaccionesStore();
  const eid = exception.id;
  const labelClass = "text-[12px] font-semibold text-[var(--color-neutro-600)] mb-1";
  const valueClass = "text-[13px] text-[var(--color-neutro-900)] py-1";

  const currentStepIdx = steps?.findIndex((s) => s.id === stepId) ?? -1;
  const pasoAnterior = (steps && currentStepIdx > 0) ? steps[currentStepIdx - 1] : null;
  const pasosAnteriores = steps?.filter((_, i) => i < currentStepIdx) ?? [];
  const retrocedeAlAnterior = exception.retrocedeA === pasoAnterior?.id;

  const retrocedeOptions = [
    { value: "", label: "No retrocede" },
    ...pasosAnteriores.map((s) => ({ value: s.id, label: s.nombre })),
  ];

  const pasoDestino = exception.retrocedeA
    ? pasosAnteriores.find((s) => s.id === exception.retrocedeA)
    : null;

  return (
    <div className="p-3 space-y-3 overflow-y-auto" onClick={(e) => e.stopPropagation()}>

      {/* ── Header ── */}
      <div className="flex items-center gap-2 bg-[var(--color-neutro-50)] rounded-corner-m p-3">
        {exception.esTerminal ? <OctagonX className="w-5 h-5 text-red-500 shrink-0" /> : <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-[var(--color-neutro-400)] uppercase tracking-wide mb-0.5">
            {exception.esTerminal ? "Ruta Terminal" : "Ruta Alterna"}
          </p>
          {readOnly ? (
            <p className="text-[14px] font-bold text-[var(--color-neutro-900)] truncate">{exception.nombre}</p>
          ) : (
            <Input value={exception.nombre} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateExcepcionProperty(stepId, eid, "nombre", e.target.value)} className="!text-[14px] !font-bold" placeholder="Nombre de la ruta alterna..." />
          )}
        </div>
      </div>

      {/* ── Terminal / Fin ── */}
      <div className="bg-[var(--color-neutro-50)] rounded-corner-m p-3">
        {readOnly ? (
          <div>
            <p className={labelClass}>Comportamiento</p>
            <p className={valueClass}>
              {exception.esTerminal
                ? "Finaliza la transacción (estado terminal)"
                : pasoDestino
                  ? `Retrocede al estado "${pasoDestino.nombre}"`
                  : "Solo registra la ruta, no altera el flujo"}
            </p>
          </div>
        ) : (
          <label className={`flex items-center gap-2 cursor-pointer ${exception.esTerminal ? "opacity-50" : ""}`}
            title={exception.esTerminal ? "Desmarcar como terminal para configurar retroceso" : undefined}>
            <Switch checked={exception.esTerminal} onChange={(v: boolean) => {
              setExcepcionTerminal(stepId, eid, v);
              if (v) updateExcepcionProperty(stepId, eid, "retrocedeA", null);
            }} />
            <div>
              <span className="text-[13px] text-[var(--color-neutro-700)]">Estado terminal</span>
              <p className="text-[10px] text-[var(--color-neutro-400)]">Finaliza la transacción al activarse</p>
            </div>
          </label>
        )}
      </div>

      {/* ── Retroceso ── (only if NOT terminal) */}
      {!exception.esTerminal && pasosAnteriores.length > 0 && (
        <div className="bg-[var(--color-neutro-50)] rounded-corner-m p-3 space-y-3">
          <p className="text-[10px] font-bold text-[var(--color-neutro-400)] uppercase tracking-wide flex items-center gap-1.5">
            <Undo2 className="w-3 h-3" /> Retroceso
          </p>

          {!readOnly && pasoAnterior && (
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch checked={retrocedeAlAnterior}
                onChange={(v: boolean) => {
                  updateExcepcionProperty(stepId, eid, "retrocedeA", v ? pasoAnterior.id : null);
                }} />
              <div>
                <span className="text-[13px] text-[var(--color-neutro-700)]">Volver al estado anterior</span>
                <p className="text-[10px] text-[var(--color-neutro-400)]">La transacción retrocederá a &quot;{pasoAnterior.nombre}&quot;</p>
              </div>
            </label>
          )}

          {!readOnly && (
            <div>
              <p className="text-[11px] text-[var(--color-neutro-500)] mb-1">O retroceder a un estado específico:</p>
              <Select
                options={retrocedeOptions}
                value={exception.retrocedeA ?? ""}
                onChange={(v: string) => updateExcepcionProperty(stepId, eid, "retrocedeA", v || null)}
              />
              {exception.retrocedeA && pasoDestino && (
                <p className="text-[11px] text-blue-600 mt-1 flex items-center gap-1">
                  <Undo2 className="w-3 h-3" />
                  La transacción volverá al estado &quot;{pasoDestino.nombre}&quot;
                </p>
              )}
            </div>
          )}

          {readOnly && (
            <p className={valueClass}>
              {exception.retrocedeA
                ? `Retrocede a "${pasoDestino?.nombre ?? "paso anterior"}"`
                : "Sin retroceso"}
            </p>
          )}
        </div>
      )}

      {/* ── Operational ── */}
      <div className="bg-[var(--color-neutro-50)] rounded-corner-m p-3 space-y-3">
        <p className="text-[10px] font-bold text-[var(--color-neutro-400)] uppercase tracking-wide">Configuración Operativa</p>

        <div>
          <p className={labelClass}>Evento Contable</p>
          {readOnly ? (
            <p className={valueClass}>
              {EVENTOS_CONTABLES.find((e) => e.value === exception.eventoContable)?.label ?? exception.eventoContable}
              {exception.eventoContable !== "ninguno" && exception.unidadEvento && (
                <span className="ml-1 text-[var(--color-neutro-500)]">— {UNIDADES_EVENTO.find((u) => u.value === exception.unidadEvento)?.label ?? exception.unidadEvento}</span>
              )}
            </p>
          ) : (
            <div className="space-y-1.5">
              <Select options={EVENTOS_CONTABLES} value={exception.eventoContable} onChange={(v: string) => {
                updateExcepcionProperty(stepId, eid, "eventoContable", v);
                if (v === "ninguno") updateExcepcionProperty(stepId, eid, "unidadEvento", null);
                else if (v === "descuenta" && !exception.unidadEvento) updateExcepcionProperty(stepId, eid, "unidadEvento", "emisora");
                else if (v === "suma" && !exception.unidadEvento) updateExcepcionProperty(stepId, eid, "unidadEvento", "receptora");
              }} />
              {exception.eventoContable !== "ninguno" && (
                <Select options={UNIDADES_EVENTO} value={exception.unidadEvento ?? ""} onChange={(v: string) => updateExcepcionProperty(stepId, eid, "unidadEvento", v)} />
              )}
            </div>
          )}
        </div>

        <div>
          <p className={labelClass}>Perfil Responsable</p>
          {readOnly ? (
            <p className={valueClass}>{exception.unidadResponsableId ? PERFILES_RESPONSABLE.find((e) => e.value === exception.unidadResponsableId)?.label ?? exception.unidadResponsableId : "Sin asignar"}</p>
          ) : (
            <Select options={[{ value: "", label: "Sin asignar" }, ...PERFILES_RESPONSABLE.map((e) => ({ value: e.value, label: e.label }))]}
              value={exception.unidadResponsableId ?? ""} onChange={(v: string) => updateExcepcionProperty(stepId, eid, "unidadResponsableId", v || null)} />
          )}
        </div>

        <div>
          <p className={labelClass}>Transferencia de Carga</p>
          {readOnly ? (
            <p className={valueClass}>{exception.transferenciaCarga ? (exception.transferenciaCarga === "entrega" ? "Entrega carga" : "Recibe carga") : "Sin transferencia"}</p>
          ) : (
            <Select
              options={[
                { value: "", label: "Sin transferencia" },
                { value: "entrega", label: "Entrega carga" },
                { value: "recepcion", label: "Recibe carga" },
              ]}
              value={exception.transferenciaCarga ?? ""}
              onChange={(v: string) => updateExcepcionProperty(stepId, eid, "transferenciaCarga", v || null)}
            />
          )}
        </div>
      </div>

      {/* ── Control ── */}
      <div className="bg-[var(--color-neutro-50)] rounded-corner-m p-3 space-y-3">
        <p className="text-[10px] font-bold text-[var(--color-neutro-400)] uppercase tracking-wide">Control de Flujo</p>

        <div>
          <p className={labelClass}>Aprobación</p>
          {readOnly ? (
            <p className={valueClass}>{TIPOS_APROBACION.find((t) => t.value === exception.tipoAprobacion)?.label ?? exception.tipoAprobacion}</p>
          ) : (
            <Select options={TIPOS_APROBACION} value={exception.tipoAprobacion} onChange={(v: string) => {
              updateExcepcionProperty(stepId, eid, "tipoAprobacion", v);
              updateExcepcionProperty(stepId, eid, "requiereAprobacion", v !== "ninguno");
            }} />
          )}
        </div>

        <div>
          <p className={labelClass}>Tiempo máximo (minutos)</p>
          {readOnly ? (
            <p className={valueClass}>{exception.timeoutMinutos > 0 ? `${exception.timeoutMinutos} min` : "Sin límite"}</p>
          ) : (
            <>
              <Input type="number" value={exception.timeoutMinutos} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateExcepcionProperty(stepId, eid, "timeoutMinutos", Number(e.target.value))} />
              {exception.timeoutMinutos > 0 && (
                <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Alerta si supera los {exception.timeoutMinutos} minutos
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Campos del formulario section ── */
function CamposFormularioSection({ stepId, camposSeleccionados, origenTipo, destinoTipo, readOnly = false }: { stepId: string; camposSeleccionados: string[]; origenTipo: string | null; destinoTipo: string | null; readOnly?: boolean }) {
  const { toggleCampoSeleccionado } = useTransaccionesStore();

  const tiposUnidad = [origenTipo, destinoTipo].filter((t): t is string => t !== null);
  const camposDisponibles = CAMPOS_PREDEFINIDOS.filter((c) =>
    c.aplicableA.some((t) => tiposUnidad.includes(t))
  );

  const seleccionados = camposDisponibles.filter((c) => camposSeleccionados.includes(c.id));
  const noSeleccionados = camposDisponibles.filter((c) => !camposSeleccionados.includes(c.id));

  if (camposDisponibles.length === 0) {
    return (
      <div>
        <p className="text-[12px] font-semibold text-[var(--color-neutro-600)] mb-1">Campos del formulario</p>
        <p className="text-[11px] text-[var(--color-neutro-400)] italic">Seleccione origen y destino para ver campos disponibles</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-[12px] font-semibold text-[var(--color-neutro-600)] mb-1">Campos del formulario</p>
      {seleccionados.length > 0 && (
        <div className="mb-2">
          <p className="text-[10px] font-semibold text-[var(--color-verde-100)] uppercase tracking-wide mb-0.5">Seleccionados</p>
          {seleccionados.map((campo) => (
            <div key={campo.id} className={`flex items-center gap-2 py-1 px-1 rounded-corner-m ${readOnly ? "" : "hover:bg-green-50 cursor-pointer"}`}>
              <Checkbox label="" checked disabled={readOnly} onChange={() => toggleCampoSeleccionado(stepId, campo.id)} />
              <div className="flex-1 min-w-0">
                <span className="text-[12px] text-[var(--color-neutro-900)]">{campo.etiqueta}</span>
                <span className="text-[10px] text-[var(--color-neutro-400)] ml-1">({campo.tipo})</span>
              </div>
              {campo.requerido && <span className="text-[10px] font-semibold text-red-500 shrink-0">Requerido</span>}
            </div>
          ))}
        </div>
      )}
      {noSeleccionados.length > 0 && (
        <div>
          {seleccionados.length > 0 && <p className="text-[10px] font-semibold text-[var(--color-neutro-400)] uppercase tracking-wide mb-0.5">Disponibles</p>}
          {noSeleccionados.map((campo) => (
            <div key={campo.id} className={`flex items-center gap-2 py-1 px-1 rounded-corner-m ${readOnly ? "" : "hover:bg-[var(--color-neutro-50)] cursor-pointer"}`}>
              <Checkbox label="" checked={false} disabled={readOnly} onChange={() => toggleCampoSeleccionado(stepId, campo.id)} />
              <div className="flex-1 min-w-0">
                <span className="text-[12px] text-[var(--color-neutro-700)]">{campo.etiqueta}</span>
                <span className="text-[10px] text-[var(--color-neutro-400)] ml-1">({campo.tipo})</span>
              </div>
              {campo.requerido && <span className="text-[10px] font-semibold text-red-500 shrink-0">Requerido</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── New Operation Dialog ── */
function NewOperationDialog({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (vals: { nombre: string; tipoCarga: string; ambito: "interna" | "entre-agencias" | "externa"; modoIngreso: "fajos" | "piezas"; origenTipo: string | null; destinoTipo: string | null }) => void }) {
  const [nombre, setNombre] = useState("");
  const [tipoCarga, setTipoCarga] = useState("remesas");
  const [ambito, setAmbito] = useState<"interna" | "entre-agencias" | "externa">("interna");
  const [modoIngreso, setModoIngreso] = useState<"fajos" | "piezas">("fajos");
  const [origenTipo, setOrigenTipo] = useState("");
  const [destinoTipo, setDestinoTipo] = useState("");

  return (
    <Modal open={open} onClose={onClose} title="Nueva Operación" size="md"
      actions={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => {
            if (!nombre.trim()) return;
            onCreate({ nombre: nombre.trim(), tipoCarga, ambito, modoIngreso, origenTipo: origenTipo || null, destinoTipo: destinoTipo || null });
          }} disabled={!nombre.trim()}>Crear Operación</Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <p className="text-[13px] font-semibold text-[var(--color-neutro-700)] mb-1">Nombre de la Operación *</p>
          <Input value={nombre} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNombre(e.target.value)} placeholder="Ej: Envío de Remesa" />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-[var(--color-neutro-700)] mb-1">Tipo de Carga</p>
          <Select options={TIPOS_CARGA} value={tipoCarga} onChange={(v: string) => setTipoCarga(v)} />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-[var(--color-neutro-700)] mb-1">Ámbito</p>
          <Select options={AMBITOS} value={ambito} onChange={(v: string) => setAmbito(v as "interna" | "entre-agencias" | "externa")} />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <p className="text-[13px] font-semibold text-[var(--color-neutro-700)] mb-1">Origen</p>
            <Select options={[{ value: "", label: "Sin especificar" }, ...TIPOS_UNIDAD]} value={origenTipo} onChange={(v: string) => setOrigenTipo(v)} />
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-semibold text-[var(--color-neutro-700)] mb-1">Destino</p>
            <Select options={[{ value: "", label: "Sin especificar" }, ...TIPOS_UNIDAD]} value={destinoTipo} onChange={(v: string) => setDestinoTipo(v)} />
          </div>
        </div>
        <div>
          <p className="text-[13px] font-semibold text-[var(--color-neutro-700)] mb-1">Modo de Ingreso</p>
          <div className="flex gap-2">
            <button className={`flex-1 px-3 py-2 rounded-corner-m text-[13px] font-medium border transition-colors cursor-pointer ${modoIngreso === "fajos" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-[var(--color-neutro-600)] border-[var(--color-neutro-200)]"}`} onClick={() => setModoIngreso("fajos")}>Fajos</button>
            <button className={`flex-1 px-3 py-2 rounded-corner-m text-[13px] font-medium border transition-colors cursor-pointer ${modoIngreso === "piezas" ? "bg-amber-600 text-white border-amber-600" : "bg-white text-[var(--color-neutro-600)] border-[var(--color-neutro-200)]"}`} onClick={() => setModoIngreso("piezas")}>Piezas</button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ── Divisa Selector ── */
function DivisaSelector({ ids, onChange }: { ids: string[]; onChange: (ids: string[]) => void }) {
  const { divisas } = useDivisasStore();
  return (
    <div className="flex flex-wrap gap-1.5">
      {divisas.filter((d) => d.activo).map((d) => {
        const selected = (ids ?? []).includes(d.id);
        return (
          <button key={d.id}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-corner-m text-[12px] font-medium border transition-colors cursor-pointer ${selected ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-[var(--color-neutro-600)] border-[var(--color-neutro-200)] hover:border-emerald-300"}`}
            onClick={() => onChange(selected ? (ids ?? []).filter((id) => id !== d.id) : [...(ids ?? []), d.id])}
          >
            {d.simbolo} {d.codigoISO}
          </button>
        );
      })}
    </div>
  );
}
