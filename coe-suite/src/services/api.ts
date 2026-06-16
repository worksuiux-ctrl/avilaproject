import { supabase } from "@integrations/supabase/client";

export async function fetchFromApi<T>(endpoint: string): Promise<T> {
  if (import.meta.env.DEV) {
    throw new Error("DEV_MODE");
  }
  const { data, error } = await supabase.from(endpoint).select("*");
  if (error) throw error;
  return data as unknown as T;
}

export async function fetchFromApiWithFilter<T>(
  endpoint: string,
  column: string,
  value: string
): Promise<T> {
  if (import.meta.env.DEV) {
    throw new Error("DEV_MODE");
  }
  const { data, error } = await supabase
    .from(endpoint)
    .select("*")
    .eq(column, value);
  if (error) throw error;
  return data as unknown as T;
}
