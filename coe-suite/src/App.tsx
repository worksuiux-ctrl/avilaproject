import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProviders } from "./contexts/AppProviders";
import { AppShell } from "./layouts/AppShell";
import { Dashboard } from "./pages/Dashboard/Dashboard";
import { ConfigEngine } from "./pages/ConfigEngine/ConfigEngine";
import { CoengineActivity } from "./pages/CoengineActivity/CoengineActivity";
import { WarRoom } from "./pages/WarRoom/WarRoom";
import { KpiEstrategico } from "./pages/KpiEstrategico/KpiEstrategico";
import { ComingSoon } from "./pages/ComingSoon/ComingSoon";
import { SoporteTicket } from "./pages/SoporteTicket/SoporteTicket";
import { SoporteFaq } from "./pages/SoporteFaq/SoporteFaq";
import { Login } from "./pages/Login/Login";

const PENDING_ROUTES = [
  "config", "divisas", "transporte", "bovedas", "unidades",
  "empleados", "parametros",
  "kpi-operativo", "op-reports",
  "reg-reports", "txns", "georef", "integrations", "audit",
  "operaciones",
];

function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<AppShell />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/coengine/config" element={<ConfigEngine />} />
            <Route path="/coengine/activity" element={<CoengineActivity />} />
            <Route path="/war-room" element={<WarRoom />} />
            <Route path="/kpi-gerencial" element={<KpiEstrategico />} />
            <Route path="/soporte/tickets" element={<SoporteTicket />} />
            <Route path="/soporte/faq" element={<SoporteFaq />} />
            {PENDING_ROUTES.map((v) => (
              <Route key={v} path={`/${v}`} element={<ComingSoon view={v} />} />
            ))}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProviders>
  );
}

export default App;
