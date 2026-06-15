import { useState, useMemo, useEffect } from "react";
import { Plus, Search, Pencil, Trash2, Banknote, Tags } from "lucide-react";
import { Button, Input, Switch } from "@coe/design-system";
import { useDivisasStore } from "@stores/divisasStore";
import { DeleteDialog } from "@components/shared/DeleteDialog";
import { CurrencyForm } from "./CurrencyForm";
import { DenominationForm } from "./DenominationForm";
import { DenominationTable } from "./DenominationTable";
import { BundleForm } from "./BundleForm";
import { BundleTable } from "./BundleTable";
import { ClassificationForm } from "./ClassificationForm";

type ViewMode = "divisas" | "clasificaciones";

export function DivisasPage() {
  const store = useDivisasStore();

  const [view, setView] = useState<ViewMode>("divisas");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(() => store.divisas[0]?.id ?? null);

  /* Divisa modal states */
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [denFormOpen, setDenFormOpen] = useState(false);
  const [editDenId, setEditDenId] = useState<string | null>(null);

  const [fajoFormOpen, setFajoFormOpen] = useState(false);
  const [editFajoId, setEditFajoId] = useState<string | null>(null);

  /* Classification modal states */
  const [claFormOpen, setClaFormOpen] = useState(false);
  const [editClaId, setEditClaId] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string } | null>(null);

  const isDivisasView = view === "divisas";

  const selectedDivisa = useMemo(
    () => (isDivisasView ? store.divisas.find((d) => d.id === selectedId) : undefined),
    [store.divisas, selectedId, isDivisasView]
  );

  const selectedClasificacion = useMemo(
    () => (!isDivisasView ? store.clasificaciones.find((c) => c.id === selectedId) : undefined),
    [store.clasificaciones, selectedId, isDivisasView]
  );

  /* ── Divisas filtered ── */
  const filteredDivisas = useMemo(() => {
    if (!search) return store.divisas;
    const q = search.toLowerCase();
    return store.divisas.filter(
      (d) => d.nombre.toLowerCase().includes(q) || d.codigoISO.toLowerCase().includes(q) || d.paisOrigen.toLowerCase().includes(q)
    );
  }, [store.divisas, search]);

  /* ── Clasificaciones filtered ── */
  const filteredClasificaciones = useMemo(() => {
    if (!search) return store.clasificaciones;
    const q = search.toLowerCase();
    return store.clasificaciones.filter((c) => c.nombre.toLowerCase().includes(q) || c.descripcion.toLowerCase().includes(q));
  }, [store.clasificaciones, search]);

  /* Auto-select first item so detail panel is never empty */
  useEffect(() => {
    const list = isDivisasView ? filteredDivisas : filteredClasificaciones;
    if (list.length > 0) {
      if (!selectedId || !list.some((item) => item.id === selectedId)) {
        setSelectedId(list[0].id);
      }
    } else {
      setSelectedId(null);
    }
  }, [isDivisasView, filteredDivisas, filteredClasificaciones]);

  const denominacionesDeDivisa = useMemo(
    () => store.denominaciones.filter((d) => d.divisaId === selectedId),
    [store.denominaciones, selectedId]
  );

  const fajosDeDivisa = useMemo(() => {
    const denomIds = new Set(denominacionesDeDivisa.map((d) => d.id));
    return store.fajos.filter((f) => denomIds.has(f.denominacionId));
  }, [store.fajos, denominacionesDeDivisa]);

  function handleDelete() {
    if (!deleteTarget) return;
    if (deleteTarget.type === "divisa") {
      store.removeDivisa(deleteTarget.id);
    } else if (deleteTarget.type === "denominacion") {
      store.removeDenominacion(deleteTarget.id);
    } else if (deleteTarget.type === "fajo") {
      store.removeFajo(deleteTarget.id);
    } else if (deleteTarget.type === "clasificacion") {
      store.removeClasificacion(deleteTarget.id);
    }
    setDeleteTarget(null);
  }

  function switchView(v: ViewMode) {
    setView(v);
    setSearch("");
  }

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-[18px] font-bold text-[var(--color-neutro-900)]">Gestión de Divisas</h1>
          <p className="text-[13px] text-[var(--color-neutro-500)]">
            Configuración de monedas, denominaciones, parámetros físicos, fajos y clasificaciones
          </p>
        </div>
      </div>

      {/* View Toggle + Search + Actions */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-1 bg-[var(--color-neutro-100)] p-0.5 rounded-corner-m">
          <button
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold rounded-corner-m transition-all ${view === "divisas" ? "bg-white text-[var(--color-neutro-900)] shadow-sm" : "text-[var(--color-neutro-500)] hover:text-[var(--color-neutro-700)]"}`}
            onClick={() => switchView("divisas")}
          >
            <Banknote className="w-3.5 h-3.5" /> Divisas
          </button>
          <button
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold rounded-corner-m transition-all ${view === "clasificaciones" ? "bg-white text-[var(--color-neutro-900)] shadow-sm" : "text-[var(--color-neutro-500)] hover:text-[var(--color-neutro-700)]"}`}
            onClick={() => switchView("clasificaciones")}
          >
            <Tags className="w-3.5 h-3.5" /> Clasificaciones
          </button>
        </div>
        <div className="flex-1 max-w-md">
          <Input
            prefix={<Search className="w-4 h-4" />}
            placeholder={isDivisasView ? "Buscar divisa..." : "Buscar clasificación..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          size="sm"
          iconLeft={<Plus className="w-6 h-6" />}
          onClick={() => {
            if (isDivisasView) { setEditId(null); setFormOpen(true); }
            else { setEditClaId(null); setClaFormOpen(true); }
          }}
        >
          {isDivisasView ? "Nueva Divisa" : "Nueva Clasificación"}
        </Button>
      </div>

      {/* Two-panel layout */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Left Panel */}
        <div className="w-[300px] shrink-0 bg-white border border-[var(--color-neutro-200)] rounded-corner-m overflow-y-auto">
          <div className="p-3 border-b border-[var(--color-neutro-200)]">
            <p className="text-[12px] font-semibold text-[var(--color-neutro-600)] uppercase tracking-wide">
              {isDivisasView ? `Divisas (${store.divisas.length})` : `Clasificaciones (${store.clasificaciones.length})`}
            </p>
          </div>
          <div className="p-2 space-y-0.5">
            {isDivisasView ? (
              filteredDivisas.length === 0 ? (
                <p className="text-[13px] text-[var(--color-neutro-400)] p-3 text-center">
                  {search ? "Sin resultados" : "No hay divisas registradas"}
                </p>
              ) : filteredDivisas.map((d) => (
                <button
                  key={d.id}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-corner-m text-left text-[13px] transition-colors ${
                    selectedId === d.id
                      ? "bg-[var(--color-verde-100)] text-white font-semibold"
                      : "text-[var(--color-neutro-700)] hover:bg-[var(--color-neutro-100)]"
                  }`}
                  onClick={() => setSelectedId(d.id)}
                >
                  <span className="font-mono font-bold text-[15px]">{d.simbolo}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate">{d.nombre}</p>
                    <p className={`text-[11px] truncate ${selectedId === d.id ? "text-white/70" : "text-[var(--color-neutro-400)]"}`}>
                      {d.codigoISO} — {d.paisOrigen}
                    </p>
                  </div>
                  <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${d.activo ? "bg-green-400" : "bg-red-300"}`} />
                </button>
              ))
            ) : (
              filteredClasificaciones.length === 0 ? (
                <p className="text-[13px] text-[var(--color-neutro-400)] p-3 text-center">
                  {search ? "Sin resultados" : "No hay clasificaciones registradas"}
                </p>
              ) : filteredClasificaciones.map((c) => (
                <button
                  key={c.id}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-corner-m text-left text-[13px] transition-colors ${
                    selectedId === c.id
                      ? "bg-[var(--color-verde-100)] text-white font-semibold"
                      : "text-[var(--color-neutro-700)] hover:bg-[var(--color-neutro-100)]"
                  }`}
                  onClick={() => setSelectedId(c.id)}
                >
                  <span className="inline-block w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate">{c.nombre}</p>
                    <p className={`text-[11px] truncate ${selectedId === c.id ? "text-white/70" : "text-[var(--color-neutro-400)]"}`}>
                      {c.descripcion || "—"}
                    </p>
                  </div>
                  <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${c.activo ? "bg-green-400" : "bg-red-300"}`} />
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right: Detail Panel */}
        <div className="flex-1 overflow-y-auto">
          {isDivisasView ? (
            selectedDivisa ? (
              <DivisaDetail
                divisa={selectedDivisa}
                denominaciones={denominacionesDeDivisa}
                fajos={fajosDeDivisa}
                onEdit={() => { setEditId(selectedDivisa.id); setFormOpen(true); }}
                onDelete={() => setDeleteTarget({ type: "divisa", id: selectedDivisa.id })}
                onAddDenominacion={() => { setEditDenId(null); setDenFormOpen(true); }}
                onEditDenominacion={(id) => { setEditDenId(id); setDenFormOpen(true); }}
                onDeleteDenominacion={(id) => setDeleteTarget({ type: "denominacion", id })}
                onAddFajo={() => { setEditFajoId(null); setFajoFormOpen(true); }}
                onEditFajo={(id) => { setEditFajoId(id); setFajoFormOpen(true); }}
                onDeleteFajo={(id) => setDeleteTarget({ type: "fajo", id })}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <Banknote className="w-10 h-10 text-[var(--color-neutro-300)] mb-2" />
                <p className="text-[13px] text-[var(--color-neutro-400)]">
                  Seleccione una divisa de la lista para ver sus detalles
                </p>
              </div>
            )
          ) : (
            selectedClasificacion ? (
              <ClasificacionDetail
                clasificacion={selectedClasificacion}
                onEdit={() => { setEditClaId(selectedClasificacion.id); setClaFormOpen(true); }}
                onDelete={() => setDeleteTarget({ type: "clasificacion", id: selectedClasificacion.id })}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <Tags className="w-10 h-10 text-[var(--color-neutro-300)] mb-2" />
                <p className="text-[13px] text-[var(--color-neutro-400)]">
                  Seleccione una clasificación de la lista para ver sus detalles
                </p>
              </div>
            )
          )}
        </div>
      </div>

      {/* ── Form Modals ── */}
      <CurrencyForm open={formOpen} onClose={() => { setFormOpen(false); setEditId(null); }} editId={editId} />

      <DenominationForm
        open={denFormOpen}
        onClose={() => { setDenFormOpen(false); setEditDenId(null); }}
        editId={editDenId}
        divisaId={selectedId ?? ""}
      />

      <BundleForm
        open={fajoFormOpen}
        onClose={() => { setFajoFormOpen(false); setEditFajoId(null); }}
        editId={editFajoId}
        defaultDivisaId={selectedId ?? ""}
      />

      <ClassificationForm
        open={claFormOpen}
        onClose={() => { setClaFormOpen(false); setEditClaId(null); }}
        editId={editClaId}
      />

      {/* Delete Dialog */}
      <DeleteDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}
        title="Eliminar"
        description="¿Está seguro de eliminar este registro?"
        onConfirm={handleDelete}
      />
    </div>
  );
}

