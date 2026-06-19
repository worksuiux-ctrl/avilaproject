import { ListTree, Building2, CreditCard, Shield, Package, Truck, PackageOpen, Users, Banknote, Monitor } from "lucide-react";
import { getEntityType } from "@data/entityCatalog";

const NIVEL_ICON: Record<string, typeof ListTree> = {
  ListTree,
  Building2,
  CreditCard,
  Shield,
  Package,
  Truck,
  PackageOpen,
  Users,
  Banknote,
};

const SUBTIPO_ICON: Record<string, typeof Monitor> = {
  "Caja Registradora": Monitor,
  ATM: Banknote,
};

export function getEntityIcon(nivel: string, subtipo: string): typeof ListTree {
  if (SUBTIPO_ICON[subtipo]) return SUBTIPO_ICON[subtipo];
  const tipo = getEntityType(nivel);
  return NIVEL_ICON[tipo?.icono ?? ""] ?? ListTree;
}

export function EntityIcon({ nivel, subtipo, className, style }: { nivel: string; subtipo: string; className?: string; style?: React.CSSProperties }) {
  const IconComp = getEntityIcon(nivel, subtipo);
  return <IconComp className={className} style={style} aria-hidden="true" />;
}