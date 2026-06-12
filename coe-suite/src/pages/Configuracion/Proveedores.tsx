import { useState, useMemo, useEffect } from "react";
import {
  Plus, Search, Building2, Package, FileText, Pencil, Trash2,
} from "lucide-react";
import { Button, Checkbox, Select, Input, Textarea } from "@coe/design-system";
import { useProveedoresStore } from "@stores/proveedoresStore";
import { DeleteDialog } from "@components/shared/DeleteDialog";
import { Modal } from "@components/ui/Modal";

type Tab = "proveedores" | "servicios" | "ordenes";

const TABS: { key: Tab; label: string; icon: typeof Building2 }[] = [
  { key: "proveedores", label: "Proveedores", icon: Building2 },
  { key: "servicios", label: "Servicios", icon: Package },
  { key: "ordenes", label: "Órdenes de Compra", icon: FileText },
];

const ESTADOS_OC = ["Borrador", "Emitida", "Aprobada", "Recibida", "Cancelada"] as const;
const TIPOS_PROVEEDOR = ["Transportista de Valores", "Insumos", "Servicios", "Tecnología", "Mantenimiento"];

const estadoColor: Record<string, string> = {
  Borrador: "bg-gray-100 text-gray-600",
  Emitida: "bg-blue-100 text-blue-700",
  Aprobada: "bg-green-100 text-green-700",
  Recibida: "bg-purple-100 text-purple-700",
  Cancelada: "bg-red-100 text-red-700",
};

