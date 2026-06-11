import { KpiCard, Card, Text } from "@coe/design-system";
import { TrendingUp, Printer } from "lucide-react";
import type { Ticket, TicketStatus as TicketStatusType } from "../data/ticketTypes";
import { SlaGauge } from "./SlaGauge";

interface TicketDashboardProps {
  tickets: Ticket[];
}

const COUNTER_CONFIG: { label: string; status: TicketStatusType[]; variant: "azul" | "verde" | "naranja" | "rojo" | "morado" | "acua" }[] = [
  { label: "Tickets Abiertos", status: ["nuevo", "abierto"], variant: "azul" },
  { label: "En Revisión Técnica", status: ["en-revision-tecnica"], variant: "naranja" },
  { label: "En Certificación", status: ["en-certificacion"], variant: "morado" },
  { label: "Resueltos / Cerrados", status: ["resuelto", "cerrado"], variant: "verde" },
];

function countByStatus(tickets: Ticket[], statuses: TicketStatusType[]) {
  return tickets.filter((t) => statuses.includes(t.estado)).length;
}

function slaCompliance(tickets: Ticket[]) {
  const total = tickets.filter((t) => t.estado !== "nuevo").length;
  const onTime = tickets.filter((t) => {
    if (t.estado === "nuevo") return false;
    return new Date() <= new Date(t.slaVencimiento);
  }).length;
  return total > 0 ? Math.round((onTime / total) * 100) : 100;
}

export function TicketDashboard({ tickets }: TicketDashboardProps) {
  const sla = slaCompliance(tickets);
  return (
    <div className="grid grid-cols-5 gap-2">
      {COUNTER_CONFIG.map((cfg) => {
        const count = countByStatus(tickets, cfg.status);
        return (
          <KpiCard
            key={cfg.label}
            label={cfg.label}
            value={count}
            variant={cfg.variant}
            cardVariant="outlined"
          />
        );
      })}
      <Card variant="outlined" padding="sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-[var(--color-verde-100)]" />
            <Text variant="caption" className="font-semibold">Cumplimiento SLA</Text>
          </div>
          <Printer className="w-3.5 h-3.5 text-[var(--color-neutro-500)] cursor-pointer hover:text-[var(--color-neutro-900)]" />
        </div>
        <SlaGauge value={sla} />
      </Card>
    </div>
  );
}
