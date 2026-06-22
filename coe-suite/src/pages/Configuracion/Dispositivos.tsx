import { useState, useMemo, useEffect } from "react";
import { Plus, Search, Pencil, Trash2, Cpu, Tags, Package, X, ChevronDown, GripVertical } from "lucide-react";
import { Button, Select, Input, Checkbox, Textarea } from "@coe/design-system";
import { Modal } from "@components/ui/Modal";
import { DeleteDialog } from "@components/shared/DeleteDialog";
import {
  useDispositivosStore,
  type CajetinConfig,
  type ATMMultifuncionalConfig,
  type ATMDepositoConfig,
  type ATMRemotoConfig,
  type CofreConfig,
  type POSConfig,
} from "@stores/dispositivosStore";

type Tab = "marcas" | "tipos" | "modelos";

const TABS: { key: Tab; label: string; icon: typeof Cpu }[] = [
  { key: "marcas", label: "Marcas", icon: Tags },
  { key: "tipos", label: "Tipos de Dispositivo", icon: Package },
  { key: "modelos", label: "Modelos", icon: Cpu },
];

const TIPO_CONECTIVIDAD = ["WiFi", "Ethernet", "GPRS"];

export function Dispositivos() {
  const store = useDispositivosStore();
  const [tab, setTab] = useState<Tab>("marcas");
  const [search, setSearch] = useState("");

  /* Modal states */
  const [marcaOpen, setMarcaOpen] = useState(false);
  const [editMarcaId, setEditMarcaId] = useState<string | null>(null);
  const [marcaDetailOpen, setMarcaDetailOpen] = useState(false);
  const [detailMarcaId, setDetailMarcaId] = useState<string | null>(null);
  const [tipoOpen, setTipoOpen] = useState(false);
  const [editTipoId, setEditTipoId] = useState<string | null>(null);
  const [modeloOpen, setModeloOpen] = useState(false);
  const [editModeloId, setEditModeloId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteEntity, setDeleteEntity] = useState<string>("");

  function handleDelete() {
    if (!deleteId) return;
    if (deleteEntity === "marca") store.removeMarca(deleteId);
    else if (deleteEntity === "tipo") store.removeTipoDispositivo(deleteId);
    else if (deleteEntity === "modelo") store.removeModelo(deleteId);
    setDeleteId(null);
  }

  const filteredMarcas = useMemo(() => {
    let list = store.marcas;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((m) => m.nombre.toLowerCase().includes(q));
    }
    return list;
  }, [store.marcas, search]);

  const filteredTipos = useMemo(() => {
    let list = store.tiposDispositivo;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((t) => t.nombre.toLowerCase().includes(q) || (t.descripcion ?? "").toLowerCase().includes(q));
    }
    return list;
  }, [store.tiposDispositivo, search]);

  const filteredModelos = useMemo(() => {
    let list = store.modelos;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((m) => m.nombre.toLowerCase().includes(q));
    }
    return list;
  }, [store.modelos, search]);

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-[18px] font-bold text-[var(--color-neutro-900)]">Catálogo de Dispositivos</h1>
          <p className="text-[13px] text-[var(--color-neutro-500)]">Gestión de marcas, tipos y modelos de dispositivos del sistema</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 bg-[var(--color-neutro-100)] p-1 rounded-corner-m w-fit">
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setSearch(""); }}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-semibold rounded-corner-m transition-all ${isActive ? "bg-white text-[var(--color-neutro-900)] shadow-sm" : "text-[var(--color-neutro-500)] hover:text-[var(--color-neutro-700)]"}`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
              <span className="text-[11px] text-[var(--color-neutro-400)] ml-1 bg-[var(--color-neutro-200)] px-1.5 py-0.5 rounded-corner-sm">
                {tab === "marcas" ? store.marcas.length : tab === "tipos" ? store.tiposDispositivo.length : store.modelos.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search + Add bar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 max-w-md">
          <Input
            prefix={<Search className="w-4 h-4" />}
            placeholder={tab === "marcas" ? "Buscar marca..." : tab === "tipos" ? "Buscar tipo..." : "Buscar modelo..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          size="sm"
          onClick={() => {
            if (tab === "marcas") { setEditMarcaId(null); setMarcaOpen(true); }
            else if (tab === "tipos") { setEditTipoId(null); setTipoOpen(true); }
            else { setEditModeloId(null); setModeloOpen(true); }
          }}
          iconLeft={<Plus className="w-6 h-6" />}
        >
          {tab === "marcas" ? "Nueva Marca" : tab === "tipos" ? "Nuevo Tipo" : "Nuevo Modelo"}
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {tab === "marcas" && (
          <div className="grid grid-cols-3 gap-4">
            {filteredMarcas.length === 0 ? (
              <div className="col-span-3 text-center py-12 text-[var(--color-neutro-400)]">No hay marcas registradas</div>
            ) : filteredMarcas.map((m) => (
              <div key={m.id} className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m p-4 hover:shadow-sm transition-all cursor-pointer" onClick={() => { setDetailMarcaId(m.id); setMarcaDetailOpen(true); }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-corner-m bg-indigo-50 flex items-center justify-center">
                      <Tags className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-[var(--color-neutro-900)]">{m.nombre}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        {m.tipoDispositivoIds.map((tid) => {
                          const tipo = store.tiposDispositivo.find((t) => t.id === tid);
                          return tipo ? (
                            <span key={tid} className="text-[10px] font-medium px-1.5 py-0.5 rounded-corner-sm bg-indigo-50 text-indigo-600">
                              {tipo.nombre}
                            </span>
                          ) : null;
                        })}
                        <span className={`inline-block w-2 h-2 rounded-full ${m.activo ? "bg-green-500" : "bg-red-400"}`} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 rounded-corner-m hover:bg-[var(--color-neutro-100)] text-[var(--color-neutro-400)] transition-colors" onClick={(e) => { e.stopPropagation(); setEditMarcaId(m.id); setMarcaOpen(true); }}>
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 rounded-corner-m hover:bg-red-50 text-red-400 transition-colors" onClick={(e) => { e.stopPropagation(); setDeleteId(m.id); setDeleteEntity("marca"); setDeleteOpen(true); }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "tipos" && (
          <div className="grid grid-cols-3 gap-4">
            {filteredTipos.length === 0 ? (
              <div className="col-span-3 text-center py-12 text-[var(--color-neutro-400)]">No hay tipos registrados</div>
            ) : filteredTipos.map((t) => {
              const marcasDelTipo = store.marcas.filter((m) => m.tipoDispositivoIds.includes(t.id));
              return (
                <div key={t.id} className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m p-4 hover:shadow-sm transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-corner-m bg-amber-50 flex items-center justify-center">
                        <Package className="w-5 h-5 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-[14px] font-semibold text-[var(--color-neutro-900)]">{t.nombre}</p>
                        {t.descripcion && <p className="text-[11px] text-[var(--color-neutro-500)]">{t.descripcion}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 rounded-corner-m hover:bg-[var(--color-neutro-100)] text-[var(--color-neutro-400)] transition-colors" onClick={() => { setEditTipoId(t.id); setTipoOpen(true); }}>
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 rounded-corner-m hover:bg-red-50 text-red-400 transition-colors" onClick={() => { setDeleteId(t.id); setDeleteEntity("tipo"); setDeleteOpen(true); }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  {marcasDelTipo.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-[var(--color-neutro-100)]">
                      {marcasDelTipo.map((m) => (
                        <span key={m.id} className="text-[11px] font-medium px-2 py-0.5 rounded-corner-sm bg-indigo-50 text-indigo-600">
                          {m.nombre}
                        </span>
                      ))}
                    </div>
                  )}
                  {marcasDelTipo.length === 0 && (
                    <p className="text-[11px] text-[var(--color-neutro-400)] italic mt-3 pt-3 border-t border-[var(--color-neutro-100)]">Sin marcas asociadas</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {tab === "modelos" && (
          <div className="space-y-3">
            {filteredModelos.length === 0 ? (
              <div className="text-center py-12 text-[var(--color-neutro-400)]">No hay modelos registrados</div>
            ) : (
              <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m overflow-hidden">
                <table className="w-full text-[13px]">
                  <thead className="bg-[var(--color-neutro-50)] text-[12px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide">
                    <tr>
                      <th className="text-left px-4 py-3">Modelo</th>
                      <th className="text-left px-4 py-3">Marca</th>
                      <th className="text-left px-4 py-3">Tipo</th>
                      <th className="text-left px-4 py-3">Configuración</th>
                      <th className="text-right px-4 py-3 w-[80px]">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredModelos.map((m) => {
                      const marca = store.marcas.find((b) => b.id === m.marcaId);
                      const tipo = store.tiposDispositivo.find((t) => t.id === m.tipoDispositivoId);
                      return (
                        <tr key={m.id} className="border-t border-[var(--color-neutro-100)] hover:bg-[var(--color-neutro-50)] transition-colors">
                          <td className="px-4 py-3 font-medium text-[var(--color-neutro-900)]">{m.nombre}</td>
                          <td className="px-4 py-3">
                            <span className="text-[12px] font-medium px-2 py-0.5 rounded-corner-m bg-indigo-50 text-indigo-600">
                              {marca?.nombre ?? "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-[12px] font-medium px-2 py-0.5 rounded-corner-m bg-amber-50 text-amber-600">
                              {tipo?.nombre ?? "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[12px] text-[var(--color-neutro-500)]">
                            <ConfigSummary config={m.configuracion} tipoNombre={tipo?.nombre ?? ""} />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button className="p-1.5 rounded-corner-m hover:bg-[var(--color-neutro-100)] text-[var(--color-neutro-400)] transition-colors" onClick={() => { setEditModeloId(m.id); setModeloOpen(true); }}>
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button className="p-1.5 rounded-corner-m hover:bg-red-50 text-red-400 transition-colors" onClick={() => { setDeleteId(m.id); setDeleteEntity("modelo"); setDeleteOpen(true); }}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <MarcaFormModal
        open={marcaOpen}
        onClose={() => { setMarcaOpen(false); setEditMarcaId(null); }}
        editId={editMarcaId}
      />
      <TipoFormModal
        open={tipoOpen}
        onClose={() => { setTipoOpen(false); setEditTipoId(null); }}
        editId={editTipoId}
      />
      <ModeloFormModal
        open={modeloOpen}
        onClose={() => { setModeloOpen(false); setEditModeloId(null); }}
        editId={editModeloId}
      />
      <MarcaDetailModal
        open={marcaDetailOpen}
        marcaId={detailMarcaId}
        onClose={() => { setMarcaDetailOpen(false); setDetailMarcaId(null); }}
        onEditModelo={(id) => { setEditModeloId(id); setModeloOpen(true); }}
      />
      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Eliminar ${deleteEntity === "marca" ? "Marca" : deleteEntity === "tipo" ? "Tipo de Dispositivo" : "Modelo"}`}
        description="¿Está seguro de eliminar este registro?"
        onConfirm={handleDelete}
      />
    </div>
  );
}

