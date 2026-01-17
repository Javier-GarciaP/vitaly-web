import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, X, TrendingUp, Search } from "lucide-react";
import { GraficaEvolucion } from "@/utils/GraficaEvolucion";
import { useNotification } from "@/react-app/context/NotificationContext";

interface Paciente {
  id: number;
  cedula: string;
  nombre: string;
  edad?: string;
  sexo?: string;
  created_at: string;
}

export default function PacientesPage() {
  const { showNotification, confirmAction } = useNotification();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingPaciente, setEditingPaciente] = useState<Paciente | null>(null);
  const [formData, setFormData] = useState({
    cedula: "",
    nombre: "",
    edad: "",
    sexo: "",
  });

  const [showGraphModal, setShowGraphModal] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
  const [evolucionData, setEvolucionData] = useState<any[]>([]);
  const [tipoExamen, setTipoExamen] = useState("");
  const [parametro, setParametro] = useState("");

  useEffect(() => {
    loadPacientes();
  }, []);

  const loadPacientes = async () => {
    const res = await fetch("/api/pacientes");
    const data = (await res.json()) as Paciente[];
    setPacientes(data);
  };

  const fetchHistory = async (tipo: string) => {
    if (!selectedPaciente || !tipo) return;
    try {
      const res = await fetch(
        `/api/pacientes/${selectedPaciente.id}/evolucion/${tipo}`
      );
      const data = (await res.json()) as any[];
      setEvolucionData(data);
      setParametro("");
    } catch (error) {
      console.error("Error al cargar historial", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      cedula: formData.cedula,
      nombre: formData.nombre,
      edad: formData.edad,
      sexo: formData.sexo || undefined,
    };

    const method = editingPaciente ? "PUT" : "POST";
    const url = editingPaciente
      ? `/api/pacientes/${editingPaciente.id}`
      : "/api/pacientes";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      showNotification(
        "success",
        editingPaciente ? "Paciente Actualizado" : "Paciente Registrado",
        editingPaciente ? `Los datos de ${formData.nombre} han sido actualizados` : `${formData.nombre} ha sido añadido a la base de datos`
      );
      loadPacientes();
      closeModal();
    }
  };

  const handleDelete = async (id: number) => {
    const paciente = pacientes.find(p => p.id === id);
    confirmAction({
      title: "Eliminar Paciente",
      message: `¿Estás seguro de eliminar a ${paciente?.nombre}? Esta acción borrará permanentemente su historial clínico.`,
      variant: "danger",
      onConfirm: async () => {
        await fetch(`/api/pacientes/${id}`, { method: "DELETE" });
        showNotification("delete", "Registro Eliminado", `El paciente ${paciente?.nombre || ''} ha sido removido`);
        setPacientes((prev) => prev.filter((p) => p.id !== id));
      }
    });
  };

  const openModal = (paciente?: Paciente) => {
    if (paciente) {
      setEditingPaciente(paciente);
      setFormData({
        cedula: paciente.cedula,
        nombre: paciente.nombre,
        edad: paciente.edad || "",
        sexo: paciente.sexo || "",
      });
    } else {
      setEditingPaciente(null);
      setFormData({ cedula: "", nombre: "", edad: "", sexo: "" });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPaciente(null);
  };

  const filteredPacientes = pacientes.filter(
    (p) =>
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.cedula.includes(searchTerm)
  );

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 pb-24 pt-4 bg-slate-50/50 min-h-screen">
      {/* TOP HEADER */}
      <div className="flex items-end justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h1 className="text-sm font-bold text-slate-900 uppercase tracking-[0.2em]">Pacientes</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1">
            {pacientes.length} registros en base de datos
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="text-[10px] font-bold uppercase text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={14} /> Registrar Nuevo
        </button>
      </div>

      {/* BUSCADOR MINIMALISTA */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
        <input
          type="text"
          placeholder="BUSCAR POR NOMBRE O CÉDULA..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-100 rounded-xl focus:border-slate-300 outline-none text-[11px] font-bold uppercase tracking-wide transition-all placeholder:text-slate-300 shadow-sm"
        />
      </div>

      <div className="hidden md:block bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              <th className="px-6 py-4">Paciente</th>
              <th className="px-6 py-4">Identificación</th>
              <th className="px-6 py-4">Info</th>
              <th className="px-6 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredPacientes.map((paciente) => (
              <tr key={paciente.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center font-bold text-xs border border-slate-100">
                      {paciente.nombre.charAt(0)}
                    </div>
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">
                      {paciente.nombre}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-[11px] text-slate-500 font-bold font-mono">
                  {paciente.cedula}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-1.5">
                    <span className="px-2 py-0.5 bg-slate-50 text-slate-400 rounded text-[9px] font-bold uppercase border border-slate-100">
                      {paciente.sexo || "N/A"}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded text-[9px] font-bold border border-slate-100">
                      {paciente.edad}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => { setSelectedPaciente(paciente); setTipoExamen(""); setShowGraphModal(true); }}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 transition-colors"
                    >
                      <TrendingUp size={14} />
                    </button>
                    <button
                      onClick={() => openModal(paciente)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(paciente.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* VISTA MÓVIL (TIPO LISTA ANDROID) */}
      <div className="md:hidden space-y-3">
        {filteredPacientes.map((paciente) => (
          <div key={paciente.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 border border-slate-100 flex items-center justify-center font-bold text-xs uppercase">
                  {paciente.nombre.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-[11px] uppercase tracking-tight">{paciente.nombre}</p>
                  <p className="text-[9px] text-slate-400 font-bold font-mono">CI: {paciente.cedula}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setSelectedPaciente(paciente); setShowGraphModal(true); }} className="p-2 text-slate-400 active:text-emerald-500 transition-colors"><TrendingUp size={16} /></button>
                <button onClick={() => openModal(paciente)} className="p-2 text-slate-400 active:text-blue-500 transition-colors"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(paciente.id)} className="p-2 text-slate-400 active:text-rose-500 transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="px-2 py-0.5 bg-slate-50 text-[9px] font-bold text-slate-400 uppercase rounded border border-slate-100">{paciente.sexo || "N/A"}</span>
              <span className="px-2 py-0.5 bg-slate-50 text-[9px] font-bold text-slate-500 uppercase rounded border border-slate-100">{paciente.edad}</span>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL REGISTRO/EDICIÓN */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/10 backdrop-blur-sm z-[300] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-slate-50">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-[12px] font-black uppercase tracking-[0.3em] text-slate-900">
                {editingPaciente ? "Editar Paciente" : "Nuevo Registro"}
              </h2>
              <button onClick={closeModal} className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 block mx-1">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-slate-300 transition-all text-xs font-bold uppercase tracking-wide"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 block mx-1">Cédula</label>
                    <input
                      type="text"
                      required
                      value={formData.cedula}
                      onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-slate-300 transition-all text-xs font-bold font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 block mx-1">Edad</label>
                    <input
                      type="text"
                      required
                      value={formData.edad}
                      onChange={(e) => setFormData({ ...formData, edad: e.target.value })}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-slate-300 transition-all text-xs font-bold uppercase"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 block mx-1">Sexo (Obligatorio)</label>
                  <select
                    required
                    value={formData.sexo}
                    onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-slate-300 transition-all text-xs font-bold uppercase tracking-wide appearance-none cursor-pointer"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all active:scale-[0.98]"
                >
                  {editingPaciente ? "Actualizar Datos" : "Confirmar Registro"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EVOLUCIÓN */}
      {showGraphModal && selectedPaciente && (
        <div className="fixed inset-0 bg-slate-900/10 backdrop-blur-sm z-[300] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl rounded-[3rem] p-8 shadow-2xl border border-slate-50 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-8 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h2 className="text-[12px] font-black uppercase tracking-[0.3em] text-slate-900 leading-none mb-1">Evolución Clínica</h2>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{selectedPaciente.nombre}</p>
                </div>
              </div>
              <button onClick={() => setShowGraphModal(false)} className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex gap-4 mb-6 shrink-0">
              <select
                className="flex-1 px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-[10px] font-black uppercase tracking-widest"
                value={tipoExamen || ""}
                onChange={(e) => {
                  setTipoExamen(e.target.value);
                  fetchHistory(e.target.value);
                }}
              >
                <option value="">Seleccionar Tipo...</option>
                <option value="Hematología">Hematología</option>
                <option value="Química Clínica">Química Clínica</option>
                <option value="Coagulación">Coagulación</option>
              </select>

              <select
                className="flex-1 px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-[10px] font-black uppercase tracking-widest"
                value={parametro || ""}
                onChange={(e) => setParametro(e.target.value)}
                disabled={!evolucionData.length}
              >
                <option value="">Seleccionar Parámetro...</option>
                {evolucionData.length > 0 &&
                  Object.keys(evolucionData[0].resultados || {}).map((key) => (
                    <option key={key} value={key}>
                      {key.toUpperCase()}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex-1 min-h-[300px] border border-slate-50 rounded-[2rem] bg-slate-50/30 p-8 overflow-hidden">
              {tipoExamen && parametro ? (
                <GraficaEvolucion data={evolucionData} parametro={parametro} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-300">
                  <TrendingUp size={48} strokeWidth={1} className="mb-4 opacity-20" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] italic">Seleccione tipo y parámetro</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
