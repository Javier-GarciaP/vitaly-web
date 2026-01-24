import { useEffect, useState } from "react";
import {
  Search,
  Edit2,
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
  ArrowUpRight,
  Copy,
  Check,
} from "lucide-react";
import { formatDisplayDate } from "@/utils/date";
import { useNotification } from "@/react-app/context/NotificationContext";

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
  const { showNotification, confirmAction } = useNotification();
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
  const [isSaving, setIsSaving] = useState(false);
  const [showPortadaModal, setShowPortadaModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadExamenes();
  }, []);

  useEffect(() => {
    let filtered = examenes;

    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(
        (ex) =>
          ex.paciente_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ex.paciente_cedula.includes(searchTerm)
      );
    }

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
      showNotification("error", "Error", "No se pudo generar el código de validación");
    }
  };

  const handleSelectExamen = (examen: Examen, index: number) => {
    setSelectedExamen(examen);
    setCurrentIndex(index);
    setQrCodeImage("");
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
        showNotification("success", "Cambios Aplicados", `El estudio de ${selectedExamen.tipo} ha sido actualizado`);
        setShowEditModal(false);
        await loadExamenes();
        setSelectedExamen({
          ...selectedExamen,
          resultados: editResultados,
          estado: editEstado,
        });
      }
    } catch (e) {
      console.error("Error en la petición:", e);
      showNotification("error", "Error", "No se pudieron guardar los cambios");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteExamen = async () => {
    if (!selectedExamen) return;
    confirmAction({
      title: "Eliminar Registro",
      message: `¿Está seguro de eliminar el examen de ${selectedExamen.tipo} para ${selectedExamen.paciente_nombre}? Esta acción no se puede deshacer.`,
      variant: "danger",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/examenes/${selectedExamen.id}`, {
            method: "DELETE",
          });

          if (res.ok) {
            showNotification("delete", "Registro Eliminado", `El estudio de ${selectedExamen.tipo} ha sido removido`);
            setSelectedExamen(null);
            loadExamenes();
          }
        } catch (error) {
          console.error("Error:", error);
          showNotification("error", "Error", "No se pudo eliminar el registro");
        }
      }
    });
  };

  const copyToClipboard = () => {
    if (!selectedExamen?.uuid) return;
    navigator.clipboard.writeText(selectedExamen.uuid);
    setCopied(true);
    showNotification("info", "Copiado", "Código de validación copiado al portapapeles");
    setTimeout(() => setCopied(false), 2000);
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
      {/* TOP HEADER */}
      <div className="flex items-end justify-between border-b border-slate-100 pb-4 mb-6 mt-6">
        <div>
          <h1 className="text-sm font-bold text-slate-900 uppercase tracking-[0.2em]">Resultados</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1">
            Gestión y validación de estudios
          </p>
        </div>
      </div>

      {/* BUSCADOR MINIMALISTA */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
        <input
          type="text"
          placeholder="BUSCAR POR NOMBRE O CÉDULA..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-100 rounded-xl focus:border-slate-300 outline-none text-[11px] font-bold uppercase tracking-wide transition-all placeholder:text-slate-300 shadow-sm"
        />
      </div>

      {/* FILTROS MINIMALISTAS */}
      <div className="flex flex-wrap gap-2 mb-8">
        {[
          { id: "todos", label: "Todos", count: examenes.length, icon: FileText },
          { id: "completado", label: "Completados", count: examenes.filter(ex => ex.estado === "completado").length, icon: CheckCircle2 },
          { id: "en_proceso", label: "En Proceso", count: examenes.filter(ex => ex.estado === "en_proceso").length, icon: Clock },
          { id: "pendiente", label: "Pendientes", count: examenes.filter(ex => ex.estado === "pendiente").length, icon: AlertCircle },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setStatusFilter(f.id)}
            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border flex items-center gap-2 ${statusFilter === f.id
              ? "bg-slate-900 text-white border-slate-900 shadow-lg"
              : "bg-white text-slate-400 border-slate-100 hover:border-slate-200"
              }`}
          >
            <f.icon size={14} />
            {f.label}
            <span className={`ml-1 px-1.5 py-0.5 rounded ${statusFilter === f.id ? "bg-white/20" : "bg-slate-50 text-slate-400"}`}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Tabla / Lista de Registros */}
        <div className="xl:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="hidden md:block overflow-x-auto max-h-[650px]">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-50 text-slate-400 text-[9px] font-bold uppercase tracking-widest bg-slate-50/50">
                    <th className="px-6 py-4">Paciente</th>
                    <th className="px-6 py-4">Estudio</th>
                    <th className="px-6 py-4">Fecha</th>
                    <th className="px-6 py-4 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredExamenes.map((examen, index) => {
                    const isSelected = selectedExamen?.id === examen.id;
                    const status = getStatusConfig(examen.estado);
                    return (
                      <tr
                        key={examen.id} onClick={() => handleSelectExamen(examen, index)}
                        className={`cursor-pointer transition-colors ${isSelected ? "bg-blue-50/50" : "hover:bg-slate-50"}`}
                      >
                        <td className="px-6 py-4">
                          <p className="text-[11px] font-bold text-slate-700 uppercase tracking-tight leading-none mb-0.5">{examen.paciente_nombre}</p>
                          <p className="text-[9px] text-slate-400 font-bold font-mono uppercase">{examen.paciente_cedula}</p>
                        </td>
                        <td className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase">{examen.tipo}</td>
                        <td className="px-6 py-4 text-[10px] font-medium text-slate-400 uppercase">
                          {(() => {
                            const dateObj = new Date(examen.fecha);
                            const offset = dateObj.getTimezoneOffset() * 60000;
                            return new Date(dateObj.getTime() + offset).toLocaleDateString("es-ES", {
                              day: "2-digit", month: "short", year: "numeric"
                            });
                          })()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center h-5 px-2 rounded font-bold text-[8px] uppercase tracking-wider border ${status.bg}`}>
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-slate-50">
              {filteredExamenes.map((examen, index) => {
                const isSelected = selectedExamen?.id === examen.id;
                const status = getStatusConfig(examen.estado);
                return (
                  <div key={examen.id} onClick={() => handleSelectExamen(examen, index)} className={`p-5 transition-colors ${isSelected ? "bg-blue-50/50" : "active:bg-slate-50"}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">{examen.paciente_nombre}</p>
                        <p className="text-[9px] text-slate-400 font-bold font-mono uppercase">CI: {examen.paciente_cedula}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold border uppercase tracking-widest ${status.bg}`}>{status.label}</span>
                    </div>
                    <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 uppercase">
                      <span className="text-blue-600">{examen.tipo}</span>
                      <span>{formatDisplayDate(examen.fecha)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pagination/Nav */}
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

        {/* Action Panel */}
        <div id="action-panel" className="xl:col-span-4 space-y-6">
          {selectedExamen ? (
            <div className="sticky top-6 space-y-6">
              <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Acciones Disponibles</p>
                <div className="space-y-3">
                  <button
                    onClick={handleOpenPrint} disabled={selectedExamen.estado !== "completado"}
                    className="w-full flex items-center justify-between px-6 py-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-50 disabled:text-slate-200 text-white rounded-2xl transition-all group"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-widest">Generar Reporte PDF</span>
                    <Printer size={18} className="group-hover:scale-110 transition-transform" />
                  </button>
                  <button
                    onClick={handleEdit}
                    className="w-full flex items-center justify-between px-6 py-4 bg-white border border-slate-100 hover:border-slate-300 text-slate-600 rounded-2xl transition-all group"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-widest">Editar Resultados</span>
                    <Edit2 size={18} className="group-hover:scale-110 transition-transform" />
                  </button>
                  <button
                    onClick={handleOpenPortada}
                    className="w-full flex items-center justify-between px-6 py-4 bg-white border border-slate-100 hover:border-slate-300 text-slate-600 rounded-2xl transition-all group"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-widest">Imprimir Portada</span>
                    <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>
                  <button
                    onClick={handleDeleteExamen}
                    className="w-full flex items-center justify-between px-6 py-4 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all group"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-widest">Eliminar Registro</span>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-8">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Expediente</p>
                <div className="space-y-4">
                  <div>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Paciente Asignado</p>
                    <p className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">{selectedExamen.paciente_nombre}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Código de Validación</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-[9px] font-bold text-slate-400 break-all">{selectedExamen.uuid || "PENDIENTE"}</p>
                      {selectedExamen.uuid && (
                        <button
                          onClick={copyToClipboard}
                          className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-600 transition-all active:scale-95"
                          title="Copiar código"
                        >
                          {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                        </button>
                      )}
                    </div>
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
                  fecha: selectedExamen.fecha,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDICIÓN */}
      {showEditModal && selectedExamen && (
        <div className="fixed inset-0 z-[1000] flex items-stretch justify-end">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-300"
            onClick={() => !isSaving && setShowEditModal(false)}
          />
          <div className="relative w-full max-w-5xl bg-[#F8FAFC] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-500 ease-out">
            <div className="px-8 py-6 bg-white border-b border-slate-200 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                  <Edit2 size={20} />
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

            <div className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar scroll-smooth">
              <div className="max-w-4xl mx-auto space-y-8">
                <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-6 lg:p-10">
                  {renderExamenForm()}
                </div>

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
                  fecha: selectedExamen.fecha,
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}