import { useState } from "react";
import { Heading, Text } from "@coe/design-system";
import { InteractiveMap } from "./components/InteractiveMap";
import { GrupoLegend } from "./components/GrupoLegend";
import type { Grupo } from "../../stores/gruposStore";

export function MapaInteractivo() {
  const [selectedGroup, setSelectedGroup] = useState<Grupo | null>(null);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <Heading variant="title" as="h1">Mapa Interactivo</Heading>
          <Text variant="small" className="text-text-grey mt-1">
            Georreferenciación — visualización del territorio nacional y límites político-territoriales
          </Text>
        </div>
        {selectedGroup && (
          <div className="flex items-center gap-2">
            <Text variant="small" className="text-text-grey">Grupo activo:</Text>
            <Text variant="small" className="font-semibold">{selectedGroup.nombre}</Text>
            <button
              onClick={() => setSelectedGroup(null)}
              className="text-xs text-ind-rojo hover:underline"
            >
              Limpiar
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 flex gap-4">
        <div className="w-64 shrink-0 bg-white rounded-corner-m border border-gray-200 overflow-hidden">
          <GrupoLegend selectedGroup={selectedGroup} onSelectGrupo={setSelectedGroup} />
        </div>
        <div className="flex-1 min-w-0 relative">
          <InteractiveMap selectedGroup={selectedGroup} />
        </div>
      </div>
    </div>
  );
}
