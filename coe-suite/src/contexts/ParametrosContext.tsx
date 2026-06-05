import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { supabase } from "../integrations/supabase/client";

export interface Parametro {
  id?: number;
  categoria: string;
  clave: string;
  valor: string;
  activo: boolean;
  descripcion?: string;
}

export interface Transportista {
  id: number;
  nombre: string;
  rif: string;
  telefono: string;
  email: string;
  direccion: string;
  activo: boolean;
}

interface ParametrosContextType {
  parametros: Parametro[];
  setParametros: (parametros: Parametro[]) => void;
  getParametro: (id: string) => Parametro | undefined;
  isParametroActivo: (id: string) => boolean;
  getParametroValor: (id: string) => string | undefined;
  getNombreGerencia: () => string;
  getNombreDepartamento: () => string;
  isLoading: boolean;
}

const ParametrosContext = createContext<ParametrosContextType | undefined>(undefined);

const PARAMETROS_STORAGE_KEY = "parametros_sistema";
const KV_TABLE = "kv_store_29b8716c";

const db = () => supabase.from(KV_TABLE as any);

async function kvSet(key: string, value: string): Promise<void> {
  try {
    const { error } = await (db() as any).upsert({ key, value }, { onConflict: "key" });

    if (error) {
      console.warn(`[Params] Error guardando ${key}:`, error.message);
    }
  } catch (error) {
    console.warn(`[Params] No se pudo sincronizar "${key}" con Supabase:`, error);
  }
}

async function saveToSupabase(parametros: Array<{ id: string; activo: boolean; valor?: string }>) {
  for (const param of parametros) {
    kvSet(`parametro:${param.id}`, JSON.stringify({ activo: param.activo, valor: param.valor }));
  }
}

async function loadFromSupabase(): Promise<Array<{ id: string; activo: boolean; valor?: string }> | null> {
  try {
    const { data, error } = await (db() as any)
      .select("key, value")
      .like("key", "parametro:%");

    if (error) {
      console.warn("[Params] No se pudieron cargar parámetros desde Supabase:", error.message);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    const rawItems: Array<{ key: string; value: string }> = data as any;
    const parametros: Array<{ id: string; activo: boolean; valor?: string }> = rawItems
      .filter((item) => item?.key && item?.value)
      .map((item) => {
        try {
          const id = item.key.replace("parametro:", "");
          const parsed = JSON.parse(item.value);
          return { id, activo: parsed.activo as boolean, valor: parsed.valor as string | undefined };
        } catch {
          return null;
        }
      })
      .filter((p): p is NonNullable<typeof p> => p !== null);

    return parametros.length > 0 ? parametros : null;
  } catch (error) {
    console.warn("[Params] Error cargando parámetros desde Supabase:", error);
    return null;
  }
}

export function ParametrosProvider({ children }: { children: ReactNode }) {
  const [parametros, setParametrosState] = useState<Parametro[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const supabaseData = await loadFromSupabase();

        if (supabaseData && supabaseData.length > 0) {
          localStorage.setItem(PARAMETROS_STORAGE_KEY, JSON.stringify(supabaseData));
        } else {
          const localData = localStorage.getItem(PARAMETROS_STORAGE_KEY);
          if (localData) {
            const parsed = JSON.parse(localData);
            saveToSupabase(parsed);
          }
        }
      } catch (error) {
        console.warn("[Params] Error en carga inicial:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const setParametros = (newParametros: Parametro[]) => {
    setParametrosState(newParametros);

    const toSave = newParametros.map((p) => ({ id: String(p.clave || p.id || ""), activo: p.activo, valor: p.valor }));

    localStorage.setItem(PARAMETROS_STORAGE_KEY, JSON.stringify(toSave));

    saveToSupabase(toSave);
  };

  const getParametro = (id: string) => parametros.find((p) => String(p.id) === id || p.clave === id);

  const isParametroActivo = (id: string) => {
    const parametro = getParametro(id);
    return parametro ? parametro.activo : false;
  };

  const getParametroValor = (id: string) => {
    const parametro = getParametro(id);
    return parametro ? parametro.valor : undefined;
  };

  const getNombreGerencia = () => {
    const parametro = getParametro("NOMBRE_GERENCIA");
    return parametro?.valor || "Gerencia de Operaciones";
  };

  const getNombreDepartamento = () => {
    const parametro = getParametro("NOMBRE_DEPARTAMENTO");
    return parametro?.valor || "Departamento de Traslado de Valores";
  };

  return (
    <ParametrosContext.Provider
      value={{
        parametros,
        setParametros,
        getParametro,
        isParametroActivo,
        getParametroValor,
        getNombreGerencia,
        getNombreDepartamento,
        isLoading,
      }}
    >
      {children}
    </ParametrosContext.Provider>
  );
}

export function useParametros() {
  const context = useContext(ParametrosContext);
  if (context === undefined) {
    return {
      parametros: [] as Parametro[],
      setParametros: () => {},
      getParametro: () => undefined,
      isParametroActivo: () => false,
      getParametroValor: () => undefined,
      getNombreGerencia: () => "Gerencia de Operaciones",
      getNombreDepartamento: () => "Departamento de Traslado de Valores",
      isLoading: false,
    };
  }
  return context;
}
