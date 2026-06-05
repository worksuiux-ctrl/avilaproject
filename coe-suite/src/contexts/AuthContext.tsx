import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { supabase } from "../integrations/supabase/client";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (user: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
  user: { email?: string; id?: string } | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem("coe-auth") === "true"
  );
  const [user, setUser] = useState<{ email?: string; id?: string } | null>(() => {
    const savedUser = localStorage.getItem("coe-user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [authMode, setAuthMode] = useState<"mock" | "supabase">(() => {
    return localStorage.getItem("coe-auth-mode") as "mock" | "supabase" || "mock";
  });
  const useSupabase = true;

  useEffect(() => {
    if (!useSupabase) return;

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (session?.user) {
          setAuthMode("supabase");
          setIsAuthenticated(true);
          setUser({
            email: session.user.email,
            id: session.user.id,
          });
          localStorage.setItem("coe-auth", "true");
          localStorage.setItem("coe-auth-mode", "supabase");
          localStorage.setItem("coe-user", JSON.stringify({
            email: session.user.email,
            id: session.user.id,
          }));
        }
      })
      .catch(() => {
        console.warn("No se pudo verificar sesión de Supabase");
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setAuthMode("supabase");
        setIsAuthenticated(true);
        setUser({
          email: session.user.email,
          id: session.user.id,
        });
        localStorage.setItem("coe-auth", "true");
        localStorage.setItem("coe-auth-mode", "supabase");
        localStorage.setItem("coe-user", JSON.stringify({
          email: session.user.email,
          id: session.user.id,
        }));
      } else if (authMode === "supabase") {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem("coe-auth");
        localStorage.removeItem("coe-auth-mode");
        localStorage.removeItem("coe-user");
      }
    });

    return () => subscription.unsubscribe();
  }, [useSupabase, authMode]);

  const login = async (username: string, password: string): Promise<boolean> => {
    if (useSupabase) {
      try {
        const email = username.includes("@") ? username : `${username}@coe.local`;

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if ((username === "admin" || username === "admin@coe.local") && password === "123456") {
            const mockUser = { email: "admin@coe.local" };
            setAuthMode("mock");
            localStorage.setItem("coe-auth", "true");
            localStorage.setItem("coe-auth-mode", "mock");
            localStorage.setItem("coe-user", JSON.stringify(mockUser));
            setIsAuthenticated(true);
            setUser(mockUser);
            return true;
          }
          throw error;
        }

        if (data.user) {
          const userObj = { email: data.user.email, id: data.user.id };
          setAuthMode("supabase");
          localStorage.setItem("coe-auth", "true");
          localStorage.setItem("coe-auth-mode", "supabase");
          localStorage.setItem("coe-user", JSON.stringify(userObj));
          setIsAuthenticated(true);
          setUser(userObj);
          return true;
        }
        return false;
      } catch {
        if ((username === "admin" || username === "admin@coe.local") && password === "123456") {
          const mockUser = { email: "admin@coe.local" };
          setAuthMode("mock");
          localStorage.setItem("coe-auth", "true");
          localStorage.setItem("coe-auth-mode", "mock");
          localStorage.setItem("coe-user", JSON.stringify(mockUser));
          setIsAuthenticated(true);
          setUser(mockUser);
          return true;
        }
        return false;
      }
    }

    if ((username === "admin" || username === "admin@coe.local") && password === "123456") {
      const mockUser = { email: "admin@coe.local" };
      setAuthMode("mock");
      localStorage.setItem("coe-auth", "true");
      localStorage.setItem("coe-auth-mode", "mock");
      localStorage.setItem("coe-user", JSON.stringify(mockUser));
      setIsAuthenticated(true);
      setUser(mockUser);
      return true;
    }
    return false;
  };

  const logout = async () => {
    if (useSupabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem("coe-auth");
    localStorage.removeItem("coe-auth-mode");
    localStorage.removeItem("coe-user");
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
