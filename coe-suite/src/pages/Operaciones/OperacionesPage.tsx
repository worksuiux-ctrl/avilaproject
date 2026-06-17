import { useState, useMemo, useEffect } from "react";
import type React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, CheckCircle, Circle, AlertTriangle, OctagonX, Clock, ArrowRight, ChevronDown, ChevronRight, FileText, Plus, Package, FolderOpen, LayoutGrid, List, Calendar, CheckCheck } from "lucide-react";
import { Button, Badge, Select, Input } from "@coe/design-system";
import { Modal } from "@components/ui/Modal";
import { SearchableSelect } from "@components/ui/SearchableSelect";
import { useTransaccionesStore, CAMPOS_PREDEFINIDOS, PERFILES_RESPONSABLE, EVENTOS_CONTABLES, TIPOS_APROBACION, TIPOS_UNIDAD, type ProcesoTransaccional, type TransaccionStep } from "@stores/transaccionesStore";
import { useInstanciasStore, type TransaccionInstancia } from "@stores/instanciasStore";
import { useEntitiesStore } from "@stores/entitiesStore";
import { useDivisasStore } from "@stores/divisasStore";
import { useProveedoresStore } from "@stores/proveedoresStore";
import { DenominationInput } from "./DenominationInput";
import { EnvasesInput, type ClasificacionBatch } from "./EnvasesInput";

