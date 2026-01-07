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
  ChevronRight,
  ShieldCheck,
  ClipboardList,
  Sliders
} from "lucide-react";

// --- INTERFACES ---
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
  originalValue?: string;
}

type TabActiva = "catalogo" | "parametros" | "apariencia";

export default function ConfiguracionPage() {
  // --- ESTADOS DE NAVEGACIÓN ---
  const [tabActiva, setTabActiva] = useState<TabActiva>("catalogo");

  // --- ESTADOS DE EXÁMENES ---
  const [examenes, setExamenes] = useState<ExamenPredefinido[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isExamenModalOpen, setIsExamenModalOpen] = useState(false);
  const [editingExamen, setEditingExamen] = useState<ExamenPredefinido | null>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    precio: "",
    categoria: "Hematología",
  });

  // --- ESTADOS DE VALORES DE REFERENCIA ---
  const [seccionActiva, setSeccionActiva] = useState<"quimica" | "hematologia" | "coagulacion">("quimica");
  const [valoresRef, setValoresRef] = useState<ValorReferencia[]>([]);
  const [savingRef, setSavingRef] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  // --- ESTADOS DE APARIENCIA ---
  const [footerText, setFooterText] = useState("© 2024 Laboratorio Clínico - Todos los derechos reservados");

  // --- EFECTOS ---
  useEffect(() => {
    if (tabActiva === "catalogo") loadExamenes();
    if (tabActiva === "parametros") loadValoresReferencia();
  }, [tabActiva, seccionActiva]);

  // --- LÓGICA DE EXÁMENES ---
  const loadExamenes = async () => {
    try {
      const res = await fetch("/api/examenes-predefinidos");
      const data = (await res.json()) as ExamenPredefinido[];
      setExamenes(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleSubmitExamen = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingExamen ? `/api/examenes-predefinidos/${editingExamen.id}` : "/api/examenes-predefinidos";
    try {
      const res = await fetch(url, {
        method: editingExamen ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, precio: parseFloat(formData.precio) }),
      });
      if (res.ok) {
        setIsExamenModalOpen(false);
        loadExamenes();
      }
    } catch (error) {
      alert("Error al procesar la solicitud");
    }
  };

  const deleteExamen = async (id: number) => {
    if (!confirm("¿Está seguro de eliminar este registro permanentemente?")) return;
    await fetch(`/api/examenes-predefinidos/${id}`, { method: "DELETE" });
    loadExamenes();
  };

  // --- LÓGICA DE VALORES REF ---
  const loadValoresReferencia = async () => {
    try {
      const res = await fetch(`/api/valores-referencia?tabla=${seccionActiva}`);
      const data = (await res.json()) as ValorReferencia[];
      setValoresRef(data.map(item => ({ ...item, originalValue: item.valor_referencia })));
    } catch (error) {
      console.error(error);
    }
  };

  const saveAllValoresRef = async () => {
    setSavingRef(true);
    try {
      const res = await fetch(`/api/valores-referencia?tabla=${seccionActiva}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valores: valoresRef }),
      });
      if (res.ok) {
        setSuccessMsg(true);
        setTimeout(() => setSuccessMsg(false), 3000);
        loadValoresReferencia();
      }
    } catch (error) {
      alert("Error al actualizar");
    } finally {
      setSavingRef(false);
    }
  };

  const filteredExamenes = examenes.filter(ex =>
    ex.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 font-sans text-slate-700">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER PRINCIPAL */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 ring-4 ring-white">
              <Settings size={30} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Configuración del Sistema</h1>
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                <ShieldCheck size={14} className="text-emerald-500" />
                Panel de Administración Central
              </div>
            </div>
          </div>
        </header>

        {/* MENÚ DE NAVEGACIÓN (TABS) */}
        <nav className="flex flex-wrap gap-2 p-1.5 bg-slate-200/50 rounded-2xl w-fit">
          <button
            onClick={() => setTabActiva("catalogo")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              tabActiva === "catalogo" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <ClipboardList size={18} /> Catálogo de Precios
          </button>
          <button
            onClick={() => setTabActiva("parametros")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              tabActiva === "parametros" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Beaker size={18} /> Valores de Referencia
          </button>
          <button
            onClick={() => setTabActiva("apariencia")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              tabActiva === "apariencia" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Layout size={18} /> Apariencia y Reportes
          </button>
        </nav>

        {/* CONTENIDO DINÁMICO SEGÚN TAB */}
        <main className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* SECCIÓN 1: CATÁLOGO */}
          {tabActiva === "catalogo" && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o categoría..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none text-sm transition-all"
                  />
                </div>
                <button
                  onClick={() => {
                    setEditingExamen(null);
                    setFormData({ nombre: "", precio: "", categoria: "Hematología" });
                    setIsExamenModalOpen(true);
                  }}
                  className="w-full md:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 transition-all"
                >
                  <Plus size={18} /> Nuevo Examen
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-8 py-4">Servicio / Examen</th>
                      <th className="px-8 py-4">Categoría</th>
                      <th className="px-8 py-4 text-right">Precio</th>
                      <th className="px-8 py-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredExamenes.map((ex) => (
                      <tr key={ex.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-4 font-semibold text-slate-800">{ex.nombre}</td>
                        <td className="px-8 py-4">
                          <span className="px-3 py-1 bg-white border border-slate-200 text-slate-600 rounded-full text-[10px] font-bold uppercase">
                            {ex.categoria}
                          </span>
                        </td>
                        <td className="px-8 py-4 text-right font-mono font-bold text-indigo-600">${ex.precio.toFixed(2)}</td>
                        <td className="px-8 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingExamen(ex);
                                setFormData({ nombre: ex.nombre, precio: ex.precio.toString(), categoria: ex.categoria });
                                setIsExamenModalOpen(true);
                              }}
                              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => deleteExamen(ex.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECCIÓN 2: PARÁMETROS TÉCNICOS */}
          {tabActiva === "parametros" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Áreas Médicas</h3>
                  <div className="space-y-2">
                    {(["quimica", "hematologia", "coagulacion"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setSeccionActiva(tab)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                          seccionActiva === tab
                            ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200"
                            : "text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        <span className="capitalize">{tab}</span>
                        <ChevronRight size={16} className={seccionActiva === tab ? "translate-x-1" : "opacity-0"} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="bg-indigo-900 p-6 rounded-3xl text-white shadow-xl shadow-indigo-200">
                  <Sliders size={24} className="mb-4 text-indigo-300" />
                  <p className="text-xs font-medium text-indigo-200 leading-relaxed">
                    Estos valores se reflejarán automáticamente en la impresión de resultados del área de <span className="text-white font-bold underline capitalize">{seccionActiva}</span>.
                  </p>
                </div>
              </div>

              <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[600px]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <h2 className="font-bold text-slate-800 flex items-center gap-2 capitalize">
                    Valores: {seccionActiva}
                  </h2>
                  {successMsg && (
                    <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold animate-pulse">
                      <CheckCircle2 size={14} /> Cambios guardados
                    </span>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-5">
                  {valoresRef.map((item) => {
                    const isChanged = item.valor_referencia !== item.originalValue;
                    return (
                      <div key={item.id} className="group">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2 ml-1">
                          {item.nombre_examen}
                        </label>
                        <input
                          type="text"
                          value={item.valor_referencia}
                          onChange={(e) => setValoresRef(prev => prev.map(v => v.id === item.id ? { ...v, valor_referencia: e.target.value } : v))}
                          className={`w-full px-4 py-3 rounded-xl text-sm font-medium transition-all outline-none border ${
                            isChanged ? "border-amber-400 bg-amber-50/30" : "border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500"
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
                    className="w-full py-3.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                  >
                    <Save size={18} /> {savingRef ? "Guardando..." : "Sincronizar Baremos"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECCIÓN 3: APARIENCIA */}
          {tabActiva === "apariencia" && (
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
              <div className="flex items-center gap-4 text-indigo-600">
                <Layout size={32} />
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Personalización de Salida</h2>
                  <p className="text-sm text-slate-500 font-medium">Configure el aspecto de los PDF y reportes impresos.</p>
                </div>
              </div>
              <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-700">Texto del Pie de Página (Legal/Contacto)</label>
                <textarea
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm h-32 resize-none"
                  placeholder="Escriba aquí la dirección, teléfonos o leyendas legales..."
                />
                <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                  <Save size={20} /> Guardar Preferencias Visuales
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL PARA CREAR/EDITAR EXAMEN */}
      {isExamenModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{editingExamen ? "Editar Registro" : "Nuevo Examen"}</h3>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-tighter">Administración de Catálogo</p>
              </div>
              <button onClick={() => setIsExamenModalOpen(false)} className="p-2 hover:bg-white rounded-full text-slate-400 transition-all"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSubmitExamen} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nombre del Examen</label>
                <input
                  required
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-medium transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Categoría</label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium cursor-pointer"
                  >
                    {["Hematología", "Química Clínica", "Heces", "Orina", "Coagulación", "Bacteriología", "Misceláneos", "Materiales"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Precio ($)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      required
                      type="number"
                      step="0.01"
                      value={formData.precio}
                      onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                      className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-indigo-600 outline-none"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsExamenModalOpen(false)}
                  className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-3.5 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all uppercase tracking-widest"
                >
                  {editingExamen ? "Guardar Cambios" : "Confirmar Alta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
}