import { useState, useEffect, useMemo } from "react";
import { Heading, Text } from "@coe/design-system";
import { LayoutDashboard, Save } from "lucide-react";
import { useNavStore } from "@stores/navStore";
import { useReportesStore } from "./stores/reportesStore";
import { REPORTS_MOCK, FOLDERS_MOCK } from "./data/reportesMocks";
import { ReportSelector } from "./components/ReportSelector";
import { ReportPreview } from "./components/ReportPreview";
import { SaveReportModal } from "./components/SaveReportModal";
import { ExportMenu } from "./components/ExportMenu";
import { CreateDashboardModal } from "./components/CreateDashboardModal";

export function Reportes() {
  const [selectedReportId, setSelectedReportId] = useState("");
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [dashboardModalOpen, setDashboardModalOpen] = useState(false);
  const {
    columnAggregations,
    groupByConfig,
    setColumnAggregations,
    setGroupByConfig,
    initFolders,
  } = useReportesStore();

  useEffect(() => {
    useNavStore.setState({
      title: "Reportes",
      description: "Unificación de reportes operativos y regulatorios",
    });
  }, []);

  useEffect(() => {
    if (useReportesStore.getState().folders.length === 0) {
      initFolders(FOLDERS_MOCK);
    }
  }, [initFolders]);

  const selectedReport = useMemo(
    () => REPORTS_MOCK.find((r) => r.id === selectedReportId) ?? null,
    [selectedReportId]
  );

  const currentColumnConfig = useMemo(() => {
    if (!selectedReport) return [];
    return selectedReport.columns
      .filter((c) => c.visible)
      .sort((a, b) => a.order - b.order)
      .map((c) => ({ key: c.key, label: c.label, visible: c.visible, order: c.order }));
  }, [selectedReport]);

  const handleSave = () => {
    setSaveModalOpen(true);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <Heading variant="title" className="font-bold text-[18px]">
            Reportes
          </Heading>
          <Text variant="caption" className="text-[var(--color-verde-100)] font-semibold tracking-wider uppercase">
            Catálogo unificado · Operativos y Regulatorios
          </Text>
        </div>
        {selectedReport && (
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-1.5 px-3 py-2 text-[13px] font-semibold bg-white border border-[var(--color-neutro-200)] text-[var(--color-neutro-700)] rounded-corner-m hover:bg-[var(--color-neutro-100)] transition-colors cursor-pointer"
              onClick={() => setDashboardModalOpen(true)}
            >
              <LayoutDashboard className="w-4 h-4" />
              Crear Dashboard
            </button>
            <ExportMenu />
            {selectedReport.categoria === "plantilla" && (
              <button
                className="flex items-center gap-1.5 px-3 py-2 text-[13px] font-semibold bg-[var(--color-verde-100)] text-white rounded-corner-m hover:brightness-110 transition-colors cursor-pointer"
                onClick={handleSave}
              >
                <Save className="w-4 h-4" />
                Guardar Reporte Personalizado
              </button>
            )}
          </div>
        )}
      </div>

      {/* Selector */}
      <div className="mb-4 shrink-0">
        <ReportSelector
          reports={REPORTS_MOCK}
          value={selectedReportId}
          onChange={setSelectedReportId}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {!selectedReport ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-corner-m bg-[var(--color-neutro-100)] flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-[var(--color-neutro-300)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-[16px] font-bold text-[var(--color-neutro-900)] mb-2">
              Seleccione un Reporte
            </h3>
            <p className="text-[13px] text-[var(--color-neutro-500)] max-w-md">
              Elija un reporte del catálogo para visualizar sus datos. Los reportes tipo{" "}
              <strong>Plantilla</strong> permiten personalizar columnas, filtros y agregaciones.
            </p>
          </div>
        ) : (
          <div className="pb-4">
            <div className="mb-3">
              <h3 className="text-[15px] font-bold text-[var(--color-neutro-900)]">
                {selectedReport.nombre}
              </h3>
              <p className="text-[12px] text-[var(--color-neutro-500)]">
                {selectedReport.descripcion}
              </p>
            </div>
            <ReportPreview
              report={selectedReport}
              columnAggregations={columnAggregations}
              groupByConfig={groupByConfig}
              onColumnAggregationsChange={setColumnAggregations}
              onGroupByConfigChange={setGroupByConfig}
            />
          </div>
        )}
      </div>

      <SaveReportModal
        open={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        report={selectedReport}
        columnConfig={currentColumnConfig}
      />
      <CreateDashboardModal
        open={dashboardModalOpen}
        onClose={() => setDashboardModalOpen(false)}
        report={selectedReport}
      />
    </div>
  );
}
