import React, { useEffect, useState, useMemo } from "react";
import {
  Search,
  Printer,
  X,
  Beaker,
  Activity,
  CheckCircle2,
  LayoutGrid,
  User,
  FlaskConical,
  Trash2,
  Droplets,
  Microscope,
  TestTube2,
  Stethoscope,
  BeakerIcon,
  Menu,
  ChevronRight,
} from "lucide-react";
import { useNotification } from "@/react-app/context/NotificationContext";

// --- COMPONENTES EXTERNOS ---
import HematologiaForm from "@/react-app/components/ExamenForms/HematologiaForm";
import QuimicaClinicaForm from "@/react-app/components/ExamenForms/QuimicaClinicaForm";
import OrinaForm from "@/react-app/components/ExamenForms/OrinaForm";
import HecesForm from "@/react-app/components/ExamenForms/HecesForm";
import CoagulacionForm from "@/react-app/components/ExamenForms/CoagulacionForm";
import GrupoSanguineoForm from "@/react-app/components/ExamenForms/GrupoSanguineoForm";
import BacteriologiaForm from "@/react-app/components/ExamenForms/BacteriologiaForm";
import MiscelaneosForm from "@/react-app/components/ExamenForms/MiscelaneosForm";
import PSAForm from "@/react-app/components/ExamenForms/PSAForm";


import { generateQRBase64 } from "@/utils/qr";
import ReportViewer from "@/react-app/reports/ReportViewer";
import { getTodayDate } from "@/utils/date";

const EXAMEN_CONFIG: Record<string, { color: string; icon: any; bg: string }> = {
  Hematología: { color: "text-rose-500", bg: "bg-rose-50", icon: Droplets },
  "Química Clínica": { color: "text-blue-500", bg: "bg-blue-50", icon: FlaskConical },
  Orina: { color: "text-amber-500", bg: "bg-amber-50", icon: TestTube2 },
  Heces: { color: "text-emerald-600", bg: "bg-emerald-50", icon: Microscope },
  Coagulación: { color: "text-rose-400", bg: "bg-rose-50", icon: Activity },
  "Grupo Sanguíneo": { color: "text-red-700", bg: "bg-red-50", icon: BeakerIcon },
  Bacteriología: { color: "text-indigo-500", bg: "bg-indigo-50", icon: Beaker },
  Misceláneos: { color: "text-slate-500", bg: "bg-slate-50", icon: Stethoscope },
  PSA: { color: "text-cyan-600", bg: "bg-cyan-50", icon: Activity },
};


const CATALOGO_EXAMENES = [
  "Hematología", "Química Clínica", "Orina", "Heces",
  "Coagulación", "Grupo Sanguíneo", "Bacteriología", "Misceláneos", "PSA"
];


interface Paciente { id: number; nombre: string; cedula: string; totalEx?: number; completados?: number; edad?: number; }
interface Examen { id: number; paciente_id: number; tipo: string; fecha: string; estado: "pendiente" | "en_proceso" | "completado"; resultados: any; uuid?: string; }
interface Factura { paciente_id: number; fecha: string; }

