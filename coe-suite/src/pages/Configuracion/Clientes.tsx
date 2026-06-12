import { useState, useMemo } from "react";
import { Plus, Search, Building2, Store, FileText, Pencil, Trash2, Users } from "lucide-react";
import { Button, Checkbox, Select, Input, Textarea } from "@coe/design-system";
import { useClientesStore, GIROS, NIVELES_FIDELIDAD, ESTATUS_CUMPLIMIENTO } from "@stores/clientesStore";
import { DeleteDialog } from "@components/shared/DeleteDialog";
import { Modal } from "@components/ui/Modal";

type Tab = "clientes" | "sucursales" | "acuerdos";

const TABS: { key: Tab; label: string; icon: typeof Building2 }[] = [
  { key: "clientes", label: "Clientes", icon: Users },
  { key: "sucursales", label: "Sucursales", icon: Store },
  { key: "acuerdos", label: "Acuerdos Comerciales", icon: FileText },
];

const TIPOS_PERSONA = ["Natural", "Jurídico"];

const nivelColor: Record<string, string> = {
  Estándar: "bg-gray-100 text-gray-600",
  VIP: "bg-purple-100 text-purple-700",
  Oro: "bg-yellow-100 text-yellow-700",
};

const estatusColor: Record<string, string> = {
  Pendiente: "bg-gray-100 text-gray-600",
  Verificado: "bg-green-100 text-green-700",
  "En Revisión": "bg-blue-100 text-blue-700",
  Rechazado: "bg-red-100 text-red-700",
};