export function OperacionesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { procesosFinalizados } = useTransaccionesStore();
  const inst = useInstanciasStore();

  const [createOpen, setCreateOpen] = useState(false);
  const [selTemplateId, setSelTemplateId] = useState<string | null>(null);
  const [editInstId, setEditInstId] = useState<string | null>(null);
  const [detailInst, setDetailInst] = useState<TransaccionInstancia | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [successOverlay, setSuccessOverlay] = useState("");

  useEffect(() => {
    const state = location.state as { newOpId?: string } | null;
    if (state?.newOpId) {
      setSelTemplateId(state.newOpId);
      setCreateOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const tabs = useMemo(() => {
    const ids = new Set<string>();
    for (const i of inst.instancias) ids.add(i.templateId);
    return procesosFinalizados.filter((p) => ids.has(p.id));
  }, [inst.instancias, procesosFinalizados]);

  const filtered = useMemo(() => {
    let list = inst.instancias;
    if (activeTab === "finalizadas") {
      list = list.filter((i) => {
        const a = i.historial[i.historial.length - 1];
        return a?.accion === "completada" || a?.accion === "excepcion";
      });
    } else if (activeTab !== "all") {
      list = list.filter((i) => i.templateId === activeTab);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const entities = useEntitiesStore.getState().entities;
      const entName = (id: string) => entities.find((e) => e.id === id)?.nombre?.toLowerCase() ?? "";
      list = list.filter((i) => {
        const template = procesosFinalizados.find((p) => p.id === i.templateId);
        const stateName = template?.steps.find((s) => s.id === i.estadoActual)?.nombre?.toLowerCase() ?? "";
        return i.nombre.toLowerCase().includes(q)
          || i.codigoRemesa?.toLowerCase().includes(q)
          || i.codigoEnvio?.toLowerCase().includes(q)
          || entName(i.origenId).includes(q)
          || entName(i.destinoId).includes(q)
          || stateName.includes(q)
          || i.createdAt.toLowerCase().includes(q)
          || String(i.monto ?? "").includes(q);
      });
    }
    if (dateFrom) {
      const from = new Date(dateFrom);
      list = list.filter((i) => new Date(i.createdAt) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      list = list.filter((i) => new Date(i.createdAt) <= to);
    }
    return list;
  }, [inst.instancias, activeTab, searchQuery, dateFrom, dateTo]);

  const groups = useMemo(() => {
    const map: Record<string, TransaccionInstancia[]> = {};
    for (const i of filtered) {
      const key = i.estadoActual;
      if (!map[key]) map[key] = [];
      map[key].push(i);
    }
    return map;
  }, [filtered]);

  const templateName = (tid: string) => procesosFinalizados.find((p) => p.id === tid)?.nombre ?? tid;

  return (
    <div className="p-6 h-full flex flex-col">
      {successOverlay && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40">
          <div className="bg-[var(--color-verde-100)] border border-white rounded-2xl shadow-2xl px-12 py-10 text-center">
            <p className="text-[32px] font-bold text-white">{successOverlay}</p>
          </div>
        </div>
      )}
      <div className="flex items-start justify-between mb-1">
        <div>
          <h1 className="text-[18px] font-bold text-[var(--color-neutro-900)]">Panel de Operaciones</h1>
          <p className="text-[13px] text-[var(--color-neutro-500)]">{inst.instancias.length} transacciones activas</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-2 py-1 text-[10px] font-mono text-red-500 border border-red-200 rounded-corner-m hover:bg-red-50 cursor-pointer" title="Limpiar instancias y recargar" onClick={() => { localStorage.removeItem("instancias-store"); location.reload(); }}>
            🗑 Reset
          </button>
          <div className="flex items-center border border-[var(--color-neutro-200)] rounded-corner-m overflow-hidden">
            <button
              className={`p-1.5 cursor-pointer transition-colors ${viewMode === "cards" ? "bg-[var(--color-verde-100)] text-white" : "text-[var(--color-neutro-400)] hover:bg-[var(--color-neutro-100)]"}`}
              onClick={() => setViewMode("cards")}
              title="Vista de tarjetas"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              className={`p-1.5 cursor-pointer transition-colors ${viewMode === "table" ? "bg-[var(--color-verde-100)] text-white" : "text-[var(--color-neutro-400)] hover:bg-[var(--color-neutro-100)]"}`}
              onClick={() => setViewMode("table")}
              title="Vista de tabla"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <Button iconLeft={<Plus className="w-4 h-4" />} onClick={() => { setSelTemplateId(null); setCreateOpen(true); }}>
            Nueva Transacción
          </Button>
        </div>
      </div>

      {/* Search + Date filter */}
      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-neutro-400)]" />
          <input
            className="w-full text-[12px] pl-7 pr-2.5 py-1.5 rounded-corner-m border border-[var(--color-neutro-200)] outline-none focus:border-[var(--color-verde-100)] bg-white"
            placeholder="Buscar transacciones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="relative">
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] rounded-corner-m border border-[var(--color-neutro-200)] bg-white hover:border-[var(--color-verde-100)] transition-colors cursor-pointer"
            onClick={() => setDatePickerOpen(!datePickerOpen)}
          >
            <Calendar className="w-3.5 h-3.5 text-[var(--color-neutro-400)]" />
            <span className="text-[var(--color-neutro-600)]">
              {dateFrom && dateTo
                ? `${new Date(dateFrom).toLocaleDateString()} → ${new Date(dateTo).toLocaleDateString()}`
                : "Rango de fechas"}
            </span>
          </button>
          {datePickerOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDatePickerOpen(false)} />
              <div className="absolute top-full mt-1 right-0 z-50 bg-white border border-[var(--color-neutro-200)] rounded-corner-m shadow-lg p-3">
                <div className="flex gap-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold text-[var(--color-neutro-500)] uppercase">Desde</span>
                    <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); if (dateTo) setDatePickerOpen(false); }}
                      className="text-[12px] px-2 py-1.5 rounded-corner-m border border-[var(--color-neutro-200)] outline-none focus:border-[var(--color-verde-100)]" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold text-[var(--color-neutro-500)] uppercase">Hasta</span>
                    <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); if (dateFrom) setDatePickerOpen(false); }}
                      className="text-[12px] px-2 py-1.5 rounded-corner-m border border-[var(--color-neutro-200)] outline-none focus:border-[var(--color-verde-100)]" />
                  </div>
                </div>
                {(dateFrom || dateTo) && (
                  <button className="mt-2 w-full text-[11px] text-red-500 hover:text-red-700 text-center cursor-pointer" onClick={() => { setDateFrom(""); setDateTo(""); setDatePickerOpen(false); }}>
                    Limpiar
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 mb-4 overflow-x-auto">
        <div className="flex items-center gap-1">
          <button
            className={`px-3 py-1.5 text-[12px] font-medium rounded-corner-m transition-colors cursor-pointer ${activeTab === "all" ? "bg-[var(--color-verde-100)] text-white" : "text-[var(--color-neutro-600)] hover:bg-[var(--color-neutro-100)]"}`}
            onClick={() => setActiveTab("all")}
          >
            Todas ({inst.instancias.length})
          </button>
          <button
            className={`px-3 py-1.5 text-[12px] font-medium rounded-corner-m transition-colors cursor-pointer ${activeTab === "finalizadas" ? "bg-[var(--color-verde-100)] text-white" : "text-[var(--color-neutro-600)] hover:bg-[var(--color-neutro-100)]"}`}
            onClick={() => setActiveTab("finalizadas")}
          >
            Finalizadas ({inst.instancias.filter((i) => { const a = i.historial[i.historial.length - 1]; return a?.accion === "completada" || a?.accion === "excepcion"; }).length})
          </button>
          {tabs.map((t) => {
            const count = inst.instancias.filter((i) => i.templateId === t.id).length;
            return (
              <button key={t.id}
                className={`px-3 py-1.5 text-[12px] font-medium rounded-corner-m transition-colors cursor-pointer whitespace-nowrap ${activeTab === t.id ? "bg-[var(--color-verde-100)] text-white" : "text-[var(--color-neutro-600)] hover:bg-[var(--color-neutro-100)]"}`}
                onClick={() => setActiveTab(t.id)}
              >
                {t.nombre} ({count})
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6">
        {Object.keys(groups).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-corner-m bg-[var(--color-neutro-100)] flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-[var(--color-neutro-300)]" />
            </div>
            <h3 className="text-[16px] font-bold text-[var(--color-neutro-900)] mb-1">No hay transacciones activas</h3>
            <p className="text-[13px] text-[var(--color-neutro-500)] mb-4 max-w-md">Cree una nueva transacción para comenzar</p>
            <Button iconLeft={<Plus className="w-4 h-4" />} onClick={() => { setSelTemplateId(null); setCreateOpen(true); }}>
              Nueva Transacción
            </Button>
          </div>
        ) : viewMode === "table" ? (
          <ListaTabla
            filtered={filtered}
            grupos={groups}
            procesosFinalizados={procesosFinalizados}
            templateName={templateName}
            onSelect={(inst) => setDetailInst(inst)}
          />
        ) : activeTab !== "all" && activeTab !== "finalizadas" ? (
          <KanbanBoard
            template={procesosFinalizados.find((p) => p.id === activeTab)!}
            instances={filtered}
            onSelect={(inst) => setDetailInst(inst)}
            onAdvanceNoData={(instId, stepId, stepName) => {
              inst.avanzarEstado(instId, stepId, stepName, "agencia", {}, false);
              setSuccessOverlay(`Avanzada → ${stepName}`);
              setTimeout(() => setSuccessOverlay(""), 2000);
            }}
            inst={inst}
          />
        ) : (
          Object.entries(groups).map(([estadoId, lista]) => {
            const step = lista[0] && procesosFinalizados
              .find((p) => p.id === lista[0].templateId)
              ?.steps.find((s) => s.id === estadoId);
            const stateName = step?.nombre ?? estadoId;
            return (
              <div key={estadoId}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    lista.some((i) => i.historial.some((h) => h.accion === "completada")) ? "bg-green-400" :
                    lista.some((i) => i.historial.some((h) => h.accion === "excepcion")) ? "bg-red-400" :
                    "bg-blue-400"
                  }`} />
                  <h2 className="text-[14px] font-bold text-[var(--color-neutro-900)]">{stateName}</h2>
                  <span className="text-[12px] text-[var(--color-neutro-400)]">({lista.length})</span>
                </div>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3">
                  {lista.map((instancia) => (
                    <InstanciaCard
                      key={instancia.id}
                      instancia={instancia}
                      templateName={templateName(instancia.templateId)}
                      parentSubtipo={procesosFinalizados.find((p) => p.id === instancia.templateId)?.origenTipo}
                      onClick={() => setDetailInst(instancia)}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Creation / Edit modal */}
      <Modal open={createOpen} onClose={() => { setCreateOpen(false); setEditInstId(null); }} size="xl">
        <CreateFlow
          templates={procesosFinalizados}
          selectedId={selTemplateId}
          editInstId={editInstId}
          onSelectTemplate={setSelTemplateId}
          onComplete={(instancia) => { setCreateOpen(false); setSelTemplateId(null); setEditInstId(null); inst.selectInstancia(instancia.id); }}
          onCancel={() => { setCreateOpen(false); setEditInstId(null); }}
        />
      </Modal>

      {/* Detail modal */}
      <Modal open={!!detailInst} onClose={() => setDetailInst(null)} size="xl" title={detailInst?.nombre ?? ""}>
        {detailInst && (
          <InstanciaDetailContent
            instancia={detailInst}
            templates={procesosFinalizados}
            onClose={() => setDetailInst(null)}
            onStateChange={(label) => { setSuccessOverlay(label); setTimeout(() => setSuccessOverlay(""), 2000); }}
            onEdit={(instId) => {
              const found = inst.instancias.find((i) => i.id === instId);
              if (found) {
                setEditInstId(instId);
                setSelTemplateId(found.templateId);
                setDetailInst(null);
                setCreateOpen(true);
              }
            }}
          />
        )}
      </Modal>
    </div>
  );
}

/* ── Kanban Board ── */
function KanbanBoard({ template, instances, onSelect, onAdvanceNoData, inst }: {
  template: ProcesoTransaccional;
  instances: TransaccionInstancia[];
  onSelect: (inst: TransaccionInstancia) => void;
  onAdvanceNoData: (instId: string, stepId: string, stepName: string) => void;
  inst: ReturnType<typeof useInstanciasStore>;
}) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [confirmReverse, setConfirmReverse] = useState<{ inst: TransaccionInstancia; step: TransaccionStep } | null>(null);
  const stepsSorted = [...template.steps].sort((a, b) => a.orden - b.orden);

  const instsByStep = useMemo(() => {
    const map: Record<string, TransaccionInstancia[]> = {};
    for (const s of template.steps) map[s.id] = [];
    for (const i of instances) {
      if (map[i.estadoActual]) map[i.estadoActual].push(i);
    }
    return map;
  }, [instances, template.id]);

  function needsData(step: TransaccionStep): boolean {
    return step.requiereVariables || (step.camposSeleccionados?.length ?? 0) > 0;
  }

  function handleDrop(targetStepId: string) {
    if (!dragId) return;
    const draggedInst = instances.find((i) => i.id === dragId);
    if (!draggedInst) return;
    const targetStep = template.steps.find((s) => s.id === targetStepId);
    if (!targetStep) return;
    if (draggedInst.estadoActual === targetStepId) return;
    const currentIdx = stepsSorted.findIndex((s) => s.id === draggedInst.estadoActual);
    const targetIdx = stepsSorted.findIndex((s) => s.id === targetStepId);
    if (targetIdx === currentIdx + 1) {
      if (needsData(targetStep)) {
        onSelect(draggedInst);
      } else {
        onAdvanceNoData(draggedInst.id, targetStepId, targetStep.nombre);
      }
    } else if (targetIdx === currentIdx - 1) {
      handleReverse(draggedInst);
    }
    setDragId(null);
  }

  function handleReverse(instancia: TransaccionInstancia) {
    const idx = stepsSorted.findIndex((s) => s.id === instancia.estadoActual);
    if (idx <= 0) return;
    const prevStep = stepsSorted[idx - 1];
    setConfirmReverse({ inst: instancia, step: prevStep });
  }

  const isLastActionExcepcion = (instancia: TransaccionInstancia) => {
    const last = instancia.historial[instancia.historial.length - 1];
    return last?.accion === "excepcion";
  };

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[300px]" style={{ scrollbarWidth: "thin" }}>
        {stepsSorted.map((step) => {
          const list = instsByStep[step.id] ?? [];
          const draggedInst = dragId ? instances.find((i) => i.id === dragId) : null;
          const srcIdx = draggedInst ? stepsSorted.findIndex((s) => s.id === draggedInst.estadoActual) : -1;
          const tgtIdx = stepsSorted.findIndex((s) => s.id === step.id);
          const canDropNext = srcIdx >= 0 && tgtIdx === srcIdx + 1;
          const canDropPrev = srcIdx >= 0 && tgtIdx === srcIdx - 1;
          const isDroppable = dragId && (canDropNext || canDropPrev);
          return (
            <div key={step.id}
              className={`flex flex-col rounded-lg min-w-[260px] w-[280px] flex-shrink-0 border transition-colors ${!dragId ? "bg-[var(--color-neutro-50)] border-[var(--color-neutro-200)]" : isDroppable ? canDropNext ? "bg-green-50 border-green-300" : "bg-amber-50 border-amber-300" : "bg-[var(--color-neutro-50)/50] border-[var(--color-neutro-200)] opacity-50"}`}
              onDragOver={(e) => { if (isDroppable) e.preventDefault(); }}
              onDrop={(e) => { e.preventDefault(); if (isDroppable) handleDrop(step.id); }}
            >
              <div className="px-3 py-2.5 border-b border-[var(--color-neutro-200)] bg-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <p className="text-[12px] font-bold text-[var(--color-neutro-700)]">{step.nombre}</p>
                  <span className="text-[11px] font-semibold text-[var(--color-neutro-400)] bg-[var(--color-neutro-100)] px-2 py-0.5 rounded-full">{list.length}</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[80px]" style={{ maxHeight: "calc(100vh - 320px)" }}>
                {list.map((instancia) => {
                  const last = instancia.historial[instancia.historial.length - 1];
                  const isComplete = last?.accion === "completada";
                  const isException = last?.accion === "excepcion";
                  return (
                    <div key={instancia.id}
                      draggable={!isComplete && !isException}
                      onDragStart={() => setDragId(instancia.id)}
                      onDragEnd={() => setDragId(null)}
                      className={`bg-white border border-[var(--color-neutro-200)] rounded-lg p-3 shadow-sm cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md ${isComplete ? "opacity-60" : ""} ${dragId === instancia.id ? "opacity-40 ring-2 ring-[var(--color-verde-100)]" : ""}`}
                      onClick={() => { if (!isComplete && !isException) onSelect(instancia); }}
                    >
                      <div className="flex items-start justify-between gap-1 mb-1.5">
                        <p className="text-[12px] font-bold text-[var(--color-neutro-900)] leading-tight">{template.nombre}</p>
                        {isException && <OctagonX className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                        {isComplete && <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />}
                      </div>
                      {instancia.codigoRemesa && <p className="text-[10px] font-mono text-[var(--color-verde-100)] mb-1">{instancia.codigoRemesa}</p>}
                      <p className="text-[11px] text-[var(--color-neutro-500)]">{instancia.createdAt}</p>
                      {!isComplete && !isException && (
                        <div className="flex items-center gap-1 mt-2 pt-1.5 border-t border-[var(--color-neutro-100)]">
                          <button className="text-[10px] text-red-500 hover:text-red-700 hover:underline cursor-pointer" onClick={(e) => { e.stopPropagation(); handleReverse(instancia); }}>
                            Reversar
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
                {list.length === 0 && (
                  <div className="flex items-center justify-center h-16 text-[11px] text-[var(--color-neutro-400)] italic">Arrastre una tarjeta aquí</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Reverse confirmation */}
      <Modal open={!!confirmReverse} onClose={() => setConfirmReverse(null)} size="sm">
        <div className="space-y-3">
          <p className="text-[13px] text-[var(--color-neutro-700)]">
            ¿Está seguro de reversar <strong>{confirmReverse?.inst.nombre}</strong> al estado <strong>{confirmReverse?.step.nombre}</strong>?
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmReverse(null)}>Cancelar</Button>
            <Button onClick={() => {
              if (!confirmReverse) return;
              inst.reversarEstado(confirmReverse.inst.id, confirmReverse.step.id, confirmReverse.step.nombre);
              setConfirmReverse(null);
            }}>Confirmar Reversión</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

/* ── Instance Card ── */
function InstanciaCard({ instancia, templateName, onClick, parentSubtipo }: {
  instancia: TransaccionInstancia;
  templateName: string;
  onClick: () => void;
  parentSubtipo?: string | null;
}) {
  const entities = useEntitiesStore.getState().entities;
  const divisas = useDivisasStore.getState().divisas;
  const origen = getRootEntity(instancia.origenId, entities);
  const destino = getRootEntity(instancia.destinoId, entities);
  const origenLeaf = entities.find((e) => e.id === instancia.origenId);
  const destinoLeaf = entities.find((e) => e.id === instancia.destinoId);
  const origenParent = parentSubtipo ? findEntityInPath(instancia.origenId, entities, parentSubtipo) : null;
  const destinoParent = parentSubtipo ? findEntityInPath(instancia.destinoId, entities, parentSubtipo) : null;
  const origenPath = getEntityPath(instancia.origenId, entities);
  const destinoPath = getEntityPath(instancia.destinoId, entities);
  const divisa = divisas.find((d) => d.id === instancia.divisaId);
  const lastAction = instancia.historial[instancia.historial.length - 1];
  const isComplete = lastAction?.accion === "completada" || lastAction?.accion === "excepcion";
  return (
    <button
      className="w-full text-left bg-white border border-[var(--color-neutro-200)] rounded-corner-m p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:border-[var(--color-verde-100)] hover:shadow-md transition-all cursor-pointer flex flex-col gap-2.5"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-bold text-[var(--color-neutro-900)] truncate leading-tight">{templateName}</p>
          {instancia.codigoRemesa && <p className="text-[11px] font-mono text-[var(--color-verde-100)] mt-0.5">{instancia.codigoRemesa}</p>}
        </div>
        {isComplete ? (
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-corner-m text-[11px] font-semibold shrink-0 ${lastAction?.accion === "excepcion" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
            {lastAction?.accion === "excepcion" ? <OctagonX className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
            {lastAction?.accion === "excepcion" ? "Excepción" : "Completada"}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-corner-m bg-amber-50 text-amber-700 text-[11px] font-semibold shrink-0">
            <Clock className="w-3.5 h-3.5" /> Activa
          </div>
        )}
      </div>

      {origenParent && destinoParent ? (
        <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-neutro-900)]">
          <span className="min-w-0">{origenParent.nombre}</span>
          <ArrowRight className="w-3.5 h-3.5 text-[var(--color-verde-100)] shrink-0" />
          <span className="min-w-0">{destinoParent.nombre}</span>
        </div>
      ) : origenLeaf && destinoLeaf && (
        <div className="flex items-center gap-1.5 text-[12px] text-[var(--color-neutro-600)]">
          <span className="min-w-0">{origenLeaf.nombre}</span>
          <ArrowRight className="w-3 h-3 text-[var(--color-neutro-400)] shrink-0" />
          <span className="min-w-0">{destinoLeaf.nombre}</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 pt-0.5">
        <span className="text-[11px] text-[var(--color-neutro-400)]">{instancia.createdAt}</span>
        {divisa && (instancia.monto ?? 0) > 0 && (
          <span className="text-[15px] font-bold text-[var(--color-verde-100)]">{divisa.simbolo} {(instancia.monto ?? 0).toLocaleString()}</span>
        )}
      </div>
    </button>
  );
}

/* ── Table View ── */
function ListaTabla({ filtered, grupos, procesosFinalizados, templateName, onSelect }: {
  filtered: TransaccionInstancia[];
  grupos: Record<string, TransaccionInstancia[]>;
  procesosFinalizados: ProcesoTransaccional[];
  templateName: (tid: string) => string;
  onSelect: (inst: TransaccionInstancia) => void;
}) {
  const entities = useEntitiesStore.getState().entities;
  const divisas = useDivisasStore.getState().divisas;
  const sorted = [...filtered].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return (
    <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m overflow-hidden">
      <table className="w-full text-[12px]">
        <thead>
          <tr className="border-b border-[var(--color-neutro-200)] bg-[var(--color-neutro-50)]">
            <th className="text-left font-semibold text-[var(--color-neutro-600)] px-4 py-2.5">Operación</th>
            <th className="text-left font-semibold text-[var(--color-neutro-600)] px-4 py-2.5">Estado</th>
            <th className="text-left font-semibold text-[var(--color-neutro-600)] px-4 py-2.5">Origen</th>
            <th className="text-left font-semibold text-[var(--color-neutro-600)] px-4 py-2.5">Destino</th>
            <th className="text-left font-semibold text-[var(--color-neutro-600)] px-4 py-2.5">Divisa</th>
            <th className="text-right font-semibold text-[var(--color-neutro-600)] px-4 py-2.5">Monto</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((inst) => {
            const step = procesosFinalizados
              .find((p) => p.id === inst.templateId)
              ?.steps.find((s) => s.id === inst.estadoActual);
            const stateName = step?.nombre ?? inst.estadoActual;
            const lastAction = inst.historial[inst.historial.length - 1];
            const isComplete = lastAction?.accion === "completada";
            const isTerminated = lastAction?.accion === "excepcion";
            const origen = getRootEntity(inst.origenId, entities);
            const destino = getRootEntity(inst.destinoId, entities);
            const origenPath = getEntityPath(inst.origenId, entities);
            const destinoPath = getEntityPath(inst.destinoId, entities);
            const divisa = divisas.find((d) => d.id === inst.divisaId);
            return (
              <tr key={inst.id}
                className="border-b border-[var(--color-neutro-100)] hover:bg-[var(--color-neutro-50)] cursor-pointer transition-colors"
                onClick={() => onSelect(inst)}
              >
                <td className="px-4 py-2.5">
                  <p className="font-medium text-[var(--color-neutro-900)]">{templateName(inst.templateId)}</p>
                </td>
                <td className="px-4 py-2.5">
                  {isComplete ? (
                    <Badge variant="success" size="sm">{stateName}</Badge>
                  ) : isTerminated ? (
                    <Badge variant="error" size="sm">{stateName}</Badge>
                  ) : (
                    <Badge variant="warning" size="sm">{stateName}</Badge>
                  )}
                </td>
                <td className="px-4 py-2.5 text-[var(--color-neutro-600)]">
                  <p className="font-medium text-[var(--color-neutro-900)]">{origen?.nombre ?? "—"}</p>
                  {origenPath.length > 1 && <p className="text-[10px] text-[var(--color-neutro-400)]">{origenPath.slice(1).map((e) => e.nombre).join(" › ")}</p>}
                </td>
                <td className="px-4 py-2.5 text-[var(--color-neutro-600)]">
                  <p className="font-medium text-[var(--color-neutro-900)]">{destino?.nombre ?? "—"}</p>
                  {destinoPath.length > 1 && <p className="text-[10px] text-[var(--color-neutro-400)]">{destinoPath.slice(1).map((e) => e.nombre).join(" › ")}</p>}
                </td>
                <td className="px-4 py-2.5 text-[var(--color-neutro-600)]">{divisa?.codigoISO ?? "—"}</td>
                <td className="px-4 py-2.5 text-right font-medium text-[var(--color-neutro-900)]">${(inst.monto ?? 0).toLocaleString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ── Create Flow (template selector + wizard) ── */
function CreateFlow({ templates, selectedId, editInstId, onSelectTemplate, onComplete, onCancel }: {
  templates: ProcesoTransaccional[];
  selectedId: string | null;
  editInstId?: string | null;
  onSelectTemplate: (id: string | null) => void;
  onComplete: (instancia: TransaccionInstancia) => void;
  onCancel: () => void;
}) {
  const selectedTemplate = selectedId ? templates.find((t) => t.id === selectedId) ?? null : null;

  if (!selectedTemplate) {
    return (
      <div className="space-y-3">
        <p className="text-[14px] font-semibold text-[var(--color-neutro-900)]">Seleccione una operación</p>
        <div className="space-y-1">
          {templates.map((t) => (
            <button key={t.id}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-corner-m border border-[var(--color-neutro-200)] text-left hover:border-[var(--color-verde-100)] hover:bg-[var(--color-neutro-50)] transition-colors cursor-pointer"
              onClick={() => onSelectTemplate(t.id)}>
              <FolderOpen className="w-5 h-5 text-[var(--color-neutro-400)] shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-[var(--color-neutro-900)]">{t.nombre}</p>
                <p className="text-[11px] text-[var(--color-neutro-400)]">{t.tipoCarga} · {t.steps.length} estados</p>
              </div>
              <ArrowRight className="w-4 h-4 text-[var(--color-verde-100)] shrink-0" />
            </button>
          ))}
        </div>
        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={onCancel}>Cancelar</Button>
      </div>
    </div>
  );
}

/* ── Code Generator ── */
let _codigoCounter = Date.now();
function generarCodigo(formato: string): string {
  const now = new Date();
  const pad = (n: number, d: number) => String(n).padStart(d, "0");
  let codigo = formato
    .replace(/\{YYYY\}/g, String(now.getFullYear()))
    .replace(/\{MM\}/g, pad(now.getMonth() + 1, 2))
    .replace(/\{DD\}/g, pad(now.getDate(), 2));
  const match = codigo.match(/\{N+\}/);
  if (match) {
    const digits = match[0].length - 2;
    _codigoCounter++;
    codigo = codigo.replace(/\{N+\}/, pad(_codigoCounter % Math.pow(10, digits), digits));
  }
  return codigo;
}

  return (
    <CreationWizard
      template={selectedTemplate}
      editInstId={editInstId}
      onComplete={onComplete}
      onBack={() => onSelectTemplate(null)}
      onCancel={onCancel}
    />
  );
}

/* ── Helpers ── */
function mapTipoUnidadToSubtipo(tipo: string): string[] {
  const map: Record<string, string[]> = {
    "Agencia": ["Agencia"],
    "Bóveda": ["Bóveda", "Caja Fuerte"],
    "Caja": ["Caja"],
    "Taquilla": ["Taquilla"],
    "Taquilla Externa": ["Taquilla"],
    "Cajero / ATM": ["ATM"],
    "Almacén": ["Almacén"],
    "Banco": ["Sucursal", "Central Principal", "Regional"],
  };
  return map[tipo] ?? [];
}

function getRootEntity(entityId: string | undefined, entities: import("@stores/entitiesStore").Entity[]): import("@stores/entitiesStore").Entity | undefined {
  if (!entityId) return undefined;
  let current = entities.find((e) => e.id === entityId);
  if (!current) return undefined;
  while (current.padreId) {
    const parent = entities.find((e) => e.id === current.padreId);
    if (!parent) break;
    current = parent;
  }
  return current;
}

function getEntityPath(entityId: string | undefined, entities: import("@stores/entitiesStore").Entity[]): import("@stores/entitiesStore").Entity[] {
  if (!entityId) return [];
  const ent = entities.find((e) => e.id === entityId);
  if (!ent) return [];
  const path: import("@stores/entitiesStore").Entity[] = [];
  let current = entities.find((e) => e.id === entityId);
  while (current) {
    path.unshift(current);
    current = current.padreId ? entities.find((e) => e.id === current.padreId) : undefined;
  }
  return path;
}

function findEntityInPath(entityId: string, entities: import("@stores/entitiesStore").Entity[], targetSubtipo: string): import("@stores/entitiesStore").Entity | undefined {
  let current = entities.find((e) => e.id === entityId);
  while (current) {
    if (current.subtipo === targetSubtipo) return current;
    current = current.padreId ? entities.find((e) => e.id === current.padreId) : undefined;
  }
  return undefined;
}

function getSubtipoChain(tipo: string | null): string[][] {
  const map: Record<string, string[][]> = {
    "Agencia": [["Agencia"], ["Bóveda", "Caja Fuerte"], ["Anaquel"]],
    "Bóveda": [["Bóveda", "Caja Fuerte"], ["Anaquel"]],
    "Caja": [["Caja"]],
    "Taquilla": [["Taquilla"]],
    "Taquilla Externa": [["Taquilla"]],
    "Cajero / ATM": [["ATM"]],
    "Almacén": [["Almacén"]],
    "Banco": [["Sucursal", "Central Principal", "Regional"]],
  };
  return tipo ? (map[tipo] ?? []) : [];
}

function getEntityExcludeIds(entityId: string, tipo: string | null): string[] {
  const entities = useEntitiesStore.getState().entities;
  const chain = getSubtipoChain(tipo);
  const firstSubtipos = chain[0];
  if (!firstSubtipos) return [entityId];
  const path = getEntityPath(entityId, entities);
  const firstLevelEntity = path.find((e) => firstSubtipos.includes(e.subtipo));
  const ids = [entityId];
  if (firstLevelEntity && firstLevelEntity.id !== entityId) ids.push(firstLevelEntity.id);
  return ids;
}

/* ── Creation Wizard (multi-step inside modal) ── */
const WIZARD_STEPS = [
  { id: "rutas", label: "Origen y Destino" },
  { id: "divisa-detalles", label: "Divisa y Detalles" },
  { id: "resumen", label: "Resumen" },
];

function CreationWizard({ template, editInstId, onComplete, onBack, onCancel }: {
  template: ProcesoTransaccional;
  editInstId?: string | null;
  onComplete: (instancia: TransaccionInstancia) => void;
  onBack: () => void;
  onCancel: () => void;
}) {
  const { crearInstancia, updateInstancia, instancias } = useInstanciasStore();
  const divisasStore = useDivisasStore();
  const { divisas, clasificaciones, getDenominacionesByDivisa, getFajosByDenominacion, fajos } = divisasStore;
  const firstStep = template.steps[0];
  const editInst = editInstId ? instancias.find((i) => i.id === editInstId) : null;
  const rawDenom = editInst?.dataPorEstado?.[firstStep?.id ?? ""]?.["_denominaciones"];
  const editInstData: Array<{ clasificacionId: string; fajos: Record<string, number>; individual: Record<string, number> }> = rawDenom
    ? (JSON.parse(rawDenom) as Array<{ clasificacionId: string; fajos?: Array<{ fajoId: string; cantidadFajos: number }>; individual?: Record<string, number> }>).map((b) => ({
        clasificacionId: b.clasificacionId,
        fajos: b.fajos ? Object.fromEntries(b.fajos.map((f) => [f.fajoId, f.cantidadFajos])) : {},
        individual: b.individual ?? {},
      }))
    : [];

  const [currentWizardStep, setCurrentWizardStep] = useState(0);
  const [origenId, setOrigenId] = useState(editInst?.origenId ?? "");
  const [destinoId, setDestinoId] = useState(editInst?.destinoId ?? "");
  const [origenRootId, setOrigenRootId] = useState("");
  const [destinoRootId, setDestinoRootId] = useState("");
  const [divisaId, setDivisaId] = useState(editInst?.divisaId ?? "");
  const [batches, setBatches] = useState<Array<{ clasificacionId: string; fajos: Record<string, number>; individual: Record<string, number> }>>(
    editInstData ?? []
  );
  const [transportistaId, setTransportistaId] = useState(editInst?.dataPorEstado?.[firstStep?.id ?? ""]?.["_transportistaId"] ?? "");
  const [usaAcuerdo, setUsaAcuerdo] = useState(editInst?.dataPorEstado?.[firstStep?.id ?? ""]?.["_usaAcuerdo"] === "true");
  const [costoEnvio, setCostoEnvio] = useState(Number(editInst?.dataPorEstado?.[firstStep?.id ?? ""]?.["_costoEnvio"] ?? 0));
  const [costoManual, setCostoManual] = useState(Number(editInst?.dataPorEstado?.[firstStep?.id ?? ""]?.["_costoManual"] ?? 0));
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [batchExpanded, setBatchExpanded] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (divisaId && getDenominacionesByDivisa(divisaId).length > 0 && batches.length === 0) {
      setBatches([{ clasificacionId: clasificacionesActivas[0]?.id ?? "", fajos: {}, individual: {} }]);
    }
  }, [divisaId]);

  const destinoConstrainParent = useMemo(() => {
    if (template.ambito !== "interna" || !origenId) return null;
    const entitiesList = useEntitiesStore.getState().entities;
    let cur = entitiesList.find((e) => e.id === origenId);
    while (cur) {
      if (cur.subtipo === "Agencia") return cur.id;
      cur = cur.padreId ? entitiesList.find((e) => e.id === cur.padreId) ?? null : null;
    }
    return null;
  }, [template.ambito, template.origenTipo, origenId]);

  const divisasDisponibles = (template.divisasPermitidas ?? []).length > 0
    ? divisas.filter((d) => template.divisasPermitidas!.includes(d.id) && d.activo)
    : divisas.filter((d) => d.activo);
  const denomList = getDenominacionesByDivisa(divisaId).sort((a, b) => b.valor - a.valor);
  const clasificacionesActivas = clasificaciones.filter((c) => c.activo);

  const monto = batches.reduce((sum, b) => {
    const activeFajos = fajos.filter((f) => f.activo);
    const fajoTotal = Object.entries(b.fajos).reduce((s, [fajoId, qty]) => {
      const fajo = activeFajos.find((f) => f.id === fajoId);
      if (!fajo) return s;
      const den = denomList.find((d) => d.id === fajo.denominacionId);
      return s + qty * fajo.cantidadUnidades * (den?.valor ?? 0);
    }, 0);
    const indivTotal = Object.entries(b.individual).reduce((s, [denId, qty]) => {
      const den = denomList.find((d) => d.id === denId);
      return s + qty * (den?.valor ?? 0);
    }, 0);
    return sum + fajoTotal + indivTotal;
  }, 0);

  const entitiesList = useEntitiesStore.getState().entities;
  const chainOrigen = getSubtipoChain(template.origenTipo);
  const chainDestino = getSubtipoChain(template.destinoTipo);
  const firstSubtiposOrigen = chainOrigen[0] ?? [];
  const firstSubtiposDestino = chainDestino[0] ?? [];
  const origenRoot = origenId ? getEntityPath(origenId, entitiesList).find((e) => firstSubtiposOrigen.includes(e.subtipo)) : undefined;
  const destinoRoot = destinoId ? getEntityPath(destinoId, entitiesList).find((e) => firstSubtiposDestino.includes(e.subtipo)) : undefined;
  const mismaRaiz = origenRoot && destinoRoot && origenRoot.id === destinoRoot.id;

  function canAdvance(): boolean {
    if (currentWizardStep === 0) {
      if (!origenId || !destinoId) return false;
      if (template.ambito === "entre-agencias" && mismaRaiz) return false;
      return true;
    }
    if (currentWizardStep === 1) return !!divisaId && batches.length > 0 && batches.every((b) => Object.values(b.fajos).some((q) => q > 0) || Object.values(b.individual).some((q) => q > 0));
    if (template.usaTransportista) return !!transportistaId;
    return true;
  }

  const stepLabels = WIZARD_STEPS.map((s) => s.label);

  return (
    <div className="flex flex-col min-h-0">
      {/* Stepper */}
      <div className="flex items-center gap-2 mb-4">
        {stepLabels.map((label, idx) => (
          <div key={idx} className="flex items-center gap-2 flex-1">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-corner-m text-[11px] font-medium transition-colors ${
              idx === currentWizardStep ? "bg-[var(--color-verde-100)] text-white" :
              idx < currentWizardStep ? "bg-green-100 text-green-700" :
              "bg-white text-[var(--color-neutro-400)] border border-[var(--color-neutro-200)]"
            }`}>
              {idx < currentWizardStep ? <CheckCircle className="w-3 h-3" /> : <span>{idx + 1}</span>}
              <span>{label}</span>
            </div>
            {idx < stepLabels.length - 1 && (
              <div className={`flex-1 h-px ${idx < currentWizardStep ? "bg-green-400" : "bg-[var(--color-neutro-200)]"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {currentWizardStep === 0 && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <EntitySelector label="Origen" tipo={template.origenTipo} value={origenId} onChange={setOrigenId} excludeIds={destinoRootId ? [destinoRootId] : []} onRootChange={setOrigenRootId} />
              <EntitySelector label="Destino" tipo={template.destinoTipo} value={destinoId} onChange={setDestinoId} excludeIds={origenRootId ? [origenRootId] : []} constrainToParentId={destinoConstrainParent} onRootChange={setDestinoRootId} />
            </div>
            {template.ambito === "entre-agencias" && mismaRaiz && (
              <p className="text-[12px] text-red-600 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                El origen y el destino deben ser agencias distintas
              </p>
            )}
          </div>
        )}
        {currentWizardStep === 1 && (
          <div className="space-y-6">
            {/* Divisa */}
            <div>
              <p className="text-[12px] font-medium text-[var(--color-neutro-700)] mb-1">Divisa</p>
              <div className="flex flex-wrap gap-2">
                {divisasDisponibles.map((d) => (
                  <button key={d.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-corner-m text-[13px] font-medium border transition-colors cursor-pointer ${divisaId === d.id ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-[var(--color-neutro-600)] border-[var(--color-neutro-200)] hover:border-emerald-300"}`}
                    onClick={() => { setDivisaId(d.id); setBatches([]); }}
                  >
                    <span className="text-[15px]">{d.simbolo}</span>
                    <span>{d.codigoISO} — {d.nombre}</span>
                  </button>
                ))}
              </div>
            </div>
            {/* Batches */}
            {divisaId && denomList.length > 0 && (
              <div className="space-y-4 px-1">
                <div className="flex items-center justify-between">
                  <p className="text-[12px] font-medium text-[var(--color-neutro-700)]">Denominaciones por clasificación</p>
                  <button
                    className="flex items-center gap-1 text-[12px] font-medium text-[var(--color-verde-100)] hover:underline cursor-pointer"
                    onClick={() => setBatches((prev) => [...prev, { clasificacionId: clasificacionesActivas.length === 1 ? clasificacionesActivas[0].id : "", fajos: {}, individual: {} }])}
                  >
                    <Plus className="w-3.5 h-3.5" /> Agregar lote
                  </button>
                </div>
                  {batches.map((batch, bIdx) => {
                    const activeFajos = fajos.filter((f) => f.activo);
                    const fajosConDen = denomList.map((den) => ({
                      den,
                      fajos: activeFajos.filter((f) => f.denominacionId === den.id),
                    })).filter((g) => g.fajos.length > 0);
                    const denSinFajos = denomList.filter((den) => !activeFajos.some((f) => f.denominacionId === den.id));

                    const batchMonto = Object.entries(batch.fajos).reduce((s, [fajoId, qty]) => {
                      const fajo = activeFajos.find((f) => f.id === fajoId);
                      if (!fajo) return s;
                      const den = denomList.find((d) => d.id === fajo.denominacionId);
                      return s + qty * fajo.cantidadUnidades * (den?.valor ?? 0);
                    }, 0) + Object.entries(batch.individual).reduce((s, [denId, qty]) => {
                      const den = denomList.find((d) => d.id === denId);
                      return s + qty * (den?.valor ?? 0);
                    }, 0);
                  const claSelected = clasificacionesActivas.find((c) => c.id === batch.clasificacionId);
                    return (
                      <div key={bIdx} className="rounded-corner-m shadow-md">
                        <div className="border border-[var(--color-neutro-200)] rounded-corner-m overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--color-neutro-50)] border-b border-[var(--color-neutro-200)]">
                          <div className="flex items-center gap-3">
                            <button onClick={() => setBatchExpanded((prev) => ({ ...prev, [bIdx]: !(prev[bIdx] ?? true) }))} className="p-0.5 hover:bg-[var(--color-neutro-200)] rounded cursor-pointer">
                              {(batchExpanded[bIdx] ?? true) ? <ChevronDown className="w-4 h-4 text-[var(--color-neutro-400)]" /> : <ChevronRight className="w-4 h-4 text-[var(--color-neutro-400)]" />}
                            </button>
                            <span className="text-[13px] font-bold text-[var(--color-neutro-700)]">Lote #{bIdx + 1}</span>
                            {!(batchExpanded[bIdx] ?? true) && claSelected && <span className="text-[12px] font-semibold text-[var(--color-verde-100)]">${batchMonto.toLocaleString()}</span>}
                            <div className="flex items-center gap-1.5">
                              {clasificacionesActivas.map((c) => (
                              <button key={c.id}
                                className={`flex items-center gap-1.5 px-3 py-1 rounded-corner-m text-[12px] font-medium border transition-all cursor-pointer ${batch.clasificacionId === c.id ? "text-white shadow-sm" : "bg-white text-[var(--color-neutro-600)] border-[var(--color-neutro-200)] hover:border-[var(--color-verde-100)]"}`}
                                style={batch.clasificacionId === c.id ? { backgroundColor: c.color, borderColor: c.color } : {}}
                                onClick={() => {
                                  const newBatches = [...batches];
                                  newBatches[bIdx] = { ...newBatches[bIdx], clasificacionId: c.id };
                                  setBatches(newBatches);
                                }}
                              >
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: batch.clasificacionId === c.id ? "#fff" : c.color }} />
                                {c.nombre}
                              </button>
                            ))}
                          </div>
                        </div>
                          <div className="flex items-center gap-3">
                            {(batchExpanded[bIdx] ?? true) && claSelected && <span className="text-[12px] font-semibold text-[var(--color-verde-100)]">${batchMonto.toLocaleString()}</span>}
                            <button
                              className="text-[12px] text-red-500 hover:underline cursor-pointer"
                              onClick={() => setBatches((prev) => prev.filter((_, i) => i !== bIdx))}
                            >
                              Quitar
                            </button>
                          </div>
                        </div>

                        {(batchExpanded[bIdx] ?? true) && (
                          <>
                            {(() => {
                              function denomHasAny(denId: string): boolean {
                                if (template.modoIngreso === "piezas") return denId in batch.individual;
                                return activeFajos.some((f) => f.denominacionId === denId && f.id in batch.fajos) || denId in batch.individual;
                              }
                              const addedDenIds = template.modoIngreso === "piezas"
                                ? Object.keys(batch.individual)
                                : [...new Set([...activeFajos.filter((f) => f.id in batch.fajos).map((f) => f.denominacionId), ...Object.keys(batch.individual)])];
                              const availableDenIds = denomList.filter((d) => !denomHasAny(d.id));

                              return (
                                <>
                                  {/* Denominaciones agregadas — solo si hay clasificación */}
                                  {claSelected && (
                                    <>
                                      {addedDenIds.length === 0 && (
                                        <div className="px-4 py-3 text-center">
                                          <p className="text-[12px] text-[var(--color-neutro-400)] mb-2">Seleccione una denominación para agregar a este lote</p>
                                        </div>
                                      )}

                                      {template.modoIngreso === "piezas" && addedDenIds.length > 0 && (
                                        <div className="divide-y divide-[var(--color-neutro-100)]">
                                          {addedDenIds.map((denId) => {
                                            const den = denomList.find((d) => d.id === denId);
                                            if (!den) return null;
                                            return (
                                              <div key={den.id} className="flex items-center gap-3 px-4 py-2.5">
                                                <span className="text-[13px] text-[var(--color-neutro-700)] flex-1">{den.nombre}</span>
                                                <span className="text-[12px] text-[var(--color-neutro-400)] w-16 text-right">${den.valor.toLocaleString()}</span>
                                                <input type="number" min={0} value={batch.individual[den.id] ?? ""}
                                                  onChange={(e) => {
                                                    const qty = Math.max(0, parseInt(e.target.value) || 0);
                                                    const newBatches = [...batches];
                                                    newBatches[bIdx] = { ...newBatches[bIdx], individual: { ...newBatches[bIdx].individual, [den.id]: qty } };
                                                    setBatches(newBatches);
                                                  }}
                                                  placeholder="0" className="w-24 text-[15px] font-bold text-right px-3 py-1.5 rounded-md border border-[var(--color-neutro-200)] outline-none focus:border-[var(--color-verde-100)] focus:ring-1 focus:ring-[var(--color-verde-100)] bg-white" />
                                                <p className="text-[13px] font-semibold text-[var(--color-neutro-900)] w-28 text-right">${((batch.individual[den.id] || 0) * den.valor).toLocaleString()}</p>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}

                                      {template.modoIngreso === "fajos" && addedDenIds.length > 0 && (
                                        <div className="divide-y divide-[var(--color-neutro-100)]">
                                          {addedDenIds.map((denId) => {
                                            const den = denomList.find((d) => d.id === denId);
                                            if (!den) return null;
                                            const fajosDeDen = activeFajos.filter((f) => f.denominacionId === den.id);
                                            return (
                                              <div key={den.id} className="px-4 py-2.5">
                                                <p className="text-[13px] font-semibold text-[var(--color-neutro-800)] mb-2">{den.nombre} · <span className="text-[var(--color-verde-100)]">${den.valor.toLocaleString()}</span> c/u</p>
                                                {fajosDeDen.map((fajo) => (
                                                  <div key={fajo.id} className="flex items-center gap-3 py-1.5">
                                                    <span className="text-[12px] text-[var(--color-neutro-600)] flex-1">{fajo.nombre}</span>
                                                    <input type="number" min={0} value={batch.fajos[fajo.id] ?? ""}
                                                      onChange={(e) => {
                                                        const qty = Math.max(0, parseInt(e.target.value) || 0);
                                                        const newBatches = [...batches];
                                                        newBatches[bIdx] = { ...newBatches[bIdx], fajos: { ...newBatches[bIdx].fajos, [fajo.id]: qty } };
                                                        setBatches(newBatches);
                                                      }}
                                                      placeholder="0" className="w-24 text-[15px] font-bold text-right px-3 py-1.5 rounded-md border border-[var(--color-neutro-200)] outline-none focus:border-[var(--color-verde-100)] focus:ring-1 focus:ring-[var(--color-verde-100)] bg-white" />
                                                    <p className="text-[13px] font-semibold text-[var(--color-neutro-900)] w-28 text-right">${((batch.fajos[fajo.id] || 0) * fajo.cantidadUnidades * den.valor).toLocaleString()}</p>
                                                  </div>
                                                ))}
                                                {denSinFajos.some((d) => d.id === den.id) && (
                                                  <div className="flex items-center gap-3 py-1.5 ml-0">
                                                    <span className="text-[12px] text-[var(--color-neutro-500)] flex-1">Unidades sueltas</span>
                                                    <input type="number" min={0} value={batch.individual[den.id] ?? ""}
                                                      onChange={(e) => {
                                                        const qty = Math.max(0, parseInt(e.target.value) || 0);
                                                        const newBatches = [...batches];
                                                        newBatches[bIdx] = { ...newBatches[bIdx], individual: { ...newBatches[bIdx].individual, [den.id]: qty } };
                                                        setBatches(newBatches);
                                                      }}
                                                      placeholder="0" className="w-24 text-[15px] font-bold text-right px-3 py-1.5 rounded-md border border-[var(--color-neutro-200)] outline-none focus:border-[var(--color-verde-100)] focus:ring-1 focus:ring-[var(--color-verde-100)] bg-white" />
                                                    <p className="text-[13px] font-semibold text-[var(--color-neutro-900)] w-28 text-right">${((batch.individual[den.id] || 0) * den.valor).toLocaleString()}</p>
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </>
                                  )}

                                  {!claSelected && (
                                    <div className="px-4 py-3 text-center">
                                      <p className="text-[12px] text-[var(--color-neutro-400)] mb-2">Seleccione una clasificación para este lote</p>
                                    </div>
                                  )}

                                  {/* Agregar denominación — siempre visible */}
                                  <div className="border-t border-[var(--color-neutro-100)] border-l-2 px-4 py-2.5 space-y-2" style={claSelected ? { borderLeftColor: claSelected.color } : {}}>
                                    {(["Billete", "Moneda"] as const).map((tipo) => {
                                      const dns = denomList.filter((d) => d.tipo === tipo);
                                      if (dns.length === 0) return null;
                                      return (
                                        <div key={tipo}>
                                          <p className="text-[10px] font-bold text-[var(--color-neutro-400)] uppercase tracking-wide mb-1">{tipo}s</p>
                                          <div className="flex flex-wrap gap-1.5">
                                            {dns.map((den) => {
                                              const added = template.modoIngreso === "piezas"
                                                ? den.id in batch.individual
                                                : activeFajos.some((f) => f.denominacionId === den.id && f.id in batch.fajos) || den.id in batch.individual;
                                              return (
                                                <button key={den.id} type="button"
                                                  className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-corner-m border transition-all cursor-pointer ${added ? "bg-[var(--color-verde-100)] text-white border-[var(--color-verde-100)] shadow-sm" : "bg-white text-[var(--color-neutro-600)] border-[var(--color-neutro-200)] hover:border-[var(--color-verde-100)] hover:text-[var(--color-verde-100)] hover:bg-green-50"}`}
                                                  onClick={() => {
                                                    const newBatches = [...batches];
                                                    if (added) {
                                                      if (template.modoIngreso === "piezas") {
                                                        const { [den.id]: _, ...rest } = newBatches[bIdx].individual;
                                                        newBatches[bIdx] = { ...newBatches[bIdx], individual: rest };
                                                      } else {
                                                        const fajosDeDen = activeFajos.filter((f) => f.denominacionId === den.id);
                                                        const newFajos = { ...newBatches[bIdx].fajos };
                                                        fajosDeDen.forEach((f) => delete newFajos[f.id]);
                                                        const newIndiv = { ...newBatches[bIdx].individual };
                                                        delete newIndiv[den.id];
                                                        newBatches[bIdx] = { ...newBatches[bIdx], fajos: newFajos, individual: newIndiv };
                                                      }
                                                    } else {
                                                      if (template.modoIngreso === "piezas") {
                                                        newBatches[bIdx] = { ...newBatches[bIdx], individual: { ...newBatches[bIdx].individual, [den.id]: 0 } };
                                                      } else {
                                                        const fajosDeDen = activeFajos.filter((f) => f.denominacionId === den.id);
                                                        const newFajos = { ...newBatches[bIdx].fajos };
                                                        fajosDeDen.forEach((f) => { if (!(f.id in newFajos)) newFajos[f.id] = 0; });
                                                        const newIndiv = { ...newBatches[bIdx].individual };
                                                        if (denSinFajos.some((d) => d.id === den.id)) newIndiv[den.id] = 0;
                                                        newBatches[bIdx] = { ...newBatches[bIdx], fajos: newFajos, individual: newIndiv };
                                                      }
                                                    }
                                                    setBatches(newBatches);
                                                  }}
                                                >
                                                  {added ? <CheckCheck className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                                                  {den.nombre}
                                                </button>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </>
                              );
                            })()}
                          </>
                        )}
                        </div>
                      </div>
                    );
                  })}
                {batches.length > 0 && (
                  <div className="flex items-center justify-end gap-2 pt-2 text-[14px] font-bold text-[var(--color-verde-100)] border-t border-[var(--color-neutro-100)]">
                    <span>Total general:</span>
                    <span>${monto.toLocaleString()}</span>
                  </div>
                )}
              </div>
            )}
            {/* Campos adicionales — omitidos en paso 2 */}
          </div>
        )}
        {currentWizardStep === 2 && (
          <div className="space-y-3">
            <p className="text-[13px] font-semibold text-[var(--color-neutro-900)]">Resumen</p>
            <div className="bg-[var(--color-neutro-50)] rounded-corner-m p-3 space-y-2">
              <div className="flex items-center gap-2 text-[12px]">
                <FileText className="w-4 h-4 text-[var(--color-neutro-400)]" />
                <span className="font-medium text-[var(--color-neutro-700)]">Operación:</span>
                <span className="text-[var(--color-neutro-900)]">{template.nombre}</span>
              </div>
              <ResumenRow label="Origen" value={useEntitiesStore.getState().entities.find((e) => e.id === origenId)?.nombre ?? origenId} />
              <ResumenRow label="Destino" value={useEntitiesStore.getState().entities.find((e) => e.id === destinoId)?.nombre ?? destinoId} />
              <ResumenRow label="Divisa" value={divisas.find((d) => d.id === divisaId)?.codigoISO ?? divisaId} />
              <ResumenRow label="Monto total" value={`$${monto.toLocaleString()}`} />
              {transportistaId && template.usaTransportista && (
                <ResumenRow label="Transportista" value={`${useProveedoresStore.getState().proveedores.find((p) => p.id === transportistaId && p.tipo === "Transportista de Valores")?.nombre ?? transportistaId} — Costo: $${costoEnvio.toLocaleString()}`} />
              )}
              {Object.entries(formData).map(([fieldId, val]) => {
                if (!val) return null;
                const campo = CAMPOS_PREDEFINIDOS.find((c) => c.id === fieldId);
                return (
                  <ResumenRow key={fieldId} label={campo?.etiqueta ?? fieldId} value={campo?.tipo === "denominacion" ? <DenominationSummary value={val} /> : val} />
                );
              })}
            </div>
            {template.usaTransportista && (
              <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m p-4 space-y-3">
                <p className="text-[12px] font-semibold text-[var(--color-neutro-700)]">Transportista de valores <span className="text-red-500">*</span></p>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    const proveedores = useProveedoresStore.getState().proveedores;
                    const servicios = useProveedoresStore.getState().servicios;
                    const categoriasTemplate = new Set<string>();
                    for (const st of template.steps) {
                      for (const cat of (st.serviciosCategorias ?? [])) {
                        categoriasTemplate.add(cat);
                      }
                    }
                    const transportistasDisponibles = proveedores.filter((p) => p.tipo === "Transportista de Valores" && template.transportistasPermitidos.includes(p.id));
                    const calcCosto = (provId: string) => {
                      let total = 0;
                      for (const cat of categoriasTemplate) {
                        const sv = servicios.find((s) => s.proveedorId === provId && s.categoria === cat);
                        total += sv?.precio ?? 0;
                      }
                      return total;
                    };
                    const mejorPrecioGlobal = Math.min(...transportistasDisponibles.map((t) => calcCosto(t.id)));
                    return transportistasDisponibles.map((t) => {
                      const costo = calcCosto(t.id);
                      const esMejorGlobal = costo === mejorPrecioGlobal;
                      const selected = transportistaId === t.id;
                      return (
                        <button key={t.id}
                          className={`flex flex-col items-start gap-0.5 px-3 py-2 rounded-corner-m text-[13px] font-medium border transition-colors cursor-pointer min-w-[140px] ${selected ? "bg-blue-500 text-white border-blue-500" : esMejorGlobal ? "bg-green-50 border-green-400 text-[var(--color-neutro-700)]" : "bg-white text-[var(--color-neutro-600)] border-[var(--color-neutro-200)] hover:border-blue-300"}`}
                          onClick={() => {
                            setTransportistaId(t.id);
                            setUsaAcuerdo(false);
                            setCostoEnvio(costo);
                            setCostoManual(0);
                          }}>
                          <p className="font-medium">{t.nombre}</p>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[11px] ${selected ? "text-white/70" : "text-[var(--color-neutro-400)]"}`}>${costo.toLocaleString()}</span>
                            {esMejorGlobal && !selected && (
                              <span className="text-[10px] bg-green-500 text-white px-1 rounded-corner-m">Mejor precio</span>
                            )}
                          </div>
                        </button>
                      );
                    });
                  })()}
                </div>
                {transportistaId && (() => {
                  const t = useProveedoresStore.getState().proveedores.find((p) => p.id === transportistaId && p.tipo === "Transportista de Valores");
                  if (!t) return null;
                  const categorias = new Set<string>();
                  for (const st of template.steps) {
                    for (const cat of (st.serviciosCategorias ?? [])) {
                      categorias.add(cat);
                    }
                  }
                  const catsUnicos = Array.from(categorias);
                  const servicios = useProveedoresStore.getState().servicios;
                  const items = catsUnicos.map((cat) => {
                    const sv = servicios.find((s) => s.proveedorId === t.id && s.categoria === cat);
                    return { categoria: cat, precio: sv?.precio ?? 0, nombre: sv?.nombre ?? cat };
                  });
                  const totalServicios = items.reduce((s, i) => s + i.precio, 0);
                  return (
                    <div className="space-y-2 pt-2 border-t border-[var(--color-neutro-100)]">
                      <div className="flex items-center gap-2">
                        <label className="text-[12px] text-[var(--color-neutro-600)]">Acuerdo manual %:</label>
                        <input type="number" min={0} max={100} step={0.1} value={costoManual || ""}
                          onChange={(e) => {
                            const pct = parseFloat(e.target.value) || 0;
                            setCostoManual(pct);
                            setUsaAcuerdo(false);
                            setCostoEnvio(pct > 0 ? Math.round(totalServicios * (1 - pct / 100)) : totalServicios);
                          }}
                          className="w-20 text-[13px] px-3 py-1 rounded-corner-m border border-[var(--color-neutro-200)] outline-none focus:border-[var(--color-verde-100)] bg-white" />
                      </div>
                      {items.length > 0 && (
                        <div className="border-t border-[var(--color-neutro-100)] pt-2 space-y-1">
                          <p className="text-[10px] font-semibold text-[var(--color-neutro-400)] uppercase tracking-wide">Costo total discriminado</p>
                          {items.map((item) => (
                            <div key={item.categoria} className="flex items-center justify-between text-[12px]">
                              <span className="text-[var(--color-neutro-700)]">{item.categoria}</span>
                              <span className="font-medium text-[var(--color-neutro-900)]">${item.precio.toLocaleString()}</span>
                            </div>
                          ))}
                          <div className="border-t border-[var(--color-neutro-200)] pt-1 flex items-center justify-between text-[13px]">
                            <span className="font-bold text-[var(--color-neutro-800)]">Total</span>
                            <span className="font-bold text-[var(--color-verde-100)]">${costoEnvio.toLocaleString()}</span>
                          </div>
                        </div>
                      )}
                      <p className="text-[12px] font-semibold text-[var(--color-verde-100)]">
                        Costo transportista: ${costoEnvio.toLocaleString()}
                        {costoManual > 0 && <span className="text-[11px] text-[var(--color-neutro-400)] font-normal ml-1">(-{costoManual}% acuerdo manual)</span>}
                      </p>
                    </div>
                  );
                })()}
              </div>
            )}
            <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m p-3">
              <p className="text-[11px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide mb-2">Desglose de denominaciones</p>
              {batches.length === 0 ? (
                <p className="text-[12px] text-[var(--color-neutro-400)]">Sin denominaciones</p>
              ) : (
                <div className="space-y-3">
                  {batches.map((batch, bIdx) => {
                    const cla = clasificacionesActivas.find((c) => c.id === batch.clasificacionId);
                    const fajoIds = Object.keys(batch.fajos).filter((fid) => (batch.fajos[fid] ?? 0) > 0);
                    const indivIds = Object.keys(batch.individual).filter((did) => (batch.individual[did] ?? 0) > 0);
                    if (fajoIds.length === 0 && indivIds.length === 0) return null;
                    let batchTotal = fajoIds.reduce((s, fid) => {
                      const fajo = fajos.find((f) => f.id === fid);
                      if (!fajo) return s;
                      const den = denomList.find((d) => d.id === fajo.denominacionId);
                      return s + (batch.fajos[fid] ?? 0) * fajo.cantidadUnidades * (den?.valor ?? 0);
                    }, 0);
                    batchTotal += indivIds.reduce((s, did) => {
                      const den = denomList.find((d) => d.id === did);
                      return s + (batch.individual[did] ?? 0) * (den?.valor ?? 0);
                    }, 0);
                    return (
                      <div key={bIdx}>
                        <p className="text-[11px] font-semibold text-[var(--color-neutro-600)] mb-1">
                          Lote {bIdx + 1}{cla ? ` — ${cla.nombre}` : ""}
                          <span className="ml-2 font-bold text-[var(--color-verde-100)]">${batchTotal.toLocaleString()}</span>
                        </p>
                        <div className="space-y-0.5">
                          {fajoIds.map((fid) => {
                            const fajo = fajos.find((f) => f.id === fid);
                            if (!fajo) return null;
                            const den = denomList.find((d) => d.id === fajo.denominacionId);
                            const qty = batch.fajos[fid] ?? 0;
                            return (
                              <div key={fid} className="flex items-center justify-between text-[12px]">
                                <span className="text-[var(--color-neutro-600)]">{den?.nombre ?? ""} — {fajo.nombre}</span>
                                <span className="font-medium text-[var(--color-neutro-900)]">{qty} fajos × ${(fajo.cantidadUnidades * (den?.valor ?? 0)).toLocaleString()} = ${(qty * fajo.cantidadUnidades * (den?.valor ?? 0)).toLocaleString()}</span>
                              </div>
                            );
                          })}
                          {indivIds.map((did) => {
                            const den = denomList.find((d) => d.id === did);
                            const qty = batch.individual[did] ?? 0;
                            return (
                              <div key={did} className="flex items-center justify-between text-[12px]">
                                <span className="text-[var(--color-neutro-600)]">{den?.nombre ?? ""}</span>
                                <span className="font-medium text-[var(--color-neutro-900)]">{qty} × ${(den?.valor ?? 0).toLocaleString()} = ${(qty * (den?.valor ?? 0)).toLocaleString()}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-[var(--color-neutro-100)] mt-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setCurrentWizardStep((p) => Math.max(0, p - 1))} disabled={currentWizardStep === 0}>Atrás</Button>
          {currentWizardStep < WIZARD_STEPS.length - 1 ? (
            <Button iconLeft={<ArrowRight className="w-4 h-4" />} onClick={() => setCurrentWizardStep((p) => p + 1)} disabled={!canAdvance()}>
              Siguiente
            </Button>
          ) : (
            <Button iconLeft={<CheckCircle className="w-4 h-4" />} disabled={!canAdvance()} onClick={() => {
              const batchData = batches.map((b) => {
                const activeFajos = fajos.filter((f) => f.activo);
                return {
                  clasificacionId: b.clasificacionId,
                  clasificacionNombre: clasificacionesActivas.find((c) => c.id === b.clasificacionId)?.nombre ?? null,
                  fajos: Object.entries(b.fajos).filter(([, qty]) => qty > 0).map(([fajoId, qty]) => {
                    const fajo = activeFajos.find((f) => f.id === fajoId);
                    if (!fajo) return null;
                    const den = denomList.find((d) => d.id === fajo.denominacionId);
                    return {
                      fajoId: fajo.id,
                      fajoNombre: fajo.nombre,
                      denominacionId: fajo.denominacionId,
                      denominacionNombre: den?.nombre ?? "",
                      cantidadFajos: qty,
                      cantidadBilletes: fajo.cantidadUnidades,
                      valorPorFajo: fajo.cantidadUnidades * (den?.valor ?? 0),
                      total: qty * fajo.cantidadUnidades * (den?.valor ?? 0),
                    };
                  }).filter(Boolean),
                  individual: Object.fromEntries(
                    Object.entries(b.individual).filter(([, qty]) => qty > 0)
                  ),
                };
              });
              const dataConDenom: Record<string, string> = { ...formData, _denominaciones: JSON.stringify(batchData), _monto: String(monto) };
              if (transportistaId) {
                dataConDenom._transportistaId = transportistaId;
                dataConDenom._costoEnvio = String(costoEnvio);
                dataConDenom._usaAcuerdo = String(usaAcuerdo);
                dataConDenom._costoManual = String(costoManual);
              }
              if (editInstId && editInst) {
                updateInstancia(editInstId, { origenId, destinoId, divisaId, monto, firstStepData: dataConDenom });
                onComplete(editInst);
              } else {
                const generarCodigo2 = (formato: string) => {
                  try {
                    const now = new Date();
                    const pad = (n: number, d: number) => String(n).padStart(d, "0");
                    const y = String(now.getFullYear());
                    const m = pad(now.getMonth() + 1, 2);
                    const d = pad(now.getDate(), 2);
                    let c = formato
                      .replace(/\{YYYYMMDD\}/g, y + m + d)
                      .replace(/\{YYYY\}/g, y)
                      .replace(/\{MM\}/g, m)
                      .replace(/\{DD\}/g, d);
                    const match = c.match(/\{N+\}/);
                    if (match) {
                      const digits = match[0].length - 2;
                      c = c.replace(/\{N+\}/, pad(Date.now() % Math.pow(10, digits), digits));
                    }
                    return c;
                  } catch { return ""; }
                };
                const codigoRemesa = template.usaCodigoRemesa && template.codigoRemesaFormato ? generarCodigo2(template.codigoRemesaFormato) : "";
                const codigoEnvio = template.usaCodigoEnvio && template.codigoEnvioFormato ? generarCodigo2(template.codigoEnvioFormato) : "";
                const instancia = crearInstancia(template.id, template.nombre, firstStep.id, dataConDenom, "agencia", origenId, destinoId, divisaId, monto, codigoRemesa, codigoEnvio);
                onComplete(instancia);
              }
            }}>
              {editInstId ? "Guardar Cambios" : "Crear Transacción"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function ResumenRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 text-[12px]">
      <span className="font-medium text-[var(--color-neutro-600)] shrink-0 w-[120px]">{label}:</span>
      <span className="text-[var(--color-neutro-900)]">{value ?? "—"}</span>
    </div>
  );
}

/* ── Hierarchical Entity Selector ── */
function EntitySelector({ label, tipo, value, onChange, excludeIds, constrainToParentId, onRootChange }: {
  label: string;
  tipo: string | null;
  value: string;
  onChange: (id: string) => void;
  excludeIds?: string[];
  constrainToParentId?: string | null;
  onRootChange?: (id: string | null) => void;
}) {
  const allEntities = useEntitiesStore((s) => s.entities);
  const chain = useMemo(() => getSubtipoChain(tipo), [tipo]);

  const initialPath = useMemo(() => {
    if (!value) return [];
    const ent = allEntities.find((e) => e.id === value);
    if (!ent) return [];
    const ancestors: import("@stores/entitiesStore").Entity[] = [];
    let current = ent;
    while (current.padreId) {
      const parent = allEntities.find((e) => e.id === current.padreId);
      if (parent) ancestors.unshift(parent);
      current = parent;
    }
    return [...ancestors, ent];
  }, [value, allEntities]);

  const [drillPath, setDrillPath] = useState<import("@stores/entitiesStore").Entity[]>([]);
  const [search, setSearch] = useState("");

  const completedPath = initialPath.length > 0 && drillPath.length === 0 ? initialPath : drillPath;
  const depth = completedPath.length;

  const entitiesAtLevel = useMemo(() => {
    if (!chain.length || depth >= chain.length) return [];
    const validSubtipos = chain[depth];
    const base = depth === 0
      ? allEntities.filter((e) => validSubtipos.includes(e.subtipo) && e.activo)
      : allEntities.filter((e) => e.padreId === (completedPath[depth - 1])?.id && validSubtipos.includes(e.subtipo) && e.activo);
    let filtered = excludeIds?.length ? base.filter((e) => !excludeIds.includes(e.id)) : base;
    if (constrainToParentId) {
      filtered = filtered.filter((e) => {
        let cur = e;
        while (cur) {
          if (cur.id === constrainToParentId) return true;
          cur = cur.padreId ? allEntities.find((x) => x.id === cur.padreId) as typeof cur | undefined : undefined as any;
        }
        return false;
      });
    }
    return filtered;
  }, [depth, chain, allEntities, completedPath, excludeIds, constrainToParentId]);

  const filtered = useMemo(() => {
    if (!search.trim()) return entitiesAtLevel;
    const q = search.toLowerCase();
    return entitiesAtLevel.filter((e) => e.nombre.toLowerCase().includes(q) || e.codigo.toLowerCase().includes(q));
  }, [entitiesAtLevel, search]);

  const isCompleted = initialPath.length > 0 && drillPath.length === 0;

  function handleSelect(entity: import("@stores/entitiesStore").Entity) {
    const nextLevel = depth + 1;
    if (nextLevel < chain.length) {
      const nextSubtipos = chain[nextLevel];
      const hasChildren = allEntities.some((e) => e.padreId === entity.id && nextSubtipos.includes(e.subtipo) && e.activo);
      if (hasChildren) {
        setDrillPath([...completedPath, entity]);
        setSearch("");
        if (depth === 0 && onRootChange) onRootChange(entity.id);
        return;
      }
    }
    setDrillPath([]);
    onChange(entity.id);
    if (depth === 0 && onRootChange) onRootChange(entity.id);
  }

  function goToLevel(level: number) {
    if (level === 0) {
      setDrillPath([]);
      setSearch("");
      if (isCompleted) onChange("");
      if (onRootChange) onRootChange(null);
      return;
    }
    setDrillPath(completedPath.slice(0, level));
    setSearch("");
  }

  function formatSaldo(n: number | undefined): string {
    if (n == null) return "";
    return `$${n.toLocaleString()}`;
  }

  if (!tipo) {
    return (
      <div>
        <p className="text-[12px] font-medium text-[var(--color-neutro-700)] mb-1">{label}</p>
        <p className="text-[12px] text-[var(--color-neutro-400)]">Configure el tipo de unidad primero</p>
      </div>
    );
  }

  if (!chain.length) {
    return (
      <div>
        <p className="text-[12px] font-medium text-[var(--color-neutro-700)] mb-1">{label}</p>
        <p className="text-[12px] text-[var(--color-neutro-400)]">Sin niveles de selección para este tipo</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-[12px] font-medium text-[var(--color-neutro-700)] mb-1">{label}</p>

      {/* Breadcrumb */}
      {completedPath.length > 0 && (
        <div className="flex items-center gap-1 mb-2 flex-wrap">
          {completedPath.map((ent, idx) => (
            <div key={ent.id} className="flex items-center gap-1 text-[11px]">
              {idx > 0 && <span className="text-[var(--color-neutro-300)] mx-0.5">›</span>}
              <button className="text-[var(--color-verde-100)] hover:underline cursor-pointer font-medium truncate max-w-[120px]" onClick={() => goToLevel(idx)} title={ent.nombre}>
                {ent.nombre}
              </button>
              {ent.saldo != null && (
                <span className="text-[10px] text-[var(--color-neutro-400)] ml-1">({formatSaldo(ent.saldo)})</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Selection list */}
      {isCompleted ? (
        <div className="bg-[var(--color-verde-50)] border border-[var(--color-verde-100)] rounded-corner-m p-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[var(--color-verde-100)] shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-[var(--color-neutro-900)]">{initialPath[initialPath.length - 1]?.nombre}</p>
              <p className="text-[11px] text-[var(--color-neutro-500)]">{initialPath[initialPath.length - 1]?.codigo} · {initialPath[initialPath.length - 1]?.nivel}</p>
            </div>
            {initialPath[initialPath.length - 1]?.saldo != null && (
              <div className="text-right">
                <p className="text-[10px] text-[var(--color-neutro-400)]">Saldo</p>
                <p className="text-[13px] font-bold text-[var(--color-verde-100)]">{formatSaldo(initialPath[initialPath.length - 1]?.saldo)}</p>
              </div>
            )}
          </div>
          <button className="mt-2 text-[11px] text-[var(--color-verde-100)] hover:underline cursor-pointer" onClick={() => { setDrillPath([]); onChange(""); }}>
            Cambiar selección
          </button>
        </div>
      ) : entitiesAtLevel.length === 0 && depth > 0 ? (
        <p className="text-[12px] text-[var(--color-neutro-400)]">No hay entidades disponibles en este nivel</p>
      ) : entitiesAtLevel.length === 0 ? (
        <p className="text-[12px] text-[var(--color-neutro-400)]">No hay entidades disponibles</p>
      ) : (
        <div className="space-y-1">
          <div className="relative">
            <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-neutro-400)]" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder={`Buscar ${chain[depth]?.join("/").toLowerCase()}...`}
              className="w-full text-[12px] pl-7 pr-2.5 py-1.5 rounded-corner-m border border-[var(--color-neutro-200)] outline-none focus:border-[var(--color-verde-100)] bg-white" />
          </div>
          <div className="max-h-[220px] overflow-y-auto space-y-1">
            {filtered.length === 0 ? (
              <p className="text-[12px] text-[var(--color-neutro-400)] py-2">Sin resultados</p>
            ) : (
              filtered.map((e) => (
                <button key={e.id}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-corner-m text-left text-[13px] border transition-colors cursor-pointer ${value === e.id && !drillPath.length ? "bg-[var(--color-verde-100)] text-white border-[var(--color-verde-100)]" : "bg-white text-[var(--color-neutro-700)] border-[var(--color-neutro-200)] hover:border-[var(--color-verde-100)]"}`}
                  onClick={() => handleSelect(e)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{e.nombre}</p>
                      {e.saldo != null && <span className={`text-[11px] shrink-0 ${value === e.id && !drillPath.length ? "text-white/70" : "text-[var(--color-neutro-400)]"}`}>{formatSaldo(e.saldo)}</span>}
                    </div>
                    <p className={`text-[11px] ${value === e.id && !drillPath.length ? "text-white/70" : "text-[var(--color-neutro-400)]"}`}>{e.codigo} · {e.nivel}</p>
                  </div>
                  {(value === e.id && !drillPath.length) && <CheckCircle className="w-4 h-4 shrink-0" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Wizard Field ── */
function WizardField({ campo, value, onChange, envaseBatchData, envaseClasificaciones }: {
  campo: typeof CAMPOS_PREDEFINIDOS[0];
  value: string;
  onChange: (v: string) => void;
  envaseBatchData?: ClasificacionBatch[];
  envaseClasificaciones?: { id: string; nombre: string; color: string }[];
}) {
  const labelClass = "text-[12px] font-medium text-[var(--color-neutro-700)] mb-1";
  const inputClass = "w-full text-[13px] px-3 py-1.5 rounded-corner-m border border-[var(--color-neutro-200)] outline-none focus:border-[var(--color-verde-100)] bg-white";

  if (campo.tipo === "denominacion") {
    return (
      <div>
        <p className={labelClass}>{campo.etiqueta}{campo.requerido && <span className="text-red-500 ml-0.5">*</span>}</p>
        <DenominationInput value={value} onChange={onChange} />
      </div>
    );
  }
  if (campo.tipo === "envases") {
    return (
      <div>
        <p className={labelClass}>{campo.etiqueta}{campo.requerido && <span className="text-red-500 ml-0.5">*</span>}</p>
        <EnvasesInput value={value} onChange={onChange} batchData={envaseBatchData ?? []} clasificaciones={envaseClasificaciones ?? []} />
      </div>
    );
  }
  if (campo.tipo === "select" && campo.opciones.length > 0) {
    return (
      <div>
        <p className={labelClass}>{campo.etiqueta}{campo.requerido && <span className="text-red-500 ml-0.5">*</span>}</p>
        <SearchableSelect options={campo.opciones.map((o) => ({ value: o, label: o }))} value={value} onChange={onChange}
          placeholder="Seleccionar..." searchPlaceholder={`Buscar ${campo.etiqueta.toLowerCase()}...`} />
      </div>
    );
  }
  if (campo.tipo === "numero") {
    return (
      <div>
        <p className={labelClass}>{campo.etiqueta}{campo.requerido && <span className="text-red-500 ml-0.5">*</span>}</p>
        <input type="number" value={value} onChange={(e) => onChange(e.target.value)} placeholder={`Ingrese ${campo.etiqueta.toLowerCase()}...`} className={inputClass} />
      </div>
    );
  }
  if (campo.tipo === "fecha") {
    return (
      <div>
        <p className={labelClass}>{campo.etiqueta}{campo.requerido && <span className="text-red-500 ml-0.5">*</span>}</p>
        <input type="date" value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} />
      </div>
    );
  }
  return (
    <div>
      <p className={labelClass}>{campo.etiqueta}{campo.requerido && <span className="text-red-500 ml-0.5">*</span>}</p>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={`Ingrese ${campo.etiqueta.toLowerCase()}...`} className={inputClass} />
    </div>
  );
}

/* ── Denomination Summary ── */
function DenominationSummary({ value }: { value: string }) {
  let data: unknown;
  try { data = JSON.parse(value); } catch { return <span>{value}</span>; }
  if (!Array.isArray(data) || data.length === 0) return <span className="text-[var(--color-neutro-400)]">Sin denominaciones</span>;
  const isBatch = "items" in data[0];
  let total = 0;
  if (isBatch) {
    type Batch = { clasificacionNombre?: string | null; items: { nombre: string; cantidad: number; total: number }[] };
    const batches = data as Batch[];
    total = batches.reduce((s, b) => s + b.items.reduce((s2, i) => s2 + i.total, 0), 0);
    return (
      <div className="space-y-1">
        {batches.map((b, bi) => {
          const bTotal = b.items.reduce((s, i) => s + i.total, 0);
          return b.items.length > 0 ? (
            <div key={bi}>
              <p className="text-[10px] font-semibold text-[var(--color-neutro-500)]">
                {b.clasificacionNombre ? `${b.clasificacionNombre} — ` : ""}${bTotal.toLocaleString()}
              </p>
              {b.items.map((i, ii) => (
                <div key={ii} className="text-[11px] pl-2">{i.cantidad.toLocaleString()} × {i.nombre} = <span className="font-medium">${i.total.toLocaleString()}</span></div>
              ))}
            </div>
          ) : null;
        })}
        <div className="text-[12px] font-bold text-[var(--color-verde-100)] pt-0.5">Total: ${total.toLocaleString()}</div>
      </div>
    );
  }
  type Row = { denominacion: string; cantidad: number; total: number };
  const rows = data as Row[];
  total = rows.reduce((s, r) => s + r.total, 0);
  return (
    <div className="space-y-0.5">
      {rows.map((r, i) => (
        <div key={i} className="text-[11px]">{r.cantidad.toLocaleString()} × {r.denominacion} = <span className="font-medium">${r.total.toLocaleString()}</span></div>
      ))}
      <div className="text-[12px] font-bold text-[var(--color-verde-100)] pt-0.5">Total: ${total.toLocaleString()}</div>
    </div>
  );
}

/* ── Instance Detail (inside modal) ── */
function InstanciaDetailContent({ instancia, templates, onClose, onStateChange, onEdit }: {
  instancia: TransaccionInstancia;
  templates: ProcesoTransaccional[];
  onClose: () => void;
  onStateChange?: (msg: string) => void;
  onEdit?: (instId: string) => void;
}) {
  const { avanzarEstado, activarExcepcion } = useInstanciasStore();
  const entities = useEntitiesStore.getState().entities;
  const divisas = useDivisasStore.getState().divisas;
  const { clasificaciones, fajos } = useDivisasStore();
  const divisaStore = useDivisasStore();
  const denominacionesActivas = divisaStore.denominaciones.filter((d) => d.activo);
  const template = templates.find((t) => t.id === instancia.templateId) ?? null;
  const origen = getRootEntity(instancia.origenId, entities);
  const destino = getRootEntity(instancia.destinoId, entities);
  const origenPath = getEntityPath(instancia.origenId, entities);
  const destinoPath = getEntityPath(instancia.destinoId, entities);
  const origenLeaf = entities.find((e) => e.id === instancia.origenId);
  const destinoLeaf = entities.find((e) => e.id === instancia.destinoId);
  const origenParent = template?.origenTipo ? findEntityInPath(instancia.origenId, entities, template.origenTipo) : null;
  const destinoParent = template?.destinoTipo ? findEntityInPath(instancia.destinoId, entities, template.destinoTipo) : null;
  const divisa = divisas.find((d) => d.id === instancia.divisaId);
  const [advanceData, setAdvanceData] = useState<Record<string, string>>({});
  const [advanceError, setAdvanceError] = useState("");
  const [showExceptions, setShowExceptions] = useState(false);
  const [expandedLog, setExpandedLog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ message: string; label: string; onConfirm: () => void } | null>(null);

  const currentStep = template?.steps.find((s) => s.id === instancia.estadoActual) ?? null;
  const currentStepIdx = template?.steps.findIndex((s) => s.id === instancia.estadoActual) ?? -1;
  const nextStep = (currentStepIdx >= 0 && template && currentStepIdx < template.steps.length - 1) ? template.steps[currentStepIdx + 1] : null;

  const nextStepFields = useMemo(() => {
    if (!nextStep || !template) return [];
    const tiposUnidad = [template.origenTipo, template.destinoTipo].filter((t): t is string => t != null);
    if (template.usaTransportista && !tiposUnidad.includes("Camión")) tiposUnidad.push("Camión");
    return CAMPOS_PREDEFINIDOS.filter((c) => nextStep.camposSeleccionados.includes(c.id) && c.aplicableA.some((t) => tiposUnidad.includes(t)));
  }, [nextStep, template]);

  const envaseBatchData = useMemo(() => {
    const allData = instancia.dataPorEstado;
    for (const stepData of Object.values(allData)) {
      const raw = stepData["_denominaciones"];
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed) || parsed.length === 0) continue;
        if (!("fajos" in parsed[0])) continue;
        return (parsed as { clasificacionId: string; clasificacionNombre: string | null; fajos: { fajoId: string; fajoNombre: string | null; denominacionNombre: string; cantidadFajos: number; cantidadBilletes: number; valorPorFajo: number; total: number }[]; individual?: Record<string, number> }[]).map((b) => {
          const items: ClasificacionBatchItem[] = b.fajos.map((f) => ({
            nombre: `${f.denominacionNombre} — ${f.fajoNombre ?? "Fajo"}`,
            cantidad: f.cantidadFajos,
            valor: f.valorPorFajo,
            total: f.total,
            fajoId: f.fajoId,
            fajoNombre: f.fajoNombre,
            denominacionNombre: f.denominacionNombre,
            cantidadBilletes: f.cantidadBilletes,
          }));
          if (b.individual) {
            for (const [denId, qty] of Object.entries(b.individual)) {
              const den = denominacionesActivas.find((d) => d.id === denId);
              if (den && qty > 0) {
                items.push({
                  nombre: den.nombre,
                  cantidad: qty,
                  valor: den.valor,
                  total: qty * den.valor,
                  denominacionNombre: den.nombre,
                });
              }
            }
          }
          return { clasificacionId: b.clasificacionId, clasificacionNombre: b.clasificacionNombre, items };
        });
      } catch { continue; }
    }
    return [];
  }, [instancia.dataPorEstado]);

  const isComplete = instancia.historial.some((h) => h.accion === "completada");
  const isTerminated = instancia.historial.some((h) => h.accion === "excepcion");
  const isFirstStep = template && currentStep && template.steps[0]?.id === currentStep.id && !isComplete && !isTerminated;
  const responsable = currentStep?.unidadResponsableId ? PERFILES_RESPONSABLE.find((e) => e.value === currentStep.unidadResponsableId) : null;

  function handleAdvance() {
    if (!nextStep || !template) return;
    setAdvanceError("");
    const missing = nextStepFields.filter((c) => {
      if (!c.requerido) return false;
      const val = advanceData[c.id]?.trim();
      if (!val) return true;
      if (c.tipo === "envases") {
        try {
          const parsed = JSON.parse(val);
          if (!Array.isArray(parsed) || parsed.length === 0) return true;
          const envNums = parsed.map((r: any) => (r.envase ?? "").trim()).filter(Boolean);
          const precNums = parsed.map((r: any) => (r.precinto ?? "").trim()).filter(Boolean);
          if (new Set(envNums).size !== envNums.length) return true;
          if (new Set(precNums).size !== precNums.length) return true;
          const hasAny = parsed.some((r: any) => Object.values(r.denominaciones ?? {}).some((q: any) => (q ?? 0) > 0));
          if (!hasAny) return true;
          for (const batch of envaseBatchData) {
            const rowsForCla = (parsed as any[]).filter((r: any) => r.clasificacionId === batch.clasificacionId);
            const sums: Record<string, number> = {};
            for (const r of rowsForCla) {
              for (const [label, qty] of Object.entries(r.denominaciones ?? {})) {
                sums[label] = (sums[label] ?? 0) + (qty as number);
              }
            }
            for (const item of batch.items) {
              if ((sums[item.nombre] ?? 0) > item.cantidad) return true;
            }
          }
          return false;
        } catch { return true; }
      }
      return false;
    });
    if (missing.length > 0) {
      const names = missing.map((c) => c.etiqueta).join(", ");
      setAdvanceError(`Campos requeridos: ${names}`);
      return;
    }
    setConfirmAction({
      message: `¿Avanzar al estado "${nextStep.nombre}"?`,
      label: nextStep.nombre,
      onConfirm: () => {
        avanzarEstado(instancia.id, nextStep.id, nextStep.nombre, nextStep.unidadResponsableId ?? "agencia", advanceData, currentStepIdx + 1 >= template.steps.length - 1);
        setAdvanceData({});
        setAdvanceError("");
        setConfirmAction(null);
        onStateChange?.(nextStep.nombre);
        onClose();
      },
    });
  }

  function handleException(excId: string, excName: string, esTerminal: boolean, retrocedeA?: string | null) {
    if (!currentStep) return;
    setConfirmAction({
      message: `¿Activar excepción "${excName}"?`,
      label: excName,
      onConfirm: () => {
        activarExcepcion(instancia.id, currentStep.id, currentStep.nombre, excName, advanceData, esTerminal, retrocedeA);
        setShowExceptions(false);
        setAdvanceData({});
        setConfirmAction(null);
        onStateChange?.(excName);
        onClose();
      },
    });
  }

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      {/* Estado + route info */}
      <div className={`rounded-corner-m border px-4 py-3 ${isComplete ? "bg-green-50 border-green-200" : isTerminated ? "bg-red-50 border-red-200" : "bg-white border-[var(--color-neutro-200)]"}`}>
          <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={isComplete ? "success" : isTerminated ? "error" : "warning"}>{currentStep?.nombre ?? instancia.estadoActual}</Badge>
            {responsable && <span className="text-[11px] text-[var(--color-neutro-500)]">{responsable.label}</span>}
            {currentStep?.eventoContable && currentStep.eventoContable !== "ninguno" && (
              <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded-corner-m ${currentStep.eventoContable === "descuenta" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                {EVENTOS_CONTABLES.find((e) => e.value === currentStep.eventoContable)?.label}
              </span>
            )}
          </div>
          {isFirstStep && onEdit && (
            <button onClick={() => onEdit(instancia.id)} className="text-[11px] px-2.5 py-1 rounded-corner-m border border-[var(--color-verde-100)] text-[var(--color-verde-100)] hover:bg-[var(--color-verde-100)] hover:text-white transition-colors">Editar</button>
          )}
        </div>
        {origenParent && destinoParent ? (
          <div className="mt-2">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-[var(--color-neutro-900)]">
              <span>{origenParent.nombre}</span>
              <ArrowRight className="w-4 h-4 text-[var(--color-neutro-400)]" />
              <span>{destinoParent.nombre}</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-[12px] text-[var(--color-neutro-500)]">
              <span>{origenLeaf?.nombre}</span>
              <ArrowRight className="w-3 h-3 text-[var(--color-neutro-300)]" />
              <span>{destinoLeaf?.nombre}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 mt-2 text-[12px] text-[var(--color-neutro-600)]">
            {origenLeaf && <span className="font-medium">{origenLeaf.nombre}</span>}
            <ArrowRight className="w-3 h-3 text-[var(--color-neutro-400)]" />
            {destinoLeaf && <span className="font-medium">{destinoLeaf.nombre}</span>}
          </div>
        )}
        {instancia.codigoRemesa && (
          <div className="mt-1.5 text-[12px] font-mono text-[var(--color-verde-100)]">
            {instancia.codigoRemesa}{instancia.codigoEnvio ? ` · ${instancia.codigoEnvio}` : ""}
          </div>
        )}
        {divisa && (instancia.monto ?? 0) > 0 && (
          <div className="flex items-center gap-1 mt-1 text-[12px] font-semibold text-[var(--color-verde-100)]">
            <span>{divisa.simbolo}</span>
            <span>${(instancia.monto ?? 0).toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Advance / Exceptions */}
      {nextStep && !isComplete && !isTerminated && template && (
        <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m p-4 space-y-3">
          <p className="text-[12px] font-semibold text-[var(--color-neutro-700)]">Avanzar a: {nextStep.nombre}</p>
          {nextStepFields.length > 0 && (
            <div className="space-y-3">
              {nextStepFields.map((campo) => (
                <WizardField key={campo.id} campo={campo} value={advanceData[campo.id] ?? ""} onChange={(v) => { setAdvanceError(""); setAdvanceData((prev) => ({ ...prev, [campo.id]: v })); }} envaseBatchData={campo.tipo === "envases" ? envaseBatchData : undefined} envaseClasificaciones={campo.tipo === "envases" ? clasificaciones.map((c) => ({ id: c.id, nombre: c.nombre, color: c.color })) : undefined} />
              ))}
            </div>
          )}
          {advanceError && <p className="text-[11px] text-red-600">{advanceError}</p>}
          <div className="flex items-center gap-2 pt-2">
            <Button iconLeft={<ArrowRight className="w-4 h-4" />} onClick={handleAdvance}>
              {currentStepIdx + 1 >= template.steps.length - 1 ? "Completar" : `Avanzar a ${nextStep.nombre}`}
            </Button>
            {currentStep && currentStep.excepciones.length > 0 && (
              <div className="relative">
                <Button variant="outline" iconLeft={<AlertTriangle className="w-4 h-4" />} onClick={() => setShowExceptions(!showExceptions)}>
                  Excepción
                </Button>
                {showExceptions && (
                  <div className="absolute top-full left-0 mt-1 w-[240px] bg-white border border-[var(--color-neutro-200)] rounded-corner-m shadow-lg z-10">
                    {currentStep.excepciones.map((exc) => (
                      <button key={exc.id}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-[12px] text-left hover:bg-[var(--color-neutro-50)] cursor-pointer ${exc.esTerminal ? "text-red-700" : "text-amber-700"}`}
                        onClick={() => handleException(exc.id, exc.nombre, exc.esTerminal, exc.retrocedeA)}>
                        {exc.esTerminal ? <OctagonX className="w-3.5 h-3.5 shrink-0" /> : <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
                        <span className="font-medium">{exc.nombre}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {(isComplete || isTerminated) && (
        <div className={`rounded-corner-m border px-4 py-3 ${isComplete ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
          <div className="flex items-center gap-2">
            {isComplete ? <CheckCircle className="w-5 h-5 text-green-600" /> : <OctagonX className="w-5 h-5 text-red-600" />}
            <p className={`text-[13px] font-bold ${isComplete ? "text-green-800" : "text-red-800"}`}>
              {isComplete ? "Completada" : "Terminada por excepción"}
            </p>
          </div>
        </div>
      )}

      {/* Data by state — skip internal fields */}
      {Object.entries(instancia.dataPorEstado).map(([stepId, data]) => {
        const st = template?.steps.find((s) => s.id === stepId);
        const visible = Object.entries(data).filter(([k]) => !k.startsWith("_") && k !== "cam-envases");
        return visible.length > 0 ? (
          <div key={stepId} className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m p-3">
            <p className="text-[11px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide mb-2">{st?.nombre ?? stepId}</p>
            <div className="grid grid-cols-2 gap-2">
              {visible.map(([fieldId, val]) => {
                if (!val) return null;
                const campo = CAMPOS_PREDEFINIDOS.find((c) => c.id === fieldId);
                return (
                  <div key={fieldId} className="text-[12px]">
                    <span className="text-[var(--color-neutro-500)]">{campo?.etiqueta ?? fieldId}:</span>
                    <span className="ml-1 font-medium text-[var(--color-neutro-900)]">
                      {campo?.tipo === "denominacion" ? <DenominationSummary value={val} /> : val}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null;
      })}

      {/* Detalle de denominaciones por clasificación */}
      {Object.entries(instancia.dataPorEstado).map(([stepId, data]) => {
        const raw = data["_denominaciones"];
        if (!raw) return null;
        let parsed: unknown;
        try { parsed = JSON.parse(raw); } catch { return null; }
        if (!Array.isArray(parsed) || parsed.length === 0) return null;
        const st = template?.steps.find((s) => s.id === stepId);
        type FajoData = { fajoNombre: string | null; denominacionNombre: string; cantidadFajos: number; cantidadBilletes: number; valorPorFajo: number; total: number };
        type BatchData = { clasificacionNombre: string | null; fajos: FajoData[]; individual?: Record<string, number> };
        const batches = parsed as BatchData[];
        return (
          <div key={`denom-${stepId}`} className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m p-3">
            <p className="text-[11px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide mb-2">
              {st?.nombre ?? stepId} — Detalle de denominaciones por clasificación
            </p>
            <div className="space-y-2">
              {batches.map((b, bi) => {
                const hasFajos = b.fajos?.length > 0;
                const indivEntries = b.individual ? Object.entries(b.individual).filter(([, qty]) => qty > 0) : [];
                if (!hasFajos && indivEntries.length === 0) return null;
                return (
                  <div key={bi}>
                    <p className="text-[12px] font-semibold text-[var(--color-neutro-700)]">{b.clasificacionNombre ?? "Sin clasificación"}</p>
                    <div className="pl-2 space-y-0.5">
                      {hasFajos && b.fajos.map((f, fi) => (
                        <p key={fi} className="text-[11px] text-[var(--color-neutro-600)]">
                          {f.cantidadFajos.toLocaleString()} × {f.denominacionNombre} — {f.fajoNombre ?? "Fajo"} (${f.valorPorFajo.toLocaleString()} c/u)
                          = <span className="font-medium text-[var(--color-neutro-900)]">${f.total.toLocaleString()}</span>
                        </p>
                      ))}
                      {indivEntries.length > 0 && indivEntries.map(([denId, qty]) => {
                        const den = denominacionesActivas.find((d) => d.id === denId);
                        return (
                          <p key={denId} className="text-[11px] text-[var(--color-neutro-600)]">
                            {qty.toLocaleString()} × {den?.nombre ?? denId} (${(den?.valor ?? 0).toLocaleString()} c/u)
                            = <span className="font-medium text-[var(--color-neutro-900)]">${(qty * (den?.valor ?? 0)).toLocaleString()}</span>
                          </p>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Envases — extracted from cam-envases */}
      {Object.entries(instancia.dataPorEstado).map(([stepId, data]) => {
        const rawEnv = data["cam-envases"];
        if (!rawEnv) return null;
        let envases: unknown;
        try { envases = JSON.parse(rawEnv); } catch { return null; }
        if (!Array.isArray(envases) || envases.length === 0) return null;
        const st = template?.steps.find((s) => s.id === stepId);
        type EnvaseDisplay = { envase: string; precinto: string; clasificacionId?: string; denominaciones?: Record<string, number> };
        return (
          <div key={`env-${stepId}`} className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m p-3">
            <p className="text-[11px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide mb-2">
              {st?.nombre ?? stepId} — Envases entregados
            </p>
            <div className="border border-[var(--color-neutro-200)] rounded-corner-m overflow-hidden">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="bg-[var(--color-neutro-50)]">
                    <th className="text-left px-3 py-1.5 font-semibold text-[var(--color-neutro-600)]">Envase / Bolsa</th>
                    <th className="text-left px-3 py-1.5 font-semibold text-[var(--color-neutro-600)]">Precinto</th>
                    <th className="text-left px-3 py-1.5 font-semibold text-[var(--color-neutro-600)]">Clasificación</th>
                    <th className="text-left px-3 py-1.5 font-semibold text-[var(--color-neutro-600)]">Denominaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {(envases as EnvaseDisplay[]).map((e, i) => {
                    const cla = clasificaciones.find((c) => c.id === e.clasificacionId);
                    return (
                      <tr key={i} className="border-t border-[var(--color-neutro-100)]" style={cla ? { borderLeftColor: cla.color, borderLeftWidth: 4 } : { borderLeftWidth: 4, borderLeftColor: "transparent" }}>
                        <td className="px-3 py-1.5 text-[var(--color-neutro-700)]">{e.envase}</td>
                        <td className="px-3 py-1.5 text-[var(--color-neutro-700)] font-mono">{e.precinto}</td>
                        <td className="px-3 py-1.5">
                          <span className="text-[13px] font-medium" style={cla ? { color: cla.color } : undefined}>{cla?.nombre ?? <span className="text-[var(--color-neutro-400)] italic">Sin clasificación</span>}</span>
                        </td>
                        <td className="px-3 py-1.5">
                          {e.denominaciones && Object.keys(e.denominaciones).length > 0
                            ? Object.entries(e.denominaciones).filter(([, q]) => (q ?? 0) > 0).map(([label, qty]) => (
                              <span key={label} className="text-[11px] block">{qty.toLocaleString()} × {label}</span>
                            ))
                            : <span className="text-[11px] text-[var(--color-neutro-400)] italic">Sin distribución</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
      {Object.entries(instancia.dataPorEstado).map(([stepId, data]) => {
        const rawId = data["_transportistaId"];
        if (!rawId) return null;
        const t = useProveedoresStore.getState().proveedores.find((p) => p.id === rawId && p.tipo === "Transportista de Valores");
        if (!t) return null;
        const costoEnvio = Number(data["_costoEnvio"] ?? 0);
        const st = template?.steps.find((s) => s.id === stepId);
        return (
          <div key={`transp-${stepId}`} className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m p-3">
            <p className="text-[11px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide mb-2">
              {st?.nombre ?? stepId} — Transportista
            </p>
            <div className="space-y-1 text-[12px]">
              <p><span className="text-[var(--color-neutro-500)]">Empresa:</span> <span className="font-medium">{t.nombre}</span></p>
              <p className="text-[var(--color-verde-100)] font-bold">Costo: ${costoEnvio.toLocaleString()}</p>
            </div>
          </div>
        );
      })}

      {/* Servicios ejecutados */}
      {instancia.serviciosEjecutados?.length > 0 && (
        <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m p-3">
          <p className="text-[11px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide mb-2">Servicios Ejecutados</p>
          <div className="space-y-1">
            {instancia.serviciosEjecutados.map((se, i) => (
              <div key={i} className="flex items-center gap-2 text-[12px] px-2 py-1.5 rounded-corner-m bg-[var(--color-neutro-50)]">
                <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                <span className="font-medium text-[var(--color-neutro-800)]">{se.categoria}</span>
                <span className="ml-auto text-[10px] text-[var(--color-neutro-400)]">{se.fecha}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History */}
      <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m">
        <button className="w-full flex items-center gap-2 px-4 py-3" onClick={() => setExpandedLog(!expandedLog)}>
          {expandedLog ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          <p className="text-[11px] font-bold text-[var(--color-neutro-600)] uppercase tracking-wide flex-1 text-left">Historial</p>
          <span className="text-[11px] text-[var(--color-neutro-400)]">{instancia.historial.length} eventos</span>
        </button>
        {expandedLog && (
          <div className="px-3 pb-3 space-y-1 max-h-[200px] overflow-y-auto">
            {instancia.historial.map((h, idx) => (
              <div key={idx} className="flex items-start gap-2 px-2 py-1.5 rounded-corner-m bg-[var(--color-neutro-50)]">
                {h.accion === "creada" ? <Circle className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" /> :
                 h.accion === "completada" ? <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" /> :
                 h.accion === "excepcion" ? <OctagonX className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" /> :
                 <ArrowRight className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-[var(--color-neutro-800)]">
                    <span className="font-medium">{h.stepName}</span>
                    {h.exceptionName && <span className="text-red-600"> → {h.exceptionName}</span>}
                  </p>
                  <p className="text-[10px] text-[var(--color-neutro-400)]">{h.fecha} · {h.perfil}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setConfirmAction(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <p className="text-[14px] text-[var(--color-neutro-700)] mb-4">{confirmAction.message}</p>
            <div className="flex justify-end gap-2">
              <button className="px-4 py-1.5 text-[12px] font-medium rounded-corner-m border border-[var(--color-neutro-200)] text-[var(--color-neutro-600)] hover:bg-[var(--color-neutro-50)] transition-colors cursor-pointer" onClick={() => setConfirmAction(null)}>Cancelar</button>
              <button className="px-4 py-1.5 text-[12px] font-medium rounded-corner-m bg-[var(--color-verde-100)] text-white hover:bg-green-700 transition-colors cursor-pointer" onClick={confirmAction.onConfirm}>Aceptar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