/* ── Divisa Detail Panel ── */
function DivisaDetail({
  divisa, denominaciones, fajos,
  onEdit, onDelete,
  onAddDenominacion, onEditDenominacion, onDeleteDenominacion,
  onAddFajo, onEditFajo, onDeleteFajo,
}: {
  divisa: ReturnType<typeof useDivisasStore.getState>["divisas"][number];
  denominaciones: ReturnType<typeof useDivisasStore.getState>["denominaciones"];
  fajos: ReturnType<typeof useDivisasStore.getState>["fajos"];
  onEdit: () => void;
  onDelete: () => void;
  onAddDenominacion: () => void;
  onEditDenominacion: (id: string) => void;
  onDeleteDenominacion: (id: string) => void;
  onAddFajo: () => void;
  onEditFajo: (id: string) => void;
  onDeleteFajo: (id: string) => void;
}) {
  const store = useDivisasStore();

  return (
    <div className={`space-y-4 ${!divisa.activo ? "opacity-50" : ""}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-[24px] font-bold text-[var(--color-verde-100)]">{divisa.simbolo}</span>
          <div>
            <h3 className="text-[16px] font-bold text-[var(--color-neutro-900)]">{divisa.nombre}</h3>
            <p className="text-[13px] text-[var(--color-neutro-500)]">{divisa.codigoISO} — {divisa.paisOrigen}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button className="p-1.5 rounded-corner-m hover:bg-[var(--color-neutro-100)] text-[var(--color-neutro-500)] transition-colors" title="Editar" onClick={onEdit}>
            <Pencil className="w-4 h-4" />
          </button>
          <button className="p-1.5 rounded-corner-m hover:bg-red-50 text-red-400 transition-colors" title="Eliminar" onClick={onDelete}>
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-5 gap-3">
        <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <p className="text-[11px] text-[var(--color-neutro-500)] uppercase tracking-wide mb-0.5">Tipo</p>
          <span className="text-[12px] font-semibold px-2 py-0.5 rounded-corner-m bg-[var(--color-verde-100)]/10 text-[var(--color-verde-100)]">
            {divisa.tipoMoneda}
          </span>
        </div>
        <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <p className="text-[11px] text-[var(--color-neutro-500)] uppercase tracking-wide mb-0.5">País / Región</p>
          <p className="text-[13px] font-semibold text-[var(--color-neutro-900)]">{divisa.paisOrigen}</p>
        </div>
        <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <p className="text-[11px] text-[var(--color-neutro-500)] uppercase tracking-wide mb-0.5">Tasa de Cambio</p>
          <p className="text-[13px] font-semibold text-[var(--color-neutro-900)]">{divisa.tasaCambio}</p>
        </div>
        <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <p className="text-[11px] text-[var(--color-neutro-500)] uppercase tracking-wide mb-0.5">Factor Redondeo</p>
          <p className="text-[13px] font-semibold text-[var(--color-neutro-900)]">{divisa.factorRedondeo}</p>
        </div>
        <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <p className="text-[11px] text-[var(--color-neutro-500)] uppercase tracking-wide mb-1">Estado</p>
          <div className="flex items-center gap-2">
            <Switch checked={divisa.activo} onChange={(v) => store.updateDivisa(divisa.id, { activo: v })} />
            <span className={`text-[12px] font-semibold ${divisa.activo ? "text-green-600" : "text-red-500"}`}>
              {divisa.activo ? "Activo" : "Inactivo"}
            </span>
          </div>
        </div>
      </div>

      {/* Denominaciones section */}
      <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between px-3 pt-3 pb-2">
          <p className="text-[13px] font-semibold text-[var(--color-neutro-700)]">
            Denominaciones ({denominaciones.length})
          </p>
          <button className="flex items-center gap-1 text-[12px] font-medium text-[var(--color-verde-100)] hover:underline" onClick={onAddDenominacion}>
            <Plus className="w-3.5 h-3.5" /> Agregar
          </button>
        </div>
        <div className="overflow-x-auto">
          <DenominationTable denominaciones={denominaciones} onEdit={onEditDenominacion} onDelete={onDeleteDenominacion} />
        </div>
      </div>

      {/* Fajos section */}
      <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between px-3 pt-3 pb-2">
          <p className="text-[13px] font-semibold text-[var(--color-neutro-700)]">
            Configuración de Fajos ({fajos.length})
          </p>
          <button className="flex items-center gap-1 text-[12px] font-medium text-[var(--color-verde-100)] hover:underline" onClick={onAddFajo}>
            <Plus className="w-3.5 h-3.5" /> Agregar
          </button>
        </div>
        <div className="overflow-x-auto">
          <BundleTable fajos={fajos} onEdit={onEditFajo} onDelete={onDeleteFajo} />
        </div>
      </div>
    </div>
  );
}

/* ── Clasificacion Detail Panel ── */
function ClasificacionDetail({
  clasificacion, onEdit, onDelete,
}: {
  clasificacion: ReturnType<typeof useDivisasStore.getState>["clasificaciones"][number];
  onEdit: () => void;
  onDelete: () => void;
}) {
  const store = useDivisasStore();

  return (
    <div className={`space-y-4 ${!clasificacion.activo ? "opacity-50" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-block w-6 h-6 rounded-full" style={{ backgroundColor: clasificacion.color }} />
          <div>
            <h3 className="text-[16px] font-bold text-[var(--color-neutro-900)]">{clasificacion.nombre}</h3>
            <p className="text-[13px] text-[var(--color-neutro-500)]">{clasificacion.descripcion || "—"}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button className="p-1.5 rounded-corner-m hover:bg-[var(--color-neutro-100)] text-[var(--color-neutro-500)] transition-colors" title="Editar" onClick={onEdit}>
            <Pencil className="w-4 h-4" />
          </button>
          <button className="p-1.5 rounded-corner-m hover:bg-red-50 text-red-400 transition-colors" title="Eliminar" onClick={onDelete}>
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <p className="text-[11px] text-[var(--color-neutro-500)] uppercase tracking-wide mb-0.5">Color</p>
          <div className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 rounded-corner-m border border-[var(--color-neutro-200)]" style={{ backgroundColor: clasificacion.color }} />
            <span className="text-[13px] font-mono font-semibold text-[var(--color-neutro-900)]">{clasificacion.color}</span>
          </div>
        </div>
        <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <p className="text-[11px] text-[var(--color-neutro-500)] uppercase tracking-wide mb-0.5">Descripción</p>
          <p className="text-[13px] text-[var(--color-neutro-900)]">{clasificacion.descripcion || "—"}</p>
        </div>
        <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <p className="text-[11px] text-[var(--color-neutro-500)] uppercase tracking-wide mb-1">Estado</p>
          <div className="flex items-center gap-2">
            <Switch checked={clasificacion.activo} onChange={(v) => store.updateClasificacion(clasificacion.id, { activo: v })} />
            <span className={`text-[12px] font-semibold ${clasificacion.activo ? "text-green-600" : "text-red-500"}`}>
              {clasificacion.activo ? "Activo" : "Inactivo"}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="p-3">
          <p className="text-[13px] font-semibold text-[var(--color-neutro-700)] mb-2">Resumen</p>
          <table className="w-full text-[13px]">
            <thead className="bg-[var(--color-neutro-50)] text-[12px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">Nombre</th>
                <th className="text-left px-4 py-3">Descripción</th>
                <th className="text-left px-4 py-3">Color</th>
                <th className="text-center px-4 py-3">Activo</th>
                <th className="text-right px-4 py-3 w-[80px]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr className={`border-t border-[var(--color-neutro-100)] ${!clasificacion.activo ? "opacity-50" : ""}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: clasificacion.color }} />
                    <span className="font-medium text-[var(--color-neutro-900)]">{clasificacion.nombre}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[var(--color-neutro-500)]">{clasificacion.descripcion}</td>
                <td className="px-4 py-3 text-[12px] font-mono text-[var(--color-neutro-500)]">{clasificacion.color}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-corner-m text-[11px] font-semibold ${clasificacion.activo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {clasificacion.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button className="p-1.5 rounded-corner-m hover:bg-[var(--color-neutro-100)] text-[var(--color-neutro-400)] transition-colors" onClick={onEdit}>
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 rounded-corner-m hover:bg-red-50 text-red-400 transition-colors" onClick={onDelete}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
