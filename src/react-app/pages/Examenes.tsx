import { useEffect, useState, useMemo } from "react";
import { Plus, X, User, Activity, Search, ClipboardList } from "lucide-react";
import { getTodayDate } from "@/utils/date";
import { useNotification } from "@/react-app/context/NotificationContext";

interface Paciente {
  id: number;
  cedula: string;
  nombre: string;
}

export default function ExamenesPage() {
  const { showNotification } = useNotification();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [pacienteInput, setPacienteInput] = useState("");
  const [showSugerencias, setShowSugerencias] = useState(false);
  const [errorPaciente, setErrorPaciente] = useState("");
  const [selectedTipos, setSelectedTipos] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    paciente_id: "",
    fecha: getTodayDate(),
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
        showNotification("success", "Orden Generada", `${selectedTipos.length} estudios han sido registrados correctamente`);
        closeModal();
      }
    } catch (e) {
      showNotification("error", "Error", "No se pudo procesar la solicitud");
    }
  };

  const openModal = () => {
    setFormData({ paciente_id: "", fecha: getTodayDate(), estado: "pendiente" });
    setSelectedTipos([]);
    setPacienteInput("");
    setErrorPaciente("");
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setShowSugerencias(false); };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-10">

      {/* TOP HEADER */}
      <div className="flex items-end justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h1 className="text-sm font-bold text-slate-900 uppercase tracking-[0.2em]">Órdenes</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1">
            Gestión de solicitudes de laboratorio
          </p>
        </div>
        <button
          onClick={openModal}
          className="text-[10px] font-bold uppercase text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={14} /> Nueva Orden
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* COLUMNA IZQUIERDA - Minimalista */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Activity size={14} className="text-slate-400" /> Registro Rápido
            </h2>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
              Cree órdenes médicas vinculando múltiples estudios a un paciente. El sistema generará automáticamente las entradas necesarias en el panel de resultados.
            </p>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
              <ClipboardList size={14} className="text-slate-400" /> Estudios Disponibles
            </h3>
            <div className="flex flex-wrap gap-2">
              {tiposExamen.map(t => (
                <span key={t} className="text-[9px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-2 py-1 rounded uppercase tracking-tighter">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA - Pantalla Vacía Minimalista */}
        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-[2rem] p-12 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-12 h-12 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mb-6 border border-slate-100">
            <Search size={24} />
          </div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Esperando Selección</h3>
          <p className="text-[10px] text-slate-300 font-bold uppercase tracking-tight mt-2">
            Use el botón superior para crear una nueva orden de laboratorio
          </p>
        </div>
      </div>

      {/* MODAL ORDEN - Minimalista */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/10 backdrop-blur-sm flex items-center justify-center z-[150] p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-sm:aspect-auto max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                Nueva Orden de Laboratorio
              </p>
              <button onClick={closeModal} className="text-slate-300 hover:text-slate-900 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="relative">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Paciente</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input
                    type="text" placeholder="BUSCAR PACIENTE..." value={pacienteInput}
                    onChange={(e) => { setPacienteInput(e.target.value); setShowSugerencias(true); }}
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl outline-none text-[11px] font-bold uppercase transition-all ${errorPaciente ? "border-rose-200" : "border-slate-100 focus:border-slate-400"}`}
                  />
                </div>
                {showSugerencias && sugerenciasFiltradas.length > 0 && (
                  <div className="absolute z-[160] w-full bg-white border border-slate-100 mt-1 rounded-xl shadow-xl overflow-hidden">
                    {sugerenciasFiltradas.map((p) => (
                      <button
                        key={p.id} type="button" onClick={() => seleccionarPaciente(p)}
                        className="w-full px-4 py-3 text-left hover:bg-slate-50 border-b border-slate-50 last:border-0 group"
                      >
                        <p className="text-[10px] font-bold text-slate-900 uppercase tracking-tight">{p.nombre}</p>
                        <p className="text-[8px] text-slate-400 font-bold font-mono">CI: {p.cedula}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Selección de Estudios</label>
                <select
                  value="" onChange={(e) => addTipoExamen(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none text-[11px] font-bold uppercase transition-all cursor-pointer appearance-none"
                >
                  <option value="">+ AÑADIR EXAMEN...</option>
                  {tiposExamen.map((tipo) => (
                    <option key={tipo} value={tipo} disabled={selectedTipos.includes(tipo)}>{tipo.toUpperCase()}</option>
                  ))}
                </select>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {selectedTipos.map((tipo) => (
                    <span key={tipo} className="inline-flex items-center gap-1.5 bg-slate-50 text-[9px] font-bold text-slate-600 border border-slate-100 px-2.5 py-1.5 rounded-lg uppercase tracking-tight">
                      {tipo}
                      <button type="button" onClick={() => removeTipoExamen(tipo)} className="text-slate-300 hover:text-rose-500"><X size={12} /></button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Fecha</label>
                  <input
                    type="date" value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none text-[11px] font-bold uppercase transition-all"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Estado</label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none text-[11px] font-bold uppercase transition-all cursor-pointer"
                  >
                    <option value="pendiente">PENDIENTE</option>
                    <option value="en_proceso">EN PROCESO</option>
                  </select>
                </div>
              </div>

              <button
                type="submit" disabled={selectedTipos.length === 0}
                className={`w-full py-4 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] transition-all shadow-xl ${selectedTipos.length > 0 ? "bg-slate-900 text-white shadow-slate-200" : "bg-slate-100 text-slate-300 cursor-not-allowed shadow-none"}`}
              >
                Crear Orden Médico
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}