export function Clientes() {
  const store = useClientesStore();
  const [tab, setTab] = useState<Tab>("clientes");
  const [search, setSearch] = useState("");
  const [filterGiro, setFilterGiro] = useState<string>("");
  const [filterCliente, setFilterCliente] = useState<string>("");

  /* Modal states */
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [sucursalFormOpen, setSucursalFormOpen] = useState(false);
  const [editSucursalId, setEditSucursalId] = useState<string | null>(null);

  const [acuerdoFormOpen, setAcuerdoFormOpen] = useState(false);
  const [editAcuerdoId, setEditAcuerdoId] = useState<string | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  /* ── Clientes filtered ── */
  const filteredClientes = useMemo(() => {
    let list = store.clientes;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((c) => c.razonSocial.toLowerCase().includes(q) || c.codigo.toLowerCase().includes(q) || c.idCliente.toLowerCase().includes(q));
    }
    if (filterGiro) list = list.filter((c) => c.giroNegocio === filterGiro);
    return list;
  }, [store.clientes, search, filterGiro]);

  /* ── Sucursales filtered ── */
  const filteredSucursales = useMemo(() => {
    let list = store.sucursales;
    if (filterCliente) list = list.filter((s) => s.clienteId === filterCliente);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.nombre.toLowerCase().includes(q) || s.codigo.toLowerCase().includes(q));
    }
    return list;
  }, [store.sucursales, filterCliente, search]);

  /* ── Acuerdos filtered ── */
  const filteredAcuerdos = useMemo(() => {
    let list = store.acuerdos;
    if (filterCliente) list = list.filter((a) => a.clienteId === filterCliente);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((a) => a.plazoPago.toLowerCase().includes(q) || a.puntosEntrega.toLowerCase().includes(q));
    }
    return list;
  }, [store.acuerdos, filterCliente, search]);

  /* ── Handlers ── */
  function handleDelete() {
    if (!deleteId) return;
    if (tab === "clientes") store.removeCliente(deleteId);
    else if (tab === "sucursales") store.removeSucursal(deleteId);
    else store.removeAcuerdo(deleteId);
    setDeleteId(null);
  }

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-[18px] font-bold text-[var(--color-neutro-900)]">Clientes</h1>
          <p className="text-[13px] text-[var(--color-neutro-500)]">Registro y gestión de clientes corporativos, sucursales y acuerdos comerciales</p>
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
              onClick={() => { setTab(t.key); setSearch(""); setFilterCliente(""); setFilterGiro(""); }}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-semibold rounded-corner-m transition-all ${isActive ? "bg-white text-[var(--color-neutro-900)] shadow-sm" : "text-[var(--color-neutro-500)] hover:text-[var(--color-neutro-700)]"}`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Search + Actions Bar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 max-w-md">
          <Input
            prefix={<Search className="w-4 h-4" />}
            placeholder={tab === "clientes" ? "Buscar por razón social, código o ID..." : tab === "sucursales" ? "Buscar sucursal..." : "Buscar acuerdo..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {tab === "clientes" && (
          <Select
            placeholder="Todos los giros"
            options={GIROS.map((g) => ({ value: g, label: g }))}
            value={filterGiro}
            onChange={setFilterGiro}
          />
        )}
        {tab !== "clientes" && (
          <Select
            placeholder="Todos los clientes"
            options={store.clientes.filter((c) => c.activo).map((c) => ({ value: c.id, label: c.razonSocial }))}
            value={filterCliente}
            onChange={setFilterCliente}
          />
        )}
        <Button
          size="sm"
          onClick={() => {
            if (tab === "clientes") { setEditId(null); setFormOpen(true); }
            else if (tab === "sucursales") { setEditSucursalId(null); setSucursalFormOpen(true); }
            else { setEditAcuerdoId(null); setAcuerdoFormOpen(true); }
          }}
          iconLeft={<Plus className="w-6 h-6" />}
        >
          {tab === "clientes" ? "Nuevo Cliente" : tab === "sucursales" ? "Nueva Sucursal" : "Nuevo Acuerdo"}
        </Button>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 bg-white border border-[var(--color-neutro-200)] rounded-corner-m overflow-auto">
        {tab === "clientes" && (
          <table className="w-full text-[13px]">
            <thead className="bg-[var(--color-neutro-50)] text-[12px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">Código</th>
                <th className="text-left px-4 py-3">Razón Social</th>
                <th className="text-left px-4 py-3">Tipo</th>
                <th className="text-left px-4 py-3">Giro</th>
                <th className="text-right px-4 py-3">Crédito</th>
                <th className="text-left px-4 py-3">Fidelidad</th>
                <th className="text-left px-4 py-3">Cumplimiento</th>
                <th className="text-center px-4 py-3">Estado</th>
                <th className="text-right px-4 py-3 w-[80px]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredClientes.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-[var(--color-neutro-400)]">No hay clientes registrados</td></tr>
              ) : filteredClientes.map((c) => (
                <tr key={c.id} className="border-t border-[var(--color-neutro-100)] hover:bg-[var(--color-neutro-50)] transition-colors">
                  <td className="px-4 py-3 font-mono text-[12px] text-[var(--color-neutro-500)]">{c.codigo}</td>
                  <td className="px-4 py-3 font-medium text-[var(--color-neutro-900)]">{c.razonSocial}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-corner-m ${c.tipoPersona === "Jurídico" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                      {c.tipoPersona}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-neutro-600)]">{c.giroNegocio}</td>
                  <td className="px-4 py-3 text-right font-mono text-[var(--color-neutro-700)]">${c.limiteCredito.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-corner-m ${nivelColor[c.nivelFidelidad] ?? ""}`}>
                      {c.nivelFidelidad}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-corner-m ${estatusColor[c.estatusCumplimiento] ?? ""}`}>
                      {c.estatusCumplimiento}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block w-2 h-2 rounded-full ${c.activo ? "bg-green-500" : "bg-red-400"}`} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        className="p-1.5 rounded-corner-m hover:bg-[var(--color-neutro-100)] text-[var(--color-neutro-400)] transition-colors"
                        onClick={() => { setEditId(c.id); setFormOpen(true); }}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        className="p-1.5 rounded-corner-m hover:bg-red-50 text-red-400 transition-colors"
                        onClick={() => { setDeleteId(c.id); setDeleteOpen(true); }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === "sucursales" && (
          <table className="w-full text-[13px]">
            <thead className="bg-[var(--color-neutro-50)] text-[12px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">Cliente</th>
                <th className="text-left px-4 py-3">Código</th>
                <th className="text-left px-4 py-3">Nombre</th>
                <th className="text-left px-4 py-3">Dirección</th>
                <th className="text-left px-4 py-3">Contacto</th>
                <th className="text-center px-4 py-3">Estado</th>
                <th className="text-right px-4 py-3 w-[80px]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredSucursales.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-[var(--color-neutro-400)]">No hay sucursales registradas</td></tr>
              ) : filteredSucursales.map((s) => {
                const cli = store.getClienteById(s.clienteId);
                return (
                  <tr key={s.id} className="border-t border-[var(--color-neutro-100)] hover:bg-[var(--color-neutro-50)] transition-colors">
                    <td className="px-4 py-3 text-[var(--color-neutro-700)]">{cli?.razonSocial ?? "—"}</td>
                    <td className="px-4 py-3 font-mono text-[12px] text-[var(--color-neutro-500)]">{s.codigo}</td>
                    <td className="px-4 py-3 font-medium text-[var(--color-neutro-900)]">{s.nombre}</td>
                    <td className="px-4 py-3 text-[var(--color-neutro-500)] max-w-[250px] truncate">{s.direccion}</td>
                    <td className="px-4 py-3 text-[var(--color-neutro-600)]">{s.contacto}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block w-2 h-2 rounded-full ${s.activo ? "bg-green-500" : "bg-red-400"}`} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          className="p-1.5 rounded-corner-m hover:bg-[var(--color-neutro-100)] text-[var(--color-neutro-400)] transition-colors"
                          onClick={() => { setEditSucursalId(s.id); setSucursalFormOpen(true); }}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="p-1.5 rounded-corner-m hover:bg-red-50 text-red-400 transition-colors"
                          onClick={() => { setDeleteId(s.id); setDeleteOpen(true); }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {tab === "acuerdos" && (
          <table className="w-full text-[13px]">
            <thead className="bg-[var(--color-neutro-50)] text-[12px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">Cliente</th>
                <th className="text-left px-4 py-3">Plazo de Pago</th>
                <th className="text-left px-4 py-3">Lista de Precios</th>
                <th className="text-left px-4 py-3">Puntos de Entrega</th>
                <th className="text-left px-4 py-3">Ventanas Recepción</th>
                <th className="text-center px-4 py-3">Estado</th>
                <th className="text-right px-4 py-3 w-[80px]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredAcuerdos.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-[var(--color-neutro-400)]">No hay acuerdos comerciales registrados</td></tr>
              ) : filteredAcuerdos.map((a) => {
                const cli = store.getClienteById(a.clienteId);
                return (
                  <tr key={a.id} className="border-t border-[var(--color-neutro-100)] hover:bg-[var(--color-neutro-50)] transition-colors">
                    <td className="px-4 py-3 text-[var(--color-neutro-700)]">{cli?.razonSocial ?? "—"}</td>
                    <td className="px-4 py-3 font-medium text-[var(--color-neutro-900)]">{a.plazoPago}</td>
                    <td className="px-4 py-3 text-[var(--color-neutro-600)]">{a.listaPrecios}</td>
                    <td className="px-4 py-3 text-[var(--color-neutro-500)] max-w-[250px] truncate">{a.puntosEntrega}</td>
                    <td className="px-4 py-3 text-[var(--color-neutro-500)]">{a.ventanasRecepcion}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block w-2 h-2 rounded-full ${a.activo ? "bg-green-500" : "bg-red-400"}`} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          className="p-1.5 rounded-corner-m hover:bg-[var(--color-neutro-100)] text-[var(--color-neutro-400)] transition-colors"
                          onClick={() => { setEditAcuerdoId(a.id); setAcuerdoFormOpen(true); }}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="p-1.5 rounded-corner-m hover:bg-red-50 text-red-400 transition-colors"
                          onClick={() => { setDeleteId(a.id); setDeleteOpen(true); }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Forms ── */}

      {/* Cliente Form */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editId ? "Editar Cliente" : "Nuevo Cliente"}>
        <ClienteForm
          editId={editId}
          onClose={() => setFormOpen(false)}
        />
      </Modal>

      {/* Sucursal Form */}
      <Modal open={sucursalFormOpen} onClose={() => setSucursalFormOpen(false)} title={editSucursalId ? "Editar Sucursal" : "Nueva Sucursal"}>
        <SucursalForm
          editId={editSucursalId}
          onClose={() => setSucursalFormOpen(false)}
        />
      </Modal>

      {/* Acuerdo Form */}
      <Modal open={acuerdoFormOpen} onClose={() => setAcuerdoFormOpen(false)} title={editAcuerdoId ? "Editar Acuerdo Comercial" : "Nuevo Acuerdo Comercial"}>
        <AcuerdoForm
          editId={editAcuerdoId}
          onClose={() => setAcuerdoFormOpen(false)}
        />
      </Modal>

      {/* Delete Dialog */}
      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar"
        description="¿Está seguro de eliminar este registro?"
        itemName={tab === "clientes" ? store.getClienteById(deleteId ?? "")?.razonSocial : undefined}
        onConfirm={handleDelete}
      />
    </div>
  );
}

/* ── Cliente Form ── */
function ClienteForm({ editId, onClose }: { editId: string | null; onClose: () => void }) {
  const store = useClientesStore();
  const existing = editId ? store.clientes.find((c) => c.id === editId) : null;

  const [form, setForm] = useState({
    codigo: existing?.codigo ?? "",
    razonSocial: existing?.razonSocial ?? "",
    tipoPersona: existing?.tipoPersona ?? "Jurídico" as "Natural" | "Jurídico",
    giroNegocio: existing?.giroNegocio ?? "",
    idCliente: existing?.idCliente ?? "",
    estatusCumplimiento: existing?.estatusCumplimiento ?? "Pendiente",
    limiteCredito: existing?.limiteCredito ?? 0,
    nivelFidelidad: existing?.nivelFidelidad ?? "Estándar",
    activo: existing?.activo ?? true,
  });

  const invalid = !form.codigo || !form.razonSocial || !form.giroNegocio || !form.idCliente;

  function handleSubmit() {
    if (invalid) return;
    if (editId) store.updateCliente(editId, form);
    else store.addCliente(form);
    onClose();
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Código" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} placeholder="CLI-XXX-001" />
        <Input label="ID de Cliente" value={form.idCliente} onChange={(e) => setForm({ ...form, idCliente: e.target.value })} placeholder="ID interno" />
      </div>
      <Input label="Razón Social" value={form.razonSocial} onChange={(e) => setForm({ ...form, razonSocial: e.target.value })} placeholder="Nombre legal de la empresa" />
      <div className="grid grid-cols-2 gap-4">
        <Select label="Tipo de Persona" options={TIPOS_PERSONA.map((t) => ({ value: t, label: t }))} value={form.tipoPersona} onChange={(v) => setForm({ ...form, tipoPersona: v as "Natural" | "Jurídico" })} />
        <Select label="Giro de Negocio" options={GIROS.map((g) => ({ value: g, label: g }))} value={form.giroNegocio} onChange={(v) => setForm({ ...form, giroNegocio: v })} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Select label="Estatus de Cumplimiento" options={ESTATUS_CUMPLIMIENTO.map((e) => ({ value: e, label: e }))} value={form.estatusCumplimiento} onChange={(v) => setForm({ ...form, estatusCumplimiento: v })} />
        <Select label="Nivel de Fidelidad" options={NIVELES_FIDELIDAD.map((n) => ({ value: n, label: n }))} value={form.nivelFidelidad} onChange={(v) => setForm({ ...form, nivelFidelidad: v })} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Límite de Crédito ($)" type="number" min={0} value={form.limiteCredito} onChange={(e) => setForm({ ...form, limiteCredito: parseInt(e.target.value) || 0 })} />
        <div className="flex items-end pb-2">
          <Checkbox label="Cliente activo" checked={form.activo} onChange={(v) => setForm({ ...form, activo: v })} />
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--color-neutro-200)]">
        <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
        <Button size="sm" disabled={invalid} onClick={handleSubmit}>{editId ? "Guardar Cambios" : "Crear Cliente"}</Button>
      </div>
    </div>
  );
}

