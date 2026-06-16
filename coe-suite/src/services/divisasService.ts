import type { Divisa, Denominacion, Fajo, Clasificacion, StableCoin } from "@stores/divisasStore";
import { fetchFromApi } from "./api";

interface DivisasApiData {
  divisas: Divisa[];
  denominaciones: Denominacion[];
  fajos: Fajo[];
  clasificaciones: Clasificacion[];
  stableCoins: StableCoin[];
}

/* ── Demo data ── */
export function getDemoDivisas(): Divisa[] {
  return [
    { id: "div-1", nombre: "Bolívar", codigoISO: "VES", simbolo: "Bs", paisOrigen: "Venezuela", tipoMoneda: "Moneda", tasaCambio: 1, factorRedondeo: 0, activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "div-2", nombre: "Dólar Americano", codigoISO: "USD", simbolo: "$", paisOrigen: "Estados Unidos", tipoMoneda: "Divisa", tasaCambio: 0.001688, factorRedondeo: 2, activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "div-3", nombre: "Euro", codigoISO: "EUR", simbolo: "€", paisOrigen: "Unión Europea", tipoMoneda: "Divisa", tasaCambio: 0.001455, factorRedondeo: 2, activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "div-4", nombre: "Peso Colombiano", codigoISO: "COP", simbolo: "$", paisOrigen: "Colombia", tipoMoneda: "Divisa", tasaCambio: 5.886, factorRedondeo: 0, activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
  ];
}

export function getDemoDenominaciones(): Denominacion[] {
  return [
    { id: "den-1", divisaId: "div-1", nombre: "Bs. 100", tipo: "Billete", valor: 100, alto: 156, ancho: 69, peso: 1.2, color: "#FF6B6B", descripcion: "Billete de 100 Bolívares", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "den-2", divisaId: "div-1", nombre: "Bs. 50", tipo: "Billete", valor: 50, alto: 156, ancho: 69, peso: 1.2, color: "#4ECDC4", descripcion: "Billete de 50 Bolívares", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "den-3", divisaId: "div-1", nombre: "Bs. 20", tipo: "Billete", valor: 20, alto: 156, ancho: 69, peso: 1.2, color: "#45B7D1", descripcion: "Billete de 20 Bolívares", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "den-4", divisaId: "div-1", nombre: "Bs. 10", tipo: "Billete", valor: 10, alto: 156, ancho: 69, peso: 1.1, color: "#96CEB4", descripcion: "Billete de 10 Bolívares", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "den-5", divisaId: "div-1", nombre: "Bs. 5", tipo: "Moneda", valor: 5, alto: 26, ancho: 26, peso: 7.5, color: "#D4A574", descripcion: "Moneda de 5 Bolívares", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "den-6", divisaId: "div-1", nombre: "Bs. 2", tipo: "Moneda", valor: 2, alto: 24, ancho: 24, peso: 6.0, color: "#C0C0C0", descripcion: "Moneda de 2 Bolívares", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "den-7", divisaId: "div-1", nombre: "Bs. 1", tipo: "Moneda", valor: 1, alto: 22, ancho: 22, peso: 5.0, color: "#B8860B", descripcion: "Moneda de 1 Bolívar", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "den-50", divisaId: "div-1", nombre: "Bs. 0,50", tipo: "Moneda", valor: 0.50, alto: 20, ancho: 20, peso: 4.5, color: "#A0A0A0", descripcion: "Moneda de 0,50 Bolívares", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "den-51", divisaId: "div-1", nombre: "Bs. 0,25", tipo: "Moneda", valor: 0.25, alto: 19, ancho: 19, peso: 4.0, color: "#CD853F", descripcion: "Moneda de 0,25 Bolívares", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "den-8", divisaId: "div-2", nombre: "$100", tipo: "Billete", valor: 100, alto: 156, ancho: 66, peso: 1.0, color: "#98FB98", descripcion: "Billete de 100 Dólares", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "den-9", divisaId: "div-2", nombre: "$50", tipo: "Billete", valor: 50, alto: 156, ancho: 66, peso: 1.0, color: "#87CEEB", descripcion: "Billete de 50 Dólares", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "den-10", divisaId: "div-2", nombre: "$20", tipo: "Billete", valor: 20, alto: 156, ancho: 66, peso: 1.0, color: "#FFD700", descripcion: "Billete de 20 Dólares", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "den-11", divisaId: "div-2", nombre: "$10", tipo: "Billete", valor: 10, alto: 156, ancho: 66, peso: 1.0, color: "#FFA500", descripcion: "Billete de 10 Dólares", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "den-30", divisaId: "div-2", nombre: "$5", tipo: "Billete", valor: 5, alto: 156, ancho: 66, peso: 1.0, color: "#DDA0DD", descripcion: "Billete de 5 Dólares", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "den-31", divisaId: "div-2", nombre: "$2", tipo: "Billete", valor: 2, alto: 156, ancho: 66, peso: 1.0, color: "#B0C4DE", descripcion: "Billete de 2 Dólares", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "den-12", divisaId: "div-2", nombre: "$1", tipo: "Billete", valor: 1, alto: 156, ancho: 66, peso: 1.0, color: "#SILVER", descripcion: "Billete de 1 Dólar", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "den-32", divisaId: "div-2", nombre: "$0,50", tipo: "Moneda", valor: 0.50, alto: 30, ancho: 30, peso: 11.3, color: "#C0C0C0", descripcion: "Moneda de 50 centavos", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "den-33", divisaId: "div-2", nombre: "$0,25", tipo: "Moneda", valor: 0.25, alto: 24, ancho: 24, peso: 5.7, color: "#C0C0C0", descripcion: "Moneda de 25 centavos (Quarter)", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "den-34", divisaId: "div-2", nombre: "$0,10", tipo: "Moneda", valor: 0.10, alto: 18, ancho: 18, peso: 2.3, color: "#C0C0C0", descripcion: "Moneda de 10 centavos (Dime)", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "den-35", divisaId: "div-2", nombre: "$0,05", tipo: "Moneda", valor: 0.05, alto: 21, ancho: 21, peso: 5.0, color: "#CD853F", descripcion: "Moneda de 5 centavos (Nickel)", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "den-36", divisaId: "div-2", nombre: "$0,01", tipo: "Moneda", valor: 0.01, alto: 19, ancho: 19, peso: 2.5, color: "#CD853F", descripcion: "Moneda de 1 centavo (Penny)", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "den-13", divisaId: "div-3", nombre: "€500", tipo: "Billete", valor: 500, alto: 160, ancho: 82, peso: 1.1, color: "#9370DB", descripcion: "Billete de 500 Euros", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "den-14", divisaId: "div-3", nombre: "€200", tipo: "Billete", valor: 200, alto: 153, ancho: 82, peso: 1.1, color: "#FFD700", descripcion: "Billete de 200 Euros", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "den-15", divisaId: "div-3", nombre: "€100", tipo: "Billete", valor: 100, alto: 147, ancho: 82, peso: 1.1, color: "#32CD32", descripcion: "Billete de 100 Euros", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "den-16", divisaId: "div-3", nombre: "€50", tipo: "Billete", valor: 50, alto: 140, ancho: 77, peso: 1.1, color: "#FF8C00", descripcion: "Billete de 50 Euros", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "den-17", divisaId: "div-3", nombre: "€20", tipo: "Billete", valor: 20, alto: 133, ancho: 72, peso: 1.1, color: "#87CEEB", descripcion: "Billete de 20 Euros", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "den-18", divisaId: "div-3", nombre: "€10", tipo: "Billete", valor: 10, alto: 127, ancho: 67, peso: 1.1, color: "#FF69B4", descripcion: "Billete de 10 Euros", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "den-19", divisaId: "div-3", nombre: "€5", tipo: "Billete", valor: 5, alto: 120, ancho: 62, peso: 1.0, color: "#808080", descripcion: "Billete de 5 Euros", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "den-37", divisaId: "div-3", nombre: "€2", tipo: "Moneda", valor: 2, alto: 26, ancho: 26, peso: 8.5, color: "#C0C0C0", descripcion: "Moneda de 2 Euros", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "den-38", divisaId: "div-3", nombre: "€1", tipo: "Moneda", valor: 1, alto: 23, ancho: 23, peso: 7.5, color: "#FFD700", descripcion: "Moneda de 1 Euro", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "den-39", divisaId: "div-3", nombre: "€0,50", tipo: "Moneda", valor: 0.50, alto: 24, ancho: 24, peso: 7.8, color: "#C0C0C0", descripcion: "Moneda de 50 centavos", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "den-40", divisaId: "div-3", nombre: "€0,20", tipo: "Moneda", valor: 0.20, alto: 22, ancho: 22, peso: 5.7, color: "#FFD700", descripcion: "Moneda de 20 centavos", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "den-41", divisaId: "div-3", nombre: "€0,10", tipo: "Moneda", valor: 0.10, alto: 19, ancho: 19, peso: 4.1, color: "#C0C0C0", descripcion: "Moneda de 10 centavos", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "den-42", divisaId: "div-3", nombre: "€0,05", tipo: "Moneda", valor: 0.05, alto: 21, ancho: 21, peso: 3.9, color: "#FFD700", descripcion: "Moneda de 5 centavos", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "den-43", divisaId: "div-3", nombre: "€0,02", tipo: "Moneda", valor: 0.02, alto: 19, ancho: 19, peso: 3.0, color: "#CD853F", descripcion: "Moneda de 2 centavos", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "den-44", divisaId: "div-3", nombre: "€0,01", tipo: "Moneda", valor: 0.01, alto: 16, ancho: 16, peso: 2.3, color: "#CD853F", descripcion: "Moneda de 1 centavo", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "den-20", divisaId: "div-4", nombre: "$100.000", tipo: "Billete", valor: 100000, alto: 155, ancho: 66, peso: 1.1, color: "#E8A87C", descripcion: "Billete de 100.000 Pesos", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "den-21", divisaId: "div-4", nombre: "$50.000", tipo: "Billete", valor: 50000, alto: 150, ancho: 66, peso: 1.1, color: "#85C1E9", descripcion: "Billete de 50.000 Pesos", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "den-22", divisaId: "div-4", nombre: "$20.000", tipo: "Billete", valor: 20000, alto: 145, ancho: 66, peso: 1.1, color: "#F1948A", descripcion: "Billete de 20.000 Pesos", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "den-23", divisaId: "div-4", nombre: "$10.000", tipo: "Billete", valor: 10000, alto: 140, ancho: 66, peso: 1.1, color: "#82E0AA", descripcion: "Billete de 10.000 Pesos", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "den-24", divisaId: "div-4", nombre: "$5.000", tipo: "Billete", valor: 5000, alto: 135, ancho: 66, peso: 1.0, color: "#D7BDE2", descripcion: "Billete de 5.000 Pesos", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "den-25", divisaId: "div-4", nombre: "$2.000", tipo: "Billete", valor: 2000, alto: 130, ancho: 66, peso: 1.0, color: "#F0B27A", descripcion: "Billete de 2.000 Pesos", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "den-26", divisaId: "div-4", nombre: "$1.000", tipo: "Billete", valor: 1000, alto: 125, ancho: 66, peso: 1.0, color: "#A9CCE3", descripcion: "Billete de 1.000 Pesos", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "den-45", divisaId: "div-4", nombre: "$500", tipo: "Moneda", valor: 500, alto: 24, ancho: 24, peso: 7.1, color: "#C0C0C0", descripcion: "Moneda de 500 Pesos", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "den-46", divisaId: "div-4", nombre: "$200", tipo: "Moneda", valor: 200, alto: 23, ancho: 23, peso: 6.5, color: "#FFD700", descripcion: "Moneda de 200 Pesos", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "den-47", divisaId: "div-4", nombre: "$100", tipo: "Moneda", valor: 100, alto: 21, ancho: 21, peso: 5.0, color: "#C0C0C0", descripcion: "Moneda de 100 Pesos", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "den-48", divisaId: "div-4", nombre: "$50", tipo: "Moneda", valor: 50, alto: 19, ancho: 19, peso: 4.0, color: "#CD853F", descripcion: "Moneda de 50 Pesos", activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
  ];
}

export function getDemoFajos(): Fajo[] {
  return [
    { id: "faj-1", denominacionId: "den-1", nombre: "Fajo Completo", cantidadUnidades: 100, pesoEstimado: 120, activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "faj-2", denominacionId: "den-1", nombre: "Fajo Medio", cantidadUnidades: 50, pesoEstimado: 60, activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "faj-3", denominacionId: "den-2", nombre: "Fajo Completo", cantidadUnidades: 100, pesoEstimado: 120, activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "faj-4", denominacionId: "den-3", nombre: "Fajo Completo", cantidadUnidades: 100, pesoEstimado: 120, activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "faj-5", denominacionId: "den-4", nombre: "Fajo Completo", cantidadUnidades: 100, pesoEstimado: 110, activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "faj-51", denominacionId: "den-5", nombre: "Paquete de 50", cantidadUnidades: 50, pesoEstimado: 375, activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "faj-52", denominacionId: "den-6", nombre: "Paquete de 50", cantidadUnidades: 50, pesoEstimado: 300, activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "faj-53", denominacionId: "den-7", nombre: "Paquete de 50", cantidadUnidades: 50, pesoEstimado: 250, activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "faj-6", denominacionId: "den-8", nombre: "Fajo Completo", cantidadUnidades: 100, pesoEstimado: 100, activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "faj-7", denominacionId: "den-9", nombre: "Fajo Completo", cantidadUnidades: 100, pesoEstimado: 100, activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "faj-8", denominacionId: "den-10", nombre: "Fajo Completo", cantidadUnidades: 100, pesoEstimado: 100, activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "faj-9", denominacionId: "den-11", nombre: "Fajo Completo", cantidadUnidades: 100, pesoEstimado: 100, activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "faj-10", denominacionId: "den-30", nombre: "Fajo Completo", cantidadUnidades: 100, pesoEstimado: 100, activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "faj-11", denominacionId: "den-31", nombre: "Fajo Completo", cantidadUnidades: 100, pesoEstimado: 100, activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "faj-12", denominacionId: "den-12", nombre: "Fajo Completo", cantidadUnidades: 100, pesoEstimado: 100, activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "faj-54", denominacionId: "den-32", nombre: "Rollo de 20", cantidadUnidades: 20, pesoEstimado: 226, activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "faj-55", denominacionId: "den-33", nombre: "Rollo de 40", cantidadUnidades: 40, pesoEstimado: 228, activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "faj-56", denominacionId: "den-34", nombre: "Rollo de 50", cantidadUnidades: 50, pesoEstimado: 115, activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "faj-57", denominacionId: "den-35", nombre: "Rollo de 40", cantidadUnidades: 40, pesoEstimado: 200, activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "faj-13", denominacionId: "den-13", nombre: "Fajo Completo", cantidadUnidades: 100, pesoEstimado: 110, activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "faj-14", denominacionId: "den-14", nombre: "Fajo Completo", cantidadUnidades: 100, pesoEstimado: 110, activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "faj-15", denominacionId: "den-15", nombre: "Fajo Completo", cantidadUnidades: 100, pesoEstimado: 110, activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "faj-16", denominacionId: "den-16", nombre: "Fajo Completo", cantidadUnidades: 100, pesoEstimado: 110, activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "faj-17", denominacionId: "den-17", nombre: "Fajo Completo", cantidadUnidades: 100, pesoEstimado: 110, activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "faj-18", denominacionId: "den-18", nombre: "Fajo Completo", cantidadUnidades: 100, pesoEstimado: 110, activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "faj-19", denominacionId: "den-19", nombre: "Fajo Completo", cantidadUnidades: 100, pesoEstimado: 100, activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "faj-58", denominacionId: "den-37", nombre: "Rollo de 25", cantidadUnidades: 25, pesoEstimado: 212, activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "faj-59", denominacionId: "den-38", nombre: "Rollo de 25", cantidadUnidades: 25, pesoEstimado: 187, activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "faj-60", denominacionId: "den-39", nombre: "Rollo de 40", cantidadUnidades: 40, pesoEstimado: 312, activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "faj-20", denominacionId: "den-20", nombre: "Fajo Completo", cantidadUnidades: 100, pesoEstimado: 110, activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "faj-21", denominacionId: "den-21", nombre: "Fajo Completo", cantidadUnidades: 100, pesoEstimado: 110, activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "faj-22", denominacionId: "den-22", nombre: "Fajo Completo", cantidadUnidades: 100, pesoEstimado: 110, activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "faj-23", denominacionId: "den-23", nombre: "Fajo Completo", cantidadUnidades: 100, pesoEstimado: 110, activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "faj-24", denominacionId: "den-24", nombre: "Fajo Completo", cantidadUnidades: 100, pesoEstimado: 100, activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "faj-25", denominacionId: "den-25", nombre: "Fajo Completo", cantidadUnidades: 100, pesoEstimado: 100, activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "faj-26", denominacionId: "den-26", nombre: "Fajo Completo", cantidadUnidades: 100, pesoEstimado: 100, activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "faj-61", denominacionId: "den-45", nombre: "Rollo de 20", cantidadUnidades: 20, pesoEstimado: 142, activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "faj-62", denominacionId: "den-46", nombre: "Rollo de 40", cantidadUnidades: 40, pesoEstimado: 260, activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "faj-63", denominacionId: "den-47", nombre: "Rollo de 50", cantidadUnidades: 50, pesoEstimado: 250, activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
  ];
}

export function getDemoClasificaciones(): Clasificacion[] {
  return [
    { id: "cla-1", nombre: "Apto", descripcion: "Billete en buen estado apto para recirculación", color: "#22c55e", activo: true, divisasAplicables: [], createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "cla-2", nombre: "No Apto", descripcion: "Billete deteriorado no apto para recirculación", color: "#ef4444", activo: true, divisasAplicables: [], createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "cla-3", nombre: "Sospechoso", descripcion: "Billete con presunta falsificación", color: "#f59e0b", activo: true, divisasAplicables: [], createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "cla-4", nombre: "Mutilado", descripcion: "Billete con daños físicos parciales", color: "#8b5cf6", activo: true, divisasAplicables: [], createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "cla-5", nombre: "Falso", descripcion: "Billete falsificado", color: "#1e293b", activo: true, divisasAplicables: [], createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "cla-6", nombre: "Señuelo", descripcion: "Billete con dispositivo de rastreo", color: "#06b6d4", activo: true, divisasAplicables: [], createdAt: "2026-01-01", updatedAt: "2026-01-01" },
  ];
}

export function getDemoStableCoins(): StableCoin[] {
  return [
    { id: "sc-1", nombre: "USDT (Tether)", codigoISO: "USDT", simbolo: "₮", redBlockchain: "Ethereum (ERC-20)", contractAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7", collateralType: "Fiat", peggedTo: "USD", tasaCambio: 0, factorRedondeo: 2, activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "sc-2", nombre: "USDC (USD Coin)", codigoISO: "USDC", simbolo: "₮", redBlockchain: "Ethereum (ERC-20)", contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", collateralType: "Fiat", peggedTo: "USD", tasaCambio: 0, factorRedondeo: 2, activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "sc-3", nombre: "DAI", codigoISO: "DAI", simbolo: "◈", redBlockchain: "Ethereum (ERC-20)", contractAddress: "0x6B175474E89094C44Da98b954EedeAC495271d0F", collateralType: "Crypto", peggedTo: "USD", tasaCambio: 0, factorRedondeo: 2, activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    { id: "sc-4", nombre: "BUSD", codigoISO: "BUSD", simbolo: "₮", redBlockchain: "Binance Smart Chain (BEP-20)", contractAddress: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", collateralType: "Fiat", peggedTo: "USD", tasaCambio: 0, factorRedondeo: 2, activo: true, createdAt: "2026-01-01", updatedAt: "2026-01-01" },
  ];
}

/* ── Service functions (swap for real API later) ── */
export async function fetchDivisas(): Promise<DivisasApiData> {
  try {
    return await fetchFromApi<DivisasApiData>("divisas");
  } catch {
    return {
      divisas: getDemoDivisas(),
      denominaciones: getDemoDenominaciones(),
      fajos: getDemoFajos(),
      clasificaciones: getDemoClasificaciones(),
      stableCoins: getDemoStableCoins(),
    };
  }
}
