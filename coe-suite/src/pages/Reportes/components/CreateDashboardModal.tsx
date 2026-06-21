import { useState, useMemo } from "react";
import { Dialog, Button, Select, Input } from "@coe/design-system";
import { BarChart3, PieChart, TrendingUp, LayoutList, AreaChart, Combine, FileText, Map, ScatterChart, GitCompare, GitFork, Hash, Table, Gauge, Circle, ArrowUpDown, Layers, Eye, Plus, ArrowLeft } from "lucide-react";
import { FolderExplorer } from "./FolderExplorer";
import { useReportesStore } from "../stores/reportesStore";
import type { Reporte, ChartType, ChartConfig, DashboardWidget } from "../data/reportesTypes";

const CHART_TYPES: { type: ChartType; label: string; icon: typeof BarChart3 }[] = [
  { type: "bar", label: "Barra", icon: BarChart3 },
  { type: "line", label: "Línea", icon: TrendingUp },
  { type: "pie", label: "Pastel", icon: PieChart },
  { type: "row", label: "Fila", icon: LayoutList },
  { type: "area", label: "Área", icon: AreaChart },
  { type: "combo", label: "Combinación", icon: Combine },
  { type: "detail", label: "Detalle", icon: FileText },
  { type: "map", label: "Mapa", icon: Map },
  { type: "scatter", label: "Dispersión", icon: ScatterChart },
  { type: "waterfall", label: "Cascada", icon: GitCompare },
  { type: "sankey", label: "Sankey", icon: GitFork },
  { type: "number", label: "Número", icon: Hash },
  { type: "pivot", label: "Tabla Dinámica", icon: Table },
  { type: "trend", label: "Tendencia", icon: Gauge },
  { type: "counter", label: "Contador", icon: Circle },
  { type: "progress", label: "Progreso", icon: ArrowUpDown },
  { type: "funnel", label: "Embudo", icon: Layers },
];

function defaultConfig(chartType: ChartType): ChartConfig {
  return {
    chartType,
    title: "",
    xAxis: [],
    yAxis: [],
  };
}

/* ── SVG chart previews ── */

function BarPreview({ data, w, h }: { data: number[]; w: number; h: number }) {
  const max = Math.max(...data, 1);
  const pad = 4;
  const bw = (w - pad * 2) / data.length;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {data.map((v, i) => {
        const bh = (v / max) * (h - pad * 2);
        return <rect key={i} x={pad + i * bw + 1} y={h - pad - bh} width={Math.max(bw - 2, 2)} height={bh} fill="var(--color-verde-100)" rx={1} />;
      })}
    </svg>
  );
}

function LinePreview({ data, w, h }: { data: number[]; w: number; h: number }) {
  const max = Math.max(...data, 1);
  const pad = 4;
  if (data.length < 2) return null;
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - (v / max) * (h - pad * 2);
    return `${x},${y}`;
  });
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={pts.join(" ")} fill="none" stroke="var(--color-verde-100)" strokeWidth={2} />
      {data.map((v, i) => {
        const x = pad + (i / (data.length - 1)) * (w - pad * 2);
        const y = h - pad - (v / max) * (h - pad * 2);
        return <circle key={i} cx={x} cy={y} r={2} fill="var(--color-verde-100)" />;
      })}
    </svg>
  );
}

