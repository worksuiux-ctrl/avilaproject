import { Building2, Landmark, MapPin, Phone, Mail, Globe, CalendarDays, BadgeCheck, Shield, PiggyBank, Truck, Building, Puzzle, Cog, ChartLine, Users, Settings, Brain, Cpu, BarChart3, Radar } from "lucide-react";

interface ModuleStatus {
  id: string;
  nombre: string;
  descripcion: string;
  icon: typeof Building2;
  activo: boolean;
  requerido: boolean;
}

const MODULOS_POR_TIPO: Record<string, ModuleStatus[]> = {
  banco: [
    { id: "dashboard", nombre: "Dashboard", descripcion: "Panel general y monitoreo", icon: ChartLine, activo: true, requerido: true },
    { id: "inventario", nombre: "Inventario", descripcion: "Control de efectivo y bóvedas", icon: PiggyBank, activo: true, requerido: true },
    { id: "operaciones", nombre: "Operaciones", descripcion: "Gestión de operaciones diarias", icon: Settings, activo: true, requerido: true },
    { id: "war-room", nombre: "War Room", descripcion: "Tesorería en tiempo real", icon: Shield, activo: true, requerido: true },
    { id: "kpi", nombre: "KPIs", descripcion: "Indicadores estratégicos y operativos", icon: ChartLine, activo: true, requerido: false },
    { id: "coengine", nombre: "COENGINE", descripcion: "Modelos predictivos e IA", icon: Cog, activo: true, requerido: false },
    { id: "reportes", nombre: "Reportes", descripcion: "Reportes operativos y regulatorios", icon: ChartLine, activo: true, requerido: true },
    { id: "georef", nombre: "Georreferenciación", descripcion: "Mapa interactivo del ecosistema", icon: MapPin, activo: true, requerido: false },
    { id: "config", nombre: "Configuración", descripcion: "Parámetros del sistema", icon: Settings, activo: true, requerido: true },
    { id: "integraciones", nombre: "Integraciones", descripcion: "Conexiones con sistemas externos", icon: Puzzle, activo: true, requerido: false },
    { id: "roles", nombre: "Roles y Permisos", descripcion: "Perfilamiento y control de acceso", icon: Users, activo: true, requerido: true },
  ],
  cit: [
    { id: "dashboard", nombre: "Dashboard", descripcion: "Panel general y monitoreo", icon: ChartLine, activo: true, requerido: true },
    { id: "operaciones", nombre: "Operaciones", descripcion: "Gestión de rutas y flota", icon: Truck, activo: true, requerido: true },
    { id: "reportes", nombre: "Reportes", descripcion: "Reportes operativos", icon: ChartLine, activo: true, requerido: true },
    { id: "georef", nombre: "Georreferenciación", descripcion: "Seguimiento de unidades", icon: MapPin, activo: true, requerido: true },
    { id: "config", nombre: "Configuración", descripcion: "Parámetros del sistema", icon: Settings, activo: true, requerido: true },
    { id: "roles", nombre: "Roles y Permisos", descripcion: "Perfilamiento y control de acceso", icon: Users, activo: true, requerido: true },
  ],
  corp: [
    { id: "dashboard", nombre: "Dashboard", descripcion: "Panel general", icon: ChartLine, activo: true, requerido: true },
    { id: "operaciones", nombre: "Operaciones", descripcion: "Solicitudes y movimientos", icon: Building, activo: true, requerido: true },
    { id: "reportes", nombre: "Reportes", descripcion: "Reportes corporativos", icon: ChartLine, activo: true, requerido: true },
    { id: "config", nombre: "Configuración", descripcion: "Parámetros del sistema", icon: Settings, activo: true, requerido: true },
  ],
  bcv: [
    { id: "dashboard", nombre: "Dashboard", descripcion: "Panel general", icon: ChartLine, activo: true, requerido: true },
    { id: "reportes", nombre: "Reportes", descripcion: "Reportes regulatorios", icon: ChartLine, activo: true, requerido: true },
    { id: "coengine", nombre: "COENGINE", descripcion: "Modelos predictivos", icon: Cog, activo: true, requerido: false },
    { id: "config", nombre: "Configuración", descripcion: "Parámetros del sistema", icon: Settings, activo: true, requerido: true },
  ],
};

