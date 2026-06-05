import { useNavigate } from "react-router-dom";
import { MODULES, type Module } from "../../data/navigation";
import type { IconType } from "react-icons";
import {
  HiOutlineHome,
  HiOutlineBuildingOffice2,
  HiOutlineCog6Tooth,
  HiOutlineQuestionMarkCircle,
  HiOutlinePuzzlePiece,
  HiOutlineShieldCheck,
  HiOutlineArrowRight,
} from "react-icons/hi2";

const moduleIcons: Record<string, IconType> = {
  LayoutDashboard: HiOutlineHome,
  BuildingBank: HiOutlineBuildingOffice2,
  Cog: HiOutlineCog6Tooth,
  HelpCircle: HiOutlineQuestionMarkCircle,
  Puzzle: HiOutlinePuzzlePiece,
  Shield: HiOutlineShieldCheck,
};

function ModuleCard({ module }: { module: Module }) {
  const navigate = useNavigate();
  const Icon = moduleIcons[module.icon] || HiOutlineCog6Tooth;
  const firstRoute = module.items[0]?.route || "/";

  return (
    <button
      onClick={() => navigate(firstRoute)}
      className="bg-white border border-[var(--color-neutro-200)] rounded-corner-m p-6 cursor-pointer text-left transition-all hover:shadow-card hover:border-[var(--color-verde-100)]/40 hover:-translate-y-0.5 active:translate-y-0 group"
    >
      <div className="w-12 h-12 rounded-corner-s bg-[var(--color-surface-darkwhite)] flex items-center justify-center mb-4 group-hover:bg-[var(--color-verde-100)]/10 transition-colors">
        <Icon className="w-6 h-6 text-[var(--color-verde-100)]" />
      </div>
      <h3 className="text-[15px] font-bold text-[var(--color-neutro-900)] mb-1.5">{module.label}</h3>
      <p className="text-[12px] text-[var(--color-neutro-500)] mb-4 leading-relaxed">{module.description}</p>
      <div className="flex items-center gap-1 text-[11px] font-semibold text-[var(--color-verde-100)] opacity-0 group-hover:opacity-100 transition-opacity">
        <span>Acceder</span>
        <HiOutlineArrowRight className="w-3.5 h-3.5" />
      </div>
      <div className="flex flex-wrap gap-1.5 mt-3">
        {module.items.slice(0, 4).map((item) => (
          <span
            key={item.id}
            className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-[var(--color-neutro-100)] text-[var(--color-neutro-500)]"
          >
            {item.label}
          </span>
        ))}
        {module.items.length > 4 && (
          <span className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-[var(--color-neutro-100)] text-[var(--color-neutro-400)]">
            +{module.items.length - 4}
          </span>
        )}
      </div>
    </button>
  );
}

export function ModuleSelector() {
  return (
    <div className="animate-[fi_0.3s_cubic-bezier(.2,0,0,1)]">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-[22px] font-bold text-[var(--color-neutro-900)] mb-1">
          Bienvenido a COE Suite
        </h1>
        <p className="text-[13px] text-[var(--color-neutro-500)]">
          Selecciona un módulo para comenzar. Todos los módulos están disponibles según tu perfil y permisos.
        </p>
      </div>

      {/* Module grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MODULES.map((mod) => (
          <ModuleCard key={mod.id} module={mod} />
        ))}
      </div>

      {/* Quick stats */}
      <div className="mt-8 grid grid-cols-4 gap-3">
        {[
          { label: "Módulos Activos", value: String(MODULES.length) },
          { label: "Funcionalidades", value: String(MODULES.reduce((a, m) => a + m.items.length, 0)) },
          { label: "Perfil Actual", value: "Super Admin" },
          { label: "Estado", value: "Sistema Operativo" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-[var(--color-neutro-200)] rounded-corner-s px-4 py-3.5">
            <div className="text-[9px] font-semibold uppercase tracking-wider text-[var(--color-neutro-500)] mb-1">{s.label}</div>
            <div className="text-[18px] font-bold text-[var(--color-neutro-900)] font-['Roboto',sans-serif]">{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
