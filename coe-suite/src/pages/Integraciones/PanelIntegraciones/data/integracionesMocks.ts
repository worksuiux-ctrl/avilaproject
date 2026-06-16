import type { IntegrationItem } from "./integracionesTypes";

export const INTEGRACIONES_MOCK: IntegrationItem[] = [
  {
    id: "int-bcv",
    nombre: "API Banco Central de Venezuela (BCV)",
    descripcion: "Consulta diaria automatizada de la tasa oficial de conversión monetaria para la actualización del cono de divisas.",
    tipo: "API",
    estado: "Activo",
    icon: "Landmark",
    color: "#1a5276",
  },
  {
    id: "int-maplibre",
    nombre: "MapLibre GL",
    descripcion: "Servicio de mapas de código abierto para la geolocalización y rastreo geográfico en tiempo real de las unidades de transporte y agencias.",
    tipo: "API / Librería",
    estado: "Activo",
    icon: "Map",
    color: "#2e86c1",
  },
  {
    id: "int-notificaciones",
    nombre: "Pasarela de Notificaciones (SMS/Push)",
    descripcion: "Despacho de alertas de seguridad, confirmaciones transaccionales rápidas y tokens de validación para los usuarios de la suite.",
    tipo: "Webhook",
    estado: "Activo",
    icon: "Bell",
    color: "#e67e22",
  },
  {
    id: "int-manifiestos",
    nombre: "Ingesta de Manifiestos CIT",
    descripcion: "Procesamiento por lotes e importación programada de los archivos de traslado de efectivo provenientes de las empresas de transporte de valores.",
    tipo: "ETL",
    estado: "Inactivo",
    icon: "FileInput",
    color: "#8e44ad",
  },
  {
    id: "int-sudeban",
    nombre: "Reportes Regulatorios SUDEBAN",
    descripcion: "Conexión cifrada para la disposición y envío de las estructuras de datos y balances obligatorios exigidos por el ente regulador.",
    tipo: "API / Intercambio seguro",
    estado: "Inactivo",
    icon: "ShieldCheck",
    color: "#c0392b",
  },
];