const TIPO_EMPRESA = {
  banco: { label: "Banco", icon: Landmark, color: "bg-green-100 text-green-700" },
  cit: { label: "Transportista", icon: Truck, color: "bg-amber-100 text-amber-700" },
  corp: { label: "Corporativo", icon: Building, color: "bg-purple-100 text-purple-700" },
  bcv: { label: "BCV", icon: Landmark, color: "bg-teal-100 text-teal-700" },
} as const;

type TipoEmpresa = keyof typeof TIPO_EMPRESA;

const EMPRESA_DEMO = {
  razonSocial: "Banco Ávila C.A.",
  nombreComercial: "Banco Ávila",
  rif: "J-12345678-9",
  nit: "NIT-987654321-0",
  tipo: "banco" as TipoEmpresa,
  subTipo: "Banco Universal",
  organismoRegulador: "SUDEBAN — Superintendencia de Bancos",
  licencia: "BAN-001-2020",
  fechaRegistro: "15/01/2020",
  direccion: "Av. Francisco de Miranda, Edif. Banco Ávila, Piso 12, Chacao, Caracas 1060, Venezuela",
  telefono: "+58 212 555.1234",
  email: "contacto@bancoavila.com",
  sitioWeb: "www.bancoavila.com",
  pais: "Venezuela",
  monedaBase: "VED (Bolívar)"
};

const CONTRATO_DEMO = {
  plan: "COE Suite Enterprise",
  contrato: "COE-2024-001",
  fechaInicio: "01/03/2024",
  fechaRenovacion: "01/03/2027",
  estado: "Activo" as const,
  version: "3.2.1",
  soporte: "24/7 Premium",
  contactoComercial: "Claudia Moreno — claudia.moreno@coe.tech",
};

const COENGINE_PLAN = {
  plan: "COENGINE Enterprise",
  version: "2.4.0",
  motor: "COE Neural Engine v3",
  activo: true,
  modelos: [
    { nombre: "Pronóstico de Demanda", icon: BarChart3, activo: true, desc: "Predicción de flujo de efectivo" },
    { nombre: "Optimización de Rutas", icon: Radar, activo: true, desc: "Ruteo inteligente de transporte" },
    { nombre: "Detección de Anomalías", icon: Brain, activo: true, desc: "Alertas tempranas de irregularidades" },
    { nombre: "Clasificación Inteligente", icon: Cpu, activo: false, desc: "Taxonomía automática de operaciones" },
    { nombre: "Recomendador de Acciones", icon: Cog, activo: false, desc: "Sugerencias predictivas de tesorería" },
  ],
  capacidad: "Procesamiento: 100K ops/día · Latencia: <500ms · Throughput: 50 tps",
  fechaActivacion: "15/06/2024",
};

