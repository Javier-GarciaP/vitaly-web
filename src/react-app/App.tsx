import { BrowserRouter as Router, Routes, Route } from "react-router";
import DashboardLayout from "@/react-app/components/DashboardLayout";
import DashboardPage from "@/react-app/pages/Dashboard";
import PacientesPage from "@/react-app/pages/Pacientes";
import FacturasPage from "@/react-app/pages/Facturas";
import ExamenesPage from "@/react-app/pages/Examenes";
import ResultadosPage from "@/react-app/pages/Resultados";
import PublicVerify from "./pages/PublicVerify";
import PanelMaestro from "./pages/PanelMaestro";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="pacientes" element={<PacientesPage />} />
          <Route path="facturas" element={<FacturasPage />} />
          <Route path="examenes" element={<ExamenesPage />} />
          <Route path="resultados" element={<ResultadosPage />} />
          <Route path="panel" element={<PanelMaestro/>}/>
        </Route>
        <Route path="/verificar/:uuid" element={<PublicVerify />} />
      </Routes>
    </Router>
  );
}
