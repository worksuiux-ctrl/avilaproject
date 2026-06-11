import { useNavStore } from "../stores/navStore";
import { useUserStore } from "../stores/userStore";
import { useLocation } from "react-router-dom";
import { MODULES } from "../data/navigation";
import { ProfileSelector } from "../components/ui/ProfileSelector";
import { CentralSelector } from "../components/ui/CentralSelector";
import {
  HiOutlineBell,
  HiOutlineArrowUpTray,
  HiOutlinePlus,
  HiOutlineChevronRight,
} from "react-icons/hi2";

export function Topbar() {
  const { title, description } = useNavStore();
  const user = useUserStore((s) => s.current);
  const location = useLocation();

  const currentSection = MODULES.find((m) =>
    m.items.some((i) => i.route === location.pathname),
  );

  return (
    <header className="h-[58px] bg-white/70 backdrop-blur-xl border-b border-[var(--color-neutro-200)] flex items-center justify-between px-6 flex-shrink-0 relative z-20">
      {/* Left: breadcrumb + title */}
      <div>
        <div className="flex items-center gap-1.5 text-[10px] text-[var(--color-neutro-400)] mb-0.5">
          {currentSection && (
            <>
              <span>{currentSection.label}</span>
              <HiOutlineChevronRight className="w-2.5 h-2.5" />
            </>
          )}
          <span className="text-[var(--color-neutro-600)] font-medium">{title}</span>
        </div>
        <p className="text-[11px] text-[var(--color-neutro-500)]">{description}</p>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        <ProfileSelector />
        <CentralSelector />
        <div className="flex items-center gap-1.5 px-[11px] py-1 rounded-full text-[9px] font-bold bg-[var(--color-surface-darkwhite)] text-[var(--color-verde-100)] tracking-wide border border-[var(--color-verde-100)]/30">
          <span className="w-[6px] h-[6px] rounded-full bg-[var(--color-verde-100)] animate-pulse" />
          CORE SYNC
        </div>

        <button
          className="relative w-[34px] h-[34px] border border-[var(--color-neutro-200)] rounded-corner-xs bg-white text-[var(--color-neutro-500)] flex items-center justify-center cursor-pointer transition-all hover:border-[var(--color-verde-100)] hover:text-[var(--color-verde-100)] hover:bg-[var(--color-surface-darkwhite)]"
          title="Notificaciones"
        >
          <HiOutlineBell className="w-[15px] h-[15px]" />
          <span className="absolute -top-[1px] -right-[1px] w-2 h-2 bg-[var(--color-ind-rojo)] rounded-full border-2 border-white" />
        </button>

        <button
          className="w-[34px] h-[34px] border border-[var(--color-neutro-200)] rounded-corner-xs bg-white text-[var(--color-neutro-500)] flex items-center justify-center cursor-pointer transition-all hover:border-[var(--color-verde-100)] hover:text-[var(--color-verde-100)] hover:bg-[var(--color-surface-darkwhite)]"
          title="Exportar"
        >
          <HiOutlineArrowUpTray className="w-[15px] h-[15px]" />
        </button>

        <button
          className="bg-[var(--color-verde-100)] text-white px-4 py-1.5 rounded-corner-m text-[13px] font-bold border-none cursor-pointer flex items-center gap-1 transition-all hover:brightness-90 active:brightness-75"
          onClick={() => {}}
        >
          <HiOutlinePlus className="w-[15px] h-[15px]" />
          Nueva Operación
        </button>

        {/* User avatar */}
        <div className="flex items-center gap-2 ml-1 pl-3 border-l border-[var(--color-neutro-200)]">
          <div className="w-[30px] h-[30px] rounded-full bg-[var(--color-verde-100)] flex items-center justify-center text-[var(--color-neutro-900)] font-bold text-[10px]">
            {user.initials}
          </div>
        </div>
      </div>
    </header>
  );
}
