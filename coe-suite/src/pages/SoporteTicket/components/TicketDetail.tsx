import { useState } from "react";
import {
  Badge, Avatar, Button, Textarea, Text, Heading,
  ProgressBar, Divider, Card,
} from "@coe/design-system";
import { ArrowLeft, Paperclip, FileText, Image, Video, Trash2, Send } from "lucide-react";
import type { Ticket } from "../data/ticketTypes";
import { STATUS_OPTIONS, STATUS_VARIANTS, PRIORIDAD_VARIANTS } from "../data/ticketTypes";
import { getUserColor, getNameInitials } from "./avatarUtils";

interface TicketDetailProps {
  ticket: Ticket | null;
  onBack: () => void;
  onEdit?: (ticket: Ticket) => void;
  onDelete?: (id: string) => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("es-ES", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `hace ${days}d`;
}

const FILE_ICONS = {
  imagen: <Image className="w-4 h-4" />,
  video: <Video className="w-4 h-4" />,
  documento: <FileText className="w-4 h-4" />,
};

const ACTIVITY_DOT: Record<string, string> = {
  creado: "#16a34a",
  estado: "#2563eb",
  prioridad: "#d97706",
  asignacion: "#7c3aed",
  sla: "#dc2626",
  archivo: "#6366f1",
  sistema: "#94a3b8",
};

function DotIcon({ tipo }: { tipo: string }) {
  const color = ACTIVITY_DOT[tipo] || "#94a3b8";
  return (
    <span
      className="w-2 h-2 rounded-full shrink-0 inline-block"
      style={{ backgroundColor: color }}
    />
  );
}

export function TicketDetail({ ticket, onBack, onEdit, onDelete }: TicketDetailProps) {
  const [comment, setComment] = useState("");
  const canModify = ticket && (ticket.estado === "nuevo" || ticket.estado === "abierto");

  if (!ticket) {
    return (
      <div className="flex items-center justify-center h-full text-[#94a3b8]">
        <Text>Selecciona un ticket para ver el detalle.</Text>
      </div>
    );
  }

  const slaPct = (() => {
    const total = new Date(ticket.slaVencimiento).getTime() - new Date(ticket.fechaCreacion).getTime();
    const restante = new Date(ticket.slaVencimiento).getTime() - Date.now();
    const pct = total > 0 ? Math.min(100, Math.max(0, ((total - restante) / total) * 100)) : 100;
    return { pct, vencido: restante <= 0, restante };
  })();

  const remainingHours = slaPct.restante / 3600000;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[14px] font-bold text-[#2563eb]">{ticket.id}</span>
            <Badge variant={STATUS_VARIANTS[ticket.estado]} size="sm">
              {STATUS_OPTIONS.find((o) => o.value === ticket.estado)?.label}
            </Badge>
            <Badge variant={PRIORIDAD_VARIANTS[ticket.prioridad]} size="sm">
              {ticket.prioridad.charAt(0).toUpperCase() + ticket.prioridad.slice(1)}
            </Badge>
          </div>
        </div>
        {canModify && (
          <div className="flex items-center gap-2">
            {onDelete && (
              <Button variant="outline" size="sm" onClick={() => { onDelete(ticket.id); onBack(); }}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
            {onEdit && (
              <Button variant="primary" size="sm" onClick={() => onEdit(ticket)}>
                Modificar
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0" style={{ display: 'flex', flexDirection: 'row', gap: '1rem', overflow: 'hidden' }}>
        <div className="overflow-y-auto pr-1 space-y-4 min-h-0" style={{ flex: 2 }}>
          <Heading variant="title" className="text-[18px] font-bold text-[#1e293b]">{ticket.titulo}</Heading>

          <Card variant="flat" padding="sm" className="!p-4">
            <Text variant="body" className="text-[14px] leading-relaxed text-[#334155]">{ticket.descripcion}</Text>
          </Card>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <Text variant="caption" className="text-[#94a3b8] uppercase text-[10px] font-semibold">Categoría</Text>
              <Text variant="small" className="font-medium text-[#334155] mt-0.5 block capitalize">{ticket.categoria}</Text>
            </div>
            <div>
              <Text variant="caption" className="text-[#94a3b8] uppercase text-[10px] font-semibold">Departamento</Text>
              <Text variant="small" className="font-medium text-[#334155] mt-0.5 block capitalize">{ticket.departamento}</Text>
            </div>
            <div>
              <Text variant="caption" className="text-[#94a3b8] uppercase text-[10px] font-semibold">Creado el</Text>
              <Text variant="small" className="font-medium text-[#334155] mt-0.5 block">{formatDate(ticket.fechaCreacion)}</Text>
            </div>
            <div>
              <Text variant="caption" className="text-[#94a3b8] uppercase text-[10px] font-semibold">Creado por</Text>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Avatar initials={getNameInitials(ticket.creadoPor.nombre)} size="xs" color={getUserColor(ticket.creadoPor.nombre)} />
                <Text variant="small" className="font-medium text-[#334155]">{ticket.creadoPor.nombre}</Text>
              </div>
            </div>
            <div>
              <Text variant="caption" className="text-[#94a3b8] uppercase text-[10px] font-semibold">Asignado a</Text>
              <div className="flex items-center gap-1 mt-0.5 -space-x-1">
                {ticket.asignadoA.map((p, i) => (
                  <Avatar key={i} initials={getNameInitials(p.nombre)} size="xs" color={getUserColor(p.nombre)} />
                ))}
                <Text variant="small" className="font-medium text-[#334155] ml-1">{ticket.asignadoA.map((p) => p.nombre).join(", ")}</Text>
              </div>
            </div>
            <div>
              <Text variant="caption" className="text-[#94a3b8] uppercase text-[10px] font-semibold">SLA</Text>
              <div className="mt-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[13px] font-bold ${slaPct.vencido ? "text-[#dc2626]" : remainingHours < 4 ? "text-[#d97706]" : "text-[#16a34a]"}`}>
                    {slaPct.vencido ? "Vencido" : `${remainingHours.toFixed(1)}h`}
                  </span>
                  <ProgressBar value={slaPct.pct} variant={slaPct.vencido ? "error" : remainingHours < 4 ? "warning" : "success"} size="sm" className="flex-1" />
                  <Text variant="caption" className="text-[#94a3b8]">{slaPct.pct}%</Text>
                </div>
              </div>
            </div>
          </div>

          {ticket.archivosAdjuntos.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Paperclip className="w-3.5 h-3.5 text-[#94a3b8]" />
                <Text variant="small" className="font-semibold text-[#475569]">
                  Archivos adjuntos ({ticket.archivosAdjuntos.length})
                </Text>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ticket.archivosAdjuntos.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg border border-[#e2e8f0] bg-[#f8fafc]">
                    <div className="w-7 h-7 rounded-md flex items-center justify-center bg-[#e2e8f0] text-[#64748b]">
                      {FILE_ICONS[f.tipo]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Text variant="caption" className="font-medium truncate block text-[#334155]">{f.nombre}</Text>
                      <Text variant="caption" className="text-[#2563eb] text-[9px]">{f.tipo}</Text>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        <div className="flex flex-col border-l border-[#e2e8f0] lg:pl-4 min-h-0" style={{ flex: 1 }}>
          <Heading variant="paragraph" className="font-bold text-[14px] mb-3 text-[#1e293b] shrink-0">
            Conversación ({ticket.comentarios.length})
          </Heading>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {[...ticket.actividad.map((a) => ({ type: "actividad" as const, data: a })), ...ticket.comentarios.map((c) => ({ type: "comentario" as const, data: c }))]
              .sort((a, b) => new Date(a.data.timestamp).getTime() - new Date(b.data.timestamp).getTime())
              .map((entry) => {
                if (entry.type === "actividad") {
                  const a = entry.data;
                  return (
                    <div key={a.id} className="flex items-center gap-2 justify-center">
                      <div className="flex items-center gap-1.5 text-[#94a3b8]">
                        <DotIcon tipo={a.tipo} />
                        <Text variant="caption" className="text-[#64748b]">{a.detalle}</Text>
                        <span className="text-[#cbd5e1]">·</span>
                        <Text variant="caption" className="text-[#94a3b8]">{timeAgo(a.timestamp)}</Text>
                      </div>
                    </div>
                  );
                }
                const c = entry.data;
                const isCreator = c.autor === ticket.creadoPor.nombre;
                return (
                  <div key={c.id} className={`flex gap-2 ${isCreator ? "" : "flex-row-reverse"}`}>
                    <Avatar
                      initials={getNameInitials(c.autor)}
                      size="sm"
                      color={getUserColor(c.autor)}
                      className="mt-1 shrink-0"
                    />
                    <div className={`flex-1 max-w-[90%] ${isCreator ? "" : "items-end flex flex-col"}`}>
                      <div className={`p-3 rounded-xl ${isCreator ? "bg-[#eff6ff] rounded-bl-sm border border-[#bfdbfe]" : "bg-[#f0fdf4] rounded-br-sm border border-[#bbf7d0]"}`}>
                        <div className={`flex items-center gap-1.5 mb-1 flex-wrap ${isCreator ? "" : "flex-row-reverse"}`}>
                          <Text variant="small" className="font-semibold text-[#334155]">{c.autor}</Text>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${isCreator ? "bg-[#dbeafe] text-[#2563eb]" : "bg-[#dcfce7] text-[#16a34a]"}`}>
                            {c.rol}
                          </span>
                          <Text variant="caption" className="text-[#94a3b8]">{timeAgo(c.timestamp)}</Text>
                        </div>
                        <Text variant="body" className="text-[13px] text-[#475569]">{c.mensaje}</Text>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          <Divider className="my-3 shrink-0" />

          <div className="shrink-0 w-full">
            <div className="relative w-full">
              <Textarea
                placeholder="Escribe un comentario..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full pr-11"
              />
              <Button
                variant="primary"
                size="sm"
                disabled={!comment.trim()}
                onClick={() => setComment("")}
                className="absolute bottom-2 right-2"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
