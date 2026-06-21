import React, { useState } from "react";
import {
  Plus, Search, Pencil, Shield, Users, UserCheck,
  Eye, Lock, Unlock, ChevronRight, UserPlus, Mail, LogIn,
  Landmark, Truck, Building, GitCompare
} from "lucide-react";
import { Button, Select, Input } from "@coe/design-system";

/* ── ACTORS ── */
const ACTORS = [
  { key: "banco", label: "Banco", icon: Landmark, color: "var(--color-verde-600)" },
  { key: "cit", label: "Transportista", icon: Truck, color: "var(--amber)" },
  { key: "corp", label: "Corporativo", icon: Building, color: "var(--purple)" },
  { key: "bcv", label: "BCV", icon: Landmark, color: "var(--teal)" },
] as const;
type ActorKey = (typeof ACTORS)[number]["key"];

/* ── USERS ── */
interface LegacyUser {
  id: string; initials: string; nombre: string; email: string;
  rol: string; actor: ActorKey; unidadNombre: string; color: string; activo: boolean;
}

const USERS_DEMO: LegacyUser[] = [
  { id: "u1", initials: "AM", nombre: "COE User", email: "admin@avila.com", rol: "Super Admin", actor: "banco", unidadNombre: "Bóveda Principal HQ", color: "#16a34a", activo: true },
  { id: "u2", initials: "CM", nombre: "Carlos Martínez", email: "c.martinez@avila.com", rol: "Gerente de Bóveda", actor: "banco", unidadNombre: "Suc. Chacao", color: "#16a34a", activo: true },
  { id: "u3", initials: "OG", nombre: "Orlando Guerrero", email: "o.guerrero@avila.com", rol: "Operador Bóveda", actor: "banco", unidadNombre: "Suc. Altamira", color: "#3b82f6", activo: true },
  { id: "u4", initials: "LR", nombre: "Laura Rodríguez", email: "l.rodriguez@avila.com", rol: "Cajero / Taquillero", actor: "banco", unidadNombre: "Taquilla Chacao 01", color: "#3b82f6", activo: true },
  { id: "u5", initials: "AM", nombre: "Ana Mendoza", email: "a.mendoza@avila.com", rol: "Auditor", actor: "banco", unidadNombre: "Bóveda Principal HQ", color: "#8b5cf6", activo: true },
  { id: "u6", initials: "BN", nombre: "B. Nacional CIT", email: "ops@bnacional-cit.com", rol: "Admin CIT", actor: "cit", unidadNombre: "Flota Caracas Norte", color: "#f59e0b", activo: true },
  { id: "u7", initials: "JC", nombre: "Juan Custodio", email: "j.custodio@cit.com", rol: "Custodio / Conductor", actor: "cit", unidadNombre: "Unidad V-055", color: "#f59e0b", activo: true },
  { id: "u8", initials: "PM", nombre: "Pedro Montero", email: "p.montero@cit.com", rol: "Jefe de Operaciones", actor: "cit", unidadNombre: "Base Caracas", color: "#f59e0b", activo: true },
  { id: "u9", initials: "GC", nombre: "Grupo Casino", email: "tesoreria@casino.com", rol: "Tesorero Corp.", actor: "corp", unidadNombre: "Casino Gran Caracas CA", color: "#a855f7", activo: true },
  { id: "u10", initials: "SR", nombre: "Superc. Royal", email: "caja@royal.com", rol: "Autorizado", actor: "corp", unidadNombre: "Supermercados Royal CA", color: "#a855f7", activo: true },
  { id: "u11", initials: "BA", nombre: "Analista BCV", email: "analista@bcv.org.ve", rol: "Analista BCV", actor: "bcv", unidadNombre: "BCV — Banco Central", color: "#14b8a6", activo: true },
];

/* ── ROLES ── */
interface RoleDef {
  rol: string; desc: string; permisos: string[]; nivel: number; badge: string;
}

