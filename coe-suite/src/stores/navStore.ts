import { create } from "zustand";
import { MODULES } from "../data/navigation";

interface NavState {
  activeView: string;
  title: string;
  description: string;
  navigate: (view: string) => void;
}

const VIEW_META: Record<string, { t: string; d: string }> = {
  dashboard: { t: "Selecciona un Módulo", d: "Panel de navegación principal de COE Suite" },
  "war-room": { t: "War Room · Tesorería", d: "Monitoreo de posiciones consolidadas y alertas en tiempo real" },
  "kpi-gerencial": { t: "KPIs Estratégicos", d: "Indicadores clave de gestión de efectivo — Perfil Gerencia Ejecutiva" },
  "kpi-operativo": { t: "KPIs Operativos", d: "Indicadores operativos de bóvedas, ATMs y transporte" },
  "ops-corp": { t: "Perfil Corporativo", d: "Portal de servicios corporativos B2B" },
  "coengine-config": { t: "Configuración del Engine", d: "Parámetros, modelos predictivos, matemáticos e IA del motor COENGINE" },
  "coengine-activity": { t: "Actividad del Engine", d: "Resultados de cálculos, ejecuciones y actividad del motor COENGINE" },
  "bot-forecast": { t: "COENGINE BOT", d: "Automatización JIT · Aprovisionamiento Inteligente · Configurable por Canal" },
  reportes: { t: "Reportes", d: "Unificación de reportes operativos y regulatorios — personalizables y fijos" },
  georef: { t: "Mapa Interactivo", d: "Georreferenciación de nodos y unidades" },
  config: { t: "Configuraciones", d: "Límites, estados, usuarios, tarifas y parámetros del sistema" },
  bovedas: { t: "Gestión de Bóvedas", d: "Administración de bóvedas, inventarios y asignaciones" },
  divisas: { t: "Gestión de Divisas", d: "Control de tipos de cambio, posiciones y límites por divisa" },
  transporte: { t: "Logística de Transporte", d: "Gestión de transportistas, rutas y tarifas CIT" },
  unidades: { t: "Unidades y Cupos", d: "Administración de unidades operativas y asignación de cupos" },
  empleados: { t: "Empleados y Cargos", d: "Gestión del personal, roles y estructura organizativa" },
  parametros: { t: "Parámetros del Sistema", d: "Configuración avanzada de parámetros operativos y financieros" },
  soportetickets: { t: "COE Tickets", d: "Soporte y Ayuda — COE Tickets" },
  soportefaq: { t: "FAQ", d: "Soporte y Ayuda — Preguntas Frecuentes" },
  operaciones: { t: "Panel de Operaciones", d: "Simulador de operaciones transaccionales" },
};

// Auto-generate meta from navigation data for any missing entries
MODULES.forEach((mod) => {
  mod.items.forEach((item) => {
    const key = item.route.replace("/", "");
    if (!VIEW_META[key]) {
      VIEW_META[key] = {
        t: item.label,
        d: `${mod.label} — ${item.label}`,
      };
    }
  });
});

export const useNavStore = create<NavState>((set) => ({
  activeView: "dashboard",
  title: VIEW_META.dashboard.t,
  description: VIEW_META.dashboard.d,
  navigate: (view: string) => {
    const key = view.replace("/", "") || "dashboard";
    const meta = VIEW_META[key] || { t: view, d: "" };
    set({ activeView: key, title: meta.t, description: meta.d });
  },
}));
