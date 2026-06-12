import { useState, useMemo, useCallback } from "react";
import { Plus, Search, Globe, Calculator, ChevronRight, MapPin, Pencil, Trash2, X, Users, Package, Truck } from "lucide-react";
import { Button, Select, Input, Checkbox } from "@coe/design-system";
import { Modal } from "@components/ui/Modal";
import { useGruposStore, type Grupo } from "@stores/gruposStore";
import { useEntitiesStore } from "@stores/entitiesStore";
import { useClientesStore } from "@stores/clientesStore";
import { useProveedoresStore } from "@stores/proveedoresStore";
import { DeleteDialog } from "@components/shared/DeleteDialog";

const GEO_SUBTIPOS = ["Continente", "País", "Estado/Provincia", "Ciudad", "Zona", "Municipio"];

const MEMBER_ICONS: Record<string, typeof Package> = {
  unidades: Package,
  clientes: Users,
  proveedores: Truck,
};

const MEMBER_LABELS: Record<string, string> = {
  unidades: "Unidades",
  clientes: "Clientes",
  proveedores: "Proveedores",
};

/* ── TreeNode ── */
function GrupoTreeNode({ grupo, depth, query }: { grupo: Grupo; depth: number; query: string }) {
  const { selectedId, selectGrupo, expandedIds, toggleExpand, getChildren } = useGruposStore();
  const children = getChildren(grupo.id);
  const isSelected = selectedId === grupo.id;
  const isExpanded = expandedIds.has(grupo.id);
  const hasChildren = children.length > 0;

  const filteredChildren = useMemo(() => {
    if (!query.trim()) return children;
    const q = query.toLowerCase();
    const matchSet = new Set<string>();
    const collect = (g: Grupo) => {
      if (g.nombre.toLowerCase().includes(q) || g.codigo.toLowerCase().includes(q)) matchSet.add(g.id);
      getChildren(g.id).forEach(collect);
    };
    children.forEach(collect);
    return children.filter((c) => matchSet.has(c.id));
  }, [children, query, getChildren]);

  return (
    <div>
      <button
        className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded-corner-m text-left text-[13px] transition-colors ${
          isSelected
            ? "bg-[var(--color-verde-100)] text-white font-semibold"
            : "text-[var(--color-neutro-700)] hover:bg-[var(--color-neutro-100)]"
        }`}
        style={{ paddingLeft: `${12 + depth * 20}px` }}
        onClick={() => selectGrupo(grupo.id)}
      >
        <span
          className={`shrink-0 w-4 h-4 flex items-center justify-center transition-transform ${isExpanded ? "rotate-90" : ""}`}
          onClick={(e) => { e.stopPropagation(); if (hasChildren) toggleExpand(grupo.id); }}
        >
          {hasChildren ? <ChevronRight className="w-3.5 h-3.5" /> : <span className="w-3.5" />}
        </span>
        {grupo.tipo === "Geográfico" ? (
          <Globe className="w-4 h-4 shrink-0" style={{ color: isSelected ? "#fff" : "#22c55e" }} />
        ) : (
          <Calculator className="w-4 h-4 shrink-0" style={{ color: isSelected ? "#fff" : "#a855f7" }} />
        )}
        <span className="truncate">{grupo.nombre}</span>
        <span className="ml-auto text-[11px] opacity-60 shrink-0">{grupo.codigo}</span>
      </button>
      {hasChildren && isExpanded && (
        <div className="space-y-0.5">
          {filteredChildren.map((child) => (
            <GrupoTreeNode key={child.id} grupo={child} depth={depth + 1} query={query} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main Page ── */
export function Grupos() {
  const store = useGruposStore();
  const grupos = store.grupos;
  const selectedId = store.selectedId;
  const selectGrupo = store.selectGrupo;

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);

  const selectedGrupo = useMemo(() => grupos.find((g) => g.id === selectedId), [grupos, selectedId]);

  /* ── Filtered roots ── */
  const rootGrupos = useMemo(() => {
    if (!search.trim()) return grupos.filter((g) => g.padreId === null);
    const q = search.toLowerCase();
    const matched = new Set<string>();
    const walk = (g: Grupo) => {
      if (g.nombre.toLowerCase().includes(q) || g.codigo.toLowerCase().includes(q)) matched.add(g.id);
      store.getChildren(g.id).forEach(walk);
    };
    grupos.filter((g) => g.padreId === null).forEach(walk);
    return grupos.filter((g) => matched.has(g.id) && g.padreId === null);
  }, [grupos, search, store]);

  function handleDelete() {
    if (selectedId) store.removeGrupo(selectedId);
  }

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-[18px] font-bold text-[var(--color-neutro-900)]">Grupos</h1>
          <p className="text-[13px] text-[var(--color-neutro-500)]">
            Agrupación de unidades, clientes y proveedores para contabilidad y rutas
          </p>
        </div>
      </div>

      {/* Search + actions */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 max-w-md">
          <Input
            prefix={<Search className="w-4 h-4" />}
            placeholder="Buscar grupo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          size="sm"
          iconLeft={<Plus className="w-6 h-6" />}
          onClick={() => { setEditId(null); setParentId(null); setFormOpen(true); }}
        >
          Nuevo Grupo
        </Button>
      </div>

      {/* Two-panel layout */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Left: Tree */}
        <div className="w-[340px] shrink-0 bg-white border border-[var(--color-neutro-200)] rounded-corner-m overflow-y-auto">
          <div className="p-3 border-b border-[var(--color-neutro-200)]">
            <p className="text-[12px] font-semibold text-[var(--color-neutro-600)] uppercase tracking-wide">
              Grupos ({grupos.length})
            </p>
          </div>
          <div className="p-2">
            {rootGrupos.length === 0 ? (
              <p className="text-[13px] text-[var(--color-neutro-400)] p-3 text-center">
                {search ? "Sin resultados" : "No hay grupos. Cree el primer grupo."}
              </p>
            ) : rootGrupos.map((g) => (
              <GrupoTreeNode key={g.id} grupo={g} depth={0} query={search} />
            ))}
          </div>
        </div>

        {/* Right: Detail */}
        <div className="flex-1 overflow-y-auto">
          {selectedGrupo ? (
            <GrupoDetail
              grupo={selectedGrupo}
              onEdit={() => { setEditId(selectedGrupo.id); setParentId(null); setFormOpen(true); }}
              onAddChild={() => { setParentId(selectedGrupo.id); setEditId(null); setFormOpen(true); }}
              onDelete={() => setDeleteOpen(true)}
              onAddMember={() => setAddMemberOpen(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <p className="text-[13px] text-[var(--color-neutro-400)]">
                Seleccione un grupo del árbol para ver sus detalles
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      <GrupoFormModal
        open={formOpen}
        editId={editId}
        parentId={parentId}
        onClose={() => { setFormOpen(false); setEditId(null); setParentId(null); }}
      />

      {/* Add Member Modal */}
      <AddMemberModal
        open={addMemberOpen}
        grupoId={selectedId}
        onClose={() => setAddMemberOpen(false)}
      />

      {/* Delete Dialog */}
      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar Grupo"
        description="¿Está seguro de eliminar este grupo?"
        itemName={selectedGrupo?.nombre}
        onConfirm={handleDelete}
      />
    </div>
  );
}

/* ── Grupo Detail ── */
function GrupoDetail({ grupo, onEdit, onAddChild, onDelete, onAddMember }: {
  grupo: Grupo; onEdit: () => void; onAddChild: () => void; onDelete: () => void; onAddMember: () => void;
}) {
  const { getChildren, getAncestors, removeMiembro } = useGruposStore();
  const ancestors = getAncestors(grupo.id);
  const children = getChildren(grupo.id);
  const [memberTab, setMemberTab] = useState<"unidades" | "clientes" | "proveedores">("unidades");

  const miembrosFiltrados = grupo.miembros.filter((m) => m.source === memberTab);

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      {ancestors.length > 0 && (
        <div className="flex items-center gap-1 text-[12px] text-[var(--color-neutro-400)] flex-wrap">
          {ancestors.map((a) => (
            <span key={a.id} className="flex items-center gap-1">
              <span>{a.nombre}</span>
              <span>/</span>
            </span>
          ))}
          <span className="text-[var(--color-neutro-700)] font-medium">{grupo.nombre}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {grupo.tipo === "Geográfico" ? (
            <Globe className="w-6 h-6 text-green-500" />
          ) : (
            <Calculator className="w-6 h-6 text-purple-500" />
          )}
          <div>
            <h3 className="text-[16px] font-bold text-[var(--color-neutro-900)]">{grupo.nombre}</h3>
            <p className="text-[13px] text-[var(--color-neutro-500)]">{grupo.codigo}</p>
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
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <p className="text-[11px] text-[var(--color-neutro-500)] uppercase tracking-wide mb-0.5">Tipo</p>
          <span className={`text-[12px] font-semibold px-2 py-0.5 rounded-corner-m ${
            grupo.tipo === "Geográfico" ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"
          }`}>
            {grupo.tipo}
          </span>
        </div>
        <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <p className="text-[11px] text-[var(--color-neutro-500)] uppercase tracking-wide mb-0.5">Subtipo</p>
          <p className="text-[13px] font-semibold text-[var(--color-neutro-900)]">{grupo.subtipo}</p>
        </div>
        <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <p className="text-[11px] text-[var(--color-neutro-500)] uppercase tracking-wide mb-0.5">Estado</p>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-corner-m text-[12px] font-medium ${
            grupo.activo ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
          }`}>
            {grupo.activo ? "Activo" : "Inactivo"}
          </span>
        </div>
        <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <p className="text-[11px] text-[var(--color-neutro-500)] uppercase tracking-wide mb-0.5">Miembros</p>
          <p className="text-[13px] font-semibold text-[var(--color-neutro-900)]">{grupo.miembros.length}</p>
        </div>
      </div>

      {/* Mapa (solo Geográfico) */}
      {grupo.tipo === "Geográfico" && grupo.coordenadas && (
        <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-1.5 mb-2">
            <MapPin className="w-4 h-4 text-green-500" />
            <p className="text-[13px] font-semibold text-[var(--color-neutro-700)]">Coordenadas</p>
          </div>
          <div className="flex items-center gap-4 text-[13px]">
            <span className="text-[var(--color-neutro-500)]">Lat: <strong className="text-[var(--color-neutro-900)]">{grupo.coordenadas.lat}</strong></span>
            <span className="text-[var(--color-neutro-500)]">Lng: <strong className="text-[var(--color-neutro-900)]">{grupo.coordenadas.lng}</strong></span>
          </div>
        </div>
      )}

      {/* Miembros */}
      <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between px-3 pt-3 pb-2">
          <p className="text-[13px] font-semibold text-[var(--color-neutro-700)]">
            Miembros ({grupo.miembros.length})
          </p>
          <button
            className="flex items-center gap-1 text-[12px] font-medium text-[var(--color-verde-100)] hover:underline"
            onClick={onAddMember}
          >
            <Plus className="w-3.5 h-3.5" /> Agregar
          </button>
        </div>
        {/* Member tabs */}
        <div className="flex items-center gap-1 px-3 pb-2 border-b border-[var(--color-neutro-100)]">
          {(["unidades", "clientes", "proveedores"] as const).map((t) => {
            const Icon = MEMBER_ICONS[t];
            const count = grupo.miembros.filter((m) => m.source === t).length;
            return (
              <button
                key={t}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold rounded-corner-m transition-all ${
                  memberTab === t ? "bg-[var(--color-verde-100)] text-white" : "text-[var(--color-neutro-500)] hover:bg-[var(--color-neutro-100)]"
                }`}
                onClick={() => setMemberTab(t)}
              >
                <Icon className="w-3.5 h-3.5" />
                {MEMBER_LABELS[t]}
                <span className={`text-[11px] ${memberTab === t ? "text-white/70" : "text-[var(--color-neutro-400)]"}`}>({count})</span>
              </button>
            );
          })}
        </div>
        <div className="p-2">
          {miembrosFiltrados.length === 0 ? (
            <p className="text-[12px] text-[var(--color-neutro-400)] italic p-2">Sin miembros de este tipo</p>
          ) : miembrosFiltrados.map((m) => (
            <div key={m.entityId} className="flex items-center justify-between px-3 py-2 rounded-corner-m hover:bg-[var(--color-neutro-50)] transition-colors">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[13px] font-medium text-[var(--color-neutro-800)] truncate">{m.entityNombre}</span>
                <span className="text-[11px] text-[var(--color-neutro-400)] shrink-0">{m.entityCodigo}</span>
                <span className="text-[10px] text-[var(--color-neutro-400)] bg-[var(--color-neutro-100)] px-1.5 py-0.5 rounded-corner-m shrink-0">{m.entityNivel}</span>
              </div>
              <button
                className="p-1 rounded-corner-m hover:bg-red-50 text-[var(--color-neutro-400)] hover:text-red-400 transition-colors shrink-0"
                onClick={() => removeMiembro(grupo.id, m.entityId)}
                title="Quitar miembro"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Sub-grupos hijos */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[13px] font-semibold text-[var(--color-neutro-700)]">
            Sub-grupos ({children.length})
          </p>
          <button
            className="flex items-center gap-1 text-[12px] font-medium text-[var(--color-verde-100)] hover:underline"
            onClick={onAddChild}
          >
            <Plus className="w-3.5 h-3.5" /> Agregar sub-grupo
          </button>
        </div>
        {children.length > 0 ? (
          <div className="space-y-1">
            {children.map((child) => (
              <div key={child.id} className="flex items-center justify-between px-3 py-2 rounded-corner-m bg-white border border-[var(--color-neutro-200)] text-[13px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                <div className="flex items-center gap-2">
                  {child.tipo === "Geográfico" ? <Globe className="w-4 h-4 text-green-500" /> : <Calculator className="w-4 h-4 text-purple-500" />}
                  <span className="font-medium text-[var(--color-neutro-800)]">{child.nombre}</span>
                  <span className="text-[11px] text-[var(--color-neutro-400)]">{child.codigo}</span>
                </div>
                <span className="text-[11px] text-[var(--color-neutro-500)]">{child.subtipo}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[12px] text-[var(--color-neutro-400)] italic">Sin sub-grupos</p>
        )}
      </div>
    </div>
  );
}

/* ── Grupo Form Modal ── */
function GrupoFormModal({ open, editId, parentId, onClose }: { open: boolean; editId: string | null; parentId: string | null; onClose: () => void }) {
  const store = useGruposStore();
  const existing = editId ? store.grupos.find((g) => g.id === editId) : null;

  const [codigo, setCodigo] = useState(existing?.codigo ?? "");
  const [nombre, setNombre] = useState(existing?.nombre ?? "");
  const [tipo, setTipo] = useState<"Geográfico" | "Contable">(existing?.tipo ?? "Geográfico");
  const [subtipo, setSubtipo] = useState(existing?.subtipo ?? "");
  const [activo, setActivo] = useState(existing?.activo ?? true);
  const [lat, setLat] = useState(existing?.coordenadas?.lat ?? "");
  const [lng, setLng] = useState(existing?.coordenadas?.lng ?? "");
  const [pid, setPid] = useState<string | null>(existing?.padreId ?? parentId ?? null);

  const isGeo = tipo === "Geográfico";
  const subtipos = isGeo ? GEO_SUBTIPOS : ["Contable"];

  const invalid = !codigo.trim() || !nombre.trim() || !subtipo;
  const padresPosibles = store.grupos.filter((g) => g.id !== editId);

  function handleSubmit() {
    if (invalid) return;
    const base = { codigo: codigo.trim(), nombre: nombre.trim(), tipo, subtipo, padreId: pid, activo };
    const coordenadas = isGeo && lat && lng ? { lat, lng } : undefined;
    if (editId) {
      store.updateGrupo(editId, { ...base, coordenadas });
    } else {
      store.addGrupo({ ...base, coordenadas });
    }
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={editId ? "Editar Grupo" : "Nuevo Grupo"}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Código" value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="GRP-001" />
          <Input label="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre del grupo" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select label="Tipo" options={[{ value: "Geográfico", label: "Geográfico" }, { value: "Contable", label: "Contable" }]} value={tipo} onChange={(v) => { setTipo(v as "Geográfico" | "Contable"); setSubtipo(""); }} />
          <Select label="Subtipo" options={subtipos.map((s) => ({ value: s, label: s }))} value={subtipo} onChange={setSubtipo} />
        </div>
        {isGeo && (
          <div className="grid grid-cols-2 gap-4">
            <Input label="Latitud" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="Ej: 10.4806" />
            <Input label="Longitud" value={lng} onChange={(e) => setLng(e.target.value)} placeholder="Ej: -66.9036" />
          </div>
        )}
        <Select
          label="Grupo padre (opcional)"
          placeholder="Sin padre (raíz)"
          options={padresPosibles.map((g) => ({ value: g.id, label: `${g.nombre} (${g.codigo}) — ${g.subtipo}` }))}
          value={pid ?? ""}
          onChange={(v) => setPid(v || null)}
        />
        <div className="flex items-center pb-2">
          <Checkbox label="Grupo activo" checked={activo} onChange={(v) => setActivo(v)} />
        </div>
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--color-neutro-200)]">
          <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
          <Button size="sm" disabled={invalid} onClick={handleSubmit}>{editId ? "Guardar Cambios" : "Crear Grupo"}</Button>
        </div>
      </div>
    </Modal>
  );
}

/* ── Add Member Modal ── */
function AddMemberModal({ open, grupoId, onClose }: { open: boolean; grupoId: string | null; onClose: () => void }) {
  const { addMiembro, grupos } = useGruposStore();
  const entities = useEntitiesStore((s) => s.entities);
  const clientes = useClientesStore((s) => s.clientes);
  const proveedores = useProveedoresStore((s) => s.proveedores);

  const [source, setSource] = useState<"unidades" | "clientes" | "proveedores">("unidades");
  const [memberSearch, setMemberSearch] = useState("");

  const grupo = grupoId ? grupos.find((g) => g.id === grupoId) : null;
  const existingIds = new Set(grupo?.miembros.map((m) => m.entityId) ?? []);

  const available = useMemo(() => {
    let list: { id: string; nombre: string; codigo: string; nivel: string; subtipo: string }[] = [];
    if (source === "unidades") {
      list = entities.map((e) => ({ id: e.id, nombre: e.nombre, codigo: e.codigo, nivel: e.nivel, subtipo: e.subtipo }));
    } else if (source === "clientes") {
      list = clientes.map((c) => ({ id: c.id, nombre: c.razonSocial, codigo: c.codigo, nivel: "Clientes", subtipo: c.tipoPersona }));
    } else {
      list = proveedores.map((p) => ({ id: p.id, nombre: p.nombre, codigo: p.codigo, nivel: "Proveedores", subtipo: p.tipo }));
    }
    if (memberSearch.trim()) {
      const q = memberSearch.toLowerCase();
      list = list.filter((i) => i.nombre.toLowerCase().includes(q) || i.codigo.toLowerCase().includes(q));
    }
    return list.filter((i) => !existingIds.has(i.id)).slice(0, 50);
  }, [source, entities, clientes, proveedores, memberSearch, existingIds]);

  if (!grupoId) return null;

  return (
    <Modal open={open} onClose={onClose} title="Agregar Miembro" size="lg">
      <div className="space-y-4">
        <div className="flex items-center gap-1 bg-[var(--color-neutro-100)] p-1 rounded-corner-m w-fit">
          {(["unidades", "clientes", "proveedores"] as const).map((s) => {
            const Icon = MEMBER_ICONS[s];
            return (
              <button
                key={s}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold rounded-corner-m transition-all ${
                  source === s ? "bg-white text-[var(--color-neutro-900)] shadow-sm" : "text-[var(--color-neutro-500)] hover:text-[var(--color-neutro-700)]"
                }`}
                onClick={() => { setSource(s); setMemberSearch(""); }}
              >
                <Icon className="w-3.5 h-3.5" />
                {MEMBER_LABELS[s]}
              </button>
            );
          })}
        </div>

        <Input
          prefix={<Search className="w-4 h-4" />}
          placeholder="Buscar..."
          value={memberSearch}
          onChange={(e) => setMemberSearch(e.target.value)}
        />

        <div className="max-h-64 overflow-y-auto space-y-0.5 border border-[var(--color-neutro-200)] rounded-corner-m p-1">
          {available.length === 0 ? (
            <p className="text-[13px] text-[var(--color-neutro-400)] text-center py-6">
              {memberSearch ? "Sin resultados" : "Todas las entidades de este tipo ya son miembros"}
            </p>
          ) : available.map((item) => (
            <button
              key={item.id}
              className="w-full flex items-center justify-between px-3 py-2 rounded-corner-m text-left hover:bg-[var(--color-neutro-100)] transition-colors"
              onClick={() => {
                addMiembro(grupoId, {
                  entityId: item.id,
                  entityNombre: item.nombre,
                  entityCodigo: item.codigo,
                  entityNivel: item.nivel,
                  entitySubtipo: item.subtipo,
                  source,
                });
                onClose();
              }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[13px] font-medium text-[var(--color-neutro-800)] truncate">{item.nombre}</span>
                <span className="text-[11px] text-[var(--color-neutro-400)] shrink-0">{item.codigo}</span>
              </div>
              <span className="text-[11px] text-[var(--color-neutro-500)] shrink-0">{item.nivel}</span>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}