function PiePreview({ data, labels: _labels, w, h }: { data: number[]; labels: string[]; w: number; h: number }) {
  const total = data.reduce((a, b) => a + b, 0) || 1;
  const colors = ["#16a34a", "#22c55e", "#4ade80", "#86efac", "#bbf7d0", "#dcfce7", "#14532d", "#166534", "#15803d", "#5eead4"];
  const cx = w / 2, cy = h / 2, r = Math.min(cx, cy) - 4;
  let cum = 0;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {data.map((v, i) => {
        const angle = (v / total) * 360;
        const rad1 = ((cum - 90) * Math.PI) / 180;
        const rad2 = ((cum + angle - 90) * Math.PI) / 180;
        const x1 = cx + r * Math.cos(rad1);
        const y1 = cy + r * Math.sin(rad1);
        const x2 = cx + r * Math.cos(rad2);
        const y2 = cy + r * Math.sin(rad2);
        const large = angle > 180 ? 1 : 0;
        cum += angle;
        return <path key={i} d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`} fill={colors[i % colors.length]} stroke="#fff" strokeWidth={1} />;
      })}
      <circle cx={cx} cy={cy} r={r * 0.5} fill="#fff" />
    </svg>
  );
}

function NumberPreview({ value, w, h }: { value: number; w: number; h: number }) {
  return (
    <div className="flex items-center justify-center w-full h-full" style={{ width: w, height: h }}>
      <span className="text-[22px] font-bold text-[var(--color-verde-100)]">
        {value.toLocaleString("es-ES")}
      </span>
    </div>
  );
}

function ProgressPreview({ current, target, w, h }: { current: number; target: number; w: number; h: number }) {
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-1" style={{ width: w, height: h }}>
      <div className="w-[80%] h-3 bg-[var(--color-neutro-200)] rounded-full overflow-hidden">
        <div className="h-full bg-[var(--color-verde-100)] rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] font-semibold text-[var(--color-neutro-600)]">{Math.round(pct)}%</span>
    </div>
  );
}

function extractData(report: Reporte, config: ChartConfig): { labels: string[]; values: number[] } {
  const labelKey = config.xAxis[0] ?? config.category?.[0] ?? config.stageColumn ?? config.dateColumn ?? config.sourceColumn ?? "";
  const valueKey = config.yAxis[0] ?? config.valueColumn ?? "";
  const labels: string[] = [];
  const values: number[] = [];
  report.data.slice(0, 8).forEach((row) => {
    const lbl = labelKey ? String(row[labelKey] ?? "") : "";
    const val = valueKey ? Number(row[valueKey] ?? 0) : 0;
    if (lbl || val) {
      labels.push(lbl || `#${labels.length + 1}`);
      values.push(val);
    }
  });
  return { labels, values };
}

/* ── Widget preview card ── */

function WidgetPreviewCard({ widget, report }: { widget: DashboardWidget; report: Reporte }) {
  const { labels, values } = extractData(report, widget.config);
  const W = 220, H = 120;

  const renderPreview = () => {
    switch (widget.config.chartType) {
      case "bar":
      case "row":
        return <BarPreview data={values} w={W} h={H} />;
      case "line":
      case "trend":
      case "area":
        return <LinePreview data={values} w={W} h={H} />;
      case "pie":
        return <PiePreview data={values} labels={labels} w={W} h={H} />;
      case "number":
      case "counter":
        return <NumberPreview value={values[0] ?? 0} w={W} h={H} />;
      case "progress":
        return <ProgressPreview current={values[0] ?? 0} target={values[1] ?? values[0] ?? 1} w={W} h={H} />;
      default:
        return <BarPreview data={values} w={W} h={H} />;
    }
  };

  return (
    <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m overflow-hidden">
      <div className="px-3 py-2 border-b border-[var(--color-neutro-100)] bg-[var(--color-neutro-50)]">
        <p className="text-[12px] font-semibold text-[var(--color-neutro-700)] truncate">{widget.title}</p>
      </div>
      <div className="p-3 flex items-center justify-center min-h-[140px]">
        {values.length > 0 ? renderPreview() : (
          <span className="text-[12px] text-[var(--color-neutro-400)] italic">Configure columnas para ver datos</span>
        )}
      </div>
      <div className="px-3 py-1.5 border-t border-[var(--color-neutro-100)] bg-[var(--color-neutro-50)] flex items-center gap-2">
        {labels.length > 0 && (
          <span className="text-[10px] text-[var(--color-neutro-500)] truncate">{labels.slice(0, 3).join(" · ")}{labels.length > 3 ? "…" : ""}</span>
        )}
        <span className="ml-auto text-[10px] text-[var(--color-neutro-400)] uppercase">{widget.config.chartType}</span>
      </div>
    </div>
  );
}

/* ── Modal ── */

interface CreateDashboardModalProps {
  open: boolean;
  onClose: () => void;
  report: Reporte | null;
}

