import { useState, useMemo } from "react";
import { Table, Tabs, Text, Badge, Heading, Input, EmptyState, KpiCard } from "@coe/design-system";
import { FileSpreadsheet } from "lucide-react";
import type { WrCompromiso, Moneda } from "@data/warRoomData";
import { WR_COMMITMENTS, formatCurrency } from "@data/warRoomData";

const FILTER_TABS = [
  { id: "Todos", label: "Todos" },
  { id: "Depósitos", label: "Depósitos" },
  { id: "Retiros", label: "Retiros" },
  { id: "Pendientes", label: "Pendientes" },
  { id: "Aprobados", label: "Aprobados" },
];

const badgeVariant: Record<string, "warning" | "success" | "error"> = {
  Pendiente: "warning",
  Aprobado: "success",
  Rechazado: "error",
};

export function WarRoomCompromisos() {
  const [filter, setFilter] = useState<string>("Todos");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = WR_COMMITMENTS;
    if (filter === "Depósitos") list = list.filter((c) => c.tipo === "Depósito");
    else if (filter === "Retiros") list = list.filter((c) => c.tipo === "Retiro");
    else if (filter === "Pendientes") list = list.filter((c) => c.estado === "Pendiente");
    else if (filter === "Aprobados") list = list.filter((c) => c.estado === "Aprobado");
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) => c.cliente.toLowerCase().includes(q) || c.ref.toLowerCase().includes(q));
    }
    return list;
  }, [filter, search]);

  const kpis = useMemo(() => {
    const total = WR_COMMITMENTS.length;
    const pendientes = WR_COMMITMENTS.filter((c) => c.estado === "Pendiente").length;
    const aprobados = WR_COMMITMENTS.filter((c) => c.estado === "Aprobado").length;
    const rechazados = WR_COMMITMENTS.filter((c) => c.estado === "Rechazado").length;
    const montoTotal = WR_COMMITMENTS.reduce((s, c) => s + c.monto, 0);
    return { total, pendientes, aprobados, rechazados, montoTotal };
  }, []);

  const columns = [
    { key: "ref", label: "Ref.", render: (r: WrCompromiso) => <span className="font-medium">{r.ref}</span> },
    { key: "cliente", label: "Cliente / ID" },
    {
      key: "tipo", label: "Tipo", render: (r: WrCompromiso) => (
        <Badge variant={r.tipo === "Depósito" ? "success" : "warning"} size="sm">{r.tipo}</Badge>
      ),
    },
    { key: "moneda", label: "Moneda" },
    { key: "producto", label: "Producto" },
    { key: "monto", label: "Monto", render: (r: WrCompromiso) => <span className="font-medium">{formatCurrency(r.monto, r.moneda as Moneda)}</span> },
    { key: "piezas", label: "Piezas", render: (r: WrCompromiso) => r.piezas.toLocaleString() },
    { key: "agencia", label: "Agencia" },
    { key: "semana", label: "Semana" },
    { key: "fecha", label: "Fecha" },
    {
      key: "estado", label: "Estado", render: (r: WrCompromiso) => (
        <Badge variant={badgeVariant[r.estado] || "warning"} size="sm">{r.estado}</Badge>
      ),
    },
    { key: "decision", label: "Decisión", render: (r: WrCompromiso) => r.decision || "—" },
  ];

  return (
    <div className="bg-white border border-[var(--color-neutro-200)] rounded-corner-xs">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-[var(--color-neutro-200)]">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-[var(--color-neutro-500)]" />
          <Heading variant="paragraph" as="h3" className="!text-[12px] font-bold">Compromisos Perfil Negocios</Heading>
          <Text variant="caption">· Validación Tesorero</Text>
        </div>
      </div>

      <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--color-neutro-200)]">
        <Tabs tabs={FILTER_TABS} activeTab={filter} onChange={setFilter} variant="pills" />
        <div className="ml-auto">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Buscar cliente, ref..."
            className="!w-[175px] !text-[11px]"
          />
        </div>
      </div>

      <div className="grid grid-cols-5 max-lg:grid-cols-3 max-md:grid-cols-2 gap-2 px-3 py-2.5 border-b border-[var(--color-neutro-200)]">
        {[
          { label: "Total Compromisos", value: String(kpis.total), variant: "azul" as const },
          { label: "Pendientes", value: String(kpis.pendientes), variant: "naranja" as const },
          { label: "Aprobados", value: String(kpis.aprobados), variant: "verde" as const },
          { label: "Rechazados", value: String(kpis.rechazados), variant: "rojo" as const },
          { label: "Monto Comprometido", value: `$${(kpis.montoTotal / 1000).toFixed(0)}K`, variant: "azul" as const },
        ].map((kpi) => (
          <KpiCard key={kpi.label} label={kpi.label} value={kpi.value} variant={kpi.variant} cardVariant="outlined" />
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6m-7 4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
          title="Sin compromisos"
          description="Aún no hay compromisos — regístralos en Perfil Negocios"
        />
      ) : (
        <Table data={filtered} columns={columns} />
      )}
    </div>
  );
}