export function Proveedores() {
  const store = useProveedoresStore();
  const [tab, setTab] = useState<Tab>("proveedores");
  const [search, setSearch] = useState("");
  const [filterTipo, setFilterTipo] = useState<string>("");
  const [filterProveedor, setFilterProveedor] = useState<string>("");

  /* Modal states */
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [servicioFormOpen, setServicioFormOpen] = useState(false);
  const [editServicioId, setEditServicioId] = useState<string | null>(null);

  const [ordenFormOpen, setOrdenFormOpen] = useState(false);
  const [editOrdenId, setEditOrdenId] = useState<string | null>(null);

  /* ── Proveedores filtered ── */
  const filteredProveedores = useMemo(() => {
    let list = store.proveedores;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.nombre.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q) || p.contacto.toLowerCase().includes(q));
    }
    if (filterTipo) list = list.filter((p) => p.tipo === filterTipo);
    return list;
  }, [store.proveedores, search, filterTipo]);

  /* ── Servicios filtered ── */
  const filteredServicios = useMemo(() => {
    let list = store.servicios;
    if (filterProveedor) list = list.filter((s) => s.proveedorId === filterProveedor);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.nombre.toLowerCase().includes(q));
    }
    return list;
  }, [store.servicios, filterProveedor, search]);

  /* ── Ordenes filtered ── */
  const filteredOrdenes = useMemo(() => {
    let list = store.ordenes;
    if (filterProveedor) list = list.filter((o) => o.proveedorId === filterProveedor);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((o) => o.numero.toLowerCase().includes(q) || o.notas.toLowerCase().includes(q));
    }
    return list;
  }, [store.ordenes, filterProveedor, search]);

  /* ── Handlers ── */
  function handleDelete() {
    if (!deleteId) return;
    if (tab === "proveedores") store.removeProveedor(deleteId);
    else if (tab === "servicios") store.removeServicio(deleteId);
    else store.removeOrden(deleteId);
    setDeleteId(null);
  }

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-[18px] font-bold text-[var(--color-neutro-900)]">Proveedores</h1>
          <p className="text-[13px] text-[var(--color-neutro-500)]">Registro y gestión de proveedores, servicios y órdenes de compra</p>
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
              onClick={() => { setTab(t.key); setSearch(""); setFilterProveedor(""); setFilterTipo(""); }}
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
            placeholder={tab === "proveedores" ? "Buscar por nombre, código o contacto..." : tab === "servicios" ? "Buscar servicio..." : "Buscar por número..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {tab === "proveedores" && (
          <Select
            placeholder="Todos los tipos"
            options={TIPOS_PROVEEDOR.map((t) => ({ value: t, label: t }))}
            value={filterTipo}
            onChange={setFilterTipo}
          />
        )}
        {tab !== "proveedores" && (
          <Select
            placeholder="Todos los proveedores"
            options={store.proveedores.filter((p) => p.activo).map((p) => ({ value: p.id, label: p.nombre }))}
            value={filterProveedor}
            onChange={setFilterProveedor}
          />
        )}
        <Button
          size="sm"
          onClick={() => {
            if (tab === "proveedores") { setEditId(null); setFormOpen(true); }
            else if (tab === "servicios") { setEditServicioId(null); setServicioFormOpen(true); }
            else { setEditOrdenId(null); setOrdenFormOpen(true); }
          }}
          iconLeft={<Plus className="w-6 h-6" />}
        >
          {tab === "proveedores" ? "Nuevo Proveedor" : tab === "servicios" ? "Nuevo Servicio" : "Nueva Orden"}
        </Button>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 bg-white border border-[var(--color-neutro-200)] rounded-corner-m overflow-auto">
        {tab === "proveedores" && (
          <table className="w-full text-[13px]">
            <thead className="bg-[var(--color-neutro-50)] text-[12px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">Código</th>
                <th className="text-left px-4 py-3">Nombre</th>
                <th className="text-left px-4 py-3">Tipo</th>
                <th className="text-left px-4 py-3">Contacto</th>
                <th className="text-left px-4 py-3">Teléfono</th>
                <th className="text-center px-4 py-3">Estado</th>
                <th className="text-right px-4 py-3 w-[80px]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProveedores.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-[var(--color-neutro-400)]">No hay proveedores registrados</td></tr>
              ) : filteredProveedores.map((p) => (
                <tr key={p.id} className="border-t border-[var(--color-neutro-100)] hover:bg-[var(--color-neutro-50)] transition-colors">
                  <td className="px-4 py-3 font-mono text-[12px] text-[var(--color-neutro-500)]">{p.codigo}</td>
                  <td className="px-4 py-3 font-medium text-[var(--color-neutro-900)]">{p.nombre}</td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-corner-m bg-[var(--color-verde-100)]/10 text-[var(--color-verde-100)]">
                      {p.tipo}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-neutro-600)]">{p.contacto}</td>
                  <td className="px-4 py-3 text-[var(--color-neutro-500)]">{p.telefono}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block w-2 h-2 rounded-full ${p.activo ? "bg-green-500" : "bg-red-400"}`} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        className="p-1.5 rounded-corner-m hover:bg-[var(--color-neutro-100)] text-[var(--color-neutro-400)] transition-colors"
                        onClick={() => { setEditId(p.id); setFormOpen(true); }}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        className="p-1.5 rounded-corner-m hover:bg-red-50 text-red-400 transition-colors"
                        onClick={() => { setDeleteId(p.id); setDeleteOpen(true); }}
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

        {tab === "servicios" && (
          <table className="w-full text-[13px]">
            <thead className="bg-[var(--color-neutro-50)] text-[12px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">Proveedor</th>
                <th className="text-left px-4 py-3">Servicio</th>
                <th className="text-left px-4 py-3">Descripción</th>
                <th className="text-right px-4 py-3">Precio</th>
                <th className="text-center px-4 py-3">Estado</th>
                <th className="text-right px-4 py-3 w-[80px]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredServicios.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-[var(--color-neutro-400)]">No hay servicios registrados</td></tr>
              ) : filteredServicios.map((s) => {
                const prov = store.getProveedorById(s.proveedorId);
                return (
                  <tr key={s.id} className="border-t border-[var(--color-neutro-100)] hover:bg-[var(--color-neutro-50)] transition-colors">
                    <td className="px-4 py-3 text-[var(--color-neutro-700)]">{prov?.nombre ?? "—"}</td>
                    <td className="px-4 py-3 font-medium text-[var(--color-neutro-900)]">{s.nombre}</td>
                    <td className="px-4 py-3 text-[var(--color-neutro-500)] max-w-[250px] truncate">{s.descripcion}</td>
                    <td className="px-4 py-3 text-right font-mono text-[var(--color-neutro-700)]">${s.precio.toFixed(2)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block w-2 h-2 rounded-full ${s.activo ? "bg-green-500" : "bg-red-400"}`} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          className="p-1.5 rounded-corner-m hover:bg-[var(--color-neutro-100)] text-[var(--color-neutro-400)] transition-colors"
                          onClick={() => { setEditServicioId(s.id); setServicioFormOpen(true); }}
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

        {tab === "ordenes" && (
          <table className="w-full text-[13px]">
            <thead className="bg-[var(--color-neutro-50)] text-[12px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">Número</th>
                <th className="text-left px-4 py-3">Proveedor</th>
                <th className="text-left px-4 py-3">Fecha</th>
                <th className="text-center px-4 py-3">Estado</th>
                <th className="text-right px-4 py-3">Total</th>
                <th className="text-left px-4 py-3">Notas</th>
                <th className="text-right px-4 py-3 w-[80px]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrdenes.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-[var(--color-neutro-400)]">No hay órdenes de compra registradas</td></tr>
              ) : filteredOrdenes.map((o) => {
                const prov = store.getProveedorById(o.proveedorId);
                return (
                  <tr key={o.id} className="border-t border-[var(--color-neutro-100)] hover:bg-[var(--color-neutro-50)] transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-[var(--color-neutro-900)]">{o.numero}</td>
                    <td className="px-4 py-3 text-[var(--color-neutro-700)]">{prov?.nombre ?? "—"}</td>
                    <td className="px-4 py-3 text-[var(--color-neutro-500)]">{o.fecha}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-corner-m ${estadoColor[o.estado] ?? ""}`}>
                        {o.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-[var(--color-neutro-900)]">${o.total.toFixed(2)}</td>
                    <td className="px-4 py-3 text-[var(--color-neutro-500)] max-w-[200px] truncate">{o.notas}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          className="p-1.5 rounded-corner-m hover:bg-[var(--color-neutro-100)] text-[var(--color-neutro-400)] transition-colors"
                          onClick={() => { setEditOrdenId(o.id); setOrdenFormOpen(true); }}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="p-1.5 rounded-corner-m hover:bg-red-50 text-red-400 transition-colors"
                          onClick={() => { setDeleteId(o.id); setDeleteOpen(true); }}
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

      {/* ── Proveedor Form ── */}
      <ProveedorFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditId(null); }}
        editId={editId}
      />

      {/* ── Servicio Form ── */}
      <ServicioFormModal
        open={servicioFormOpen}
        onClose={() => { setServicioFormOpen(false); setEditServicioId(null); }}
        editId={editServicioId}
      />

      {/* ── Orden Form ── */}
      <OrdenFormModal
        open={ordenFormOpen}
        onClose={() => { setOrdenFormOpen(false); setEditOrdenId(null); }}
        editId={editOrdenId}
      />

      {/* ── Delete ── */}
      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Eliminar ${tab === "proveedores" ? "Proveedor" : tab === "servicios" ? "Servicio" : "Orden de Compra"}`}
        description="¿Está seguro de eliminar este registro?"
        onConfirm={handleDelete}
      />
    </div>
  );
}

/* ── Proveedor Form ── */
function ProveedorFormModal({ open, onClose, editId }: { open: boolean; onClose: () => void; editId: string | null }) {
  const store = useProveedoresStore();
  const existing = editId ? store.proveedores.find((p) => p.id === editId) : null;

  const [form, setForm] = useState({
    codigo: "", nombre: "", tipo: "Servicios", contacto: "", telefono: "", email: "", direccion: "", activo: true,
  });

  useEffect(() => {
    if (existing) setForm({ codigo: existing.codigo, nombre: existing.nombre, tipo: existing.tipo, contacto: existing.contacto, telefono: existing.telefono, email: existing.email, direccion: existing.direccion, activo: existing.activo });
    else setForm({ codigo: "", nombre: "", tipo: "Servicios", contacto: "", telefono: "", email: "", direccion: "", activo: true });
  }, [existing]);

  function handleSave() {
    if (!form.codigo || !form.nombre) return;
    const data = { codigo: form.codigo.toUpperCase(), nombre: form.nombre, tipo: form.tipo, contacto: form.contacto, telefono: form.telefono, email: form.email, direccion: form.direccion, activo: form.activo };
    if (editId) store.updateProveedor(editId, data);
    else store.addProveedor(data);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editId ? "Editar Proveedor" : "Nuevo Proveedor"}
      size="md"
      actions={
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
          <Button size="sm" onClick={handleSave} disabled={!form.codigo || !form.nombre}>{editId ? "Guardar" : "Crear"}</Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Código *" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} placeholder="PROV-XXX" />
          <Select label="Tipo" options={TIPOS_PROVEEDOR.map((t) => ({ value: t, label: t }))} value={form.tipo} onChange={(v) => setForm({ ...form, tipo: v })} />
        </div>
        <Input label="Nombre *" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Razón social" />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Contacto" value={form.contacto} onChange={(e) => setForm({ ...form, contacto: e.target.value })} placeholder="Nombre del contacto" />
          <Input label="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} placeholder="+58 XXX XXX XXXX" />
        </div>
        <Input label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="correo@proveedor.com" />
        <Input label="Dirección" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} placeholder="Dirección fiscal" />
        <Checkbox label="Activo" checked={form.activo} onChange={(v) => setForm({ ...form, activo: v })} />
      </div>
    </Modal>
  );
}