export function Organizacion() {
  const e = EMPRESA_DEMO;
  const c = CONTRATO_DEMO;
  const tipoInfo = TIPO_EMPRESA[e.tipo];
  const modulos = MODULOS_POR_TIPO[e.tipo];
  const TipoIcon = tipoInfo.icon;

  return (
    <div className="p-6 h-full flex flex-col space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-corner-m bg-[var(--color-verde-100)] flex items-center justify-center">
            <TipoIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-[18px] font-bold text-[var(--color-neutro-900)]">{e.razonSocial}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[12px] font-semibold px-2 py-0.5 rounded-corner-m ${tipoInfo.color}`}>{tipoInfo.label} · {e.subTipo}</span>
              <span className="text-[12px] font-semibold px-2 py-0.5 rounded-corner-m bg-green-100 text-green-700">{c.estado}</span>
              <span className="text-[12px] text-[var(--color-neutro-500)]">RIF: {e.rif}</span>
            </div>
            <p className="text-[13px] text-[var(--color-neutro-500)] mt-0.5">Contrato {c.contrato} · Plan {c.plan} · v{c.version}</p>
          </div>
        </div>
      </div>

      {/* Grid: Company Info */}
      <div className="grid grid-cols-3 gap-4">
        {/* Identity Card */}
        <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m p-4">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-4 h-4 text-[var(--color-neutro-500)]" />
            <h3 className="text-[13px] font-bold text-[var(--color-neutro-900)]">Identificación</h3>
          </div>
          <div className="space-y-3">
            <div><p className="text-[12px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide">Razón Social</p><p className="text-[13px] font-semibold text-[var(--color-neutro-900)]">{e.razonSocial}</p></div>
            <div><p className="text-[12px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide">Nombre Comercial</p><p className="text-[13px] text-[var(--color-neutro-700)]">{e.nombreComercial}</p></div>
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-[12px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide">RIF</p><p className="text-[13px] font-mono text-[var(--color-neutro-700)]">{e.rif}</p></div>
              <div><p className="text-[12px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide">NIT</p><p className="text-[13px] font-mono text-[var(--color-neutro-700)]">{e.nit}</p></div>
            </div>
            <div><p className="text-[12px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide">Moneda Base</p><p className="text-[13px] text-[var(--color-neutro-700)]">{e.monedaBase}</p></div>
          </div>
        </div>

        {/* Contact Card */}
        <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m p-4">
          <div className="flex items-center gap-2 mb-3">
            <Phone className="w-4 h-4 text-[var(--color-neutro-500)]" />
            <h3 className="text-[13px] font-bold text-[var(--color-neutro-900)]">Contacto</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[var(--color-neutro-400)] mt-0.5 flex-shrink-0" />
              <p className="text-[13px] text-[var(--color-neutro-600)] leading-relaxed">{e.direccion}</p>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[var(--color-neutro-400)] flex-shrink-0" />
              <p className="text-[13px] text-[var(--color-neutro-700)]">{e.telefono}</p>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[var(--color-neutro-400)] flex-shrink-0" />
              <p className="text-[13px] text-[var(--color-neutro-700)]">{e.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[var(--color-neutro-400)] flex-shrink-0" />
              <p className="text-[13px] text-[var(--color-neutro-700)]">{e.sitioWeb}</p>
            </div>
            <div><p className="text-[12px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide">País</p><p className="text-[13px] text-[var(--color-neutro-700)]">{e.pais}</p></div>
          </div>
        </div>

        {/* Business Profile Card */}
        <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m p-4">
          <div className="flex items-center gap-2 mb-3">
            <BadgeCheck className="w-4 h-4 text-[var(--color-neutro-500)]" />
            <h3 className="text-[13px] font-bold text-[var(--color-neutro-900)]">Perfil de Negocio</h3>
          </div>
          <div className="space-y-3">
            <div><p className="text-[12px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide">Tipo de Empresa</p>
              <span className={`inline-flex items-center gap-1 text-[12px] font-semibold px-2 py-0.5 rounded-corner-m mt-1 ${tipoInfo.color}`}>
                <TipoIcon className="w-3.5 h-3.5" />{tipoInfo.label}
              </span>
            </div>
            <div><p className="text-[12px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide">Subtipo</p><p className="text-[13px] text-[var(--color-neutro-700)]">{e.subTipo}</p></div>
            <div><p className="text-[12px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide">Organismo Regulador</p><p className="text-[13px] text-[var(--color-neutro-600)]">{e.organismoRegulador}</p></div>
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-[12px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide">Licencia</p><p className="text-[13px] font-mono text-[var(--color-neutro-700)]">{e.licencia}</p></div>
              <div><p className="text-[12px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide">Registro</p><p className="text-[13px] text-[var(--color-neutro-700)]">{e.fechaRegistro}</p></div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: COE Subscription + COENGINE + Modules */}
      <div className="grid grid-cols-3 gap-4">
        {/* COE Contract Card */}
        <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m p-4">
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="w-4 h-4 text-[var(--color-neutro-500)]" />
            <h3 className="text-[13px] font-bold text-[var(--color-neutro-900)]">Suscripción COE Suite</h3>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-[12px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide">Plan</p><p className="text-[13px] font-semibold text-[var(--color-neutro-900)]">{c.plan}</p></div>
              <div><p className="text-[12px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide">Contrato</p><p className="text-[13px] font-mono text-[var(--color-neutro-700)]">{c.contrato}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-[12px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide">Inicio</p><p className="text-[13px] text-[var(--color-neutro-700)]">{c.fechaInicio}</p></div>
              <div><p className="text-[12px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide">Renovación</p><p className="text-[13px] text-[var(--color-neutro-700)]">{c.fechaRenovacion}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-[12px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide">Versión</p><p className="text-[13px] text-[var(--color-neutro-700)]">v{c.version}</p></div>
              <div><p className="text-[12px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide">Soporte</p><p className="text-[13px] text-[var(--color-neutro-700)]">{c.soporte}</p></div>
            </div>
            <div><p className="text-[12px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide">Contacto Comercial</p><p className="text-[13px] text-[var(--color-neutro-600)]">{c.contactoComercial}</p></div>
          </div>
        </div>

        {/* COENGINE Plan Card */}
        <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m p-4">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-4 h-4 text-[var(--color-neutro-500)]" />
            <h3 className="text-[13px] font-bold text-[var(--color-neutro-900)]">COENGINE</h3>
            <span className="text-[12px] font-semibold px-2 py-0.5 rounded-corner-m bg-green-100 text-green-700 ml-auto">Activo</span>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-[12px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide">Plan</p><p className="text-[13px] font-semibold text-[var(--color-neutro-900)]">{COENGINE_PLAN.plan}</p></div>
              <div><p className="text-[12px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide">Versión</p><p className="text-[13px] text-[var(--color-neutro-700)]">v{COENGINE_PLAN.version}</p></div>
            </div>
            <div><p className="text-[12px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide">Motor</p><p className="text-[13px] font-mono text-[var(--color-neutro-700)]">{COENGINE_PLAN.motor}</p></div>
            <div><p className="text-[12px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide">Activación</p><p className="text-[13px] text-[var(--color-neutro-700)]">{COENGINE_PLAN.fechaActivacion}</p></div>
            <div>
              <p className="text-[12px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide mb-2">Modelos Contratados</p>
              <div className="space-y-1.5">
                {COENGINE_PLAN.modelos.map((m) => {
                  const MIcon = m.icon;
                  return (
                    <div key={m.nombre} className={`flex items-center gap-2 p-2 rounded-corner-m ${m.activo ? "bg-[var(--color-neutro-50)]" : "opacity-55"}`}>
                      <div className={`w-7 h-7 rounded-corner-m flex items-center justify-center ${m.activo ? "bg-[var(--color-verde-100)]" : "bg-[var(--color-neutro-200)]"}`}>
                        <MIcon className={`w-3.5 h-3.5 ${m.activo ? "text-white" : "text-[var(--color-neutro-400)]"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-[var(--color-neutro-900)]">{m.nombre}</p>
                        <p className="text-[12px] text-[var(--color-neutro-500)]">{m.desc}</p>
                      </div>
                      {m.activo ? (
                        <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                      ) : (
                        <span className="text-[12px] text-[var(--color-neutro-400)] font-medium">No contratado</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Activated Modules Card */}
        <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m p-4">
          <div className="flex items-center gap-2 mb-3">
            <Puzzle className="w-4 h-4 text-[var(--color-neutro-500)]" />
            <h3 className="text-[13px] font-bold text-[var(--color-neutro-900)]">Módulos Activados</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {modulos.map((mod) => {
              const ModIcon = mod.icon;
              return (
                <div key={mod.id} className={`flex items-center gap-2.5 p-2 rounded-corner-m border transition-colors ${mod.activo ? "bg-[var(--color-verde-100)]/5 border-[var(--color-verde-100)]/20" : "bg-[var(--color-neutro-50)] border-[var(--color-neutro-200)] opacity-55"}`}>
                  <div className={`w-8 h-8 rounded-corner-m flex items-center justify-center ${mod.activo ? "bg-[var(--color-verde-100)]" : "bg-[var(--color-neutro-200)]"}`}>
                    <ModIcon className={`w-4 h-4 ${mod.activo ? "text-white" : "text-[var(--color-neutro-400)]"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[var(--color-neutro-900)]">{mod.nombre}</p>
                    <p className="text-[12px] text-[var(--color-neutro-500)] truncate">{mod.descripcion}</p>
                  </div>
                  {mod.activo && <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
