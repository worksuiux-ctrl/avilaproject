import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./AuthContext";
import { FormatoProvider } from "./FormatoContext";
import { ParametrosProvider } from "./ParametrosContext";
import { Toaster } from "sonner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FormatoProvider>
          <ParametrosProvider>
            {children}
            <Toaster richColors position="top-right" />
          </ParametrosProvider>
        </FormatoProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
