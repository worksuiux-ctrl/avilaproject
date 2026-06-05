import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type FormatoSeparador =
  | "punto_coma"
  | "coma_punto"
  | "solo_coma"
  | "solo_punto"
  | "espacio_coma"
  | "espacio_punto";

interface FormatoContextType {
  formatoActual: FormatoSeparador;
  setFormato: (formato: FormatoSeparador) => void;
  formatearNumero: (numero: number, decimales?: number) => string;
  getFormatoLabel: (formato: FormatoSeparador) => string;
  getFormatoEjemplo: (formato: FormatoSeparador) => string;
  cantidadDecimales: number;
  setCantidadDecimales: (cantidad: number) => void;
  getEjemploDecimales: (cantidad: number) => string;
}

const FormatoContext = createContext<FormatoContextType | undefined>(undefined);

const FORMATO_STORAGE_KEY = "formato_separador_sistema";
const DECIMALES_STORAGE_KEY = "cantidad_decimales_monto";

export function FormatoProvider({ children }: { children: ReactNode }) {
  const [formatoActual, setFormatoActual] = useState<FormatoSeparador>(() => {
    const saved = localStorage.getItem(FORMATO_STORAGE_KEY);
    return (saved as FormatoSeparador) || "coma_punto";
  });

  const [cantidadDecimales, setCantidadDecimalesState] = useState<number>(() => {
    const saved = localStorage.getItem(DECIMALES_STORAGE_KEY);
    const parsed = saved ? parseInt(saved, 10) : 2;
    return isNaN(parsed) ? 2 : parsed;
  });

  useEffect(() => {
    localStorage.setItem(FORMATO_STORAGE_KEY, formatoActual);
  }, [formatoActual]);

  useEffect(() => {
    localStorage.setItem(DECIMALES_STORAGE_KEY, cantidadDecimales.toString());
  }, [cantidadDecimales]);

  const setFormato = (formato: FormatoSeparador) => {
    setFormatoActual(formato);
  };

  const setCantidadDecimales = (cantidad: number) => {
    setCantidadDecimalesState(cantidad);
  };

  const formatearNumero = (numero: number, decimales?: number): string => {
    const decimalesAUsar = decimales !== undefined ? decimales : cantidadDecimales;

    const numeroAbsoluto = Math.abs(numero);
    const signo = numero < 0 ? "-" : "";

    const partes = numeroAbsoluto.toFixed(decimalesAUsar).split(".");
    const parteEntera = partes[0];
    const parteDecimal = partes[1];

    let resultado = "";

    switch (formatoActual) {
      case "punto_coma":
        resultado = parteEntera.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        if (decimalesAUsar > 0) resultado += "," + parteDecimal;
        break;
      case "coma_punto":
        resultado = parteEntera.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        if (decimalesAUsar > 0) resultado += "." + parteDecimal;
        break;
      case "solo_coma":
        resultado = parteEntera;
        if (decimalesAUsar > 0) resultado += "," + parteDecimal;
        break;
      case "solo_punto":
        resultado = parteEntera;
        if (decimalesAUsar > 0) resultado += "." + parteDecimal;
        break;
      case "espacio_coma":
        resultado = parteEntera.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        if (decimalesAUsar > 0) resultado += "," + parteDecimal;
        break;
      case "espacio_punto":
        resultado = parteEntera.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        if (decimalesAUsar > 0) resultado += "." + parteDecimal;
        break;
      default:
        resultado = parteEntera.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        if (decimalesAUsar > 0) resultado += "," + parteDecimal;
    }

    return signo + resultado;
  };

  const getFormatoLabel = (formato: FormatoSeparador): string => {
    const labels: Record<FormatoSeparador, string> = {
      punto_coma: "Punto (miles) y Coma (decimal)",
      coma_punto: "Coma (miles) y Punto (decimal)",
      solo_coma: "Solo Coma (decimal)",
      solo_punto: "Solo Punto (decimal)",
      espacio_coma: "Espacio (miles) y Coma (decimal)",
      espacio_punto: "Espacio (miles) y Punto (decimal)",
    };
    return labels[formato];
  };

  const getFormatoEjemplo = (formato: FormatoSeparador): string => {
    const ejemplos: Record<FormatoSeparador, string> = {
      punto_coma: "100.000,00",
      coma_punto: "100,000.00",
      solo_coma: "100000,00",
      solo_punto: "100000.00",
      espacio_coma: "100 000,00",
      espacio_punto: "100 000.00",
    };
    return ejemplos[formato];
  };

  const getEjemploDecimales = (cantidad: number): string => {
    const numero = 123456.789012;
    return formatearNumero(numero, cantidad);
  };

  return (
    <FormatoContext.Provider
      value={{
        formatoActual,
        setFormato,
        formatearNumero,
        getFormatoLabel,
        getFormatoEjemplo,
        cantidadDecimales,
        setCantidadDecimales,
        getEjemploDecimales,
      }}
    >
      {children}
    </FormatoContext.Provider>
  );
}

export function useFormato() {
  const context = useContext(FormatoContext);
  if (context === undefined) {
    throw new Error("useFormato must be used within a FormatoProvider");
  }
  return context;
}
