import type { InterfaceItem, LogEntry } from "./interfacesTypes";

export const INTERFACES_MOCK: InterfaceItem[] = [
  {
    id: "int-saldos-atms",
    nombre: "Saldos ATMs",
    descripcion: "Sincroniza movimientos, dispensados y saldos de la red de cajeros automáticos para la planificación de abastecimiento.",
    icon: "Banknote",
    status: "started",
    formato: ".csv",
  },
  {
    id: "int-boveda-diaria",
    nombre: "Bóveda Diaria",
    descripcion: "Consolida e integra el inventario físico de efectivo resguardado en la bóveda central del banco.",
    icon: "Shield",
    status: "started",
    formato: ".txt",
  },
  {
    id: "int-contabilidad",
    nombre: "Contabilidad",
    descripcion: "Registra y genera los asientos contables automáticos de los movimientos de efectivo en el Core Bancario.",
    icon: "Calculator",
    status: "stopped",
    formato: ".json",
  },
  {
    id: "int-saldos-caja",
    nombre: "Saldos Caja",
    descripcion: "Cuadrante y lectura en tiempo real del efectivo en las taquillas de atención de las agencias.",
    icon: "Coins",
    status: "started",
    formato: ".csv",
  },
  {
    id: "int-remesas",
    nombre: "Carga Masiva de Remesas",
    descripcion: "Procesa los archivos de transferencias y envíos de efectivo realizados a través de las Empresas Transportistas de Valores (CIT).",
    icon: "Truck",
    status: "stopped",
    formato: ".csv",
  },
  {
    id: "int-orden-giro",
    nombre: "Orden de Giro",
    descripcion: "Gestiona y transmite las solicitudes de movimiento de fondos internos o aprobaciones interbancarias.",
    icon: "RefreshCw",
    status: "started",
    formato: ".json",
  },
  {
    id: "int-contadoras",
    nombre: "Contadoras",
    descripcion: "Conexión directa y lectura de datos lógicos provenientes de las máquinas físicas contadoras de billetes.",
    icon: "Cpu",
    status: "stopped",
    formato: ".txt",
  },
  {
    id: "int-terminal-financiero",
    nombre: "Terminal Financiero",
    descripcion: "Monitorea y gestiona las operaciones financieras que se encuentran pendientes de aplicar en la cola del Core.",
    icon: "Terminal",
    status: "started",
    formato: ".json",
  },
];

