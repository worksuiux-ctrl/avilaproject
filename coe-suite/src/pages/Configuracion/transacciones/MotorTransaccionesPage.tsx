import { useState, useEffect, useMemo } from "react";
import { Plus, X, ArrowRight, AlertTriangle, Clock, CheckCheck, GripVertical, OctagonX, Save, FolderOpen, Trash2, Pencil, Layers, Package, ChevronDown, Copy, Undo2, Lock, CheckCircle, GripHorizontal, BookOpen, FileText, Tag } from "lucide-react";
import { Button, Input, Select, Switch, Checkbox } from "@coe/design-system";
import { Modal } from "@components/ui/Modal";
import {
  useTransaccionesStore,
  type TransaccionesState,
  type TransaccionStep,
  type Excepcion,
  type GrupoOperacion,
  type ProcesoTransaccional,
  CAMPOS_PREDEFINIDOS,
  TIPOS_CARGA,
  TIPOS_UNIDAD,
  AMBITOS,
  PERFILES_RESPONSABLE,
  TIPOS_INVENTARIO,
  UNIDADES_INVENTARIO,
  TIPOS_APROBACION,
  PRODUCTOS,
} from "@stores/transaccionesStore";
import { useDivisasStore } from "@stores/divisasStore";
import { useProveedoresStore } from "@stores/proveedoresStore";


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
  const store: any = useTransaccionesStore();
  const { proceso } = store;
  const [activeTab, setActiveTab] = useState<"operaciones-y-estados" | "cuentas-contables" | "eventos-contables" | "productos">("operaciones-y-estados");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [selectedSavedId, setSelectedSavedId] = useState<string | null>(null);
  const [showNewDialog, setShowNewDialog] = useState(false);

  useEffect(() => {
    if (!selectedSavedId && store.procesosFinalizados.length > 0) {
      setSelectedSavedId(store.procesosFinalizados[0].id);
    }
  }, [store.procesosFinalizados.length]);

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
    { id: "cuentas-contables" as const, label: "Cuentas Contables", icon: BookOpen },
    { id: "eventos-contables" as const, label: "Eventos Contables", icon: FileText },
    { id: "productos" as const, label: "Productos", icon: Tag },
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
      {activeTab === "cuentas-contables" && (
        <ContabilidadTab />
      )}
      {activeTab === "eventos-contables" && (
        <EventosContablesTab />
      )}
      {activeTab === "productos" && (
        <ProductosTab />
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

/* ── Fusionado Tab ── */
function FusionadoTab({
  store, proceso, selectedSavedId, savedProceso, isViewingSaved, displayProceso,
  hasActiveOperation, dragIndex, dragOverIndex, setDragIndex, setDragOverIndex,
  onSelectSaved, onEditSaved, onNewOperation,
}: {
  store: TransaccionesState;
  proceso: TransaccionesState["proceso"];
  selectedSavedId: string | null;
  savedProceso: TransaccionesState["procesosFinalizados"][0] | null;
  isViewingSaved: boolean;
  displayProceso: TransaccionesState["proceso"] | NonNullable<typeof savedProceso>;
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
  const [showGroupDialog, setShowGroupDialog] = useState(false);
  const [editGroupId, setEditGroupId] = useState<string | null>(null);
  const [dragSrc, setDragSrc] = useState<{ groupId: string | null; idx: number } | null>(null);
  const [dragOver, setDragOver] = useState<{ groupId: string | null; idx: number } | null>(null);

  // Auto-collapse detalles when a step/exception is selected
  useEffect(() => {
    if (activeStepId || activeExceptionId) setCollapseDetalles(true);
  }, [activeStepId, activeExceptionId]);

  const grupoActivo = store.gruposOperaciones.find((g) => g.operacionIds.includes(displayProceso.id));
  const grupoColorActivo = grupoActivo?.color ?? null;

  if (!hasActiveOperation) {
    const ungrouped = store.procesosFinalizados.filter(
      (p) => !store.gruposOperaciones.some((g) => g.operacionIds.includes(p.id))
    );
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-[18px] font-bold text-[var(--color-neutro-900)]">Operaciones</h2>
            <p className="text-[13px] text-[var(--color-neutro-500)]">Seleccione una operación para ver sus detalles</p>
          </div>
          <Button size="sm" iconLeft={<Plus className="w-4 h-4" />} onClick={onNewOperation}>Nueva Operación</Button>
        </div>
        {store.gruposOperaciones.map((grupo) => {
          const ops = grupo.operacionIds
            .map((oid) => store.procesosFinalizados.find((p) => p.id === oid))
            .filter((p): p is ProcesoTransaccional => p != null);
          if (ops.length === 0) return null;
          return (
            <div key={grupo.id} className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: grupo.color }} />
                <h3 className="text-[14px] font-bold text-[var(--color-neutro-800)]">{grupo.nombre}</h3>
                <span className="text-[11px] text-[var(--color-neutro-400)]">({ops.length})</span>
              </div>
              <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
                {ops.map((p) => (
                  <div key={p.id}
                    className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-md transition-all cursor-pointer"
                    onClick={() => onSelectSaved(p.id)}
                  >
                    <div className="h-1.5" style={{ backgroundColor: grupo.color }} />
                    <div className="p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[13px] font-bold text-[var(--color-neutro-900)] leading-tight">{p.nombre}</p>
                        <span className="shrink-0 px-2 py-0.5 text-[10px] font-medium rounded-full" style={{ backgroundColor: `${grupo.color}18`, color: grupo.color }}>
                          {grupo.nombre}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[var(--color-neutro-500)]">
                        <span className="px-1.5 py-0.5 bg-[var(--color-neutro-100)] rounded-corner-m">{p.tipoCarga}</span>
                        <span>{p.steps.length} estados</span>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className={`px-2 py-0.5 text-[11px] font-medium rounded-corner-m ${p.modoIngreso === "fajos" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"}`}>
                          {p.modoIngreso === "fajos" ? "Fajos" : "Piezas"}
                        </span>
                        <div className="flex gap-1">
                          <button className="p-1 rounded text-[var(--color-neutro-400)] hover:bg-[var(--color-neutro-100)] hover:text-[var(--color-neutro-700)] transition-colors" title="Editar" onClick={(e) => { e.stopPropagation(); onEditSaved(p.id, p.nombre || "Sin nombre"); }}>
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1 rounded text-[var(--color-neutro-400)] hover:bg-[var(--color-neutro-100)]" title="Duplicar" onClick={(e) => { e.stopPropagation(); store.duplicarProceso(p.id); }}>
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1 rounded text-[var(--color-neutro-400)] hover:bg-red-50 hover:text-red-500 transition-colors" title="Eliminar" onClick={(e) => { e.stopPropagation(); if (window.confirm(`¿Eliminar "${p.nombre}"?`)) { store.eliminarProceso(p.id); } }}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {ungrouped.length > 0 && (
          <div className="mb-8">
            <h3 className="text-[14px] font-bold text-[var(--color-neutro-800)] mb-3">Sin grupo</h3>
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
              {ungrouped.map((p) => (
                <div key={p.id}
                  className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-md transition-all cursor-pointer"
                  onClick={() => onSelectSaved(p.id)}
                >
                  <div className="h-1.5 bg-[var(--color-neutro-200)]" />
                  <div className="p-3 space-y-2">
                    <p className="text-[13px] font-bold text-[var(--color-neutro-900)] leading-tight">{p.nombre}</p>
                    <div className="flex items-center gap-2 text-[11px] text-[var(--color-neutro-500)]">
                      <span className="px-1.5 py-0.5 bg-[var(--color-neutro-100)] rounded-corner-m">{p.tipoCarga}</span>
                      <span>{p.steps.length} estados</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className={`px-2 py-0.5 text-[11px] font-medium rounded-corner-m ${p.modoIngreso === "fajos" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"}`}>
                        {p.modoIngreso === "fajos" ? "Fajos" : "Piezas"}
                      </span>
                      <div className="flex gap-1">
                        <button className="p-1 rounded text-[var(--color-neutro-400)] hover:bg-[var(--color-neutro-100)] hover:text-[var(--color-neutro-700)] transition-colors" title="Editar" onClick={(e) => { e.stopPropagation(); onEditSaved(p.id, p.nombre || "Sin nombre"); }}>
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1 rounded text-[var(--color-neutro-400)] hover:bg-[var(--color-neutro-100)]" title="Duplicar" onClick={(e) => { e.stopPropagation(); store.duplicarProceso(p.id); }}>
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1 rounded text-[var(--color-neutro-400)] hover:bg-red-50 hover:text-red-500 transition-colors" title="Eliminar" onClick={(e) => { e.stopPropagation(); if (window.confirm(`¿Eliminar "${p.nombre}"?`)) { store.eliminarProceso(p.id); } }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {store.procesosFinalizados.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Layers className="w-12 h-12 text-[var(--color-neutro-300)] mx-auto mb-3" />
              <h3 className="text-[16px] font-bold text-[var(--color-neutro-900)] mb-2">No hay operaciones</h3>
              <p className="text-[13px] text-[var(--color-neutro-500)] mb-4">Cree su primera operación para comenzar</p>
              <Button onClick={onNewOperation}>Crear Nueva Operación</Button>
            </div>
          </div>
      )}
    </div>
  );
  }

  return (
    <div className="flex-1 flex gap-4 min-h-0">
      {/* Left: saved operations */}
      <div className="w-[312px] shrink-0 bg-white border border-[var(--color-neutro-200)] rounded-corner-m overflow-y-auto shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex flex-col min-h-0">
        <div className="px-3 py-2.5 border-b border-[var(--color-neutro-200)]">
          <p className="text-[12px] font-semibold text-[var(--color-neutro-600)] uppercase tracking-wide">
            Operaciones ({store.procesosFinalizados.length})
          </p>
        </div>
        <div className="p-3 border-b border-[var(--color-neutro-200)] flex gap-2">
          <Button className="flex-1 !justify-center" size="sm" iconLeft={<Plus className="w-4 h-4" />} onClick={onNewOperation}>
            Crear Nueva Operación
          </Button>
          <Button size="sm" variant="outline" className="!justify-center" iconLeft={<Layers className="w-3.5 h-3.5" />} onClick={() => { setEditGroupId(null); setShowGroupDialog(true); }}>
            Naturaleza
          </Button>
        </div>
        <div className="p-2 space-y-2 flex-1 overflow-y-auto">
          {store.gruposOperaciones.map((grupo) => {
            const ops = grupo.operacionIds
              .map((oid) => store.procesosFinalizados.find((p) => p.id === oid))
              .filter((p): p is ProcesoTransaccional => p != null);
            if (ops.length === 0) return null;
            return (
              <div key={grupo.id}>
                <div className="flex items-center gap-1.5 px-2 py-1">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: grupo.color }} />
                  <span className="text-[10px] font-bold text-[var(--color-neutro-500)] uppercase tracking-wide">{grupo.nombre}</span>
                  <span className="text-[10px] text-[var(--color-neutro-400)]">({ops.length})</span>
                </div>
                {ops.map((p, idx) => (
                  <div key={p.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-corner-m text-left text-[13px] transition-colors cursor-pointer ${
                      selectedSavedId === p.id
                        ? "text-white"
                        : "text-[var(--color-neutro-700)] hover:bg-[var(--group-color)]/[0.12]"
                    } ${p.activo === false ? "opacity-50" : ""} ${dragOver?.groupId === grupo.id && dragOver?.idx === idx ? "ring-2 ring-[var(--color-verde-100)]" : ""}`}
                    style={{ borderLeft: `3px solid ${grupo.color}`, '--group-color': grupo.color, ...(selectedSavedId === p.id ? { backgroundColor: grupo.color } : {}) } as React.CSSProperties}
                    onClick={() => onSelectSaved(p.id)}
                    draggable
                    onDragStart={() => setDragSrc({ groupId: grupo.id, idx })}
                    onDragOver={(e) => { e.preventDefault(); setDragOver({ groupId: grupo.id, idx }); }}
                    onDragEnd={() => {
                      if (dragSrc && dragOver && dragSrc.groupId === dragOver.groupId && dragSrc.idx !== dragOver.idx) {
                        store.reordenarOperacionesEnGrupo(dragSrc.groupId, dragSrc.idx, dragOver.idx);
                      }
                      setDragSrc(null);
                      setDragOver(null);
                    }}
                  >
                    <GripHorizontal className="w-3 h-3 shrink-0 text-[var(--color-neutro-400)] cursor-grab active:cursor-grabbing" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{p.nombre || "Sin nombre"}</p>
                      <p className={`text-[11px] truncate ${selectedSavedId === p.id ? "text-white/70" : "text-[var(--color-neutro-400)]"}`}>
                        {p.tipoCarga} · {p.steps.length} estados{p.activo === false ? " · Inactivo" : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button className={`p-1 rounded transition-colors ${selectedSavedId === p.id ? "text-white hover:bg-white/20" : "text-[var(--color-neutro-400)] hover:bg-[var(--color-neutro-100)]"}`} title="Editar operación" onClick={(e) => { e.stopPropagation(); onEditSaved(p.id, p.nombre || "Sin nombre"); }}>
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button className={`p-1 rounded transition-colors ${selectedSavedId === p.id ? "text-white hover:bg-white/20" : "text-[var(--color-neutro-400)] hover:bg-red-50 hover:text-red-500"}`} title="Eliminar operación" onClick={(e) => { e.stopPropagation(); if (window.confirm(`¿Eliminar "${p.nombre}"?`)) { store.eliminarProceso(p.id); if (selectedSavedId === p.id) onSelectSaved(p.id); } }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
          {(() => {
            const ungrouped = store.procesosFinalizados.filter(
              (p) => !store.gruposOperaciones.some((g) => g.operacionIds.includes(p.id))
            );
            if (ungrouped.length === 0) return null;
            return (
              <div>
                <div className="flex items-center gap-1.5 px-2 py-1">
                  <span className="text-[10px] font-bold text-[var(--color-neutro-400)] uppercase tracking-wide">Sin grupo</span>
                  <span className="text-[10px] text-[var(--color-neutro-400)]">({ungrouped.length})</span>
                </div>
                {ungrouped.map((p, _idx) => (
                  <div key={p.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-corner-m text-left text-[13px] transition-colors cursor-pointer ${
                      selectedSavedId === p.id
                        ? "bg-[var(--color-verde-100)] text-white"
                        : "text-[var(--color-neutro-700)] hover:bg-[var(--color-neutro-100)]"
                    } ${p.activo === false ? "opacity-50" : ""}`}
                    onClick={() => onSelectSaved(p.id)}
                  >
                    <FolderOpen className="w-4 h-4 shrink-0 text-[var(--color-neutro-400)]" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{p.nombre || "Sin nombre"}</p>
                      <p className={`text-[11px] truncate ${selectedSavedId === p.id ? "text-white/70" : "text-[var(--color-neutro-400)]"}`}>
                        {p.tipoCarga} · {p.steps.length} estados{p.activo === false ? " · Inactivo" : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button className={`p-1 rounded transition-colors ${selectedSavedId === p.id ? "text-white hover:bg-white/20" : "text-[var(--color-neutro-400)] hover:bg-[var(--color-neutro-100)]"}`} title="Editar operación" onClick={(e) => { e.stopPropagation(); onEditSaved(p.id, p.nombre || "Sin nombre"); }}>
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button className={`p-1 rounded transition-colors ${selectedSavedId === p.id ? "text-white/70 hover:text-white hover:bg-white/20" : "text-[var(--color-neutro-400)] hover:bg-red-50 hover:text-red-500"}`} title="Eliminar operación" onClick={(e) => { e.stopPropagation(); if (window.confirm(`¿Eliminar "${p.nombre}"?`)) { store.eliminarProceso(p.id); if (selectedSavedId === p.id) onSelectSaved(p.id); } }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
          {store.procesosFinalizados.length === 0 && (
            <p className="text-[13px] text-[var(--color-neutro-400)] text-center py-6">No hay operaciones guardadas</p>
          )}
        </div>
      </div>

      {/* Group management dialog */}
      <GroupDialog
        open={showGroupDialog}
        editGroupId={editGroupId}
        procesosFinalizados={store.procesosFinalizados}
        gruposOperaciones={store.gruposOperaciones}
        onAddGrupo={(nombre, color) => store.addGrupo(nombre, color)}
        onUpdateGrupo={(id, updates) => store.updateGrupo(id, updates)}
        onRemoveGrupo={(id) => store.removeGrupo(id)}
        onMoveOperacion={(opId, fromGId, toGId, toIdx) => store.moveOperacionToGrupo(opId, fromGId, toGId, toIdx)}
        onClose={() => { setShowGroupDialog(false); setEditGroupId(null); }}
      />

      {/* Center: form fields + inspector */}
      <div className="flex-1 flex flex-col gap-4 min-h-0 overflow-y-auto">
        {/* Detalles de la Operación — unificado */}
        <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m shadow-[0_1px_2px_rgba(0,0,0,0.04)] shrink-0 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none transition-colors" style={{ backgroundColor: grupoColorActivo ?? 'var(--color-verde-100)' }} onClick={() => setCollapseDetalles(!collapseDetalles)}>
            <Package className="w-4 h-4 text-white" />
            <p className="flex-1 text-[11px] font-bold text-white uppercase tracking-wide">Detalles de la Operación</p>
            <ChevronDown className={`w-4 h-4 text-white/70 transition-transform ${collapseDetalles ? "-rotate-90" : ""}`} />
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
                {displayProceso.usaProducto && (
                  <div>
                    <p className="text-[11px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide mb-1">Productos</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(displayProceso.productosPermitidos ?? []).map((pId) => {
                        const p = PRODUCTOS.find((pr) => pr.value === pId);
                        return p ? <span key={pId} className="px-2 py-0.5 text-[12px] font-medium bg-purple-50 text-purple-700 rounded-corner-m">{p.label}</span> : null;
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

                {/* 6. Producto */}
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Switch checked={proceso.usaProducto} onChange={store.setUsaProducto} />
                    <span className="text-[13px] text-[var(--color-neutro-700)]">Producto</span>
                  </label>
                  {proceso.usaProducto && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {PRODUCTOS.map((pr) => {
                        const selected = proceso.productosPermitidos.includes(pr.value);
                        return (
                          <button key={pr.value} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-corner-m text-[12px] font-medium border transition-colors cursor-pointer ${selected ? "bg-purple-600 text-white border-purple-600" : "bg-white text-[var(--color-neutro-600)] border-[var(--color-neutro-200)] hover:border-purple-300"}`} onClick={() => store.toggleProductoPermitido(pr.value)}>
                            <CheckCheck className={`w-3 h-3 ${selected ? "block" : "hidden"}`} />
                            {pr.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <hr className="border-[var(--color-neutro-100)]" />

                {/* 7. Códigos de transacción */}
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
        <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m shadow-[0_1px_2px_rgba(0,0,0,0.04)] min-h-[200px] flex flex-col">
          <div className="flex items-center gap-2 px-4 py-3 select-none" style={{ backgroundColor: 'var(--color-verde-100)' }}>
            <p className="flex-1 text-[12px] font-semibold text-white uppercase tracking-wide">Inspector de Propiedades</p>
          </div>
          {activeException ? (
            <ExceptionPropertyInspector exception={activeException} stepId={activeExceptionId!.stepId} steps={displaySteps} readOnly={isViewingSaved} productosPermitidos={displayProceso.productosPermitidos} />
          ) : activeStep ? (
            <PropertyInspector step={activeStep} origenTipo={displayProceso.origenTipo} destinoTipo={displayProceso.destinoTipo} readOnly={isViewingSaved} usaTransportista={displayProceso.usaTransportista} productosPermitidos={displayProceso.productosPermitidos} />
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
      <div className="w-[480px] shrink-0 bg-white border border-[var(--color-neutro-200)] rounded-corner-m shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex flex-col min-h-0">
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

/* ── Eventos Contables Tab ── */
interface EventoContableRow {
  id: string;
  operacion: string;
  operacionId: string;
  estado: string;
  origen: "estado" | "excepcion";
  productoId: string;
  productoLabel: string;
  cuentaIngreso: string;
  cuentaEgreso: string;
}

function getEventosConfigurados(proceso: ProcesoTransaccional, procesosFinalizados: ProcesoTransaccional[]): EventoContableRow[] {
  const rows: EventoContableRow[] = [];
  const todos = [proceso, ...procesosFinalizados.filter((p) => p.id !== proceso.id)];
  for (const op of todos) {
    for (const step of op.steps) {
      if (step.eventoContableHabilitado) {
        for (const ec of step.eventosContables) {
          const prod = PRODUCTOS.find((p) => p.value === ec.productoId);
          rows.push({
            id: `${op.id}-${step.id}-${ec.id}`,
            operacion: op.nombre,
            operacionId: op.id,
            estado: step.nombre,
            origen: "estado",
            productoId: ec.productoId,
            productoLabel: prod?.label ?? ec.productoId,
            cuentaIngreso: ec.cuentaIngreso,
            cuentaEgreso: ec.cuentaEgreso,
          });
        }
      }
      for (const ex of step.excepciones) {
        if (ex.eventoContableHabilitado) {
          for (const ec of ex.eventosContables) {
            const prod = PRODUCTOS.find((p) => p.value === ec.productoId);
            rows.push({
              id: `${op.id}-${step.id}-${ex.id}-${ec.id}`,
              operacion: op.nombre,
              operacionId: op.id,
              estado: `${step.nombre} / ${ex.nombre}`,
              origen: "excepcion",
              productoId: ec.productoId,
              productoLabel: prod?.label ?? ec.productoId,
              cuentaIngreso: ec.cuentaIngreso,
              cuentaEgreso: ec.cuentaEgreso,
            });
          }
        }
      }
    }
  }
  return rows;
}

function EventosContablesTab() {
  const store = useTransaccionesStore();
  const { updateEventoContable, updateEventoContableEnExcepcion } = store;
  const cuentas = CUENTAS_MOCK;

  const [filtroOperacion, setFiltroOperacion] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroCuenta, setFiltroCuenta] = useState("");

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [massField, setMassField] = useState<"cuentaIngreso" | "cuentaEgreso" | null>(null);

  const eventos = useMemo(() => getEventosConfigurados(store.proceso, store.procesosFinalizados), [store.proceso, store.procesosFinalizados]);

  const operaciones = [...new Set(eventos.map((e) => e.operacion))];
  const estados = [...new Set(eventos.map((e) => e.estado))];

  const eventosFiltrados = eventos.filter((e) =>
    (!filtroOperacion || e.operacion === filtroOperacion) &&
    (!filtroEstado || e.estado === filtroEstado) &&
    (!filtroCuenta || e.cuentaIngreso.includes(filtroCuenta) || e.cuentaEgreso.includes(filtroCuenta))
  );

  const eventosVisibles = eventosFiltrados;

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (eventosVisibles.every((e) => selectedIds.has(e.id))) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(eventosVisibles.map((e) => e.id)));
    }
  }

  function commitMassUpdate() {
    if (!massField) return;
    const newValue = massField === "cuentaIngreso" ? (document.getElementById("mass-select-cuenta") as HTMLSelectElement)?.value : (document.getElementById("mass-select-cuenta") as HTMLSelectElement)?.value;
    if (!newValue) return;
    for (const id of selectedIds) {
      const row = eventos.find((e) => e.id === id);
      if (!row) continue;
      const parts = id.split("-");
      const origen = row.origen;
      let stepId: string | undefined;
      let exId: string | undefined;
      if (origen === "excepcion") {
        stepId = parts[1];
        exId = parts[2];
      } else {
        stepId = parts[1];
      }
      if (!stepId) continue;
      const ecId = origen === "excepcion" ? parts.slice(3).join("-") : parts.slice(2).join("-");
      if (origen === "excepcion" && exId) {
        updateEventoContableEnExcepcion(stepId, exId, ecId, { [massField]: newValue });
      } else {
        updateEventoContable(stepId, ecId, { [massField]: newValue });
      }
    }
    setMassField(null);
    setSelectedIds(new Set());
  }

  function updateSingleRow(row: EventoContableRow, field: "cuentaIngreso" | "cuentaEgreso", value: string) {
    const parts = row.id.split("-");
    let stepId: string | undefined;
    let exId: string | undefined;
    if (row.origen === "excepcion") {
      stepId = parts[1];
      exId = parts[2];
    } else {
      stepId = parts[1];
    }
    if (!stepId) return;
    const ecId = row.origen === "excepcion" ? parts.slice(3).join("-") : parts.slice(2).join("-");
    if (row.origen === "excepcion" && exId) {
      updateEventoContableEnExcepcion(stepId, exId, ecId, { [field]: value });
    } else {
      updateEventoContable(stepId, ecId, { [field]: value });
    }
  }

  return (
    <div className="flex-1 flex gap-4 min-h-0">
      <div className="flex-1 bg-white border border-[var(--color-neutro-200)] rounded-corner-m shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex flex-col min-h-0">
        {/* Header + Filters */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-neutro-200)]">
          <p className="text-[12px] font-semibold text-[var(--color-neutro-600)] uppercase tracking-wide shrink-0">
            Eventos Contables
          </p>
          <select
            value={filtroOperacion}
            onChange={(e) => setFiltroOperacion(e.target.value)}
            className="text-[12px] px-2.5 py-1.5 rounded-corner-m border border-[var(--color-neutro-200)] outline-none focus:border-[var(--color-verde-100)] bg-white"
          >
            <option value="">Todas las ops.</option>
            {operaciones.map((op) => (
              <option key={op} value={op}>{op}</option>
            ))}
          </select>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="text-[12px] px-2.5 py-1.5 rounded-corner-m border border-[var(--color-neutro-200)] outline-none focus:border-[var(--color-verde-100)] bg-white"
          >
            <option value="">Todos los estados</option>
            {estados.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
          <input
            placeholder="Buscar cuenta..."
            value={filtroCuenta}
            onChange={(e) => setFiltroCuenta(e.target.value)}
            className="text-[12px] px-2.5 py-1.5 rounded-corner-m border border-[var(--color-neutro-200)] outline-none focus:border-[var(--color-verde-100)] bg-white w-[180px]"
          />
        </div>

        {/* Mass update banner */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 border-b border-blue-200">
            <CheckCircle size={14} className="text-blue-600" />
            <span className="text-[12px] text-blue-700 font-medium">
              {selectedIds.size} evento{selectedIds.size > 1 ? "s" : ""} seleccionado{selectedIds.size > 1 ? "s" : ""}
            </span>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-[11px] text-blue-600 font-medium">Cambiar:</span>
              <button
                onClick={() => setMassField("cuentaIngreso")}
                className={`text-[11px] px-2 py-1 rounded-corner-m border font-medium transition-colors ${massField === "cuentaIngreso" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-blue-600 border-blue-300 hover:bg-blue-100"}`}
              >
                Cuenta Ingreso
              </button>
              <button
                onClick={() => setMassField("cuentaEgreso")}
                className={`text-[11px] px-2 py-1 rounded-corner-m border font-medium transition-colors ${massField === "cuentaEgreso" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-blue-600 border-blue-300 hover:bg-blue-100"}`}
              >
                Cuenta Egreso
              </button>
              {massField && (
                <div className="flex items-center gap-2">
                  <select
                    id="mass-select-cuenta"
                    className="text-[12px] px-2 py-1.5 rounded-corner-m border border-[var(--color-neutro-200)] outline-none focus:border-blue-400 bg-white"
                  >
                    <option value="">Seleccionar cuenta...</option>
                    {cuentas.map((c) => (
                      <option key={c.id} value={c.codigo}>{c.codigo} — {c.nombre}</option>
                    ))}
                  </select>
                  <button
                    onClick={commitMassUpdate}
                    className="text-[11px] px-3 py-1.5 rounded-corner-m bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
                  >
                    Aplicar
                  </button>
                  <button
                    onClick={() => setMassField(null)}
                    className="text-[11px] px-2 py-1.5 rounded-corner-m text-[var(--color-neutro-500)] hover:text-[var(--color-neutro-700)]"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Table */}
        <div className="flex-1 overflow-y-auto p-4">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[var(--color-neutro-200)]">
                <th className="w-[36px] px-2 py-2">
                  <input
                    type="checkbox"
                    checked={eventosVisibles.length > 0 && eventosVisibles.every((e) => selectedIds.has(e.id))}
                    onChange={toggleSelectAll}
                    className="accent-[var(--color-verde-100)]"
                  />
                </th>
                <th className="text-left px-3 py-2 text-[11px] font-bold text-[var(--color-neutro-500)] uppercase tracking-wide">Operación</th>
                <th className="text-left px-3 py-2 text-[11px] font-bold text-[var(--color-neutro-500)] uppercase tracking-wide">Estado</th>
                <th className="text-left px-3 py-2 text-[11px] font-bold text-[var(--color-neutro-500)] uppercase tracking-wide">Producto</th>
                <th className="text-left px-3 py-2 text-[11px] font-bold text-[var(--color-neutro-500)] uppercase tracking-wide">Cuenta Ingreso</th>
                <th className="text-left px-3 py-2 text-[11px] font-bold text-[var(--color-neutro-500)] uppercase tracking-wide">Cuenta Egreso</th>
                <th className="text-center px-3 py-2 text-[11px] font-bold text-[var(--color-neutro-500)] uppercase tracking-wide">Origen</th>
              </tr>
            </thead>
            <tbody>
              {eventosVisibles.map((ev) => (
                <tr key={ev.id} className={`border-b border-[var(--color-neutro-100)] transition-colors ${selectedIds.has(ev.id) ? "bg-blue-50/60" : "hover:bg-[var(--color-neutro-50)]"}`}>
                  <td className="px-2 py-2.5 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(ev.id)}
                      onChange={() => toggleSelect(ev.id)}
                      className="accent-[var(--color-verde-100)]"
                    />
                  </td>
                  <td className="px-3 py-2.5 font-medium text-[var(--color-neutro-900)]">{ev.operacion}</td>
                  <td className="px-3 py-2.5 text-[var(--color-neutro-700)] text-[12px]">{ev.estado}</td>
                  <td className="px-3 py-2.5">
                    <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-corner-m bg-purple-100 text-purple-700">
                      {ev.productoLabel}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <select
                      value={ev.cuentaIngreso}
                      onChange={(e) => updateSingleRow(ev, "cuentaIngreso", e.target.value)}
                      className="text-[12px] px-1.5 py-0.5 rounded-corner-m border border-transparent focus:border-[var(--color-verde-100)] outline-none bg-transparent focus:bg-white font-mono cursor-pointer hover:border-[var(--color-neutro-200)]"
                    >
                      {cuentas.map((c) => (
                        <option key={c.id} value={c.codigo}>{c.codigo} — {c.nombre}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2.5">
                    <select
                      value={ev.cuentaEgreso}
                      onChange={(e) => updateSingleRow(ev, "cuentaEgreso", e.target.value)}
                      className="text-[12px] px-1.5 py-0.5 rounded-corner-m border border-transparent focus:border-[var(--color-verde-100)] outline-none bg-transparent focus:bg-white font-mono cursor-pointer hover:border-[var(--color-neutro-200)]"
                    >
                      {cuentas.map((c) => (
                        <option key={c.id} value={c.codigo}>{c.codigo} — {c.nombre}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-corner-m ${
                      ev.origen === "excepcion" ? "bg-amber-100 text-amber-700" : "bg-indigo-100 text-indigo-700"
                    }`}>
                      {ev.origen === "excepcion" ? "Excepción" : "Estado"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {eventosVisibles.length === 0 && (
            <div className="flex flex-col items-center justify-center h-[200px] text-center p-4">
              <FileText className="w-10 h-10 text-[var(--color-neutro-300)] mb-2" />
              <p className="text-[13px] text-[var(--color-neutro-400)]">
                No hay eventos contables configurados
              </p>
              <p className="text-[11px] text-[var(--color-neutro-400)] mt-1">
                Active "Habilitar Evento Contable" en las propiedades de un estado para verlos aquí
              </p>
            </div>
          )}
        </div>
        <div className="px-4 py-2 border-t border-[var(--color-neutro-200)] flex items-center justify-between">
          <p className="text-[11px] text-[var(--color-neutro-400)]">
            {eventosVisibles.length} de {eventos.length} eventos
          </p>
          <p className="text-[11px] text-[var(--color-neutro-400)] italic">
            Seleccione múltiples eventos para cambio masivo de cuentas
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Productos Tab ── */
function ProductosTab() {
  return (
    <div className="flex-1 bg-white border border-[var(--color-neutro-200)] rounded-corner-m shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex flex-col min-h-0">
      <div className="px-4 py-3 border-b border-[var(--color-neutro-200)]">
        <p className="text-[12px] font-semibold text-[var(--color-neutro-600)] uppercase tracking-wide">Productos</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-[var(--color-neutro-200)]">
              <th className="text-left px-3 py-2 text-[11px] font-bold text-[var(--color-neutro-500)] uppercase tracking-wide">Valor</th>
              <th className="text-left px-3 py-2 text-[11px] font-bold text-[var(--color-neutro-500)] uppercase tracking-wide">Nombre</th>
            </tr>
          </thead>
          <tbody>
            {PRODUCTOS.map((p) => (
              <tr key={p.value} className="border-b border-[var(--color-neutro-100)] hover:bg-[var(--color-neutro-50)] transition-colors">
                <td className="px-3 py-2.5 font-mono text-[12px] text-[var(--color-neutro-700)]">{p.value}</td>
                <td className="px-3 py-2.5 font-medium text-[var(--color-neutro-900)]">{p.label}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
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
              {step.inventario !== "ninguno" && (
                <>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-corner-m ${step.inventario === "debita" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                    {step.inventario === "debita" ? "-" : "+"}{step.unidadInventario === "emisora" ? " Emi" : step.unidadInventario === "receptora" ? " Rec" : ""}
                  </span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-corner-m bg-indigo-100 text-indigo-700">
                    EC
                  </span>
                </>
              )}
              {step.timeoutMinutos > 0 && (
                <span className="flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-corner-m bg-amber-100 text-amber-700">
                  <Clock className="w-3 h-3" />{step.timeoutMinutos}m
                </span>
              )}
              {step.camposSeleccionados.length > 0 && (
                <span className="flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-corner-m bg-purple-100 text-purple-700">
                  <FileText className="w-3 h-3" /> {step.camposSeleccionados.length}
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
                        {exc.inventario !== "ninguno" && (
                          <span className={`text-[9px] font-semibold px-1 py-0.5 rounded-corner-m ${exc.inventario === "debita" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                            {exc.inventario === "debita" ? "âˆ’" : "+"}{exc.unidadInventario === "emisora" ? " Emi" : exc.unidadInventario === "receptora" ? " Rec" : ""}
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

function PropertyInspector({ step, origenTipo, destinoTipo, readOnly = false, usaTransportista = false, productosPermitidos = [] }: { step: TransaccionStep; origenTipo: string | null; destinoTipo: string | null; readOnly?: boolean; usaTransportista?: boolean; productosPermitidos?: string[] }) {
  const { updateStepProperty, updateEventoContable, setEventoContableHabilitado, toggleServicioCategoriaEnStep } = useTransaccionesStore();
  const sid = step.id;

  const labelClass = "text-[12px] font-semibold text-[var(--color-neutro-600)] mb-1";
  const valueClass = "text-[13px] text-[var(--color-neutro-900)] py-1";

  const cuentas = CUENTAS_MOCK;

  return (
    <div className="p-3 space-y-3 overflow-y-auto flex-1 min-h-0" onClick={(e) => e.stopPropagation()}>

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
          <p className={labelClass}>Descuento de Inventario</p>
          {readOnly ? (
            <p className={valueClass}>
              {TIPOS_INVENTARIO.find((e) => e.value === step.inventario)?.label ?? step.inventario}
              {step.inventario !== "ninguno" && step.unidadInventario && (
                <span className="ml-1 text-[var(--color-neutro-500)]">— {UNIDADES_INVENTARIO.find((u) => u.value === step.unidadInventario)?.label ?? step.unidadInventario}</span>
              )}
            </p>
          ) : (
            <div className="space-y-1.5">
              <Select options={TIPOS_INVENTARIO} value={step.inventario} onChange={(v: string) => {
                updateStepProperty(sid, "inventario", v);
                if (v === "ninguno") updateStepProperty(sid, "unidadInventario", null);
                else if (v === "debita" && !step.unidadInventario) updateStepProperty(sid, "unidadInventario", "emisora");
                else if (v === "acredita" && !step.unidadInventario) updateStepProperty(sid, "unidadInventario", "receptora");
              }} />
              {step.inventario !== "ninguno" && (
                <Select options={UNIDADES_INVENTARIO} value={step.unidadInventario ?? ""} onChange={(v: string) => updateStepProperty(sid, "unidadInventario", v)} />
              )}
            </div>
          )}
        </div>

        <div>
          <p className={labelClass}>Evento Contable</p>
          {readOnly ? (
            <p className={valueClass}>
              {step.eventoContableHabilitado ? (
                <span className="text-indigo-700 font-medium">Habilitado ({step.eventosContables.length} producto{step.eventosContables.length !== 1 ? "s" : ""})</span>
              ) : "No habilitado"}
            </p>
          ) : (
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <Switch checked={step.eventoContableHabilitado} onChange={(v: boolean) => setEventoContableHabilitado(sid, v)} />
                <span className="text-[13px] text-[var(--color-neutro-700)]">Habilitar Evento Contable</span>
              </label>
              {step.eventoContableHabilitado && (
                <div className="space-y-2 mt-2">
                  {productosPermitidos.length === 0 && (
                    <p className="text-[11px] text-amber-600">Seleccione productos en la operación para configurar cuentas contables</p>
                  )}
                  {(step.eventosContables ?? []).map((ec) => {
                    const prod = PRODUCTOS.find((p) => p.value === ec.productoId);
                    return (
                      <div key={ec.id} className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m p-2.5 space-y-1.5">
                        <p className="text-[11px] font-semibold text-[var(--color-neutro-700)]">{prod?.label ?? ec.productoId}</p>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <p className="text-[10px] text-[var(--color-neutro-500)] mb-0.5">Cuenta Ingreso</p>
                            <select
                              value={ec.cuentaIngreso}
                              onChange={(e) => updateEventoContable(sid, ec.id, { cuentaIngreso: e.target.value })}
                              className="w-full text-[11px] px-2 py-1 rounded-corner-m border border-[var(--color-neutro-200)] outline-none focus:border-[var(--color-verde-100)] bg-white"
                            >
                              {cuentas.map((c) => (
                                <option key={c.id} value={c.codigo}>{c.codigo} — {c.nombre}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] text-[var(--color-neutro-500)] mb-0.5">Cuenta Egreso</p>
                            <select
                              value={ec.cuentaEgreso}
                              onChange={(e) => updateEventoContable(sid, ec.id, { cuentaEgreso: e.target.value })}
                              className="w-full text-[11px] px-2 py-1 rounded-corner-m border border-[var(--color-neutro-200)] outline-none focus:border-[var(--color-verde-100)] bg-white"
                            >
                              {cuentas.map((c) => (
                                <option key={c.id} value={c.codigo}>{c.codigo} — {c.nombre}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
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

        <div>
          <p className={labelClass}>Bloqueo de saldo y denominaciones</p>
          {readOnly ? (
            <p className={valueClass}>
              {step.bloqueoSaldo ? (
                <span className="flex items-center gap-1 text-amber-700">
                  <Lock className="w-3.5 h-3.5" />
                  Bloquea saldo al entrar — las excepciones que retrocedan deben desbloquear
                </span>
              ) : "Sin bloqueo de saldo"}
            </p>
          ) : (
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch checked={step.bloqueoSaldo} onChange={(v: boolean) => updateStepProperty(sid, "bloqueoSaldo", v)} />
              <span className="text-[13px] text-[var(--color-neutro-700)]">Bloquear saldo al entrar a este estado</span>
            </label>
          )}
          {step.bloqueoSaldo && (
            <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1">
              Las excepciones que retrocedan desde este estado deberán desbloquear el saldo
            </p>
          )}
        </div>

        <div>
          <p className={labelClass}>Estado terminal</p>
          {readOnly ? (
            <p className={valueClass}>
              {step.esTerminal ? (
                <span className="flex items-center gap-1 text-green-700">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Estado terminal — al llegar aquí la transacción finaliza
                </span>
              ) : "No es terminal"}
            </p>
          ) : (
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch checked={step.esTerminal ?? false} onChange={(v: boolean) => updateStepProperty(sid, "esTerminal", v)} />
              <span className="text-[13px] text-[var(--color-neutro-700)]">Convertir en estado terminal</span>
            </label>
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

        <CamposFormularioSection stepId={step.id} camposSeleccionados={step.camposSeleccionados} origenTipo={origenTipo} destinoTipo={destinoTipo} readOnly={readOnly} usaTransportista={usaTransportista} />
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
function ExceptionPropertyInspector({ exception, stepId, readOnly = false, steps, productosPermitidos = [] }: { exception: Excepcion; stepId: string; readOnly?: boolean; steps?: TransaccionStep[]; productosPermitidos?: string[] }) {
  const { updateExcepcionProperty, setExcepcionTerminal, setEventoContableHabilitadoEnExcepcion, updateEventoContableEnExcepcion } = useTransaccionesStore();
  const eid = exception.id;
  const labelClass = "text-[12px] font-semibold text-[var(--color-neutro-600)] mb-1";
  const valueClass = "text-[13px] text-[var(--color-neutro-900)] py-1";

  const cuentas = CUENTAS_MOCK;

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
    <div className="p-3 space-y-3 overflow-y-auto flex-1 min-h-0" onClick={(e) => e.stopPropagation()}>

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
          <p className={labelClass}>Descuento de Inventario</p>
          {readOnly ? (
            <p className={valueClass}>
              {TIPOS_INVENTARIO.find((e) => e.value === exception.inventario)?.label ?? exception.inventario}
              {exception.inventario !== "ninguno" && exception.unidadInventario && (
                <span className="ml-1 text-[var(--color-neutro-500)]">— {UNIDADES_INVENTARIO.find((u) => u.value === exception.unidadInventario)?.label ?? exception.unidadInventario}</span>
              )}
            </p>
          ) : (
            <div className="space-y-1.5">
              <Select options={TIPOS_INVENTARIO} value={exception.inventario} onChange={(v: string) => {
                updateExcepcionProperty(stepId, eid, "inventario", v);
                if (v === "ninguno") updateExcepcionProperty(stepId, eid, "unidadInventario", null);
                else if (v === "debita" && !exception.unidadInventario) updateExcepcionProperty(stepId, eid, "unidadInventario", "emisora");
                else if (v === "acredita" && !exception.unidadInventario) updateExcepcionProperty(stepId, eid, "unidadInventario", "receptora");
              }} />
              {exception.inventario !== "ninguno" && (
                <Select options={UNIDADES_INVENTARIO} value={exception.unidadInventario ?? ""} onChange={(v: string) => updateExcepcionProperty(stepId, eid, "unidadInventario", v)} />
              )}
            </div>
          )}
        </div>

        <div>
          <p className={labelClass}>Evento Contable</p>
          {readOnly ? (
            <p className={valueClass}>
              {exception.eventoContableHabilitado ? (
                <span className="text-indigo-700 font-medium">Habilitado ({exception.eventosContables.length} producto{exception.eventosContables.length !== 1 ? "s" : ""})</span>
              ) : "No habilitado"}
            </p>
          ) : (
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <Switch checked={exception.eventoContableHabilitado} onChange={(v: boolean) => setEventoContableHabilitadoEnExcepcion(stepId, eid, v)} />
                <span className="text-[13px] text-[var(--color-neutro-700)]">Habilitar Evento Contable</span>
              </label>
              {exception.eventoContableHabilitado && (
                <div className="space-y-2 mt-2">
                  {productosPermitidos.length === 0 && (
                    <p className="text-[11px] text-amber-600">Seleccione productos en la operación para configurar cuentas contables</p>
                  )}
                  {(exception.eventosContables ?? []).map((ec) => {
                    const prod = PRODUCTOS.find((p) => p.value === ec.productoId);
                    return (
                      <div key={ec.id} className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m p-2.5 space-y-1.5">
                        <p className="text-[11px] font-semibold text-[var(--color-neutro-700)]">{prod?.label ?? ec.productoId}</p>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <p className="text-[10px] text-[var(--color-neutro-500)] mb-0.5">Cuenta Ingreso</p>
                            <select
                              value={ec.cuentaIngreso}
                              onChange={(e) => updateEventoContableEnExcepcion(stepId, eid, ec.id, { cuentaIngreso: e.target.value })}
                              className="w-full text-[11px] px-2 py-1 rounded-corner-m border border-[var(--color-neutro-200)] outline-none focus:border-[var(--color-verde-100)] bg-white"
                            >
                              {cuentas.map((c) => (
                                <option key={c.id} value={c.codigo}>{c.codigo} — {c.nombre}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] text-[var(--color-neutro-500)] mb-0.5">Cuenta Egreso</p>
                            <select
                              value={ec.cuentaEgreso}
                              onChange={(e) => updateEventoContableEnExcepcion(stepId, eid, ec.id, { cuentaEgreso: e.target.value })}
                              className="w-full text-[11px] px-2 py-1 rounded-corner-m border border-[var(--color-neutro-200)] outline-none focus:border-[var(--color-verde-100)] bg-white"
                            >
                              {cuentas.map((c) => (
                                <option key={c.id} value={c.codigo}>{c.codigo} — {c.nombre}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
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
function CamposFormularioSection({ stepId, camposSeleccionados, origenTipo, destinoTipo, readOnly = false, usaTransportista = false }: { stepId: string; camposSeleccionados: string[]; origenTipo: string | null; destinoTipo: string | null; readOnly?: boolean; usaTransportista?: boolean }) {
  const { toggleCampoSeleccionado } = useTransaccionesStore();

  const tiposUnidad = [origenTipo, destinoTipo].filter((t): t is string => t !== null);
  if (usaTransportista && !tiposUnidad.includes("Camión")) tiposUnidad.push("Camión");
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
            <div key={campo.id} className={`flex items-center gap-2 py-1 px-1 rounded-corner-m ${readOnly ? "" : "hover:bg-green-50 cursor-pointer"}`} onClick={() => { if (!readOnly) toggleCampoSeleccionado(stepId, campo.id); }}>
              <Checkbox label="" checked disabled />
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
            <div key={campo.id} className={`flex items-center gap-2 py-1 px-1 rounded-corner-m ${readOnly ? "" : "hover:bg-[var(--color-neutro-50)] cursor-pointer"}`} onClick={() => { if (!readOnly) toggleCampoSeleccionado(stepId, campo.id); }}>
              <Checkbox label="" checked={false} disabled />
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

/* ── Group Dialog ── */
const GROUP_COLORS = ["#2563EB", "#7C3AED", "#DC2626", "#EA580C", "#D97706", "#65A30D", "#059669", "#0891B2", "#4F46E5", "#DB2777", "#78716C", "#A8A29E"];

function GroupDialog({ open, editGroupId, procesosFinalizados, gruposOperaciones, onAddGrupo, onUpdateGrupo, onRemoveGrupo, onMoveOperacion, onClose }: {
  open: boolean;
  editGroupId: string | null;
  procesosFinalizados: ProcesoTransaccional[];
  gruposOperaciones: GrupoOperacion[];
  onAddGrupo: (nombre: string, color: string) => void;
  onUpdateGrupo: (id: string, updates: Partial<Pick<GrupoOperacion, "nombre" | "color">>) => void;
  onRemoveGrupo: (id: string) => void;
  onMoveOperacion: (operacionId: string, fromGroupId: string | null, toGroupId: string | null, toIndex: number) => void;
  onClose: () => void;
}) {
  const [editId, setEditId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [editColor, setEditColor] = useState(GROUP_COLORS[0]);
  const [editOpIds, setEditOpIds] = useState<string[]>([]);

  useEffect(() => {
    if (!open) { setEditId(null); return; }
    if (editGroupId) {
      const g = gruposOperaciones.find((x) => x.id === editGroupId);
      if (g) { setEditId(g.id); setEditNombre(g.nombre); setEditColor(g.color); setEditOpIds([...g.operacionIds]); }
    }
  }, [open, editGroupId, gruposOperaciones]);

  function handleSave() {
    if (!editNombre.trim()) return;
    if (editId) {
      onUpdateGrupo(editId, { nombre: editNombre.trim(), color: editColor });
      // Sync operation assignments
      const current = gruposOperaciones.find((g) => g.id === editId);
      const oldIds = current?.operacionIds ?? [];
      const removed = oldIds.filter((id) => !editOpIds.includes(id));
      const added = editOpIds.filter((id) => !oldIds.includes(id));
      for (const opId of removed) onMoveOperacion(opId, editId, null, 0);
      for (const opId of added) onMoveOperacion(opId, null, editId, 999);
    } else {
      onAddGrupo(editNombre.trim(), editColor);
    }
    setEditId(null);
    setEditNombre("");
    setEditColor(GROUP_COLORS[0]);
    setEditOpIds([]);
  }

  function startEdit(id: string) {
    const g = gruposOperaciones.find((x) => x.id === id);
    if (g) { setEditId(id); setEditNombre(g.nombre); setEditColor(g.color); setEditOpIds([...g.operacionIds]); }
  }

  const unassignedOps = procesosFinalizados.filter(
    (p) => !gruposOperaciones.some((g) => g.operacionIds.includes(p.id))
  );

  return (
    <Modal open={open} onClose={onClose} title="Administrar Naturaleza" size="md">
      <div className="space-y-4">
        {/* Existing groups */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {gruposOperaciones.map((g) => {
            const isEditing = editId === g.id;
            return (
              <div key={g.id} className="border border-[var(--color-neutro-200)] rounded-corner-m overflow-hidden">
                {isEditing ? (
                  <div className="p-3 space-y-3">
                    <Input value={editNombre} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditNombre(e.target.value)} placeholder="Nombre del grupo" />
                    <div className="flex flex-wrap gap-1.5">
                      {GROUP_COLORS.map((c) => (
                        <button key={c}
                          className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${editColor === c ? "border-[var(--color-neutro-900)] scale-110" : "border-transparent"}`}
                          style={{ backgroundColor: c }}
                          onClick={() => setEditColor(c)}
                        />
                      ))}
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-[var(--color-neutro-500)] mb-1">Operaciones en este grupo</p>
                      <div className="space-y-1 max-h-[150px] overflow-y-auto">
                        {procesosFinalizados.filter((p) => editOpIds.includes(p.id)).map((p) => (
                          <label key={p.id} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-[var(--color-neutro-50)] cursor-pointer">
                            <Checkbox
                              checked={editOpIds.includes(p.id)}
                              onChange={() => setEditOpIds(editOpIds.filter((id) => id !== p.id))}
                            />
                            <span className="text-[13px]">{p.nombre}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    {unassignedOps.length > 0 && (
                      <div>
                        <p className="text-[11px] font-semibold text-[var(--color-neutro-500)] mb-1">Agregar operación</p>
                        <div className="space-y-1 max-h-[120px] overflow-y-auto">
                          {unassignedOps.map((p) => (
                            <label key={p.id} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-[var(--color-neutro-50)] cursor-pointer">
                              <Checkbox
                                checked={editOpIds.includes(p.id)}
                                onChange={() => setEditOpIds([...editOpIds, p.id])}
                              />
                              <span className="text-[13px]">{p.nombre}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex justify-end gap-2 pt-2">
                      <Button size="sm" variant="outline" onClick={() => { setEditId(null); setEditNombre(""); setEditColor(GROUP_COLORS[0]); setEditOpIds([]); }}>Cancelar</Button>
                      <Button size="sm" onClick={handleSave}>Guardar</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: g.color }} />
                    <span className="flex-1 text-[13px] font-medium text-[var(--color-neutro-900)]">{g.nombre}</span>
                    <span className="text-[11px] text-[var(--color-neutro-400)]">{g.operacionIds.length} ops</span>
                    <button className="p-1 rounded text-[var(--color-neutro-400)] hover:bg-[var(--color-neutro-100)] hover:text-blue-600 transition-colors cursor-pointer" title="Editar" onClick={() => startEdit(g.id)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1 rounded text-[var(--color-neutro-400)] hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer" title="Eliminar" onClick={() => { if (window.confirm(`¿Eliminar el grupo "${g.nombre}"? Las operaciones no se eliminarán.`)) { onRemoveGrupo(g.id); } }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {gruposOperaciones.length === 0 && (
            <p className="text-[13px] text-[var(--color-neutro-400)] text-center py-6">No hay naturalezas creadas</p>
          )}
        </div>

        {/* Add new group button */}
        {!editId && (
          <button
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-[var(--color-neutro-200)] rounded-corner-m text-[13px] font-medium text-[var(--color-neutro-500)] hover:border-[var(--color-verde-100)] hover:text-[var(--color-verde-100)] transition-colors cursor-pointer"
            onClick={() => { setEditId("__new"); setEditNombre(""); setEditColor(GROUP_COLORS[0]); setEditOpIds([]); }}
          >
            <Plus className="w-4 h-4" />
            Nueva Naturaleza
          </button>
        )}

        {/* New group form */}
        {editId === "__new" && (
          <div className="border border-[var(--color-neutro-200)] rounded-corner-m p-3 space-y-3">
            <Input value={editNombre} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditNombre(e.target.value)} placeholder="Nombre del grupo" autoFocus />
            <div className="flex flex-wrap gap-1.5">
              {GROUP_COLORS.map((c) => (
                <button key={c}
                  className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${editColor === c ? "border-[var(--color-neutro-900)] scale-110" : "border-transparent"}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setEditColor(c)}
                />
              ))}
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[var(--color-neutro-500)] mb-1">Asignar operaciones</p>
              <div className="space-y-1 max-h-[150px] overflow-y-auto">
                {procesosFinalizados.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-[var(--color-neutro-50)] cursor-pointer">
                    <Checkbox
                      checked={editOpIds.includes(p.id)}
                      onChange={() => setEditOpIds(editOpIds.includes(p.id) ? editOpIds.filter((id) => id !== p.id) : [...editOpIds, p.id])}
                    />
                    <span className="text-[13px]">{p.nombre}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={() => setEditId(null)}>Cancelar</Button>
              <Button size="sm" onClick={handleSave}>Crear Naturaleza</Button>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-[var(--color-neutro-200)]">
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
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

/* ── Contabilidad Tab ── */
interface CuentaContable {
  id: string;
  codigo: string;
  nombre: string;
  tipo: "deudora" | "acreedora" | "orden";
  descripcion: string;
}

const CUENTAS_MOCK: CuentaContable[] = [
  { id: "c1", codigo: "1.1.01.001", nombre: "Efectivo en Bóveda", tipo: "deudora", descripcion: "Disponibilidades en bóveda central" },
  { id: "c2", codigo: "1.1.01.002", nombre: "Efectivo en ATM", tipo: "deudora", descripcion: "Efectivo cargado en cajeros automáticos" },
  { id: "c3", codigo: "1.1.01.003", nombre: "Efectivo en Tránsito", tipo: "deudora", descripcion: "Remesas en tránsito entre agencias" },
  { id: "c4", codigo: "1.1.02.001", nombre: "Depósitos en Banco Central", tipo: "deudora", descripcion: "Depósitos de reserva en Banco Central" },
  { id: "c5", codigo: "1.2.01.001", nombre: "Inversiones en Valores", tipo: "deudora", descripcion: "Inversiones en títulos valores" },
  { id: "c6", codigo: "1.3.01.001", nombre: "Cuentas por Cobrar", tipo: "deudora", descripcion: "Operaciones por cobrar a clientes" },
  { id: "c7", codigo: "2.1.01.001", nombre: "Depósitos de Clientes", tipo: "acreedora", descripcion: "Obligaciones por depósitos recibidos" },
  { id: "c8", codigo: "2.1.01.002", nombre: "Remesas por Liquidar", tipo: "acreedora", descripcion: "Remesas pendientes de liquidación" },
  { id: "c9", codigo: "2.2.01.001", nombre: "Proveedores Varios", tipo: "acreedora", descripcion: "Obligaciones con proveedores" },
  { id: "c10", codigo: "3.1.01.001", nombre: "Capital Social", tipo: "acreedora", descripcion: "Capital suscrito y pagado" },
  { id: "c11", codigo: "4.1.01.001", nombre: "Ingresos por Comisiones", tipo: "acreedora", descripcion: "Comisiones cobradas por servicios" },
  { id: "c12", codigo: "4.1.02.001", nombre: "Diferencial Cambiario", tipo: "acreedora", descripcion: "Ganancia por diferencia en tipo de cambio" },
  { id: "c13", codigo: "5.1.01.001", nombre: "Gastos por Servicios", tipo: "deudora", descripcion: "Gastos operativos y de servicios" },
  { id: "c14", codigo: "5.1.02.001", nombre: "Pérdida Cambiaria", tipo: "deudora", descripcion: "Pérdida por diferencia en tipo de cambio" },
  { id: "c15", codigo: "5.2.01.001", nombre: "Gastos de Transporte", tipo: "deudora", descripcion: "Gastos por servicio de transporte de valores" },
  { id: "c16", codigo: "8.1.01.001", nombre: "Valores Custodiados (Deudora)", tipo: "orden", descripcion: "Control de valores recibidos en custodia" },
  { id: "c17", codigo: "8.1.01.002", nombre: "Valores Custodiados (Acreedora)", tipo: "orden", descripcion: "Contrapartida de valores en custodia" },
  { id: "c18", codigo: "8.2.01.001", nombre: "Garantías Recibidas (Deudora)", tipo: "orden", descripcion: "Garantías recibidas de clientes" },
  { id: "c19", codigo: "8.2.01.002", nombre: "Garantías Recibidas (Acreedora)", tipo: "orden", descripcion: "Contrapartida de garantías recibidas" },
  { id: "c20", codigo: "8.3.01.001", nombre: "Bienes en Comodato (Deudora)", tipo: "orden", descripcion: "Bienes recibidos en comodato" },
  { id: "c21", codigo: "8.3.01.002", nombre: "Bienes en Comodato (Acreedora)", tipo: "orden", descripcion: "Contrapartida de bienes en comodato" },
];

function ContabilidadTab() {
  const [cuentas, setCuentas] = useState<CuentaContable[]>(CUENTAS_MOCK);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<CuentaContable>({ id: "", codigo: "", nombre: "", tipo: "deudora", descripcion: "" });
  const [showForm, setShowForm] = useState(false);
  const cuentasFiltradas = cuentas;

  function handleSave() {
    if (!form.codigo || !form.nombre) return;
    if (editId) {
      setCuentas(cuentas.map((c) => c.id === editId ? { ...form, id: editId } : c));
    } else {
      setCuentas([...cuentas, { ...form, id: `c${Date.now()}` }]);
    }
    setForm({ id: "", codigo: "", nombre: "", tipo: "deudora", descripcion: "" });
    setEditId(null);
    setShowForm(false);
  }

  function handleEdit(c: CuentaContable) {
    setForm(c);
    setEditId(c.id);
    setShowForm(true);
  }

  function handleDelete(id: string) {
    setCuentas(cuentas.filter((c) => c.id !== id));
  }

  const labelClass = "text-[12px] font-semibold text-[var(--color-neutro-600)] mb-1";

  const badgeClass = (tipo: string) => {
    if (tipo === "deudora") return "bg-red-100 text-red-700";
    if (tipo === "acreedora") return "bg-green-100 text-green-700";
    return "bg-purple-100 text-purple-700";
  };

  return (
    <div className="flex-1 flex gap-4 min-h-0">
      <div className="flex-1 bg-white border border-[var(--color-neutro-200)] rounded-corner-m shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex flex-col min-h-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-neutro-200)]">
          <p className="text-[12px] font-semibold text-[var(--color-neutro-600)] uppercase tracking-wide">Catálogo de Cuentas Contables</p>
          <Button size="sm" iconLeft={<Plus className="w-4 h-4" />} onClick={() => { setShowForm(true); setEditId(null); setForm({ id: "", codigo: "", nombre: "", tipo: "deudora", descripcion: "" }); }}>
            Agregar Cuenta
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[var(--color-neutro-200)]">
                <th className="text-left px-3 py-2 text-[11px] font-bold text-[var(--color-neutro-500)] uppercase tracking-wide">Código</th>
                <th className="text-left px-3 py-2 text-[11px] font-bold text-[var(--color-neutro-500)] uppercase tracking-wide">Nombre</th>
                <th className="text-left px-3 py-2 text-[11px] font-bold text-[var(--color-neutro-500)] uppercase tracking-wide">Tipo</th>
                <th className="text-left px-3 py-2 text-[11px] font-bold text-[var(--color-neutro-500)] uppercase tracking-wide">Descripción</th>
                <th className="w-20 px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {cuentasFiltradas.map((c) => (
                <tr key={c.id} className="border-b border-[var(--color-neutro-100)] hover:bg-[var(--color-neutro-50)] transition-colors">
                  <td className="px-3 py-2.5 font-mono text-[12px] text-[var(--color-neutro-700)]">{c.codigo}</td>
                  <td className="px-3 py-2.5 font-medium text-[var(--color-neutro-900)]">{c.nombre}</td>
                  <td className="px-3 py-2.5">
                    <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-corner-m ${badgeClass(c.tipo)}`}>
                      {c.tipo === "deudora" ? "Deudora" : c.tipo === "acreedora" ? "Acreedora" : "Orden"}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-[var(--color-neutro-500)]">{c.descripcion}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1">
                      <button className="p-1 rounded hover:bg-[var(--color-neutro-100)] text-[var(--color-neutro-400)] hover:text-blue-500 transition-colors cursor-pointer" title="Editar" onClick={() => handleEdit(c)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1 rounded hover:bg-red-50 text-[var(--color-neutro-400)] hover:text-red-500 transition-colors cursor-pointer" title="Eliminar" onClick={() => handleDelete(c.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {cuentasFiltradas.length === 0 && (
            <div className="flex flex-col items-center justify-center h-[200px] text-center p-4">
              <p className="text-[13px] text-[var(--color-neutro-400)]">No hay cuentas contables registradas</p>
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div className="w-[380px] shrink-0 bg-white border border-[var(--color-neutro-200)] rounded-corner-m shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex flex-col min-h-0">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--color-neutro-200)]">
            <p className="flex-1 text-[12px] font-semibold text-[var(--color-neutro-600)] uppercase tracking-wide">
              {editId ? "Editar Cuenta" : "Nueva Cuenta"}
            </p>
            <button className="p-1 rounded hover:bg-[var(--color-neutro-100)] text-[var(--color-neutro-400)] hover:text-[var(--color-neutro-600)] transition-colors cursor-pointer" onClick={() => { setShowForm(false); setEditId(null); }}>
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 space-y-4 overflow-y-auto flex-1">
            <div>
              <p className={labelClass}>Código</p>
              <input value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                className="w-full text-[13px] px-2.5 py-1.5 rounded-corner-m border border-[var(--color-neutro-200)] outline-none focus:border-[var(--color-verde-100)] bg-white font-mono"
                placeholder="Ej: 1.1.01.001" />
            </div>
            <div>
              <p className={labelClass}>Nombre</p>
              <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="w-full text-[13px] px-2.5 py-1.5 rounded-corner-m border border-[var(--color-neutro-200)] outline-none focus:border-[var(--color-verde-100)] bg-white"
                placeholder="Nombre de la cuenta" />
            </div>
            <div>
              <p className={labelClass}>Tipo</p>
              <div className="flex gap-2">
                <button className={`flex-1 px-3 py-1.5 rounded-corner-m text-[13px] font-medium border transition-colors cursor-pointer ${form.tipo === "deudora" ? "bg-red-100 text-red-700 border-red-200" : "bg-white text-[var(--color-neutro-600)] border-[var(--color-neutro-200)]"}`}
                  onClick={() => setForm({ ...form, tipo: "deudora" })}>
                  Deudora
                </button>
                <button className={`flex-1 px-3 py-1.5 rounded-corner-m text-[13px] font-medium border transition-colors cursor-pointer ${form.tipo === "acreedora" ? "bg-green-100 text-green-700 border-green-200" : "bg-white text-[var(--color-neutro-600)] border-[var(--color-neutro-200)]"}`}
                  onClick={() => setForm({ ...form, tipo: "acreedora" })}>
                  Acreedora
                </button>
                <button className={`flex-1 px-3 py-1.5 rounded-corner-m text-[13px] font-medium border transition-colors cursor-pointer ${form.tipo === "orden" ? "bg-purple-100 text-purple-700 border-purple-200" : "bg-white text-[var(--color-neutro-600)] border-[var(--color-neutro-200)]"}`}
                  onClick={() => setForm({ ...form, tipo: "orden" })}>
                  Orden
                </button>
              </div>
            </div>
            <div>
              <p className={labelClass}>Descripción</p>
              <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                className="w-full text-[13px] px-2.5 py-1.5 rounded-corner-m border border-[var(--color-neutro-200)] outline-none focus:border-[var(--color-verde-100)] bg-white resize-none"
                rows={3} placeholder="Descripción opcional" />
            </div>
          </div>
          <div className="p-4 border-t border-[var(--color-neutro-200)]">
            <Button className="w-full !justify-center !bg-[var(--color-verde-100)] !text-white" size="sm" onClick={handleSave}>
              {editId ? "Guardar Cambios" : "Agregar Cuenta"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
