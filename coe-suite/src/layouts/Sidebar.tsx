import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MODULES, type Module } from "../data/navigation";
import { useUserStore } from "../stores/userStore";
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
};

function ModuleGroup({ module, activeRoute, onNavigate, collapsed }: {
  module: Module;
  activeRoute: string;
  onNavigate: (route: string) => void;
  collapsed: boolean;
}) {
  const [open, setOpen] = useState(module.items.some((i) => i.route === activeRoute));
  const ModuleIcon = moduleIcons[module.icon] || HiOutlineCog6Tooth;
  const isActive = module.items.some((i) => i.route === activeRoute);

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-1">
        <div
          className={`w-10 h-10 rounded-corner-xs flex items-center justify-center cursor-pointer transition-all
            ${isActive ? "bg-[var(--color-surface-darkwhite)] text-[var(--color-verde-100)]" : "text-[var(--color-neutro-400)] hover:text-[var(--color-neutro-600)] hover:bg-[var(--color-neutro-100)]"}`}
          title={module.label}
        >
          <ModuleIcon className="w-5 h-5" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-corner-xs border-none cursor-pointer text-left transition-all
          ${isActive ? "text-[var(--color-verde-100)]" : "text-[var(--color-neutro-500)] hover:text-[var(--color-neutro-900)]"}`}
      >
        <ModuleIcon className="w-5 h-5 flex-shrink-0" />
        <span className="flex-1 text-[13px] font-semibold">{module.label}</span>
        <HiOutlineChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-0" : "-rotate-90"}`} />
      </button>
      {open && (
        <div className="ml-2 mt-0.5 space-y-0.5">
          {module.items.map((item) => {
            const ItemIcon = itemIcons[item.icon] || HiOutlineCog6Tooth;
            const itemActive = activeRoute === item.route;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.route)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-corner-xs border-none cursor-pointer text-left transition-all text-[12px]
                  ${itemActive
                    ? "bg-[var(--color-surface-darkwhite)] text-[var(--color-verde-100)] font-semibold shadow-[inset_3px_0_0_var(--color-verde-100)]"
                    : "text-[var(--color-neutro-500)] hover:bg-[var(--color-neutro-100)] hover:text-[var(--color-neutro-900)]"
                  }`}
              >
                <ItemIcon className="w-4 h-4 flex-shrink-0" />
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
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { navigate: navStore } = useNavStore();
  const user = useUserStore((s) => s.current);
  const activeRoute = location.pathname;

  const handleNavigate = (route: string) => {
    navStore(route.replace("/", "") || "dashboard");
    navigate(route);
  };

  return (
    <nav
      className={`bg-white border-r border-[var(--color-neutro-200)] flex flex-col z-20 overflow-y-auto transition-all duration-300 ${
        collapsed ? "w-[72px] min-w-[72px]" : "w-[252px] min-w-[252px]"
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center border-b border-[var(--color-neutro-200)] ${collapsed ? "justify-center py-4 px-2" : "gap-3 px-4 py-[18px] pb-4"}`}>
        <img src="/Icono%20coe.png" alt="COE" className="w-8 h-8 block flex-shrink-0" />
        {!collapsed && (
          <div>
            <h1 className="font-['Inclusive_Sans','Inter',sans-serif] font-normal text-[20px] leading-none tracking-tight" style={{ color: "#3CB93C" }}>
              COE Suite
            </h1>
            <p className="text-[8px] font-semibold tracking-[2px] uppercase mt-[3px] text-[var(--color-neutro-500)]">
              Cash Mgmt <span style={{ color: "var(--color-ind-naranja)" }}>Pro</span>
            </p>
          </div>
        )}
      </div>

      {/* Modules */}
      <div className="flex-1 overflow-y-auto py-3 space-y-1">
        {MODULES.map((mod) => (
          <ModuleGroup
            key={mod.id}
            module={mod}
            activeRoute={activeRoute}
            onNavigate={handleNavigate}
            collapsed={collapsed}
          />
        ))}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="mx-3 mb-2 p-2 rounded-corner-xs border border-[var(--color-neutro-200)] bg-white text-[var(--color-neutro-400)] cursor-pointer hover:text-[var(--color-neutro-600)] hover:bg-[var(--color-neutro-100)] transition-all flex items-center justify-center"
        title={collapsed ? "Expandir menú" : "Colapsar menú"}
      >
        <HiOutlineChevronDown className={`w-4 h-4 transition-transform ${collapsed ? "rotate-90" : ""}`} />
      </button>

      {/* User */}
      {!collapsed && (
        <div className="flex items-center gap-3 px-4 py-3 border-t border-[var(--color-neutro-200)] mt-auto">
          <div className="w-[34px] h-[34px] rounded-full bg-[var(--color-verde-100)] flex items-center justify-center text-[var(--color-neutro-900)] font-bold text-[12px] flex-shrink-0">
            {user.initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-[var(--color-neutro-900)] truncate">{user.nombre}</p>
            <p className="text-[10px] text-[var(--color-neutro-500)] truncate">{user.rol}</p>
          </div>
        </div>
      )}
    </nav>
  );
}
