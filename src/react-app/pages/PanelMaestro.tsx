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

// --- CONFIGURACIÓN VISUAL POR EXAMEN ---
const EXAMEN_CONFIG: Record<string, { color: string; icon: any; bg: string }> =
  {
    Hematología: { color: "text-red-600", bg: "bg-red-50", icon: Droplets },
    "Química Clínica": {
      color: "text-blue-600",
      bg: "bg-blue-50",
      icon: FlaskConical,
    },
    Orina: { color: "text-amber-500", bg: "bg-amber-50", icon: TestTube2 },
    Heces: { color: "text-emerald-700", bg: "bg-emerald-50", icon: Microscope },
    Coagulación: { color: "text-rose-600", bg: "bg-rose-50", icon: Activity },
    "Grupo Sanguíneo": {
      color: "text-red-800",
      bg: "bg-red-100",
      icon: BeakerIcon,
    }, // Fallback HeartPulse o Beaker
    Bacteriología: {
      color: "text-purple-600",
      bg: "bg-purple-50",
      icon: Beaker,
    },
    Misceláneos: {
      color: "text-slate-600",
      bg: "bg-slate-50",
      icon: Stethoscope,
    },
  };

// --- DEFINICIÓN DE TIPOS ---
interface Paciente {
  id: number;
  nombre: string;
  cedula: string;
  totalEx?: number;
  completados?: number;
  edad?: number;
}

interface Examen {
  id: number;
  paciente_id: number;
  tipo: string;
  fecha: string;
  estado: "pendiente" | "en_proceso" | "completado";
  resultados: any;
  uuid?: string;
}

interface Factura {
  paciente_id: number;
  fecha: string;
}

const CATALOGO_EXAMENES = [
  "Hematología",
  "Química Clínica",
  "Orina",
  "Heces",
  "Coagulación",
  "Grupo Sanguíneo",
  "Bacteriología",
  "Misceláneos",
];