/* ── Servicio Form ── */
function ServicioFormModal({ open, onClose, editId }: { open: boolean; onClose: () => void; editId: string | null }) {
  const store = useProveedoresStore();
  const existing = editId ? store.servicios.find((s) => s.id === editId) : null;

  const [form, setForm] = useState({
    proveedorId: store.proveedores.length > 0 ? store.proveedores[0].id : "", nombre: "", descripcion: "", precio: 0, activo: true,
  });

  useEffect(() => {
    if (existing) setForm({ proveedorId: existing.proveedorId, nombre: existing.nombre, descripcion: existing.descripcion, precio: existing.precio, activo: existing.activo });
    else setForm({ proveedorId: store.proveedores.length > 0 ? store.proveedores[0].id : "", nombre: "", descripcion: "", precio: 0, activo: true });
  }, [existing]);

  function handleSave() {
    if (!form.nombre || !form.proveedorId) return;
    const data = { proveedorId: form.proveedorId, nombre: form.nombre, descripcion: form.descripcion, precio: form.precio, activo: form.activo };
    if (editId) store.updateServicio(editId, data);
    else store.addServicio(data);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editId ? "Editar Servicio" : "Nuevo Servicio"}
      size="md"
      actions={
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
          <Button size="sm" onClick={handleSave} disabled={!form.nombre || !form.proveedorId}>{editId ? "Guardar" : "Crear"}</Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Select label="Proveedor *" options={store.proveedores.filter((p) => p.activo).map((p) => ({ value: p.id, label: p.nombre }))} value={form.proveedorId} onChange={(v) => setForm({ ...form, proveedorId: v })} />
        <Input label="Nombre del Servicio *" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Transporte de Valores" />
        <Textarea label="Descripción" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} placeholder="Descripción del servicio" />
        <Input label="Precio ($)" type="number" step={0.01} min={0} value={form.precio} onChange={(e) => setForm({ ...form, precio: parseFloat(e.target.value) || 0 })} />
        <Checkbox label="Activo" checked={form.activo} onChange={(v) => setForm({ ...form, activo: v })} />
      </div>
    </Modal>
  );
}

