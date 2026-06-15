import { useState, useEffect } from "react";
import { useNavStore } from "../stores/navStore";
import { useUserStore } from "../stores/userStore";
import { useLocation, useNavigate } from "react-router-dom";
import { MODULES } from "../data/navigation";
import { ProfileSelector } from "../components/ui/ProfileSelector";
import { CentralSelector } from "../components/ui/CentralSelector";
import { Modal } from "../components/ui/Modal";
import { Breadcrumbs } from "@coe/design-system";
import { useTransaccionesStore } from "../stores/transaccionesStore";
import { FolderOpen } from "lucide-react";
import {
  HiOutlineBell,
  HiOutlinePlus,
} from "react-icons/hi2";

function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="text-[12px] text-[var(--color-neutro-500)] font-medium tabular-nums">
      {time.toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
    </span>
  );
}

export function Topbar() {
  const { title, description } = useNavStore();
  const user = useUserStore((s) => s.current);
  const location = useLocation();
  const navigate = useNavigate();
  const { procesosFinalizados } = useTransaccionesStore();
  const [showNewOp, setShowNewOp] = useState(false);
  const [opSearch, setOpSearch] = useState("");

  const currentSection = MODULES.find((m) =>
    m.items.some((i) => i.route === location.pathname),
  );

  const breadcrumbItems = [
    ...(currentSection ? [{ label: currentSection.label }] : []),
    { label: title },
  ];

  return (
    <header className="h-[58px] bg-white/70 backdrop-blur-xl border-b border-[var(--color-neutro-200)] flex items-center justify-between px-6 flex-shrink-0 relative z-20">
      {/* Left: breadcrumb + title */}
      <div>
        <Breadcrumbs
          items={breadcrumbItems}
          className="[&_span:last-of-type]:text-[var(--color-verde-100)] [&_span:last-of-type]:font-semibold"
        />
        <p className="text-[11px] text-[var(--color-neutro-500)] mt-0.5">
          {description}
        </p>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        <ProfileSelector />
        <CentralSelector />

        <button
          className="relative w-[34px] h-[34px] border border-[var(--color-neutro-200)] rounded-corner-xs bg-white text-[var(--color-neutro-500)] flex items-center justify-center cursor-pointer transition-all hover:border-[var(--color-verde-100)] hover:text-[var(--color-verde-100)] hover:bg-[var(--color-surface-darkwhite)]"
          title="Notificaciones"
        >
          <HiOutlineBell className="w-[15px] h-[15px]" />
          <span className="absolute -top-[1px] -right-[1px] w-2 h-2 bg-[var(--color-ind-rojo)] rounded-full border-2 border-white" />
        </button>

        <div className="flex items-center gap-2 px-3 border-x border-[var(--color-neutro-200)] h-[34px]">
          <Clock />
        </div>

        <button
          className="bg-[var(--color-verde-100)] text-white px-3 py-1.5 rounded-corner-m text-[12px] font-bold border-none cursor-pointer flex items-center gap-1 transition-all hover:brightness-90 active:brightness-75"
          onClick={() => { setShowNewOp(true); setOpSearch(""); }}
        >
          <HiOutlinePlus className="w-[14px] h-[14px]" />
          Nueva Operación
        </button>

        {/* Operation selector modal */}
        <Modal open={showNewOp} onClose={() => setShowNewOp(false)} title="Seleccionar Operación" size="sm">
          <div className="space-y-2">
            <input
              value={opSearch}
              onChange={(e) => setOpSearch(e.target.value)}
              placeholder="Buscar operación..."
              className="w-full text-[13px] px-3 py-1.5 rounded-corner-m border border-[var(--color-neutro-200)] outline-none focus:border-[var(--color-verde-100)] bg-white"
            />
            <div className="max-h-[300px] overflow-y-auto space-y-1">
              {procesosFinalizados
                .filter((p) => p.nombre.toLowerCase().includes(opSearch.toLowerCase()))
                .map((op) => (
                  <button
                    key={op.id}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-corner-m text-[13px] text-left text-[var(--color-neutro-700)] hover:bg-[var(--color-neutro-100)] transition-colors"
                    onClick={() => {
                      setShowNewOp(false);
                      navigate("/operaciones", { state: { newOpId: op.id } });
                    }}
                  >
                    <FolderOpen className="w-4 h-4 shrink-0 text-[var(--color-neutro-400)]" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{op.nombre || "Sin nombre"}</p>
                      <p className="text-[11px] text-[var(--color-neutro-400)] truncate">
                        {op.tipoCarga} · {op.steps.length} pasos
                      </p>
                    </div>
                  </button>
                ))}
              {procesosFinalizados.length === 0 && (
                <p className="text-[13px] text-[var(--color-neutro-400)] text-center py-4">
                  No hay operaciones guardadas. Cree una en Motor de Transacciones.
                </p>
              )}
            </div>
          </div>
        </Modal>

        {/* User avatar + info */}
        <div className="flex items-center gap-2 pl-3 border-l border-[var(--color-neutro-200)]">
          <div className="text-right">
            <p className="text-[12px] font-semibold text-[var(--color-neutro-900)] leading-tight">{user.nombre}</p>
            <p className="text-[10px] text-[var(--color-neutro-500)] leading-tight">{user.rol}</p>
          </div>
          <div className="w-[32px] h-[32px] rounded-full bg-[var(--color-verde-100)] flex items-center justify-center text-white font-bold text-[11px]">
            {user.initials}
          </div>
        </div>
      </div>
    </header>
  );
}
