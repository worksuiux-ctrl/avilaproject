import { useState, useMemo, useEffect } from "react";
import {
  Plus, Search, Building2, Package, FileText, Pencil, Trash2, Truck, DollarSign, MapPin, Warehouse, Eye, X, Map, User, ShieldCheck, ChevronLeft, Cpu,
} from "lucide-react";
import { Button, Checkbox, Select, Input, Textarea } from "@coe/design-system";
import {
  useProveedoresStore, TIPOS_PROVEEDOR, calcularPrecio,
} from "@stores/proveedoresStore";
import { useTransaccionesStore } from "@stores/transaccionesStore";
import { useDispositivosStore } from "@stores/dispositivosStore";
import type { VariableTarifaria } from "@stores/proveedoresStore";
import { DeleteDialog } from "@components/shared/DeleteDialog";
import { Modal } from "@components/ui/Modal";

type Tab = "proveedores" | "servicios" | "ordenes";

const TABS: { key: Tab; label: string; icon: typeof Building2 }[] = [
  { key: "proveedores", label: "Proveedores", icon: Building2 },
  { key: "servicios", label: "Servicios", icon: Package },
  { key: "ordenes", label: "Órdenes de Compra", icon: FileText },
];

const ESTADOS_OC = ["Borrador", "Emitida", "Aprobada", "Recibida", "Cancelada"] as const;

const CATEGORIA_COLORS: Record<string, string> = {
  Traslado: "bg-blue-100 text-blue-700",
  Custodia: "bg-purple-100 text-purple-700",
  Conteo: "bg-amber-100 text-amber-700",
  Manipulación: "bg-orange-100 text-orange-700",
  Consumible: "bg-teal-100 text-teal-700",
  Monitoreo: "bg-indigo-100 text-indigo-700",
  "Vigilancia Electrónica": "bg-cyan-100 text-cyan-700",
  "Respuesta a Emergencias": "bg-red-100 text-red-700",
  "Soporte Técnico": "bg-sky-100 text-sky-700",
  Instalación: "bg-emerald-100 text-emerald-700",
  "Mantenimiento Preventivo": "bg-lime-100 text-lime-700",
  "Mantenimiento Correctivo": "bg-rose-100 text-rose-700",
  "Servicio General": "bg-gray-100 text-gray-700",
  "Proveedor de Dispositivos": "bg-violet-100 text-violet-700",
};

const TIPOS_RUTA = ["Agencia", "ATM", "Bóveda", "Caja", "Banco", "Cliente", "Sucursal Cliente", "Centro de Acopio", "Taquilla"];

