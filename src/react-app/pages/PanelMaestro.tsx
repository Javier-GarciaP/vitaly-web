import { useEffect, useState, useMemo } from "react";
import { 
  Search, Printer, Save, X, ChevronRight, Beaker, Activity, 
  PlusCircle, CheckCircle2, LayoutGrid
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

// --- DEFINICIÓN DE TIPOS ---
interface Paciente {
  id: number;
  nombre: string;
  cedula: string;
  totalEx?: number;
  completados?: number;
}

interface Examen {
  id: number;
  paciente_id: number;
  tipo: string;
  fecha: string;
  estado: 'pendiente' | 'en_proceso' | 'completado';
  resultados: any;
  uuid?: string; // Manejado como en ResultadosPage
}

interface Factura {
  paciente_id: number;
  fecha: string;
}

const CATALOGO_EXAMENES = [
  "Hematología", "Química Clínica", "Orina", "Heces", 
  "Coagulación", "Grupo Sanguíneo", "Bacteriología", "Misceláneos"
];

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
  const [editEstado, setEditEstado] = useState<Examen['estado']>('pendiente');
  const [qrCodeImage, setQrCodeImage] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  const hoy = new Date().toISOString().split("T")[0];

  useEffect(() => { loadInitialData(); }, []);

  const loadInitialData = async () => {
    try {
      const [resP, resE, resF] = await Promise.all([
        fetch("/api/pacientes"),
        fetch("/api/examenes"),
        fetch("/api/facturas")
      ]);
      const dataP = await resP.json();
      const dataE = await resE.json();
      const dataF = await resF.json();
      
      setPacientes(dataP);
      setExamenes(dataE);
      setFacturas(dataF);
    } catch (e) { console.error("Error cargando datos maestros"); }
  };

  const showMsg = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3000);
  };

  const pacientesHoy = useMemo(() => {
    const idsConFacturaHoy = facturas.filter(f => f.fecha === hoy).map(f => f.paciente_id);
    return pacientes
      .filter(p => idsConFacturaHoy.includes(p.id))
      .filter(p => p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || p.cedula.includes(searchTerm))
      .map(p => {
        const exs = examenes.filter(e => e.paciente_id === p.id && e.fecha === hoy);
        return { 
          ...p, 
          totalEx: exs.length, 
          completados: exs.filter(e => e.estado === 'completado').length 
        };
      });
  }, [facturas, pacientes, examenes, searchTerm, hoy]);

  const pacienteActivo = useMemo(() => 
    pacientesHoy.find(p => p.id === selectedPacienteId), 
  [selectedPacienteId, pacientesHoy]);

  const examenesHoyPaciente = useMemo(() => 
    examenes.filter(e => e.paciente_id === selectedPacienteId && e.fecha === hoy),
  [selectedPacienteId, examenes, hoy]);

  const handleCreateExamen = async (tipo: string) => {
    if (!selectedPacienteId) return;
    const nuevoExamen = { 
      paciente_id: selectedPacienteId, 
      tipo, 
      fecha: hoy, 
      estado: "pendiente", 
      resultados: {},
      uuid: crypto.randomUUID(),
    };

    const res = await fetch("/api/examenes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevoExamen),
    });
    if (res.ok) { showMsg(`${tipo} añadido`); loadInitialData(); }
  };

  const handleSaveResults = async () => {
    if (!activeExamen) return;
    setIsSaving(true);

    // Payload estructurado exactamente como en ResultadosPage
    const payload = {
      paciente_id: activeExamen.paciente_id,
      tipo: activeExamen.tipo,
      fecha: activeExamen.fecha,
      resultados: editResultados,
      estado: editEstado,
    };

    try {
      const res = await fetch(`/api/examenes/${activeExamen.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showMsg("Resultados guardados exitosamente");
        setIsEditing(false);
        await loadInitialData();
        
        // Actualizar el examen activo para reflejar los cambios en la UI central
        const resUpdated = await fetch(`/api/examenes/${activeExamen.id}`);
        const updatedEx = await resUpdated.json();
        setActiveExamen(updatedEx);
      } else {
        alert("Error al guardar los resultados");
      }
    } catch (e) {
      console.error("Error:", e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenPrint = async (ex: Examen) => {
    try {
      const baseUrl = window.location.origin;
      // Usamos el UUID si existe, sino el ID como fallback
      const validationUrl = `${baseUrl}/verificar/${ex.uuid || ex.id}`;
      const qr = await generateQRBase64(validationUrl);
      setQrCodeImage(qr);
      setActiveExamen(ex);
      setShowPrintModal(true);
    } catch (e) {
      alert("Error generando QR");
    }
  };

  const renderExamenForm = () => {
    if (!activeExamen) return null;
    const props = { resultados: editResultados, onChange: setEditResultados };
    const forms: Record<string, JSX.Element> = {
      "Hematología": <HematologiaForm {...props} />,
      "Química Clínica": <QuimicaClinicaForm {...props} />,
      "Orina": <OrinaForm {...props} />,
      "Heces": <HecesForm {...props} />,
      "Coagulación": <CoagulacionForm {...props} />,
      "Grupo Sanguíneo": <GrupoSanguineoForm {...props} />,
      "Bacteriología": <BacteriologiaForm {...props} />,
      "Misceláneos": <MiscelaneosForm {...props} />,
    };
    return forms[activeExamen.tipo] || <div className="p-10 text-center text-slate-400">Formulario no definido</div>;
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      
      {notification && (
        <div className="fixed top-6 right-6 z-[700] bg-white border-l-4 border-emerald-500 shadow-2xl p-4 rounded-lg flex items-center gap-3 animate-in slide-in-from-right">
          <CheckCircle2 className="text-emerald-500" />
          <span className="text-sm font-bold uppercase tracking-tight">{notification}</span>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" />
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Pacientes de Hoy</h2>
          </div>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={16} />
            <input 
              type="text" placeholder="Buscar por nombre o cédula..."
              className="w-full pl-10 pr-4 py-3 bg-slate-100 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-2">
          {pacientesHoy.map(p => (
            <button
              key={p.id} onClick={() => setSelectedPacienteId(p.id)}
              className={`w-full p-4 rounded-xl flex items-center gap-4 transition-all ${
                selectedPacienteId === p.id ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "hover:bg-slate-50 text-slate-600 border border-transparent"
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 ${selectedPacienteId === p.id ? "bg-white/20" : "bg-blue-100 text-blue-600"}`}>
                {p.nombre.charAt(0)}
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className={`font-bold truncate text-sm uppercase ${selectedPacienteId === p.id ? "text-white" : "text-slate-800"}`}>{p.nombre}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] font-medium opacity-70 italic">{p.cedula}</span>
                  <span className="text-[10px] font-black">{p.completados}/{p.totalEx}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {pacienteActivo ? (
          <div className="flex-1 flex flex-col p-8 space-y-8 overflow-hidden">
            <header className="flex justify-between items-end">
              <div>
                <nav className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  <span>Panel Maestro</span> <ChevronRight size={10}/> <span>Paciente Activo</span>
                </nav>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">{pacienteActivo.nombre}</h1>
              </div>
            </header>

            <div className="flex-1 grid grid-cols-12 gap-8 overflow-hidden">
              <div className="col-span-8 flex flex-col min-h-0">
                <div className="flex items-center gap-2 mb-4">
                  <LayoutGrid size={18} className="text-blue-500" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Estudios en Curso</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 overflow-y-auto pr-4">
                  {examenesHoyPaciente.map((ex) => (
                    <div key={ex.id} className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col hover:border-blue-500 transition-all group">
                      <div className="flex justify-between items-start mb-6">
                        <div className={`p-3 rounded-xl ${ex.estado === 'completado' ? 'bg-emerald-50 text-emerald-500' : 'bg-blue-50 text-blue-500'}`}>
                          <Beaker size={20} />
                        </div>
                        <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md ${
                          ex.estado === 'completado' ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-white'
                        }`}>{ex.estado.replace('_', ' ')}</span>
                      </div>
                      <h4 className="font-black text-lg text-slate-800 leading-none mb-6 uppercase tracking-tight">{ex.tipo}</h4>
                      <div className="flex gap-2">
                        <button onClick={() => { 
                          setActiveExamen(ex); 
                          setEditResultados(ex.resultados || {}); 
                          setEditEstado(ex.estado); 
                          setIsEditing(true); 
                        }}
                          className="flex-1 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 transition-all">
                          Gestionar
                        </button>
                        <button disabled={ex.estado !== 'completado'} onClick={() => handleOpenPrint(ex)}
                          className="px-5 bg-slate-100 text-slate-400 rounded-xl hover:bg-emerald-500 hover:text-white disabled:opacity-30 transition-all">
                          <Printer size={18}/>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-span-4 flex flex-col min-h-0 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <h3 className="text-center text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Agregar Examen</h3>
                <div className="space-y-2 overflow-y-auto flex-1 pr-2">
                  {CATALOGO_EXAMENES.map(tipo => {
                    const yaExiste = examenesHoyPaciente.some(e => e.tipo === tipo);
                    return (
                      <button
                        key={tipo} disabled={yaExiste} onClick={() => handleCreateExamen(tipo)}
                        className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${
                          yaExiste ? 'bg-slate-50 border-slate-100 opacity-40 cursor-not-allowed' : 'border-slate-100 hover:border-blue-500 hover:bg-blue-50/50'
                        }`}
                      >
                        <span className="text-xs font-bold text-slate-600">{tipo}</span>
                        <PlusCircle size={18} className={yaExiste ? "text-slate-300" : "text-blue-500"} />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-20">
            <Activity size={100} className="opacity-10 animate-pulse" />
            <h2 className="text-xl font-black uppercase tracking-[0.3em] text-slate-400">Laboratorio Central</h2>
          </div>
        )}
      </main>

      {/* EDITOR LATERAL */}
      {isEditing && activeExamen && (
        <div className="fixed inset-0 z-[500] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => !isSaving && setIsEditing(false)} />
          <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-8 border-b flex justify-between items-center bg-slate-50">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">{activeExamen.tipo}</h2>
              <button onClick={() => setIsEditing(false)} className="p-3 hover:bg-red-50 hover:text-red-500 rounded-full transition-all text-slate-400">
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-10">
              {renderExamenForm()}
              <div className="mt-12 space-y-4">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 block text-center">Estado del Estudio</label>
                <div className="flex p-1 bg-slate-100 rounded-2xl gap-1">
                  {(['pendiente', 'en_proceso', 'completado'] as const).map(st => (
                    <button 
                      key={st} onClick={() => setEditEstado(st)}
                      className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${
                        editEstado === st ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-8 border-t bg-white">
              <button 
                onClick={handleSaveResults}
                disabled={isSaving}
                className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl hover:bg-blue-700 disabled:bg-slate-400 transition-all flex items-center justify-center gap-3 uppercase text-xs tracking-widest"
              >
                {isSaving ? "Guardando..." : <><Save size={18} /> Confirmar Resultados</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL IMPRESIÓN */}

      {showPrintModal && activeExamen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[200] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-black">Vista Previa de Impresión</h2>
              <button onClick={() => setShowPrintModal(false)} className="p-2 hover:bg-slate-100 rounded-full"><X/></button>
            </div>
            <div className="flex-1 bg-slate-100 overflow-y-auto">
              <ReportViewer
                type={activeExamen.tipo}
                data={activeExamen.resultados}
                qrImage={qrCodeImage}
                patient={{
                  nombre: pacienteActivo.nombre,
                  cedula: pacienteActivo.cedula,
                  fecha: new Date(activeExamen.fecha).toLocaleDateString(),
                }}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}