import { useEffect, useState } from "react";
import { Plus, Info, TreePine, Workflow } from "lucide-react";
import { useEntitiesStore } from "@stores/entitiesStore";
import { EntityTree, EntityForm, EntityDetail, EntityDiagram } from "@components/entities";
import { DeleteDialog } from "@components/shared/DeleteDialog";

export function Unidades() {
  const { selectedId, selectEntity, removeEntity, entities } = useEntitiesStore();

  useEffect(() => {
    if (!selectedId) {
      const first = entities.find((e) => e.padreId === null);
      if (first) selectEntity(first.id);
    }
  }, []);
  const [formOpen, setFormOpen] = useState(false);
  const [formParentId, setFormParentId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [diagramMode, setDiagramMode] = useState(false);

  const selectedEntity = useEntitiesStore((s) =>
    s.selectedId ? s.entities.find((e) => e.id === s.selectedId) : null
  );

  function handleNewRoot() {
    setFormParentId(null);
    setFormOpen(true);
  }

  function handleAddChild() {
    setFormParentId(selectedId);
    setFormOpen(true);
  }

  function handleEdit() {
    setFormParentId(null);
    setFormOpen(true);
  }

  function handleDelete() {
    if (selectedId) {
      removeEntity(selectedId);
      selectEntity(null);
    }
  }

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-[18px] font-bold text-[var(--color-neutro-900)]">Unidades</h1>
          <p className="text-[13px] text-[var(--color-neutro-500)]">
            Creador y administrador de entidades jerárquicas del sistema
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-corner-m hover:bg-[var(--color-neutro-100)] text-[var(--color-neutro-400)] transition-colors"
            title="¿Qué es esto?"
            onClick={() => setShowHelp(!showHelp)}
          >
            <Info className="w-4 h-4" />
          </button>
          <button
            className={`flex items-center gap-1.5 px-3 py-2 text-[13px] font-semibold rounded-corner-m border transition-all ${
              diagramMode
                ? "bg-[var(--color-verde-100)] text-white border-[var(--color-verde-100)]"
                : "bg-white text-[var(--color-neutro-700)] border-[var(--color-neutro-200)] hover:bg-[var(--color-neutro-100)]"
            }`}
            onClick={() => setDiagramMode(!diagramMode)}
          >
            {diagramMode ? <TreePine className="w-4 h-4" /> : <Workflow className="w-4 h-4" />}
            {diagramMode ? "Árbol" : "Diagrama"}
          </button>
          <button
            className="flex items-center gap-1.5 px-4 py-2 bg-[var(--color-verde-100)] text-white text-[13px] font-semibold rounded-corner-m hover:brightness-110 transition-all"
            onClick={handleNewRoot}
          >
            <Plus className="w-4 h-4" /> Nueva Entidad
          </button>
        </div>
      </div>

      {/* Help banner */}
      {showHelp && (
        <div className="mb-4 p-4 bg-[var(--color-verde-100)]/5 border border-[var(--color-verde-100)]/20 rounded-corner-m text-[13px] text-[var(--color-neutro-700)]">
          <p className="font-medium mb-1">Modelo Jerárquico de Entidades</p>
          <p className="text-[12px] text-[var(--color-neutro-500)] leading-relaxed">
            Las entidades se organizan en niveles (Oficinas → Depósitos → Mercancía).
            Cada nivel define qué tipos de hijos puede contener. Por ejemplo, una <strong>Oficina</strong> puede tener
            <strong> Depósitos</strong>, <strong>Sub Entidades</strong> y <strong>Vehículos</strong> (flota propia del banco).
            Un <strong>Depósito</strong> puede tener <strong>Mercancía</strong>; y un <strong>Proveedor</strong> de
            transporte puede tener <strong>Vehículos</strong>.
            Las entidades hoja (Mercancía, Clientes) no pueden contener hijos.
            Los <strong>Grupos Geográficos</strong> y <strong>Monedas</strong> se administran desde sus propias secciones.
            {diagramMode && (
              <span className="block mt-1">En el diagrama puede arrastrar nodos, reconectar flechas para re-asignar padres, y hacer clic para seleccionar.</span>
            )}
          </p>
        </div>
      )}

      {/* Split layout */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Left: Tree or Diagram */}
        {diagramMode ? (
          <div className="flex-1 bg-white border border-[var(--color-neutro-200)] rounded-corner-m overflow-hidden">
            <EntityDiagram onSelectEntity={selectEntity} />
          </div>
        ) : (
          <div className="w-[410px] shrink-0 bg-white border border-[var(--color-neutro-200)] rounded-corner-m overflow-y-auto">
            <div className="p-3 border-b border-[var(--color-neutro-200)]">
              <p className="text-[12px] font-semibold text-[var(--color-neutro-600)] uppercase tracking-wide">
                Explorador de Entidades
              </p>
            </div>
            <div className="p-2">
              <EntityTree />
            </div>
          </div>
        )}

        {/* Right: Detail */}
        <div className="flex-1 overflow-y-auto p-5">
          {selectedEntity ? (
            <EntityDetail
              entityId={selectedEntity.id}
              onEdit={handleEdit}
              onAddChild={handleAddChild}
              onDelete={() => setDeleteOpen(true)}
            />
          ) : (
            <EntityDetail
              entityId=""
              onEdit={() => {}}
              onAddChild={() => {}}
              onDelete={() => {}}
            />
          )}
        </div>
      </div>

      {/* Form modal */}
      <EntityForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setFormParentId(null); }}
        editEntity={formParentId === null && selectedId && selectedEntity ? selectedEntity : null}
        parentId={formParentId}
      />

      {/* Delete dialog */}
      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar Entidad"
        description="¿Está seguro de eliminar esta entidad?"
        itemName={selectedEntity?.nombre}
        onConfirm={handleDelete}
      />
    </div>
  );
}
