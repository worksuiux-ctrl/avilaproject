import { create } from "zustand";

export type Perfil = "banco" | "banco-central" | "transportista" | "corporativo" | "negocios";

interface ProfileState {
  perfil: Perfil;
  setPerfil: (p: Perfil) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  perfil: "banco",
  setPerfil: (perfil) => set({ perfil }),
}));

export const PERFIL_OPTIONS = [
  { value: "banco", label: "Banco" },
  { value: "banco-central", label: "Banco Central" },
  { value: "transportista", label: "Transportista" },
  { value: "corporativo", label: "Corporativo" },
  { value: "negocios", label: "Negocios" },
];