export default function PanelControlMaster() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [examenes, setExamenes] = useState<Examen[]>([]);
  const [facturas, setFacturas] = useState<Factura[]>([]);

  const [selectedPacienteId, setSelectedPacienteId] = useState<number | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [notification, setNotification] = useState("");

  const [activeExamen, setActiveExamen] = useState<Examen | null>(null);
  const [editResultados, setEditResultados] = useState<any>({});
  const [editEstado, setEditEstado] = useState<Examen["estado"]>("pendiente");
  const [qrCodeImage, setQrCodeImage] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  const fecha = new Date();

  // Configuramos el formateador para tu zona horaria (ejemplo: America/Caracas)
  const formateador = new Intl.DateTimeFormat("en-CA", {
    // 'en-CA' genera formato YYYY-MM-DD
    timeZone: "America/Caracas", // Ajusta a tu zona horaria local
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const hoy = formateador.format(fecha);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [resP, resE, resF] = await Promise.all([
        fetch("/api/pacientes"),
        fetch("/api/examenes"),
        fetch("/api/facturas"),
      ]);
      const dataP = (await resP.json()) as Paciente[];
      const dataE = (await resE.json()) as Examen[];
      const dataF = (await resF.json()) as Factura[];
      setPacientes(dataP);
      setExamenes(dataE);
      setFacturas(dataF);
    } catch (e) {
      console.error("Error cargando datos maestros");
    }
  };

  const showMsg = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3000);
  };

  const pacientesHoy = useMemo(() => {
    const idsConFacturaHoy = facturas
      .filter((f) => f.fecha === hoy)
      .map((f) => f.paciente_id);
    return pacientes
      .filter((p) => idsConFacturaHoy.includes(p.id))
      .filter(
        (p) =>
          p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.cedula.includes(searchTerm)
      )
      .map((p) => {
        const exs = examenes.filter(
          (e) => e.paciente_id === p.id && e.fecha === hoy
        );
        return {
          ...p,
          totalEx: exs.length,
          completados: exs.filter((e) => e.estado === "completado").length,
        };
      });
  }, [facturas, pacientes, examenes, searchTerm, hoy]);

  const pacienteActivo = useMemo(
    () => pacientesHoy.find((p) => p.id === selectedPacienteId),
    [selectedPacienteId, pacientesHoy]
  );

  const examenesHoyPaciente = useMemo(
    () =>
      examenes.filter(
        (e) => e.paciente_id === selectedPacienteId && e.fecha === hoy
      ),
    [selectedPacienteId, examenes, hoy]
  );

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
    if (res.ok) {
      showMsg(`${tipo} añadido`);
      loadInitialData();
    }
  };

  const handleDeleteExamen = async (ex: Examen) => {
    const confirmar = window.confirm(
      `¿Está seguro de eliminar el examen de ${ex.tipo} para ${pacienteActivo?.nombre}? Esta acción no se puede deshacer.`
    );
    if (!confirmar) return;

    try {
      const res = await fetch(`/api/examenes/${ex.id}`, { method: "DELETE" });
      if (res.ok) {
        showMsg("Examen eliminado correctamente");
        loadInitialData();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleSaveResults = async () => {
    if (!activeExamen) return;
    setIsSaving(true);
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
        showMsg("Resultados guardados correctamente");
        setIsEditing(false);
        await loadInitialData();
      }
    } catch (e) {
      console.error("Error:", e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenPrint = async (ex: Examen) => {
    try {
      const validationUrl = ex.uuid || "";
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
    return (
      forms[activeExamen.tipo] || (
        <div className="p-10 text-center text-slate-400">
          Formulario no definido
        </div>
      )
    );
  };

  /** AQUI SE ESTA TRABAJANDO CON BOTON MASIVO */

  // 1. Verificamos si todos los exámenes del paciente activo están completados
  const isPacienteListoParaImprimir = useMemo(() => {
    if (!pacienteActivo || examenesHoyPaciente.length === 0) return false;
    return examenesHoyPaciente.every((ex) => ex.estado === "completado");
  }, [pacienteActivo, examenesHoyPaciente]);

  // 2. Función para manejar la impresión masiva
  const handlePrintMasivo = async () => {
    if (!pacienteActivo) return;
    setIsSaving(true);
    try {
      // Generamos los QRs individuales para cada examen basados en su UUID
      const examenesConQR = await Promise.all(
        examenesHoyPaciente.map(async (ex) => {
          const qr = await generateQRBase64(ex.uuid || "");
          return { examen: ex, qr };
        })
      );

      // Configuramos el activeExamen con el tipo especial que agregamos al ReportViewer
      setActiveExamen({
        id: 0, // ID ficticio
        paciente_id: selectedPacienteId!,
        tipo: "IMPRESION_MASIVA",
        fecha: hoy,
        estado: "completado",
        resultados: examenesConQR, // Pasamos el array con los QRs
      });

      setShowPrintModal(true);
    } catch (e) {
      alert("Error preparando la impresión masiva");
    } finally {
      setIsSaving(false);
    }
  };

  /** FIN BOTON MASIVO */

  return (
    <div className="flex h-screen bg-[#F1F5F9] overflow-hidden font-sans">
      {/* NOTIFICACIONES */}
      {notification && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[2000] bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="text-emerald-400" size={20} />
          <span className="text-xs font-black uppercase tracking-[0.1em]">
            {notification}
          </span>
        </div>
      )}

      {/* PANEL IZQUIERDO */}
      <aside className="w-85 bg-white border-r border-slate-200 flex flex-col shadow-xl z-20">
        <div className="p-8 pb-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <User className="text-white" size={20} />
            </div>
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">
              Pacientes del Día
            </h2>
          </div>
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              className="w-full pl-12 pr-4 py-4 bg-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 custom-scrollbar">
          {pacientesHoy.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPacienteId(p.id)}
              className={`w-full p-5 rounded-2xl flex items-center gap-4 transition-all ${
                selectedPacienteId === p.id
                  ? "bg-blue-600 text-white shadow-lg translate-x-1"
                  : "hover:bg-slate-50 text-slate-600 border border-slate-100"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
                  selectedPacienteId === p.id
                    ? "bg-white/20"
                    : "bg-blue-50 text-blue-600"
                }`}
              >
                {p.nombre.charAt(0)}
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="font-black truncate text-xs uppercase tracking-tight">
                  {p.nombre}
                </p>
                <p
                  className={`text-[10px] font-bold opacity-70 ${
                    selectedPacienteId === p.id
                      ? "text-white"
                      : "text-slate-400"
                  }`}
                >
                  {p.cedula}
                </p>
              </div>
              <span
                className={`text-[10px] font-black ${
                  selectedPacienteId === p.id ? "text-white" : "text-blue-600"
                }`}
              >
                {p.completados}/{p.totalEx}
              </span>
            </button>
          ))}
        </div>
      </aside>

      {/* PANEL CENTRAL */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {pacienteActivo ? (
          <div className="flex-1 flex flex-col p-10 space-y-8 overflow-hidden">
            <header className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-white">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                  <User size={28} />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">
                    {pacienteActivo?.nombre}
                  </h1>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {pacienteActivo?.cedula} • {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* BOTÓN DE IMPRESIÓN MASIVA CONDICIONAL */}
              {isPacienteListoParaImprimir && (
                <button
                  onClick={handlePrintMasivo}
                  disabled={isSaving}
                  className="flex items-center gap-4 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white rounded-2xl shadow-lg shadow-emerald-100 transition-all animate-in zoom-in-90 duration-300 group"
                >
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Entregar Resultados
                    </span>
                    <span className="text-[8px] opacity-80 uppercase font-bold">
                      Portada + {examenesHoyPaciente.length} Análisis
                    </span>
                  </div>
                  <Printer
                    size={22}
                    className="group-hover:scale-110 transition-transform"
                  />
                </button>
              )}
            </header>

            <div className="flex-1 grid grid-cols-12 gap-8 overflow-hidden">
              {/* LISTA DE EXÁMENES */}
              <div className="col-span-8 flex flex-col min-h-0">
                <div className="flex items-center gap-2 mb-6 px-2 text-slate-500">
                  <LayoutGrid size={18} />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">
                    Estudios en el Laboratorio
                  </h3>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 overflow-y-auto pr-4 pb-12 custom-scrollbar">
                  {examenesHoyPaciente.map((ex) => {
                    const config = EXAMEN_CONFIG[ex.tipo] || {
                      color: "text-slate-600",
                      bg: "bg-slate-50",
                      icon: Beaker,
                    };
                    const Icon = config.icon;

                    return (
                      <div
                        key={ex.id}
                        className="bg-white p-1 rounded-[2.5rem] shadow-sm border border-slate-200 group relative flex flex-col"
                      >
                        {/* Botón Eliminar Flotante */}
                        <button
                          onClick={() => handleDeleteExamen(ex)}
                          className="absolute top-4 right-4 w-10 h-10 bg-white border border-slate-100 text-slate-300 hover:text-rose-500 hover:border-rose-100 hover:shadow-lg rounded-full flex items-center justify-center transition-all z-10 opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={18} />
                        </button>

                        <div className="p-6 flex flex-col h-full">
                          <div className="flex items-center gap-4 mb-6">
                            <div
                              className={`w-16 h-16 ${config.bg} ${config.color} rounded-[1.5rem] flex items-center justify-center shadow-inner`}
                            >
                              <Icon size={32} />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-black text-lg text-slate-800 uppercase tracking-tighter leading-none mb-2">
                                {ex.tipo}
                              </h4>
                              <div
                                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                                  ex.estado === "completado"
                                    ? "bg-emerald-500 text-white"
                                    : "bg-amber-400 text-white"
                                }`}
                              >
                                <Clock size={10} />{" "}
                                {ex.estado.replace("_", " ")}
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 mt-auto">
                            <button
                              onClick={() => {
                                setActiveExamen(ex);
                                setEditResultados(ex.resultados || {});
                                setEditEstado(ex.estado);
                                setIsEditing(true);
                              }}
                              className="flex-1 py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-blue-600 transition-all shadow-md"
                            >
                              Gestionar
                            </button>
                            <button
                              disabled={ex.estado !== "completado"}
                              onClick={() => handleOpenPrint(ex)}
                              className="w-14 h-14 flex items-center justify-center bg-slate-100 text-slate-500 rounded-2xl hover:bg-blue-100 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                              <Printer size={20} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CATÁLOGO DE EXÁMENES */}
              <div className="col-span-4 flex flex-col min-h-0 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm p-8">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8 flex items-center gap-2">
                  <PlusCircle size={14} /> Solicitar Nuevo Análisis
                </h3>
                <div className="space-y-3 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                  {CATALOGO_EXAMENES.map((tipo) => {
                    const yaExiste = examenesHoyPaciente.some(
                      (e) => e.tipo === tipo
                    );
                    // const config = EXAMEN_CONFIG[tipo] || { color: "text-slate-400" };
                    return (
                      <button
                        key={tipo}
                        disabled={yaExiste}
                        onClick={() => handleCreateExamen(tipo)}
                        className={`w-full p-5 rounded-2xl border-2 flex items-center justify-between transition-all group ${
                          yaExiste
                            ? "bg-slate-50 border-slate-50 opacity-40 grayscale cursor-not-allowed"
                            : "border-slate-50 hover:border-blue-500/20 hover:bg-blue-50/50"
                        }`}
                      >
                        <span
                          className={`text-xs font-black uppercase tracking-tight ${
                            yaExiste ? "text-slate-400" : "text-slate-600"
                          }`}
                        >
                          {tipo}
                        </span>
                        {!yaExiste && (
                          <PlusCircle
                            size={18}
                            className="text-blue-500 opacity-40 group-hover:opacity-100"
                          />
                        )}
                        {yaExiste && (
                          <CheckCircle2
                            size={18}
                            className="text-emerald-500"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-40 h-40 bg-white rounded-[3.5rem] shadow-2xl flex items-center justify-center mb-8">
              <Beaker size={64} className="text-slate-100" />
            </div>
            <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-300">
              Laboratorio Central
            </h2>
          </div>
        )}
      </main>

      {/* MODAL DE EDICIÓN AMPLIADO */}
      {isEditing && activeExamen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8">
          <div
            className="absolute inset-0 bg-slate-900/70 backdrop-blur-md"
            onClick={() => !isSaving && setIsEditing(false)}
          />

          <div className="relative w-full max-w-6xl h-full bg-white rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Header Modal */}
            <div className="p-8 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-6">
                <div
                  className={`w-14 h-14 ${
                    EXAMEN_CONFIG[activeExamen.tipo]?.bg || "bg-blue-500"
                  } ${
                    EXAMEN_CONFIG[activeExamen.tipo]?.color || "text-white"
                  } rounded-2xl flex items-center justify-center shadow-lg shadow-black/5`}
                >
                  {React.createElement(
                    EXAMEN_CONFIG[activeExamen.tipo]?.icon || FlaskConical,
                    { size: 28 }
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">
                    {activeExamen.tipo}
                  </h2>
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                    {pacienteActivo?.nombre} • Resultado Clínico
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="w-12 h-12 flex items-center justify-center bg-white hover:bg-rose-50 hover:text-rose-500 rounded-full transition-all text-slate-400 border border-slate-100 shadow-sm"
              >
                <X size={24} />
              </button>
            </div>

            {/* Cuerpo Modal */}
            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-white">
              <div className="max-w-4xl mx-auto pb-20">
                {renderExamenForm()}

                <div className="mt-16 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200 shadow-inner">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block text-center mb-6">
                    Estado del Análisis
                  </label>
                  <div className="flex p-2 bg-white rounded-3xl gap-2 border border-slate-200">
                    {(["pendiente", "en_proceso", "completado"] as const).map(
                      (st) => (
                        <button
                          key={st}
                          onClick={() => setEditEstado(st)}
                          className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            editEstado === st
                              ? "bg-slate-900 text-white shadow-xl scale-[1.02]"
                              : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                          }`}
                        >
                          {st.replace("_", " ")}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-8 bg-white border-t border-slate-200 flex gap-4">
              <button
                onClick={() => setIsEditing(false)}
                className="px-10 py-5 bg-slate-100 text-slate-500 font-black rounded-2xl hover:bg-slate-200 transition-all uppercase text-[10px] tracking-widest"
              >
                Descartar
              </button>
              <button
                onClick={handleSaveResults}
                disabled={isSaving}
                className="flex-1 py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 disabled:bg-slate-300 transition-all flex items-center justify-center gap-3 uppercase text-[10px] tracking-widest"
              >
                {isSaving ? (
                  "Guardando..."
                ) : (
                  <>
                    <Save size={18} /> Confirmar y Guardar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL IMPRESIÓN */}
      {showPrintModal && activeExamen && (
        <div className="fixed inset-0 bg-slate-900/80 flex items-center justify-center z-[1100] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[3rem] w-full max-w-6xl h-[95vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-8 bg-white border-b">
              <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                <Printer className="text-blue-600" /> Vista Previa del Informe
              </h2>
              <button
                onClick={() => setShowPrintModal(false)}
                className="w-12 h-12 flex items-center justify-center hover:bg-slate-100 rounded-full transition-all"
              >
                <X />
              </button>
            </div>
            <div className="flex-1 bg-slate-100 overflow-y-auto p-6 custom-scrollbar">
              <ReportViewer
                type={activeExamen.tipo}
                data={activeExamen.resultados}
                qrImage={qrCodeImage}
                patient={{
                  nombre: pacienteActivo?.nombre || "",
                  cedula: pacienteActivo?.cedula || "",
                  edad: pacienteActivo?.edad || "N/A", // <--- Enviamos la edad
                  fecha: (() => {
                    // Usamos la fecha del EXAMEN (activeExamen.fecha) no la del paciente ni la de hoy
                    if (!activeExamen.fecha) return "Sin fecha";

                    // Ajuste de zona horaria para evitar que la fecha "salte" un día atrás
                    const d = new Date(activeExamen.fecha);
                    const offset = d.getTimezoneOffset() * 60000;
                    return new Date(d.getTime() + offset).toLocaleDateString(
                      "es-ES"
                    );
                  })(),
                }}
              />
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
      `}</style>
    </div>
  );
}
