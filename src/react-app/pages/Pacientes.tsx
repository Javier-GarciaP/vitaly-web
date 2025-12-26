import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, X, TrendingUp, Search, User, CreditCard, Calendar } from "lucide-react";
import { GraficaEvolucion } from "@/utils/GraficaEvolucion";

interface Paciente {
  id: number;
  cedula: string;
  nombre: string;
  edad?: number;
  sexo?: string;
  created_at: string;
}

export default function PacientesPage() {
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
  const [notification, setNotification] = useState("");

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
    const data = await res.json();
    setPacientes(data);
  };

  const fetchHistory = async (tipo: string) => {
    if (!selectedPaciente || !tipo) return;
    try {
      const res = await fetch(`/api/pacientes/${selectedPaciente.id}/evolucion/${tipo}`);
      const data = await res.json();
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
      edad: formData.edad ? parseInt(formData.edad) : undefined,
      sexo: formData.sexo || undefined,
    };

    const method = editingPaciente ? "PUT" : "POST";
    const url = editingPaciente ? `/api/pacientes/${editingPaciente.id}` : "/api/pacientes";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      showNotification(editingPaciente ? "Paciente actualizado" : "Paciente registrado");
      loadPacientes();
      closeModal();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este paciente?")) return;
    await fetch(`/api/pacientes/${id}`, { method: "DELETE" });
    showNotification("Paciente eliminado");
    setPacientes(prev => prev.filter(p => p.id !== id));
  };

  const openModal = (paciente?: Paciente) => {
    if (paciente) {
      setEditingPaciente(paciente);
      setFormData({
        cedula: paciente.cedula,
        nombre: paciente.nombre,
        edad: paciente.edad?.toString() || "",
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

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(""), 3000);
  };

  const filteredPacientes = pacientes.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.cedula.includes(searchTerm)
  );

  return (
    <div className="max-w-7xl mx-auto pb-20">
      {/* Header Estilizado */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Directorio Médica</h1>
          <p className="text-slate-500 mt-1 font-medium">Gestión integral de expedientes de pacientes</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nombre o CI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-sm shadow-sm"
            />
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl transition-all shadow-md hover:shadow-blue-200 active:scale-95 font-semibold"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Nuevo Registro</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl z-50 animate-bounce flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          {notification}
        </div>
      )}

      {/* Tabla Estilo Card */}
      <div className="bg-white/70 backdrop-blur-md rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Información Personal</th>
                <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Documento</th>
                <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Perfil</th>
                <th className="px-8 py-5 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredPacientes.map((paciente) => (
                <tr key={paciente.id} className="group hover:bg-blue-50/50 transition-all">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg shadow-sm group-hover:scale-110 transition-transform">
                        {paciente.nombre.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 text-base">{paciente.nombre}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar size={12}/> Registrado: {new Date(paciente.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-slate-600 font-medium">
                      <CreditCard size={16} className="text-slate-300"/>
                      {paciente.cedula}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase">
                        {paciente.sexo || "N/A"}
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold">
                        {paciente.edad ? `${paciente.edad} años` : "S/E"}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                      <button
                        onClick={() => { setSelectedPaciente(paciente); setTipoExamen(""); setEvolucionData([]); setShowGraphModal(true); }}
                        className="p-2.5 text-emerald-600 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-emerald-100 transition-all"
                        title="Evolución Clínica"
                      >
                        <TrendingUp size={18} />
                      </button>
                      <button
                        onClick={() => openModal(paciente)}
                        className="p-2.5 text-blue-600 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-blue-100 transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(paciente.id)}
                        className="p-2.5 text-red-500 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-red-100 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Registro Modernizado */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  {editingPaciente ? "Editar Paciente" : "Nuevo Registro"}
                </h2>
                <p className="text-slate-500 text-sm font-medium">Complete la ficha técnica del paciente</p>
              </div>
              <button onClick={closeModal} className="p-3 hover:bg-white rounded-2xl text-slate-400 hover:text-slate-900 shadow-sm transition-all">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1 tracking-widest">Identificación</label>
                <div className="relative">
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18}/>
                  <input
                    type="text" required value={formData.cedula}
                    onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-700 font-medium"
                    placeholder="Número de cédula"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1 tracking-widest">Nombre del Paciente</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18}/>
                  <input
                    type="text" required value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-700 font-medium"
                    placeholder="Ej. Juan Pérez"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1 tracking-widest">Edad</label>
                  <input
                    type="number" value={formData.edad}
                    onChange={(e) => setFormData({ ...formData, edad: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1 tracking-widest">Sexo biológico</label>
                  <select
                    value={formData.sexo}
                    onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Indefinido</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={closeModal} className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all">
                  Descartar
                </button>
                <button type="submit" className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all">
                  Guardar Ficha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Gráfica Mejorado */}
      {showGraphModal && selectedPaciente && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-5xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-blue-600">
              <div className="flex items-center gap-4 text-white">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                   <TrendingUp size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-black">Evolución Médica</h2>
                  <p className="opacity-80 font-medium">Paciente: {selectedPaciente.nombre}</p>
                </div>
              </div>
              <button onClick={() => setShowGraphModal(false)} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-all">
                <X size={24} />
              </button>
            </div>

            <div className="p-10 grid grid-cols-1 md:grid-cols-4 gap-8 bg-slate-50/50">
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-[0.2em]">1. Tipo de Estudio</label>
                  <select 
                    className="w-full p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
                    value={tipoExamen}
                    onChange={(e) => { setTipoExamen(e.target.value); fetchHistory(e.target.value); }}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Hematología">Hematología</option>
                    <option value="Química Sanguínea">Química Sanguínea</option>
                  </select>
                </div>

                {evolucionData.length > 0 && (
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm animate-in fade-in slide-in-from-top-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-[0.2em]">2. Parámetro Específico</label>
                    <select 
                      className="w-full p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-blue-600"
                      value={parametro}
                      onChange={(e) => setParametro(e.target.value)}
                    >
                      <option value="">Seleccionar valor...</option>
                      {Object.keys(evolucionData[0].valores).map(key => (
                        <option key={key} value={key}>{key.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="md:col-span-3 min-h-[400px] bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40 flex items-center justify-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                {parametro ? (
                  <GraficaEvolucion data={evolucionData} parametro={parametro} />
                ) : (
                  <div className="text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-slate-200">
                       <TrendingUp size={32} className="text-slate-300" />
                    </div>
                    <p className="text-slate-400 font-bold max-w-xs mx-auto">Selecciona los parámetros laterales para visualizar la curva de evolución</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}