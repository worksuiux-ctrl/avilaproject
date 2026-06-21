import { useState, useMemo, useEffect, useRef } from "react";
import {
  Search, Shield, AlertTriangle, Info, X,
  RotateCcw, Download, ChevronDown, ChevronUp, ChevronRight,
  LogIn, LogOut, Lock, UserPlus, UserX, Settings,
  DollarSign, FileText, Bug, Eye, Calendar,
  Globe, Monitor, Clock, Folder,
} from "lucide-react";
import { useNavStore } from "@stores/navStore";
import { useAuditLogStore, type AuditEvento, type AuditNivel, type AuditTipo, TIPOS_LABEL } from "@stores/auditLogStore";

/* ── Config ── */
const NIVELES: AuditNivel[] = ["info", "warn", "security", "error"];

const NIVEL_CONFIG: Record<AuditNivel, { label: string; bg: string; text: string; dot: string; icon: typeof Info }> = {
  info:     { label: "Info",     bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500",     icon: Info },
  warn:     { label: "Advertencia", bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500",   icon: AlertTriangle },
  security: { label: "Seguridad", bg: "bg-red-100", text: "text-red-700", dot: "bg-red-600",       icon: Shield },
  error:    { label: "Error",    bg: "bg-rose-100", text: "text-rose-700", dot: "bg-rose-600",      icon: X },
};

const TIPO_ICON: Record<AuditTipo, typeof Info> = {
  login: LogIn, logout: LogOut, permiso_cambiado: Shield,
  usuario_invitado: UserPlus, usuario_eliminado: UserX,
  config_actualizada: Settings, parametro_cambiado: Settings,
  operacion_financiera: DollarSign, reporte_generado: FileText,
  excepcion_sistema: Bug, acceso_denegado: Lock,
};

const PERFIL_COLOR: Record<string, string> = {
  banco: "var(--color-verde-600)",
  transportista: "#d97706",
  corporativo: "#7c3aed",
  bcv: "#0d9488",
  sistema: "#6b7280",
};

const ITEMS_PER_PAGE = 20;

/* ── Helpers ── */
function formatCell(val: unknown): string {
  if (val == null) return "";
  return String(val);
}

function dateFromLocaleString(str: string): Date {
  const d = new Date(str);
  if (!isNaN(d.getTime())) return d;
  const parts = str.split(/[/,:\s]+/);
  if (parts.length >= 3) {
    return new Date(`${parts[2]}-${parts[1]}-${parts[0]}T${parts[3]}:${parts[4]}:${parts[5] ?? "00"}`);
  }
  return new Date();
}

/* ════════════════════════════════════════════
   Detail Modal
   ════════════════════════════════════════════ */
function DetailModal({ evento, onClose }: { evento: AuditEvento; onClose: () => void }) {
  const NivelIcon = NIVEL_CONFIG[evento.nivel].icon;
  const TipoIcon = TIPO_ICON[evento.tipo];
  const cfg = NIVEL_CONFIG[evento.nivel];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-corner-m shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-neutro-200)] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-corner-m ${cfg.bg} flex items-center justify-center`}>
              <NivelIcon className={`w-4 h-4 ${cfg.text}`} />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-[var(--color-neutro-900)]">{evento.accion}</h2>
              <p className="text-[11px] text-[var(--color-neutro-500)]">{evento.timestamp}</p>
            </div>
          </div>
          <button className="p-1 rounded-corner-m hover:bg-[var(--color-neutro-100)] text-[var(--color-neutro-400)]" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[var(--color-neutro-50)] rounded-corner-m p-3 border border-[var(--color-neutro-200)]">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-neutro-500)] mb-1">Tipo de Evento</p>
              <div className="flex items-center gap-1.5">
                <TipoIcon className="w-3.5 h-3.5 text-[var(--color-neutro-500)]" />
                <span className="text-[12px] font-semibold text-[var(--color-neutro-700)]">{TIPOS_LABEL[evento.tipo]}</span>
              </div>
            </div>
            <div className="bg-[var(--color-neutro-50)] rounded-corner-m p-3 border border-[var(--color-neutro-200)]">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-neutro-500)] mb-1">Nivel</p>
              <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-corner-m ${cfg.bg} ${cfg.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                {cfg.label}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0" style={{ background: PERFIL_COLOR[evento.perfil] ?? "#6b7280" }}>
                {evento.usuario.charAt(0)}
              </div>
              <div>
                <p className="text-[12px] font-semibold text-[var(--color-neutro-900)]">{evento.usuario}</p>
                <p className="text-[10px] text-[var(--color-neutro-500)] capitalize">{evento.perfil}</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-[12px] font-semibold text-[var(--color-neutro-700)] mb-1.5">Descripción</p>
            <p className="text-[13px] text-[var(--color-neutro-600)] leading-relaxed">{evento.detalle}</p>
          </div>

          <div>
            <p className="text-[12px] font-semibold text-[var(--color-neutro-700)] mb-2">Información Técnica</p>
            <div className="bg-[var(--color-neutro-50)] rounded-corner-m border border-[var(--color-neutro-200)] divide-y divide-[var(--color-neutro-200)]">
              <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-2 text-[12px] text-[var(--color-neutro-500)]">
                  <Globe className="w-3.5 h-3.5" /> IP Address
                </div>
                <span className="text-[12px] font-mono text-[var(--color-neutro-700)]">{evento.ipAddress}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-2 text-[12px] text-[var(--color-neutro-500)]">
                  <Monitor className="w-3.5 h-3.5" /> User Agent
                </div>
                <span className="text-[11px] text-[var(--color-neutro-600)] text-right max-w-[300px] truncate" title={evento.userAgent}>{evento.userAgent}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-2 text-[12px] text-[var(--color-neutro-500)]">
                  <Folder className="w-3.5 h-3.5" /> Módulo
                </div>
                <span className="text-[12px] text-[var(--color-neutro-700)]">{evento.modulo}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end px-6 py-3 border-t border-[var(--color-neutro-200)] flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[13px] font-semibold bg-[var(--color-neutro-100)] text-[var(--color-neutro-700)] rounded-corner-m hover:bg-[var(--color-neutro-200)] transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   Main AuditLog Page
   ════════════════════════════════════════════ */
export function AuditLog() {
  const { eventos } = useAuditLogStore();
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [nivelesFiltro, setNivelesFiltro] = useState<AuditNivel[]>([]);
  const [tipoFiltro, setTipoFiltro] = useState<AuditTipo | "">("");
  const [sortKey, setSortKey] = useState<string>("timestamp");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [pagina, setPagina] = useState(0);
  const [selectedEvento, setSelectedEvento] = useState<AuditEvento | null>(null);

  useEffect(() => {
    useNavStore.setState({
      title: "Log de Auditoría",
      description: "Registro de eventos de seguridad y actividad del sistema",
    });
  }, []);

  const tiposUnicos = useMemo(() => {
    const set = new Set(eventos.map((e) => e.tipo));
    return Array.from(set).sort((a, b) => TIPOS_LABEL[a].localeCompare(TIPOS_LABEL[b]));
  }, [eventos]);

  const toggleNivel = (nivel: AuditNivel) => {
    setNivelesFiltro((prev) =>
      prev.includes(nivel) ? prev.filter((n) => n !== nivel) : [...prev, nivel]
    );
    setPagina(0);
  };

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const filtered = useMemo(() => {
    let data = [...eventos];

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (e) =>
          e.usuario.toLowerCase().includes(q) ||
          e.accion.toLowerCase().includes(q) ||
          e.detalle.toLowerCase().includes(q) ||
          e.modulo.toLowerCase().includes(q) ||
          e.ipAddress.includes(q)
      );
    }

    if (dateFrom || dateTo) {
      data = data.filter((e) => {
        const d = dateFromLocaleString(e.timestamp).getTime();
        if (dateFrom && d < new Date(dateFrom).getTime()) return false;
        if (dateTo) {
          const toDate = new Date(dateTo);
          toDate.setHours(23, 59, 59, 999);
          if (d > toDate.getTime()) return false;
        }
        return true;
      });
    }

    if (nivelesFiltro.length > 0) {
      data = data.filter((e) => nivelesFiltro.includes(e.nivel));
    }

    if (tipoFiltro) {
      data = data.filter((e) => e.tipo === tipoFiltro);
    }

    data.sort((a, b) => {
      const va = a[sortKey as keyof AuditEvento] ?? "";
      const vb = b[sortKey as keyof AuditEvento] ?? "";
      const cmp = typeof va === "string" ? va.localeCompare(String(vb)) : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });

    return data;
  }, [eventos, search, dateFrom, dateTo, nivelesFiltro, tipoFiltro, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const pageItems = filtered.slice(pagina * ITEMS_PER_PAGE, (pagina + 1) * ITEMS_PER_PAGE);

  const handleClearFilters = () => {
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setNivelesFiltro([]);
    setTipoFiltro("");
    setPagina(0);
  };

  const hasFilters = search || dateFrom || dateTo || nivelesFiltro.length > 0 || tipoFiltro;

  const hasActiveFilters = search.trim() !== "" || dateFrom !== "" || dateTo !== "" || nivelesFiltro.length > 0 || tipoFiltro !== "";

  const sortIcon = (key: string) => {
    if (sortKey !== key) return <ChevronDown className="w-3 h-3 opacity-0 group-hover:opacity-40" />;
    return sortDir === "asc" ? <ChevronDown className="w-3 h-3 text-[var(--color-verde-100)]" /> : <ChevronUp className="w-3 h-3 text-[var(--color-verde-100)]" />;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 shrink-0">
        <div>
          <h1 className="text-[18px] font-bold text-[var(--color-neutro-900)]">Log de Auditoría</h1>
          <p className="text-[13px] text-[var(--color-neutro-500)]">Registro de eventos de seguridad y actividad del sistema</p>
        </div>
        <button
          onClick={() => {
            const headers = ["Fecha/Hora", "Tipo", "Nivel", "Usuario", "Perfil", "Módulo", "Acción", "Detalle", "IP"];
            const rows = filtered.map((e) => [
              e.timestamp, TIPOS_LABEL[e.tipo], e.nivel, e.usuario, e.perfil,
              e.modulo, e.accion, e.detalle, e.ipAddress,
            ]);
            const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n");
            const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="flex items-center gap-1.5 px-3 py-2 text-[13px] font-semibold bg-[var(--color-verde-100)] text-white rounded-corner-m hover:brightness-110 transition-colors cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4" />
          Exportar CSV
        </button>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-3 mb-4 shrink-0 flex-wrap">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-neutro-50)] border border-[var(--color-neutro-200)] rounded-corner-m">
          <span className="text-[20px] font-bold text-[var(--color-neutro-900)]">{filtered.length}</span>
          <span className="text-[11px] text-[var(--color-neutro-500)] font-medium">eventos</span>
        </div>
        {NIVELES.map((n) => {
          const cfg = NIVEL_CONFIG[n];
          const count = filtered.filter((e) => e.nivel === n).length;
          if (count === 0) return null;
          return (
            <button
              key={n}
              onClick={() => toggleNivel(n)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-corner-m border text-[11px] font-semibold transition-all cursor-pointer ${
                nivelesFiltro.includes(n)
                  ? `${cfg.bg} ${cfg.text} border-transparent`
                  : "bg-white text-[var(--color-neutro-500)] border-[var(--color-neutro-200)] hover:border-[var(--color-neutro-300)]"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex items-start gap-3 mb-3 shrink-0 flex-wrap">
        <div className="relative min-w-[220px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-neutro-400)] pointer-events-none" />
          <input
            className="w-full h-[34px] pl-8 pr-3 py-1.5 text-[12px] border border-[var(--color-neutro-200)] rounded-corner-m bg-white focus:outline-none focus:ring-1 focus:ring-[var(--color-verde-100)]/30 box-border"
            placeholder="Buscar usuario, acción, IP..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPagina(0); }}
          />
          {search && (
            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-[var(--color-neutro-400)] hover:text-[var(--color-neutro-600)]" onClick={() => setSearch("")}>
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-[var(--color-neutro-400)]" />
          <input
            type="date"
            className="h-[34px] px-2.5 py-1.5 text-[12px] border border-[var(--color-neutro-200)] rounded-corner-m bg-white focus:outline-none focus:ring-1 focus:ring-[var(--color-verde-100)]/30 box-border"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPagina(0); }}
          />
          <span className="text-[11px] text-[var(--color-neutro-400)] font-semibold">—</span>
          <input
            type="date"
            className="h-[34px] px-2.5 py-1.5 text-[12px] border border-[var(--color-neutro-200)] rounded-corner-m bg-white focus:outline-none focus:ring-1 focus:ring-[var(--color-verde-100)]/30 box-border"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPagina(0); }}
          />
        </div>

        <select
          className="h-[34px] px-2.5 py-1.5 text-[12px] border border-[var(--color-neutro-200)] rounded-corner-m bg-white focus:outline-none focus:ring-1 focus:ring-[var(--color-verde-100)]/30 box-border appearance-none cursor-pointer min-w-[160px]"
          value={tipoFiltro}
          onChange={(e) => { setTipoFiltro(e.target.value as AuditTipo | ""); setPagina(0); }}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 6px center",
            paddingRight: "24px",
          }}
        >
          <option value="">Todos los tipos</option>
          {tiposUnicos.map((t) => (
            <option key={t} value={t}>{TIPOS_LABEL[t]}</option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1 px-3 h-[34px] text-[12px] font-semibold text-[var(--color-verde-100)] border border-[var(--color-verde-100)] rounded-corner-m hover:bg-[var(--color-verde-100)] hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Limpiar
          </button>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 min-h-0 overflow-hidden bg-white border border-[var(--color-neutro-200)] rounded-corner-m flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-[13px]">
            <thead className="bg-[var(--color-neutro-50)] text-[11px] font-semibold text-[var(--color-neutro-500)] uppercase tracking-wide sticky top-0 z-10">
              <tr>
                {[
                  { key: "timestamp", label: "Fecha / Hora", className: "text-left w-[170px]" },
                  { key: "nivel", label: "Nivel", className: "text-center w-[80px]" },
                  { key: "tipo", label: "Tipo", className: "text-left w-[140px]" },
                  { key: "usuario", label: "Usuario", className: "text-left w-[130px]" },
                  { key: "modulo", label: "Módulo", className: "text-left w-[130px]" },
                  { key: "accion", label: "Acción", className: "text-left min-w-[180px]" },
                ].map((col) => (
                  <th
                    key={col.key}
                    className={`px-3 py-3 ${col.className} cursor-pointer hover:bg-[var(--color-neutro-100)] transition-colors select-none group`}
                    onClick={() => toggleSort(col.key)}
                  >
                    <div className="flex items-center gap-1">
                      <span>{col.label}</span>
                      {sortIcon(col.key)}
                    </div>
                  </th>
                ))}
                <th className="px-3 py-3 text-center w-[60px]">
                  <Eye className="w-3.5 h-3.5 inline" />
                </th>
              </tr>
            </thead>
            <tbody>
              {pageItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-[13px] text-[var(--color-neutro-400)]">
                    No se encontraron eventos de auditoría
                  </td>
                </tr>
              ) : pageItems.map((evento) => {
                const cfg = NIVEL_CONFIG[evento.nivel];
                const NivelIcon = cfg.icon;
                const TipoIcon = TIPO_ICON[evento.tipo];
                return (
                  <tr
                    key={evento.id}
                    className="border-t border-[var(--color-neutro-100)] hover:bg-[var(--color-neutro-50)] transition-colors cursor-pointer"
                    onClick={() => setSelectedEvento(evento)}
                  >
                    <td className="px-3 py-2.5 text-[12px] text-[var(--color-neutro-600)] whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-[var(--color-neutro-400)] shrink-0" />
                        <span>{evento.timestamp}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-corner-m ${cfg.bg}`}>
                        <NivelIcon className={`w-3.5 h-3.5 ${cfg.text}`} />
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <TipoIcon className="w-3.5 h-3.5 text-[var(--color-neutro-400)] shrink-0" />
                        <span className="text-[12px] text-[var(--color-neutro-700)]">{TIPOS_LABEL[evento.tipo]}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0"
                          style={{ background: PERFIL_COLOR[evento.perfil] ?? "#6b7280" }}
                        >
                          {evento.usuario.charAt(0)}
                        </div>
                        <span className="text-[12px] text-[var(--color-neutro-700)] truncate max-w-[100px]">{evento.usuario}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-[12px] text-[var(--color-neutro-600)]">{evento.modulo}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-[12px] text-[var(--color-neutro-700)] truncate block max-w-[300px]" title={evento.accion}>
                        {evento.accion}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedEvento(evento); }}
                        className="p-1 rounded-corner-m hover:bg-[var(--color-neutro-100)] text-[var(--color-neutro-400)] transition-colors cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-[var(--color-neutro-200)] bg-[var(--color-neutro-50)] shrink-0">
            <span className="text-[11px] text-[var(--color-neutro-500)]">
              Mostrando {(pagina * ITEMS_PER_PAGE) + 1}–{Math.min((pagina + 1) * ITEMS_PER_PAGE, filtered.length)} de {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={pagina === 0}
                onClick={() => setPagina((p) => Math.max(0, p - 1))}
                className="px-2.5 py-1 text-[12px] font-semibold rounded-corner-m border border-[var(--color-neutro-200)] bg-white text-[var(--color-neutro-600)] hover:bg-[var(--color-neutro-100)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Anterior
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const start = Math.max(0, Math.min(pagina - 3, totalPages - 7));
                const pageNum = start + i;
                if (pageNum >= totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPagina(pageNum)}
                    className={`w-8 h-8 text-[12px] font-semibold rounded-corner-m transition-colors cursor-pointer ${
                      pagina === pageNum
                        ? "bg-[var(--color-verde-100)] text-white"
                        : "text-[var(--color-neutro-600)] hover:bg-[var(--color-neutro-100)]"
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
              <button
                disabled={pagina >= totalPages - 1}
                onClick={() => setPagina((p) => Math.min(totalPages - 1, p + 1))}
                className="px-2.5 py-1 text-[12px] font-semibold rounded-corner-m border border-[var(--color-neutro-200)] bg-white text-[var(--color-neutro-600)] hover:bg-[var(--color-neutro-100)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedEvento && (
        <DetailModal evento={selectedEvento} onClose={() => setSelectedEvento(null)} />
      )}
    </div>
  );
}
