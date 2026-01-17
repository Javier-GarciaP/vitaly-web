import { useEffect, useState } from "react";
import {
  Search,
  Edit3,
  Trash2,
  ChevronFirst,
  ChevronLeft,
  ChevronRight,
  ChevronLast,
  X,
  Save,
  Printer,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  User,
  Calendar,
  Fingerprint,
  Activity,
} from "lucide-react";

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

interface Examen {
  id: number;
  paciente_id: number;
  paciente_nombre: string;
  paciente_cedula: string;
  tipo: string;
  fecha: string;
  estado: string;
  resultados: any;
  created_at: string;
  uuid?: string;
  paciente_edad?: number;
}

export default function ResultadosPage() {
  const [examenes, setExamenes] = useState<Examen[]>([]);
  const [filteredExamenes, setFilteredExamenes] = useState<Examen[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [selectedExamen, setSelectedExamen] = useState<Examen | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [qrCodeImage, setQrCodeImage] = useState<string>("");
  const [editResultados, setEditResultados] = useState<any>({});
  const [editEstado, setEditEstado] = useState("");
  const [notification, setNotification] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showPortadaModal, setShowPortadaModal] = useState(false);

  useEffect(() => {
    loadExamenes();
  }, []);

  useEffect(() => {
    let filtered = examenes;

    // Filtrar por término de búsqueda (nombre o cédula)
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(
        (ex) =>
          ex.paciente_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ex.paciente_cedula.includes(searchTerm)
      );
    }

    // Filtrar por estado
    if (statusFilter !== "todos") {
      filtered = filtered.filter((ex) => ex.estado === statusFilter);
    }

    setFilteredExamenes(filtered);
  }, [searchTerm, statusFilter, examenes]);

  const loadExamenes = async () => {
    try {
      const res = await fetch("/api/examenes");
      const data = (await res.json()) as Examen[];
      setExamenes(data);
    } catch (e) {
      console.error("Error cargando exámenes");
    }
  };



  const handleOpenPrint = async () => {
    if (!selectedExamen) return;
    try {
      const validationUrl = selectedExamen.uuid || "";
      const qrBase64 = await generateQRBase64(validationUrl);
      setQrCodeImage(qrBase64);
      setShowPrintModal(true);
    } catch (error) {
      alert("No se pudo generar el código de validación.");
    }
  };

  const handleSelectExamen = (examen: Examen, index: number) => {
    setSelectedExamen(examen);
    setCurrentIndex(index);
    setQrCodeImage("");
    // En móvil, hacer scroll suave hacia las acciones si se selecciona uno
    if (window.innerWidth < 1280) {
      setTimeout(() => {
        document.getElementById('action-panel')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const handleEdit = () => {
    if (!selectedExamen) return;
    setEditResultados(selectedExamen.resultados || {});
    setEditEstado(selectedExamen.estado);
    setShowEditModal(true);
  };

  const handleSaveResults = async () => {
    if (!selectedExamen || isSaving) return;
    setIsSaving(true);
    const payload = {
      paciente_id: selectedExamen.paciente_id,
      tipo: selectedExamen.tipo,
      fecha: selectedExamen.fecha,
      resultados: editResultados,
      estado: editEstado,
    };

    try {
      const res = await fetch(`/api/examenes/${selectedExamen.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showNotification("Cambios aplicados correctamente");
        setShowEditModal(false);
        await loadExamenes();
        setSelectedExamen({
          ...selectedExamen,
          resultados: editResultados,
          estado: editEstado,
        });
      } else {
        alert("Error al guardar en el servidor");
      }
    } catch (e) {
      console.error("Error en la petición:", e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteExamen = async () => {
    if (!selectedExamen) return;
    const confirmar = window.confirm(
      `¿Está seguro de eliminar el examen de ${selectedExamen.tipo} para ${selectedExamen.paciente_nombre}? Esta acción no se puede deshacer.`
    );

    if (!confirmar) return;

    try {
      const res = await fetch(`/api/examenes/${selectedExamen.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        showNotification("Registro eliminado correctamente");
        setSelectedExamen(null);
        loadExamenes();
      } else {
        alert("Error al intentar eliminar el registro.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(""), 3000);
  };

  const getStatusConfig = (estado: string) => {
    switch (estado) {
      case "completado":
        return {
          icon: <CheckCircle2 size={14} />,
          bg: "bg-emerald-50 text-emerald-700 border-emerald-100",
          label: "Completado",
        };
      case "en_proceso":
        return {
          icon: <Clock size={14} />,
          bg: "bg-blue-50 text-blue-700 border-blue-100",
          label: "En Proceso",
        };
      default:
        return {
          icon: <AlertCircle size={14} />,
          bg: "bg-amber-50 text-amber-700 border-amber-100",
          label: "Pendiente",
        };
    }
  };

  const renderExamenForm = () => {
    if (!selectedExamen) return null;
    const props = { resultados: editResultados, onChange: setEditResultados };
    const forms: any = {
      Hematología: <HematologiaForm {...props} />,
      "Química Clínica": <QuimicaClinicaForm {...props} />,
      Orina: <OrinaForm {...props} />,
      Heces: <HecesForm {...props} />,
      Coagulación: <CoagulacionForm {...props} />,
      "Grupo Sanguíneo": <GrupoSanguineoForm {...props} />,
      Bacteriología: <BacteriologiaForm {...props} />,
      Misceláneos: <MiscelaneosForm {...props} />,
    };
    return forms[selectedExamen.tipo] || (
      <div className="p-10 text-center text-slate-400 font-bold">
        Formulario no definido para {selectedExamen.tipo}
      </div>
    );
  };

  const handleOpenPortada = () => {
    if (!selectedExamen) return;
    setShowPortadaModal(true);
  };

  return (
    <div className="max-w-[1600px] mx-auto pb-10 px-4 md:px-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6 mt-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <FileText className="text-blue-600" size={32} />
            Gestión de Resultados
          </h1>
          <p className="text-sm md:text-base text-slate-500 font-medium">
            Validación, edición y despacho de informes médicos
          </p>
        </div>

        <div className="relative w-full lg:w-96 group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
            size={18}
          />
          <input
            type="text"
            placeholder="Buscar por nombre o cédula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
          />
        </div>
      </div>

      {/* Estado Filter */}
      <div className="mb-6 bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
            Filtrar por Estado:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter("todos")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all border-2 ${statusFilter === "todos"
                ? "bg-slate-900 text-white border-slate-900 shadow-lg"
                : "bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300"
                }`}
            >
              <FileText size={14} />
              Todos
              <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-[10px]">
                {examenes.length}
              </span>
            </button>
            <button
              onClick={() => setStatusFilter("completado")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all border-2 ${statusFilter === "completado"
                ? "bg-emerald-500 text-white border-emerald-500 shadow-lg"
                : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-300"
                }`}
            >
              <CheckCircle2 size={14} />
              Completado
              <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] ${statusFilter === "completado" ? "bg-white/20" : "bg-emerald-100"
                }`}>
                {examenes.filter(ex => ex.estado === "completado").length}
              </span>
            </button>
            <button
              onClick={() => setStatusFilter("en_proceso")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all border-2 ${statusFilter === "en_proceso"
                ? "bg-blue-500 text-white border-blue-500 shadow-lg"
                : "bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-300"
                }`}
            >
              <Clock size={14} />
              En Proceso
              <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] ${statusFilter === "en_proceso" ? "bg-white/20" : "bg-blue-100"
                }`}>
                {examenes.filter(ex => ex.estado === "en_proceso").length}
              </span>
            </button>
            <button
              onClick={() => setStatusFilter("pendiente")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all border-2 ${statusFilter === "pendiente"
                ? "bg-amber-500 text-white border-amber-500 shadow-lg"
                : "bg-amber-50 text-amber-700 border-amber-200 hover:border-amber-300"
                }`}
            >
              <AlertCircle size={14} />
              Pendiente
              <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] ${statusFilter === "pendiente" ? "bg-white/20" : "bg-amber-100"
                }`}>
                {examenes.filter(ex => ex.estado === "pendiente").length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {notification && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[300] animate-in fade-in slide-in-from-bottom-5 w-[90%] md:w-auto">
          <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center justify-center gap-3 border border-slate-700">
            <CheckCircle2 className="text-emerald-400" size={20} />
            <span className="font-bold text-sm md:text-base">{notification}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Tabla / Lista de Registros */}
        <div className="xl:col-span-8 space-y-4">
          <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto max-h-[650px]">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 z-10 bg-slate-50/90 backdrop-blur-md border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Información Paciente</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo de Estudio</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha</th>
                    <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredExamenes.map((examen, index) => {
                    const status = getStatusConfig(examen.estado);
                    return (
                      <tr
                        key={examen.id}
                        onClick={() => handleSelectExamen(examen, index)}
                        className={`group cursor-pointer transition-all ${selectedExamen?.id === examen.id ? "bg-blue-50/80" : "hover:bg-slate-50"
                          }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${selectedExamen?.id === examen.id ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                              }`}>
                              {examen.paciente_nombre.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 leading-tight">{examen.paciente_nombre}</div>
                              <div className="text-xs font-medium text-slate-400">CI: {examen.paciente_cedula}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-600">{examen.tipo}</td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-400">
                          {(() => {
                            const dateObj = new Date(examen.fecha);
                            const offset = dateObj.getTimezoneOffset() * 60000;
                            return new Date(dateObj.getTime() + offset).toLocaleDateString("es-ES", {
                              day: "2-digit", month: "short", year: "numeric"
                            });
                          })()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black border uppercase tracking-wider ${status.bg}`}>
                            {status.icon} {status.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile List Cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredExamenes.map((examen, index) => {
                const status = getStatusConfig(examen.estado);
                const isSelected = selectedExamen?.id === examen.id;
                return (
                  <div
                    key={examen.id}
                    onClick={() => handleSelectExamen(examen, index)}
                    className={`p-5 active:bg-slate-100 transition-colors ${isSelected ? "bg-blue-50 ring-2 ring-inset ring-blue-500" : ""}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex gap-3">
                        <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center font-black text-sm ${isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                          {examen.paciente_nombre.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 leading-tight">{examen.paciente_nombre}</p>
                          <p className="text-xs font-bold text-slate-400">CI: {examen.paciente_cedula}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black border uppercase tracking-tighter ${status.bg}`}>
                        {status.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 font-bold text-blue-600">
                        <FileText size={14} /> {examen.tipo}
                      </div>
                      <div className="flex items-center gap-1 font-medium text-slate-400">
                        <Calendar size={14} />
                        {new Date(examen.fecha + "T12:00:00").toLocaleDateString("es-ES")}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navegación - Desktop & Mobile */}
          {selectedExamen && (
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-3 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest md:ml-4">
                Expediente <span className="text-blue-600 font-black">{currentIndex + 1}</span> de {filteredExamenes.length}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleSelectExamen(filteredExamenes[0], 0)}
                  disabled={currentIndex === 0}
                  className="p-3 md:p-2 disabled:opacity-30 text-slate-600"
                >
                  <ChevronFirst size={20} />
                </button>
                <button
                  onClick={() => handleSelectExamen(filteredExamenes[currentIndex - 1], currentIndex - 1)}
                  disabled={currentIndex === 0}
                  className="p-3 md:p-2 disabled:opacity-30 text-slate-600"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => handleSelectExamen(filteredExamenes[currentIndex + 1], currentIndex + 1)}
                  disabled={currentIndex === filteredExamenes.length - 1}
                  className="p-3 md:p-2 disabled:opacity-30 text-slate-600"
                >
                  <ChevronRight size={20} />
                </button>
                <button
                  onClick={() => handleSelectExamen(filteredExamenes[filteredExamenes.length - 1], filteredExamenes.length - 1)}
                  disabled={currentIndex === filteredExamenes.length - 1}
                  className="p-3 md:p-2 disabled:opacity-30 text-slate-600"
                >
                  <ChevronLast size={20} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Panel Lateral (Acciones y Detalles) */}
        <div id="action-panel" className="xl:col-span-4 space-y-6">
          {selectedExamen ? (
            <div className="sticky top-6 space-y-6">
              <div className="bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-2xl text-white">
                <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-6">Acciones de Control</h3>
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={handleOpenPrint}
                    disabled={selectedExamen.estado !== "completado"}
                    className="w-full flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-600 py-4 rounded-2xl font-black text-sm transition-all"
                  >
                    <Printer size={20} /> GENERAR PDF OFICIAL
                  </button>
                  <button
                    onClick={handleEdit}
                    className="w-full flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 py-4 rounded-2xl font-black text-sm transition-all border border-white/10"
                  >
                    <Edit3 size={20} /> EDITAR RESULTADOS
                  </button>
                  <button
                    onClick={handleOpenPortada}
                    className="w-full flex items-center justify-center gap-3 bg-indigo-500/10 hover:bg-indigo-600 text-indigo-400 hover:text-white py-4 rounded-2xl font-black text-sm transition-all border border-indigo-500/20 group"
                  >
                    <Printer size={20} className="group-hover:animate-bounce" />
                    IMPRIMIR PORTADA
                  </button>
                  <button
                    onClick={handleDeleteExamen}
                    className="w-full flex items-center justify-center gap-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white py-4 rounded-2xl font-black text-sm transition-all border border-red-500/20"
                  >
                    <Trash2 size={20} /> ELIMINAR REGISTRO
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-slate-200 shadow-xl">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Detalles del Estudio</h3>
                <div className="space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 flex-shrink-0">
                      <User size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Paciente</p>
                      <p className="font-bold text-slate-800 truncate">{selectedExamen.paciente_nombre}</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 overflow-hidden">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1">
                      <Fingerprint size={10} /> ID Único de Validación
                    </p>
                    <p className="text-[10px] font-mono font-bold text-slate-700 break-all">
                      {selectedExamen.uuid || "PENDIENTE DE ASIGNACIÓN"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] md:rounded-[3rem] p-10 text-center">
              <div className="bg-white p-6 rounded-full shadow-sm mb-4">
                <Search className="text-slate-200" size={40} />
              </div>
              <p className="text-slate-500 font-bold uppercase text-[10px] md:text-xs tracking-widest max-w-[200px]">
                Selecciona un registro para gestionar acciones
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL IMPRESIÓN */}
      {showPrintModal && selectedExamen && (
        <div className="fixed inset-0 bg-black/95 md:bg-black/70 flex items-center justify-center z-[500] md:p-4 backdrop-blur-sm">
          <div className="bg-white md:rounded-2xl w-full max-w-5xl h-full md:h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 md:p-6 border-b bg-white">
              <div>
                <h2 className="text-lg md:text-xl font-black">Vista Previa</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedExamen.tipo}</p>
              </div>
              <button
                onClick={() => setShowPrintModal(false)}
                className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 bg-slate-100 overflow-y-auto">
              <ReportViewer
                type={selectedExamen.tipo}
                data={selectedExamen.resultados}
                qrImage={qrCodeImage}
                patient={{
                  nombre: selectedExamen.paciente_nombre,
                  cedula: selectedExamen.paciente_cedula,
                  edad: selectedExamen.paciente_edad,
                  fecha: (() => {
                    const d = new Date(selectedExamen.fecha);
                    const offset = d.getTimezoneOffset() * 60000;
                    return new Date(d.getTime() + offset).toLocaleDateString("es-ES");
                  })(),
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDICIÓN - Ampliado y Profesional */}
      {showEditModal && selectedExamen && (
        <div className="fixed inset-0 z-[1000] flex items-stretch justify-end">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-300"
            onClick={() => !isSaving && setShowEditModal(false)}
          />
          <div className="relative w-full max-w-5xl bg-[#F8FAFC] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-500 ease-out">
            {/* Header */}
            <div className="px-8 py-6 bg-white border-b border-slate-200 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                  <Edit3 size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none mb-1">Editor de Resultados</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <User size={12} /> {selectedExamen.paciente_nombre}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-3 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-2xl transition-all active:scale-90"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar scroll-smooth">
              <div className="max-w-4xl mx-auto space-y-8">
                {/* Form Wrapper */}
                <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-6 lg:p-10">
                  {renderExamenForm()}
                </div>

                {/* Status Switcher */}
                <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                  <h3 className="text-[10px] font-black uppercase text-slate-400 mb-6 tracking-[0.2em] flex items-center gap-2 px-2">
                    <CheckCircle2 size={14} /> Estatus del Informe Final
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: "pendiente", label: "Pendiente", active: "peer-checked:bg-amber-500 peer-checked:border-amber-500" },
                      { id: "en_proceso", label: "En Proceso", active: "peer-checked:bg-blue-600 peer-checked:border-blue-600" },
                      { id: "completado", label: "Completado", active: "peer-checked:bg-emerald-500 peer-checked:border-emerald-500" }
                    ].map((st) => (
                      <label key={st.id} className="relative cursor-pointer group">
                        <input
                          type="radio"
                          name="status"
                          className="peer sr-only"
                          checked={editEstado === st.id}
                          onChange={() => setEditEstado(st.id)}
                        />
                        <div className={`
                          py-4 px-3 text-center rounded-2xl border-2 border-slate-100 bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400
                          transition-all duration-200 group-hover:border-slate-200 group-hover:bg-white
                          ${st.active} peer-checked:text-white peer-checked:shadow-lg peer-checked:scale-[1.02]
                        `}>
                          {st.label}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 bg-white border-t border-slate-200 flex gap-4 shrink-0 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-8 py-4 bg-slate-50 text-slate-500 text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all border border-slate-100"
              >
                DESCARTAR
              </button>
              <button
                onClick={handleSaveResults}
                disabled={isSaving}
                className="flex-1 py-4 bg-slate-900 hover:bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-900/10 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><Save size={20} /> ACTUALIZAR EXPEDIENTE</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PORTADA */}
      {showPortadaModal && selectedExamen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[600] md:p-4">
          <div className="bg-white md:rounded-[2.5rem] w-full max-w-5xl h-full md:h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center px-6 py-5 md:px-8 md:py-6 border-b border-slate-100 bg-white">
              <div className="min-w-0">
                <h2 className="text-lg md:text-xl font-black text-slate-800 truncate">Carátula del Informe</h2>
                <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest truncate">
                  {selectedExamen.paciente_nombre}
                </p>
              </div>
              <button
                onClick={() => setShowPortadaModal(false)}
                className="p-3 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-2xl transition-all flex-shrink-0"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 bg-slate-50 overflow-y-auto">
              <ReportViewer
                type="PORTADA"
                data={{}}
                patient={{
                  nombre: selectedExamen.paciente_nombre,
                  cedula: selectedExamen.paciente_cedula,
                  edad: selectedExamen.paciente_edad,
                  fecha: new Intl.DateTimeFormat("es-ES", {
                    year: "numeric", month: "long", day: "numeric",
                  }).format(new Date()),
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}