import type { ComponentType, SVGProps } from "react";
import { Icon as Iconify } from "@iconify/react";
import { FolderTree, Building2, CreditCard, Shield, Package, Truck, PackageOpen, Users, Banknote } from "lucide-react";
import { getEntityType } from "@data/entityCatalog";

type LucideIcon = ComponentType<SVGProps<SVGSVGElement>>;

const NIVEL_ICON: Record<string, LucideIcon> = {
  FolderTree, Building2, CreditCard, Shield, Package, Truck, PackageOpen, Users, Banknote,
};

const SUBTIPO_ICON: Record<string, string> = {
  "Caja Registradora": "lucide:monitor",
  ATM: "hugeicons:atm-02",
};

export function getEntityIcon(nivel: string, subtipo: string): string | LucideIcon {
  const fromSubtipo = SUBTIPO_ICON[subtipo];
  if (fromSubtipo) return fromSubtipo;
  const tipo = getEntityType(nivel);
  return NIVEL_ICON[tipo?.icono ?? ""] ?? FolderTree;
}

export function EntityIcon({ nivel, subtipo, className, style }: { nivel: string; subtipo: string; className?: string; style?: React.CSSProperties }) {
  const icon = getEntityIcon(nivel, subtipo);
  if (typeof icon === "string") {
    if (style) {
      const { strokeWidth: _, ...clean } = style;
      return <Iconify icon={icon} className={className} style={clean} />;
    }
    return <Iconify icon={icon} className={className} style={style} />;
  }
  const Comp = icon;
  return <Comp className={className} style={style} />;
}