export function CreateDashboardModal({ open, onClose, report }: CreateDashboardModalProps) {
  const { folders, savedReports, addFolder, saveReport } = useReportesStore();
  const [step, setStep] = useState<"select" | "config" | "preview" | "save">("select");
  const [selectedType, setSelectedType] = useState<ChartType | null>(null);
  const [config, setConfig] = useState<ChartConfig>(defaultConfig("bar"));
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);

  const textColumns = useMemo(() => {
    if (!report) return [];
    return report.columns.filter((c) => c.visible && c.dataType === "text").map((c) => ({ value: c.key, label: c.label }));
  }, [report]);

  const numericColumns = useMemo(() => {
    if (!report) return [];
    return report.columns.filter((c) => c.visible && c.dataType === "number").map((c) => ({ value: c.key, label: c.label }));
  }, [report]);

  const dateColumns = useMemo(() => {
    if (!report) return [];
    return report.columns.filter((c) => c.visible && c.dataType === "date").map((c) => ({ value: c.key, label: c.label }));
  }, [report]);

  const allColumns = useMemo(() => {
    if (!report) return [];
    return report.columns.filter((c) => c.visible).map((c) => ({ value: c.key, label: c.label }));
  }, [report]);

  if (!report) return null;

  const handleSelectType = (type: ChartType) => {
    setSelectedType(type);
    setConfig(defaultConfig(type));
    setStep("config");
  };

  const handleAddWidget = () => {
    if (!config.title.trim()) return;
    setWidgets((prev) => [
      ...prev,
      { id: `w-${Date.now()}`, title: config.title.trim(), config: { ...config } },
    ]);
    setStep("select");
    setSelectedType(null);
  };

  const handleSaveDashboard = () => {
    if (widgets.length === 0) return;
    const folderId = selectedFolderId ?? folders.find((f) => f.parentId === null)?.id ?? "root";
    for (const widget of widgets) {
      saveReport({
        id: `dash-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        nombre: widget.title,
        reporteBaseId: report.id,
        folderId,
        columnConfig: report.columns.map((c) => ({ key: c.key, label: c.label, visible: c.visible, order: c.order })),
        createdAt: new Date().toISOString(),
        tipo: "dashboard",
      });
    }
    setSelectedFolderId(null);
    setWidgets([]);
    setStep("select");
    setSelectedType(null);
    onClose();
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    addFolder({
      id: `folder-${Date.now()}`,
      nombre: newFolderName.trim(),
      parentId: selectedFolderId,
    });
    setNewFolderName("");
    setCreatingFolder(false);
  };

  const renderConfig = () => {
    if (!selectedType) return null;
    const ct = selectedType;

    const setAxis = (field: string, value: string | string[]) => {
      setConfig((prev) => ({ ...prev, [field]: Array.isArray(value) ? value : [value] }));
    };

    return (
      <div className="space-y-3">
        <Input
          label="Título del indicador"
          placeholder="Ej: Ingresos por mes"
          value={config.title}
          onChange={(e) => setConfig((prev) => ({ ...prev, title: e.target.value }))}
        />

        {["bar", "line", "area", "scatter", "combo", "row"].includes(ct) && (
          <>
            <Select label="Eje X (Categorías)" options={allColumns} value={config.xAxis[0] ?? ""} onChange={(v) => setAxis("xAxis", v)} />
            <Select label="Eje Y (Valores)" options={numericColumns} value={config.yAxis[0] ?? ""} onChange={(v) => setAxis("yAxis", v)} />
          </>
        )}

        {ct === "pie" && (
          <>
            <Select label="Anillos (Categorías)" options={textColumns} value={config.category?.[0] ?? ""} onChange={(v) => setConfig((prev) => ({ ...prev, category: [v], xAxis: [v] }))} />
            <Select label="Valor" options={numericColumns} value={config.yAxis[0] ?? ""} onChange={(v) => setAxis("yAxis", v)} />
          </>
        )}

        {ct === "detail" && (
          <Select label="Columnas a mostrar" options={allColumns} value={config.detailColumns?.[0] ?? ""} onChange={(v) => setConfig((prev) => ({ ...prev, detailColumns: [v] }))} />
        )}

        {ct === "map" && (
          <>
            <Select label="Ubicación" options={allColumns} value={config.locationColumn ?? ""} onChange={(v) => setConfig((prev) => ({ ...prev, locationColumn: v }))} />
            <Select label="Valor" options={numericColumns} value={config.valueColumn ?? ""} onChange={(v) => setConfig((prev) => ({ ...prev, valueColumn: v }))} />
          </>
        )}

        {ct === "waterfall" && (
          <>
            <Select label="Categoría" options={allColumns} value={config.xAxis[0] ?? ""} onChange={(v) => setAxis("xAxis", v)} />
            <Select label="Valor" options={numericColumns} value={config.yAxis[0] ?? ""} onChange={(v) => setAxis("yAxis", v)} />
          </>
        )}

        {ct === "sankey" && (
          <>
            <Select label="Origen" options={allColumns} value={config.sourceColumn ?? ""} onChange={(v) => setConfig((prev) => ({ ...prev, sourceColumn: v }))} />
            <Select label="Destino" options={allColumns} value={config.targetColumn ?? ""} onChange={(v) => setConfig((prev) => ({ ...prev, targetColumn: v }))} />
            <Select label="Valor" options={numericColumns} value={config.valueColumn ?? ""} onChange={(v) => setConfig((prev) => ({ ...prev, valueColumn: v }))} />
          </>
        )}

        {["number", "counter"].includes(ct) && (
          <Select label="Valor" options={numericColumns} value={config.valueColumn ?? ""} onChange={(v) => setConfig((prev) => ({ ...prev, valueColumn: v }))} />
        )}

        {ct === "pivot" && (
          <>
            <Select label="Filas" options={allColumns} value={config.pivotRows?.[0] ?? ""} onChange={(v) => setConfig((prev) => ({ ...prev, pivotRows: [v] }))} />
            <Select label="Columnas" options={allColumns} value={config.pivotColumns?.[0] ?? ""} onChange={(v) => setConfig((prev) => ({ ...prev, pivotColumns: [v] }))} />
            <Select label="Valores" options={numericColumns} value={config.pivotValues?.[0] ?? ""} onChange={(v) => setConfig((prev) => ({ ...prev, pivotValues: [v] }))} />
          </>
        )}

        {ct === "trend" && (
          <>
            <Select label="Fecha" options={dateColumns} value={config.dateColumn ?? ""} onChange={(v) => setConfig((prev) => ({ ...prev, dateColumn: v }))} />
            <Select label="Valor" options={numericColumns} value={config.yAxis[0] ?? ""} onChange={(v) => setAxis("yAxis", v)} />
          </>
        )}

        {ct === "progress" && (
          <>
            <Select label="Valor Actual" options={numericColumns} value={config.valueColumn ?? ""} onChange={(v) => setConfig((prev) => ({ ...prev, valueColumn: v }))} />
            <Select label="Valor Meta" options={numericColumns} value={config.targetValue ?? ""} onChange={(v) => setConfig((prev) => ({ ...prev, targetValue: v }))} />
          </>
        )}

        {ct === "funnel" && (
          <>
            <Select label="Etapa" options={textColumns} value={config.stageColumn ?? ""} onChange={(v) => setConfig((prev) => ({ ...prev, stageColumn: v }))} />
            <Select label="Valor" options={numericColumns} value={config.valueColumn ?? ""} onChange={(v) => setConfig((prev) => ({ ...prev, valueColumn: v }))} />
          </>
        )}

        <div className="flex items-center gap-1.5 pt-2">
          <Button variant="primary" disabled={!config.title.trim()} onClick={handleAddWidget} className="!text-[11px] !px-2 !py-1">
            <Plus className="w-3 h-3" /> Agregar indicador
          </Button>
          <Button variant="ghost" onClick={() => setStep("select")} className="!text-[11px] !px-2 !py-1">
            Cancelar
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} title={step === "preview" ? "Vista previa del Gráfico" : "Crear Gráficos"} size="md">
      {step === "select" && (
        <div className="space-y-4">
          <p className="text-[13px] text-[var(--color-neutro-600)]">
            Seleccione el tipo de indicador que desea agregar:
          </p>
          <div className="grid grid-cols-3 gap-2 max-h-[296px] overflow-y-auto">
            {CHART_TYPES.map((ct) => {
              const Icon = ct.icon;
              return (
                <button
                  key={ct.type}
                  className="flex flex-col items-center gap-1 p-2 border border-[var(--color-neutro-200)] rounded-corner-m bg-white hover:border-[var(--color-verde-100)] hover:bg-[var(--color-verde-100)]/5 transition-colors cursor-pointer"
                  onClick={() => handleSelectType(ct.type)}
                >
                  <Icon className="w-4 h-4 text-[var(--color-neutro-500)]" />
                  <span className="text-[10px] font-medium text-[var(--color-neutro-700)] text-center leading-tight">
                    {ct.label}
                  </span>
                </button>
              );
            })}
          </div>
          {widgets.length > 0 && (
            <div className="border-t border-[var(--color-neutro-200)] pt-3">
              <p className="text-[12px] font-semibold text-[var(--color-neutro-600)] mb-2">
                Indicadores agregados ({widgets.length})
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {widgets.map((w) => (
                  <span key={w.id} className="px-2 py-1 text-[11px] bg-[var(--color-verde-100)]/10 text-[var(--color-verde-100)] border border-[var(--color-verde-100)]/20 rounded-corner-m">
                    {w.title}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <Button variant="primary" onClick={() => setStep("preview")} className="!text-[11px] !px-2 !py-1">
                  <Eye className="w-3 h-3" /> Vista Previa
                </Button>
                <Button variant="outline" onClick={() => setStep("save")} className="!text-[11px] !px-2 !py-1">
                  Guardar
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {step === "config" && renderConfig()}

      {step === "preview" && (
        <div className="space-y-4">
          <p className="text-[13px] text-[var(--color-neutro-600)]">
            Así se ve tu dashboard con {widgets.length} indicador{widgets.length !== 1 ? "es" : ""}:
          </p>
          <div className="grid grid-cols-1 gap-3 max-h-[420px] overflow-y-auto pr-1">
            {widgets.map((w) => (
              <WidgetPreviewCard key={w.id} widget={w} report={report} />
            ))}
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-[var(--color-neutro-200)]">
            <Button variant="ghost" onClick={() => setStep("select")} className="!text-[11px] !px-2 !py-1">
              <ArrowLeft className="w-3 h-3" /> Seguir agregando
            </Button>
            <div className="flex items-center gap-1.5">
              <Button variant="primary" onClick={() => setStep("save")} className="!text-[11px] !px-2 !py-1">
                Guardar en carpeta
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === "save" && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[12px] font-semibold text-[var(--color-neutro-600)] uppercase tracking-wide">
                Ubicación
              </p>
              <button
                className="flex items-center gap-1 text-[12px] text-[var(--color-verde-100)] font-medium hover:underline"
                onClick={() => setCreatingFolder(!creatingFolder)}
              >
                <Layers className="w-3.5 h-3.5" /> Nueva Carpeta
              </button>
            </div>

            {creatingFolder && (
              <div className="flex items-center gap-2 mb-2 p-2 bg-[var(--color-neutro-50)] border border-[var(--color-neutro-200)] rounded-corner-m">
                <Input
                  placeholder="Nombre de la carpeta"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="flex-1"
                />
                <Button variant="primary" size="sm" onClick={handleCreateFolder}>
                  Crear
                </Button>
              </div>
            )}

            <div className="max-h-[240px] overflow-y-auto border border-[var(--color-neutro-200)] rounded-corner-m p-2">
              <FolderExplorer
                folders={folders}
                savedReports={savedReports}
                selectedFolderId={selectedFolderId}
                onSelectFolder={setSelectedFolderId}
                onAddFolder={(parentId) => {
                  setSelectedFolderId(parentId);
                  setCreatingFolder(true);
                }}
                rootFolderId="mis-reportes"
              />
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {widgets.map((w) => (
              <span key={w.id} className="px-2 py-1 text-[11px] bg-[var(--color-verde-100)]/10 text-[var(--color-verde-100)] border border-[var(--color-verde-100)]/20 rounded-corner-m">
                {w.title}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-end gap-1.5 pt-2">
            <Button variant="ghost" onClick={onClose} className="!text-[11px] !px-2 !py-1">
              Cancelar
            </Button>
            <Button variant="primary" disabled={widgets.length === 0} onClick={handleSaveDashboard} className="!text-[11px] !px-2 !py-1">
                Guardar Gráficos
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}