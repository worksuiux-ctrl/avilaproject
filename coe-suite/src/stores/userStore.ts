import { create } from "zustand";

export interface CentralOption {
  id: string;
  nombre: string;
  codigo: string;
}

interface User {
  id: string;
  initials: string;
  nombre: string;
  email: string;
  rol: string;
  actor: string;
  unidadId: string;
  unidadNombre: string;
  color: string;
  centralesDisponibles: CentralOption[];
}

interface UserState {
  current: User;
  setCentral: (id: string, nombre: string, codigo: string) => void;
}

const CURRENT_USER: User = {
  id: "u001",
  initials: "AM",
  nombre: "COE User",
  email: "admin@avila.com",
  rol: "Super Admin",
  actor: "banco",
  unidadId: "demo-central-1",
  unidadNombre: "Central Administrativa Occidente (CEN-OCC)",
  color: "var(--color-verde-100)",
  centralesDisponibles: [],
};

export const useUserStore = create<UserState>((set) => ({
  current: CURRENT_USER,
  setCentral: (id, nombre, codigo) =>
    set((s) => ({
      current: {
        ...s.current,
        unidadId: id,
        unidadNombre: `${nombre} (${codigo})`,
      },
    })),
}));
