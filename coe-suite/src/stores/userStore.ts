import { create } from "zustand";

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
}

interface UserState {
  current: User;
}

const CURRENT_USER: User = {
  id: "u001",
  initials: "AM",
  nombre: "COE User",
  email: "admin@avila.com",
  rol: "Super Admin",
  actor: "banco",
  unidadId: "AGE-HQ",
  unidadNombre: "Bóveda Principal HQ",
  color: "var(--color-verde-100)",
};

export const useUserStore = create<UserState>(() => ({
  current: CURRENT_USER,
}));
