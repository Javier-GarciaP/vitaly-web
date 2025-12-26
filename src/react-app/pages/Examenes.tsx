import { useEffect, useState, useMemo } from "react";
import { Plus, X, Search, User, AlertCircle, Calendar, CheckCircle2, FlaskConical, ChevronRight, Activity } from "lucide-react";

interface Paciente {
  id: number;
  cedula: string;
  nombre: string;
}

export default function ExamenesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [notification, setNotification] = useState("");
  
  const [pacienteInput, setPacienteInput] = useState("");
  const [showSugerencias, setShowSugerencias] = useState(false);
  const [errorPaciente, setErrorPaciente] = useState("");
  const [selectedTipos, setSelectedTipos] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    paciente_id: "",
    fecha: new Date().toISOString().split("T")[0],
    estado: "pendiente",
  });

  const tiposExamen = [
    "Hematología", "Química Clínica", "Orina", "Heces", 
    "Coagulación", "Grupo Sanguíneo", "Bacteriología", "Misceláneos",
  ];

  useEffect(() => { loadPacientes(); }, []);

  const loadPacientes = async () => {
    try {
      const res = await fetch("/api/pacientes");
      const data = await res.json();
      setPacientes(data);
    } catch (e) { console.error("Error cargando pacientes"); }
  };

  const sugerenciasFiltradas = useMemo(() => {
    if (pacienteInput.length < 2) return [];
    return pacientes.filter(p => 
      p.nombre.toLowerCase().includes(pacienteInput.toLowerCase()) || 
      p.cedula.includes(pacienteInput)
    ).slice(0, 5);
  }, [pacienteInput, pacientes]);

  const seleccionarPaciente = (p: Paciente) => {
    setFormData({ ...formData, paciente_id: p.id.toString() });
    setPacienteInput(`${p.nombre} (${p.cedula})`);
    setShowSugerencias(false);
    setErrorPaciente("");
  };

  const addTipoExamen = (tipo: string) => {
    if (tipo !== "" && !selectedTipos.includes(tipo)) {
      setSelectedTipos([...selectedTipos, tipo]);
    }
  };

  const removeTipoExamen = (tipo: string) => {
    setSelectedTipos(selectedTipos.filter(t => t !== tipo));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.paciente_id) {
      setErrorPaciente("Debe seleccionar un paciente válido.");
      return;
    }
    if (selectedTipos.length === 0) return;

    try {
      const promesas = selectedTipos.map(tipo => {
        return fetch("/api/examenes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paciente_id: parseInt(formData.paciente_id),
            tipo,
            fecha: formData.fecha,
            estado: formData.estado,
            uuid: crypto.randomUUID(),
          }),
        });
      });

      const respuestas = await Promise.all(promesas);
      if (respuestas.every(res => res.ok)) {
        showNotification(`${selectedTipos.length} estudios registrados`);
        closeModal();
      }
    } catch (e) { alert("Error al guardar."); }
  };

  const openModal = () => {
    setFormData({ paciente_id: "", fecha: new Date().toISOString().split("T")[0], estado: "pendiente" });
    setSelectedTipos([]);
    setPacienteInput("");
    setErrorPaciente("");
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setShowSugerencias(false); };

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(""), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER DINÁMICO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FlaskConical size={18} className="text-blue-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Módulo de Laboratorio</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Registro de Exámenes</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Vincule nuevos análisis clínicos a pacientes registrados.</p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 font-bold active:scale-95"
        >
          <Plus size={20} /> 
          <span>Nueva Orden</span>
        </button>
      </div>

      {/* NOTIFICACIÓN FLOTANTE */}
      {notification && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-[100] animate-in slide-in-from-bottom-10">
          <CheckCircle2 className="text-emerald-400" size={20} />
          <span className="font-bold text-sm tracking-tight">{notification}</span>
        </div>
      )}

      {/* VISTA DE BIENVENIDA / PLACEHOLDER */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-blue-600 rounded-[3rem] p-8 md:p-12 overflow-hidden relative">
        <div className="relative z-10">
          <h2 className="text-white text-3xl font-black leading-tight tracking-tighter mb-4">
            Gestión eficiente de <br /> estudios clínicos.
          </h2>
          <p className="text-blue-100 text-sm mb-8 max-w-xs font-medium leading-relaxed">
            Busque un paciente por nombre o cédula para asignar múltiples tipos de análisis en un solo paso.
          </p>
          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <p className="text-white font-black text-xl leading-none">100%</p>
              <p className="text-blue-200 text-[10px] font-bold uppercase tracking-widest mt-1">Digital</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <p className="text-white font-black text-xl leading-none">Real-time</p>
              <p className="text-blue-200 text-[10px] font-bold uppercase tracking-widest mt-1">Sincronizado</p>
            </div>
          </div>
        </div>
        
        <div className="hidden md:flex justify-end relative">
             <div className="w-64 h-64 bg-white/5 rounded-full absolute -top-10 -right-10 animate-pulse" />
             <FlaskConical size={200} className="text-white/10 -rotate-12" />
        </div>
      </div>

      {/* MODAL REDISEÑADO */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-slate-50 p-8 flex justify-between items-center border-b border-slate-100">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Crear Orden</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Completar información</p>
              </div>
              <button onClick={closeModal} className="p-3 hover:bg-white rounded-2xl shadow-sm transition-all text-slate-400 hover:text-red-500">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Buscador Paciente */}
              <div className="relative">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-2 block">Paciente Seleccionado</label>
                <div className="group relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input
                    type="text"
                    placeholder="Escriba nombre o identificación..."
                    value={pacienteInput}
                    onChange={(e) => { setPacienteInput(e.target.value); setShowSugerencias(true); }}
                    className={`w-full pl-12 pr-4 py-4 bg-slate-50 border-2 rounded-2xl outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300 ${
                      errorPaciente ? "border-red-100 bg-red-50 text-red-900" : "border-transparent focus:border-blue-500 focus:bg-white"
                    }`}
                  />
                </div>
                
                {showSugerencias && sugerenciasFiltradas.length > 0 && (
                  <div className="absolute z-[90] w-full bg-white border border-slate-100 mt-2 rounded-2xl shadow-2xl overflow-hidden border-t-0 animate-in slide-in-from-top-2">
                    {sugerenciasFiltradas.map((p) => (
                      <button
                        key={p.id} type="button"
                        className="w-full p-4 text-left hover:bg-blue-50 flex items-center justify-between group transition-colors border-b border-slate-50 last:border-0"
                        onClick={() => seleccionarPaciente(p)}
                      >
                        <div>
                          <p className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{p.nombre}</p>
                          <p className="text-[10px] text-slate-400 font-black mt-0.5">{p.cedula}</p>
                        </div>
                        <ChevronRight size={16} className="text-slate-200 group-hover:text-blue-400 transition-all" />
                      </button>
                    ))}
                  </div>
                )}
                {errorPaciente && <p className="text-red-500 text-[10px] font-black uppercase mt-2 ml-1 flex items-center gap-1"><AlertCircle size={12}/> {errorPaciente}</p>}
              </div>

              {/* Selección de Exámenes */}
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1 block">Estudios a Realizar</label>
                <select
                  value=""
                  onChange={(e) => addTipoExamen(e.target.value)}
                  className="w-full px-4 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-bold text-slate-600 appearance-none transition-all"
                >
                  <option value="">+ Agregar estudio médico...</option>
                  {tiposExamen.map((tipo) => (
                    <option key={tipo} value={tipo} disabled={selectedTipos.includes(tipo)}>{tipo}</option>
                  ))}
                </select>

                <div className="flex flex-wrap gap-2 min-h-[40px]">
                  {selectedTipos.map((tipo) => (
                    <span key={tipo} className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider animate-in zoom-in-50">
                      {tipo}
                      <button type="button" onClick={() => removeTipoExamen(tipo)} className="p-0.5 bg-white/20 hover:bg-white/40 rounded-md">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Fecha y Estado */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1"><Calendar size={12}/> Fecha</label>
                    <input
                      type="date"
                      value={formData.fecha}
                      onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-bold text-slate-600 transition-all"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1"><Activity size={12}/> Prioridad</label>
                    <select
                      value={formData.estado}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-bold text-slate-600 transition-all"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="en_proceso">En Proceso</option>
                    </select>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button type="button" onClick={closeModal} className="flex-1 px-6 py-4 text-slate-400 hover:text-slate-600 font-bold transition-colors">Cancelar</button>
                <button
                  type="submit"
                  disabled={selectedTipos.length === 0}
                  className={`flex-1 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl ${
                    selectedTipos.length > 0 ? "bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700 active:scale-95" : "bg-slate-100 text-slate-300 cursor-not-allowed shadow-none"
                  }`}
                >
                  Confirmar {selectedTipos.length} Estudios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}