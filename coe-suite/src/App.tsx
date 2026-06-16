import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProviders } from "./contexts/AppProviders";
import { AppShell } from "./layouts/AppShell";
import { Dashboard } from "./pages/Dashboard/Dashboard";
import { ConfigEngine } from "./pages/ConfigEngine/ConfigEngine";
import { CoengineActivity } from "./pages/CoengineActivity/CoengineActivity";
import { WarRoom } from "./pages/WarRoom/WarRoom";
import { KpiEstrategico } from "./pages/KpiEstrategico/KpiEstrategico";
import { Unidades, Divisas, Proveedores, Clientes, Grupos, MotorTransacciones } from "./pages/Configuracion";
import { ComingSoon } from "./pages/ComingSoon/ComingSoon";
import { SoporteTicket } from "./pages/SoporteTicket/SoporteTicket";
import { SoporteFaq } from "./pages/SoporteFaq/SoporteFaq";
import { Reportes } from "./pages/Reportes/Reportes";
import { Interfaces } from "./pages/Integraciones/Interfaces/Interfaces";
import { PanelIntegraciones } from "./pages/Integraciones/PanelIntegraciones/PanelIntegraciones";
import { MapaInteractivo } from "./pages/Georreferenciacion/MapaInteractivo";
import { Login } from "./pages/Login/Login";
import { OperacionesPage } from "./pages/Operaciones/OperacionesPage";

const PENDING_ROUTES = [
  "kpi-operativo", "op-reports",
  "reg-reports", "audit",
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
            <Route path="/reportes" element={<Reportes />} />
            <Route path="/interfaces" element={<Interfaces />} />
            <Route path="/integrations" element={<PanelIntegraciones />} />
            <Route path="/georef" element={<MapaInteractivo />} />
            <Route path="/config" element={<Navigate to="/config/unidades" replace />} />
            <Route path="/config/unidades" element={<Unidades />} />
            <Route path="/config/divisas" element={<Divisas />} />
            <Route path="/config/proveedores" element={<Proveedores />} />
            <Route path="/config/clientes" element={<Clientes />} />
            <Route path="/config/grupos" element={<Grupos />} />
            <Route path="/config/motor-transacciones" element={<MotorTransacciones />} />
            <Route path="/operaciones" element={<OperacionesPage />} />
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
