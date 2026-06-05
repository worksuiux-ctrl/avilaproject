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
      { id: "dashboard-main", label: "Panel General", icon: "ChartLine", route: "/" },
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
    description: "Reportes operativos y regulatorios",
    items: [
      { id: "op-reports", label: "Reportes Operativos", icon: "Report", route: "/op-reports" },
      { id: "reg-reports", label: "Reportes Regulatorios", icon: "Report", route: "/reg-reports" },
    ],
  },
  {
    id: "transacciones",
    label: "Transacciones",
    icon: "ListCheck",
    description: "Registro de operaciones",
    items: [
      { id: "txns", label: "Todas las Transacciones", icon: "ListCheck", route: "/txns" },
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
    label: "Configuración y Parametrización",
    icon: "Cog",
    description: "Parámetros del sistema, bóvedas, divisas, ATMs",
    items: [
      { id: "config", label: "Configuraciones COE", icon: "Settings", route: "/config" },
      { id: "config-divisas", label: "Gestión de Divisas", icon: "Cash", route: "/config/divisas" },
      { id: "config-transporte", label: "Logística de Transporte", icon: "Truck", route: "/config/transporte" },
      { id: "config-bovedas", label: "Gestión de Bóvedas", icon: "Vault", route: "/config/bovedas" },
      { id: "config-unidades", label: "Unidades y Cupos", icon: "Building2", route: "/config/unidades" },
      { id: "config-empleados", label: "Empleados y Cargos", icon: "Users", route: "/config/empleados" },
      { id: "config-parametros", label: "Parámetros", icon: "Sliders", route: "/config/parametros" },
    ],
  },
  {
    id: "soporte",
    label: "Soporte y Ayuda",
    icon: "HelpCircle",
    description: "Documentación, guías y soporte técnico",
    items: [
      { id: "help", label: "Centro de Ayuda", icon: "HelpCircle", route: "/help" },
    ],
  },
  {
    id: "integraciones",
    label: "Integraciones",
    icon: "Puzzle",
    description: "Conexiones con sistemas externos",
    items: [
      { id: "integrations", label: "Panel de Integraciones", icon: "Puzzle", route: "/integrations" },
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
];
