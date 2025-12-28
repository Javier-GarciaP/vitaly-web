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
    const data = await res.json() as Paciente[];
    setPacientes(data);
  };

  const fetchHistory = async (tipo: string) => {
    if (!selectedPaciente || !tipo) return;
    try {
      const res = await fetch(`/api/pacientes/${selectedPaciente.id}/evolucion/${tipo}`);
      const data = await res.json() as any[];
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-6">
      {/* Header Responsivo */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Directorio Médico</h1>
          <p className="text-slate-500 mt-1 font-medium">Gestión integral de expedientes</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar nombre o CI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-base shadow-sm"
            />
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-2xl transition-all shadow-lg shadow-blue-200 active:scale-95 font-bold"
          >
            <Plus size={20} />
            <span>Nuevo Registro</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="fixed bottom-6 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-max bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl z-[110] animate-in slide-in-from-bottom-10 flex items-center gap-3">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm font-bold">{notification}</span>
        </div>
      )}

      {/* --- VISTA DE ESCRITORIO (TABLA) --- */}
      <div className="hidden md:block bg-white/70 backdrop-blur-md rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
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
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg shadow-sm">
                      {paciente.nombre.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-base">{paciente.nombre}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar size={12}/> {new Date(paciente.created_at).toLocaleDateString()}
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
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase">{paciente.sexo || "N/A"}</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold">{paciente.edad} años</span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                    <button onClick={() => { setSelectedPaciente(paciente); setTipoExamen(""); setEvolucionData([]); setShowGraphModal(true); }} className="p-2.5 text-emerald-600 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-emerald-100 transition-all" title="Evolución"><TrendingUp size={18} /></button>
                    <button onClick={() => openModal(paciente)} className="p-2.5 text-blue-600 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-blue-100 transition-all"><Edit2 size={18} /></button>
                    <button onClick={() => handleDelete(paciente.id)} className="p-2.5 text-red-500 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-red-100 transition-all"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- VISTA MÓVIL (CARDS) --- */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {filteredPacientes.map((paciente) => (
          <div key={paciente.id} className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm active:scale-[0.98] transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-100">
                {paciente.nombre.charAt(0)}
              </div>
              <div className="flex-1 overflow-hidden">
                <h3 className="font-bold text-slate-900 text-lg truncate">{paciente.nombre}</h3>
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <CreditCard size={14} />
                  <span>{paciente.cedula}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 mb-5">
              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-black uppercase tracking-wider">
                {paciente.sexo || "S/E"}
              </span>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-black uppercase tracking-wider">
                {paciente.edad ? `${paciente.edad} Años` : "S/E"}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-50">
              <button 
                onClick={() => { setSelectedPaciente(paciente); setShowGraphModal(true); }}
                className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-emerald-50 text-emerald-600 transition-colors"
              >
                <div className="p-2 bg-emerald-50 rounded-xl"><TrendingUp size={20} /></div>
                <span className="text-[10px] font-bold uppercase tracking-tighter">Evolución</span>
              </button>
              <button 
                onClick={() => openModal(paciente)}
                className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-blue-50 text-blue-600 transition-colors"
              >
                <div className="p-2 bg-blue-50 rounded-xl"><Edit2 size={20} /></div>
                <span className="text-[10px] font-bold uppercase tracking-tighter">Editar</span>
              </button>
              <button 
                onClick={() => handleDelete(paciente.id)}
                className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-red-50 text-red-500 transition-colors"
              >
                <div className="p-2 bg-red-50 rounded-xl"><Trash2 size={20} /></div>
                <span className="text-[10px] font-bold uppercase tracking-tighter">Eliminar</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* --- MODAL DE REGISTRO --- */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[150] p-0 sm:p-4">
          <div className="bg-white rounded-t-[3rem] sm:rounded-[2.5rem] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
            <div className="sticky top-0 bg-white/80 backdrop-blur-md p-6 sm:p-8 border-b border-slate-50 flex justify-between items-center z-10">
              <div>
                <h2 className="text-2xl font-black text-slate-900">{editingPaciente ? "Editar Paciente" : "Nuevo Registro"}</h2>
                <p className="text-slate-500 text-sm font-medium">Complete los datos de la ficha</p>
              </div>
              <button onClick={closeModal} className="p-3 hover:bg-slate-100 rounded-full text-slate-400 transition-all"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5 pb-12 sm:pb-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Identificación</label>
                <div className="relative">
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18}/>
                  <input type="text" required value={formData.cedula} onChange={(e) => setFormData({ ...formData, cedula: e.target.value })} className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 transition-all font-medium" placeholder="Cédula de identidad"/>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Nombre Completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18}/>
                  <input type="text" required value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 transition-all font-medium" placeholder="Ej. Mariana González"/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Edad</label>
                  <input type="number" value={formData.edad} onChange={(e) => setFormData({ ...formData, edad: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 transition-all font-medium" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Sexo</label>
                  <select value={formData.sexo} onChange={(e) => setFormData({ ...formData, sexo: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 transition-all font-medium appearance-none">
                    <option value="">Indefinido</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button type="submit" className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-100 order-1 sm:order-2">Guardar Ficha</button>
                <button type="button" onClick={closeModal} className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl order-2 sm:order-1">Descartar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL DE GRÁFICA --- */}
      {showGraphModal && selectedPaciente && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center z-[150] p-0 sm:p-4">
          <div className="bg-white w-full h-full sm:h-auto sm:max-w-5xl sm:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden">
            <div className="p-6 sm:p-8 bg-blue-600 text-white flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-2xl hidden sm:block"><TrendingUp size={28} /></div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black truncate max-w-[200px] sm:max-w-none">Evolución: {selectedPaciente.nombre}</h2>
                  <p className="text-blue-100 text-sm font-medium">CI: {selectedPaciente.cedula}</p>
                </div>
              </div>
              <button onClick={() => setShowGraphModal(false)} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"><X size={24} /></button>
            </div>

            <div className="p-4 sm:p-10 flex flex-col md:grid md:grid-cols-4 gap-6 bg-slate-50/50 flex-1 overflow-y-auto">
              <div className="md:col-span-1 space-y-4">
                <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">1. Tipo de Estudio</label>
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
                  <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm animate-in fade-in">
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">2. Parámetro</label>
                    <select 
                      className="w-full p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-blue-600"
                      value={parametro}
                      onChange={(e) => setParametro(e.target.value)}
                    >
                      <option value="">Seleccionar...</option>
                      {Object.keys(evolucionData[0].valores).map(key => (
                        <option key={key} value={key}>{key.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="md:col-span-3 min-h-[350px] bg-white rounded-[2.5rem] p-4 sm:p-8 border border-slate-100 shadow-xl flex items-center justify-center relative">
                {parametro ? (
                  <div className="w-full h-full min-h-[300px]">
                    <GraficaEvolucion data={evolucionData} parametro={parametro} />
                  </div>
                ) : (
                  <div className="text-center px-6">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-slate-200 text-slate-300 italic font-black">?</div>
                    <p className="text-slate-400 font-bold text-sm max-w-[200px] mx-auto">Selecciona estudio y parámetro para visualizar</p>
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