const ROLES_DEMO: Record<ActorKey, RoleDef[]> = {
  banco: [
    { rol: "Super Admin", nivel: 1, badge: "bg-red-100 text-red-700", desc: "Acceso total al sistema. Configura roles, límites y todos los módulos.", permisos: ["Dashboard", "KPIs", "Operaciones", "Inventario", "Reportes", "Configuraciones", "Usuarios"] },
    { rol: "Gerente de Bóveda", nivel: 2, badge: "bg-orange-100 text-orange-700", desc: "Gestión de su unidad. Aprueba ops ≥ $50K. Reportes de su unidad.", permisos: ["Operaciones", "Inventario (unidad)", "Reportes (unidad)", "Aprobaciones"] },
    { rol: "Operador Bóveda", nivel: 3, badge: "bg-blue-100 text-blue-700", desc: "Registra operaciones y movimientos de su unidad asignada.", permisos: ["Operaciones", "Inventario (unidad)"] },
    { rol: "Cajero / Taquillero", nivel: 3, badge: "bg-blue-100 text-blue-700", desc: "Acceso exclusivo a Terminal de su taquilla. Apertura, movimientos y cuadre.", permisos: ["Terminal (su taquilla)"] },
    { rol: "Auditor", nivel: 5, badge: "bg-gray-100 text-gray-600", desc: "Solo lectura en todos los módulos. No registra operaciones.", permisos: ["Dashboard (L)", "Reportes (L)", "Transacciones (L)"] },
  ],
  cit: [
    { rol: "Admin CIT", nivel: 1, badge: "bg-red-100 text-red-700", desc: "Gestión completa de flota, tarifarios, manifiestos y custodios.", permisos: ["Flota", "Manifiestos", "Tarifarios", "Custodios", "Reportes CIT"] },
    { rol: "Jefe de Operaciones", nivel: 2, badge: "bg-orange-100 text-orange-700", desc: "Asignación de rutas y seguimiento de unidades activas.", permisos: ["Manifiestos", "Asignación de rutas", "Seguimiento flota"] },
    { rol: "Custodio / Conductor", nivel: 3, badge: "bg-blue-100 text-blue-700", desc: "Solo sus manifiestos activos y confirmación de entregas.", permisos: ["Mis Manifiestos (activos)"] },
  ],
  corp: [
    { rol: "Admin Corp.", nivel: 1, badge: "bg-red-100 text-red-700", desc: "Portal corporativo completo. Posición global y configuración.", permisos: ["Portal Completo", "Posición", "Solicitudes", "Contratos"] },
    { rol: "Tesorero Corp.", nivel: 2, badge: "bg-orange-100 text-orange-700", desc: "Movimientos de efectivo, posición y solicitudes. Aprueba operaciones internas.", permisos: ["Movimientos", "Posición", "Solicitudes"] },
    { rol: "Autorizado", nivel: 3, badge: "bg-blue-100 text-blue-700", desc: "Crea solicitudes de depósito o retiro. Requiere aprobación superior.", permisos: ["Solicitudes (solo crear)"] },
  ],
  bcv: [
    { rol: "Admin BCV", nivel: 1, badge: "bg-red-100 text-red-700", desc: "Acceso total a reportes regulatorios, encaje y emisión.", permisos: ["Reportes Regulatorios", "Encaje", "Emisión", "Dashboard"] },
    { rol: "Analista BCV", nivel: 4, badge: "bg-purple-100 text-purple-700", desc: "Solo lectura en reportes regulatorios. Sin acceso a datos operativos del banco.", permisos: ["Reportes Reg. (L)"] },
  ],
};

/* ── MODULES & SECTIONS (for permission matrix) ── */
interface Section { name: string; id: string }
interface ModuleDef { name: string; id: string; sections: Section[] }

const ALL_MODULES: ModuleDef[] = [
  { name: "Inicio", id: "inicio", sections: [{ name: "Panel General", id: "panel" }, { name: "Inventario", id: "inv" }, { name: "War Room · Tesorería", id: "warroom" }, { name: "KPIs Estratégicos", id: "kpi" }] },
  { name: "Operaciones", id: "ops", sections: [{ name: "Panel de Operaciones", id: "ops-panel" }, { name: "Mesa de Conteo", id: "conteo" }] },
  { name: "COENGINE", id: "coengine", sections: [{ name: "Configuración del Engine", id: "coengine-config" }, { name: "Actividad del Engine", id: "coengine-activity" }] },
  { name: "Reportes", id: "reportes", sections: [{ name: "Reportes Operativos", id: "rep-ops" }, { name: "Reportes Regulatorios", id: "rep-reg" }] },
  { name: "Configuración", id: "config", sections: [{ name: "Unidades", id: "cfg-unidades" }, { name: "Divisas", id: "cfg-divisas" }, { name: "Clientes", id: "cfg-clientes" }, { name: "Grupos", id: "cfg-grupos" }] },
  { name: "Auditoría y Seguridad", id: "audit", sections: [{ name: "Log de Auditoría", id: "audit-log" }] },
  { name: "Georreferenciación", id: "georef", sections: [{ name: "Mapa Interactivo", id: "georef-map" }] },
  { name: "Roles y Permisos", id: "roles", sections: [{ name: "Gestión de Roles", id: "roles-main" }] },
];

