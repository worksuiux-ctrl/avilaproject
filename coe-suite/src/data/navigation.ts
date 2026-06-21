export interface NavItem {
  id: string;
  label: string;
  icon: string;
  route: string;
}

export interface Module {
  id: string;
  label: string;
  icon: string;
  description: string;
  items: NavItem[];
}

export const MODULES: Module[] = [
  {
    id: "inicio",
    label: "Inicio",
    icon: "LayoutDashboard",
    description: "Monitoreo diario, análisis y control",
    items: [
      { id: "dashboard-main", label: "Panel General", icon: "ChartLine", route: "/dashboard" },
      { id: "inventario", label: "Inventario", icon: "ArchiveBox", route: "/inventario" },
      { id: "war-room", label: "War Room · Tesorería", icon: "TowerObservation", route: "/war-room" },
      { id: "kpi-gerencial", label: "KPIs Estratégicos", icon: "ChartPie", route: "/kpi-gerencial" },
      { id: "kpi-operativo", label: "KPIs Operativos", icon: "Gauge", route: "/kpi-operativo" },
    ],
  },
  {
    id: "operaciones",
    label: "Operaciones",
    icon: "BuildingBank",
    description: "Gestión por perfil — Banco, BCV, Transportista, Corporativo, Negocios",
    items: [
      { id: "operaciones-main", label: "Panel de Operaciones", icon: "Briefcase", route: "/operaciones" },
      { id: "operaciones-conteo", label: "Mesa de Conteo", icon: "TableCells", route: "/operaciones/conteo" },
    ],
  },
  {
    id: "coengine",
    label: "COENGINE",
    icon: "Bot",
    description: "Modelos predictivos, matemáticos e inteligencia artificial",
    items: [
      { id: "coengine-config", label: "Configuración del Engine", icon: "Settings", route: "/coengine/config" },
      { id: "coengine-activity", label: "Actividad del Engine", icon: "ChartLine", route: "/coengine/activity" },
    ],
  },
  {
    id: "reportes",
    label: "Reportes",
    icon: "Report",
    description: "Unificación de reportes operativos y regulatorios",
    items: [
      { id: "reportes-main", label: "Reportes", icon: "Report", route: "/reportes" },
    ],
  },
  {
    id: "georreferenciacion",
    label: "Georreferenciación",
    icon: "MapPin",
    description: "Mapa interactivo del ecosistema",
    items: [
      { id: "georef", label: "Mapa Interactivo", icon: "MapPin", route: "/georef" },
    ],
  },
  {
    id: "configuracion",
    label: "Configuración de Infraestructura",
    icon: "Cog",
    description: "Parámetros del sistema, bóvedas, divisas, ATMs",
    items: [
      { id: "config-organizacion", label: "Mi Organización", icon: "Building2", route: "/config/organizacion" },
      { id: "config-unidades", label: "Unidades", icon: "Building2", route: "/config/unidades" },
      { id: "config-divisas", label: "Divisas", icon: "Cash", route: "/config/divisas" },
      { id: "config-proveedores", label: "Proveedores", icon: "Truck", route: "/config/proveedores" },
      { id: "config-clientes", label: "Clientes", icon: "Users", route: "/config/clientes" },
      { id: "config-grupos", label: "Grupos", icon: "ListTree", route: "/config/grupos" },
      { id: "config-motor-transacciones", label: "Motor Transacciones", icon: "Settings", route: "/config/motor-transacciones" },
      { id: "config-calendario-financiero", label: "Calendario Financiero", icon: "CalendarDays", route: "/config/calendario-financiero" },
    ],
  },
  {
    id: "soporte",
    label: "Soporte y Ayuda",
    icon: "HelpCircle",
    description: "Documentación, guías y soporte técnico",
    items: [
      { id: "coe-tickets", label: "COE Tickets", icon: "Ticket", route: "/soporte/tickets" },
      { id: "faq", label: "Preguntas Frecuentes", icon: "QuestionMarkCircle", route: "/soporte/faq" },
    ],
  },
  {
    id: "integraciones",
    label: "Integraciones",
    icon: "Puzzle",
    description: "Conexiones con sistemas externos",
    items: [
      { id: "integrations", label: "Panel de Integraciones", icon: "ServerStack", route: "/integrations" },
      { id: "interfaces", label: "Interfaces", icon: "ArrowsRightLeft", route: "/interfaces" },
    ],
  },
  {
    id: "auditoria",
    label: "Auditoría y Seguridad",
    icon: "Shield",
    description: "Logs de auditoría, roles y permisos",
    items: [
      { id: "audit", label: "Log de Auditoría", icon: "Shield", route: "/audit" },
    ],
  },
  {
    id: "roles-permisos",
    label: "Roles y Permisos",
    icon: "ShieldCheck",
    description: "Perfilamiento de usuarios, grupos y control de acceso",
    items: [
      { id: "roles-main", label: "Gestión de Roles", icon: "ShieldCheck", route: "/roles-permisos" },
    ],
  },
];
