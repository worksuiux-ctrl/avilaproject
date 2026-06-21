import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AuditNivel = "info" | "warn" | "security" | "error";
export type AuditTipo =
  | "login" | "logout"
  | "permiso_cambiado" | "usuario_invitado" | "usuario_eliminado"
  | "config_actualizada" | "parametro_cambiado"
  | "operacion_financiera" | "reporte_generado"
  | "excepcion_sistema" | "acceso_denegado";

export interface AuditEvento {
  id: string;
  timestamp: string;
  tipo: AuditTipo;
  nivel: AuditNivel;
  usuario: string;
  perfil: string;
  modulo: string;
  accion: string;
  detalle: string;
  ipAddress: string;
  userAgent: string;
}

interface AuditLogState {
  eventos: AuditEvento[];
  agregarEvento: (e: Omit<AuditEvento, "id" | "timestamp">) => void;
  limpiarEventos: () => void;
}

const TIPOS_LABEL: Record<AuditTipo, string> = {
  login: "Inicio de Sesión",
  logout: "Cierre de Sesión",
  permiso_cambiado: "Permiso Modificado",
  usuario_invitado: "Usuario Invitado",
  usuario_eliminado: "Usuario Eliminado",
  config_actualizada: "Configuración Actualizada",
  parametro_cambiado: "Parámetro Cambiado",
  operacion_financiera: "Operación Financiera",
  reporte_generado: "Reporte Generado",
  excepcion_sistema: "Excepción del Sistema",
  acceso_denegado: "Acceso Denegado",
};

