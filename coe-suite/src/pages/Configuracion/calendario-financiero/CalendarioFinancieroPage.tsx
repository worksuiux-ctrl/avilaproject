import { useState, useMemo, useCallback } from "react";
import { Heading, Text, Button, Select, Input, Badge, Checkbox } from "@coe/design-system";
import { Modal } from "../../../components/ui/Modal";
import { useCalendarioStore, type CalendarioConfig, type ClasificacionDia, type AlcanceConfig } from "../../../stores/calendarioFinancieroStore";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

type VistaCalendario = "mes" | "semana" | "año";

const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const DIAS_SEMANA_LARGO = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const CLASIFICACION_OPTIONS = [
  { value: "Hábil", label: "Día Hábil" },
  { value: "No Hábil", label: "Día No Hábil" },
  { value: "Feriado Nacional", label: "Feriado Nacional" },
  { value: "Feriado Bancario", label: "Feriado Bancario" },
  { value: "Fin de Semana", label: "Fin de Semana" },
];

const CLASIFICACION_COLORS: Record<ClasificacionDia, string> = {
  "Hábil": "#22c55e",
  "No Hábil": "#ef4444",
  "Feriado Nacional": "#f59e0b",
  "Feriado Bancario": "#f97316",
  "Fin de Semana": "#3b82f6",
};

function fechaKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function isToday(year: number, month: number, day: number): boolean {
  const t = new Date();
  return t.getFullYear() === year && t.getMonth() === month && t.getDate() === day;
}

