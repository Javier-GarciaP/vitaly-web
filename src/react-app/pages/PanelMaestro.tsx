import React, { useEffect, useState, useMemo } from "react";
import {
  Search,
  Printer,
  Save,
  X,
  Beaker,
  Activity,
  PlusCircle,
  CheckCircle2,
  LayoutGrid,
  User,
  FlaskConical,
  Clock,
  Trash2,
  Droplets,
  Microscope,
  TestTube2,
  Stethoscope,
  BeakerIcon,
  Menu,
  ChevronRight,
} from "lucide-react";

// --- COMPONENTES EXTERNOS ---
import HematologiaForm from "@/react-app/components/ExamenForms/HematologiaForm";
import QuimicaClinicaForm from "@/react-app/components/ExamenForms/QuimicaClinicaForm";
import OrinaForm from "@/react-app/components/ExamenForms/OrinaForm";
import HecesForm from "@/react-app/components/ExamenForms/HecesForm";
import CoagulacionForm from "@/react-app/components/ExamenForms/CoagulacionForm";
import GrupoSanguineoForm from "@/react-app/components/ExamenForms/GrupoSanguineoForm";
import BacteriologiaForm from "@/react-app/components/ExamenForms/BacteriologiaForm";
import MiscelaneosForm from "@/react-app/components/ExamenForms/MiscelaneosForm";

import { generateQRBase64 } from "@/utils/qr";
import ReportViewer from "@/react-app/reports/ReportViewer";

const EXAMEN_CONFIG: Record<string, { color: string; icon: any; bg: string }> = {
  Hematología: { color: "text-red-600", bg: "bg-red-50", icon: Droplets },
  "Química Clínica": { color: "text-blue-600", bg: "bg-blue-50", icon: FlaskConical },
  Orina: { color: "text-amber-500", bg: "bg-amber-50", icon: TestTube2 },
  Heces: { color: "text-emerald-700", bg: "bg-emerald-50", icon: Microscope },
  Coagulación: { color: "text-rose-600", bg: "bg-rose-50", icon: Activity },
  "Grupo Sanguíneo": { color: "text-red-800", bg: "bg-red-100", icon: BeakerIcon },
  Bacteriología: { color: "text-purple-600", bg: "bg-purple-50", icon: Beaker },
  Misceláneos: { color: "text-slate-600", bg: "bg-slate-50", icon: Stethoscope },
};

const CATALOGO_EXAMENES = [
  "Hematología", "Química Clínica", "Orina", "Heces",
  "Coagulación", "Grupo Sanguíneo", "Bacteriología", "Misceláneos",
];

interface Paciente { id: number; nombre: string; cedula: string; totalEx?: number; completados?: number; edad?: number; }
interface Examen { id: number; paciente_id: number; tipo: string; fecha: string; estado: "pendiente" | "en_proceso" | "completado"; resultados: any; uuid?: string; }
interface Factura { paciente_id: number; fecha: string; }

