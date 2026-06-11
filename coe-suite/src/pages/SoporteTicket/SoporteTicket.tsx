import { useState, useCallback, useEffect } from "react";
import { Heading, Text, Dialog, Button } from "@coe/design-system";
import { toast } from "sonner";
import { useProfileStore } from "@stores/profileStore";
import { useNavStore } from "@stores/navStore";
import { TicketDashboard } from "./components/TicketDashboard";
import { TicketList } from "./components/TicketList";
import { TicketForm } from "./components/TicketForm";
import { TicketDetail } from "./components/TicketDetail";
import { MOCK_TICKETS } from "./data/ticketMocks";
import type { Ticket } from "./data/ticketTypes";

type View = "list" | "detail";

export function SoporteTicket() {
  const { perfil } = useProfileStore();
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editTicket, setEditTicket] = useState<Ticket | null>(null);
  const [view, setView] = useState<View>("list");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleSelectTicket = useCallback((t: Ticket) => {
    setSelectedTicket(t);
    setView("detail");
  }, []);

  const handleBack = useCallback(() => {
    setSelectedTicket(null);
    setView("list");
  }, []);

  const handleEditTicket = useCallback((t: Ticket) => {
    setEditTicket(t);
    setFormOpen(true);
  }, []);

  const handleNewTicket = useCallback(() => {
    setEditTicket(null);
    setFormOpen(true);
  }, []);

  const handleSave = useCallback((data: Partial<Ticket>) => {
    const now = new Date().toISOString();
    const slaDate = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
    if (data.id && tickets.some((t) => t.id === data.id)) {
      setTickets((prev) => prev.map((t) => t.id === data.id ? { ...t, ...data } as Ticket : t));
    } else {
      const newTicket: Ticket = {
        id: `TCK-BNC-${String(Date.now()).slice(-4)}`,
        titulo: data.titulo || "",
        descripcion: data.descripcion || "",
        categoria: data.categoria || "",
        departamento: data.departamento || "",
        prioridad: (data.prioridad as Ticket["prioridad"]) || "media",
        estado: "nuevo",
        creadoPor: { nombre: "Fabián Dávila", avatar: "" },
        asignadoA: [{ nombre: "Sin asignar", avatar: "" }],
        fechaCreacion: now,
        slaVencimiento: slaDate,
        archivosAdjuntos: [],
        comentarios: [],
        actividad: [
          { id: `act-${Date.now()}`, tipo: "creado", autor: "Fabián Dávila", detalle: "Ticket creado", timestamp: now },
        ],
      };
      setTickets((prev) => [newTicket, ...prev]);
    }
    toast.success(data.id && tickets.some((t) => t.id === data.id) ? "Ticket actualizado correctamente" : "Ticket creado correctamente");
  }, [tickets]);

  const handleDelete = useCallback((id: string) => {
    setTickets((prev) => prev.filter((t) => t.id !== id));
    setView("list");
    setSelectedTicket(null);
    toast.success("Ticket eliminado correctamente");
  }, []);

  const perfilLabel = perfil.charAt(0).toUpperCase() + perfil.slice(1);

  useEffect(() => {
    useNavStore.setState({
      title: view === "detail" && selectedTicket ? `COE Tickets · ${selectedTicket.id}` : "COE Tickets",
      description: view === "detail" && selectedTicket ? `Soporte y Ayuda — ${selectedTicket.titulo}` : "Soporte y Ayuda — COE Tickets",
    });
  }, [view, selectedTicket]);

  return (
    <div className="h-full flex flex-col">
      {view === "list" && (
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div>
            <Heading variant="title" className="font-bold text-[18px]">COE Tickets</Heading>
            <Text variant="caption" className="text-[#2563eb] font-semibold tracking-wider uppercase">
              Perfil: {perfilLabel}
            </Text>
          </div>
        </div>
      )}

      <div className="flex-1 min-h-0">
        {view === "list" ? (
          <div className="h-full overflow-y-auto space-y-4">
            <TicketDashboard tickets={tickets} />
            <TicketList
              tickets={tickets}
              onSelectTicket={handleSelectTicket}
              onNewTicket={handleNewTicket}
            />
          </div>
        ) : (
          <TicketDetail
            ticket={selectedTicket}
            onBack={handleBack}
            onEdit={handleEditTicket}
            onDelete={setConfirmDeleteId}
          />
        )}
      </div>

      <TicketForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
        editTicket={editTicket}
      />

      {confirmDeleteId && (
        <Dialog
          open={!!confirmDeleteId}
          onClose={() => setConfirmDeleteId(null)}
          title="Confirmar eliminación"
          size="sm"
          actions={
            <div className="flex items-center gap-2 justify-end w-full">
              <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteId(null)}>Cancelar</Button>
              <Button variant="primary" size="sm" onClick={() => { handleDelete(confirmDeleteId); setConfirmDeleteId(null); }}>Sí, eliminar</Button>
            </div>
          }
        >
          <Text variant="body">¿Está seguro de que desea eliminar este ticket? Esta acción no se puede deshacer.</Text>
        </Dialog>
      )}
    </div>
  );
}
