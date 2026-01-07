import { useEffect, useState } from "react";
import {
  Settings,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Layout,
  DollarSign,
  Search,
  Beaker,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface ExamenPredefinido {
  id: number;
  nombre: string;
  precio: number;
  categoria: string;
}

interface ValorReferencia {
  id: number;
  nombre_examen: string;
  valor_referencia: string;
  originalValue?: string; // Para comparar cambios
}

export default function ConfiguracionPage() {
  // Estados para Exámenes
  const [examenes, setExamenes] = useState<ExamenPredefinido[]>([]);
  const [_loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExamen, setEditingExamen] = useState<ExamenPredefinido | null>(
    null
  );
  const [formData, setFormData] = useState({
    nombre: "",
    precio: "",
    categoria: "Hematología",
  });

  // Estados para Valores de Referencia
  const [seccionActiva, setSeccionActiva] = useState<
    "quimica" | "hematologia" | "coagulacion"
  >("quimica");
  const [valoresRef, setValoresRef] = useState<ValorReferencia[]>([]);
  const [savingRef, setSavingRef] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  // Estado para Footer
  const [footerText, setFooterText] = useState(
    "© 2024 Laboratorio Clínico - Todos los derechos reservados"
  );

  useEffect(() => {
    loadExamenes();
    loadValoresReferencia();
  }, [seccionActiva]);

  // --- LÓGICA DE EXÁMENES ---
  const loadExamenes = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/examenes-predefinidos");
      // AQUÍ: Le decimos a TS que confíe en que esto es un array de ExamenPredefinido
      const data = (await res.json()) as ExamenPredefinido[];
      setExamenes(data);
    } catch (error) {
      console.error("Error cargando exámenes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitExamen = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingExamen
      ? `/api/examenes-predefinidos/${editingExamen.id}`
      : "/api/examenes-predefinidos";
    try {
      const res = await fetch(url, {
        method: editingExamen ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          precio: parseFloat(formData.precio),
        }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        loadExamenes();
      }
    } catch (error) {
      alert("Error al guardar");
    }
  };

  const deleteExamen = async (id: number) => {
    if (!confirm("¿Eliminar este examen?")) return;
    await fetch(`/api/examenes-predefinidos/${id}`, { method: "DELETE" });
    loadExamenes();
  };

  // --- LÓGICA DE VALORES DE REFERENCIA ---
  const loadValoresReferencia = async () => {
    try {
      const res = await fetch(`/api/valores-referencia?tabla=${seccionActiva}`);
      // Tipamos la respuesta como un array de la interfaz ValorReferencia que definimos arriba
      const data = (await res.json()) as ValorReferencia[];

      const mappedData = data.map((item) => ({
        ...item,
        originalValue: item.valor_referencia,
      }));
      setValoresRef(mappedData);
    } catch (error) {
      console.error("Error cargando valores de referencia:", error);
    }
  };

  const handleRefChange = (id: number, newValue: string) => {
    setValoresRef((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, valor_referencia: newValue } : item
      )
    );
  };

  const saveAllValoresRef = async () => {
    setSavingRef(true);
    try {
      const res = await fetch(
        `/api/valores-referencia?tabla=${seccionActiva}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ valores: valoresRef }),
        }
      );
      if (res.ok) {
        setSuccessMsg(true);
        setTimeout(() => setSuccessMsg(false), 3000);
        loadValoresReferencia();
      }
    } catch (error) {
      alert("Error al actualizar valores");
    }
    setSavingRef(false);
  };

  const filteredExamenes = examenes.filter(
    (ex) =>
      ex.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-200">
              <Settings size={20} strokeWidth={3} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Panel de Configuración
            </h1>
          </div>
          <p className="text-sm text-slate-500 font-medium ml-12">
            Control total sobre baremos, valores y sistema
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* COLUMNA IZQUIERDA: CATÁLOGO Y FOOTER */}
        <div className="xl:col-span-7 space-y-6">
          {/* TABLA DE EXÁMENES */}
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                  <DollarSign size={18} className="text-blue-500" /> Catálogo de
                  Precios
                </h2>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={14}
                  />
                  <input
                    type="text"
                    placeholder="Buscar examen..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/5 outline-none font-bold text-xs transition-all"
                  />
                </div>
                <button
                  onClick={() => {
                    setEditingExamen(null);
                    setFormData({
                      nombre: "",
                      precio: "",
                      categoria: "Hematología",
                    });
                    setIsModalOpen(true);
                  }}
                  className="bg-slate-900 text-white px-4 py-2 rounded-xl font-black text-[10px] hover:bg-blue-600 transition-all flex items-center gap-2 shadow-xl shadow-slate-200 uppercase tracking-widest"
                >
                  <Plus size={14} strokeWidth={3} /> Nuevo
                </button>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[500px] custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur-md">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Examen
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Categoría
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                      Precio
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredExamenes.map((ex) => (
                    <tr
                      key={ex.id}
                      className="hover:bg-blue-50/30 transition-colors group"
                    >
                      <td className="px-6 py-4 font-bold text-slate-700 text-xs">
                        {ex.nombre}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-white border border-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase">
                          {ex.categoria}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-blue-600 text-xs">
                        ${ex.precio.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditingExamen(ex);
                              setFormData({
                                nombre: ex.nombre,
                                precio: ex.precio.toString(),
                                categoria: ex.categoria,
                              });
                              setIsModalOpen(true);
                            }}
                            className="p-2 text-slate-400 hover:text-blue-600 transition-all"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => deleteExamen(ex.id)}
                            className="p-2 text-slate-400 hover:text-red-600 transition-all"
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
          </div>

          {/* CONFIGURACIÓN DEL FOOTER */}
          <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-slate-800 border-b border-slate-50 pb-4">
              <Layout size={18} className="text-indigo-500" />
              <h2 className="text-sm font-black uppercase tracking-tight">
                Pie de Página (Reportes)
              </h2>
            </div>
            <div className="flex gap-4">
              <textarea
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
                className="flex-1 p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all text-xs font-bold text-slate-600 h-20 resize-none"
                placeholder="Texto legal o de contacto..."
              />
              <button className="px-6 bg-slate-900 text-white rounded-2xl font-black text-[10px] hover:bg-indigo-600 transition-all flex flex-col items-center justify-center gap-2 uppercase tracking-tighter">
                <Save size={18} /> Guardar
              </button>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: VALORES DE REFERENCIA (SISTEMA DINÁMICO) */}
        <div className="xl:col-span-5">
          <div className="bg-white rounded-[2rem] border border-slate-900 shadow-xl overflow-hidden flex flex-col h-full min-h-[700px]">
            <div className="p-6 bg-slate-900 text-white">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                    <Beaker size={20} className="text-blue-400" /> Valores de
                    Referencia
                  </h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                    Configuración técnica de resultados
                  </p>
                </div>
                {successMsg && (
                  <div className="flex items-center gap-2 bg-green-500 text-white px-3 py-1 rounded-full text-[10px] font-black animate-bounce">
                    <CheckCircle2 size={12} /> ACTUALIZADO
                  </div>
                )}
              </div>

              {/* SELECTOR DE TABLA */}
              <div className="flex p-1 bg-slate-800 rounded-xl">
                {(["quimica", "hematologia", "coagulacion"] as const).map(
                  (tab) => (
                    <button
                      key={tab}
                      onClick={() => setSeccionActiva(tab)}
                      className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${
                        seccionActiva === tab
                          ? "bg-blue-600 text-white shadow-lg"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {tab}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
              {valoresRef.map((item) => {
                const isModified = item.valor_referencia !== item.originalValue;
                return (
                  <div key={item.id} className="space-y-1 group">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1 flex justify-between">
                      {item.nombre_examen}
                      {isModified && (
                        <span className="text-blue-500 flex items-center gap-1">
                          <AlertCircle size={8} /> Pendiente
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={item.valor_referencia}
                      onChange={(e) => handleRefChange(item.id, e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold transition-all outline-none border-2 ${
                        isModified
                          ? "border-blue-500 bg-white ring-4 ring-blue-500/10 shadow-inner"
                          : "border-slate-100 bg-slate-50 focus:bg-white focus:border-slate-300"
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100">
              <button
                onClick={saveAllValoresRef}
                disabled={savingRef}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {savingRef ? (
                  "PROCESANDO..."
                ) : (
                  <>
                    <Save size={18} /> ACTUALIZAR TODOS LOS VALORES
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE EXÁMENES */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                {editingExamen ? "Editar Examen" : "Nuevo Registro"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white transition-colors text-slate-400"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitExamen} className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Nombre del Examen
                </label>
                <input
                  required
                  type="text"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/5 outline-none font-bold text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Categoría
                  </label>
                  <select
                    value={formData.categoria}
                    onChange={(e) =>
                      setFormData({ ...formData, categoria: e.target.value })
                    }
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/5 outline-none font-bold text-xs appearance-none"
                  >
                    {[
                      "Hematología",
                      "Química Clínica",
                      "Heces",
                      "Orina",
                      "Coagulación",
                      "Bacteriología",
                      "Misceláneos",
                    ].map((cat) => (
                      <option key={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Precio ($)
                  </label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={formData.precio}
                    onChange={(e) =>
                      setFormData({ ...formData, precio: e.target.value })
                    }
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/5 outline-none font-bold text-xs text-blue-600"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all uppercase tracking-widest"
                >
                  {editingExamen ? "Actualizar Cambios" : "Crear Examen"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
}
