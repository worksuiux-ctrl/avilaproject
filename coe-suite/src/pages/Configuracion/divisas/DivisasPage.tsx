import { useState, useMemo, useEffect } from "react";
import { Plus, Search, Pencil, Trash2, Banknote, Tags, Coins, GripVertical, ArrowUpDown } from "lucide-react";
import { Button, Input, Switch } from "@coe/design-system";
import { useDivisasStore, type StableCoin } from "@stores/divisasStore";
import { DeleteDialog } from "@components/shared/DeleteDialog";
import { CurrencyForm } from "./CurrencyForm";
import { DenominationForm } from "./DenominationForm";
import { DenominationTable } from "./DenominationTable";
import { BundleForm } from "./BundleForm";
import { BundleTable } from "./BundleTable";
import { ClassificationForm } from "./ClassificationForm";
import { StableCoinForm } from "./StableCoinForm";

type ViewMode = "divisas" | "clasificaciones" | "stablecoins" | "tasas";

export function DivisasPage() {
  const store = useDivisasStore();

  const [view, setView] = useState<ViewMode>("divisas");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(() => store.divisas[0]?.id ?? null);
  const [tipoFilter, setTipoFilter] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

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

  const [scFormOpen, setScFormOpen] = useState(false);
  const [editScId, setEditScId] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string } | null>(null);

  const isDivisasView = view === "divisas";
  const isClasificacionesView = view === "clasificaciones";
  const isStableCoinsView = view === "stablecoins";
  const isTasasView = view === "tasas";

  const selectedDivisa = useMemo(
    () => (isDivisasView ? store.divisas.find((d) => d.id === selectedId) : undefined),
    [store.divisas, selectedId, isDivisasView]
  );

  const selectedClasificacion = useMemo(
    () => (isClasificacionesView ? store.clasificaciones.find((c) => c.id === selectedId) : undefined),
    [store.clasificaciones, selectedId, isClasificacionesView]
  );

  const selectedStableCoin = useMemo(
    () => (isStableCoinsView ? store.stableCoins.find((s) => s.id === selectedId) : undefined),
    [store.stableCoins, selectedId, isStableCoinsView]
  );

  /* ── Divisas filtered ── */
  const filteredDivisas = useMemo(() => {
    let list = store.divisas;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) => d.nombre.toLowerCase().includes(q) || d.codigoISO.toLowerCase().includes(q) || d.paisOrigen.toLowerCase().includes(q)
      );
    }
    if (tipoFilter) {
      list = list.filter((d) => d.tipoMoneda === tipoFilter);
    }
    return [...list].sort((a, b) => (a.id === store.divisaBaseId ? -1 : b.id === store.divisaBaseId ? 1 : 0));
  }, [store.divisas, store.divisaBaseId, search, tipoFilter]);

  /* ── Clasificaciones filtered ── */
  const filteredClasificaciones = useMemo(() => {
    if (!search) return store.clasificaciones;
    const q = search.toLowerCase();
    return store.clasificaciones.filter((c) => c.nombre.toLowerCase().includes(q) || c.descripcion.toLowerCase().includes(q));
  }, [store.clasificaciones, search]);

  /* ── StableCoins filtered ── */
  const filteredStableCoins = useMemo(() => {
    if (!search) return store.stableCoins;
    const q = search.toLowerCase();
    return store.stableCoins.filter(
      (s) => s.nombre.toLowerCase().includes(q) || s.codigoISO.toLowerCase().includes(q) || s.redBlockchain.toLowerCase().includes(q)
    );
  }, [store.stableCoins, search]);

  /* Auto-select first item so detail panel is never empty */
  useEffect(() => {
    const list = isDivisasView ? filteredDivisas : isClasificacionesView ? filteredClasificaciones : isStableCoinsView ? filteredStableCoins : store.divisas;
    if (list.length > 0) {
      if (!selectedId || !list.some((item) => item.id === selectedId)) {
        setSelectedId(list[0].id);
      }
    } else {
      setSelectedId(null);
    }
  }, [isDivisasView, isClasificacionesView, isStableCoinsView, filteredDivisas, filteredClasificaciones, filteredStableCoins, store.divisas]);

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
      if (deleteTarget.id === store.divisaBaseId) {
        if (!window.confirm("Esta es la Divisa Base del sistema. Si la elimina, la primera divisa disponible pasará a ser la nueva base. ¿Continuar?")) {
          setDeleteTarget(null);
          return;
        }
      }
      store.removeDivisa(deleteTarget.id);
    } else if (deleteTarget.type === "denominacion") {
      store.removeDenominacion(deleteTarget.id);
    } else if (deleteTarget.type === "fajo") {
      store.removeFajo(deleteTarget.id);
    } else if (deleteTarget.type === "clasificacion") {
      store.removeClasificacion(deleteTarget.id);
    } else if (deleteTarget.type === "stablecoin") {
      store.removeStableCoin(deleteTarget.id);
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
          <button
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold rounded-corner-m transition-all ${view === "stablecoins" ? "bg-white text-[var(--color-neutro-900)] shadow-sm" : "text-[var(--color-neutro-500)] hover:text-[var(--color-neutro-700)]"}`}
            onClick={() => switchView("stablecoins")}
          >
            <Coins className="w-3.5 h-3.5" /> Stable Coins
          </button>
          <button
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold rounded-corner-m transition-all ${view === "tasas" ? "bg-white text-[var(--color-neutro-900)] shadow-sm" : "text-[var(--color-neutro-500)] hover:text-[var(--color-neutro-700)]"}`}
            onClick={() => switchView("tasas")}
          >
            <ArrowUpDown className="w-3.5 h-3.5" /> Tasas
          </button>
        </div>
        {!isTasasView && (
        <>
        <div className="flex-1 max-w-md flex items-center gap-2">
          <div className="flex-1">
            <Input
              prefix={<Search className="w-4 h-4" />}
              placeholder={isDivisasView ? "Buscar divisa..." : isClasificacionesView ? "Buscar clasificación..." : "Buscar stable coin..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {isDivisasView && (
            <select
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
              className="text-[12px] px-2 py-1.5 rounded-corner-m border border-[var(--color-neutro-200)] bg-white outline-none focus:border-[var(--color-verde-100)]"
            >
              <option value="">Todos</option>
              <option value="Divisa">Divisa</option>
              <option value="Moneda">Moneda</option>
              <option value="Oro">Oro</option>
              <option value="Stable Coin">Stable Coin</option>
            </select>
          )}
        </div>
        <Button
          size="sm"
          iconLeft={<Plus className="w-6 h-6" />}
          onClick={() => {
            if (isDivisasView) { setEditId(null); setFormOpen(true); }
            else if (isClasificacionesView) { setEditClaId(null); setClaFormOpen(true); }
            else { setEditScId(null); setScFormOpen(true); }
          }}
        >
          {isDivisasView ? "Nueva Divisa" : isClasificacionesView ? "Nueva Clasificación" : "Nueva Stable Coin"}
        </Button>
        </>
        )}
      </div>

      {/* Two-panel layout */}
      <div className="flex-1 flex gap-4 min-h-0">
        {!isTasasView && <><div className="w-[300px] shrink-0 bg-white border border-[var(--color-neutro-200)] rounded-corner-m overflow-y-auto">
          <div className="p-3 border-b border-[var(--color-neutro-200)]">
            <p className="text-[12px] font-semibold text-[var(--color-neutro-600)] uppercase tracking-wide">
              {isDivisasView ? `Divisas (${store.divisas.length})` : isClasificacionesView ? `Clasificaciones (${store.clasificaciones.length})` : `Stable Coins (${store.stableCoins.length})`}
            </p>
          </div>
          <div className="p-2 space-y-0.5">
            {isDivisasView ? (
              filteredDivisas.length === 0 ? (
                <p className="text-[13px] text-[var(--color-neutro-400)] p-3 text-center">
                  {search ? "Sin resultados" : "No hay divisas registradas"}
                </p>
              ) : filteredDivisas.map((d, idx) => (
                <div key={d.id}>
                  {/* Drop indicator line */}
                  {dragIndex !== null && dragOverIndex === idx && dragIndex !== idx && (
                    <div className="h-0.5 bg-[var(--color-verde-100)] rounded-full mx-1 mb-0.5" />
                  )}
                  <div
                    draggable
                    className={`flex items-center gap-1 px-2 py-1 rounded-corner-m transition-colors ${
                      selectedId === d.id
                        ? "bg-[var(--color-verde-100)] text-white"
                        : "text-[var(--color-neutro-700)] hover:bg-[var(--color-neutro-100)]"
                    } ${dragIndex === idx ? "opacity-40" : ""}`}
                    onDragStart={() => { setDragIndex(idx); setDragOverIndex(idx); }}
                    onDragEnter={(e) => { e.preventDefault(); if (dragIndex !== null && dragIndex !== idx) setDragOverIndex(idx); }}
                    onDragEnd={() => { if (dragIndex !== null && dragOverIndex !== null && dragIndex !== dragOverIndex) { store.reorderDivisas(dragIndex, dragOverIndex); } setDragIndex(null); setDragOverIndex(null); }}
                    onDragOver={(e) => { e.preventDefault(); }}
                  >
                  <span className="cursor-grab active:cursor-grabbing shrink-0 text-[var(--color-neutro-300)] hover:text-[var(--color-neutro-500)]" onMouseDown={(e) => e.stopPropagation()}>
                    <GripVertical className="w-3.5 h-3.5" />
                  </span>
                  <button
                    className="flex items-center gap-2 flex-1 min-w-0 py-1.5 text-left"
                    onClick={() => setSelectedId(d.id)}
                  >
                    <span className={`flex items-center justify-center w-9 h-9 rounded-corner-m font-bold text-[15px] font-mono shrink-0 ${
                      selectedId === d.id
                        ? "bg-white/20 text-white"
                        : "bg-[var(--color-neutro-100)] text-[var(--color-neutro-600)]"
                    }`}>
                      {d.simbolo}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-[13px] font-semibold truncate ${selectedId === d.id ? "text-white" : "text-[var(--color-neutro-900)]"}`}>
                        {d.nombre}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className={`text-[10px] font-mono font-bold px-1 py-0.5 rounded-corner-m ${
                          selectedId === d.id
                            ? "bg-white/20 text-white/90"
                            : "bg-[var(--color-neutro-100)] text-[var(--color-neutro-500)]"
                        }`}>
                          {d.codigoISO}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {store.divisaBaseId === d.id ? (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-corner-m ${
                          selectedId === d.id ? "bg-white/20 text-white" : "bg-amber-100 text-amber-700"
                        }`}>Base</span>
                      ) : null}
                      <span className={`inline-block w-2 h-2 rounded-full ${d.activo ? "bg-green-400" : "bg-red-300"}`} />
                    </div>
                  </button>
                </div>
              </div>
              ))
            ) : isClasificacionesView ? (
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
            ) : (
              filteredStableCoins.length === 0 ? (
                <p className="text-[13px] text-[var(--color-neutro-400)] p-3 text-center">
                  {search ? "Sin resultados" : "No hay stable coins registradas"}
                </p>
              ) : filteredStableCoins.map((s) => (
                <button
                  key={s.id}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-corner-m text-left transition-colors ${
                    selectedId === s.id
                      ? "bg-[var(--color-verde-100)] text-white"
                      : "text-[var(--color-neutro-700)] hover:bg-[var(--color-neutro-100)]"
                  }`}
                  onClick={() => setSelectedId(s.id)}
                >
                  <span className={`flex items-center justify-center w-10 h-10 rounded-corner-m font-bold text-[18px] font-mono shrink-0 ${
                    selectedId === s.id
                      ? "bg-white/20 text-white"
                      : "bg-purple-100 text-purple-600"
                  }`}>
                    {s.simbolo || s.codigoISO.charAt(0)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`text-[14px] font-semibold truncate ${selectedId === s.id ? "text-white" : "text-[var(--color-neutro-900)]"}`}>
                      {s.nombre}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded-corner-m ${
                        selectedId === s.id
                          ? "bg-white/20 text-white/90"
                          : "bg-purple-100 text-purple-600"
                      }`}>
                        {s.codigoISO}
                      </span>
                      <span className={`text-[11px] ${selectedId === s.id ? "text-white/60" : "text-[var(--color-neutro-400)]"}`}>
                        {s.redBlockchain}
                      </span>
                    </div>
                  </div>
                  <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${s.activo ? "bg-green-400" : "bg-red-300"}`} />
                </button>
              ))
            )}
          </div>
        </div>
        </>}

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
          ) : isClasificacionesView ? (
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
          ) : isTasasView ? (
            <RatesTable
              divisas={store.divisas}
              divisaBaseId={store.divisaBaseId}
              onUpdateTasa={(id, tasa) => store.updateDivisa(id, { tasaCambio: tasa })}
              onSetBase={store.setDivisaBase}
            />
          ) : (
            selectedStableCoin ? (
              <StableCoinDetail
                stableCoin={selectedStableCoin}
                onEdit={() => { setEditScId(selectedStableCoin.id); setScFormOpen(true); }}
                onDelete={() => setDeleteTarget({ type: "stablecoin", id: selectedStableCoin.id })}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <Coins className="w-10 h-10 text-[var(--color-neutro-300)] mb-2" />
                <p className="text-[13px] text-[var(--color-neutro-400)]">
                  Seleccione una stable coin de la lista para ver sus detalles
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

      <StableCoinForm
        open={scFormOpen}
        onClose={() => { setScFormOpen(false); setEditScId(null); }}
        editId={editScId}
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
          {store.divisaBaseId !== divisa.id ? (
            <button
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-corner-m text-[12px] font-medium border border-[var(--color-neutro-200)] text-[var(--color-neutro-500)] hover:border-amber-300 hover:text-amber-600 transition-colors"
              title="Seleccionar como Divisa Base"
              onClick={() => store.setDivisaBase(divisa.id)}
            >
              <svg width="14" height="14" viewBox="0 0 60 60" fill="none"><path d="M38.3282 31.502C35.2901 33.8918 30.8893 33.3658 28.4989 30.3271C26.1085 27.2884 26.6336 22.8878 29.6718 20.498C32.7099 18.1082 37.1107 18.6342 39.5011 21.6729C41.8915 24.7116 41.3664 29.1122 38.3282 31.502Z" fill="#88C63A"/><path fill-rule="evenodd" clip-rule="evenodd" d="M60 29.897C60 27.8435 58.6833 26.0214 56.7335 25.3768L54.1289 24.5157C52.5779 24.0029 51.3278 22.8391 50.7056 21.3287C50.1017 19.8629 50.1468 18.21 50.8296 16.7793L52.0705 14.1791C52.9446 12.3475 52.5708 10.164 51.1373 8.72746C49.6745 7.26145 47.4356 6.90043 45.5861 7.8323L43.2233 9.02275C41.7663 9.75688 40.0618 9.82034 38.5542 9.19659C37.0914 8.5914 35.9524 7.3964 35.418 5.90629L34.4384 3.17456C33.7555 1.27033 31.9505 0 29.9275 0C27.85 0 26.0091 1.3386 25.3687 3.31493L24.5546 5.82705C24.04 7.41525 22.8499 8.69492 21.3032 9.32332C19.8272 9.92299 18.1667 9.8723 16.73 9.18371L14.1654 7.95453C12.3291 7.07443 10.1372 7.45014 8.69893 8.89156C7.2408 10.3528 6.88161 12.5833 7.80728 14.4285L9.00921 16.8242C9.73837 18.2777 9.80142 19.9759 9.18205 21.4794C8.5752 22.9524 7.37097 24.0982 5.86955 24.6311L3.18077 25.5854C1.27402 26.2622 0 28.0663 0 30.0896C0 32.1511 1.32184 33.9803 3.27918 34.6274L5.87112 35.4843C7.42209 35.9971 8.67222 37.1609 9.29443 38.6713C9.89827 40.1371 9.85322 41.79 9.17044 43.2207L7.92951 45.8209C7.05542 47.6525 7.42917 49.836 8.86267 51.2725C10.3255 52.7386 12.5644 53.0996 14.4139 52.1677L16.7766 50.9773C18.2337 50.2431 19.9382 50.1797 21.4458 50.8034C22.9086 51.4086 24.0476 52.6036 24.582 54.0937L25.5687 56.8453C26.2473 58.7376 28.0411 60 30.0514 60C32.116 60 33.9453 58.6698 34.5818 56.7058L35.4025 54.173C35.9172 52.5848 37.1072 51.3051 38.654 50.6767C40.13 50.077 41.7905 50.1277 43.2271 50.8163L45.7989 52.0489C47.6309 52.9269 49.8176 52.5521 51.2526 51.1141C52.7128 49.6507 53.0678 47.415 52.1327 45.5713L50.9536 43.2465C50.1954 41.7518 50.1401 39.9976 50.8025 38.458C51.4206 37.0215 52.6065 35.9054 54.0779 35.3755L56.8523 34.3763C58.7409 33.6961 60 31.9044 60 29.897ZM30 45.5548C21.4233 45.5548 14.5 38.6166 14.5 30.0215C14.5 21.4264 21.4233 14.4882 30 14.4882C42 14.4882 45.5 18 45.5 30.0215C45.5 38.6166 38.5767 45.5548 30 45.5548Z" fill="#88C63A"/></svg> Seleccionar como Divisa Base
            </button>
          ) : (
            <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-corner-m text-[12px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
              <svg width="14" height="14" viewBox="0 0 60 60" fill="none"><path d="M38.3282 31.502C35.2901 33.8918 30.8893 33.3658 28.4989 30.3271C26.1085 27.2884 26.6336 22.8878 29.6718 20.498C32.7099 18.1082 37.1107 18.6342 39.5011 21.6729C41.8915 24.7116 41.3664 29.1122 38.3282 31.502Z" fill="#88C63A"/><path fill-rule="evenodd" clip-rule="evenodd" d="M60 29.897C60 27.8435 58.6833 26.0214 56.7335 25.3768L54.1289 24.5157C52.5779 24.0029 51.3278 22.8391 50.7056 21.3287C50.1017 19.8629 50.1468 18.21 50.8296 16.7793L52.0705 14.1791C52.9446 12.3475 52.5708 10.164 51.1373 8.72746C49.6745 7.26145 47.4356 6.90043 45.5861 7.8323L43.2233 9.02275C41.7663 9.75688 40.0618 9.82034 38.5542 9.19659C37.0914 8.5914 35.9524 7.3964 35.418 5.90629L34.4384 3.17456C33.7555 1.27033 31.9505 0 29.9275 0C27.85 0 26.0091 1.3386 25.3687 3.31493L24.5546 5.82705C24.04 7.41525 22.8499 8.69492 21.3032 9.32332C19.8272 9.92299 18.1667 9.8723 16.73 9.18371L14.1654 7.95453C12.3291 7.07443 10.1372 7.45014 8.69893 8.89156C7.2408 10.3528 6.88161 12.5833 7.80728 14.4285L9.00921 16.8242C9.73837 18.2777 9.80142 19.9759 9.18205 21.4794C8.5752 22.9524 7.37097 24.0982 5.86955 24.6311L3.18077 25.5854C1.27402 26.2622 0 28.0663 0 30.0896C0 32.1511 1.32184 33.9803 3.27918 34.6274L5.87112 35.4843C7.42209 35.9971 8.67222 37.1609 9.29443 38.6713C9.89827 40.1371 9.85322 41.79 9.17044 43.2207L7.92951 45.8209C7.05542 47.6525 7.42917 49.836 8.86267 51.2725C10.3255 52.7386 12.5644 53.0996 14.4139 52.1677L16.7766 50.9773C18.2337 50.2431 19.9382 50.1797 21.4458 50.8034C22.9086 51.4086 24.0476 52.6036 24.582 54.0937L25.5687 56.8453C26.2473 58.7376 28.0411 60 30.0514 60C32.116 60 33.9453 58.6698 34.5818 56.7058L35.4025 54.173C35.9172 52.5848 37.1072 51.3051 38.654 50.6767C40.13 50.077 41.7905 50.1277 43.2271 50.8163L45.7989 52.0489C47.6309 52.9269 49.8176 52.5521 51.2526 51.1141C52.7128 49.6507 53.0678 47.415 52.1327 45.5713L50.9536 43.2465C50.1954 41.7518 50.1401 39.9976 50.8025 38.458C51.4206 37.0215 52.6065 35.9054 54.0779 35.3755L56.8523 34.3763C58.7409 33.6961 60 31.9044 60 29.897ZM30 45.5548C21.4233 45.5548 14.5 38.6166 14.5 30.0215C14.5 21.4264 21.4233 14.4882 30 14.4882C42 14.4882 45.5 18 45.5 30.0215C45.5 38.6166 38.5767 45.5548 30 45.5548Z" fill="#88C63A"/></svg> Divisa Base
            </span>
          )}
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


/* ── StableCoin Detail Panel ── */
function StableCoinDetail({ stableCoin, onEdit, onDelete }: { stableCoin: StableCoin; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className={`space-y-4 ${!stableCoin.activo ? "opacity-50" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-12 h-12 rounded-corner-m font-bold text-[20px] font-mono bg-purple-100 text-purple-600 shrink-0">
            {stableCoin.simbolo || stableCoin.codigoISO.charAt(0)}
          </span>
          <div>
            <h3 className="text-[16px] font-bold text-[var(--color-neutro-900)]">{stableCoin.nombre}</h3>
            <p className="text-[13px] text-[var(--color-neutro-500)]">{stableCoin.codigoISO}</p>
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

      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <p className="text-[11px] text-[var(--color-neutro-500)] uppercase tracking-wide mb-0.5">Red Blockchain</p>
          <p className="text-[13px] font-semibold text-[var(--color-neutro-900)]">{stableCoin.redBlockchain}</p>
        </div>
        <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <p className="text-[11px] text-[var(--color-neutro-500)] uppercase tracking-wide mb-0.5">Tipo Colateral</p>
          <span className="text-[12px] font-semibold px-2 py-0.5 rounded-corner-m bg-purple-50 text-purple-700">{stableCoin.collateralType}</span>
        </div>
        <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <p className="text-[11px] text-[var(--color-neutro-500)] uppercase tracking-wide mb-0.5">Anclada a</p>
          <p className="text-[13px] font-semibold text-[var(--color-neutro-900)]">{stableCoin.peggedTo}</p>
        </div>
        <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <p className="text-[11px] text-[var(--color-neutro-500)] uppercase tracking-wide mb-1">Estado</p>
          <div className="flex items-center gap-2">
            <span className={`text-[12px] font-semibold ${stableCoin.activo ? "text-green-600" : "text-red-500"}`}>
              {stableCoin.activo ? "Activo" : "Inactivo"}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <p className="text-[11px] text-[var(--color-neutro-500)] uppercase tracking-wide mb-1">Dirección del Contrato</p>
        <p className="text-[13px] font-mono text-[var(--color-neutro-900)] break-all bg-[var(--color-neutro-50)] p-2 rounded-corner-m">{stableCoin.contractAddress || "—"}</p>
      </div>
    </div>
  );
}

/* ── Rates Table ── */
function RatesTable({ divisas, divisaBaseId, onUpdateTasa, onSetBase }: {
  divisas: ReturnType<typeof useDivisasStore.getState>["divisas"];
  divisaBaseId: string;
  onUpdateTasa: (id: string, tasa: number) => void;
  onSetBase: (id: string) => void;
}) {
  const [selectedId, setSelectedId] = useState(divisaBaseId || divisas[0]?.id || "");
  const selected = divisas.find((d) => d.id === selectedId);
  const otras = divisas.filter((d) => d.id !== selectedId && d.activo && selected?.id);

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="text-[16px] font-bold text-[var(--color-neutro-900)]">Equivalencia de Divisas</h3>
        <p className="text-[13px] text-[var(--color-neutro-500)]">Seleccione una divisa para ver su equivalencia con las demás.</p>
      </div>

      {/* Selector */}
      <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <p className="text-[11px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide mb-2">Divisa de referencia</p>
        <div className="flex flex-wrap gap-2">
          {divisas.filter((d) => d.activo).map((d) => {
            const isBase = d.id === divisaBaseId;
            const isSelected = d.id === selectedId;
            return (
              <button key={d.id}
                className={`flex items-center gap-2 px-3 py-2 rounded-corner-m text-[13px] font-medium border transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-[var(--color-verde-100)] text-white border-[var(--color-verde-100)]"
                    : "bg-white text-[var(--color-neutro-700)] border-[var(--color-neutro-200)] hover:border-[var(--color-verde-100)]"
                }`}
                onClick={() => setSelectedId(d.id)}
              >
                <span className="font-mono font-bold">{d.simbolo}</span>
                <span>{d.codigoISO}</span>
                {isBase && (
                  <svg width="12" height="12" viewBox="0 0 60 60" className={isSelected ? "fill-white" : "fill-[#88C63A]"}><path d="M38.3282 31.502C35.2901 33.8918 30.8893 33.3658 28.4989 30.3271C26.1085 27.2884 26.6336 22.8878 29.6718 20.498C32.7099 18.1082 37.1107 18.6342 39.5011 21.6729C41.8915 24.7116 41.3664 29.1122 38.3282 31.502Z" /><path fill-rule="evenodd" clip-rule="evenodd" d="M60 29.897C60 27.8435 58.6833 26.0214 56.7335 25.3768L54.1289 24.5157C52.5779 24.0029 51.3278 22.8391 50.7056 21.3287C50.1017 19.8629 50.1468 18.21 50.8296 16.7793L52.0705 14.1791C52.9446 12.3475 52.5708 10.164 51.1373 8.72746C49.6745 7.26145 47.4356 6.90043 45.5861 7.8323L43.2233 9.02275C41.7663 9.75688 40.0618 9.82034 38.5542 9.19659C37.0914 8.5914 35.9524 7.3964 35.418 5.90629L34.4384 3.17456C33.7555 1.27033 31.9505 0 29.9275 0C27.85 0 26.0091 1.3386 25.3687 3.31493L24.5546 5.82705C24.04 7.41525 22.8499 8.69492 21.3032 9.32332C19.8272 9.92299 18.1667 9.8723 16.73 9.18371L14.1654 7.95453C12.3291 7.07443 10.1372 7.45014 8.69893 8.89156C7.2408 10.3528 6.88161 12.5833 7.80728 14.4285L9.00921 16.8242C9.73837 18.2777 9.80142 19.9759 9.18205 21.4794C8.5752 22.9524 7.37097 24.0982 5.86955 24.6311L3.18077 25.5854C1.27402 26.2622 0 28.0663 0 30.0896C0 32.1511 1.32184 33.9803 3.27918 34.6274L5.87112 35.4843C7.42209 35.9971 8.67222 37.1609 9.29443 38.6713C9.89827 40.1371 9.85322 41.79 9.17044 43.2207L7.92951 45.8209C7.05542 47.6525 7.42917 49.836 8.86267 51.2725C10.3255 52.7386 12.5644 53.0996 14.4139 52.1677L16.7766 50.9773C18.2337 50.2431 19.9382 50.1797 21.4458 50.8034C22.9086 51.4086 24.0476 52.6036 24.582 54.0937L25.5687 56.8453C26.2473 58.7376 28.0411 60 30.0514 60C32.116 60 33.9453 58.6698 34.5818 56.7058L35.4025 54.173C35.9172 52.5848 37.1072 51.3051 38.654 50.6767C40.13 50.077 41.7905 50.1277 43.2271 50.8163L45.7989 52.0489C47.6309 52.9269 49.8176 52.5521 51.2526 51.1141C52.7128 49.6507 53.0678 47.415 52.1327 45.5713L50.9536 43.2465C50.1954 41.7518 50.1401 39.9976 50.8025 38.458C51.4206 37.0215 52.6065 35.9054 54.0779 35.3755L56.8523 34.3763C58.7409 33.6961 60 31.9044 60 29.897ZM30 45.5548C21.4233 45.5548 14.5 38.6166 14.5 30.0215C14.5 21.4264 21.4233 14.4882 30 14.4882C42 14.4882 45.5 18 45.5 30.0215C45.5 38.6166 38.5767 45.5548 30 45.5548Z" /></svg>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tasa y equivalencias */}
      {selected && (
        <>
          {/* Tasa de la divisa seleccionada */}
          <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <p className="text-[11px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide mb-1">Tasa de {selected.codigoISO}</p>
            <div className="flex items-center gap-3">
              <span className="text-[24px] font-bold text-[var(--color-neutro-900)] font-mono">{selected.simbolo}</span>
              <div className="flex items-center gap-2">
                <span className="text-[14px] text-[var(--color-neutro-500)]">1 {selected.codigoISO} =</span>
                {selected.id === divisaBaseId ? (
                  <span className="text-[20px] font-bold text-[var(--color-neutro-400)] font-mono">1.0000 (base)</span>
                ) : (
                  <input
                    type="number"
                    step={0.0001}
                    min={0}
                    value={selected.tasaCambio}
                    onChange={(e) => onUpdateTasa(selected.id, parseFloat(e.target.value) || 0)}
                    className="text-[20px] font-bold font-mono w-[140px] px-2 py-1 rounded-corner-m border border-[var(--color-neutro-200)] outline-none focus:border-[var(--color-verde-100)] bg-white text-right"
                  />
                )}
                <span className="text-[14px] text-[var(--color-neutro-500)]">{divisaBaseId ? divisas.find((d) => d.id === divisaBaseId)?.codigoISO ?? "" : ""}</span>
              </div>
            </div>
          </div>

          {/* Equivalencias con otras divisas */}
          <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="px-4 py-3 border-b border-[var(--color-neutro-100)]">
              <p className="text-[11px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide">Equivalencia con otras divisas</p>
            </div>
            <div className="divide-y divide-[var(--color-neutro-100)]">
              {otras.length === 0 ? (
                <p className="p-4 text-[13px] text-[var(--color-neutro-400)] text-center">No hay otras divisas activas para comparar</p>
              ) : otras.map((d) => {
                const tasaBaseDivisa = selected.id === divisaBaseId ? 1 : selected.tasaCambio || 0;
                const tasaOtra = d.id === divisaBaseId ? 1 : d.tasaCambio || 0;
                const equivalencia = tasaBaseDivisa > 0 ? tasaOtra / tasaBaseDivisa : 0;

                return (
                  <div key={d.id} className="flex items-center justify-between px-4 py-3 hover:bg-[var(--color-neutro-50)] transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-9 h-9 rounded-corner-m font-bold text-[16px] font-mono bg-[var(--color-neutro-100)] text-[var(--color-neutro-600)] shrink-0">
                        {d.simbolo}
                      </span>
                      <div>
                        <p className="text-[13px] font-semibold text-[var(--color-neutro-900)]">{d.nombre}</p>
                        <p className="text-[11px] text-[var(--color-neutro-500)]">{d.codigoISO}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[16px] font-bold font-mono text-[var(--color-neutro-900)]">
                        1 {selected.codigoISO} = {equivalencia.toFixed(4)} {d.codigoISO}
                      </p>
                      {d.id !== divisaBaseId && (
                        <button
                          className="text-[10px] font-medium text-[var(--color-neutro-400)] hover:text-amber-600 transition-colors cursor-pointer"
                          onClick={() => onSetBase(d.id)}
                        >Establecer como Divisa Base</button>
                      )}
                      {d.id === divisaBaseId && (
                        <span className="text-[10px] font-medium text-amber-600">Divisa Base</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
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

      <div className="grid grid-cols-4 gap-3">
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
        <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)] col-span-2">
          <p className="text-[11px] text-[var(--color-neutro-500)] uppercase tracking-wide mb-1">Aplica a divisas</p>
          <p className="text-[10px] text-[var(--color-neutro-400)] mb-1.5">Seleccione las divisas (vacío = todas)</p>
          <div className="flex flex-wrap gap-1.5">
            {store.divisas.filter((d) => d.activo).map((d) => {
              const selected = !clasificacion.divisasAplicables || clasificacion.divisasAplicables.length === 0 || clasificacion.divisasAplicables.includes(d.id);
              return (
                <button key={d.id} type="button"
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-corner-m text-[12px] font-medium border transition-colors cursor-pointer ${
                    selected
                      ? "bg-green-50 text-green-700 border-green-300"
                      : "bg-white text-[var(--color-neutro-400)] border-[var(--color-neutro-200)] hover:border-[var(--color-neutro-300)] opacity-60"
                  }`}
                  onClick={() => {
                    const current = clasificacion.divisasAplicables ?? [];
                    const next = current.includes(d.id)
                      ? current.filter((id) => id !== d.id)
                      : [...current, d.id];
                    store.updateClasificacion(clasificacion.id, { divisasAplicables: next });
                  }}
                >
                  <span className={`w-2 h-2 rounded-full ${selected ? "bg-green-500" : "bg-[var(--color-neutro-300)]"}`} />
                  {d.simbolo} {d.codigoISO}
                </button>
              );
            })}
          </div>
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
