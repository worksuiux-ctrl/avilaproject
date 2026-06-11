import type { FaqCategory, FaqItem } from "./faqTypes";

const mediaImagenMock: FaqItem["media"] = {
  tipo: "imagen",
  src: "/Icono coe.png",
  alt: "Icono COE Suite",
};

const mediaVideoMock: FaqItem["media"] = {
  tipo: "video",
  src: "https://www.w3schools.com/html/mov_bbb.mp4",
  poster: "/Icono coe.png",
  alt: "Video tutorial creación de operaciones",
};

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: "general",
    label: "General",
    items: [
      {
        id: "faq-1",
        categoria: "General",
        pregunta: "¿Qué es COE (Control Óptimo de Efectivo)?",
        respuesta:
          "Es nuestra solución integral de Cash Management Pro diseñada para automatizar, monitorear y optimizar de extremo a extremo el flujo, resguardo y demanda de efectivo en la entidad financiera. COE centraliza la gestión de bóvedas, transportistas, agencias y cajeros en una sola plataforma, reduciendo costos operativos y mejorando la disponibilidad de efectivo en tiempo real.",
      },
      {
        id: "faq-6",
        categoria: "General",
        pregunta: "¿Qué tipos de perfiles existen en la plataforma?",
        respuesta:
          "La plataforma maneja tres perfiles principales: <strong>Banco</strong> (visión completa de gestión de efectivo, operaciones, métricas y soporte), <strong>Corporativo</strong> (portal de servicios B2B para clientes empresariales con visibilidad de sus cuentas y solicitudes), y <strong>Transportista</strong> (gestión de rutas, manifiestos y evidencia de entrega). Cada perfil tiene permisos y vistas adaptadas a su rol operativo.",
      },
      {
        id: "faq-7",
        categoria: "General",
        pregunta: "¿Cómo acceder al sistema por primera vez?",
        respuesta:
          "El acceso inicial se realiza mediante credenciales provistas por el administrador de la entidad. Al ingresar por primera vez, se solicitará cambio de contraseña obligatorio y configuración de factores de autenticación (2FA). Si no recibiste tus credenciales, contacta al área de Sistemas o al gestor de tu entidad financiera.",
      },
    ],
  },
  {
    id: "integraciones",
    label: "Integraciones y Core Bancario",
    items: [
      {
        id: "faq-2",
        categoria: "Integraciones y Core Bancario",
        pregunta: "¿Cómo se sincroniza el aplicativo con el core bancario?",
        respuesta:
          "La suite se conecta de forma segura mediante APIs y mensajería en tiempo real con el core de la institución, garantizando que el módulo \"Core Sync\" refleje el estado operativo inmediato de las bóvedas y agencias. La sincronización es bidireccional: los saldos, transacciones y movimientos se replican automáticamente sin intervención manual, manteniendo la integridad de los datos financieros.",
        media: mediaImagenMock,
      },
    ],
  },
  {
    id: "ia",
    label: "Inteligencia Artificial",
    items: [
      {
        id: "faq-3",
        categoria: "Inteligencia Artificial",
        pregunta: "¿Qué asistencia ofrece CoeEngine en el sistema?",
        respuesta:
          "CoeEngine es nuestro asistente de IA integrado que analiza patrones históricos de demanda, genera alertas predictivas sobre el flujo de efectivo y automatiza la sugerencia de montos mínimos de envío. Utiliza modelos de machine learning entrenados con datos transaccionales de la entidad para predecir picos de demanda estacionales, optimizar rutas de transporte y reducir el efectivo ocioso en bóvedas.",
      },
      {
        id: "faq-8",
        categoria: "Inteligencia Artificial",
        pregunta: "¿Puede CoeEngine guiarme para realizar transacciones u otras tareas?",
        respuesta:
          "Sí. CoeEngine incluye un modo conversacional que te guía paso a paso en la creación de operaciones, consulta de saldos, generación de reportes y resolución de dudas frecuentes. Solo escribe en lenguaje natural qué necesitas (ej: \"quiero enviar 500M a la agencia Norte\") y el asistente te llevará al formulario correcto, prellenará campos y validará reglas de negocio antes de confirmar.",
      },
    ],
  },
  {
    id: "metricas",
    label: "Métricas y Analítica",
    items: [
      {
        id: "faq-4",
        categoria: "Métricas y Analítica",
        pregunta: "¿Cómo interpretar los KPIs estratégicos y operativos?",
        respuesta:
          "El sistema divide la analítica en métricas macro (gráficos de demanda global a 48h, eficiencia de bóvedas) e indicadores micro operativos (estados de tickets de soporte y tiempos de SLA por transacciones). Los KPIs estratégicos muestran tendencias de liquidez y cobertura, mientras que los operativos permiten auditar el cumplimiento de acuerdos de nivel de servicio y detectar cuellos de botella en tiempo real.",
      },
    ],
  },
  {
    id: "operaciones",
    label: "Operaciones",
    items: [
      {
        id: "faq-5",
        categoria: "Operaciones",
        pregunta: "¿Cómo crear nuevas transacciones o solicitudes en la plataforma?",
        respuesta:
          "Dirígete al menú \"Operaciones\" en la barra lateral, haz clic en el botón \"+ Nueva Operación\" en el header, selecciona el tipo de movimiento (envío, recepción, traslado interno, ajuste), completa los campos del formulario (origen, destino, montos, denominaciones, transportista) y presiona enviar. El sistema validará automáticamente límites y disponibilidad antes de confirmar.",
        media: mediaVideoMock,
      },
    ],
  },
];

export function getAllFaqItems(): FaqItem[] {
  return FAQ_CATEGORIES.flatMap((cat) => cat.items);
}

export function searchFaqItems(query: string): FaqItem[] {
  const q = query.toLowerCase().trim();
  if (!q) return getAllFaqItems();
  return getAllFaqItems().filter(
    (item) =>
      item.pregunta.toLowerCase().includes(q) ||
      item.respuesta.toLowerCase().includes(q) ||
      item.categoria.toLowerCase().includes(q)
  );
}