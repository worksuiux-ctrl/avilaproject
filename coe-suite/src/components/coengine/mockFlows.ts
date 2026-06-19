import type { Flow } from "./types";

export const COENGINE_FLOWS: Flow[] = [
  {
    id: "crear-ticket",
    title: "Crear un Ticket",
    steps: [
      {
        botMessage:
          "Perfecto, voy a ayudarte a crear un ticket. ¿Cuál es el tipo de incidencia?",
        quickReplies: [
          { id: "ticket-falla", label: "Falla Técnica" },
          { id: "ticket-solicitud", label: "Solicitud de Cambio" },
          { id: "ticket-consulta", label: "Consulta General" },
        ],
      },
      {
        botMessage:
          "Entendido. Por favor escribe una breve descripción de la incidencia en el campo de texto y adjunta cualquier evidencia (captura, documento) si la tienes. El ticket será registrado automáticamente.",
      },
    ],
  },
  {
    id: "soporte-tecnico",
    title: "Soporte Técnico",
    steps: [
      {
        botMessage:
          "Claro, estoy aquí para ayudarte con soporte técnico. ¿Con qué módulo necesitas asistencia?",
        quickReplies: [
          { id: "soporte-mapa", label: "Mapa / Georreferenciación" },
          { id: "soporte-operaciones", label: "Operaciones / Remesas" },
          { id: "soporte-reportes", label: "Reportes / Dashboard" },
          { id: "soporte-otros", label: "Otros" },
        ],
      },
      {
        botMessage:
          "Gracias. Un agente de soporte especializado será notificado. Mientras tanto, puedes describir tu problema en detalle y adjuntar evidencias.",
      },
    ],
  },
  {
    id: "reportar-falla",
    title: "Reportar Falla en Interfaz",
    steps: [
      {
        botMessage:
          "Lamento que tengas problemas con la interfaz. ¿Qué tipo de falla estás experimentando?",
        quickReplies: [
          { id: "falla-carga", label: "No carga / Pantalla en blanco" },
          { id: "falla-render", label: "Elementos desalineados" },
          { id: "falla-funcion", label: "Botones no funcionan" },
          { id: "falla-rendimiento", label: "Lentitud / Congelamiento" },
        ],
      },
      {
        botMessage:
          "Gracias por reportarlo. Si es posible, adjunta una captura de pantalla o un video corto mostrando el problema. El equipo de frontend lo revisará a la brevedad.",
      },
    ],
  },
  {
    id: "resolver-dura",
    title: "Resolver una Duda",
    steps: [
      {
        botMessage:
          "¡Claro! Resolveré tus dudas sobre la suite. ¿Sobre qué tema te gustaría saber más?",
        quickReplies: [
          { id: "duda-flujo", label: "Flujo de operaciones" },
          { id: "duda-permisos", label: "Roles y permisos" },
          { id: "duda-config", label: "Configuración del sistema" },
          { id: "duda-reportes", label: "Reportes y estadísticas" },
        ],
      },
      {
        botMessage:
          "Buena elección. Puedes consultar la documentación en el centro de ayuda o preguntarme directamente escribiendo tu duda en el campo de texto.",
      },
    ],
  },
];

export function findFlowById(id: string): Flow | undefined {
  return COENGINE_FLOWS.find((f) => f.id === id);
}

export function findFlowByQuickReplyId(qrId: string): { flow: Flow; stepIndex: number } | undefined {
  for (const flow of COENGINE_FLOWS) {
    for (let i = 0; i < flow.steps.length; i++) {
      const step = flow.steps[i];
      if (step.quickReplies?.some((qr) => qr.id === qrId)) {
        return { flow, stepIndex: i };
      }
    }
  }
  return undefined;
}