/* ── Permission presets per role for the matrix ── */
type AccessLevel = "Escritura" | "Lectura" | "Denegado";
const ACCESS_LEVELS: AccessLevel[] = ["Escritura", "Lectura", "Denegado"];

const PERMISO_PRESETS: Record<string, Record<string, AccessLevel>> = {
  "Super Admin":     { panel: "Escritura", inv: "Escritura", warroom: "Escritura", kpi: "Escritura", "ops-panel": "Escritura", conteo: "Escritura", "coengine-config": "Escritura", "coengine-activity": "Escritura", "rep-ops": "Escritura", "rep-reg": "Escritura", "cfg-unidades": "Escritura", "cfg-divisas": "Escritura", "cfg-clientes": "Escritura", "cfg-grupos": "Escritura", "audit-log": "Escritura", "georef-map": "Escritura", "roles-main": "Escritura" },
  "Gerente de Bóveda": { panel: "Lectura", inv: "Escritura", warroom: "Lectura", kpi: "Lectura", "ops-panel": "Escritura", conteo: "Escritura", "coengine-config": "Denegado", "coengine-activity": "Lectura", "rep-ops": "Escritura", "rep-reg": "Denegado", "cfg-unidades": "Lectura", "cfg-divisas": "Denegado", "cfg-clientes": "Lectura", "cfg-grupos": "Denegado", "audit-log": "Denegado", "georef-map": "Denegado", "roles-main": "Denegado" },
  "Operador Bóveda": { panel: "Lectura", inv: "Escritura", warroom: "Denegado", kpi: "Denegado", "ops-panel": "Escritura", conteo: "Escritura", "coengine-config": "Denegado", "coengine-activity": "Denegado", "rep-ops": "Lectura", "rep-reg": "Denegado", "cfg-unidades": "Denegado", "cfg-divisas": "Denegado", "cfg-clientes": "Denegado", "cfg-grupos": "Denegado", "audit-log": "Denegado", "georef-map": "Denegado", "roles-main": "Denegado" },
  "Auditor":         { panel: "Lectura", inv: "Lectura", warroom: "Lectura", kpi: "Lectura", "ops-panel": "Lectura", conteo: "Lectura", "coengine-config": "Lectura", "coengine-activity": "Lectura", "rep-ops": "Lectura", "rep-reg": "Lectura", "cfg-unidades": "Lectura", "cfg-divisas": "Lectura", "cfg-clientes": "Lectura", "cfg-grupos": "Lectura", "audit-log": "Escritura", "georef-map": "Lectura", "roles-main": "Lectura" },
};

/* ── Helpers ── */
const ACCESO_CLASS: Record<AccessLevel, string> = {
  Escritura: "bg-green-100 text-green-700",
  Lectura: "bg-yellow-100 text-yellow-700",
  Denegado: "bg-red-100 text-red-700",
};

const ACCESO_ICON: Record<AccessLevel, typeof Unlock> = {
  Escritura: Unlock, Lectura: Eye, Denegado: Lock,
};

const _actorColorBg: Record<ActorKey, string> = {
  banco: "var(--color-verde-100)", cit: "rgba(251,191,36,.15)",
  corp: "rgba(168,85,247,.12)", bcv: "rgba(20,184,166,.12)",
};

const _actorColorText: Record<ActorKey, string> = {
  banco: "var(--color-verde-700)", cit: "#b45309",
  corp: "#7c3aed", bcv: "#0d9488",
};

