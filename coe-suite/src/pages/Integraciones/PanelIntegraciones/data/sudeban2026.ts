export interface SudebanEntry {
  fecha: string;
  descripcion: string;
  clasificacion: "Feriado Nacional" | "Feriado Bancario";
}

export const SUDEBAN_2026: SudebanEntry[] = [
  { fecha: "2026-01-01", descripcion: "Año Nuevo", clasificacion: "Feriado Nacional" },
  { fecha: "2026-01-12", descripcion: "Día de Reyes (Lunes Bancario)", clasificacion: "Feriado Bancario" },
  { fecha: "2026-01-19", descripcion: "Día de la Divina Pastora (Lunes Bancario)", clasificacion: "Feriado Bancario" },
  { fecha: "2026-02-16", descripcion: "Carnaval", clasificacion: "Feriado Nacional" },
  { fecha: "2026-02-17", descripcion: "Carnaval", clasificacion: "Feriado Nacional" },
  { fecha: "2026-03-19", descripcion: "Día de San José", clasificacion: "Feriado Bancario" },
  { fecha: "2026-04-02", descripcion: "Jueves Santo (Semana Santa)", clasificacion: "Feriado Nacional" },
  { fecha: "2026-04-03", descripcion: "Viernes Santo (Semana Santa)", clasificacion: "Feriado Nacional" },
  { fecha: "2026-04-19", descripcion: "Movimiento Precursor de la Independencia", clasificacion: "Feriado Nacional" },
  { fecha: "2026-05-01", descripcion: "Día del Trabajador", clasificacion: "Feriado Nacional" },
  { fecha: "2026-05-18", descripcion: "Ascensión del Señor (Lunes Bancario)", clasificacion: "Feriado Bancario" },
  { fecha: "2026-06-08", descripcion: "Corpus Christi (Lunes Bancario)", clasificacion: "Feriado Bancario" },
  { fecha: "2026-06-13", descripcion: "Día de San Antonio", clasificacion: "Feriado Bancario" },
  { fecha: "2026-06-24", descripcion: "Batalla de Carabobo", clasificacion: "Feriado Nacional" },
  { fecha: "2026-06-29", descripcion: "San Pedro y San Pablo (Lunes Bancario)", clasificacion: "Feriado Bancario" },
  { fecha: "2026-07-05", descripcion: "Día de la Independencia", clasificacion: "Feriado Nacional" },
  { fecha: "2026-07-24", descripcion: "Natalicio del Libertador", clasificacion: "Feriado Nacional" },
  { fecha: "2026-08-15", descripcion: "Asunción de Nuestra Señora", clasificacion: "Feriado Bancario" },
  { fecha: "2026-09-14", descripcion: "Virgen de Coromoto (Lunes Bancario)", clasificacion: "Feriado Bancario" },
  { fecha: "2026-10-12", descripcion: "Día de la Resistencia Indígena", clasificacion: "Feriado Nacional" },
  { fecha: "2026-10-26", descripcion: "San José Gregorio Hernández (Lunes Bancario)", clasificacion: "Feriado Bancario" },
  { fecha: "2026-11-01", descripcion: "Día de Todos los Santos", clasificacion: "Feriado Bancario" },
  { fecha: "2026-11-23", descripcion: "Virgen del Rosario de Chiquinquirá (Lunes Bancario)", clasificacion: "Feriado Bancario" },
  { fecha: "2026-12-14", descripcion: "Inmaculada Concepción (Lunes Bancario)", clasificacion: "Feriado Bancario" },
  { fecha: "2026-12-24", descripcion: "Nochebuena", clasificacion: "Feriado Nacional" },
  { fecha: "2026-12-25", descripcion: "Navidad", clasificacion: "Feriado Nacional" },
  { fecha: "2026-12-31", descripcion: "Fin de Año", clasificacion: "Feriado Nacional" },
];
