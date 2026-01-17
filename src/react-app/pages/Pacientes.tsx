import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, X, TrendingUp, Search } from "lucide-react";
import { GraficaEvolucion } from "@/utils/GraficaEvolucion";

interface Paciente {
  id: number;
  cedula: string;
  nombre: string;
  edad?: string;
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
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(
    null
  );
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
        editingPaciente ? "Paciente actualizado" : "Paciente registrado"
      );
      loadPacientes();
      closeModal();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este paciente?")) return;
    await fetch(`/api/pacientes/${id}`, { method: "DELETE" });
    showNotification("Paciente eliminado");
    setPacientes((prev) => prev.filter((p) => p.id !== id));
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

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(""), 3000);
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

      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[90%] md:w-max bg-slate-900 text-white px-6 py-3 rounded-xl shadow-lg z-[200] animate-slide-in flex items-center gap-3">
          <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
          <span className="text-sm font-semibold">{notification}</span>
        </div>
      )}

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

      {/* MODAL REGISTRO - Minimalista */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/10 backdrop-blur-sm flex items-center justify-center z-[150] p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                {editingPaciente ? "Edición de Paciente" : "Nuevo Registro"}
              </p>
              <button onClick={closeModal} className="text-slate-300 hover:text-slate-900 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-4">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Identificación</label>
                  <input
                    type="text" required value={formData.cedula}
                    onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-slate-400 outline-none text-[11px] font-bold uppercase tracking-tight transition-all"
                    placeholder="Documento..."
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Nombre Apellido</label>
                  <input
                    type="text" required value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-slate-400 outline-none text-[11px] font-bold uppercase tracking-tight transition-all"
                    placeholder="Nombre completo..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Edad</label>
                    <input
                      type="text" value={formData.edad}
                      onChange={(e) => setFormData({ ...formData, edad: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-slate-400 outline-none text-[11px] font-bold transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Sexo</label>
                    <select
                      required
                      value={formData.sexo}
                      onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-slate-400 outline-none text-[11px] font-bold appearance-none transition-all cursor-pointer"
                    >
                      <option value="">- SELECCIONAR -</option>
                      <option value="M">MASCULINO</option>
                      <option value="F">FEMENINO</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 py-3 bg-slate-900 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded-xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
                  Guardar Cambios
                </button>
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
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-bold truncate">
                    Evolución: {selectedPaciente.nombre}
                  </h2>
                  <p className="text-[10px] text-slate-400">
                    CI: {selectedPaciente.cedula}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGraphModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 flex flex-col gap-4 flex-1 overflow-y-auto bg-slate-50">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">
                    Estudio
                  </label>
                  <select
                    className="w-full bg-transparent font-bold text-sm outline-none"
                    value={tipoExamen}
                    onChange={(e) => {
                      setTipoExamen(e.target.value);
                      fetchHistory(e.target.value);
                    }}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Hematología">Hematología</option>
                    <option value="Química Sanguínea">Química Sanguínea</option>
                  </select>
                </div>

                {evolucionData.length > 0 && (
                  <div className="bg-white p-3 rounded-xl border border-slate-200 animate-in fade-in">
                    <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">
                      Parámetro
                    </label>
                    <select
                      className="w-full bg-transparent font-bold text-sm text-blue-600 outline-none"
                      value={parametro}
                      onChange={(e) => setParametro(e.target.value)}
                    >
                      <option value="">Seleccionar...</option>
                      {Object.keys(evolucionData[0].valores).map((key) => (
                        <option key={key} value={key}>
                          {key.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex-1 min-h-[300px] flex items-center justify-center">
                {parametro ? (
                  <div className="w-full h-full">
                    <GraficaEvolucion
                      data={evolucionData}
                      parametro={parametro}
                    />
                  </div>
                ) : (
                  <p className="text-slate-400 text-xs font-bold text-center">
                    Seleccione los filtros para ver la gráfica
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