/* ════════════════════════════════════════════
   Role Detail Modal (with Permission Matrix)
   ════════════════════════════════════════════ */
function RoleDetailModal({ role, actor, onClose }: { role: RoleDef; actor: ActorKey; onClose: () => void }) {
  const [subTab, setSubTab] = useState<"detalle" | "matriz">("detalle");
  const matrix = PERMISO_PRESETS[role.rol];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-corner-m shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-neutro-200)] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-[15px] font-bold text-[var(--color-neutro-900)]">{role.rol}</h2>
              <p className="text-[11px] text-[var(--color-neutro-500)]">Rol de {ACTORS.find((a) => a.key === actor)?.label}</p>
            </div>
          </div>
          <button className="p-1 rounded-corner-m hover:bg-[var(--color-neutro-100)] text-[var(--color-neutro-400)]" onClick={onClose}>✕</button>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-1 px-6 py-2 border-b border-[var(--color-neutro-200)] bg-[var(--color-neutro-50)] flex-shrink-0">
          {([{ key: "detalle", label: "Detalles del Rol", icon: UserCheck }, { key: "matriz", label: "Matriz de Permisos", icon: Shield }] as const).map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.key} onClick={() => setSubTab(t.key)}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-semibold rounded-corner-m transition-all ${subTab === t.key ? "bg-white text-[var(--color-neutro-900)] shadow-sm" : "text-[var(--color-neutro-500)] hover:text-[var(--color-neutro-700)]"}`}>
                <Icon className="w-3.5 h-3.5" />{t.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {subTab === "detalle" && (
            <div className="space-y-5">
              <div>
                <p className="text-[12px] font-semibold text-[var(--color-neutro-700)] mb-1">Descripción</p>
                <p className="text-[13px] text-[var(--color-neutro-600)] leading-relaxed">{role.desc}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[var(--color-neutro-50)] rounded-corner-m p-3 border border-[var(--color-neutro-200)]">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-neutro-500)] mb-1">Nivel de Acceso</p>
                  <span className={`text-[12px] font-semibold px-2 py-0.5 rounded-corner-m ${role.badge}`}>Nivel {role.nivel}</span>
                </div>
                <div className="bg-[var(--color-neutro-50)] rounded-corner-m p-3 border border-[var(--color-neutro-200)]">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-neutro-500)] mb-1">Actores</p>
                  <p className="text-[12px] font-semibold text-[var(--color-neutro-700)]">{ACTORS.find((a) => a.key === actor)?.label}</p>
                </div>
              </div>

              <div>
                <p className="text-[12px] font-semibold text-[var(--color-neutro-700)] mb-2">Usuarios con este rol</p>
                <div className="space-y-2">
                  {USERS_DEMO.filter((u) => u.rol === role.rol && u.actor === actor).map((u) => (
                    <div key={u.id} className="flex items-center gap-3 p-2 rounded-corner-m bg-[var(--color-neutro-50)] border border-[var(--color-neutro-200)]">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0" style={{ background: u.color }}>{u.initials}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-[var(--color-neutro-900)] truncate">{u.nombre}</p>
                        <p className="text-[10px] text-[var(--color-neutro-500)] truncate">{u.unidadNombre}</p>
                      </div>
                      <span className="text-[10px] font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-corner-m">Activo</span>
                    </div>
                  ))}
                  {USERS_DEMO.filter((u) => u.rol === role.rol && u.actor === actor).length === 0 && (
                    <p className="text-[12px] text-[var(--color-neutro-400)] italic">No hay usuarios asignados a este rol</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--color-neutro-200)]">
                <Button variant="outline" size="sm" onClick={onClose}>Cerrar</Button>
                <Button size="sm" onClick={() => setSubTab("matriz")} iconRight={<ChevronRight className="w-3.5 h-3.5" />}>Ver Matriz de Permisos</Button>
              </div>
            </div>
          )}

          {subTab === "matriz" && (
            <div className="space-y-6">
              <p className="text-[12px] text-[var(--color-neutro-500)]">
                Niveles de acceso para <strong className="text-[var(--color-neutro-900)]">{role.rol}</strong> por módulo y sección:
              </p>
              {ALL_MODULES.map((mod) => (
                <div key={mod.id}>
                  <p className="text-[12px] font-bold text-[var(--color-neutro-900)] mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-verde-100)]" />
                    {mod.name}
                  </p>
                  <div className="space-y-1 ml-3">
                    {mod.sections.map((sec) => {
                      const acceso = matrix?.[sec.id] ?? "Denegado";
                      const AccIcon = ACCESO_ICON[acceso];
                      return (
                        <div key={sec.id} className="flex items-center justify-between py-1.5 px-3 rounded-corner-m hover:bg-[var(--color-neutro-50)] transition-colors">
                          <span className="text-[12px] text-[var(--color-neutro-600)]">{sec.name}</span>
                          <div className="flex items-center gap-1.5">
                            {ACCESS_LEVELS.map((lvl) => {
                              const isActive = lvl === acceso;
                              const lvlColor = isActive ? ACCESO_CLASS[lvl] : "text-[var(--color-neutro-300)]";
                              const LvlIcon = ACCESO_ICON[lvl];
                              return (
                                <span key={lvl} className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-corner-m transition-all ${lvlColor} ${isActive ? "" : "opacity-40"}`}>
                                  <LvlIcon className="w-3 h-3" />{lvl}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--color-neutro-200)]">
                <Button variant="outline" size="sm" onClick={onClose}>Cerrar</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   Simple generic form modal
   ════════════════════════════════════════════ */
