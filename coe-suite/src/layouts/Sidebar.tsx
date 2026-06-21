import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MODULES, type Module } from "../data/navigation";
import { useNavStore } from "../stores/navStore";
import {
  HiOutlineChartBarSquare,
  HiOutlineTv,
  HiOutlineChartPie,
  HiOutlineSignal,
  HiOutlineBuildingLibrary,
  HiOutlineBanknotes,
  HiOutlineTruck,
  HiOutlineBriefcase,
  HiOutlineUserGroup,
  HiOutlineCpuChip,
  HiOutlineLightBulb,
  HiOutlineDocumentText,
  HiOutlineListBullet,
  HiOutlineMapPin,
  HiOutlineCog6Tooth,
  HiOutlineHome,
  HiOutlineBuildingOffice2,
  HiOutlineCurrencyDollar,
  HiOutlineUsers,
  HiOutlineAdjustmentsHorizontal,
  HiOutlineQuestionMarkCircle,
  HiOutlinePuzzlePiece,
  HiOutlineShieldCheck,
  HiOutlineChevronDown,
  HiOutlineClipboardDocumentCheck,
  HiOutlineServerStack,
  HiOutlineCalendarDays,
  HiOutlineArrowsRightLeft,
  HiOutlineTableCells,
  HiOutlineArchiveBox,
} from "react-icons/hi2";
import type { IconType } from "react-icons";

const moduleIcons: Record<string, IconType> = {
  LayoutDashboard: HiOutlineHome,
  Bot: HiOutlineCpuChip,
  BuildingBank: HiOutlineBuildingOffice2,
  Cog: HiOutlineCog6Tooth,
  HelpCircle: HiOutlineQuestionMarkCircle,
  Puzzle: HiOutlinePuzzlePiece,
  Shield: HiOutlineShieldCheck,
  ShieldCheck: HiOutlineShieldCheck,
  Report: HiOutlineDocumentText,
  ListCheck: HiOutlineListBullet,
  MapPin: HiOutlineMapPin,
};

const itemIcons: Record<string, IconType> = {
  ChartLine: HiOutlineChartBarSquare,
  TowerObservation: HiOutlineTv,
  ChartPie: HiOutlineChartPie,
  Gauge: HiOutlineSignal,
  Bank: HiOutlineBuildingLibrary,
  Landmark: HiOutlineBanknotes,
  Truck: HiOutlineTruck,
  Briefcase: HiOutlineBriefcase,
  Handshake: HiOutlineUserGroup,
  Bot: HiOutlineCpuChip,
  Brain: HiOutlineLightBulb,
  Report: HiOutlineDocumentText,
  ListCheck: HiOutlineListBullet,
  MapPin: HiOutlineMapPin,
  Settings: HiOutlineCog6Tooth,
  Vault: HiOutlineBuildingLibrary,
  Cash: HiOutlineCurrencyDollar,
  Building2: HiOutlineBuildingOffice2,
  Users: HiOutlineUsers,
  Sliders: HiOutlineAdjustmentsHorizontal,
  HelpCircle: HiOutlineQuestionMarkCircle,
  Puzzle: HiOutlinePuzzlePiece,
  Shield: HiOutlineShieldCheck,
  ShieldCheck: HiOutlineShieldCheck,
  Ticket: HiOutlineClipboardDocumentCheck,
  QuestionMarkCircle: HiOutlineQuestionMarkCircle,
  ServerStack: HiOutlineServerStack,
  CalendarDays: HiOutlineCalendarDays,
  ListTree: HiOutlineListBullet,
  ArrowsRightLeft: HiOutlineArrowsRightLeft,
  TableCells: HiOutlineTableCells,
  ArchiveBox: HiOutlineArchiveBox,
};

