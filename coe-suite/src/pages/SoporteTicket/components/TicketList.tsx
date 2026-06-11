import { useState, useMemo } from "react";
import {
  Card, Table, Select, Badge, Button,
  Avatar, Text, SearchBar, Pagination, Heading,
} from "@coe/design-system";
import type { Ticket } from "../data/ticketTypes";
import {
  PRIORIDAD_OPTIONS, STATUS_OPTIONS, CATEGORIA_OPTIONS,
  STATUS_VARIANTS,
} from "../data/ticketTypes";
import { getUserColor, getNameInitials } from "./avatarUtils";
import { PriorityFlag } from "./PriorityFlag";

interface TicketListProps {
  tickets: Ticket[];
  onSelectTicket: (ticket: Ticket) => void;
  onNewTicket: () => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

const SIN_ASIGNAR = { nombre: "Sin asignar", avatar: "" };

function AssigneeAvatars({ assignees }: { assignees: Ticket["asignadoA"] }) {
  const list = assignees.length === 0 ? [SIN_ASIGNAR] : assignees;
  const max = 3;
  const visible = list.slice(0, max);
  const rest = list.length - max;
  return (
    <div className="flex items-center -space-x-1.5">
      {visible.map((p, i) => (
        <Avatar
          key={i}
          initials={getNameInitials(p.nombre)}
          size="xs"
          color={getUserColor(p.nombre)}
        />
      ))}
      {rest > 0 && (
        <Text variant="caption" className="text-[var(--color-neutro-500)] ml-1">+{rest}</Text>
      )}
    </div>
  );
}

export function TicketList({ tickets, onSelectTicket, onNewTicket }: TicketListProps) {
  const [prioridad, setPrioridad] = useState("");
  const [estado, setEstado] = useState("");
  const [categoria, setCategoria] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    let result = tickets;
    if (prioridad) result = result.filter((t) => t.prioridad === prioridad);
    if (estado) result = result.filter((t) => t.estado === estado);
    if (categoria) result = result.filter((t) => t.categoria === categoria);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((t) =>
        t.id.toLowerCase().includes(q) ||
        t.titulo.toLowerCase().includes(q) ||
        t.creadoPor.nombre.toLowerCase().includes(q)
      );
    }
    return result;
  }, [tickets, prioridad, estado, categoria, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const columns = [
    {
      key: "id", label: "ID",
      render: (row: Ticket) => (
        <div className="cursor-pointer" onClick={() => onSelectTicket(row)}>
          <Text variant="small" className="font-mono font-semibold text-[var(--color-neutro-900)]">{row.id}</Text>
        </div>
      ),
    },
    {
      key: "titulo", label: "Título",
      render: (row: Ticket) => (
        <div className="cursor-pointer" onClick={() => onSelectTicket(row)}>
          <Text variant="small" className="font-semibold text-[var(--color-neutro-900)]">{row.titulo}</Text>
        </div>
      ),
    },
    {
      key: "prioridad", label: "Prioridad",
      render: (row: Ticket) => (
        <div className="cursor-pointer" onClick={() => onSelectTicket(row)}>
          <PriorityFlag prioridad={row.prioridad} />
        </div>
      ),
    },
    {
      key: "estado", label: "Estado",
      render: (row: Ticket) => (
        <div className="cursor-pointer" onClick={() => onSelectTicket(row)}>
          <Badge variant={STATUS_VARIANTS[row.estado]} size="sm">
            {STATUS_OPTIONS.find((o) => o.value === row.estado)?.label || row.estado}
          </Badge>
        </div>
      ),
    },
    {
      key: "asignado", label: "Asignado a",
      render: (row: Ticket) => (
        <div className="cursor-pointer" onClick={() => onSelectTicket(row)}>
          <AssigneeAvatars assignees={row.asignadoA} />
        </div>
      ),
    },
    {
      key: "fecha", label: "Creado",
      render: (row: Ticket) => (
        <div className="cursor-pointer" onClick={() => onSelectTicket(row)}>
          <Text variant="caption" className="text-[var(--color-neutro-500)]">{formatDate(row.fechaCreacion)}</Text>
        </div>
      ),
    },
    {
      key: "sla", label: "Vencimiento SLA",
      render: (row: Ticket) => (
        <div className="cursor-pointer" onClick={() => onSelectTicket(row)}>
          <Text variant="caption" className={row.estado === "cerrado" ? "text-[var(--color-verde-100)] font-semibold" : "text-[var(--color-neutro-500)]"}>
            {row.estado === "cerrado" && row.fechaCierre
              ? formatDate(row.fechaCierre)
              : formatDate(row.slaVencimiento)}
          </Text>
        </div>
      ),
    },
    {
      key: "cerrado", label: "Cerrado",
      render: (row: Ticket) => (
        <div className="cursor-pointer" onClick={() => onSelectTicket(row)}>
          <Text variant="caption" className="text-[var(--color-neutro-500)]">
            {row.estado === "cerrado" && row.fechaCierre ? formatDate(row.fechaCierre) : "—"}
          </Text>
        </div>
      ),
    },
  ];

  return (
    <Card variant="outlined" padding="md">
      <style>{`.ticket-table table tbody tr { cursor: pointer; }`}</style>
      <div className="flex items-center justify-between mb-4">
        <Heading variant="paragraph" className="font-bold text-[15px]">Tickets</Heading>
        <Button variant="primary" size="sm" onClick={onNewTicket}>+ Nuevo Ticket</Button>
      </div>

      <div className="flex flex-row flex-wrap items-center gap-2 mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar por ID, título o creador..." className="min-w-[200px] flex-1" />
        <Select options={[{ value: "", label: "Prioridad" }, ...PRIORIDAD_OPTIONS]} value={prioridad} onChange={setPrioridad} />
        <Select options={[{ value: "", label: "Estado" }, ...STATUS_OPTIONS]} value={estado} onChange={setEstado} />
        <Select options={[{ value: "", label: "Categoría" }, ...CATEGORIA_OPTIONS]} value={categoria} onChange={setCategoria} />
        {filtered.length !== tickets.length && (
          <Badge variant="info" size="sm" className="shrink-0">{filtered.length} resultados</Badge>
        )}
      </div>

      <div className="overflow-x-auto ticket-table">
        <Table data={paginated} columns={columns} />
      </div>

      {paginated.length === 0 && (
        <div className="py-8 text-center">
          <Text variant="body" className="text-[var(--color-neutro-500)]">No se encontraron tickets.</Text>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <Pagination current={page} total={totalPages} onChange={setPage} showJump />
        </div>
      )}
    </Card>
  );
}
