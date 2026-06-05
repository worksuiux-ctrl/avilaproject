import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "@worksuiux-ctrl/my-design-system";
import { Input } from "@worksuiux-ctrl/my-design-system";
import { Card } from "@worksuiux-ctrl/my-design-system";
import { Logo } from "@worksuiux-ctrl/my-design-system";

export function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const success = await login(username, password);
      if (success) {
        navigate("/dashboard");
      } else {
        setError("Credenciales inválidas");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--color-neutro-100)]">
      <Card variant="elevated" padding="lg" className="w-full max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="text-center space-y-2">
            <Logo variant="full" size="md" />
            <p className="text-sm text-[var(--color-neutro-500)]">
              Inicia sesión para continuar
            </p>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
              {error}
            </div>
          )}

          <Input
            label="Usuario"
            placeholder="admin"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />

          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </Button>

          <p className="text-xs text-center text-[var(--color-neutro-400)]">
            Demo: admin / 123456
          </p>
        </form>
      </Card>
    </div>
  );
}
