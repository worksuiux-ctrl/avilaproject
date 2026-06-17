import { useState, useMemo, useCallback, useEffect } from "react";
import { Heading, Text, Button, Select, Input, Checkbox } from "@coe/design-system";
import { Modal } from "../../../components/ui/Modal";
import { useCalendarioStore, type CalendarioConfig, type ClasificacionDia, type AlcanceConfig } from "../../../stores/calendarioFinancieroStore";
import { useEntitiesStore } from "../../../stores/entitiesStore";
import { useGruposStore } from "../../../stores/gruposStore";
import { useNavStore } from "../../../stores/navStore";
import { DeleteDialog } from "../../../components/shared/DeleteDialog";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, CalendarDays, Search, X } from "lucide-react";

type VistaCalendario = "mes" | "semana" | "año";

const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const DIAS_SEMANA_LARGO = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const CLASIFICACION_BASE = [
  { value: "Hábil", label: "Día Hábil" },
  { value: "No Hábil", label: "Día No Hábil" },
  { value: "Feriado Nacional", label: "Feriado Nacional" },
  { value: "Feriado Bancario", label: "Feriado Bancario" },
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

const ALCANCE_LABEL: Record<AlcanceConfig, string> = {
  todas: "Todas",
  unidades: "Unidad(es)",
  grupos: "Grupo(s)",
};

function ClasificacionBadge({ clasificacion, alcance, label }: { clasificacion: ClasificacionDia; alcance?: AlcanceConfig; label?: string }) {
  const color = CLASIFICACION_COLORS[clasificacion];
  return (
    <div
      className="w-full flex items-center gap-1 px-1.5 py-1 rounded text-[10px] font-medium leading-tight truncate"
      style={{ backgroundColor: color + "20", color, border: `1px solid ${color}40` }}
    >
      <span className="flex-1 min-w-0 truncate">{label ?? clasificacion}</span>
      {alcance && (
        <span className="shrink-0 text-[9px] font-normal opacity-70">{ALCANCE_LABEL[alcance]}</span>
      )}
    </div>
  );
}

interface DayCellProps {
  day: number;
  configs: CalendarioConfig[];
  disabled: boolean;
  isToday: boolean;
  onClick: () => void;
  onBadgeClick: (cfg: CalendarioConfig) => void;
}

function DayCell({ day, configs, disabled, isToday, onClick, onBadgeClick }: DayCellProps) {
  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={`flex flex-col items-start gap-0.5 p-1 rounded-corner-m border text-left transition-all min-h-[72px] ${
        disabled
          ? "bg-[var(--color-neutro-50)] text-[var(--color-neutro-300)] border-transparent"
          : "bg-white text-[var(--color-neutro-800)] hover:border-[var(--color-verde-100)] hover:shadow-sm cursor-pointer border-[var(--color-neutro-200)]"
      } ${isToday ? "ring-2 ring-[var(--color-verde-100)] ring-offset-1" : ""}`}
    >
      <span className={`text-[11px] font-semibold leading-tight px-0.5 ${isToday ? "text-[var(--color-verde-100)]" : ""}`}>
        {day}
      </span>
      <div className="flex flex-col gap-0.5 w-full min-w-0">
        {configs.slice(0, 3).map((cfg) => (
          <div key={cfg.id} onClick={(e) => { e.stopPropagation(); onBadgeClick(cfg); }} className="cursor-pointer hover:brightness-110 hover:saturate-150 transition-all">
            <ClasificacionBadge clasificacion={cfg.clasificacion} alcance={cfg.alcance} />
          </div>
        ))}
        {configs.length > 3 && (
          <span className="text-[9px] text-[var(--color-neutro-400)] font-medium px-0.5">
            +{configs.length - 3} más
          </span>
        )}
      </div>
    </div>
  );
}

interface WeekColumnProps {
  year: number; month: number; day: number;
  configs: CalendarioConfig[]; disabled: boolean; isToday: boolean;
  onClick: () => void;
  onBadgeClick: (cfg: CalendarioConfig) => void;
}