const INFRA_SECCIONES_POR_TIPO: Record<string, { sucursales: boolean; unidades: boolean; depositos: boolean; centrosAcopio: boolean; personal: boolean; personalLabel: string }> = {
  "Transportista de Valores": { sucursales: true, unidades: true, depositos: false, centrosAcopio: true, personal: true, personalLabel: "Personal" },
  Seguridad: { sucursales: true, unidades: false, depositos: true, centrosAcopio: false, personal: true, personalLabel: "Personal de Seguridad" },
  Insumos: { sucursales: true, unidades: false, depositos: true, centrosAcopio: false, personal: false, personalLabel: "" },
  Tecnología: { sucursales: true, unidades: false, depositos: false, centrosAcopio: false, personal: true, personalLabel: "Técnicos" },
  Mantenimiento: { sucursales: true, unidades: false, depositos: false, centrosAcopio: false, personal: true, personalLabel: "Técnicos de Mantenimiento" },
  Servicios: { sucursales: true, unidades: false, depositos: false, centrosAcopio: false, personal: false, personalLabel: "" },
  Dispositivos: { sucursales: true, unidades: false, depositos: true, centrosAcopio: false, personal: true, personalLabel: "Técnicos" },
};

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
  const [filterCategoria, setFilterCategoria] = useState<string>("");

  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteEntity, setDeleteEntity] = useState<string>("");

  const [servicioFormOpen, setServicioFormOpen] = useState(false);
  const [editServicioId, setEditServicioId] = useState<string | null>(null);
  const [detailServicioId, setDetailServicioId] = useState<string | null>(null);

  const [ordenFormOpen, setOrdenFormOpen] = useState(false);
  const [editOrdenId, setEditOrdenId] = useState<string | null>(null);

  const [sucursalFormOpen, setSucursalFormOpen] = useState(false);
  const [editSucursalId, setEditSucursalId] = useState<string | null>(null);
  const [unidadFormOpen, setUnidadFormOpen] = useState(false);
  const [editUnidadId, setEditUnidadId] = useState<string | null>(null);
  const [depositoFormOpen, setDepositoFormOpen] = useState(false);
  const [editDepositoId, setEditDepositoId] = useState<string | null>(null);

  const [viewingProveedorId, setViewingProveedorId] = useState<string | null>(null);
  const [centroAcopioFormOpen, setCentroAcopioFormOpen] = useState(false);
  const [editCentroAcopioId, setEditCentroAcopioId] = useState<string | null>(null);
  const [personalFormOpen, setPersonalFormOpen] = useState(false);
  const [editPersonalId, setEditPersonalId] = useState<string | null>(null);

  const filteredProveedores = useMemo(() => {
    let list = store.proveedores;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.nombre.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q) || p.contacto.toLowerCase().includes(q));
    }
    if (filterTipo) list = list.filter((p) => p.tipo === filterTipo);
    return list;
  }, [store.proveedores, search, filterTipo]);

  const filteredServicios = useMemo(() => {
    let list = store.servicios;
    if (filterProveedor) list = list.filter((s) => s.proveedorId === filterProveedor);
    if (filterCategoria) list = list.filter((s) => s.categoria === filterCategoria);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.nombre.toLowerCase().includes(q));
    }
    return list;
  }, [store.servicios, filterProveedor, filterCategoria, search]);

  const allCategorias = useMemo(() => {
    const cats = new Set(store.servicios.map((s) => s.categoria));
    return Array.from(cats).sort();
  }, [store.servicios]);

  const filteredOrdenes = useMemo(() => {
    let list = store.ordenes;
    if (filterProveedor) list = list.filter((o) => o.proveedorId === filterProveedor);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((o) => o.numero.toLowerCase().includes(q) || o.notas.toLowerCase().includes(q));
    }
    return list;
  }, [store.ordenes, filterProveedor, search]);

  function handleDelete() {
    if (!deleteId) return;
    if (deleteEntity === "proveedor") store.removeProveedor(deleteId);
    else if (deleteEntity === "servicio") store.removeServicio(deleteId);
    else if (deleteEntity === "orden") store.removeOrden(deleteId);
    else if (deleteEntity === "sucursal") store.removeSucursal(deleteId);
    else if (deleteEntity === "unidad") store.removeUnidad(deleteId);
    else if (deleteEntity === "deposito") store.removeDeposito(deleteId);
    else if (deleteEntity === "centroAcopio") store.removeCentroAcopio(deleteId);
    else if (deleteEntity === "personal") store.removePersonal(deleteId);
    setDeleteId(null);
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-[18px] font-bold text-[var(--color-neutro-900)]">{viewingProveedorId ? "Infraestructura del proveedor" : "Proveedores"}</h1>
          <p className="text-[13px] text-[var(--color-neutro-500)]">{viewingProveedorId ? "Zonas, unidades, depósitos y personal asignados" : "Registro y gestión de proveedores, servicios y órdenes de compra"}</p>
        </div>
      </div>

      {!viewingProveedorId && (<>
      <div className="flex items-center gap-1 mb-4 bg-[var(--color-neutro-100)] p-1 rounded-corner-m w-fit">
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setSearch(""); setFilterProveedor(""); setFilterTipo(""); setFilterCategoria(""); }}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-semibold rounded-corner-m transition-all ${isActive ? "bg-white text-[var(--color-neutro-900)] shadow-sm" : "text-[var(--color-neutro-500)] hover:text-[var(--color-neutro-700)]"}`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

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
        {tab === "servicios" && (
          <>
            <Select
              placeholder="Todos los proveedores"
              options={store.proveedores.filter((p) => p.activo).map((p) => ({ value: p.id, label: p.nombre }))}
              value={filterProveedor}
              onChange={setFilterProveedor}
            />
            <Select
              placeholder="Todas las categorías"
              options={allCategorias.map((c) => ({ value: c, label: c }))}
              value={filterCategoria}
              onChange={setFilterCategoria}
            />
          </>
        )}
        {tab === "ordenes" && (
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
      </>)}

      <div className="flex-1 overflow-auto">
        {viewingProveedorId ? (
          <ProveedorDetailPage
            proveedorId={viewingProveedorId}
            onBack={() => setViewingProveedorId(null)}
            onEditSucursal={(id) => { setEditSucursalId(id); setSucursalFormOpen(true); }}
            onNewSucursal={() => { setEditSucursalId(null); setSucursalFormOpen(true); }}
            onEditUnidad={(id) => { setEditUnidadId(id); setUnidadFormOpen(true); }}
            onNewUnidad={() => { setEditUnidadId(null); setUnidadFormOpen(true); }}
            onEditDeposito={(id) => { setEditDepositoId(id); setDepositoFormOpen(true); }}
            onNewDeposito={() => { setEditDepositoId(null); setDepositoFormOpen(true); }}
            onEditCentroAcopio={(id) => { setEditCentroAcopioId(id); setCentroAcopioFormOpen(true); }}
            onNewCentroAcopio={() => { setEditCentroAcopioId(null); setCentroAcopioFormOpen(true); }}
            onEditPersonal={(id) => { setEditPersonalId(id); setPersonalFormOpen(true); }}
            onNewPersonal={() => { setEditPersonalId(null); setPersonalFormOpen(true); }}
            onDelete={(id, entity) => { setDeleteId(id); setDeleteEntity(entity); setDeleteOpen(true); }}
          />
        ) : tab === "proveedores" && (
          <div className="p-4">
            {filteredProveedores.length === 0 ? (
              <div className="text-center py-12 text-[var(--color-neutro-400)]">No hay proveedores registrados</div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {filteredProveedores.map((p) => (
                  <div key={p.id} className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m p-4 hover:shadow-sm hover:border-[var(--color-neutro-300)] transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-corner-m bg-[var(--color-verde-100)]/10 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-[var(--color-verde-100)]" />
                        </div>
                        <div>
                          <p className="text-[14px] font-semibold text-[var(--color-neutro-900)] leading-tight">{p.nombre}</p>
                          <p className="text-[11px] font-mono text-[var(--color-neutro-400)]">{p.codigo}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 rounded-corner-m hover:bg-[var(--color-neutro-100)] text-[var(--color-neutro-400)] transition-colors" onClick={() => { setEditId(p.id); setFormOpen(true); }}>
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 rounded-corner-m hover:bg-red-50 text-red-400 transition-colors" onClick={() => { setDeleteId(p.id); setDeleteEntity("proveedor"); setDeleteOpen(true); }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-corner-m bg-[var(--color-verde-100)]/10 text-[var(--color-verde-100)]">
                        {p.tipo}
                      </span>
                      <span className={`inline-block w-2 h-2 rounded-full ${p.activo ? "bg-green-500" : "bg-red-400"}`} />
                    </div>
                    <div className="space-y-1 text-[12px] text-[var(--color-neutro-500)]">
                      <p><span className="text-[var(--color-neutro-400)]">Contacto: </span>{p.contacto}</p>
                      <p><span className="text-[var(--color-neutro-400)]">Tel: </span>{p.telefono}</p>
                      <p><span className="text-[var(--color-neutro-400)]">Email: </span>{p.email}</p>
                    </div>
                    <button
                      className="mt-3 w-full flex items-center justify-center gap-1.5 text-[12px] font-semibold text-[var(--color-verde-100)] bg-[var(--color-verde-100)]/5 hover:bg-[var(--color-verde-100)]/10 border border-[var(--color-verde-100)]/20 rounded-corner-m py-2 transition-colors"
                      onClick={() => setViewingProveedorId(p.id)}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Ver Infraestructura
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "servicios" && (
          <div className="p-4">
            {filteredServicios.length === 0 ? (
              <div className="text-center py-12 text-[var(--color-neutro-400)]">No hay servicios registrados</div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {filteredServicios.map((s) => {
                  const prov = store.getProveedorById(s.proveedorId);
                  const asigns = store.getUnidadesByServicio(s.id);
                  return (
                    <div key={s.id} className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m p-4 hover:shadow-sm hover:border-[var(--color-neutro-300)] transition-all cursor-pointer" onClick={() => setDetailServicioId(s.id)}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-corner-m flex items-center justify-center" style={{ backgroundColor: CATEGORIA_COLORS[s.categoria]?.split(" ")[0] ?? "#f3f4f6" }}>
                            <Package className="w-5 h-5" style={{ color: CATEGORIA_COLORS[s.categoria]?.split(" ")[1]?.replace("text-", "")?.replace("var(--color-", "") ? undefined : undefined }} />
                          </div>
                          <div>
                            <p className="text-[14px] font-semibold text-[var(--color-neutro-900)] leading-tight">{s.nombre}</p>
                            <p className="text-[11px] text-[var(--color-neutro-400)]">{prov?.nombre ?? "—"}</p>
                            <p className="text-[10px] font-mono text-[var(--color-neutro-400)]">{s.codigo}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button className="p-1.5 rounded-corner-m hover:bg-[var(--color-neutro-100)] text-[var(--color-neutro-400)] transition-colors" onClick={() => { setEditServicioId(s.id); setServicioFormOpen(true); }}>
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1.5 rounded-corner-m hover:bg-red-50 text-red-400 transition-colors" onClick={() => { setDeleteId(s.id); setDeleteEntity("servicio"); setDeleteOpen(true); }}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-corner-m ${CATEGORIA_COLORS[s.categoria] ?? "bg-gray-100 text-gray-600"}`}>
                          {s.categoria}
                        </span>
                        <span className={`inline-block w-2 h-2 rounded-full ${s.activo ? "bg-green-500" : "bg-red-400"}`} />
                        <span className="text-[13px] font-mono font-semibold text-[var(--color-verde-100)] ml-auto">${s.precio.toFixed(2)}</span>
                      </div>
                      <p className="text-[12px] text-[var(--color-neutro-500)] mb-3">{s.descripcion}</p>
                      <div className="flex items-center gap-2 text-[11px] text-[var(--color-neutro-400)] border-t border-[var(--color-neutro-100)] pt-2 mt-1">
                        {(() => {
                          const hoy = new Date();
                          const venc = new Date(s.fechaVencimiento);
                          const diff = Math.ceil((venc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
                          if (diff < 0) return <span className="text-red-500 font-semibold">Vencido</span>;
                          if (diff <= s.diasPreaviso) return <span className="text-amber-500 font-semibold">{diff} días</span>;
                          return <span className="text-[var(--color-neutro-400)]">{diff} días</span>;
                        })()}
                        <span>{s.accionVencimiento === "Renovar" ? "↻ Renovación" : "✕ Cancelación"}</span>
                        {asigns.length > 0 && (
                          <span className="ml-auto flex items-center gap-1"><Truck className="w-3 h-3" />{asigns.length}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === "ordenes" && (
          <table className="w-full text-[13px] bg-white">
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
                          onClick={() => { setDeleteId(o.id); setDeleteEntity("orden"); setDeleteOpen(true); }}
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

      <ProveedorFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditId(null); }}
        editId={editId}
      />

      <ServicioFormModal
        open={servicioFormOpen}
        onClose={() => { setServicioFormOpen(false); setEditServicioId(null); }}
        editId={editServicioId}
      />

      <ServicioDetailModal
        servicioId={detailServicioId}
        onClose={() => setDetailServicioId(null)}
      />

      <OrdenFormModal
        open={ordenFormOpen}
        onClose={() => { setOrdenFormOpen(false); setEditOrdenId(null); }}
        editId={editOrdenId}
      />

      <SucursalFormModal
        open={sucursalFormOpen}
        onClose={() => { setSucursalFormOpen(false); setEditSucursalId(null); }}
        editId={editSucursalId}
      />
      <UnidadFormModal
        open={unidadFormOpen}
        onClose={() => { setUnidadFormOpen(false); setEditUnidadId(null); }}
        editId={editUnidadId}
      />
      <DepositoFormModal
        open={depositoFormOpen}
        onClose={() => { setDepositoFormOpen(false); setEditDepositoId(null); }}
        editId={editDepositoId}
      />
      <CentroAcopioFormModal
        open={centroAcopioFormOpen}
        onClose={() => { setCentroAcopioFormOpen(false); setEditCentroAcopioId(null); }}
        editId={editCentroAcopioId}
      />
      <PersonalFormModal
        open={personalFormOpen}
        onClose={() => { setPersonalFormOpen(false); setEditPersonalId(null); }}
        editId={editPersonalId}
      />
      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Eliminar ${deleteEntity === "proveedor" ? "Proveedor" : deleteEntity === "servicio" ? "Servicio" : deleteEntity === "orden" ? "Orden de Compra" : deleteEntity === "sucursal" ? "Sucursal" : deleteEntity === "unidad" ? "Unidad de Transporte" : deleteEntity === "deposito" ? "Depósito" : deleteEntity === "centroAcopio" ? "Centro de Acopio" : deleteEntity === "personal" ? "Personal" : "Registro"}`}
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
    codigo: "", nombre: "", tipo: "Transportista de Valores", contacto: "", telefono: "", email: "", direccion: "", activo: true,
  });

  useEffect(() => {
    if (existing) setForm({ codigo: existing.codigo, nombre: existing.nombre, tipo: existing.tipo, contacto: existing.contacto, telefono: existing.telefono, email: existing.email, direccion: existing.direccion, activo: existing.activo });
    else setForm({ codigo: "", nombre: "", tipo: "Transportista de Valores", contacto: "", telefono: "", email: "", direccion: "", activo: true });
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
          <Select label="Tipo *" options={TIPOS_PROVEEDOR.map((t) => ({ value: t, label: t }))} value={form.tipo} onChange={(v) => setForm({ ...form, tipo: v })} />
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

/* ── Servicio Form (dinámico por categoría) ── */
function ServicioFormModal({ open, onClose, editId }: { open: boolean; onClose: () => void; editId: string | null }) {
  const store = useProveedoresStore();
  const existing = editId ? store.servicios.find((s) => s.id === editId) : null;

  const [codigo, setCodigo] = useState("");
  const [proveedorId, setProveedorId] = useState("");
  const [categoria, setCategoria] = useState("");
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState(0);
  const [activo, setActivo] = useState(true);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaVencimiento, setFechaVencimiento] = useState("");
  const [accionVencimiento, setAccionVencimiento] = useState<"Renovar" | "Cancelar">("Renovar");
  const [diasPreaviso, setDiasPreaviso] = useState(30);

  const [valoresSimulacion, setValoresSimulacion] = useState<Record<string, number>>({});

  const [unidadesAsignadas, setUnidadesAsignadas] = useState<string[]>([]);
  const [rolesUnidad, setRolesUnidad] = useState<Record<string, "Principal" | "Secundario" | "Backup">>({});
  const [estadosAplicables, setEstadosAplicables] = useState<string[]>([]);
  const [rutas, setRutas] = useState<string[]>([]);
  const [rutaOrigen, setRutaOrigen] = useState("");
  const [rutaDestino, setRutaDestino] = useState("");
  const [rutaSugerida, setRutaSugerida] = useState("");
  const [tiposDispositivoIds, setTiposDispositivoIds] = useState<string[]>([]);
  const [marcasIds, setMarcasIds] = useState<string[]>([]);
  const dispStore = useDispositivosStore();

  const proveedorSel = store.proveedores.find((p) => p.id === proveedorId) ?? null;
  const categoriasDisponibles = proveedorSel ? store.getCategoriasByTipoProveedor(proveedorSel.tipo) : [];
  const variablesDefecto = store.getVariablesPorDefecto(categoria);
  const unidadesDelProveedor = proveedorSel ? store.getUnidadesByProveedor(proveedorSel.id) : [];

  const asignacionesExistentes = editId ? store.getUnidadesByServicio(editId) : [];

  useEffect(() => {
    if (existing) {
      setCodigo(existing.codigo);
      setProveedorId(existing.proveedorId);
      setCategoria(existing.categoria);
      setNombre(existing.nombre);
      setDescripcion(existing.descripcion);
      setPrecio(existing.precio);
      setActivo(existing.activo);
      setFechaInicio(existing.fechaInicio);
      setFechaVencimiento(existing.fechaVencimiento);
      setAccionVencimiento(existing.accionVencimiento);
      setDiasPreaviso(existing.diasPreaviso);
      setEstadosAplicables(existing.estadosAplicables ?? []);
      setRutas(existing.rutas ?? []);
      setTiposDispositivoIds(existing.tiposDispositivoIds ?? []);
      setMarcasIds(existing.marcasIds ?? []);

      const vals: Record<string, number> = {};
      existing.variables.forEach((v) => {
        vals[v.nombre] = typeof v.valorDefecto === "number" ? v.valorDefecto : 0;
      });
      setValoresSimulacion(vals);

      const asigns = store.getUnidadesByServicio(existing.id);
      setUnidadesAsignadas(asigns.map((a) => a.unidadId));
      const roles: Record<string, "Principal" | "Secundario" | "Backup"> = {};
      asigns.forEach((a) => { roles[a.unidadId] = a.rol; });
      setRolesUnidad(roles);
    } else {
      setProveedorId(store.proveedores.length > 0 ? store.proveedores[0].id : "");
      setCategoria("");
      setNombre("");
      setDescripcion("");
      setPrecio(0);
      setCodigo("");
      setActivo(true);
      setFechaInicio(new Date().toISOString().split("T")[0]);
      const venc = new Date(); venc.setFullYear(venc.getFullYear() + 1);
      setFechaVencimiento(venc.toISOString().split("T")[0]);
      setAccionVencimiento("Renovar");
      setDiasPreaviso(30);
      setValoresSimulacion({});
      setUnidadesAsignadas([]);
      setRolesUnidad({});
      setEstadosAplicables([]);
      setRutas([]);
      setRutaOrigen("");
      setRutaDestino("");
      setRutaSugerida("");
      setTiposDispositivoIds([]);
      setMarcasIds([]);
    }
  }, [existing, open]);

  useEffect(() => {
    setCategoria("");
    setUnidadesAsignadas([]);
    setRolesUnidad({});
    setValoresSimulacion({});
  }, [proveedorId]);

  const precioEstimado = useMemo(() => {
    const sv = existing ?? null;
    if (!sv) {
      let total = 0;
      for (const v of variablesDefecto) {
        const val = valoresSimulacion[v.nombre] ?? Number(v.valorDefecto) ?? 0;
        if (v.tipo === "select") {
          const idx = (v.opciones ?? []).indexOf(String(v.valorDefecto));
          total += (idx + 1) * v.factorCalculo;
        } else {
          total += val * v.factorCalculo;
        }
      }
      return total;
    }
    const mergedVars = sv.variables.map((v) => ({
      ...v,
      valorDefecto: valoresSimulacion[v.nombre] ?? v.valorDefecto,
    }));
    return calcularPrecio({ ...sv, variables: mergedVars }, valoresSimulacion);
  }, [valoresSimulacion, variablesDefecto, existing]);

  function handleSave() {
    if (!nombre || !proveedorId || !categoria) return;

    if (editId) {
      const updatedVars = existing?.variables.map((v) => ({
        ...v,
        valorDefecto: valoresSimulacion[v.nombre] ?? v.valorDefecto,
      })) ?? [];
      store.updateServicio(editId, {
        codigo, proveedorId, categoria, nombre, descripcion, precio, activo,
        fechaInicio, fechaVencimiento, accionVencimiento, diasPreaviso,
        variables: updatedVars, estadosAplicables, rutas,
        tiposDispositivoIds, marcasIds,
      });
      asignacionesExistentes.forEach((a) => store.desasignarUnidad(a.id));
      unidadesAsignadas.forEach((uid) => {
        store.asignarUnidad({ servicioId: editId, unidadId: uid, rol: rolesUnidad[uid] ?? "Principal", fechaAsignacion: new Date().toISOString().split("T")[0] });
      });
    } else {
      const sid = `tmp-${Math.random().toString(36).slice(2, 9)}`;
      const variables = variablesDefecto.map((v) => ({
        ...v, id: `var-${Math.random().toString(36).slice(2, 9)}`, servicioId: sid,
      }));
      store.addServicio({
        proveedorId, categoria, nombre, descripcion, precio,
        variables, activo, estadosAplicables, rutas,
        fechaInicio, fechaVencimiento, accionVencimiento, diasPreaviso, ultimaRenovacion: fechaInicio,
        tiposDispositivoIds, marcasIds,
      });
      setTimeout(() => {
        const svs = store.servicios.filter((s) => s.proveedorId === proveedorId && s.nombre === nombre);
        const created = svs[svs.length - 1];
        if (created) {
          unidadesAsignadas.forEach((uid) => {
            store.asignarUnidad({
              servicioId: created.id, unidadId: uid,
              rol: rolesUnidad[uid] ?? "Principal",
              fechaAsignacion: new Date().toISOString().split("T")[0],
            });
          });
        }
      }, 50);
    }
    onClose();
  }

  function toggleUnidad(unidadId: string) {
    setUnidadesAsignadas((prev) =>
      prev.includes(unidadId) ? prev.filter((id) => id !== unidadId) : [...prev, unidadId]
    );
    if (!rolesUnidad[unidadId]) {
      setRolesUnidad((prev) => ({ ...prev, [unidadId]: "Principal" }));
    }
  }

  function setRolUnidad(unidadId: string, rol: "Principal" | "Secundario" | "Backup") {
    setRolesUnidad((prev) => ({ ...prev, [unidadId]: rol }));
  }

  const isTraslado = categoria === "Traslado";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editId ? "Editar Servicio" : "Nuevo Servicio"}
      size="lg"
      actions={
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
          <Button size="sm" onClick={handleSave} disabled={!nombre || !proveedorId || !categoria}>
            {editId ? "Guardar" : "Crear"}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* ── Datos básicos ── */}
        <div className="grid grid-cols-2 gap-4">
          <Select label="Proveedor *" options={store.proveedores.filter((p) => p.activo).map((p) => ({ value: p.id, label: p.nombre }))} value={proveedorId} onChange={(v) => setProveedorId(v)} />
          <Select label="Categoría *" options={categoriasDisponibles.map((c) => ({ value: c, label: c }))} value={categoria} onChange={(v) => { setCategoria(v); setValoresSimulacion({}); }} placeholder="Seleccionar categoría" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Nombre del Servicio *" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Transporte de Valores CCS-Centro" />
          <Input label="Código" value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="SRV-XXX-001" disabled={!editId} />
        </div>
        <Textarea label="Descripción" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Descripción del servicio" />

        {/* ── Vigencia ── */}
        <div className="border border-[var(--color-neutro-200)] rounded-corner-m p-4 space-y-3">
          <span className="text-[13px] font-semibold text-[var(--color-neutro-700)]">Vigencia</span>
          <div className="grid grid-cols-4 gap-3">
            <Input label="Inicio" type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
            <Input label="Vencimiento" type="date" value={fechaVencimiento} onChange={(e) => setFechaVencimiento(e.target.value)} />
            <Select label="Acción al vencer" options={[{ value: "Renovar", label: "Renovar" }, { value: "Cancelar", label: "Cancelar" }]} value={accionVencimiento} onChange={(v) => setAccionVencimiento(v as "Renovar" | "Cancelar")} />
            <Input label="Preaviso (días)" type="number" min={1} value={diasPreaviso} onChange={(e) => setDiasPreaviso(parseInt(e.target.value) || 30)} />
          </div>
        </div>

        {/* ── Rutas (solo Traslado) ── */}
        {isTraslado && (
          <div className="border border-[var(--color-neutro-200)] rounded-corner-m p-4 space-y-3">
            <span className="text-[13px] font-semibold text-[var(--color-neutro-700)]">Rutas ({rutas.length})</span>
            <div className="flex items-end gap-2">
              <Select
                placeholder="Origen"
                options={TIPOS_RUTA.map((t) => ({ value: t, label: t }))}
                value={rutaOrigen}
                onChange={setRutaOrigen}
              />
              <span className="text-[13px] text-[var(--color-neutro-400)] pb-2">→</span>
              <Select
                placeholder="Destino"
                options={TIPOS_RUTA.map((t) => ({ value: t, label: t }))}
                value={rutaDestino}
                onChange={setRutaDestino}
              />
              <Button
                size="sm"
                disabled={!rutaOrigen || !rutaDestino}
                onClick={() => {
                  const ruta = `${rutaOrigen} → ${rutaDestino}`;
                  const vice  = `${rutaDestino} → ${rutaOrigen}`;
                  if (!rutas.includes(ruta)) setRutas((prev) => [...prev, ruta]);
                  setRutaSugerida(rutaOrigen !== rutaDestino && !rutas.includes(vice) ? vice : "");
                  setRutaOrigen("");
                  setRutaDestino("");
                }}
              >Agregar</Button>
            </div>
            {rutaSugerida && (
              <div className="flex items-center gap-2 text-[12px] text-[var(--color-neutro-500)] bg-[var(--color-neutro-50)] px-3 py-2 rounded-corner-m">
                <span>¿Agregar también <strong>{rutaSugerida}</strong>?</span>
                <Button size="sm" variant="outline" onClick={() => { setRutas((prev) => [...prev, rutaSugerida]); setRutaSugerida(""); }}>Sí, agregar</Button>
                <button type="button" className="text-[11px] text-[var(--color-neutro-400)] hover:text-[var(--color-neutro-600)]" onClick={() => setRutaSugerida("")}>No</button>
              </div>
            )}
            {rutas.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {rutas.map((r) => (
                  <span key={r} className="inline-flex items-center gap-1 text-[11px] font-medium bg-[var(--color-verde-100)] text-white px-2.5 py-1 rounded-corner-m">
                    {r}
                    <button type="button" onClick={() => setRutas((prev) => prev.filter((x) => x !== r))} className="hover:text-white/70 p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Dispositivos que cubre (solo Proveedor de Dispositivos) ── */}
        {categoria === "Proveedor de Dispositivos" && (
          <div className="border border-[var(--color-neutro-200)] rounded-corner-m p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[var(--color-neutro-500)]" />
              <span className="text-[13px] font-semibold text-[var(--color-neutro-700)]">Dispositivos que cubre este servicio</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-[var(--color-neutro-700)] mb-1">Tipos de Dispositivo</label>
                <div className="flex flex-wrap gap-1.5">
                  {dispStore.tiposDispositivo.filter((t) => t.activo).map((t) => {
                    const active = tiposDispositivoIds.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        className={`px-2.5 py-1 rounded-corner-m text-[12px] font-medium border transition-colors ${
                          active
                            ? "bg-amber-100 text-amber-700 border-amber-200"
                            : "bg-white text-[var(--color-neutro-600)] border-[var(--color-neutro-200)] hover:bg-[var(--color-neutro-100)]"
                        }`}
                        onClick={() =>
                          setTiposDispositivoIds((prev) =>
                            active ? prev.filter((id) => id !== t.id) : [...prev, t.id]
                          )
                        }
                      >
                        {t.nombre}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[var(--color-neutro-700)] mb-1">Marcas</label>
                <div className="flex flex-wrap gap-1.5">
                  {dispStore.marcas.filter((m) => m.activo).map((m) => {
                    const active = marcasIds.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        className={`px-2.5 py-1 rounded-corner-m text-[12px] font-medium border transition-colors ${
                          active
                            ? "bg-indigo-100 text-indigo-700 border-indigo-200"
                            : "bg-white text-[var(--color-neutro-600)] border-[var(--color-neutro-200)] hover:bg-[var(--color-neutro-100)]"
                        }`}
                        onClick={() =>
                          setMarcasIds((prev) =>
                            active ? prev.filter((id) => id !== m.id) : [...prev, m.id]
                          )
                        }
                      >
                        {m.nombre}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Variables Tarifarias ── */}
        {categoria && (
          <div className="border border-[var(--color-neutro-200)] rounded-corner-m p-4 space-y-3">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[var(--color-verde-100)]" />
              <span className="text-[13px] font-semibold text-[var(--color-neutro-700)]">Variables Tarifarias</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {variablesDefecto.map((v) => (
                <VariableInput
                  key={v.nombre}
                  variable={v}
                  value={valoresSimulacion[v.nombre] ?? (typeof v.valorDefecto === "number" ? v.valorDefecto : 0)}
                  onChange={(val) => setValoresSimulacion((prev) => ({ ...prev, [v.nombre]: val }))}
                />
              ))}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-[var(--color-neutro-200)]">
              <span className="text-[13px] text-[var(--color-neutro-500)]">Precio Estimado:</span>
              <span className="text-[16px] font-bold text-[var(--color-verde-100)]">${precioEstimado.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* ── Asignación de Unidades (solo Traslado) ── */}
        {isTraslado && (
          <div className="border border-[var(--color-neutro-200)] rounded-corner-m p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[var(--color-neutro-500)]" />
              <span className="text-[13px] font-semibold text-[var(--color-neutro-700)]">Unidades Asignadas</span>
            </div>
            {unidadesDelProveedor.length === 0 ? (
              <p className="text-[13px] text-[var(--color-neutro-400)]">No hay unidades registradas para este proveedor</p>
            ) : (
              <div className="space-y-2">
                {unidadesDelProveedor.map((u) => {
                  const asignada = unidadesAsignadas.includes(u.id);
                  return (
                    <div key={u.id} className={`flex items-center gap-3 p-2 rounded-corner-m border transition-colors ${asignada ? "border-[var(--color-verde-100)] bg-[var(--color-verde-100)]/5" : "border-[var(--color-neutro-200)]"}`}>
                      <Checkbox
                        label=""
                        checked={asignada}
                        onChange={() => toggleUnidad(u.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-[var(--color-neutro-900)]">{u.placa}</p>
                        <p className="text-[11px] text-[var(--color-neutro-500)]">{u.marcaModelo} · {u.capacidadKg}kg · {u.nivelSeguridad}</p>
                      </div>
                      {asignada && (
                        <Select
                          options={[
                            { value: "Principal", label: "Principal" },
                            { value: "Secundario", label: "Secundario" },
                            { value: "Backup", label: "Backup" },
                          ]}
                          value={rolesUnidad[u.id] ?? "Principal"}
                          onChange={(v) => setRolUnidad(u.id, v as "Principal" | "Secundario" | "Backup")}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input label="Precio Base ($)" type="number" step={0.01} min={0} value={precio} onChange={(e) => setPrecio(parseFloat(e.target.value) || 0)} />
          <div className="flex items-end pb-1">
            <Checkbox label="Activo" checked={activo} onChange={(v) => setActivo(v)} />
          </div>
        </div>
      </div>
    </Modal>
  );
}

function VariableInput({ variable, value, onChange }: { variable: Omit<VariableTarifaria, "id" | "servicioId">; value: number; onChange: (val: number) => void }) {
  if (variable.tipo === "select") {
    return (
      <Select
        label={`${variable.etiqueta}${variable.requerida ? " *" : ""}`}
        options={(variable.opciones ?? []).map((o) => ({ value: o, label: o }))}
        value={String(variable.valorDefecto)}
        onChange={(v) => onChange((variable.opciones ?? []).indexOf(v) + 1)}
      />
    );
  }
  return (
    <Input
      label={`${variable.etiqueta}${variable.requerida ? " *" : ""}`}
      type="number"
      step={0.01}
      min={0}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
    />
  );
}

/* ── Servicio Detail Modal ── */
function ServicioDetailModal({ servicioId, onClose }: { servicioId: string | null; onClose: () => void }) {
  const store = useProveedoresStore();
  const dispStore = useDispositivosStore();
  const sv = servicioId ? store.servicios.find((s) => s.id === servicioId) : null;
  const prov = sv ? store.getProveedorById(sv.proveedorId) : null;
  const asigns = sv ? store.getUnidadesByServicio(sv.id) : [];

  const [valores, setValores] = useState<Record<string, number>>({});

  useEffect(() => {
    if (sv) {
      const vals: Record<string, number> = {};
      sv.variables.forEach((v) => {
        vals[v.nombre] = typeof v.valorDefecto === "number" ? v.valorDefecto : 0;
      });
      setValores(vals);
    }
  }, [sv]);

  const precioEstimado = useMemo(() => {
    if (!sv) return 0;
    return calcularPrecio(sv, valores);
  }, [sv, valores]);

  return (
    <Modal open={!!servicioId} onClose={onClose} title={sv?.nombre ?? ""} size="lg">
      <div className="space-y-5">
        {sv && (
          <>
            {/* Header info */}
            <div className="flex items-center gap-3">
              <span className={`text-[12px] font-semibold px-2.5 py-1 rounded-corner-m ${CATEGORIA_COLORS[sv.categoria] ?? "bg-gray-100 text-gray-600"}`}>
                {sv.categoria}
              </span>
              <span className={`text-[12px] font-semibold px-2.5 py-1 rounded-corner-m ${sv.activo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {sv.activo ? "Activo" : "Inactivo"}
              </span>
              <span className="ml-auto text-[18px] font-bold text-[var(--color-verde-100)]">${sv.precio.toFixed(2)}</span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-[11px] text-[var(--color-neutro-400)] font-semibold uppercase">Proveedor</p>
                <p className="text-[13px] text-[var(--color-neutro-900)]">{prov?.nombre ?? "—"}</p>
              </div>
              <div>
                <p className="text-[11px] text-[var(--color-neutro-400)] font-semibold uppercase">Código Servicio</p>
                <p className="text-[13px] font-mono text-[var(--color-neutro-900)]">{sv.codigo}</p>
              </div>
              <div>
                <p className="text-[11px] text-[var(--color-neutro-400)] font-semibold uppercase">Código Proveedor</p>
                <p className="text-[13px] font-mono text-[var(--color-neutro-900)]">{prov?.codigo ?? "—"}</p>
              </div>
            </div>

            <div>
              <p className="text-[11px] text-[var(--color-neutro-400)] font-semibold uppercase">Descripción</p>
              <p className="text-[13px] text-[var(--color-neutro-600)]">{sv.descripcion}</p>
            </div>

            {/* Vigencia */}
            <div className="border border-[var(--color-neutro-200)] rounded-corner-m p-3">
              <p className="text-[11px] text-[var(--color-neutro-400)] font-semibold uppercase mb-2">Vigencia</p>
              <div className="grid grid-cols-5 gap-3 text-[13px]">
                <div>
                  <p className="text-[var(--color-neutro-400)] text-[11px]">Inicio</p>
                  <p className="text-[var(--color-neutro-900)]">{sv.fechaInicio}</p>
                </div>
                <div>
                  <p className="text-[var(--color-neutro-400)] text-[11px]">Vencimiento</p>
                  <p className="text-[var(--color-neutro-900)]">{sv.fechaVencimiento}</p>
                </div>
                <div>
                  <p className="text-[var(--color-neutro-400)] text-[11px]">Acción</p>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-corner-m ${sv.accionVencimiento === "Renovar" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"}`}>
                    {sv.accionVencimiento}
                  </span>
                </div>
                <div>
                  <p className="text-[var(--color-neutro-400)] text-[11px]">Preaviso</p>
                  <p className="text-[var(--color-neutro-900)]">{sv.diasPreaviso} días</p>
                </div>
                <div>
                  <p className="text-[var(--color-neutro-400)] text-[11px]">Última Renovación</p>
                  <p className="text-[var(--color-neutro-900)]">{sv.ultimaRenovacion}</p>
                </div>
              </div>
            </div>

            {/* Estados Aplicables */}
            {sv.estadosAplicables && sv.estadosAplicables.length > 0 && (
              <div>
                <p className="text-[11px] text-[var(--color-neutro-400)] font-semibold uppercase mb-2">Aplica en Estados de Operación</p>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    const procesoStore = useTransaccionesStore();
                    const allSteps: { id: string; nombre: string; proceso: string }[] = [];
                    for (const proc of procesoStore.procesosFinalizados) {
                      for (const st of proc.steps) {
                        allSteps.push({ id: st.id, nombre: st.nombre, proceso: proc.nombre });
                      }
                    }
                    const grouped: Record<string, string[]> = {};
                    for (const es of sv.estadosAplicables ?? []) {
                      const found = allSteps.find((s) => s.id === es);
                      if (found) {
                        if (!grouped[found.proceso]) grouped[found.proceso] = [];
                        grouped[found.proceso].push(found.nombre);
                      }
                    }
                    return Object.entries(grouped).map(([proceso, nombres]) => (
                      <div key={proceso} className="w-full mb-1">
                        <span className="text-[10px] font-semibold text-[var(--color-neutro-400)]">{proceso}: </span>
                        {nombres.map((n) => (
                          <span key={n} className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-corner-m bg-[var(--color-verde-100)]/10 text-[var(--color-verde-100)] mr-1">{n}</span>
                        ))}
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}

            {/* Rutas */}
            {sv.rutas?.length > 0 && (
              <div>
                <p className="text-[11px] text-[var(--color-neutro-400)] font-semibold uppercase mb-2">Rutas (origen → destino)</p>
                <div className="flex flex-wrap gap-1.5">
                  {sv.rutas.map((r) => (
                    <span key={r} className="text-[10px] font-medium px-2 py-0.5 rounded-corner-m bg-[var(--color-verde-100)]/10 text-[var(--color-verde-100)]">{r}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Dispositivos relacionados */}
            {sv.tiposDispositivoIds && sv.tiposDispositivoIds.length > 0 && (
              <div>
                <p className="text-[11px] text-[var(--color-neutro-400)] font-semibold uppercase mb-2">Dispositivos que cubre</p>
                <div className="flex flex-wrap gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    {sv.tiposDispositivoIds.map((tid) => {
                      const t = dispStore.tiposDispositivo.find((x) => x.id === tid);
                      return t ? (
                        <span key={tid} className="text-[11px] font-semibold px-2 py-0.5 rounded-corner-m bg-amber-100 text-amber-700">{t.nombre}</span>
                      ) : null;
                    })}
                    {sv.marcasIds?.map((mid) => {
                      const m = dispStore.marcas.find((x) => x.id === mid);
                      return m ? (
                        <span key={mid} className="text-[11px] font-semibold px-2 py-0.5 rounded-corner-m bg-indigo-100 text-indigo-700">{m.nombre}</span>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Tariff Variables */}
            <div>
              <p className="text-[11px] text-[var(--color-neutro-400)] font-semibold uppercase mb-2">Variables Tarifarias</p>
              <div className="border border-[var(--color-neutro-200)] rounded-corner-m divide-y divide-[var(--color-neutro-100)]">
                {sv.variables.map((v) => (
                  <div key={v.id} className="flex items-center gap-4 px-3 py-2">
                    <div className="flex-1">
                      <p className="text-[12px] font-medium text-[var(--color-neutro-700)]">{v.etiqueta}</p>
                      <p className="text-[10px] text-[var(--color-neutro-400)]">Factor: {v.factorCalculo} · {v.requerida ? "Requerida" : "Opcional"}</p>
                    </div>
                    <div className="w-32">
                      {v.tipo === "select" ? (
                        <Select
                          options={(v.opciones ?? []).map((o) => ({ value: o, label: o }))}
                          value={typeof v.valorDefecto === "string" ? v.valorDefecto : String(v.valorDefecto)}
                          onChange={(val) => setValores((prev) => ({ ...prev, [v.nombre]: (v.opciones ?? []).indexOf(val) + 1 }))}
                        />
                      ) : (
                        <Input
                          type="number"
                          step={0.01}
                          min={0}
                          value={valores[v.nombre] ?? 0}
                          onChange={(e) => setValores((prev) => ({ ...prev, [v.nombre]: parseFloat(e.target.value) || 0 }))}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-end gap-2 mt-2 text-[13px]">
                <span className="text-[var(--color-neutro-500)]">Precio estimado:</span>
                <span className="font-bold text-[var(--color-verde-100)] text-[15px]">${precioEstimado.toFixed(2)}</span>
              </div>
            </div>

            {/* Assigned Units */}
            {asigns.length > 0 && (
              <div>
                <p className="text-[11px] text-[var(--color-neutro-400)] font-semibold uppercase mb-2">Unidades Asignadas</p>
                <div className="space-y-2">
                  {asigns.map((a) => {
                    const u = store.unidades.find((un) => un.id === a.unidadId);
                    if (!u) return null;
                    return (
                      <div key={a.id} className="flex items-center gap-3 border border-[var(--color-neutro-200)] rounded-corner-m p-2.5">
                        <Truck className="w-4 h-4 text-[var(--color-neutro-400)]" />
                        <div className="flex-1">
                          <p className="text-[13px] font-medium text-[var(--color-neutro-900)]">{u.placa}</p>
                          <p className="text-[11px] text-[var(--color-neutro-500)]">{u.marcaModelo} · {u.capacidadKg}kg</p>
                        </div>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-corner-m ${a.rol === "Principal" ? "bg-blue-100 text-blue-700" : a.rol === "Secundario" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>
                          {a.rol}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {sv.formula && (
              <div>
                <p className="text-[11px] text-[var(--color-neutro-400)] font-semibold uppercase">Fórmula personalizada</p>
                <p className="text-[13px] font-mono text-[var(--color-neutro-700)]">{sv.formula}</p>
              </div>
            )}
          </>
        )}
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

/* ── Sucursal Form ── */
function SucursalFormModal({ open, onClose, editId }: { open: boolean; onClose: () => void; editId: string | null }) {
  const store = useProveedoresStore();
  const existing = editId ? store.sucursales.find((s) => s.id === editId) : null;

  const [form, setForm] = useState({ proveedorId: store.proveedores[0]?.id ?? "", codigo: "", nombre: "", direccion: "", contacto: "", telefono: "", activo: true });

  useEffect(() => {
    if (existing) setForm({ proveedorId: existing.proveedorId, codigo: existing.codigo, nombre: existing.nombre, direccion: existing.direccion, contacto: existing.contacto, telefono: existing.telefono, activo: existing.activo });
    else setForm({ proveedorId: store.proveedores[0]?.id ?? "", codigo: "", nombre: "", direccion: "", contacto: "", telefono: "", activo: true });
  }, [existing]);

  function handleSave() {
    if (!form.nombre || !form.proveedorId) return;
    if (editId) store.updateSucursal(editId, form);
    else store.addSucursal(form);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={editId ? "Editar Sucursal" : "Nueva Sucursal"} size="md"
      actions={<div className="flex items-center gap-2"><Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button><Button size="sm" onClick={handleSave} disabled={!form.nombre || !form.proveedorId}>{editId ? "Guardar" : "Crear"}</Button></div>}
    >
      <div className="space-y-4">
        <Select label="Proveedor *" options={store.proveedores.filter((p) => p.activo).map((p) => ({ value: p.id, label: p.nombre }))} value={form.proveedorId} onChange={(v) => setForm({ ...form, proveedorId: v })} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Nombre *" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre de la sucursal" />
          <Input label="Código" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} placeholder="SC-001" />
        </div>
        <Input label="Dirección" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} placeholder="Dirección física" />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Contacto" value={form.contacto} onChange={(e) => setForm({ ...form, contacto: e.target.value })} placeholder="Nombre del contacto" />
          <Input label="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} placeholder="+58 XXX XXX XXXX" />
        </div>
        <Checkbox label="Activo" checked={form.activo} onChange={(v) => setForm({ ...form, activo: v })} />
      </div>
    </Modal>
  );
}

/* ── Unidad de Transporte Form ── */
function UnidadFormModal({ open, onClose, editId }: { open: boolean; onClose: () => void; editId: string | null }) {
  const store = useProveedoresStore();
  const existing = editId ? store.unidades.find((u) => u.id === editId) : null;

  const [form, setForm] = useState({ proveedorId: store.proveedores[0]?.id ?? "", placa: "", marcaModelo: "", capacidadKg: 0, nivelSeguridad: "Estándar", activo: true });

  useEffect(() => {
    if (existing) setForm({ proveedorId: existing.proveedorId, placa: existing.placa, marcaModelo: existing.marcaModelo, capacidadKg: existing.capacidadKg, nivelSeguridad: existing.nivelSeguridad, activo: existing.activo });
    else setForm({ proveedorId: store.proveedores[0]?.id ?? "", placa: "", marcaModelo: "", capacidadKg: 0, nivelSeguridad: "Estándar", activo: true });
  }, [existing]);

  function handleSave() {
    if (!form.placa || !form.proveedorId) return;
    if (editId) store.updateUnidad(editId, form);
    else store.addUnidad(form);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={editId ? "Editar Unidad" : "Nueva Unidad"} size="md"
      actions={<div className="flex items-center gap-2"><Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button><Button size="sm" onClick={handleSave} disabled={!form.placa || !form.proveedorId}>{editId ? "Guardar" : "Crear"}</Button></div>}
    >
      <div className="space-y-4">
        <Select label="Proveedor *" options={store.proveedores.filter((p) => p.activo).map((p) => ({ value: p.id, label: p.nombre }))} value={form.proveedorId} onChange={(v) => setForm({ ...form, proveedorId: v })} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Placa *" value={form.placa} onChange={(e) => setForm({ ...form, placa: e.target.value })} placeholder="ABC-123" />
          <Input label="Modelo" value={form.marcaModelo} onChange={(e) => setForm({ ...form, marcaModelo: e.target.value })} placeholder="Ford F-350 Blindado" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Capacidad (kg)" type="number" min={0} value={form.capacidadKg} onChange={(e) => setForm({ ...form, capacidadKg: parseInt(e.target.value) || 0 })} />
          <Select label="Nivel de Seguridad" options={[{ value: "Estándar", label: "Estándar" }, { value: "Blindado", label: "Blindado" }, { value: "Máxima Seguridad", label: "Máxima Seguridad" }]} value={form.nivelSeguridad} onChange={(v) => setForm({ ...form, nivelSeguridad: v })} />
        </div>
        <Checkbox label="Activo" checked={form.activo} onChange={(v) => setForm({ ...form, activo: v })} />
      </div>
    </Modal>
  );
}

/* ── Depósito Form ── */
function DepositoFormModal({ open, onClose, editId }: { open: boolean; onClose: () => void; editId: string | null }) {
  const store = useProveedoresStore();
  const existing = editId ? store.depositos.find((d) => d.id === editId) : null;

  const TIPOS_DEPOSITO = ["Bóveda", "Almacén", "Caja Fuerte", "Cuarto Frío", "Rack", "Silo", "Contenedor"];

  const [form, setForm] = useState({ proveedorId: store.proveedores[0]?.id ?? "", codigo: "", nombre: "", tipo: "Bóveda", direccion: "", capacidad: 0, activo: true });

  useEffect(() => {
    if (existing) setForm({ proveedorId: existing.proveedorId, codigo: existing.codigo, nombre: existing.nombre, tipo: existing.tipo, direccion: existing.direccion, capacidad: existing.capacidad, activo: existing.activo });
    else setForm({ proveedorId: store.proveedores[0]?.id ?? "", codigo: "", nombre: "", tipo: "Bóveda", direccion: "", capacidad: 0, activo: true });
  }, [existing]);

  function handleSave() {
    if (!form.nombre || !form.proveedorId) return;
    if (editId) store.updateDeposito(editId, form);
    else store.addDeposito(form);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={editId ? "Editar Depósito" : "Nuevo Depósito"} size="md"
      actions={<div className="flex items-center gap-2"><Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button><Button size="sm" onClick={handleSave} disabled={!form.nombre || !form.proveedorId}>{editId ? "Guardar" : "Crear"}</Button></div>}
    >
      <div className="space-y-4">
        <Select label="Proveedor *" options={store.proveedores.filter((p) => p.activo).map((p) => ({ value: p.id, label: p.nombre }))} value={form.proveedorId} onChange={(v) => setForm({ ...form, proveedorId: v })} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Nombre *" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre del depósito" />
          <Input label="Código" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} placeholder="DEP-001" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select label="Tipo" options={TIPOS_DEPOSITO.map((t) => ({ value: t, label: t }))} value={form.tipo} onChange={(v) => setForm({ ...form, tipo: v })} />
          <Input label="Capacidad (unidades)" type="number" min={0} value={form.capacidad} onChange={(e) => setForm({ ...form, capacidad: parseInt(e.target.value) || 0 })} />
        </div>
          <Input label="Dirección" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} placeholder="Dirección del depósito" />
        <Checkbox label="Activo" checked={form.activo} onChange={(v) => setForm({ ...form, activo: v })} />
      </div>
    </Modal>
  );
}

/* ── Centro de Acopio Form ── */
function CentroAcopioFormModal({ open, onClose, editId }: { open: boolean; onClose: () => void; editId: string | null }) {
  const store = useProveedoresStore();
  const existing = editId ? store.centrosAcopio.find((c) => c.id === editId) : null;

  const TIPOS_CA = ["Centro de Acopio", "Punto de Recolección", "Base Operativa"];

  const [form, setForm] = useState({ proveedorId: store.proveedores[0]?.id ?? "", codigo: "", nombre: "", tipo: "Centro de Acopio", direccion: "", latitud: 0, longitud: 0, capacidad: 0, activo: true });

  useEffect(() => {
    if (existing) setForm({ proveedorId: existing.proveedorId, codigo: existing.codigo, nombre: existing.nombre, tipo: existing.tipo, direccion: existing.direccion, latitud: existing.latitud, longitud: existing.longitud, capacidad: existing.capacidad, activo: existing.activo });
    else setForm({ proveedorId: store.proveedores[0]?.id ?? "", codigo: "", nombre: "", tipo: "Centro de Acopio", direccion: "", latitud: 0, longitud: 0, capacidad: 0, activo: true });
  }, [existing]);

  function handleSave() {
    if (!form.nombre || !form.proveedorId) return;
    if (editId) store.updateCentroAcopio(editId, form);
    else store.addCentroAcopio(form);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={editId ? "Editar Centro de Acopio" : "Nuevo Centro de Acopio"} size="md"
      actions={<div className="flex items-center gap-2"><Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button><Button size="sm" onClick={handleSave} disabled={!form.nombre || !form.proveedorId}>{editId ? "Guardar" : "Crear"}</Button></div>}
    >
      <div className="space-y-4">
        <Select label="Proveedor *" options={store.proveedores.filter((p) => p.activo).map((p) => ({ value: p.id, label: p.nombre }))} value={form.proveedorId} onChange={(v) => setForm({ ...form, proveedorId: v })} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Nombre *" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre del centro de acopio" />
          <Input label="Código" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} placeholder="CA-001" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select label="Tipo" options={TIPOS_CA.map((t) => ({ value: t, label: t }))} value={form.tipo} onChange={(v) => setForm({ ...form, tipo: v })} />
          <Input label="Capacidad (unidades)" type="number" min={0} value={form.capacidad} onChange={(e) => setForm({ ...form, capacidad: parseInt(e.target.value) || 0 })} />
        </div>
        <Input label="Dirección" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} placeholder="Dirección del centro de acopio" />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Latitud" type="number" step={0.0001} value={form.latitud} onChange={(e) => setForm({ ...form, latitud: parseFloat(e.target.value) || 0 })} />
          <Input label="Longitud" type="number" step={0.0001} value={form.longitud} onChange={(e) => setForm({ ...form, longitud: parseFloat(e.target.value) || 0 })} />
        </div>
        <Checkbox label="Activo" checked={form.activo} onChange={(v) => setForm({ ...form, activo: v })} />
      </div>
    </Modal>
  );
}

/* ── Personal de Transportista Form ── */
function PersonalFormModal({ open, onClose, editId }: { open: boolean; onClose: () => void; editId: string | null }) {
  const store = useProveedoresStore();
  const existing = editId ? store.personalTransportista.find((p) => p.id === editId) : null;

  const CARGOS = ["Conductor", "Custodio", "Supervisor", "Escolta"];
  const TIPOS_LICENCIA = ["Tipo A", "Tipo B", "Tipo C", "Tipo D", "Tipo E"];

  const [form, setForm] = useState({
    proveedorId: store.proveedores[0]?.id ?? "", codigo: "", nombre: "", cedula: "", telefono: "", cargo: "Conductor",
    foto: "", carnet: "", codigoValidacion: "", licencia: "", tipoLicencia: "Tipo D",
    fechaVencimientoLicencia: "", fechaIngreso: new Date().toISOString().split("T")[0],
    validadoBanco: false, activo: true,
  });

  useEffect(() => {
    if (existing) setForm({
      proveedorId: existing.proveedorId, codigo: existing.codigo, nombre: existing.nombre, cedula: existing.cedula,
      telefono: existing.telefono, cargo: existing.cargo, foto: existing.foto, carnet: existing.carnet,
      codigoValidacion: existing.codigoValidacion, licencia: existing.licencia, tipoLicencia: existing.tipoLicencia,
      fechaVencimientoLicencia: existing.fechaVencimientoLicencia, fechaIngreso: existing.fechaIngreso,
      validadoBanco: existing.validadoBanco, activo: existing.activo,
    });
    else setForm({
      proveedorId: store.proveedores[0]?.id ?? "", codigo: "", nombre: "", cedula: "", telefono: "", cargo: "Conductor",
      foto: "", carnet: "", codigoValidacion: "", licencia: "", tipoLicencia: "Tipo D",
      fechaVencimientoLicencia: "", fechaIngreso: new Date().toISOString().split("T")[0],
      validadoBanco: false, activo: true,
    });
  }, [existing]);

  function handleSave() {
    if (!form.nombre || !form.proveedorId || !form.cedula) return;
    if (editId) store.updatePersonal(editId, form);
    else store.addPersonal(form);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={editId ? "Editar Personal" : "Nuevo Personal"} size="lg"
      actions={<div className="flex items-center gap-2"><Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button><Button size="sm" onClick={handleSave} disabled={!form.nombre || !form.proveedorId || !form.cedula}>{editId ? "Guardar" : "Crear"}</Button></div>}
    >
      <div className="space-y-4">
        <Select label="Proveedor *" options={store.proveedores.filter((p) => p.activo).map((p) => ({ value: p.id, label: p.nombre }))} value={form.proveedorId} onChange={(v) => setForm({ ...form, proveedorId: v })} />
        <div className="grid grid-cols-3 gap-4">
          <Input label="Nombre *" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre completo" />
          <Input label="Cédula *" value={form.cedula} onChange={(e) => setForm({ ...form, cedula: e.target.value })} placeholder="V-XX.XXX.XXX" />
          <Input label="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} placeholder="+58 XXX XXX XXXX" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Input label="Código Interno" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} placeholder="EMP-001" />
          <Select label="Cargo" options={CARGOS.map((c) => ({ value: c, label: c }))} value={form.cargo} onChange={(v) => setForm({ ...form, cargo: v })} />
          <Input label="Código de Validación" value={form.codigoValidacion} onChange={(e) => setForm({ ...form, codigoValidacion: e.target.value })} placeholder="VLD-XXXX-XXXX" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Foto (URL)" value={form.foto} onChange={(e) => setForm({ ...form, foto: e.target.value })} placeholder="URL de la foto" />
          <Input label="Carnet (URL)" value={form.carnet} onChange={(e) => setForm({ ...form, carnet: e.target.value })} placeholder="URL del carnet" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          <Input label="Licencia" value={form.licencia} onChange={(e) => setForm({ ...form, licencia: e.target.value })} placeholder="N° licencia" />
          <Select label="Tipo Licencia" options={TIPOS_LICENCIA.map((t) => ({ value: t, label: t }))} value={form.tipoLicencia} onChange={(v) => setForm({ ...form, tipoLicencia: v })} />
          <Input label="Vencimiento Licencia" type="date" value={form.fechaVencimientoLicencia} onChange={(e) => setForm({ ...form, fechaVencimientoLicencia: e.target.value })} />
          <Input label="Fecha Ingreso" type="date" value={form.fechaIngreso} onChange={(e) => setForm({ ...form, fechaIngreso: e.target.value })} />
        </div>
        <div className="flex items-center gap-4">
          <Checkbox label="Validado en Banco" checked={form.validadoBanco} onChange={(v) => setForm({ ...form, validadoBanco: v })} />
          <Checkbox label="Activo" checked={form.activo} onChange={(v) => setForm({ ...form, activo: v })} />
        </div>
      </div>
    </Modal>
  );
}

/* ── Proveedor Detail Page (inline) ── */
function ProveedorDetailPage({
  proveedorId, onBack,
  onEditSucursal, onNewSucursal,
  onEditUnidad, onNewUnidad,
  onEditDeposito, onNewDeposito,
  onEditCentroAcopio, onNewCentroAcopio,
  onEditPersonal, onNewPersonal,
  onDelete,
}: {
  proveedorId: string;
  onBack: () => void;
  onEditSucursal: (id: string) => void;
  onNewSucursal: () => void;
  onEditUnidad: (id: string) => void;
  onNewUnidad: () => void;
  onEditDeposito: (id: string) => void;
  onNewDeposito: () => void;
  onEditCentroAcopio: (id: string) => void;
  onNewCentroAcopio: () => void;
  onEditPersonal: (id: string) => void;
  onNewPersonal: () => void;
  onDelete: (id: string, entity: string) => void;
}) {
  const store = useProveedoresStore();
  const p = store.proveedores.find((x) => x.id === proveedorId)!;
  const secciones = INFRA_SECCIONES_POR_TIPO[p.tipo] ?? { sucursales: true, unidades: false, depositos: false, centrosAcopio: false, personal: false, personalLabel: "" };

  const sucs = secciones.sucursales ? store.sucursales.filter((s) => s.proveedorId === proveedorId) : [];
  const unds = secciones.unidades ? store.unidades.filter((u) => u.proveedorId === proveedorId) : [];
  const deps = secciones.depositos ? store.depositos.filter((d) => d.proveedorId === proveedorId) : [];
  const cas = secciones.centrosAcopio ? store.centrosAcopio.filter((c) => c.proveedorId === proveedorId) : [];
  const pers = secciones.personal ? store.personalTransportista.filter((pp) => pp.proveedorId === proveedorId) : [];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--color-neutro-200)] bg-white shrink-0">
        <button onClick={onBack} className="p-1.5 hover:bg-[var(--color-neutro-100)] rounded-corner-m text-[var(--color-neutro-400)] transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-corner-m bg-[var(--color-verde-100)]/10 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-[var(--color-verde-100)]" />
          </div>
          <div>
            <h2 className="text-[16px] font-bold text-[var(--color-neutro-900)]">{p.nombre}</h2>
            <p className="text-[12px] text-[var(--color-neutro-400)]">{p.codigo} · {p.tipo}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-8">
        {/* ── Datos del Proveedor ── */}
        <div className="grid grid-cols-4 gap-4 p-4 bg-[var(--color-neutro-50)] rounded-corner-m">
          <div>
            <p className="text-[10px] font-semibold uppercase text-[var(--color-neutro-400)]">Contacto</p>
            <p className="text-[13px] text-[var(--color-neutro-900)]">{p.contacto}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase text-[var(--color-neutro-400)]">Teléfono</p>
            <p className="text-[13px] text-[var(--color-neutro-900)]">{p.telefono}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase text-[var(--color-neutro-400)]">Email</p>
            <p className="text-[13px] text-[var(--color-neutro-900)]">{p.email}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase text-[var(--color-neutro-400)]">Dirección</p>
            <p className="text-[13px] text-[var(--color-neutro-900)]">{p.direccion}</p>
          </div>
        </div>

        {/* ── Sucursales ── */}
        <SectionCard title="Sucursales" count={sucs.length} onNew={onNewSucursal} icon={<MapPin className="w-4 h-4" />}>
          {sucs.length === 0 ? <EmptySection /> : (
            <div className="grid grid-cols-3 gap-3">
              {sucs.map((sc) => (
                <InfraCard key={sc.id}
                  title={sc.nombre}
                  subtitle={sc.codigo}
                  onEdit={() => onEditSucursal(sc.id)}
                  onDelete={() => onDelete(sc.id, "sucursal")}
                >
                  <p className="text-[11px] text-[var(--color-neutro-500)]">{sc.direccion}</p>
                  <p className="text-[11px] text-[var(--color-neutro-500)]">{sc.contacto} · {sc.telefono}</p>
                </InfraCard>
              ))}
            </div>
          )}
        </SectionCard>

        {/* ── Unidades de Transporte ── */}
        <SectionCard title="Unidades de Transporte" count={unds.length} onNew={onNewUnidad} icon={<Truck className="w-4 h-4" />}>
          {unds.length === 0 ? <EmptySection /> : (
            <div className="grid grid-cols-3 gap-3">
              {unds.map((u) => (
                <InfraCard key={u.id}
                  title={u.placa}
                  subtitle={u.marcaModelo}
                  onEdit={() => onEditUnidad(u.id)}
                  onDelete={() => onDelete(u.id, "unidad")}
                >
                  <p className="text-[11px] text-[var(--color-neutro-500)]">{u.capacidadKg} kg · {u.nivelSeguridad}</p>
                </InfraCard>
              ))}
            </div>
          )}
        </SectionCard>

        {/* ── Depósitos ── */}
        {secciones.depositos && (
          <SectionCard title="Depósitos / Bóvedas" count={deps.length} onNew={onNewDeposito} icon={<Warehouse className="w-4 h-4" />}>
            {deps.length === 0 ? <EmptySection /> : (
              <div className="grid grid-cols-3 gap-3">
                {deps.map((d) => (
                  <InfraCard key={d.id}
                    title={d.nombre}
                    subtitle={d.codigo}
                    onEdit={() => onEditDeposito(d.id)}
                    onDelete={() => onDelete(d.id, "deposito")}
                  >
                    <p className="text-[11px] text-[var(--color-neutro-500)]">{d.tipo} · {d.direccion}</p>
                    <p className="text-[11px] text-[var(--color-neutro-500)]">Capacidad: {d.capacidad.toLocaleString()} unidades</p>
                  </InfraCard>
                ))}
              </div>
            )}
          </SectionCard>
        )}

        {/* ── Centros de Acopio ── */}
        {secciones.centrosAcopio && (
          <SectionCard title="Centros de Acopio" count={cas.length} onNew={onNewCentroAcopio} icon={<Map className="w-4 h-4" />}>
            {cas.length === 0 ? <EmptySection /> : (
              <div className="grid grid-cols-3 gap-3">
                {cas.map((c) => (
                  <InfraCard key={c.id}
                    title={c.nombre}
                    subtitle={c.codigo}
                    onEdit={() => onEditCentroAcopio(c.id)}
                    onDelete={() => onDelete(c.id, "centroAcopio")}
                  >
                    <p className="text-[11px] text-[var(--color-neutro-500)]">{c.tipo} · {c.direccion}</p>
                    <p className="text-[11px] text-[var(--color-neutro-500)]">Capacidad: {c.capacidad.toLocaleString()} unidades</p>
                    <p className="text-[11px] text-[var(--color-neutro-400)]">📍 {c.latitud}, {c.longitud}</p>
                  </InfraCard>
                ))}
              </div>
            )}
          </SectionCard>
        )}

        {/* ── Personal ── */}
        {secciones.personal && (
          <SectionCard title={secciones.personalLabel} count={pers.length} onNew={onNewPersonal} icon={<ShieldCheck className="w-4 h-4" />}>
            {pers.length === 0 ? <EmptySection /> : (
              <div className="grid grid-cols-3 gap-3">
                {pers.map((pp) => {
                  const licVencida = pp.fechaVencimientoLicencia && new Date(pp.fechaVencimientoLicencia) < new Date();
                  return (
                    <div key={pp.id} className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-[var(--color-verde-100)]/10 flex items-center justify-center overflow-hidden">
                            {pp.foto ? <img src={pp.foto} alt="" className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-[var(--color-verde-100)]" />}
                          </div>
                          <div>
                            <p className="text-[13px] font-semibold text-[var(--color-neutro-900)]">{pp.nombre}</p>
                            <p className="text-[10px] text-[var(--color-neutro-400)]">{pp.cedula} · {pp.cargo}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {pp.validadoBanco && <span className="text-green-500" title="Validado en banco"><ShieldCheck className="w-3 h-3" /></span>}
                          <button className="p-1 hover:bg-[var(--color-neutro-100)] rounded-corner-m text-[var(--color-neutro-400)]" onClick={() => onEditPersonal(pp.id)}><Pencil className="w-3 h-3" /></button>
                          <button className="p-1 hover:bg-red-50 rounded-corner-m text-red-400" onClick={() => onDelete(pp.id, "personal")}><Trash2 className="w-3 h-3" /></button>
                        </div>
                      </div>
                      <div className="text-[10px] text-[var(--color-neutro-500)] space-y-0.5">
                        <p>📋 {pp.codigo} · Cód. Validación: {pp.codigoValidacion}</p>
                        <p>🔑 {pp.licencia} ({pp.tipoLicencia}) {licVencida ? <span className="text-red-500 font-semibold">Vencida</span> : ""}</p>
                        {pp.carnet && <p>🪪 <a href={pp.carnet} target="_blank" rel="noopener noreferrer" className="text-[var(--color-verde-100)] underline">Ver carnet</a></p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        )}
      </div>
    </div>
  );
}

/* ── Helpers for ProveedorDetailModal ── */
function SectionCard({ title, count, onNew, icon, children }: { title: string; count: number; onNew: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[var(--color-neutro-500)]">{icon}</span>
          <h3 className="text-[14px] font-semibold text-[var(--color-neutro-700)]">{title}</h3>
          <span className="text-[11px] text-[var(--color-neutro-400)] bg-[var(--color-neutro-100)] px-2 py-0.5 rounded-corner-m">{count}</span>
        </div>
        <Button size="sm" iconLeft={<Plus className="w-4 h-4" />} onClick={onNew}>Nuevo</Button>
      </div>
      {children}
    </div>
  );
}

function EmptySection() {
  return <p className="text-[13px] text-[var(--color-neutro-400)]">No hay registros</p>;
}

function InfraCard({ title, subtitle, onEdit, onDelete, children }: { title: string; subtitle: string; onEdit: () => void; onDelete: () => void; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m p-3">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-[13px] font-semibold text-[var(--color-neutro-900)]">{title}</p>
          <p className="text-[11px] text-[var(--color-neutro-400)]">{subtitle}</p>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1 hover:bg-[var(--color-neutro-100)] rounded-corner-m text-[var(--color-neutro-400)]" onClick={onEdit}><Pencil className="w-3 h-3" /></button>
          <button className="p-1 hover:bg-red-50 rounded-corner-m text-red-400" onClick={onDelete}><Trash2 className="w-3 h-3" /></button>
        </div>
      </div>
      {children}
    </div>
  );
}