function isPastOrToday(year: number, month: number, day: number): boolean {
  const date = new Date(year, month, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date <= today;
}

function formatDateLabel(fecha: string): string {
  const d = new Date(fecha + "T12:00:00");
  return `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
}

function getMonthDays(year: number, month: number): { day: number; other: boolean }[] {
  const first = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();
  const cells: { day: number; other: boolean }[] = [];
  for (let i = first - 1; i >= 0; i--) cells.push({ day: daysInPrev - i, other: true });
  for (let i = 1; i <= daysInMonth; i++) cells.push({ day: i, other: false });
  while (cells.length % 7 !== 0) cells.push({ day: cells[cells.length - 7]?.day ?? 0 + 1, other: true });
  return cells;
}

interface ClasificacionBadgeProps {
  clasificacion: ClasificacionDia;
  label?: string;
}

function ClasificacionBadge({ clasificacion, label }: ClasificacionBadgeProps) {
  const color = CLASIFICACION_COLORS[clasificacion];
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium leading-tight truncate max-w-full"
      style={{ backgroundColor: color + "20", color, border: `1px solid ${color}40` }}
    >
      {label ?? clasificacion}
    </span>
  );
}

interface DayCellProps {
  year: number;
  month: number;
  day: number;
  configs: CalendarioConfig[];
  disabled: boolean;
  isToday: boolean;
  onClick: () => void;
}

function DayCell({ day, configs, disabled, isToday, onClick }: DayCellProps) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      className={`flex flex-col items-start gap-0.5 p-1 rounded-corner-m border text-left transition-all min-h-[72px] ${
        disabled
          ? "bg-[var(--color-neutro-50)] text-[var(--color-neutro-300)] cursor-not-allowed border-transparent"
          : "bg-white text-[var(--color-neutro-800)] hover:border-[var(--color-verde-100)] hover:shadow-sm cursor-pointer border-[var(--color-neutro-200)]"
      } ${isToday ? "ring-2 ring-[var(--color-verde-100)] ring-offset-1" : ""}`}
    >
      <span className={`text-[11px] font-semibold leading-tight px-0.5 ${isToday ? "text-[var(--color-verde-100)]" : disabled ? "" : ""}`}>
        {day}
      </span>
      <div className="flex flex-col gap-0.5 w-full min-w-0">
        {configs.slice(0, 3).map((cfg) => (
          <ClasificacionBadge key={cfg.id} clasificacion={cfg.clasificacion} />
        ))}
        {configs.length > 3 && (
          <span className="text-[9px] text-[var(--color-neutro-400)] font-medium px-0.5">
            +{configs.length - 3} más
          </span>
        )}
      </div>
    </button>
  );
}

interface WeekColumnProps {
  year: number;
  month: number;
  day: number;
  configs: CalendarioConfig[];
  disabled: boolean;
  isToday: boolean;
  onClick: () => void;
}

function WeekColumn({ year, month, day, configs, disabled, isToday, onClick }: WeekColumnProps) {
  const date = new Date(year, month, day);
  const dayName = DIAS_SEMANA_LARGO[date.getDay()];
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      className={`flex flex-col items-center gap-2 p-3 rounded-corner-m border text-left transition-all min-h-[140px] ${
        disabled
          ? "bg-[var(--color-neutro-50)] text-[var(--color-neutro-300)] cursor-not-allowed border-transparent"
          : "bg-white text-[var(--color-neutro-800)] hover:border-[var(--color-verde-100)] hover:shadow-sm cursor-pointer border-[var(--color-neutro-200)]"
      } ${isToday ? "ring-2 ring-[var(--color-verde-100)] ring-offset-1" : ""}`}
    >
      <div className="flex flex-col items-center gap-0.5">
        <span className={`text-[11px] font-medium ${disabled ? "" : "text-[var(--color-neutro-500)]"}`}>{dayName}</span>
        <span className={`text-lg font-bold leading-tight ${isToday ? "text-[var(--color-verde-100)]" : ""}`}>{day}</span>
      </div>
      <div className="flex flex-col gap-1 w-full min-w-0">
        {configs.slice(0, 4).map((cfg) => (
          <ClasificacionBadge key={cfg.id} clasificacion={cfg.clasificacion} label={cfg.descripcion} />
        ))}
        {configs.length > 4 && (
          <span className="text-[10px] text-[var(--color-neutro-400)] font-medium text-center">
            +{configs.length - 4} más
          </span>
        )}
      </div>
    </button>
  );
}

function getWeekDays(year: number, month: number, day: number): Date[] {
  const date = new Date(year, month, day);
  const dayOfWeek = date.getDay();
  const monday = new Date(date);
  monday.setDate(date.getDate() - ((dayOfWeek + 6) % 7));
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
}

export function CalendarioFinancieroPage() {
  const today = useMemo(() => new Date(), []);
  const [vista, setVista] = useState<VistaCalendario>("mes");
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return d;
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formClasificacion, setFormClasificacion] = useState<ClasificacionDia>("Hábil");
  const [formDescripcion, setFormDescripcion] = useState("");
  const [formAlcance, setFormAlcance] = useState<AlcanceConfig>("todas");
  const [formFinSemana, setFormFinSemana] = useState<"sábado" | "domingo" | "ambos" | null>(null);

  const store = useCalendarioStore();

  const configsMap = useMemo(() => {
    const map = new Map<string, CalendarioConfig[]>();
    for (const cfg of store.configs) {
      const existing = map.get(cfg.fecha) ?? [];
      existing.push(cfg);
      map.set(cfg.fecha, existing);
    }
    return map;
  }, [store.configs]);

  const handlePrev = useCallback(() => {
    if (vista === "mes") {
      if (currentMonth === 0) { setCurrentYear((y) => y - 1); setCurrentMonth(11); }
      else setCurrentMonth((m) => m - 1);
    } else if (vista === "semana") {
      const d = new Date(currentWeekStart);
      d.setDate(d.getDate() - 7);
      setCurrentWeekStart(d);
    } else {
      setCurrentYear((y) => y - 1);
    }
  }, [vista, currentMonth, currentWeekStart]);

  const handleNext = useCallback(() => {
    if (vista === "mes") {
      if (currentMonth === 11) { setCurrentYear((y) => y + 1); setCurrentMonth(0); }
      else setCurrentMonth((m) => m + 1);
    } else if (vista === "semana") {
      const d = new Date(currentWeekStart);
      d.setDate(d.getDate() + 7);
      setCurrentWeekStart(d);
    } else {
      setCurrentYear((y) => y + 1);
    }
  }, [vista, currentMonth, currentWeekStart]);

  const handleToday = useCallback(() => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    setCurrentWeekStart(monday);
  }, []);

  const titleLabel = useMemo(() => {
    if (vista === "mes") return `${MESES[currentMonth]} ${currentYear}`;
    if (vista === "semana") {
      const end = new Date(currentWeekStart);
      end.setDate(end.getDate() + 6);
      const startMonth = MESES[currentWeekStart.getMonth()];
      const endMonth = MESES[end.getMonth()];
      if (currentWeekStart.getMonth() === end.getMonth()) {
        return `${startMonth} ${currentWeekStart.getDate()} - ${end.getDate()}, ${currentYear}`;
      }
      return `${startMonth} ${currentWeekStart.getDate()} - ${endMonth} ${end.getDate()}, ${currentYear}`;
    }
    return `${currentYear}`;
  }, [vista, currentYear, currentMonth, currentWeekStart]);

  const handleDayClick = useCallback((year: number, month: number, day: number) => {
    const key = fechaKey(year, month, day);
    setSelectedDate(key);
    const configs = configsMap.get(key) ?? [];
    if (configs.length > 0) {
      const last = configs[configs.length - 1];
      setFormClasificacion(last.clasificacion);
      setFormDescripcion(last.descripcion);
      setFormAlcance(last.alcance);
      setFormFinSemana(last.finSemanaAplica);
    } else {
      setFormClasificacion("Hábil");
      setFormDescripcion("");
      setFormAlcance("todas");
      setFormFinSemana(null);
    }
    setModalOpen(true);
  }, [configsMap]);

  const handleSave = useCallback(() => {
    if (!selectedDate) return;
    const existing = configsMap.get(selectedDate) ?? [];
    const data = {
      fecha: selectedDate,
      clasificacion: formClasificacion,
      descripcion: formDescripcion,
      alcance: formAlcance,
      unidadesIds: [],
      gruposIds: [],
      finSemanaAplica: formClasificacion === "Fin de Semana" ? formFinSemana : null,
    };
    if (existing.length === 0) {
      store.addConfig(data);
    } else {
      store.updateConfig(existing[existing.length - 1].id, data);
    }
    setModalOpen(false);
  }, [selectedDate, formClasificacion, formDescripcion, formAlcance, formFinSemana, configsMap, store]);

  const handleDelete = useCallback(() => {
    if (!selectedDate) return;
    const existing = configsMap.get(selectedDate) ?? [];
    for (const cfg of existing) store.removeConfig(cfg.id);
    setModalOpen(false);
  }, [selectedDate, configsMap, store]);

  const monthDays = useMemo(() => getMonthDays(currentYear, currentMonth), [currentYear, currentMonth]);

  const weekDays = useMemo(() => {
    const days = getWeekDays(currentWeekStart.getFullYear(), currentWeekStart.getMonth(), currentWeekStart.getDate());
    return days.map((d) => ({
      year: d.getFullYear(),
      month: d.getMonth(),
      day: d.getDate(),
      key: fechaKey(d.getFullYear(), d.getMonth(), d.getDate()),
    }));
  }, [currentWeekStart]);

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <CalendarDays className="w-5 h-5 text-[var(--color-verde-100)]" />
          <Heading variant="title" as="h1">Calendario Financiero</Heading>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col bg-white rounded-corner-m border border-[var(--color-neutro-200)] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-neutro-200)] shrink-0">
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={handlePrev}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="secondary" size="sm" onClick={handleToday}>Hoy</Button>
            <Button variant="secondary" size="sm" onClick={handleNext}>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Text variant="subtitle" className="text-[var(--color-neutro-900)] font-semibold ml-2 min-w-[200px]">
              {titleLabel}
            </Text>
          </div>
          <div className="flex items-center gap-1 bg-[var(--color-neutro-50)] rounded-corner-m p-0.5">
            {(["mes", "semana", "año"] as VistaCalendario[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVista(v)}
                className={`px-3 py-1 text-[12px] font-medium rounded-corner-m border-none cursor-pointer transition-all capitalize ${
                  vista === v
                    ? "bg-white text-[var(--color-verde-100)] shadow-sm border border-[var(--color-neutro-200)]"
                    : "text-[var(--color-neutro-500)] hover:text-[var(--color-neutro-700)]"
                }`}
              >
                {v === "mes" ? "Mes" : v === "semana" ? "Semana" : "Año"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {vista === "mes" && (
            <div className="flex flex-col gap-1">
              <div className="grid grid-cols-7 gap-1">
                {DIAS_SEMANA.map((d) => (
                  <div key={d} className="text-center text-[11px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wider py-1">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {monthDays.map((cell, idx) => {
                  const offsetMonth = cell.other ? (cell.day > 15 ? currentMonth - 1 : currentMonth + 1) : currentMonth;
                  const offsetYear = offsetMonth < 0 ? currentYear - 1 : offsetMonth > 11 ? currentYear + 1 : currentYear;
                  const normMonth = offsetMonth < 0 ? 11 : offsetMonth > 11 ? 0 : offsetMonth;
                  const key = fechaKey(offsetYear, normMonth, cell.day);
                  const configs = configsMap.get(key) ?? [];
                  const disabled = isPastOrToday(offsetYear, normMonth, cell.day);
                  const isTodayFlag = isToday(offsetYear, normMonth, cell.day);
                  return (
                    <DayCell
                      key={idx}
                      year={offsetYear}
                      month={normMonth}
                      day={cell.day}
                      configs={configs}
                      disabled={disabled}
                      isToday={isTodayFlag}
                      onClick={() => handleDayClick(offsetYear, normMonth, cell.day)}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {vista === "semana" && (
            <div className="flex flex-col gap-1">
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((wd) => {
                  const configs = configsMap.get(wd.key) ?? [];
                  const disabled = isPastOrToday(wd.year, wd.month, wd.day);
                  const isTodayFlag = isToday(wd.year, wd.month, wd.day);
                  return (
                    <WeekColumn
                      key={wd.key}
                      year={wd.year}
                      month={wd.month}
                      day={wd.day}
                      configs={configs}
                      disabled={disabled}
                      isToday={isTodayFlag}
                      onClick={() => handleDayClick(wd.year, wd.month, wd.day)}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {vista === "año" && (
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 12 }, (_, m) => {
                const days = getMonthDays(currentYear, m);
                return (
                  <div key={m} className="border border-[var(--color-neutro-200)] rounded-corner-m p-2">
                    <h3 className="text-[13px] font-semibold text-[var(--color-neutro-700)] mb-1 text-center">{MESES[m]}</h3>
                    <div className="grid grid-cols-7 gap-0.5">
                      {["D", "L", "M", "M", "J", "V", "S"].map((ld) => (
                        <span key={ld} className="text-[8px] font-semibold text-[var(--color-neutro-400)] text-center">{ld}</span>
                      ))}
                      {days.map((cell, idx) => {
                        const key = fechaKey(currentYear, m, cell.day);
                        const configs = configsMap.get(key) ?? [];
                        const disabled = isPastOrToday(currentYear, m, cell.day);
                        const isTodayFlag = isToday(currentYear, m, cell.day);
                        return (
                          <button
                            key={idx}
                            type="button"
                            disabled={disabled}
                            onClick={() => handleDayClick(currentYear, m, cell.day)}
                            className={`text-[9px] text-center rounded-sm py-0.5 leading-tight border border-transparent transition-all ${
                              cell.other
                                ? "text-[var(--color-neutro-300)]"
                                : disabled
                                ? "text-[var(--color-neutro-300)] cursor-not-allowed"
                                : configs.length > 0
                                ? "text-white font-bold"
                                : "text-[var(--color-neutro-700)] hover:border-[var(--color-neutro-200)] cursor-pointer"
                            } ${isTodayFlag ? "ring-1 ring-[var(--color-verde-100)] font-bold" : ""} ${
                              configs.length > 0 && !disabled ? "bg-[var(--color-verde-100)]" : ""
                            }`}
                          >
                            {cell.day}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedDate ? `Configurar Día — ${formatDateLabel(selectedDate)}` : ""}
        size="lg"
        actions={
          <div className="flex items-center justify-between w-full">
            <Button variant="danger" size="sm" onClick={handleDelete}>
              Eliminar configuración
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button variant="primary" size="sm" onClick={handleSave}>
                Guardar
              </Button>
            </div>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <Select
            label="Clasificación del Día"
            options={CLASIFICACION_OPTIONS}
            value={formClasificacion}
            onChange={(v) => setFormClasificacion(v as ClasificacionDia)}
          />

          {formClasificacion === "Fin de Semana" && (
            <Select
              label="Aplica para"
              options={[
                { value: "sábado", label: "Sábado" },
                { value: "domingo", label: "Domingo" },
                { value: "ambos", label: "Ambos" },
              ]}
              value={formFinSemana ?? "ambos"}
              onChange={(v) => setFormFinSemana(v as "sábado" | "domingo" | "ambos")}
            />
          )}

          <Input
            label="Descripción"
            placeholder="Ej. Día de la Juventud, Mantenimiento Preventivo de Bóveda..."
            value={formDescripcion}
            onChange={(e) => setFormDescripcion(e.target.value)}
          />

          <div>
            <Text variant="small" className="text-[var(--color-neutro-600)] font-semibold mb-2 block">
              Alcance / Granularidad
            </Text>
            <div className="flex flex-col gap-2">
              {[
                { value: "todas" as AlcanceConfig, label: "Todas las Unidades del Sistema" },
                { value: "unidades" as AlcanceConfig, label: "Solo unas Unidades específicas" },
                { value: "grupos" as AlcanceConfig, label: "Por Grupos Geográficos" },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 px-3 py-2 rounded-corner-m border cursor-pointer transition-colors ${
                    formAlcance === opt.value
                      ? "border-[var(--color-verde-100)] bg-[var(--color-verde-100)]/5"
                      : "border-[var(--color-neutro-200)] hover:border-[var(--color-neutro-300)]"
                  }`}
                >
                  <input
                    type="radio"
                    name="alcance"
                    value={opt.value}
                    checked={formAlcance === opt.value}
                    onChange={() => setFormAlcance(opt.value)}
                    className="accent-[var(--color-verde-100)]"
                  />
                  <Text variant="small" className={formAlcance === opt.value ? "font-semibold" : ""}>
                    {opt.label}
                  </Text>
                </label>
              ))}
            </div>
          </div>

          {formAlcance === "unidades" && (
            <div className="border border-[var(--color-neutro-200)] rounded-corner-m p-3">
              <Text variant="small" className="text-[var(--color-neutro-500)] italic">
                Selector de unidades próximamente — podrás seleccionar Agencias, CDAs, ATMs, etc.
              </Text>
            </div>
          )}

          {formAlcance === "grupos" && (
            <div className="border border-[var(--color-neutro-200)] rounded-corner-m p-3">
              <Text variant="small" className="text-[var(--color-neutro-500)] italic">
                Selector de grupos geográficos próximamente — podrás seleccionar Estados, Municipios, etc.
              </Text>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