function FormModal({ title, actor: _actor, children, onClose }: { title: string; actor: ActorKey; children?: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-corner-m shadow-xl w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-neutro-200)]">
          <h2 className="text-[15px] font-bold text-[var(--color-neutro-900)]">{title}</h2>
          <button className="p-1 rounded-corner-m hover:bg-[var(--color-neutro-100)] text-[var(--color-neutro-400)]" onClick={onClose}>✕</button>
        </div>
        <div className="p-6 space-y-4">
          {children ?? (
            <p className="text-[13px] text-[var(--color-neutro-500)]">Formulario próximamente.</p>
          )}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--color-neutro-200)]">
            <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
            <Button size="sm" onClick={onClose}>Guardar</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   Role Comparator
   ════════════════════════════════════════════ */
function RoleComparator({ roles, selectedActor: _selectedActor, onClose }: { roles: RoleDef[]; selectedActor: ActorKey; onClose: () => void }) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleRole = (name: string) => {
    setSelected((prev) => prev.includes(name) ? prev.filter((r) => r !== name) : [...prev, name]);
  };

  const compareRoles = roles.filter((r) => selected.includes(r.rol));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-corner-m shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-neutro-200)] flex-shrink-0">
          <div className="flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-[var(--color-neutro-500)]" />
            <h2 className="text-[15px] font-bold text-[var(--color-neutro-900)]">Comparar Roles</h2>
          </div>
          <button className="p-1 rounded-corner-m hover:bg-[var(--color-neutro-100)] text-[var(--color-neutro-400)]" onClick={onClose}>✕</button>
        </div>

        <div className="p-5 border-b border-[var(--color-neutro-200)] flex-shrink-0">
          <p className="text-[12px] text-[var(--color-neutro-500)] mb-3">Selecciona al menos 2 roles para comparar sus permisos:</p>
          <div className="flex flex-wrap gap-2">
            {roles.map((r) => {
              const isOn = selected.includes(r.rol);
              return (
                <button key={r.rol} onClick={() => toggleRole(r.rol)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-[12px] font-semibold rounded-corner-m border transition-all cursor-pointer ${
                    isOn ? "border-[var(--color-verde-100)] bg-[var(--color-verde-100)]/5 text-[var(--color-verde-100)]" : "border-[var(--color-neutro-200)] text-[var(--color-neutro-500)] hover:border-[var(--color-neutro-300)]"
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center transition-all ${isOn ? "bg-[var(--color-verde-100)] border-[var(--color-verde-100)]" : "border-[var(--color-neutro-300)]"}`}>
                    {isOn && <span className="text-white text-[9px] font-bold">✓</span>}
                  </span>
                  <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-corner-m ${r.badge}`}>{r.rol}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {compareRoles.length < 2 ? (
            <div className="flex items-center justify-center py-16 text-[13px] text-[var(--color-neutro-400)]">
              Selecciona al menos dos roles para ver la comparativa
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr>
                    <th className="text-left px-3 py-2 text-[11px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide border-b border-[var(--color-neutro-200)] bg-[var(--color-neutro-50)] sticky top-0">Módulo / Sección</th>
                    {compareRoles.map((r) => (
                      <th key={r.rol} className="text-center px-3 py-2 border-b border-[var(--color-neutro-200)] bg-[var(--color-neutro-50)] sticky top-0 min-w-[130px]">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-corner-m ${r.badge}`}>{r.rol}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ALL_MODULES.map((mod) => (
                    <React.Fragment key={mod.id}>
                      <tr>
                        <td colSpan={compareRoles.length + 1} className="px-3 py-2 text-[11px] font-bold text-[var(--color-neutro-900)] bg-[var(--color-neutro-50)] border-b border-[var(--color-neutro-200)]">
                          <div className="flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-[var(--color-verde-100)]" />
                            {mod.name}
                          </div>
                        </td>
                      </tr>
                      {mod.sections.map((sec) => (
                        <tr key={sec.id} className="border-b border-[var(--color-neutro-100)] hover:bg-[var(--color-neutro-50)] transition-colors">
                          <td className="px-3 py-2 text-[12px] text-[var(--color-neutro-600)] pl-6">{sec.name}</td>
                          {compareRoles.map((r) => {
                            const acceso = PERMISO_PRESETS[r.rol]?.[sec.id] ?? "Denegado";
                      const _AccIcon = ACCESO_ICON[acceso];
                            return (
                              <td key={r.rol} className="px-3 py-2 text-center">
                                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-corner-m ${ACCESO_CLASS[acceso]}`}>
                                  <AccIcon className="w-3 h-3" />{acceso}
                                </span>
                              </td>
                            );
                        })}
                      </tr>
                    ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end px-6 py-3 border-t border-[var(--color-neutro-200)] flex-shrink-0">
          <Button size="sm" onClick={onClose}>Cerrar</Button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   Main RolesPermisos Page
   ════════════════════════════════════════════ */
export function RolesPermisos() {
  const [actor, setActor] = useState<ActorKey>("banco");
  const [userSearch, setUserSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState<RoleDef | null>(null);
  const [modalType, setModalType] = useState<"none" | "invitar" | "nuevo-rol" | "editar-usuario" | "comparar">("none");
  const [editingUser, setEditingUser] = useState<LegacyUser | null>(null);
  const [_compareSelection, setCompareSelection] = useState<string[]>([]);

  const users = USERS_DEMO.filter((u) => u.actor === actor);
  const roles = ROLES_DEMO[actor];

  const filteredUsers = userSearch
    ? users.filter((u) => u.nombre.toLowerCase().includes(userSearch.toLowerCase()) || u.rol.toLowerCase().includes(userSearch.toLowerCase()) || u.unidadNombre.toLowerCase().includes(userSearch.toLowerCase()))
    : users;

  const _onColor = ACTORS.find((a) => a.key === actor)!;

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-[18px] font-bold text-[var(--color-neutro-900)]">Roles y Permisos</h1>
          <p className="text-[13px] text-[var(--color-neutro-500)]">Perfilamiento de usuarios, grupos y control de acceso al sistema</p>
        </div>
      </div>

      {/* ── Actor Navigation Tabs (Motor Transacciones style) ── */}
      <div className="flex items-center gap-1 mb-4 border-b border-[var(--color-neutro-200)]">
        {ACTORS.map((a) => {
          const Icon = a.icon;
          return (
            <button key={a.key} onClick={() => { setActor(a.key); setUserSearch(""); setSelectedRole(null); }}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors cursor-pointer ${
                actor === a.key
                  ? "border-[var(--color-verde-100)] text-[var(--color-verde-100)]"
                  : "border-transparent text-[var(--color-neutro-500)] hover:text-[var(--color-neutro-700)] hover:border-[var(--color-neutro-300)]"
              }`}
            >
              <Icon className="w-4 h-4" />
              {a.label}
            </button>
          );
        })}
        <div className="flex-1" />
        <Button size="sm" variant="outline" onClick={() => setModalType("invitar")} iconLeft={<UserPlus className="w-6 h-6" />}>
          Invitar Usuario
        </Button>
      </div>

      {/* ── Two-panel Layout ── */}
      <div className="grid grid-cols-[1.5fr_1fr] gap-4 flex-1 min-h-0">
        {/* PANEL IZQUIERDO: Usuarios */}
        <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-neutro-200)] bg-[var(--color-neutro-50)] flex-shrink-0">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[var(--color-neutro-500)]" />
              <h3 className="text-[13px] font-bold text-[var(--color-neutro-900)]">Usuarios</h3>
              <span className="text-[10px] font-semibold bg-[var(--color-verde-100)] text-white px-2 py-0.5 rounded-corner-m">{users.length} activos</span>
            </div>
            <div className="max-w-[200px]">
              <Input
                prefix={<Search className="w-3.5 h-3.5" />}
                placeholder="Buscar usuario..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-[13px]">
              <thead className="bg-[var(--color-neutro-50)] text-[12px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide sticky top-0">
                <tr>
                  <th className="text-left px-4 py-3">Usuario</th>
                  <th className="text-left px-4 py-3">Rol</th>
                  <th className="text-left px-4 py-3">Unidad</th>
                  <th className="text-center px-4 py-3 w-[60px]">Estado</th>
                  <th className="text-right px-4 py-3 w-[90px]">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-12 text-[var(--color-neutro-400)]">No hay usuarios para este actor</td></tr>
                ) : filteredUsers.map((u) => (
                  <tr key={u.id} className="border-t border-[var(--color-neutro-100)] hover:bg-[var(--color-neutro-50)] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0" style={{ background: u.color }}>{u.initials}</div>
                        <div className="min-w-0">
                          <p className="text-[12px] font-semibold text-[var(--color-neutro-900)] truncate">{u.nombre}</p>
                          <p className="text-[10px] text-[var(--color-neutro-500)] truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-corner-m ${roles.find((r) => r.rol === u.rol)?.badge ?? "bg-gray-100 text-gray-600"}`}>{u.rol}</span>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-[var(--color-neutro-600)]">{u.unidadNombre}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block w-2 h-2 rounded-full ${u.activo ? "bg-green-500" : "bg-red-400"}`} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-0.5">
                        <button className="p-1.5 rounded-corner-m hover:bg-[var(--color-verde-100)]/10 text-[var(--color-verde-600)] transition-colors" title="Simular sesión"
                          onClick={() => {}}>
                          <LogIn className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 rounded-corner-m hover:bg-[var(--color-neutro-100)] text-[var(--color-neutro-400)] transition-colors" title="Editar usuario"
                          onClick={() => { setEditingUser(u); setModalType("editar-usuario"); }}>
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* PANEL DERECHO: Roles */}
        <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-neutro-200)] bg-[var(--color-neutro-50)] flex-shrink-0">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[var(--color-neutro-500)]" />
              <h3 className="text-[13px] font-bold text-[var(--color-neutro-900)]">Roles</h3>
              <span className="text-[10px] font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-corner-m">{roles.length} definidos</span>
            </div>
            <button onClick={() => { setCompareSelection([]); setModalType("comparar"); }}
              className="flex items-center gap-1 text-[11px] font-semibold text-[var(--color-neutro-500)] hover:text-[var(--color-verde-100)] transition-colors cursor-pointer bg-transparent border-none"
            >
              <GitCompare className="w-3.5 h-3.5" /> Comparar
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {roles.map((r) => (
              <button key={r.rol} onClick={() => setSelectedRole(r)}
                className="w-full text-left p-3.5 rounded-corner-m border border-[var(--color-neutro-200)] hover:border-[var(--color-verde-100)] hover:shadow-sm transition-all cursor-pointer bg-white"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-corner-m ${r.badge}`}>{r.rol}</span>
                </div>
                <p className="text-[11px] text-[var(--color-neutro-500)] leading-relaxed mb-3">{r.desc}</p>
                <div className="flex flex-wrap gap-1">
                  {r.permisos.map((p) => (
                    <span key={p} className="text-[9px] px-2 py-0.5 rounded-corner-m bg-[var(--color-neutro-100)] text-[var(--color-neutro-600)] font-medium">{p}</span>
                  ))}
                </div>
              </button>
            ))}
            <button onClick={() => setModalType("nuevo-rol")}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-corner-m border-2 border-dashed border-[var(--color-neutro-300)] hover:border-[var(--color-verde-100)] text-[var(--color-neutro-500)] hover:text-[var(--color-verde-100)] transition-all cursor-pointer text-[12px] font-semibold"
            >
              <Plus className="w-4 h-4" /> Agregar Rol
            </button>
          </div>
        </div>
      </div>

      {/* ── Role Detail Modal ── */}
      {selectedRole && (
        <RoleDetailModal role={selectedRole} actor={actor} onClose={() => setSelectedRole(null)} />
      )}

      {/* ── Invitar Usuario Modal ── */}
      {modalType === "invitar" && (
        <FormModal title="Invitar Usuario" actor={actor} onClose={() => setModalType("none")}>
          <Input label="Nombre completo" placeholder="Nombre y apellido" />
          <Input label="Correo electrónico" prefix={<Mail className="w-4 h-4" />} placeholder="usuario@correo.com" />
          <Select label="Rol a asignar" options={roles.map((r) => ({ value: r.rol, label: r.rol }))} value="" onChange={() => {}} />
          <Select label="Actor" options={ACTORS.map((a) => ({ value: a.key, label: a.label }))} value={actor} onChange={() => {}} />
          <Select label="Unidad asignada" options={[{ value: "hq", label: "Bóveda Principal HQ" }, { value: "ch", label: "Suc. Chacao" }, { value: "alt", label: "Suc. Altamira" }]} value="" onChange={() => {}} />
        </FormModal>
      )}

      {/* ── Nuevo Rol Modal ── */}
      {modalType === "nuevo-rol" && (
        <FormModal title="Nuevo Rol" actor={actor} onClose={() => setModalType("none")}>
          <Input label="Nombre del Rol" placeholder="Ej: Supervisor de Turno" />
          <Input label="Descripción" placeholder="Funciones y alcance del rol" />
          <Select label="Nivel de Acceso" options={[
            { value: "1", label: "Nivel 1 — Master" }, { value: "2", label: "Nivel 2 — Administrador" },
            { value: "3", label: "Nivel 3 — Operador" }, { value: "4", label: "Nivel 4 — Consultor" },
            { value: "5", label: "Nivel 5 — Auditor" },
          ]} value="" onChange={() => {}} />
          <div className="border border-[var(--color-neutro-200)] rounded-corner-m p-3 bg-[var(--color-neutro-50)]">
            <p className="text-[12px] font-semibold text-[var(--color-neutro-700)] mb-2">Permisos del Rol</p>
            <div className="space-y-1.5">
              {ALL_MODULES.map((mod) => (
                <label key={mod.id} className="flex items-center gap-2 text-[12px] text-[var(--color-neutro-600)] cursor-pointer">
                  <input type="checkbox" defaultChecked className="accent-[var(--color-verde-100)]" />
                  {mod.name}
                </label>
              ))}
            </div>
          </div>
        </FormModal>
      )}

      {/* ── Editar Usuario Modal ── */}
      {modalType === "editar-usuario" && editingUser && (
        <FormModal title={`Editar Usuario: ${editingUser.nombre}`} actor={actor} onClose={() => { setModalType("none"); setEditingUser(null); }}>
          <Input label="Nombre completo" value={editingUser.nombre} onChange={() => {}} />
          <Input label="Correo electrónico" value={editingUser.email} onChange={() => {}} />
          <Select label="Rol" options={roles.map((r) => ({ value: r.rol, label: r.rol }))} value={editingUser.rol} onChange={() => {}} />
          <Select label="Unidad asignada" options={[{ value: "hq", label: "Bóveda Principal HQ" }, { value: "ch", label: "Suc. Chacao" }]} value={editingUser.unidadNombre} onChange={() => {}} />
          <Select label="Estado" options={[{ value: "true", label: "Activo" }, { value: "false", label: "Inactivo" }]} value={editingUser.activo ? "true" : "false"} onChange={() => {}} />
        </FormModal>
      )}

      {/* ── Comparar Roles Modal ── */}
      {modalType === "comparar" && (
        <RoleComparator roles={roles} selectedActor={actor} onClose={() => setModalType("none")} />
      )}
    </div>
  );
}
