export interface EntityType {
  nivel: string;
  etiqueta: string;
  subtipos: string[];
  hijosPermitidos: string[];
  color: string;
  icono: string;
}

export const ENTITY_TYPES: EntityType[] = [
  {
    nivel: "Grupos",
    etiqueta: "Grupos Geográficos",
    subtipos: ["Zona", "Ciudad", "Estado", "Municipio", "Continente", "País", "Flota"],
    hijosPermitidos: ["Central Administrativa", "Oficinas", "Depósitos", "Vehículos", "Proveedores", "Clientes", "Grupos"],
    color: "var(--color-verde-100)",
    icono: "ListTree",
  },
  {
    nivel: "Central Administrativa",
    etiqueta: "Central Administrativa",
    subtipos: ["Central Principal", "Regional"],
    hijosPermitidos: ["Oficinas"],
    color: "#0891b2",
    icono: "Building2",
  },
  {
    nivel: "Oficinas",
    etiqueta: "Unidad Administrativa",
    subtipos: ["Agencia", "Sucursal", "Oficina", "Centro de Acopio", "Taquilla"],
    hijosPermitidos: ["Depósitos", "Dispositivos", "Vehículos", "Entidad Bancaria"],
    color: "var(--color-verde-100)",
    icono: "Building2",
  },
  {
    nivel: "Dispositivos",
    etiqueta: "Dispositivos",
    subtipos: ["ATM", "Caja", "Terminal Punto de Venta", "Máquina Contadora de Billetes", "Lector de Huellas", "Reciclador", "Caja Registradora"],
    hijosPermitidos: ["Depósitos"],
    color: "#6366f1",
    icono: "CreditCard",
  },
  {
    nivel: "Entidad Bancaria",
    etiqueta: "Entidad Bancaria",
    subtipos: ["Banco Central", "Banco"],
    hijosPermitidos: [],
    color: "#0ea5e9",
    icono: "Landmark",
  },
  {
    nivel: "Depósitos",
    etiqueta: "Depósitos",
    subtipos: ["Caja Fuerte", "Cuarto Frío", "Rack", "Silo", "Contenedor", "Cajón", "Cofre", "Cajetín"],
    hijosPermitidos: ["Mercancía", "Anaqueles"],
    color: "#f59e0b",
    icono: "Shield",
  },
  {
    nivel: "Anaqueles",
    etiqueta: "Anaqueles",
    subtipos: ["Anaquel"],
    hijosPermitidos: [],
    color: "#a855f7",
    icono: "Layers",
  },
  {
    nivel: "Contenedores",
    etiqueta: "Contenedores",
    subtipos: ["Container", "Envase", "Bulto", "Bolsa", "Empaque", "Paleta"],
    hijosPermitidos: ["Mercancía"],
    color: "#8b5cf6",
    icono: "Package",
  },
  {
    nivel: "Vehículos",
    etiqueta: "Vehículos / Depósitos Móviles",
    subtipos: ["Camión", "Carro", "Barco", "Avión", "Tren"],
    hijosPermitidos: ["Mercancía"],
    color: "#06b6d4",
    icono: "Truck",
  },
  {
    nivel: "Mercancía",
    etiqueta: "Mercancía",
    subtipos: ["Commodity", "Valor", "Alimento", "Producto", "Remesa"],
    hijosPermitidos: [],
    color: "#ec4899",
    icono: "PackageOpen",
  },
  {
    nivel: "Proveedores",
    etiqueta: "Proveedores",
    subtipos: ["Servicios", "Consumibles"],
    hijosPermitidos: ["Vehículos"],
    color: "#14b8a6",
    icono: "Truck",
  },
  {
    nivel: "Clientes",
    etiqueta: "Clientes",
    subtipos: ["Natural", "Jurídico"],
    hijosPermitidos: [],
    color: "#f97316",
    icono: "Users",
  },
  {
    nivel: "Monedas",
    etiqueta: "Moneda",
    subtipos: ["Divisa", "Moneda", "Oro", "Stable Coin"],
    hijosPermitidos: [],
    color: "#10b981",
    icono: "Banknote",
  },
];

export function getEntityType(nivel: string): EntityType | undefined {
  return ENTITY_TYPES.find((t) => t.nivel === nivel);
}

export function findTiposPadre(nivelHijo: string): EntityType[] {
  return ENTITY_TYPES.filter((t) => t.hijosPermitidos.includes(nivelHijo));
}