/* ── Config Summary ── */
function ConfigSummary({ config, tipoNombre }: { config: unknown; tipoNombre: string }) {
  if (!config) return <span className="text-[var(--color-neutro-400)] italic">Sin configurar</span>;
  if (tipoNombre === "Caja") {
    const cf = config as CofreConfig;
    return <span>Cofre: {cf.capacidad.toLocaleString()} piezas</span>;
  }
  if (tipoNombre === "Terminal Punto de Venta") {
    const pos = config as POSConfig;
    return <span>{pos.tipoConectividad} · {pos.tieneImpresora ? "Con" : "Sin"} impresora</span>;
  }
  if (Array.isArray(config)) {
    const caj = config as CajetinConfig[];
    return <span>{caj.length} cajetín(es) · {caj.reduce((s, c) => s + c.capacidad, 0).toLocaleString()} piezas</span>;
  }
  if (config && typeof config === "object" && "cajetines" in config && !("comunicacion" in config)) {
    const mf = config as ATMMultifuncionalConfig;
    const total = mf.cajetines.reduce((s, c) => s + c.capacidad, 0);
    return <span>{mf.cajetines.length} cajetín(es) · {total.toLocaleString()} pz · Depósito: {mf.deposito.capacidad.toLocaleString()} pz</span>;
  }
  if (config && typeof config === "object" && "deposito" in config) {
    const dp = config as ATMDepositoConfig;
    return <span>Depósito: {dp.deposito.capacidad.toLocaleString()} pz · {dp.deposito.aceptaSobres ? "Sobres" : "Sin sobres"}</span>;
  }
  if (config && typeof config === "object" && "comunicacion" in config) {
    const rm = config as ATMRemotoConfig;
    const total = rm.cajetines.reduce((s, c) => s + c.capacidad, 0);
    return <span>{rm.cajetines.length} cajetín(es) · {total.toLocaleString()} pz · {rm.comunicacion} · {rm.fuentePoder}</span>;
  }
  return <span>Configuración personalizada</span>;
}

