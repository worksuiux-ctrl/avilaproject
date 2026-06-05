import { Select } from "@coe/design-system";
import { useProfileStore, PERFIL_OPTIONS } from "@stores/profileStore";

export function ProfileSelector() {
  const { perfil, setPerfil } = useProfileStore();
  return (
    <Select
      options={PERFIL_OPTIONS}
      value={perfil}
      onChange={(v) => setPerfil(v as typeof perfil)}
    />
  );
}
