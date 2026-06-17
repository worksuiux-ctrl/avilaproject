import { useState, useMemo } from "react";
import { Heading, Text } from "@coe/design-system";
import { InteractiveMap, type FlyToTarget } from "./components/InteractiveMap";
import { GrupoLegend } from "./components/GrupoLegend";
import { useGruposStore, type Grupo } from "../../stores/gruposStore";

export function MapaInteractivo() {
  const [selectedGroup, setSelectedGroup] = useState<Grupo | null>(null);
  const [flyToTarget, setFlyToTarget] = useState<FlyToTarget | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [selectedMemberName, setSelectedMemberName] = useState<string | null>(null);

  const breadcrumb = useMemo(() => {
    if (selectedMemberId && selectedMemberName) {
      const grupos = useGruposStore.getState().grupos;
      const parent = grupos.find((g) => g.miembros.some((m) => m.entityId === selectedMemberId));
      if (parent) {
        const ancestors = useGruposStore.getState().getAncestors(parent.id);
        return [...ancestors, parent].map((g) => g.nombre).join(" / ") + " / " + selectedMemberName;
      }
    }
    if (!selectedGroup) return null;
    const ancestors = useGruposStore.getState().getAncestors(selectedGroup.id);
    return [...ancestors, selectedGroup].map((g) => g.nombre).join(" / ");
  }, [selectedGroup, selectedMemberId, selectedMemberName]);

  const handleFlyTo = (target: FlyToTarget & { entityId?: string; entityName?: string }) => {
    setFlyToTarget(target);
    if (target.entityId) {
      setSelectedMemberId(target.entityId);
      setSelectedMemberName(target.entityName ?? null);
      setSelectedGroup(null);
    }
  };

  const handleSelectMember = (id: string, name: string) => {
    setSelectedMemberId(id);
    setSelectedMemberName(name);
    setSelectedGroup(null);
  };

  const handleSelectGrupo = (grupo: Grupo) => {
    setSelectedGroup(grupo);
    setSelectedMemberId(null);
    setSelectedMemberName(null);
  };

  const handleClear = () => {
    setSelectedGroup(null);
    setSelectedMemberId(null);
    setSelectedMemberName(null);
    setFlyToTarget(null);
  };

  const hasSelection = selectedGroup !== null || selectedMemberId !== null;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 shrink-0 gap-4">
        {hasSelection ? (
          <>
            <div className="min-w-0 flex-1">
              <Heading variant="title" as="h1" className="truncate" title={breadcrumb!}>
                {breadcrumb}
              </Heading>
              {selectedGroup ? (
                <div className="flex items-center gap-2 mt-0.5">
                  <Text variant="small" className="text-text-grey">
                    {selectedGroup.codigo} &middot; {selectedGroup.subtipo}
                  </Text>
                  {selectedGroup.miembros.length > 0 && (
                    <>
                      <span className="text-text-grey text-[11px]">&middot;</span>
                      <Text variant="small" className="text-text-grey">
                        {selectedGroup.miembros.length} unidad{selectedGroup.miembros.length !== 1 ? "es" : ""}
                      </Text>
                    </>
                  )}
                </div>
              ) : selectedMemberId && (
                <div className="flex items-center gap-2 mt-0.5">
                  <Text variant="small" className="text-text-grey">
                    {(() => {
                      for (const g of useGruposStore.getState().grupos) {
                        const m = g.miembros.find((m) => m.entityId === selectedMemberId);
                        if (m) return `${m.entityCodigo} · ${m.entityNivel}`;
                      }
                      return "";
                    })()}
                  </Text>
                </div>
              )}
            </div>
            <button
              onClick={handleClear}
              className="shrink-0 px-3 py-1.5 text-[12px] font-medium text-white bg-[var(--color-verde-100)] rounded-corner-m hover:brightness-110 transition-all"
            >
              Limpiar
            </button>
          </>
        ) : (
          <div>
            <Heading variant="title" as="h1">Mapa Interactivo</Heading>
            <Text variant="small" className="text-text-grey mt-1">
              Georreferenciación — visualización del territorio nacional y límites político-territoriales
            </Text>
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 flex gap-4">
        <div className="w-64 shrink-0 bg-white rounded-corner-m border border-gray-200 overflow-hidden">
          <GrupoLegend
            selectedGroup={selectedGroup}
            onSelectGrupo={handleSelectGrupo}
            onFlyTo={handleFlyTo}
            selectedMemberId={selectedMemberId}
            onSelectMember={handleSelectMember}
          />
        </div>
        <div className="flex-1 min-w-0 relative">
          <InteractiveMap selectedGroup={selectedGroup} flyToTarget={flyToTarget} selectedEntityId={selectedMemberId} />
        </div>
      </div>
    </div>
  );
}