/* ── Marca Form ── */
function MarcaFormModal({ open, onClose, editId }: { open: boolean; onClose: () => void; editId: string | null }) {
  const store = useDispositivosStore();
  const existing = editId ? store.marcas.find((m) => m.id === editId) : null;

  const [nombre, setNombre] = useState("");
  const [tipoDispositivoIds, setTipoDispositivoIds] = useState<string[]>([]);
  const [activo, setActivo] = useState(true);
  const [error, setError] = useState("");

  function toggleTipo(id: string) {
    setTipoDispositivoIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function reset() {
    if (existing) { setNombre(existing.nombre); setTipoDispositivoIds([...existing.tipoDispositivoIds]); setActivo(existing.activo); }
    else { setNombre(""); setTipoDispositivoIds([]); setActivo(true); }
    setError("");
  }

  useEffect(() => { if (open) reset(); }, [open, editId]);

  function handleSave() {
    if (!nombre.trim()) { setError("El nombre es requerido"); return; }
    if (tipoDispositivoIds.length === 0) { setError("Seleccione al menos un tipo de dispositivo"); return; }
    setError("");
    const data = { nombre: nombre.trim(), tipoDispositivoIds, activo };
    if (editId) store.updateMarca(editId, data);
    else store.addMarca(data);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={editId ? "Editar Marca" : "Nueva Marca"} size="md"
      actions={
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
          <Button size="sm" onClick={handleSave}>{editId ? "Guardar" : "Crear"}</Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Input label="Nombre de la Marca *" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: NCR, IBM, Diebold" />
        <div>
          <p className="text-[13px] font-medium text-[var(--color-neutro-700)] mb-2">Tipos de Dispositivo *</p>
          <div className="flex flex-wrap gap-1.5">
            {store.tiposDispositivo.filter((t) => t.activo).map((t) => {
              const selected = tipoDispositivoIds.includes(t.id);
              return (
                <button
                  key={t.id}
                  onClick={() => toggleTipo(t.id)}
                  className={`px-3 py-1.5 text-[12px] font-semibold rounded-corner-m border transition-all ${
                    selected
                      ? "bg-indigo-50 text-indigo-600 border-indigo-300"
                      : "bg-white text-[var(--color-neutro-500)] border-[var(--color-neutro-200)] hover:border-indigo-200"
                  }`}
                >
                  {t.nombre}
                </button>
              );
            })}
          </div>
        </div>
        <Checkbox label="Activo" checked={activo} onChange={(v) => setActivo(v)} />
        {error && <p className="text-[13px] text-red-500 font-medium">{error}</p>}
      </div>
    </Modal>
  );
}

/* ── Marca Detail ── */
function MarcaDetailModal({ open, marcaId, onClose, onEditModelo }: { open: boolean; marcaId: string | null; onClose: () => void; onEditModelo: (id: string) => void }) {
  const store = useDispositivosStore();
  const marca = marcaId ? store.marcas.find((m) => m.id === marcaId) : null;
  const modelos = marcaId ? store.modelos.filter((m) => m.marcaId === marcaId && m.activo) : [];

  return (
    <Modal open={open} onClose={onClose} title={marca?.nombre ?? "Marca"} size="lg"
      actions={
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cerrar</Button>
        </div>
      }
    >
      {marca && (
        <div className="space-y-5">
          {/* Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-corner-m bg-indigo-50 flex items-center justify-center">
              <Tags className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-[var(--color-neutro-900)]">{marca.nombre}</p>
              <div className="flex items-center gap-1.5 mt-1">
                {marca.tipoDispositivoIds.map((tid) => {
                  const tipo = store.tiposDispositivo.find((t) => t.id === tid);
                  return tipo ? (
                    <span key={tid} className="text-[11px] font-medium px-2 py-0.5 rounded-corner-sm bg-indigo-50 text-indigo-600">
                      {tipo.nombre}
                    </span>
                  ) : null;
                })}
                <span className={`inline-block w-2 h-2 rounded-full ${marca.activo ? "bg-green-500" : "bg-red-400"}`} />
              </div>
            </div>
          </div>

          {/* Modelos */}
          <div>
            <p className="text-[13px] font-semibold text-[var(--color-neutro-700)] mb-3">
              Modelos ({modelos.length})
            </p>
            {modelos.length === 0 ? (
              <p className="text-[13px] text-[var(--color-neutro-400)] italic py-6 text-center border border-dashed border-[var(--color-neutro-200)] rounded-corner-m">
                Esta marca no tiene modelos registrados
              </p>
            ) : (
              <div className="border border-[var(--color-neutro-200)] rounded-corner-m overflow-hidden">
                <table className="w-full text-[13px]">
                  <thead className="bg-[var(--color-neutro-50)] text-[12px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide">
                    <tr>
                      <th className="text-left px-4 py-3">Modelo</th>
                      <th className="text-left px-4 py-3">Tipo</th>
                      <th className="text-left px-4 py-3">Configuración</th>
                      <th className="text-right px-4 py-3 w-[60px]"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {modelos.map((mo) => {
                      const tipo = store.tiposDispositivo.find((t) => t.id === mo.tipoDispositivoId);
                      return (
                        <tr key={mo.id} className="border-t border-[var(--color-neutro-100)] hover:bg-[var(--color-neutro-50)] transition-colors">
                          <td className="px-4 py-3 font-medium text-[var(--color-neutro-900)]">{mo.nombre}</td>
                          <td className="px-4 py-3">
                            <span className="text-[12px] font-medium px-2 py-0.5 rounded-corner-m bg-amber-50 text-amber-600">
                              {tipo?.nombre ?? "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[12px] text-[var(--color-neutro-500)]">
                            <ConfigSummary config={mo.configuracion} tipoNombre={tipo?.nombre ?? ""} />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button className="p-1.5 rounded-corner-m hover:bg-[var(--color-neutro-100)] text-[var(--color-neutro-400)] transition-colors" onClick={() => { onEditModelo(mo.id); onClose(); }}>
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

/* ── Tipo de Dispositivo Form ── */
function TipoFormModal({ open, onClose, editId }: { open: boolean; onClose: () => void; editId: string | null }) {
  const store = useDispositivosStore();
  const existing = editId ? store.tiposDispositivo.find((t) => t.id === editId) : null;

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [activo, setActivo] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      if (existing) { setNombre(existing.nombre); setDescripcion(existing.descripcion ?? ""); setActivo(existing.activo); }
      else { setNombre(""); setDescripcion(""); setActivo(true); }
      setError("");
    }
  }, [open, editId]);

  function handleSave() {
    if (!nombre.trim()) { setError("El nombre es requerido"); return; }
    setError("");
    const data = { nombre: nombre.trim(), descripcion: descripcion.trim(), activo };
    if (editId) store.updateTipoDispositivo(editId, data);
    else store.addTipoDispositivo(data);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={editId ? "Editar Tipo" : "Nuevo Tipo de Dispositivo"} size="md"
      actions={
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
          <Button size="sm" onClick={handleSave}>{editId ? "Guardar" : "Crear"}</Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Input label="Nombre del Tipo *" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: ATM, Caja, Servidor" />
        <Input label="Descripción" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Breve descripción del tipo de dispositivo" />
        <Checkbox label="Activo" checked={activo} onChange={(v) => setActivo(v)} />
        {error && <p className="text-[13px] text-red-500 font-medium">{error}</p>}
      </div>
    </Modal>
  );
}

/* ── Modelo Form (dynamic config) ── */
function ModeloFormModal({ open, onClose, editId }: { open: boolean; onClose: () => void; editId: string | null }) {
  const store = useDispositivosStore();
  const existing = editId ? store.modelos.find((m) => m.id === editId) : null;

  const [marcaId, setMarcaId] = useState("");
  const [tipoId, setTipoId] = useState("");
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [activo, setActivo] = useState(true);
  const [error, setError] = useState("");

  /* Cajetín config (shared across ATM types) */
  const [cajetines, setCajetines] = useState<CajetinConfig[]>([]);

  /* Caja config */
  const [capacidadCofre, setCapacidadCofre] = useState(0);

  /* POS config */
  const [tipoConectividad, setTipoConectividad] = useState<string>("WiFi");
  const [tieneImpresora, setTieneImpresora] = useState(true);

  /* ATM Multifuncional / Depósito */
  const [moduloDepositoCapacidad, setModuloDepositoCapacidad] = useState(0);
  const [aceptaSobres, setAceptaSobres] = useState(true);

  /* ATM Remoto */
  const [comunicacion, setComunicacion] = useState<string>("GPRS");
  const [fuentePoder, setFuentePoder] = useState<string>("Red");

  const ATM_RETIRO = "ATM de Retiro";
  const ATM_MULTIFUNCIONAL = "ATM Multifuncional";
  const ATM_DEPOSITO = "ATM de Depósito";
  const ATM_MULTIMONEDA = "ATM Multimoneda";
  const ATM_REMOTO = "ATM Remoto";

  function isATMConCajetines(nombre: string) {
    return nombre === ATM_RETIRO || nombre === ATM_MULTIMONEDA || nombre === ATM_REMOTO;
  }

  const tipoSel = store.tiposDispositivo.find((t) => t.id === tipoId);
  const marcasDisponibles = tipoId ? store.getMarcasByTipoDispositivo(tipoId) : [];

  useEffect(() => { if (open) reset(); }, [open, editId]);

  function reset() {
    const clear = () => {
      setCajetines([]);
      setCapacidadCofre(0);
      setTipoConectividad("WiFi");
      setTieneImpresora(true);
      setModuloDepositoCapacidad(0);
      setAceptaSobres(true);
      setComunicacion("GPRS");
      setFuentePoder("Red");
    };
    if (existing) {
      setMarcaId(existing.marcaId);
      setTipoId(existing.tipoDispositivoId);
      setNombre(existing.nombre);
      setDescripcion(existing.descripcion ?? "");
      setActivo(existing.activo);
      const tipo = store.tiposDispositivo.find((t) => t.id === existing.tipoDispositivoId);
      const tn = tipo?.nombre ?? "";
      if (isATMConCajetines(tn) && Array.isArray(existing.configuracion)) {
        clear();
        setCajetines(existing.configuracion as CajetinConfig[]);
      } else if (tn === ATM_REMOTO) {
        const rm = existing.configuracion as ATMRemotoConfig | undefined;
        clear();
        setCajetines(rm?.cajetines ?? []);
        setComunicacion(rm?.comunicacion ?? "GPRS");
        setFuentePoder(rm?.fuentePoder ?? "Red");
      } else if (tn === ATM_MULTIFUNCIONAL) {
        const mf = existing.configuracion as ATMMultifuncionalConfig | undefined;
        clear();
        setCajetines(mf?.cajetines ?? []);
        setModuloDepositoCapacidad(mf?.deposito?.capacidad ?? 0);
        setAceptaSobres(mf?.deposito?.aceptaSobres ?? true);
      } else if (tn === ATM_DEPOSITO) {
        const dp = existing.configuracion as ATMDepositoConfig | undefined;
        clear();
        setModuloDepositoCapacidad(dp?.deposito?.capacidad ?? 0);
        setAceptaSobres(dp?.deposito?.aceptaSobres ?? true);
      } else if (tn === "Caja") {
        const cf = existing.configuracion as CofreConfig | undefined;
        clear();
        setCapacidadCofre(cf?.capacidad ?? 0);
      } else if (tn === "Terminal Punto de Venta") {
        const pos = existing.configuracion as POSConfig | undefined;
        clear();
        setTipoConectividad(pos?.tipoConectividad ?? "WiFi");
        setTieneImpresora(pos?.tieneImpresora ?? true);
      } else {
        clear();
      }
    } else {
      setMarcaId("");
      setTipoId("");
      setNombre("");
      setDescripcion("");
      setActivo(true);
      clear();
    }
    setError("");
  }

  function buildConfig(): unknown {
    const tn = tipoSel?.nombre ?? "";
    if (isATMConCajetines(tn)) return cajetines;
    if (tn === ATM_MULTIFUNCIONAL) return { cajetines, deposito: { capacidad: moduloDepositoCapacidad, aceptaSobres } } as ATMMultifuncionalConfig;
    if (tn === ATM_DEPOSITO) return { deposito: { capacidad: moduloDepositoCapacidad, aceptaSobres } } as ATMDepositoConfig;
    if (tn === "Caja") return { capacidad: capacidadCofre } as CofreConfig;
    if (tn === "Terminal Punto de Venta") return { tipoConectividad, tieneImpresora } as POSConfig;
    return undefined;
  }

  function handleSave() {
    if (!nombre.trim() || !marcaId || !tipoId) {
      setError("Complete todos los campos requeridos");
      return;
    }
    const tn = tipoSel?.nombre ?? "";
    if (isATMConCajetines(tn) && cajetines.length === 0) {
      setError("Debe agregar al menos un cajetín");
      return;
    }
    if ((tn === ATM_MULTIFUNCIONAL || tn === ATM_DEPOSITO) && moduloDepositoCapacidad <= 0) {
      setError("La capacidad del módulo de depósito debe ser mayor a 0");
      return;
    }
    setError("");
    const data = { marcaId, tipoDispositivoId: tipoId, nombre: nombre.trim(), descripcion: descripcion.trim(), configuracion: buildConfig(), activo };
    if (editId) store.updateModelo(editId, data);
    else store.addModelo(data);
    onClose();
  }

  function addCajetin() {
    setCajetines((prev) => [...prev, { nombre: "", capacidad: 1000, moneda: "VES", denominacion: 20 }]);
  }

  function updateCajetin(idx: number, field: keyof CajetinConfig, value: string | number) {
    setCajetines((prev) => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  }

  function removeCajetin(idx: number) {
    setCajetines((prev) => prev.filter((_, i) => i !== idx));
  }

  const esCajetines = tipoSel && isATMConCajetines(tipoSel.nombre);
  const esMultifuncional = tipoSel?.nombre === ATM_MULTIFUNCIONAL;
  const esDeposito = tipoSel?.nombre === ATM_DEPOSITO;
  const esRemoto = tipoSel?.nombre === ATM_REMOTO;

  return (
    <Modal open={open} onClose={onClose} title={editId ? "Editar Modelo" : "Nuevo Modelo"} size="lg"
      actions={
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
          <Button size="sm" onClick={handleSave}>{editId ? "Guardar" : "Crear"}</Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Selects */}
        <div className="grid grid-cols-2 gap-4">
          <Select label="Tipo de Dispositivo *" placeholder="Seleccione..."
            options={store.tiposDispositivo.filter((t) => t.activo).map((t) => ({ value: t.id, label: t.nombre }))}
            value={tipoId}
            onChange={(v) => { setTipoId(v); setMarcaId(""); setCajetines([]); setCapacidadCofre(0); setModuloDepositoCapacidad(0); }}
          />
          <Select label="Marca *" placeholder="Primero seleccione un tipo"
            options={marcasDisponibles.filter((m) => m.activo).map((m) => ({ value: m.id, label: m.nombre }))}
            value={marcaId}
            onChange={(v) => setMarcaId(v)}
          />
        </div>
        <Input label="Nombre del Modelo *" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: NCR 5587, Caja Estándar" />
        <Input label="Descripción" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Descripción opcional del modelo" />

        {/* ── Configuración dinámica ── */}

        {/* Cajetines table (Retiro, Multimoneda) */}
        {(esCajetines || esMultifuncional) && (
          <div className="border border-[var(--color-neutro-200)] rounded-corner-m p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-[var(--color-neutro-700)]">Configuración de Cajetines</span>
              <Button size="sm" iconLeft={<Plus className="w-4 h-4" />} onClick={addCajetin}>Agregar Cajetín</Button>
            </div>
            {cajetines.length === 0 ? (
              <p className="text-[13px] text-[var(--color-neutro-400)] italic">No hay cajetines configurados. Agregue al menos uno.</p>
            ) : (
              <div className="space-y-2">
                {cajetines.map((c, i) => (
                  <div key={i} className="flex items-end gap-2 p-3 bg-[var(--color-neutro-50)] rounded-corner-m border border-[var(--color-neutro-200)]">
                    <div className="flex-1">
                      <Input label="Nombre" value={c.nombre} onChange={(e) => updateCajetin(i, "nombre", e.target.value)} placeholder="Ej: Cajetín 1 USD" />
                    </div>
                    <div className="w-28">
                      <Input label="Capacidad" type="number" min={1} value={c.capacidad} onChange={(e) => updateCajetin(i, "capacidad", parseInt(e.target.value) || 0)} />
                    </div>
                    <div className="w-28">
                      <Select label="Moneda" options={[
                        { value: "USD", label: "USD" },
                        { value: "VES", label: "VES" },
                        { value: "EUR", label: "EUR" },
                        { value: "COP", label: "COP" },
                        { value: "MXN", label: "MXN" },
                        { value: "Mixto", label: "Mixto" },
                      ]}
                        value={c.moneda}
                        onChange={(v) => updateCajetin(i, "moneda", v)}
                      />
                    </div>
                    <div className="w-24">
                      <Input label="Denominación" type="number" min={0} value={c.denominacion} onChange={(e) => updateCajetin(i, "denominacion", parseInt(e.target.value) || 0)} />
                    </div>
                    <button
                      className="p-2 mb-0.5 rounded-corner-m hover:bg-red-50 text-red-400 transition-colors"
                      onClick={() => removeCajetin(i)}
                      title="Quitar cajetín"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="text-[12px] text-[var(--color-neutro-500)] pt-1 border-t border-[var(--color-neutro-200)]">
              Total: {cajetines.length} cajetín(es) · {cajetines.reduce((s, c) => s + c.capacidad, 0).toLocaleString()} piezas
            </div>
          </div>
        )}

        {/* ATM Multifuncional / Depósito - Módulo de Depósito */}
        {(esMultifuncional || esDeposito) && (
          <div className="border border-[var(--color-neutro-200)] rounded-corner-m p-4 space-y-3">
            <span className="text-[13px] font-semibold text-[var(--color-neutro-700)]">Módulo de Depósito</span>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Capacidad del Depósito (piezas)" type="number" min={0} value={moduloDepositoCapacidad}
                onChange={(e) => setModuloDepositoCapacidad(parseInt(e.target.value) || 0)}
                placeholder="Ej: 5000"
              />
              <div className="flex items-end pb-1">
                <Checkbox label="Acepta sobres" checked={aceptaSobres} onChange={(v) => setAceptaSobres(v)} />
              </div>
            </div>
          </div>
        )}

        {/* ATM Remoto - Comunicación + Fuente de Poder */}
        {esRemoto && (
          <div className="border border-[var(--color-neutro-200)] rounded-corner-m p-4 space-y-3">
            <span className="text-[13px] font-semibold text-[var(--color-neutro-700)]">Configuración Remota</span>
            <div className="grid grid-cols-2 gap-4">
              <Select label="Comunicación" options={[
                { value: "GPRS", label: "GPRS" },
                { value: "Satelital", label: "Satelital" },
                { value: "VSAT", label: "VSAT" },
              ]}
                value={comunicacion} onChange={(v) => setComunicacion(v)}
              />
              <Select label="Fuente de Poder" options={[
                { value: "Red", label: "Red Eléctrica" },
                { value: "Solar", label: "Panel Solar" },
                { value: "Batería", label: "Batería" },
              ]}
                value={fuentePoder} onChange={(v) => setFuentePoder(v)}
              />
            </div>
          </div>
        )}

        {tipoSel?.nombre === "Caja" && (
          <div className="border border-[var(--color-neutro-200)] rounded-corner-m p-4 space-y-3">
            <span className="text-[13px] font-semibold text-[var(--color-neutro-700)]">Configuración del Cofre</span>
            <Input label="Capacidad del Cofre (piezas)" type="number" min={0} value={capacidadCofre}
              onChange={(e) => setCapacidadCofre(parseInt(e.target.value) || 0)}
              placeholder="Ej: 5000"
            />
          </div>
        )}

        {tipoSel?.nombre === "Terminal Punto de Venta" && (
          <div className="border border-[var(--color-neutro-200)] rounded-corner-m p-4 space-y-3">
            <span className="text-[13px] font-semibold text-[var(--color-neutro-700)]">Configuración del POS</span>
            <div className="grid grid-cols-2 gap-4">
              <Select label="Tipo de Conectividad" options={TIPO_CONECTIVIDAD.map((c) => ({ value: c, label: c }))}
                value={tipoConectividad} onChange={(v) => setTipoConectividad(v)}
              />
              <div className="flex items-end pb-1">
                <Checkbox label="Tiene impresora integrada" checked={tieneImpresora} onChange={(v) => setTieneImpresora(v)} />
              </div>
            </div>
          </div>
        )}

        <Checkbox label="Activo" checked={activo} onChange={(v) => setActivo(v)} />
        {error && <p className="text-[13px] text-red-500 font-medium">{error}</p>}
      </div>
    </Modal>
  );
}