export default function PanelControlMaster() {
  const { showNotification, confirmAction } = useNotification();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [examenes, setExamenes] = useState<Examen[]>([]);
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [selectedPacienteId, setSelectedPacienteId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [activeExamen, setActiveExamen] = useState<Examen | null>(null);
  const [editResultados, setEditResultados] = useState<any>({});
  const [editEstado, setEditEstado] = useState<Examen["estado"]>("pendiente");
  const [qrCodeImage, setQrCodeImage] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const hoy = getTodayDate();

  useEffect(() => { loadInitialData(); }, []);

  const loadInitialData = async () => {
    try {
      const [resP, resE, resF] = await Promise.all([fetch("/api/pacientes"), fetch("/api/examenes"), fetch("/api/facturas")]);
      setPacientes(await resP.json());
      setExamenes(await resE.json());
      setFacturas(await resF.json());
    } catch (e) { console.error("Error cargando datos"); }
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
  const completadosCount = useMemo(() => examenesHoyPaciente.filter((ex) => ex.estado === "completado").length, [examenesHoyPaciente]);

  const handleCreateExamen = async (tipo: string) => {
    if (!selectedPacienteId) return;
    const res = await fetch("/api/examenes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paciente_id: selectedPacienteId, tipo, fecha: hoy, estado: "pendiente", resultados: {}, uuid: crypto.randomUUID() }),
    });
    if (res.ok) {
      showNotification("success", "Estudio Añadido", `${tipo} ha sido agregado al expediente`);
      loadInitialData();
    }
  };

  const handleDeleteExamen = async (ex: Examen) => {
    confirmAction({
      title: "Eliminar Estudio",
      message: `¿Está seguro de eliminar el estudio de ${ex.tipo}? Esta acción no se puede deshacer.`,
      variant: "danger",
      onConfirm: async () => {
        const res = await fetch(`/api/examenes/${ex.id}`, { method: "DELETE" });
        if (res.ok) {
          showNotification("delete", "Estudio Eliminado", `El estudio de ${ex.tipo} ha sido removido`);
          loadInitialData();
        }
      }
    });
  };

  const handleSaveResults = async () => {
    if (!activeExamen) return;
    setIsSaving(true);
    const res = await fetch(`/api/examenes/${activeExamen.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...activeExamen, resultados: editResultados, estado: editEstado }),
    });
    if (res.ok) {
      showNotification("success", "Cambios Guardados", `Resultados de ${activeExamen.tipo} actualizados`);
      setIsEditing(false);
      loadInitialData();
    }
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
    const completados = examenesHoyPaciente.filter((ex) => ex.estado === "completado");
    const examenesConQR = await Promise.all(completados.map(async (ex) => ({ examen: ex, qr: await generateQRBase64(ex.uuid || "") })));
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
      PSA: <PSAForm {...props} />,
    };

    return forms[activeExamen.tipo] || <div className="p-10 text-center text-xs font-bold uppercase text-slate-400">Formulario no definido</div>;
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans text-slate-900">

      {/* SIDEBAR MINIMALISTA */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-100 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-50">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 mb-6 px-1">Pacientes Hoy</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
              <input
                type="text" placeholder="BUSCAR..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-xl text-[10px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-200 transition-all placeholder:text-slate-300"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
            {pacientesHoy.map((p) => (
              <button
                key={p.id}
                onClick={() => { setSelectedPacienteId(p.id); setIsSidebarOpen(false); }}
                className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${selectedPacienteId === p.id ? "bg-slate-900 text-white shadow-xl shadow-slate-200" : "hover:bg-slate-50 text-slate-600"
                  }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black border ${selectedPacienteId === p.id ? "bg-white/10 border-white/20" : "bg-white border-slate-100"
                  }`}>
                  {p.nombre.charAt(0)}
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="font-bold truncate text-[10px] uppercase tracking-tight">{p.nombre}</p>
                  <p className={`text-[8px] font-bold font-mono ${selectedPacienteId === p.id ? "text-slate-400" : "text-slate-300"}`}>{p.cedula}</p>
                </div>
                <div className={`text-[9px] font-black ${selectedPacienteId === p.id ? "text-emerald-400" : "text-slate-400"}`}>
                  {p.completados}/{p.totalEx}
                </div>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* PANEL CENTRAL */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50/30">

        {/* Header Móvil */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-100">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600"><Menu size={20} /></button>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">PANEL MAESTRO</span>
          <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100"><Beaker size={16} className="text-slate-400" /></div>
        </header>

        {pacienteActivo ? (
          <div className="flex-1 flex flex-col overflow-hidden">

            {/* Banner Paciente Minimalista */}
            <div className="px-8 py-6 bg-white border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg"><User size={20} /></div>
                <div>
                  <h1 className="text-sm font-black uppercase tracking-wider text-slate-900 leading-none mb-1">{pacienteActivo.nombre}</h1>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    {pacienteActivo.cedula} <span className="opacity-30">•</span> {hoy}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrintMasivo}
                  disabled={completadosCount === 0}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${completadosCount === 0
                    ? 'bg-slate-50 text-slate-300 cursor-not-allowed'
                    : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-xl shadow-emerald-100'
                    }`}
                >
                  <Printer size={16} /> ENTREGAR RESULTADOS
                </button>
              </div>
            </div>

            {/* Contenido Principal */}
            <div className="flex-1 overflow-y-auto px-8 py-10 custom-scrollbar">
              <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* Listado de Exámenes */}
                <div className="lg:col-span-8 space-y-6">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
                      <LayoutGrid size={14} /> Estudios en curso
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {examenesHoyPaciente.map((ex) => {
                      const config = EXAMEN_CONFIG[ex.tipo] || { color: "text-slate-400", bg: "bg-slate-50", icon: Beaker };
                      const Icon = config.icon;
                      return (
                        <div key={ex.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                          <div className="flex items-start justify-between mb-5">
                            <div className={`w-10 h-10 ${config.bg} ${config.color} rounded-xl flex items-center justify-center border border-slate-100/50`}><Icon size={18} /></div>
                            <button onClick={() => handleDeleteExamen(ex)} className="p-2 text-slate-200 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
                          </div>
                          <h4 className="font-bold text-[11px] uppercase tracking-tight text-slate-800 mb-1 truncate">{ex.tipo}</h4>
                          <div className={`inline-flex items-center gap-1.5 mb-6 text-[8px] font-black uppercase tracking-widest ${ex.estado === "completado" ? "text-emerald-500" : "text-amber-500"
                            }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${ex.estado === "completado" ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`} />
                            {ex.estado.replace("_", " ")}
                          </div>
                          <div className="flex gap-2 pt-2 border-t border-slate-50">
                            <button
                              onClick={() => { setActiveExamen(ex); setEditResultados(ex.resultados || {}); setEditEstado(ex.estado); setIsEditing(true); }}
                              className="flex-1 py-3 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 transition-all active:scale-95 shadow-lg shadow-slate-100"
                            >
                              EDITAR
                            </button>
                            {ex.estado === "completado" && (
                              <button onClick={() => handleOpenPrint(ex)} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-all"><Printer size={14} /></button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {examenesHoyPaciente.length === 0 && (
                      <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                        <Activity className="mx-auto text-slate-100 mb-4" size={40} />
                        <p className="text-[10px] font-bold uppercase text-slate-300 tracking-widest">No hay exámenes registrados hoy</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Catálogo Minimalista */}
                <div className="lg:col-span-4">
                  <div className="bg-white rounded-3xl border border-slate-100 p-6 sticky top-8 shadow-sm">
                    <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-900 mb-6 flex items-center gap-2">
                      Añadir Estudio
                    </h3>
                    <div className="space-y-1.5">
                      {CATALOGO_EXAMENES.map((tipo) => {
                        const yaExiste = examenesHoyPaciente.some((e) => e.tipo === tipo);
                        const config = EXAMEN_CONFIG[tipo];
                        return (
                          <button
                            key={tipo} disabled={yaExiste} onClick={() => handleCreateExamen(tipo)}
                            className={`w-full p-4 rounded-xl border flex items-center justify-between text-[10px] font-bold uppercase tracking-tight transition-all group ${yaExiste ? "bg-slate-50 border-transparent opacity-30 cursor-not-allowed" : "border-slate-50 bg-white hover:border-slate-900 hover:bg-slate-50"
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-1.5 h-1.5 rounded-full ${yaExiste ? "bg-emerald-500" : config.color.replace("text-", "bg-")}`} />
                              <span>{tipo}</span>
                            </div>
                            {yaExiste ? <CheckCircle2 size={14} className="text-emerald-500" /> : <ChevronRight size={14} className="text-slate-200 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />}
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
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white">
            <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-8 border border-slate-100">
              <FlaskConical size={32} className="text-slate-200" />
            </div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300">Seleccione un paciente para empezar</h2>
          </div>
        )}
      </main>

      {/* DRAWER DE EDICIÓN MINIMALISTA */}
      {isEditing && activeExamen && (
        <div className="fixed inset-0 z-[1000] flex items-stretch justify-end">
          <div
            className="absolute inset-0 bg-slate-900/10 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => !isSaving && setIsEditing(false)}
          />
          <div className="relative w-full max-w-4xl bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-500 ease-out">

            {/* Header del Editor */}
            <div className="px-8 py-6 bg-white border-b border-slate-50 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 flex items-center justify-center rounded-2xl border border-slate-100 ${EXAMEN_CONFIG[activeExamen.tipo]?.bg} ${EXAMEN_CONFIG[activeExamen.tipo]?.color}`}>
                  <FlaskConical size={20} />
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 mb-1">{activeExamen.tipo}</h2>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    Paciente: {pacienteActivo?.nombre}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsEditing(false)} className="p-3 text-slate-300 hover:text-slate-900 transition-colors"><X size={20} /></button>
            </div>

            {/* Cuerpo del Formulario */}
            <div className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar bg-slate-50/20">
              <div className="max-w-4xl mx-auto space-y-10">
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 lg:p-12">
                  {renderExamenForm()}
                </div>

                {/* Selector de Estado */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm">
                  <h3 className="text-[9px] font-black uppercase text-slate-400 mb-8 tracking-[0.3em] text-center">Estatus Final del Informe</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: "pendiente", label: "Pendiente", active: "peer-checked:bg-amber-500 peer-checked:border-amber-500" },
                      { id: "en_proceso", label: "En Proceso", active: "peer-checked:bg-blue-600 peer-checked:border-blue-600" },
                      { id: "completado", label: "Completado", active: "peer-checked:bg-emerald-500 peer-checked:border-emerald-500" }
                    ].map((st) => (
                      <label key={st.id} className="relative cursor-pointer group">
                        <input
                          type="radio" name="status" className="peer sr-only"
                          checked={editEstado === st.id} onChange={() => setEditEstado(st.id as any)}
                        />
                        <div className={`
                          py-5 px-4 text-center rounded-2xl border-2 border-slate-50 bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-300
                          transition-all duration-300 group-hover:border-slate-100
                          ${st.active} peer-checked:text-white peer-checked:shadow-xl peer-checked:scale-105
                        `}>
                          {st.label}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones del Editor */}
            <div className="px-10 py-8 bg-white border-t border-slate-50 flex gap-4 shrink-0">
              <button
                onClick={() => setIsEditing(false)}
                className="px-8 py-5 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] hover:text-slate-900 transition-colors"
              >
                DESCARTAR
              </button>
              <button
                onClick={handleSaveResults} disabled={isSaving}
                className="flex-1 py-5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl shadow-slate-200 transition-all hover:bg-slate-800 active:scale-95 disabled:opacity-50"
              >
                {isSaving ? "PROCESANDO..." : "GUARDAR RESULTADOS"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL IMPRESIÓN FULLSCREEN */}
      {showPrintModal && activeExamen && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-md flex items-center justify-center z-[1100] p-4 lg:p-10">
          <div className="bg-white w-full h-full lg:rounded-[3rem] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center px-10 py-6 bg-white border-b border-slate-50">
              <h2 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-3 text-slate-900">
                <Printer size={16} /> Vista Previa del Informe
              </h2>
              <button onClick={() => setShowPrintModal(false)} className="p-3 text-slate-300 hover:text-slate-900 transition-colors bg-slate-50 rounded-2xl hover:bg-slate-100"><X size={20} /></button>
            </div>
            <div className="flex-1 bg-slate-50/50 overflow-y-auto p-10 custom-scrollbar flex justify-center">
              <div className="w-full max-w-[800px] shadow-2xl bg-white">
                <ReportViewer
                  type={activeExamen.tipo}
                  data={activeExamen.resultados}
                  qrImage={qrCodeImage}
                  patient={{
                    nombre: pacienteActivo?.nombre || "",
                    cedula: pacienteActivo?.cedula || "",
                    edad: pacienteActivo?.edad || "N/A",
                    fecha: activeExamen.fecha
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}


      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
      `}</style>
    </div>
  );
}