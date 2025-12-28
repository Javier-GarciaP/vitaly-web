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
      const res = await fetch(`/api/examenes-predefinidos/${id}`, { method: "DELETE" });
      if (res.ok) loadExamenes();
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  const filteredExamenes = examenes.filter((ex) => {
    const term = searchTerm.toLowerCase();
    return (
      ex.nombre.toLowerCase().includes(term) || 
      ex.categoria.toLowerCase().includes(term)
    );
  });

  return (
    <div className="w-full space-y-4 md:space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* HEADER: Más compacto */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="text-blue-600" size={24} />
            Configuración del Sistema
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium">Gestiona catálogos y preferencias del laboratorio</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        
        {/* COLUMNA IZQUIERDA: FOOTER (4 columnas de 12) */}
        <div className="lg:col-span-4 space-y-4 md:space-y-6">
          <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-slate-800 border-b border-slate-50 pb-3">
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Layout size={16} /></div>
              <h2 className="text-sm font-bold tracking-tight">Reportes y Portadas</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5 ml-1">Texto del Footer</label>
                <textarea 
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-xs font-medium resize-none h-24"
                  placeholder="Escribe el pie de página aquí..."
                />
              </div>
              <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-sm">
                <Save size={14} /> GUARDAR CAMBIOS
              </button>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: EXÁMENES (8 columnas de 12) */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 md:p-5 border-b border-slate-100 bg-slate-50/30 flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div>
                <h2 className="text-sm md:text-base font-black text-slate-800 tracking-tight leading-none">Catálogo de Exámenes</h2>
                <p className="text-[10px] md:text-xs text-slate-400 mt-1 italic">Nombres y precios base para facturación</p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input 
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none font-medium text-xs transition-all"
                  />
                </div>
                <button 
                  onClick={() => {
                    setEditingExamen(null);
                    setFormData({ nombre: "", precio: "", categoria: "Hematología" });
                    setIsModalOpen(true);
                  }}
                  className="bg-blue-600 text-white p-2 sm:px-4 sm:py-2 rounded-lg font-bold text-xs hover:bg-blue-700 transition-all flex items-center gap-2 shrink-0"
                >
                  <Plus size={16} /> <span className="hidden sm:inline">AGREGAR</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto overflow-y-auto max-h-[600px] custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead className="sticky top-0 z-10 bg-white">
                  <tr className="border-b border-slate-100">
                    <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Examen</th>
                    <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoría</th>
                    <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Precio</th>
                    <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredExamenes.length > 0 ? (
                    filteredExamenes.map((ex) => (
                      <tr key={ex.id} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="px-5 py-3 font-bold text-slate-700 text-xs">{ex.nombre}</td>
                        <td className="px-5 py-3">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[9px] font-black uppercase tracking-tight">
                            {ex.categoria}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right font-black text-blue-600 text-xs">${ex.precio.toFixed(2)}</td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex justify-end gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => {
                                setEditingExamen(ex);
                                setFormData({ nombre: ex.nombre, precio: ex.precio.toString(), categoria: ex.categoria });
                                setIsModalOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button 
                              onClick={() => deleteExamen(ex.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    !loading && (
                      <tr>
                        <td colSpan={4} className="p-10 text-center text-slate-400 font-medium italic text-xs">
                          No se encontraron resultados
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
              {loading && <div className="p-10 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px] animate-pulse">Cargando...</div>}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: Mucho más pequeño y estilizado */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                {editingExamen ? "Editar Examen" : "Nuevo Registro"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={18} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                  <FlaskConical size={10} /> Nombre
                </label>
                <input 
                  required
                  type="text" 
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none font-bold text-xs"
                  placeholder="Nombre del examen"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                    <Tag size={10} /> Categoría
                  </label>
                  <select 
                    value={formData.categoria}
                    onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none font-bold text-xs cursor-pointer appearance-none"
                  >
                    <option>Hematología</option>
                    <option>Química Clínica</option>
                    <option>Heces</option>
                    <option>Orina</option>
                    <option>Coagulación</option>
                    <option>Bacteriología</option>
                    <option>Misceláneos</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                    <DollarSign size={10} /> Precio
                  </label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    value={formData.precio}
                    onChange={(e) => setFormData({...formData, precio: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none font-bold text-xs"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 font-bold text-xs text-slate-400 uppercase tracking-wider"
                >
                  Cerrar
                </button>
                <button 
                  type="submit"
                  className="flex-[2] py-2.5 bg-blue-600 text-white rounded-lg font-bold text-xs shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all uppercase tracking-wider"
                >
                  {editingExamen ? "Actualizar" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}