const MODULOS = [
  "Dashboard", "Inventario", "War Room", "KPIs",
  "Operaciones", "Mesa de Conteo", "COENGINE",
  "Config/Unidades", "Config/Divisas", "Config/Proveedores",
  "Config/Clientes", "Config/Grupos", "Motor Transacciones",
  "Roles y Permisos", "Reportes", "Integraciones",
  "Georreferenciación", "Auditoría",
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generarMockEventos(): AuditEvento[] {
  const eventos: AuditEvento[] = [];
  const now = Date.now();

  const plantillas: Array<{ tipo: AuditTipo; nivel: AuditNivel; accion: string; detalle: string }> = [
    { tipo: "login", nivel: "info", accion: "Inicio de sesión exitoso", detalle: "Autenticación mediante credenciales de usuario" },
    { tipo: "login", nivel: "warn", accion: "Inicio de sesión desde IP no reconocida", detalle: "La IP 190.210.x.x no pertenece al rango habitual del usuario" },
    { tipo: "logout", nivel: "info", accion: "Cierre de sesión", detalle: "Sesión finalizada por el usuario" },
    { tipo: "acceso_denegado", nivel: "security", accion: "Intento de acceso a módulo restringido", detalle: "El usuario intentó acceder a Config/Divisas sin permisos de escritura" },
    { tipo: "acceso_denegado", nivel: "security", accion: "API key inválida", detalle: "Se rechazó solicitud con credenciales de integración expiradas" },
    { tipo: "permiso_cambiado", nivel: "security", accion: "Rol modificado", detalle: "Se cambió el rol de Operador Bóveda a Auditor para el usuario c.martinez@avila.com" },
    { tipo: "permiso_cambiado", nivel: "security", accion: "Permiso de módulo actualizado", detalle: "Se otorgó acceso de escritura a War Room para el rol Gerente de Bóveda" },
    { tipo: "usuario_invitado", nivel: "info", accion: "Nuevo usuario registrado", detalle: "Se creó cuenta para l.rodriguez@avila.com con rol Cajero / Taquillero" },
    { tipo: "usuario_eliminado", nivel: "security", accion: "Usuario desactivado", detalle: "Se desactivó cuenta de usuario j.custodio@cit.com por solicitud de Admin CIT" },
    { tipo: "config_actualizada", nivel: "info", accion: "Tasa de cambio actualizada", detalle: "Tasa USD/VES actualizada de 89,50 a 92,75 Bs/USD" },
    { tipo: "config_actualizada", nivel: "warn", accion: "Límite operativo modificado", detalle: "Límite máximo de depósito para Suc. Chacao aumentado de $50K a $75K" },
    { tipo: "config_actualizada", nivel: "info", accion: "Nueva unidad registrada", detalle: "Se creó la unidad Suc. Los Palos Grandes tipo Taquilla" },
    { tipo: "parametro_cambiado", nivel: "warn", accion: "Parámetro de seguridad modificado", detalle: "Política de contraseñas: longitud mínima cambiada de 8 a 12 caracteres" },
    { tipo: "parametro_cambiado", nivel: "warn", accion: "Timeout de sesión ajustado", detalle: "Tiempo de inactividad máximo reducido de 30 min a 15 min" },
    { tipo: "operacion_financiera", nivel: "info", accion: "Remesa creada", detalle: "Remesa REM-2026-0042 por $1,250,000.00 de Bóveda Principal a Suc. Chacao" },
    { tipo: "operacion_financiera", nivel: "info", accion: "Conteo completado", detalle: "Conteo de efectivo #CT-9837 finalizado. Total: $847,500.00 / Bs. 12,456,000.00" },
    { tipo: "operacion_financiera", nivel: "warn", accion: "Operación con excepción", detalle: "Remesa REM-2026-0038 marcó excepción por diferencia de conteo (-$1,250.00)" },
    { tipo: "reporte_generado", nivel: "info", accion: "Reporte regulatorio generado", detalle: "Reporte SUDEBAN R-01 (Posición de Efectivo) generado para el cierre mensual" },
    { tipo: "reporte_generado", nivel: "info", accion: "Exportación de datos", detalle: "Reporte personalizado 'Análisis de Movilidad' exportado a Excel" },
    { tipo: "excepcion_sistema", nivel: "error", accion: "Error en sincronización con Supabase", detalle: "Fallo al sincronizar tasa de cambio: timeout después de 30s" },
    { tipo: "excepcion_sistema", nivel: "error", accion: "Fallo en motor de reglas", detalle: "Excepción no controlada en regla de validación #VALID-04 (Límite de saldo)" },
    { tipo: "excepcion_sistema", nivel: "error", accion: "Error de conexión con API externa", detalle: "API del BCV no responde. Reintento 3/5 falló." },
    { tipo: "excepcion_sistema", nivel: "warn", accion: "Servicio de georreferenciación degradado", detalle: "Tile server de MapLibre respondiendo con latencia > 5s" },
    { tipo: "excepcion_sistema", nivel: "info", accion: "Caché de reportes invalidada", detalle: "Caché limpiada automáticamente tras actualización de datos maestros" },
  ];

  const usuarios = [
    { nombre: "Admin COE", perfil: "banco" },
    { nombre: "Carlos Martínez", perfil: "banco" },
    { nombre: "Orlando Guerrero", perfil: "banco" },
    { nombre: "Ana Mendoza", perfil: "banco" },
    { nombre: "Laura Rodríguez", perfil: "banco" },
    { nombre: "Admin CIT", perfil: "transportista" },
    { nombre: "Pedro Montero", perfil: "transportista" },
    { nombre: "Tesorero Corp.", perfil: "corporativo" },
    { nombre: "Analista BCV", perfil: "bcv" },
    { nombre: "Sistema COENGINE", perfil: "sistema" },
  ];

  const ips = [
    "190.210.45.23", "190.210.45.24", "190.210.46.100",
    "200.74.216.1", "200.74.216.2", "10.0.0.45", "10.0.0.88",
    "192.168.1.100", "192.168.2.50",
  ];

  for (let i = 0; i < 85; i++) {
    const plantilla = plantillas[i % plantillas.length];
    const usuario = randomItem(usuarios);
    const modulo = randomItem(MODULOS);
    const minutosAtras = Math.floor(Math.random() * 43200) + 1; // últimos 30 días
    const d = new Date(now - minutosAtras * 60 * 1000);

    eventos.push({
      id: `audit-${String(1000 + i)}`,
      timestamp: d.toLocaleString("es-VE"),
      tipo: plantilla.tipo,
      nivel: plantilla.nivel,
      usuario: usuario.nombre,
      perfil: usuario.perfil,
      modulo,
      accion: plantilla.accion,
      detalle: plantilla.detalle,
      ipAddress: randomItem(ips),
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
    });
  }

  eventos.sort((a, b) => {
    const da = new Date(a.timestamp).getTime();
    const db = new Date(b.timestamp).getTime();
    return db - da;
  });

  return eventos;
}

let eventIdCounter = 2000;
function nextId(): string {
  return `audit-${++eventIdCounter}`;
}

export { TIPOS_LABEL };

export const useAuditLogStore = create<AuditLogState>()(
  persist(
    (set) => ({
      eventos: generarMockEventos(),

      agregarEvento: (e) =>
        set((s) => ({
          eventos: [
            {
              ...e,
              id: nextId(),
              timestamp: new Date().toLocaleString("es-VE"),
            },
            ...s.eventos,
          ],
        })),

      limpiarEventos: () => set({ eventos: [] }),
    }),
    { name: "audit-log-store" }
  )
);
