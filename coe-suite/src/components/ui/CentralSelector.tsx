import { useMemo } from "react";
import { Select } from "@coe/design-system";
import { useProfileStore } from "@stores/profileStore";
import { useEntitiesStore } from "@stores/entitiesStore";
import { useUserStore } from "@stores/userStore";

export function CentralSelector() {
  const perfil = useProfileStore((s) => s.perfil);
  const entities = useEntitiesStore((s) => s.entities);
  const { current, setCentral } = useUserStore();

  const centrales = useMemo(
    () =>
      entities
        .filter((e) => e.nivel === "Central Administrativa" && e.activo)
        .map((e) => ({ value: e.id, label: `${e.nombre} (${e.codigo})` })),
    [entities]
  );

  if (perfil !== "modulo-central" || centrales.length === 0) return null;

  return (
    <Select
      options={centrales}
      value={current.unidadId}
      onChange={(v) => {
        const c = entities.find((e) => e.id === v);
        if (c) setCentral(c.id, c.nombre, c.codigo);
      }}
    />
  );
}
