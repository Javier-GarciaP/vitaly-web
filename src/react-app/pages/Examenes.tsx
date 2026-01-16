import { useEffect, useState, useMemo } from "react";
import { Plus, X, User, CheckCircle2, ChevronRight, Activity, Search, ClipboardList } from "lucide-react";

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
      const data = await res.json() as Paciente[];
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
      setErrorPaciente("Seleccione un paciente.");
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
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-10">

      {/* HEADER PROFESIONAL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Registro de Exámenes</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Gestión de Órdenes y Laboratorio
          </p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-sm font-semibold"
        >
          <Plus size={18} />
          <span>Nueva Orden</span>
        </button>
      </div>

      {/* NOTIFICACIÓN FLOTANTE */}
      {notification && (
        <div className="fixed bottom-8 right-8 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 z-[100] animate-slide-in">
          <CheckCircle2 className="text-emerald-400" size={18} />
          <span className="font-semibold text-sm">{notification}</span>
        </div>
      )}

      {/* PANEL PRINCIPAL: 2 COLUMNAS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* COLUMNA IZQUIERDA: Info y Guía */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="">
              <Activity className="text-blue-600 mb-4" size={24} />
              <h2 className="text-lg font-bold text-slate-900 leading-tight mb-2">Órdenes Rápidas</h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-5">
                Asigne múltiples estudios a un paciente en una sola operación. Los resultados se sincronizarán automáticamente.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                  <CheckCircle2 size={16} /> 100% Sincronizado
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2">
              <ClipboardList size={16} /> Tipos Frecuentes
            </h3>
            <div className="flex flex-wrap gap-2">
              {tiposExamen.slice(0, 5).map(t => (
                <span key={t} className="text-xs font-medium bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-100">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: Placeholder de historial o Lista */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center min-h-[400px]">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
            <Search size={32} />
          </div>
          <h3 className="text-lg font-black text-slate-800">No hay órdenes seleccionadas</h3>
          <p className="text-slate-400 text-sm max-w-xs mt-2">
            Haga clic en <b>"Nueva Orden"</b> para comenzar a registrar estudios médicos.
          </p>
        </div>
      </div>

      {/* MODAL COMPACTO */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200 overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="bg-slate-50/50 px-6 py-4 flex justify-between items-center border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Nueva Orden Médica</h2>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-red-50 rounded-lg transition-all text-slate-400 hover:text-red-500">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Buscador Paciente */}
              <div className="relative">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Paciente</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o cédula..."
                    value={pacienteInput}
                    onChange={(e) => { setPacienteInput(e.target.value); setShowSugerencias(true); }}
                    className={`w-full pl-10 pr-4 py-3 bg-slate-50 border-2 rounded-xl outline-none transition-all text-sm font-bold ${errorPaciente ? "border-red-200 bg-red-50" : "border-transparent focus:border-blue-500 focus:bg-white text-slate-700"
                      }`}
                  />
                </div>

                {showSugerencias && sugerenciasFiltradas.length > 0 && (
                  <div className="absolute z-[90] w-full bg-white border border-slate-200 mt-1 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1">
                    {sugerenciasFiltradas.map((p) => (
                      <button
                        key={p.id} type="button"
                        className="w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center justify-between group border-b border-slate-50 last:border-0"
                        onClick={() => seleccionarPaciente(p)}
                      >
                        <div>
                          <p className="font-bold text-slate-800 text-xs">{p.nombre}</p>
                          <p className="text-[9px] text-slate-400 font-bold">{p.cedula}</p>
                        </div>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-500" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selección de Exámenes */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Estudios</label>
                <select
                  value=""
                  onChange={(e) => addTipoExamen(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl outline-none text-xs font-bold text-slate-600 appearance-none transition-all cursor-pointer"
                >
                  <option value="">+ Seleccionar estudio médico...</option>
                  {tiposExamen.map((tipo) => (
                    <option key={tipo} value={tipo} disabled={selectedTipos.includes(tipo)}>{tipo}</option>
                  ))}
                </select>

                <div className="flex flex-wrap gap-1.5 min-h-[30px]">
                  {selectedTipos.map((tipo) => (
                    <span key={tipo} className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight animate-in zoom-in-50">
                      {tipo}
                      <button type="button" onClick={() => removeTipoExamen(tipo)} className="text-blue-400 hover:text-red-500">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Fecha y Estado Compacto */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fecha</label>
                  <input
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl outline-none text-xs font-bold text-slate-600"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Estado</label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl outline-none text-xs font-bold text-slate-600"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en_proceso">En Proceso</option>
                  </select>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={selectedTipos.length === 0}
                  className={`flex-1 py-3.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${selectedTipos.length > 0 ? "bg-slate-900 text-white shadow-lg hover:bg-blue-600" : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    }`}
                >
                  Registrar Orden ({selectedTipos.length})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}