/* ── Sucursal Form ── */
function SucursalForm({ editId, onClose }: { editId: string | null; onClose: () => void }) {
  const store = useClientesStore();
  const existing = editId ? store.sucursales.find((s) => s.id === editId) : null;

  const [form, setForm] = useState({
    clienteId: existing?.clienteId ?? "",
    codigo: existing?.codigo ?? "",
    nombre: existing?.nombre ?? "",
    direccion: existing?.direccion ?? "",
    contacto: existing?.contacto ?? "",
    activo: existing?.activo ?? true,
  });

  const invalid = !form.clienteId || !form.codigo || !form.nombre;

  function handleSubmit() {
    if (invalid) return;
    if (editId) store.updateSucursal(editId, form);
    else store.addSucursal(form);
    onClose();
  }

  return (
    <div className="space-y-4">
      <Select label="Cliente" options={store.clientes.filter((c) => c.activo).map((c) => ({ value: c.id, label: c.razonSocial }))} value={form.clienteId} onChange={(v) => setForm({ ...form, clienteId: v })} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Código" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} placeholder="SUC-001" />
        <Input label="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre de la sucursal" />
      </div>
      <Textarea label="Dirección" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} placeholder="Dirección física" />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Contacto" value={form.contacto} onChange={(e) => setForm({ ...form, contacto: e.target.value })} placeholder="Persona de contacto" />
        <div className="flex items-end pb-2">
          <Checkbox label="Sucursal activa" checked={form.activo} onChange={(v) => setForm({ ...form, activo: v })} />
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--color-neutro-200)]">
        <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
        <Button size="sm" disabled={invalid} onClick={handleSubmit}>{editId ? "Guardar Cambios" : "Crear Sucursal"}</Button>
      </div>
    </div>
  );
}