export const LOGS_MOCK: Record<string, LogEntry[]> = {
  "int-saldos-atms": [
    { id: "L-001", timestamp: "2026-06-14 08:15:23", tipo: "success", archivo: "saldos_atms_20260614.csv", detalle: "Archivo procesado correctamente. 1,250 registros sincronizados." },
    { id: "L-002", timestamp: "2026-06-14 07:45:10", tipo: "success", archivo: "saldos_atms_20260614.csv", detalle: "Conexión con Core establecida. Handshake OK." },
    { id: "L-003", timestamp: "2026-06-13 22:00:00", tipo: "success", archivo: "saldos_atms_20260613.csv", detalle: "Corte diario completado. 1,198 registros procesados." },
    { id: "L-004", timestamp: "2026-06-13 14:30:45", tipo: "business_error", archivo: "saldos_atms_20260613.csv", detalle: "Discrepancia en ATM-023: saldo lógico (850,000 VES) vs físico (852,500 VES). Diferencia: -2,500 VES." },
    { id: "L-005", timestamp: "2026-06-13 10:12:33", tipo: "syntax_error", archivo: "saldos_atms_20260613.csv", detalle: "Formato inválido en línea 47: campo 'monto' no es numérico. Registro omitido." },
    { id: "L-006", timestamp: "2026-06-12 18:05:00", tipo: "success", archivo: "saldos_atms_20260612.csv", detalle: "Archivo procesado correctamente. 1,305 registros sincronizados." },
  ],
  "int-boveda-diaria": [
    { id: "L-101", timestamp: "2026-06-14 06:00:00", tipo: "success", archivo: "boveda_20260614.txt", detalle: "Apertura de bóveda registrada. Saldo inicial: 12,500,000 VES." },
    { id: "L-102", timestamp: "2026-06-13 23:59:00", tipo: "success", archivo: "boveda_20260613.txt", detalle: "Cierre diario consolidado. Saldo final: 11,850,000 VES." },
    { id: "L-103", timestamp: "2026-06-13 16:20:15", tipo: "business_error", archivo: "boveda_20260613.txt", detalle: "Discrepancia en comprobante BOV-4432: ingreso registrado por 2,000,000 VES vs real 1,950,000 VES." },
  ],
  "int-contabilidad": [
    { id: "L-201", timestamp: "2026-06-14 09:00:00", tipo: "success", archivo: "asientos_20260614.json", detalle: "45 asientos contables generados y aplicados en el Core." },
    { id: "L-202", timestamp: "2026-06-13 17:30:00", tipo: "success", archivo: "asientos_20260613.json", detalle: "38 asientos contables generados y aplicados en el Core." },
    { id: "L-203", timestamp: "2026-06-12 11:45:22", tipo: "business_error", archivo: "asientos_20260612.json", detalle: "Cuenta contable 1.01.02.03 no encontrada en el catálogo. Asiento CON-4455 pendiente." },
    { id: "L-204", timestamp: "2026-06-11 08:30:10", tipo: "syntax_error", archivo: "asientos_20260611.json", detalle: "Error de parsing JSON en línea 128: falta una coma. Archivo rechazado." },
  ],
  "int-saldos-caja": [
    { id: "L-301", timestamp: "2026-06-14 08:00:00", tipo: "success", archivo: "caja_20260614.csv", detalle: "Lectura de 15 taquillas completada. Saldo agregado: 3,200,000 VES." },
    { id: "L-302", timestamp: "2026-06-14 07:30:00", tipo: "success", archivo: "caja_20260614.csv", detalle: "Conexión con servidor de agencias establecida." },
    { id: "L-303", timestamp: "2026-06-13 19:00:00", tipo: "success", archivo: "caja_20260613.csv", detalle: "Cuadre diario de caja: 0 diferencias." },
  ],
  "int-remesas": [
    { id: "L-401", timestamp: "2026-06-14 10:30:00", tipo: "success", archivo: "remesas_20260614.csv", detalle: "Archivo procesado. 85 envíos registrados por un total de 15,200,000 VES." },
    { id: "L-402", timestamp: "2026-06-13 15:00:00", tipo: "success", archivo: "remesas_20260613.csv", detalle: "Archivo procesado. 92 envíos registrados por un total de 18,500,000 VES." },
    { id: "L-403", timestamp: "2026-06-12 14:45:30", tipo: "business_error", archivo: "remesas_20260612.csv", detalle: "CIT Occidente no registrado como transportista activo. Envío REM-8890 rechazado." },
    { id: "L-404", timestamp: "2026-06-11 11:20:00", tipo: "syntax_error", archivo: "remesas_20260611.csv", detalle: "Formato de monto inválido en línea 23: '15.200.00' no es un número válido." },
  ],
  "int-orden-giro": [
    { id: "L-501", timestamp: "2026-06-14 11:00:00", tipo: "success", archivo: "giros_20260614.json", detalle: "3 órdenes de giro transmitidas al Core. Monto total: 5,500,000 VES." },
    { id: "L-502", timestamp: "2026-06-13 16:45:00", tipo: "success", archivo: "giros_20260613.json", detalle: "5 órdenes de giro transmitidas al Core. Monto total: 8,200,000 VES." },
    { id: "L-503", timestamp: "2026-06-12 09:30:15", tipo: "business_error", archivo: "giros_20260612.json", detalle: "Fondos insuficientes en cuenta origen para giro GIR-3344. Transacción rechazada." },
  ],
  "int-contadoras": [
    { id: "L-601", timestamp: "2026-06-14 08:30:00", tipo: "success", archivo: "contadoras_20260614.txt", detalle: "Lectura de 8 máquinas contadoras completada. 1,500,000 billetes contabilizados." },
    { id: "L-602", timestamp: "2026-06-13 10:15:00", tipo: "success", archivo: "contadoras_20260613.txt", detalle: "Lectura de 8 máquinas contadoras completada. 1,450,000 billetes contabilizados." },
    { id: "L-603", timestamp: "2026-06-12 14:20:30", tipo: "business_error", archivo: "contadoras_20260612.txt", detalle: "Máquina CNT-04 reportó error de conteo: sensor atascado. Lectura parcial: 180,000 billetes." },
  ],
  "int-terminal-financiero": [
    { id: "L-701", timestamp: "2026-06-14 06:00:00", tipo: "success", archivo: "terminal_20260614.json", detalle: "Cola de operaciones financieras: 12 pendientes, 0 en proceso." },
    { id: "L-702", timestamp: "2026-06-14 05:00:00", tipo: "success", archivo: "terminal_20260614.json", detalle: "Procesamiento batch nocturno completado. 45 operaciones aplicadas." },
    { id: "L-703", timestamp: "2026-06-13 22:00:00", tipo: "success", archivo: "terminal_20260613.json", detalle: "Cierre de lote diario: 230 operaciones procesadas. 3 rechazos." },
    { id: "L-704", timestamp: "2026-06-13 15:30:00", tipo: "business_error", archivo: "terminal_20260613.json", detalle: "Operación FIN-9821 rechazada: límite de monto excedido para la cuenta ORG-445." },
    { id: "L-705", timestamp: "2026-06-12 09:00:15", tipo: "syntax_error", archivo: "terminal_20260612.json", detalle: "Identificador de cuenta inválido en operación FIN-9788: 'CUENTA-X' no cumple formato estándar." },
  ],
};
