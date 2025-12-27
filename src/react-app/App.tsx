import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import DashboardLayout from "@/react-app/components/DashboardLayout";
import DashboardPage from "@/react-app/pages/Dashboard";
import PacientesPage from "@/react-app/pages/Pacientes";
import FacturasPage from "@/react-app/pages/Facturas";
import ExamenesPage from "@/react-app/pages/Examenes";
import ResultadosPage from "@/react-app/pages/Resultados";
import PublicVerify from "./pages/PublicVerify";
import PanelMaestro from "./pages/PanelMaestro";
import ConfiguracionPage from "./pages/ConfiguracionPage";

import LoginPage from "@/react-app/pages/LoginPage"; // El que creamos antes
import ProtectedRoute from "@/react-app/components/ProtecteRoute";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* RUTA PÚBLICA: LOGIN */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* RUTA PÚBLICA: VERIFICACIÓN (Sin protección) */}
        <Route path="/verificar/:uuid" element={<PublicVerify />} />

        {/* RUTAS PROTEGIDAS: Solo accesibles si estás logueado */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="pacientes" element={<PacientesPage />} />
            <Route path="facturas" element={<FacturasPage />} />
            <Route path="examenes" element={<ExamenesPage />} />
            <Route path="resultados" element={<ResultadosPage />} />
            <Route path="panel" element={<PanelMaestro/>}/>
            <Route path="configuracion" element={<ConfiguracionPage/>} />
          </Route>
        </Route>

        {/* Redirección por defecto si la ruta no existe */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}