/* ── Orden de Compra Form ── */
function OrdenFormModal({ open, onClose, editId }: { open: boolean; onClose: () => void; editId: string | null }) {
  const store = useProveedoresStore();
  const existing = editId ? store.ordenes.find((o) => o.id === editId) : null;

  const [form, setForm] = useState({
    proveedorId: store.proveedores.length > 0 ? store.proveedores[0].id : "", numero: "", fecha: new Date().toISOString().split("T")[0], estado: "Borrador" as typeof ESTADOS_OC[number], total: 0, notas: "",
  });

  useEffect(() => {
    if (existing) setForm({ proveedorId: existing.proveedorId, numero: existing.numero, fecha: existing.fecha, estado: existing.estado, total: existing.total, notas: existing.notas });
    else setForm({ proveedorId: store.proveedores.length > 0 ? store.proveedores[0].id : "", numero: "", fecha: new Date().toISOString().split("T")[0], estado: "Borrador", total: 0, notas: "" });
  }, [existing]);

  function handleSave() {
    if (!form.numero || !form.proveedorId) return;
    const data = { proveedorId: form.proveedorId, numero: form.numero.toUpperCase(), fecha: form.fecha, estado: form.estado, total: form.total, notas: form.notas };
    if (editId) store.updateOrden(editId, data);
    else store.addOrden(data);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editId ? "Editar Orden de Compra" : "Nueva Orden de Compra"}
      size="md"
      actions={
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
          <Button size="sm" onClick={handleSave} disabled={!form.numero || !form.proveedorId}>{editId ? "Guardar" : "Crear"}</Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Número *" value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} placeholder="OC-2026-XXX" />
          <Input label="Fecha" type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
        </div>
        <Select label="Proveedor *" options={store.proveedores.filter((p) => p.activo).map((p) => ({ value: p.id, label: p.nombre }))} value={form.proveedorId} onChange={(v) => setForm({ ...form, proveedorId: v })} />
        <div className="grid grid-cols-2 gap-4">
          <Select label="Estado" options={ESTADOS_OC.map((e) => ({ value: e, label: e }))} value={form.estado} onChange={(v) => setForm({ ...form, estado: v as typeof ESTADOS_OC[number] })} />
          <Input label="Total ($)" type="number" step={0.01} min={0} value={form.total} onChange={(e) => setForm({ ...form, total: parseFloat(e.target.value) || 0 })} />
        </div>
        <Textarea label="Notas" value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} placeholder="Detalles de la orden" />
      </div>
    </Modal>
  );
}