/* ── Acuerdo Comercial Form ── */
function AcuerdoForm({ editId, onClose }: { editId: string | null; onClose: () => void }) {
  const store = useClientesStore();
  const existing = editId ? store.acuerdos.find((a) => a.id === editId) : null;

  const [form, setForm] = useState({
    clienteId: existing?.clienteId ?? "",
    plazoPago: existing?.plazoPago ?? "",
    listaPrecios: existing?.listaPrecios ?? "",
    puntosEntrega: existing?.puntosEntrega ?? "",
    ventanasRecepcion: existing?.ventanasRecepcion ?? "",
    activo: existing?.activo ?? true,
  });

  const invalid = !form.clienteId || !form.plazoPago;

  function handleSubmit() {
    if (invalid) return;
    if (editId) store.updateAcuerdo(editId, form);
    else store.addAcuerdo(form);
    onClose();
  }

  return (
    <div className="space-y-4">
      <Select label="Cliente" options={store.clientes.filter((c) => c.activo).map((c) => ({ value: c.id, label: c.razonSocial }))} value={form.clienteId} onChange={(v) => setForm({ ...form, clienteId: v })} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Plazo de Pago" value={form.plazoPago} onChange={(e) => setForm({ ...form, plazoPago: e.target.value })} placeholder="30 días, 45 días..." />
        <Input label="Lista de Precios" value={form.listaPrecios} onChange={(e) => setForm({ ...form, listaPrecios: e.target.value })} placeholder="Lista A, Lista B..." />
      </div>
      <Textarea label="Puntos de Entrega Autorizados" value={form.puntosEntrega} onChange={(e) => setForm({ ...form, puntosEntrega: e.target.value })} placeholder="Direcciones o destinos autorizados" />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Ventanas de Recepción" value={form.ventanasRecepcion} onChange={(e) => setForm({ ...form, ventanasRecepcion: e.target.value })} placeholder="Lun-Vie 8:00-16:00" />
        <div className="flex items-end pb-2">
          <Checkbox label="Acuerdo activo" checked={form.activo} onChange={(v) => setForm({ ...form, activo: v })} />
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--color-neutro-200)]">
        <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
        <Button size="sm" disabled={invalid} onClick={handleSubmit}>{editId ? "Guardar Cambios" : "Crear Acuerdo"}</Button>
      </div>
    </div>
  );
}