export default function PanelControlMaster() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [examenes, setExamenes] = useState<Examen[]>([]);
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [selectedPacienteId, setSelectedPacienteId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [notification, setNotification] = useState("");
  const [activeExamen, setActiveExamen] = useState<Examen | null>(null);
  const [editResultados, setEditResultados] = useState<any>({});
  const [editEstado, setEditEstado] = useState<Examen["estado"]>("pendiente");
  const [qrCodeImage, setQrCodeImage] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const hoy = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Caracas", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

  useEffect(() => { loadInitialData(); }, []);

  const loadInitialData = async () => {
    try {
      const [resP, resE, resF] = await Promise.all([fetch("/api/pacientes"), fetch("/api/examenes"), fetch("/api/facturas")]);
      setPacientes(await resP.json());
      setExamenes(await resE.json());
      setFacturas(await resF.json());
    } catch (e) { console.error("Error cargando datos"); }
  };

  const showMsg = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3000);
  };

  const pacientesHoy = useMemo(() => {
    const idsConFacturaHoy = facturas.filter((f) => f.fecha === hoy).map((f) => f.paciente_id);
    return pacientes
      .filter((p) => idsConFacturaHoy.includes(p.id))
      .filter((p) => p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || p.cedula.includes(searchTerm))
      .map((p) => {
        const exs = examenes.filter((e) => e.paciente_id === p.id && e.fecha === hoy);
        return { ...p, totalEx: exs.length, completados: exs.filter((e) => e.estado === "completado").length };
      });
  }, [facturas, pacientes, examenes, searchTerm, hoy]);

  const pacienteActivo = useMemo(() => pacientesHoy.find((p) => p.id === selectedPacienteId), [selectedPacienteId, pacientesHoy]);
  const examenesHoyPaciente = useMemo(() => examenes.filter((e) => e.paciente_id === selectedPacienteId && e.fecha === hoy), [selectedPacienteId, examenes, hoy]);
  const isPacienteListoParaImprimir = useMemo(() => pacienteActivo && examenesHoyPaciente.length > 0 && examenesHoyPaciente.every((ex) => ex.estado === "completado"), [pacienteActivo, examenesHoyPaciente]);

  const handleCreateExamen = async (tipo: string) => {
    if (!selectedPacienteId) return;
    const res = await fetch("/api/examenes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paciente_id: selectedPacienteId, tipo, fecha: hoy, estado: "pendiente", resultados: {}, uuid: crypto.randomUUID() }),
    });
    if (res.ok) { showMsg(`${tipo} añadido`); loadInitialData(); }
  };

  const handleDeleteExamen = async (ex: Examen) => {
    if (!confirm(`¿Eliminar ${ex.tipo}?`)) return;
    const res = await fetch(`/api/examenes/${ex.id}`, { method: "DELETE" });
    if (res.ok) { showMsg("Eliminado"); loadInitialData(); }
  };

  const handleSaveResults = async () => {
    if (!activeExamen) return;
    setIsSaving(true);
    const res = await fetch(`/api/examenes/${activeExamen.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...activeExamen, resultados: editResultados, estado: editEstado }),
    });
    if (res.ok) { showMsg("Guardado"); setIsEditing(false); loadInitialData(); }
    setIsSaving(false);
  };

  const handleOpenPrint = async (ex: Examen) => {
    const qr = await generateQRBase64(ex.uuid || "");
    setQrCodeImage(qr);
    setActiveExamen(ex);
    setShowPrintModal(true);
  };

  const handlePrintMasivo = async () => {
    if (!pacienteActivo) return;
    setIsSaving(true);
    const examenesConQR = await Promise.all(examenesHoyPaciente.map(async (ex) => ({ examen: ex, qr: await generateQRBase64(ex.uuid || "") })));
    setActiveExamen({ id: 0, paciente_id: selectedPacienteId!, tipo: "IMPRESION_MASIVA", fecha: hoy, estado: "completado", resultados: examenesConQR });
    setShowPrintModal(true);
    setIsSaving(false);
  };

  const renderExamenForm = () => {
    if (!activeExamen) return null;
    const props = { resultados: editResultados, onChange: setEditResultados };
    const forms: Record<string, React.ReactElement> = {
      Hematología: <HematologiaForm {...props} />,
      "Química Clínica": <QuimicaClinicaForm {...props} />,
      Orina: <OrinaForm {...props} />,
      Heces: <HecesForm {...props} />,
      Coagulación: <CoagulacionForm {...props} />,
      "Grupo Sanguíneo": <GrupoSanguineoForm {...props} />,
      Bacteriología: <BacteriologiaForm {...props} />,
      Misceláneos: <MiscelaneosForm {...props} />,
    };
    return forms[activeExamen.tipo] || <div className="p-10 text-center">Formulario no definido</div>;
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans text-slate-900">
      {/* NOTIFICACIONES - Refinadas */}
      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[2000] bg-slate-900 text-white px-5 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-2">
          <CheckCircle2 className="text-emerald-400" size={16} />
          <span className="text-[10px] font-bold uppercase tracking-wider">{notification}</span>
        </div>
      )}

      {/* SIDEBAR - Responsivo con Drawer en móvil */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-slate-50">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-100">
                  <User className="text-white" size={16} />
                </div>
                <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-800">Pacientes</h2>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-400"><X size={20}/></button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" placeholder="Buscar..." 
                className="w-full pl-9 pr-3 py-2.5 bg-slate-100 rounded-xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
            {pacientesHoy.map((p) => (
              <button
                key={p.id}
                onClick={() => { setSelectedPacienteId(p.id); setIsSidebarOpen(false); }}
                className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${
                  selectedPacienteId === p.id ? "bg-blue-600 text-white shadow-blue-200" : "hover:bg-slate-50 text-slate-600"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black ${selectedPacienteId === p.id ? "bg-white/20" : "bg-blue-50 text-blue-600"}`}>
                  {p.nombre.charAt(0)}
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="font-bold truncate text-[10px] uppercase">{p.nombre}</p>
                  <p className={`text-[9px] opacity-70 ${selectedPacienteId === p.id ? "text-white" : "text-slate-400"}`}>{p.cedula}</p>
                </div>
                <div className={`text-[9px] font-black ${selectedPacienteId === p.id ? "text-white" : "text-blue-600"}`}>
                  {p.completados}/{p.totalEx}
                </div>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* PANEL CENTRAL */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header Móvil */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-100">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-slate-100 rounded-lg text-slate-600"><Menu size={20}/></button>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Laboratorio</span>
          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center"><Beaker size={18} className="text-slate-400"/></div>
        </header>

        {pacienteActivo ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Banner Paciente */}
            <div className="p-4 lg:p-6 bg-white border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg"><User size={20} /></div>
                <div>
                  <h1 className="text-sm lg:text-lg font-black uppercase tracking-tight leading-none mb-1 italic">{pacienteActivo.nombre}</h1>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{pacienteActivo.cedula} • {hoy}</p>
                </div>
              </div>
              
              {isPacienteListoParaImprimir && (
                <button onClick={handlePrintMasivo} className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg transition-all active:scale-95">
                  <span className="text-[10px] font-black uppercase">Entregar Todo</span>
                  <Printer size={16} />
                </button>
              )}
            </div>

            {/* Contenido en 2 Columnas responsivo */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-8">
              <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Listado de Exámenes */}
                <div className="lg:col-span-8 space-y-4">
                  <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 mb-2">
                    <LayoutGrid size={12} /> Estudios Actuales
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {examenesHoyPaciente.map((ex) => {
                      const config = EXAMEN_CONFIG[ex.tipo] || { color: "text-slate-600", bg: "bg-slate-50", icon: Beaker };
                      const Icon = config.icon;
                      return (
                        <div key={ex.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                          <div className="flex items-start justify-between mb-4">
                            <div className={`p-2.5 ${config.bg} ${config.color} rounded-lg shadow-inner`}><Icon size={18} /></div>
                            <button onClick={() => handleDeleteExamen(ex)} className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                          </div>
                          <h4 className="font-bold text-[11px] uppercase tracking-tight mb-1 truncate">{ex.tipo}</h4>
                          <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8px] font-black uppercase mb-4 ${ex.estado === "completado" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                             <Clock size={8} /> {ex.estado.replace("_", " ")}
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => { setActiveExamen(ex); setEditResultados(ex.resultados || {}); setEditEstado(ex.estado); setIsEditing(true); }} className="flex-1 py-2 bg-slate-900 text-white text-[9px] font-bold uppercase rounded-lg hover:bg-blue-600 transition-colors">Editar</button>
                            <button disabled={ex.estado !== "completado"} onClick={() => handleOpenPrint(ex)} className="px-3 bg-slate-100 text-slate-500 rounded-lg hover:bg-blue-100 hover:text-blue-600 disabled:opacity-20 transition-colors"><Printer size={14}/></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Catálogo */}
                <div className="lg:col-span-4">
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 sticky top-0">
                    <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                      <PlusCircle size={12} /> Catálogo
                    </h3>
                    <div className="grid grid-cols-1 gap-1.5">
                      {CATALOGO_EXAMENES.map((tipo) => {
                        const yaExiste = examenesHoyPaciente.some((e) => e.tipo === tipo);
                        return (
                          <button 
                            key={tipo} disabled={yaExiste} onClick={() => handleCreateExamen(tipo)}
                            className={`w-full p-3 rounded-xl border flex items-center justify-between text-[10px] font-bold uppercase transition-all ${yaExiste ? "bg-slate-50 border-transparent opacity-40" : "border-slate-100 hover:border-blue-500 hover:bg-blue-50"}`}
                          >
                            <span>{tipo}</span>
                            {yaExiste ? <CheckCircle2 size={14} className="text-emerald-500"/> : <PlusCircle size={14} className="text-blue-500 opacity-0 group-hover:opacity-100"/>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-6"><Beaker size={40} className="text-slate-100" /></div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Seleccione un paciente</h2>
          </div>
        )}
      </main>

      {/* MODAL DE EDICIÓN - Tipo "Bottom Sheet" en móvil */}
      {isEditing && activeExamen && (
        <div className="fixed inset-0 z-[1000] flex items-end lg:items-center justify-center p-0 lg:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !isSaving && setIsEditing(false)} />
          <div className="relative w-full lg:max-w-5xl h-[92vh] lg:h-[85vh] bg-white rounded-t-[2rem] lg:rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="p-4 lg:p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={`p-2 ${EXAMEN_CONFIG[activeExamen.tipo]?.bg} ${EXAMEN_CONFIG[activeExamen.tipo]?.color} rounded-lg`}><FlaskConical size={18}/></div>
                <div>
                  <h2 className="text-xs lg:text-sm font-black uppercase tracking-tight">{activeExamen.tipo}</h2>
                  <p className="text-[9px] font-bold text-blue-600 uppercase">{pacienteActivo?.nombre}</p>
                </div>
              </div>
              <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
              <div className="max-w-3xl mx-auto">
                {renderExamenForm()}
                <div className="mt-10 p-4 lg:p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-black uppercase text-center text-slate-400 mb-4 tracking-widest">Estado del Análisis</p>
                  <div className="flex bg-white p-1 rounded-xl border border-slate-200 gap-1">
                    {["pendiente", "en_proceso", "completado"].map((st) => (
                      <button key={st} onClick={() => setEditEstado(st as any)} className={`flex-1 py-2 text-[9px] font-black uppercase rounded-lg transition-all ${editEstado === st ? "bg-slate-900 text-white shadow-md" : "text-slate-400 hover:bg-slate-50"}`}>
                        {st.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 lg:p-6 bg-white border-t border-slate-100 flex gap-3">
              <button onClick={() => setIsEditing(false)} className="px-6 py-3 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase rounded-xl">Cancelar</button>
              <button onClick={handleSaveResults} disabled={isSaving} className="flex-1 py-3 bg-blue-600 text-white text-[10px] font-bold uppercase rounded-xl shadow-lg shadow-blue-100 flex items-center justify-center gap-2">
                {isSaving ? "Guardando..." : <><Save size={16}/> Guardar Resultados</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL IMPRESIÓN */}
      {showPrintModal && activeExamen && (
        <div className="fixed inset-0 bg-slate-900/90 flex items-center justify-center z-[1100] p-0 lg:p-4 backdrop-blur-md">
          <div className="bg-white w-full h-full lg:max-w-6xl lg:h-[95vh] lg:rounded-[2rem] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-4 lg:p-6 bg-white border-b">
              <h2 className="text-xs lg:text-sm font-black uppercase flex items-center gap-2"><Printer size={18} className="text-blue-600" /> Vista Previa</h2>
              <button onClick={() => setShowPrintModal(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={20}/></button>
            </div>
            <div className="flex-1 bg-slate-200/50 overflow-y-auto p-2 lg:p-6 custom-scrollbar flex justify-center">
              <div className="w-full max-w-[800px] shadow-2xl origin-top lg:scale-100">
                <ReportViewer
                  type={activeExamen.tipo}
                  data={activeExamen.resultados}
                  qrImage={qrCodeImage}
                  patient={{
                    nombre: pacienteActivo?.nombre || "",
                    cedula: pacienteActivo?.cedula || "",
                    edad: pacienteActivo?.edad || "N/A",
                    fecha: activeExamen.fecha ? new Date(new Date(activeExamen.fecha).getTime() + new Date().getTimezoneOffset() * 60000).toLocaleDateString("es-ES") : "Sin fecha"
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }
      `}</style>
    </div>
  );
}