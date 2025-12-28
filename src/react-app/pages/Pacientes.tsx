import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, X, TrendingUp, Search } from "lucide-react";
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
    <div className="max-w-6xl mx-auto px-3 sm:px-6 pb-24 pt-4 bg-slate-50/50 min-h-screen">
      {/* HEADER COMPACTO */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Pacientes</h1>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">{pacientes.length} Registros</p>
          </div>
          <button
            onClick={() => openModal()}
            className="h-11 w-11 sm:w-auto sm:px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95"
          >
            <Plus size={20} />
            <span className="hidden sm:inline font-bold">Nuevo</span>
          </button>
        </div>

        {/* BUSCADOR ESTILIZADO */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none text-sm shadow-sm"
          />
        </div>
      </div>

      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[90%] md:w-max bg-slate-900 text-white px-6 py-3 rounded-xl shadow-2xl z-[200] animate-in slide-in-from-top-5 flex items-center gap-3">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs font-bold">{notification}</span>
        </div>
      )}

      {/* VISTA DESKTOP (TABLA REFINADA) */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-separate border-spacing-0">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Paciente</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identificación</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Info</th>
              <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredPacientes.map((paciente) => (
              <tr key={paciente.id} className="hover:bg-blue-50/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                      {paciente.nombre.charAt(0)}
                    </div>
                    <span className="font-bold text-slate-700 text-sm">{paciente.nombre}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500 font-medium">{paciente.cedula}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase">{paciente.sexo || '-'}</span>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold">{paciente.edad} años</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => { setSelectedPaciente(paciente); setTipoExamen(""); setShowGraphModal(true); }} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><TrendingUp size={16}/></button>
                    <button onClick={() => openModal(paciente)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16}/></button>
                    <button onClick={() => handleDelete(paciente.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* VISTA MÓVIL (TIPO LISTA ANDROID) */}
      <div className="md:hidden space-y-2">
        {filteredPacientes.map((paciente) => (
          <div key={paciente.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group active:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
                {paciente.nombre.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 text-sm leading-tight">{paciente.nombre}</span>
                <span className="text-[11px] text-slate-500 font-medium">CI: {paciente.cedula} • {paciente.edad} años</span>
              </div>
            </div>
            
            <div className="flex gap-1">
               <button 
                onClick={() => { setSelectedPaciente(paciente); setShowGraphModal(true); }}
                className="p-2 text-emerald-600 bg-emerald-50 rounded-lg"
              >
                <TrendingUp size={18} />
              </button>
              <button 
                onClick={() => openModal(paciente)}
                className="p-2 text-blue-600 bg-blue-50 rounded-lg"
              >
                <Edit2 size={18} />
              </button>
              <button 
                onClick={() => handleDelete(paciente.id)}
                className="p-2 text-red-500 bg-red-50 rounded-lg"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL REGISTRO (DISEÑO REDUCIDO) */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-[150] p-0 sm:p-4">
          <div className="bg-white rounded-t-[2rem] sm:rounded-3xl shadow-2xl w-full max-w-md animate-in slide-in-from-bottom duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-black text-slate-900">{editingPaciente ? "Editar Paciente" : "Nuevo Paciente"}</h2>
              <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Documento de Identidad</label>
                  <input type="text" required value={formData.cedula} onChange={(e) => setFormData({ ...formData, cedula: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:border-blue-500 outline-none text-sm transition-all font-medium" placeholder="Ej: 12.345.678"/>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nombre Completo</label>
                  <input type="text" required value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:border-blue-500 outline-none text-sm transition-all font-medium" placeholder="Ej. Juan Pérez"/>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Edad</label>
                    <input type="number" value={formData.edad} onChange={(e) => setFormData({ ...formData, edad: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:border-blue-500 outline-none text-sm font-medium" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Sexo</label>
                    <select value={formData.sexo} onChange={(e) => setFormData({ ...formData, sexo: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:border-blue-500 outline-none text-sm font-medium appearance-none">
                      <option value="">N/A</option>
                      <option value="M">Masculino</option>
                      <option value="F">Femenino</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 pb-4">
                <button type="button" onClick={closeModal} className="flex-1 py-3 text-slate-500 font-bold text-sm">Cancelar</button>
                <button type="submit" className="flex-[2] py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-100 text-sm">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE GRÁFICA (FULLSCREEN MOBILE) */}
      {showGraphModal && selectedPaciente && (
        <div className="fixed inset-0 bg-white sm:bg-slate-900/60 sm:backdrop-blur-md flex items-center justify-center z-[160]">
          <div className="bg-white w-full h-full sm:h-auto sm:max-w-4xl sm:rounded-[2rem] shadow-2xl flex flex-col overflow-hidden">
            <div className="p-4 sm:p-6 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center"><TrendingUp size={18}/></div>
                <div>
                  <h2 className="text-sm font-bold truncate">Evolución: {selectedPaciente.nombre}</h2>
                  <p className="text-[10px] text-slate-400">CI: {selectedPaciente.cedula}</p>
                </div>
              </div>
              <button onClick={() => setShowGraphModal(false)} className="p-2 hover:bg-white/10 rounded-lg"><X size={20} /></button>
            </div>

            <div className="p-4 flex flex-col gap-4 flex-1 overflow-y-auto bg-slate-50">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Estudio</label>
                  <select 
                    className="w-full bg-transparent font-bold text-sm outline-none"
                    value={tipoExamen}
                    onChange={(e) => { setTipoExamen(e.target.value); fetchHistory(e.target.value); }}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Hematología">Hematología</option>
                    <option value="Química Sanguínea">Química Sanguínea</option>
                  </select>
                </div>

                {evolucionData.length > 0 && (
                  <div className="bg-white p-3 rounded-xl border border-slate-200 animate-in fade-in">
                    <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Parámetro</label>
                    <select 
                      className="w-full bg-transparent font-bold text-sm text-blue-600 outline-none"
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

              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex-1 min-h-[300px] flex items-center justify-center">
                {parametro ? (
                  <div className="w-full h-full">
                    <GraficaEvolucion data={evolucionData} parametro={parametro} />
                  </div>
                ) : (
                  <p className="text-slate-400 text-xs font-bold text-center">Seleccione los filtros para ver la gráfica</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}