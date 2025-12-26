import { useEffect, useState } from "react";
import { 
  Settings, 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  Layout, 
  FlaskConical,
  DollarSign,
  Tag,
  Search
} from "lucide-react";

interface ExamenPredefinido {
  id: number;
  nombre: string;
  precio: number;
  categoria: string;
}

export default function ConfiguracionPage() {
  const [examenes, setExamenes] = useState<ExamenPredefinido[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [footerText, setFooterText] = useState("© 2024 Laboratorio Clínico - Todos los derechos reservados");
  
  // Estado para Modal/Formulario
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExamen, setEditingExamen] = useState<ExamenPredefinido | null>(null);
  const [formData, setFormData] = useState({ nombre: "", precio: "", categoria: "Hematología" });

  useEffect(() => {
    loadExamenes();
  }, []);

  const loadExamenes = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/examenes-predefinidos");
      const data = await res.json() as ExamenPredefinido[];
      setExamenes(data);
    } catch (error) {
      console.error("Error cargando exámenes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingExamen 
      ? `/api/examenes-predefinidos/${editingExamen.id}` 
      : "/api/examenes-predefinidos";
    
    const method = editingExamen ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          precio: parseFloat(formData.precio)
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setEditingExamen(null);
        setFormData({ nombre: "", precio: "", categoria: "Hematología" });
        loadExamenes();
      }
    } catch (error) {
      alert("Error de conexión al guardar");
    }
  };

  const deleteExamen = async (id: number) => {
    if (!confirm("¿Eliminar este examen permanentemente?")) return;
    
    try {
      const res = await fetch(`/api/examenes-predefinidos/${id}`, { 
        method: "DELETE" 
      });
      
      if (res.ok) {
        loadExamenes();
      } else {
        alert("No se pudo eliminar el registro. Verifica que el ID existe.");
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("Error de red al intentar eliminar");
    }
  };

  // Lógica de búsqueda filtrada
  const filteredExamenes = examenes.filter((ex) => {
    const term = searchTerm.toLowerCase();
    return (
      ex.nombre.toLowerCase().includes(term) || 
      ex.categoria.toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Settings className="text-blue-600" size={32} />
            Configuración del Sistema
          </h1>
          <p className="text-slate-500 font-medium">Gestiona catálogos y preferencias visuales</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: FOOTER Y GENERAL */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6 text-slate-800">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Layout size={20} /></div>
              <h2 className="font-black tracking-tight">Reportes y Portadas</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Texto del Footer</label>
                <textarea 
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value)}
                  className="w-full mt-2 p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-medium resize-none h-32"
                />
              </div>
              <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                <Save size={18} /> GUARDAR PREFERENCIAS
              </button>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: EXÁMENES PREDEFINIDOS */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">Catálogo de Exámenes</h2>
                <p className="text-sm text-slate-400">Define nombres y precios base</p>
              </div>

              {/* BARRA DE BÚSQUEDA */}
              <div className="relative flex-1 max-w-sm w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text"
                  placeholder="Buscar examen o categoría..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-medium text-sm transition-all"
                />
              </div>

              <button 
                onClick={() => {
                  setEditingExamen(null);
                  setFormData({ nombre: "", precio: "", categoria: "Hematología" });
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
              >
                <Plus size={18} /> AGREGAR
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Examen</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoría</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Precio</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredExamenes.length > 0 ? (
                    filteredExamenes.map((ex) => (
                      <tr key={ex.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-8 py-4 font-bold text-slate-700">{ex.nombre}</td>
                        <td className="px-8 py-4">
                          <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-tighter">
                            {ex.categoria}
                          </span>
                        </td>
                        <td className="px-8 py-4 text-right font-black text-blue-600">${ex.precio.toFixed(2)}</td>
                        <td className="px-8 py-4 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => {
                                setEditingExamen(ex);
                                setFormData({ nombre: ex.nombre, precio: ex.precio.toString(), categoria: ex.categoria });
                                setIsModalOpen(true);
                              }}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => deleteExamen(ex.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    !loading && (
                      <tr>
                        <td colSpan={4} className="p-12 text-center text-slate-400 font-medium italic">
                          No se encontraron resultados para "{searchTerm}"
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
              {loading && <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Cargando catálogo...</div>}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL FORMULARIO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-800">
                {editingExamen ? "Editar Examen" : "Nuevo Examen"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-1">
                  <FlaskConical size={12} /> Nombre del Examen
                </label>
                <input 
                  required
                  type="text" 
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-bold"
                  placeholder="Ej: Perfil Hepático"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-1">
                    <Tag size={12} /> Categoría
                  </label>
                  <select 
                    value={formData.categoria}
                    onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-bold appearance-none cursor-pointer"
                  >
                    <option>Hematología</option>
                    <option>Química Clínica</option>
                    <option>Heces</option>
                    <option>Orina</option>
                    <option>Coagulación</option>
                    <option>Grupo Sanguíneo</option>
                    <option>Bacteriología</option>
                    <option>Misceláneos</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-1">
                    <DollarSign size={12} /> Precio
                  </label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    value={formData.precio}
                    onChange={(e) => setFormData({...formData, precio: e.target.value})}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-bold"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 font-black text-sm text-slate-400 uppercase tracking-widest"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all uppercase tracking-widest"
                >
                  {editingExamen ? "Actualizar" : "Crear Examen"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}