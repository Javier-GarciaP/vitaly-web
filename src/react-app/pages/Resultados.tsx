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
}

export default function ResultadosPage() {
  const [examenes, setExamenes] = useState<Examen[]>([]);
  const [filteredExamenes, setFilteredExamenes] = useState<Examen[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExamen, setSelectedExamen] = useState<Examen | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [qrCodeImage, setQrCodeImage] = useState<string>("");
  const [editResultados, setEditResultados] = useState<any>({});
  const [editEstado, setEditEstado] = useState("");
  const [notification, setNotification] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadExamenes();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredExamenes(examenes);
    } else {
      const filtered = examenes.filter(
        (ex) =>
          ex.paciente_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ex.paciente_cedula.includes(searchTerm)
      );
      setFilteredExamenes(filtered);
    }
  }, [searchTerm, examenes]);

  const loadExamenes = async () => {
    try {
      const res = await fetch("/api/examenes");
      const data = await res.json() as Examen[];
      setExamenes(data);
    } catch (e) {
      console.error("Error cargando exámenes");
    }
  };

  const handleOpenPrint = async () => {
    if (!selectedExamen) return;
    try {
      const baseUrl = window.location.origin;
      const validationUrl = `${baseUrl}/verificar/${selectedExamen.uuid || selectedExamen.id}`;
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
  };

  const handleEdit = () => {
    if (!selectedExamen) return;
    setEditResultados(selectedExamen.resultados || {});
    setEditEstado(selectedExamen.estado);
    setShowEditModal(true);
  };

  // --- FUNCIÓN CORREGIDA ---
  const handleSaveResults = async () => {
    if (!selectedExamen || isSaving) return;
    
    setIsSaving(true);
    // Creamos un payload limpio enviando solo lo que el backend necesita actualizar
    const payload = {
      paciente_id: selectedExamen.paciente_id,
      tipo: selectedExamen.tipo,
      fecha: selectedExamen.fecha,
      resultados: editResultados,
      estado: editEstado,
      // El uuid se mantiene si ya existe en el objeto original, pero no se genera uno nuevo aquí
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
        
        // Cargamos los datos de nuevo para asegurar sincronía
        await loadExamenes();
        
        // Actualizamos la vista previa lateral con los nuevos datos
        setSelectedExamen({
          ...selectedExamen,
          resultados: editResultados,
          estado: editEstado
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
      "Hematología": <HematologiaForm {...props} />,
      "Química Clínica": <QuimicaClinicaForm {...props} />,
      "Orina": <OrinaForm {...props} />,
      "Heces": <HecesForm {...props} />,
      "Coagulación": <CoagulacionForm {...props} />,
      "Grupo Sanguíneo": <GrupoSanguineoForm {...props} />,
      "Bacteriología": <BacteriologiaForm {...props} />,
      "Misceláneos": <MiscelaneosForm {...props} />,
    };
    return forms[selectedExamen.tipo] || <div className="p-10 text-center text-slate-400">Formulario no definido</div>;
  };

  return (
    <div className="max-w-[1600px] mx-auto pb-10 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 mt-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <FileText className="text-blue-600" size={32} />
            Gestión de Resultados
          </h1>
          <p className="text-slate-500 font-medium">Validación, edición y despacho de informes médicos</p>
        </div>

        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre o cédula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
          />
        </div>
      </div>

      {notification && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-5">
          <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700">
            <CheckCircle2 className="text-emerald-400" size={20} />
            <span className="font-bold">{notification}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Tabla de Registros */}
        <div className="xl:col-span-8 space-y-4">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden">
            <div className="overflow-x-auto max-h-[650px]">
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
                        className={`group cursor-pointer transition-all ${selectedExamen?.id === examen.id ? "bg-blue-50/80" : "hover:bg-slate-50"}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${selectedExamen?.id === examen.id ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>
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
                          {new Date(examen.fecha).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}
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
          </div>
          
          {/* Navegación */}
          {selectedExamen && (
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-3 border border-slate-200 flex items-center justify-between">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-4">
                Expediente <span className="text-blue-600 font-black">{currentIndex + 1}</span> de {filteredExamenes.length}
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleSelectExamen(filteredExamenes[0], 0)} disabled={currentIndex === 0} className="p-2 disabled:opacity-30"><ChevronFirst size={18}/></button>
                <button onClick={() => handleSelectExamen(filteredExamenes[currentIndex-1], currentIndex-1)} disabled={currentIndex === 0} className="p-2 disabled:opacity-30"><ChevronLeft size={18}/></button>
                <button onClick={() => handleSelectExamen(filteredExamenes[currentIndex+1], currentIndex+1)} disabled={currentIndex === filteredExamenes.length - 1} className="p-2 disabled:opacity-30"><ChevronRight size={18}/></button>
                <button onClick={() => handleSelectExamen(filteredExamenes[filteredExamenes.length-1], filteredExamenes.length-1)} disabled={currentIndex === filteredExamenes.length - 1} className="p-2 disabled:opacity-30"><ChevronLast size={18}/></button>
              </div>
            </div>
          )}
        </div>

        {/* Panel Lateral */}
        <div className="xl:col-span-4 space-y-6">
          {selectedExamen ? (
            <div className="sticky top-6 space-y-6">
              <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl text-white">
                <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-6">Acciones de Control</h3>
                <div className="space-y-3">
                  <button onClick={handleOpenPrint} disabled={selectedExamen.estado !== "completado"} className="w-full flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-600 py-4 rounded-2xl font-black text-sm transition-all">
                    <Printer size={20} /> GENERAR PDF OFICIAL
                  </button>
                  <button onClick={handleEdit} className="w-full flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 py-4 rounded-2xl font-black text-sm transition-all border border-white/10">
                    <Edit3 size={20} /> EDITAR RESULTADOS
                  </button>
                  <button onClick={handleDeleteExamen} className="w-full flex items-center justify-center gap-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white py-4 rounded-2xl font-black text-sm transition-all border border-red-500/20">
                    <Trash2 size={20} /> ELIMINAR REGISTRO
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-xl">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Detalles del Estudio</h3>
                <div className="space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600"><User size={20} /></div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Paciente</p>
                      <p className="font-bold text-slate-800">{selectedExamen.paciente_nombre}</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">ID Único de Validación</p>
                    <p className="text-[10px] font-mono font-bold text-slate-700 truncate">{selectedExamen.uuid || "PENDIENTE DE ASIGNACIÓN"}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] p-10 text-center">
               <Search className="text-slate-200 mb-4" size={50} />
               <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Selecciona un registro para gestionar</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL IMPRESIÓN */}
      {showPrintModal && selectedExamen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[200] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-black">Vista Previa de Impresión</h2>
              <button onClick={() => setShowPrintModal(false)} className="p-2 hover:bg-slate-100 rounded-full"><X/></button>
            </div>
            <div className="flex-1 bg-slate-100 overflow-y-auto">
              <ReportViewer
                type={selectedExamen.tipo}
                data={selectedExamen.resultados}
                qrImage={qrCodeImage}
                patient={{
                  nombre: selectedExamen.paciente_nombre,
                  cedula: selectedExamen.paciente_cedula,
                  fecha: new Date(selectedExamen.fecha).toLocaleDateString(),
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDICIÓN */}
      {showEditModal && selectedExamen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4 overflow-y-auto">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl my-auto">
            <div className="px-10 py-8 border-b flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Editor de Resultados</h2>
                <p className="text-sm font-medium text-slate-500">Paciente: {selectedExamen.paciente_nombre}</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-3 hover:bg-slate-100 rounded-2xl"><X size={24} /></button>
            </div>
            
            <div className="p-10 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="mb-10">{renderExamenForm()}</div>
              <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 block">Estatus del Informe</label>
                <div className="flex gap-3">
                  {["pendiente", "en_proceso", "completado"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setEditEstado(status)}
                      className={`px-6 py-3 rounded-xl font-bold text-xs uppercase border-2 transition-all ${
                        editEstado === status ? "bg-blue-600 border-blue-600 text-white shadow-lg" : "bg-white border-slate-100 text-slate-400"
                      }`}
                    >
                      {status.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-10 py-8 bg-slate-50 border-t flex gap-4">
              <button onClick={() => setShowEditModal(false)} className="flex-1 py-4 font-black text-sm text-slate-400">DESCARTAR</button>
              <button 
                onClick={handleSaveResults} 
                disabled={isSaving}
                className="flex-[2] py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2"
              >
                {isSaving ? "GUARDANDO..." : <><Save size={20} /> ACTUALIZAR EXPEDIENTE</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}