function WeekColumn({ year, month, day, configs, disabled, isToday, onClick, onBadgeClick }: WeekColumnProps) {
  const date = new Date(year, month, day);
  const dayName = DIAS_SEMANA_LARGO[date.getDay()];
  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={`flex flex-col items-center gap-2 p-3 rounded-corner-m border text-left transition-all min-h-[140px] ${
        disabled
          ? "bg-[var(--color-neutro-50)] text-[var(--color-neutro-300)] border-transparent"
          : "bg-white text-[var(--color-neutro-800)] hover:border-[var(--color-verde-100)] hover:shadow-sm cursor-pointer border-[var(--color-neutro-200)]"
      } ${isToday ? "ring-2 ring-[var(--color-verde-100)] ring-offset-1" : ""}`}
    >
      <div className="flex flex-col items-center gap-0.5">
        <span className={`text-[11px] font-medium ${disabled ? "" : "text-[var(--color-neutro-500)]"}`}>{dayName}</span>
        <span className={`text-lg font-bold leading-tight ${isToday ? "text-[var(--color-verde-100)]" : ""}`}>{day}</span>
      </div>
      <div className="flex flex-col gap-1 w-full min-w-0">
        {configs.slice(0, 4).map((cfg) => (
          <div key={cfg.id} onClick={(e) => { e.stopPropagation(); onBadgeClick(cfg); }} className="cursor-pointer hover:brightness-110 hover:saturate-150 transition-all">
            <ClasificacionBadge clasificacion={cfg.clasificacion} alcance={cfg.alcance} label={cfg.descripcion} />
          </div>
        ))}
        {configs.length > 4 && (
          <span className="text-[10px] text-[var(--color-neutro-400)] font-medium text-center">
            +{configs.length - 4} más
          </span>
        )}
      </div>
    </div>
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

const EMPTY_FORM = {
  clasificacion: "Hábil" as ClasificacionDia,
  descripcion: "",
  alcance: "todas" as AlcanceConfig,
  finSemana: null as "sábado" | "domingo" | "ambos" | null,
  unidadesIds: [] as string[],
  gruposIds: [] as string[],
};

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
  const [editingConfigId, setEditingConfigId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formClasificacion, setFormClasificacion] = useState<ClasificacionDia>("Hábil");
  const [formDescripcion, setFormDescripcion] = useState("");
  const [formAlcance, setFormAlcance] = useState<AlcanceConfig>("todas");
  const [formFinSemana, setFormFinSemana] = useState<"sábado" | "domingo" | "ambos" | null>(null);
  const [formUnidadesIds, setFormUnidadesIds] = useState<string[]>([]);
  const [formGruposIds, setFormGruposIds] = useState<string[]>([]);
  const [unidadSearch, setUnidadSearch] = useState("");
  const [grupoSearch, setGrupoSearch] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const store = useCalendarioStore();
  const entities = useEntitiesStore((s) => s.entities);
  const grupos = useGruposStore((s) => s.grupos);
  const nav = useNavStore((s) => s.navigate);

  useEffect(() => { nav("config/calendario-financiero"); }, [nav]);

  const configsMap = useMemo(() => {
    const map = new Map<string, CalendarioConfig[]>();
    for (const cfg of store.configs) {
      const existing = map.get(cfg.fecha) ?? [];
      existing.push(cfg);
      map.set(cfg.fecha, existing);
    }
    return map;
  }, [store.configs]);

  const selectedDateDayOfWeek = useMemo(() => {
    if (!selectedDate) return -1;
    return new Date(selectedDate + "T12:00:00").getDay();
  }, [selectedDate]);

  const clasificacionOptions = useMemo(() => {
    if (selectedDateDayOfWeek === 0 || selectedDateDayOfWeek === 6) {
      return [...CLASIFICACION_BASE, { value: "Fin de Semana", label: "Fin de Semana" }];
    }
    return CLASIFICACION_BASE;
  }, [selectedDateDayOfWeek]);

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

  const resetForm = useCallback(() => {
    setFormClasificacion(EMPTY_FORM.clasificacion);
    setFormDescripcion(EMPTY_FORM.descripcion);
    setFormAlcance(EMPTY_FORM.alcance);
    setFormFinSemana(EMPTY_FORM.finSemana);
    setFormUnidadesIds(EMPTY_FORM.unidadesIds);
    setFormGruposIds(EMPTY_FORM.gruposIds);
    setErrorMsg(null);
  }, []);

  const fillFormWithConfig = useCallback((cfg: CalendarioConfig) => {
    setFormClasificacion(cfg.clasificacion);
    setFormDescripcion(cfg.descripcion);
    setFormAlcance(cfg.alcance);
    setFormFinSemana(cfg.finSemanaAplica);
    setFormUnidadesIds(cfg.unidadesIds);
    setFormGruposIds(cfg.gruposIds);
    setErrorMsg(null);
  }, []);

  const handleDayClick = useCallback((year: number, month: number, day: number) => {
    const key = fechaKey(year, month, day);
    setSelectedDate(key);
    setEditingConfigId(null);
    resetForm();
    setModalOpen(true);
  }, [resetForm]);

  const handleBadgeClick = useCallback((year: number, month: number, day: number, cfg: CalendarioConfig) => {
    const key = fechaKey(year, month, day);
    setSelectedDate(key);
    setEditingConfigId(cfg.id);
    fillFormWithConfig(cfg);
    setModalOpen(true);
  }, [fillFormWithConfig]);

  const validateAlcance = useCallback((newAlcance: AlcanceConfig): string | null => {
    if (!selectedDate) return null;
    const existing = configsMap.get(selectedDate) ?? [];
    const others = editingConfigId ? existing.filter((c) => c.id !== editingConfigId) : existing;
    const hasTodas = others.some((c) => c.alcance === "todas");
    const hasEspecificas = others.some((c) => c.alcance === "unidades" || c.alcance === "grupos");
    if (newAlcance !== "todas" && hasTodas) {
      return "No puedes agregar configuraciones específicas en un día que ya tiene una regla para 'Todas las Unidades del Sistema'.";
    }
    if (newAlcance === "todas" && hasEspecificas) {
      return "No puedes asignar 'Todas las Unidades' en un día que ya tiene configuraciones específicas por unidad o grupo.";
    }
    return null;
  }, [selectedDate, configsMap, editingConfigId]);

  const handleSave = useCallback(() => {
    if (!selectedDate) return;
    const err = validateAlcance(formAlcance);
    if (err) { setErrorMsg(err); return; }
    const data = {
      fecha: selectedDate,
      clasificacion: formClasificacion,
      descripcion: formDescripcion,
      alcance: formAlcance,
      unidadesIds: formAlcance === "unidades" ? formUnidadesIds : [],
      gruposIds: formAlcance === "grupos" ? formGruposIds : [],
      finSemanaAplica: formClasificacion === "Fin de Semana" ? formFinSemana : null,
    };
    if (editingConfigId) {
      store.updateConfig(editingConfigId, data);
      toast.success("Configuración actualizada", { description: formatDateLabel(selectedDate) });
    } else {
      store.addConfig(data);
      toast.success("Configuración creada", { description: formatDateLabel(selectedDate) });
    }
    setModalOpen(false);
  }, [selectedDate, editingConfigId, formClasificacion, formDescripcion, formAlcance, formFinSemana, formUnidadesIds, formGruposIds, validateAlcance, store]);

  const handleDelete = useCallback(() => {
    if (!selectedDate || !editingConfigId) return;
    store.removeConfig(editingConfigId);
    setModalOpen(false);
    toast.success("Configuración eliminada", { description: formatDateLabel(selectedDate) });
    setDeleteDialogOpen(false);
  }, [selectedDate, editingConfigId, store]);

  const confirmDelete = useCallback(() => {
    setDeleteDialogOpen(true);
  }, []);

  const handleClasificacionChange = useCallback((v: string) => {
    const val = v as ClasificacionDia;
    setFormClasificacion(val);
    if (val !== "Fin de Semana") setFormFinSemana(null);
  }, []);

  const handleAlcanceChange = useCallback((val: AlcanceConfig) => {
    setFormAlcance(val);
    setErrorMsg(null);
  }, []);

  const monthDays = useMemo(() => getMonthDays(currentYear, currentMonth), [currentYear, currentMonth]);

  const weekDays = useMemo(() => {
    const days = getWeekDays(currentWeekStart.getFullYear(), currentWeekStart.getMonth(), currentWeekStart.getDate());
    return days.map((d) => ({
      year: d.getFullYear(), month: d.getMonth(), day: d.getDate(),
      key: fechaKey(d.getFullYear(), d.getMonth(), d.getDate()),
    }));
  }, [currentWeekStart]);

  const unidadesDisponibles = useMemo(() => {
    return entities
      .filter((e) => (e.nivel === "Oficinas" || e.nivel === "Dispositivos") && e.activo)
      .map((e) => ({ id: e.id, label: `${e.codigo} — ${e.nombre}`, nivel: e.nivel, subtipo: e.subtipo }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [entities]);

  const gruposDisponibles = useMemo(() => {
    return grupos
      .filter((g) => g.tipo === "Geográfico" && g.activo)
      .map((g) => ({ id: g.id, label: `${g.codigo} — ${g.nombre}`, subtipo: g.subtipo }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [grupos]);

  const filteredUnidades = useMemo(() => {
    if (!unidadSearch.trim()) return unidadesDisponibles;
    const q = unidadSearch.toLowerCase();
    return unidadesDisponibles.filter((u) => u.label.toLowerCase().includes(q) || u.nivel.toLowerCase().includes(q) || u.subtipo.toLowerCase().includes(q));
  }, [unidadesDisponibles, unidadSearch]);

  const filteredGrupos = useMemo(() => {
    if (!grupoSearch.trim()) return gruposDisponibles;
    const q = grupoSearch.toLowerCase();
    return gruposDisponibles.filter((g) => g.label.toLowerCase().includes(q) || g.subtipo.toLowerCase().includes(q));
  }, [gruposDisponibles, grupoSearch]);

  const toggleUnidad = useCallback((id: string) => {
    setFormUnidadesIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }, []);

  const toggleGrupo = useCallback((id: string) => {
    setFormGruposIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }, []);

  const isEditing = editingConfigId !== null;

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
                      key={idx} day={cell.day}
                      configs={configs} disabled={disabled} isToday={isTodayFlag}
                      onClick={() => handleDayClick(offsetYear, normMonth, cell.day)}
                      onBadgeClick={(cfg) => handleBadgeClick(offsetYear, normMonth, cell.day, cfg)}
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
                      key={wd.key} year={wd.year} month={wd.month} day={wd.day}
                      configs={configs} disabled={disabled} isToday={isTodayFlag}
                      onClick={() => handleDayClick(wd.year, wd.month, wd.day)}
                      onBadgeClick={(cfg) => handleBadgeClick(wd.year, wd.month, wd.day, cfg)}
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
                            key={idx} type="button" disabled={disabled}
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
        title={selectedDate
          ? `${isEditing ? "Editar" : "Nueva"} Configuración — ${formatDateLabel(selectedDate)}`
          : ""}
        size="lg"
        actions={
          <div className="flex items-center justify-between w-full">
            {isEditing ? (
              <Button variant="danger" size="sm" onClick={confirmDelete}>
                Eliminar esta configuración
              </Button>
            ) : <div />}
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button variant="primary" size="sm" onClick={handleSave}>
                {isEditing ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          {errorMsg && (
            <div className="px-3 py-2 rounded-corner-m text-[13px] text-white font-medium" style={{ backgroundColor: "#ef4444" }}>
              {errorMsg}
            </div>
          )}

          <Select
            label="Clasificación del Día"
            options={clasificacionOptions}
            value={formClasificacion}
            onChange={handleClasificacionChange}
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
            <div className="flex gap-1 bg-[var(--color-neutro-50)] rounded-corner-m p-0.5">
              {[
                { value: "todas" as AlcanceConfig, label: "Todas las Unidades" },
                { value: "unidades" as AlcanceConfig, label: "Unidades específicas" },
                { value: "grupos" as AlcanceConfig, label: "Grupos Geográficos" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleAlcanceChange(opt.value)}
                  className={`flex-1 px-3 py-1.5 text-[12px] font-medium rounded-corner-m border-none cursor-pointer transition-all text-center ${
                    formAlcance === opt.value
                      ? "bg-white text-[var(--color-verde-100)] shadow-sm border border-[var(--color-neutro-200)] font-semibold"
                      : "text-[var(--color-neutro-500)] hover:text-[var(--color-neutro-700)]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {formAlcance === "unidades" && (
            <div className="border border-[var(--color-neutro-200)] rounded-corner-m overflow-hidden">
              <div className="relative border-b border-[var(--color-neutro-200)]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-neutro-400)]" />
                <input
                  value={unidadSearch}
                  onChange={(e) => setUnidadSearch(e.target.value)}
                  placeholder="Buscar unidades (Agencias, ATMs, Cajas...)"
                  className="w-full text-[13px] pl-8 pr-3 py-2 outline-none bg-transparent text-[var(--color-neutro-800)]"
                />
                {unidadSearch && (
                  <button
                    type="button"
                    onClick={() => setUnidadSearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-neutro-400)] hover:text-[var(--color-neutro-600)]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="max-h-[200px] overflow-y-auto">
                {filteredUnidades.length === 0 ? (
                  <p className="px-3 py-4 text-[13px] text-[var(--color-neutro-400)] text-center">Sin resultados</p>
                ) : (
                  filteredUnidades.map((u) => (
                    <label
                      key={u.id}
                      className={`flex items-center gap-2 px-3 py-1.5 text-[13px] cursor-pointer transition-colors hover:bg-[var(--color-neutro-50)] ${
                        formUnidadesIds.includes(u.id) ? "bg-[var(--color-verde-100)]/5" : ""
                      }`}
                    >
                      <Checkbox
                        checked={formUnidadesIds.includes(u.id)}
                        onChange={() => toggleUnidad(u.id)}
                      />
                      <span className="flex-1 min-w-0 truncate">{u.label}</span>
                      <span className="text-[11px] text-[var(--color-neutro-400)] shrink-0">{u.subtipo}</span>
                    </label>
                  ))
                )}
              </div>
              {formUnidadesIds.length > 0 && (
                <div className="border-t border-[var(--color-neutro-200)] px-3 py-1.5 text-[12px] text-[var(--color-neutro-500)]">
                  {formUnidadesIds.length} seleccionada{formUnidadesIds.length !== 1 ? "s" : ""}
                </div>
              )}
            </div>
          )}

          {formAlcance === "grupos" && (
            <div className="border border-[var(--color-neutro-200)] rounded-corner-m overflow-hidden">
              <div className="relative border-b border-[var(--color-neutro-200)]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-neutro-400)]" />
                <input
                  value={grupoSearch}
                  onChange={(e) => setGrupoSearch(e.target.value)}
                  placeholder="Buscar grupos geográficos..."
                  className="w-full text-[13px] pl-8 pr-3 py-2 outline-none bg-transparent text-[var(--color-neutro-800)]"
                />
                {grupoSearch && (
                  <button
                    type="button"
                    onClick={() => setGrupoSearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-neutro-400)] hover:text-[var(--color-neutro-600)]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="max-h-[200px] overflow-y-auto">
                {filteredGrupos.length === 0 ? (
                  <p className="px-3 py-4 text-[13px] text-[var(--color-neutro-400)] text-center">Sin resultados</p>
                ) : (
                  filteredGrupos.map((g) => (
                    <label
                      key={g.id}
                      className={`flex items-center gap-2 px-3 py-1.5 text-[13px] cursor-pointer transition-colors hover:bg-[var(--color-neutro-50)] ${
                        formGruposIds.includes(g.id) ? "bg-[var(--color-verde-100)]/5" : ""
                      }`}
                    >
                      <Checkbox
                        checked={formGruposIds.includes(g.id)}
                        onChange={() => toggleGrupo(g.id)}
                      />
                      <span className="flex-1 min-w-0 truncate">{g.label}</span>
                      <span className="text-[11px] text-[var(--color-neutro-400)] shrink-0">{g.subtipo}</span>
                    </label>
                  ))
                )}
              </div>
              {formGruposIds.length > 0 && (
                <div className="border-t border-[var(--color-neutro-200)] px-3 py-1.5 text-[12px] text-[var(--color-neutro-500)]">
                  {formGruposIds.length} seleccionado{formGruposIds.length !== 1 ? "s" : ""}
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Eliminar configuración"
        description="¿Estás seguro de que deseas eliminar esta configuración del calendario?"
        itemName={selectedDate ? formatDateLabel(selectedDate) : ""}
        onConfirm={handleDelete}
      />
    </div>
  );
}