function ModuleGroup({ module, activeRoute, onNavigate, collapsed, onModuleClick }: {
  module: Module;
  activeRoute: string;
  onNavigate: (route: string) => void;
  collapsed: boolean;
  onModuleClick: (mod: Module) => void;
}) {
  const [open, setOpen] = useState(module.items.some((i) => i.route === activeRoute));
  const ModuleIcon = moduleIcons[module.icon] || HiOutlineCog6Tooth;
  const isActive = module.items.some((i) => i.route === activeRoute);

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-1">
        <button
          type="button"
          onClick={() => onModuleClick(module)}
          className={`w-10 h-10 rounded-corner-m flex items-center justify-center cursor-pointer transition-all duration-200 border-none
            ${isActive
              ? "bg-[var(--color-verde-100)] text-white shadow-md shadow-[var(--color-verde-100)]/20"
              : "text-[var(--color-neutro-400)] hover:text-[var(--color-verde-100)] hover:bg-[var(--color-verde-100)]/8"}`}
          title={module.label}
        >
          <ModuleIcon className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => {
          const next = !open;
          setOpen(next);
          if (next && module.items.length > 0) onNavigate(module.items[0].route);
        }}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-corner-m border-none cursor-pointer text-left transition-all duration-200
          ${isActive
            ? "text-[var(--color-verde-100)] bg-[var(--color-verde-100)]/5"
            : "text-[var(--color-neutro-500)] hover:text-[var(--color-verde-100)] hover:bg-[var(--color-verde-100)]/5"}`}
      >
        <ModuleIcon className="w-5 h-5 flex-shrink-0" />
        <span className="flex-1 text-[13px] font-semibold">{module.label}</span>
        <HiOutlineChevronDown className={`w-3.5 h-3.5 text-[var(--color-neutro-400)] transition-all duration-200 ${open ? "rotate-0 text-[var(--color-verde-100)]" : "-rotate-90"}`} />
      </button>
      {open && (
        <div className="ml-3 mt-1 space-y-0.5 border-l-2 border-[var(--color-verde-100)]/15 pl-2">
          {module.items.map((item) => {
            const ItemIcon = itemIcons[item.icon] || HiOutlineCog6Tooth;
            const itemActive = activeRoute === item.route;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.route)}
                className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-corner-m border-none cursor-pointer text-left transition-all duration-200 text-[12px]
                  ${itemActive
                    ? "bg-[var(--color-verde-100)] text-white font-semibold shadow-sm shadow-[var(--color-verde-100)]/20"
                    : "text-[var(--color-neutro-500)] hover:text-[var(--color-verde-100)] hover:bg-[var(--color-verde-100)]/6"
                  }`}
              >
                <ItemIcon className={`w-4 h-4 flex-shrink-0 ${itemActive ? "" : "opacity-60"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { navigate: navStore } = useNavStore();
  const activeRoute = location.pathname;
  const collapseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHovering = useRef(false);

  const clearCollapseTimer = useCallback(() => {
    if (collapseTimer.current) {
      clearTimeout(collapseTimer.current);
      collapseTimer.current = null;
    }
  }, []);

  const startCollapseTimer = useCallback(() => {
    clearCollapseTimer();
    collapseTimer.current = setTimeout(() => {
      if (!isHovering.current) setCollapsed(true);
    }, 3500);
  }, [clearCollapseTimer]);

  useEffect(() => {
    return () => clearCollapseTimer();
  }, [clearCollapseTimer]);

  const handleMouseEnter = () => {
    isHovering.current = true;
    clearCollapseTimer();
    setCollapsed(false);
  };

  const handleMouseLeave = () => {
    isHovering.current = false;
    startCollapseTimer();
  };

  const handleNavigate = (route: string) => {
    navStore(route.replaceAll("/", "") || "dashboard");
    navigate(route);
  };

  const handleModuleClick = (mod: Module) => {
    const firstRoute = mod.items[0]?.route;
    if (firstRoute) handleNavigate(firstRoute);
  };

  return (
    <nav
      className={`bg-white border-r border-[var(--color-neutro-200)] flex flex-col z-20 overflow-hidden transition-all duration-300 ${
        collapsed ? "w-[72px] min-w-[72px]" : "w-[252px] min-w-[252px]"
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Logo */}
      <button
        type="button"
        onClick={() => handleNavigate("/dashboard")}
        className={`flex items-center border-b border-[var(--color-neutro-200)] ${collapsed ? "justify-center px-2" : "gap-3 px-4"} h-[58px] flex-shrink-0 sticky top-0 bg-white z-10 cursor-pointer w-full transition-colors hover:bg-[var(--color-neutro-100)]`}>
        <img src={`${import.meta.env.BASE_URL}Icono%20coe.png`} alt="COE" className="w-8 h-8 block flex-shrink-0" />
        <div className={`overflow-hidden transition-all duration-300 ${collapsed ? "max-w-0 opacity-0" : "max-w-[180px] opacity-100"}`}>
          <div className="whitespace-nowrap">
            <h1 className="font-['Inclusive_Sans','Inter',sans-serif] font-normal text-[20px] leading-none tracking-tight" style={{ color: "#3CB93C" }}>
              COE Suite
            </h1>
            <p className="text-[8px] font-semibold tracking-[2px] uppercase mt-[3px] text-[var(--color-neutro-500)]">
              Cash Mgmt <span style={{ color: "var(--color-ind-naranja)" }}>Pro</span>
            </p>
          </div>
        </div>
      </button>

      {/* Modules */}
      <div className="flex-1 overflow-y-auto py-3 space-y-1 px-2">
        {MODULES.map((mod) => (
          <ModuleGroup
            key={mod.id}
            module={mod}
            activeRoute={activeRoute}
            onNavigate={handleNavigate}
            collapsed={collapsed}
            onModuleClick={handleModuleClick}
          />
        ))}
      </div>
    </nav>
  );
}
