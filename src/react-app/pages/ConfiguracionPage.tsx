import { useEffect, useState } from "react";
import {
  Settings,
  Edit2,
  X,
  Layout,
  Search,
  ChevronRight,
  Sliders,
  Trash2,
} from "lucide-react";
import { formatCurrency, formatCurrencyInput, cleanCurrencyInput } from "@/utils/currency";
import { useNotification } from "@/react-app/context/NotificationContext";
import { FORM_FIELDS } from "@/utils/formFields";

// --- INTERFACES ---
interface ExamenPredefinido {
  id: number;
  nombre: string;
  precio: number;
  categoria: string;
  parametros?: string[];
}

interface ValorReferencia {
  id: number;
  nombre_examen: string;
  valor_referencia: string;
  originalValue?: string;
}

type TabActiva = "catalogo" | "parametros" | "apariencia";

export default function ConfiguracionPage() {
  const { showNotification, confirmAction } = useNotification();
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
    parametros: [] as string[],
  });

  // --- ESTADOS DE VALORES DE REFERENCIA ---
  const [seccionActiva, setSeccionActiva] = useState<"quimica" | "hematologia" | "coagulacion">("quimica");
  const [valoresRef, setValoresRef] = useState<ValorReferencia[]>([]);
  const [savingRef, setSavingRef] = useState(false);

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
      if (!res.ok) throw new Error("Error al cargar exámenes");
      const data = (await res.json()) as ExamenPredefinido[];
      setExamenes(data);
    } catch (error) {
      console.error("Error:", error);
      showNotification("error", "Error de Conexión", "No se pudo cargar el catálogo de exámenes");
    }
  };

  const formatPrice = (value: string) => {
    return formatCurrencyInput(value);
  };

  const handleSubmitExamen = async (e: React.FormEvent) => {
    e.preventDefault();
    const precioLimpio = parseInt(cleanCurrencyInput(formData.precio));
    const url = editingExamen ? `/api/examenes-predefinidos/${editingExamen.id}` : "/api/examenes-predefinidos";
    try {
      const res = await fetch(url, {
        method: editingExamen ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, precio: precioLimpio }),
      });
      if (res.ok) {
        showNotification("success", editingExamen ? "Estudio Actualizado" : "Nuevo Estudio Añadido", `${formData.nombre} ahora está en el catálogo`);
        setIsExamenModalOpen(false);
        setEditingExamen(null);
        loadExamenes();
      }
    } catch (error) {
      showNotification("error", "Error", "No se pudo procesar la solicitud");
    }
  };

  const deleteExamen = async (id: number) => {
    confirmAction({
      title: "Eliminar Registro",
      message: "¿Está seguro de eliminar este estudio permanentemente? Desaparecerá del catálogo de facturación.",
      variant: "danger",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/examenes-predefinidos/${id}`, { method: "DELETE" });
          if (res.ok) {
            showNotification("delete", "Estudio Eliminado", "El registro ha sido removido del catálogo");
            loadExamenes();
          }
        } catch (e) {
          showNotification("error", "Error", "No se pudo eliminar el registro");
        }
      }
    });
  };

  // --- LÓGICA DE VALORES REF ---
  const loadValoresReferencia = async () => {
    try {
      const res = await fetch(`/api/valores-referencia?tabla=${seccionActiva}`);
      const data = (await res.json()) as ValorReferencia[];
      setValoresRef(data.map((item) => ({ ...item, originalValue: item.valor_referencia })));
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
        showNotification("success", "Sincronización Exitosa", "Los baremos técnicos han sido actualizados");
        loadValoresReferencia();
      }
    } catch (error) {
      showNotification("error", "Error", "No se pudo actualizar los parámetros");
    } finally {
      setSavingRef(false);
    }
  };

  const filteredExamenes = examenes.filter(
    (ex) =>
      ex.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">

      {/* HEADER MINIMALISTA */}
      <div className="flex items-end justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
            <Settings size={18} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 uppercase tracking-[0.2em]">Configuración</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1">Gestión administrativa y báremos técnicos</p>
          </div>
        </div>
      </div>

      {/* TABS NAVEGACIÓN */}
      <div className="flex gap-8 border-b border-slate-50 overflow-x-auto no-scrollbar pb-1">
        {(["catalogo", "parametros", "apariencia"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setTabActiva(tab)}
            className={`pb-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${tabActiva === tab ? "text-slate-900" : "text-slate-300 hover:text-slate-500"
              }`}
          >
            {tab === "catalogo" ? "Catálogo" : tab === "parametros" ? "Parámetros" : "Apariencia"}
            {tabActiva === tab && (
              <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-slate-900 animate-in fade-in zoom-in-50" />
            )}
          </button>
        ))}
      </div>

      <main className="animate-in slide-in-from-bottom-2 duration-500">

        {/* CATÁLOGO DE PRECIOS */}
        {tabActiva === "catalogo" && (
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row gap-6 justify-between items-center">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input
                  type="text"
                  placeholder="BUSCAR EXAMEN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-[10px] font-bold uppercase outline-none focus:ring-1 focus:ring-slate-100 transition-all placeholder:text-slate-300"
                />
              </div>

              {/* Category Filters */}
              <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar py-2">
                <button
                  onClick={() => setSearchTerm("")}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${searchTerm === "" ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-400 hover:bg-slate-100"}`}
                >
                  Todos
                </button>
                {Object.keys(FORM_FIELDS).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSearchTerm(cat)}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${searchTerm === cat ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-400 hover:bg-slate-100"}`}
                  >
                    {cat}
                  </button>
                ))}
                <button
                  onClick={() => setSearchTerm("Materiales")}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${searchTerm === "Materiales" ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-400 hover:bg-slate-100"}`}
                >
                  Materiales
                </button>
              </div>

              <button
                onClick={() => {
                  setEditingExamen(null);
                  setFormData({ nombre: "", precio: "", categoria: "Hematología", parametros: [] });
                  setIsExamenModalOpen(true);
                }}
                className="w-full md:w-auto px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
              >
                Añadir al Catálogo
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-widest">
                    <th className="px-8 py-5">Nombre del Examen</th>
                    <th className="px-8 py-5">Categoría</th>
                    <th className="px-8 py-5 text-right">Costo Unitario</th>
                    <th className="px-8 py-5 text-right">Gestión</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredExamenes.map((ex) => (
                    <tr key={ex.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-8 py-4">
                        <p className="text-[11px] font-bold text-slate-700 uppercase">{ex.nombre}</p>
                      </td>
                      <td className="px-8 py-4">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight bg-slate-50 px-2 py-1 rounded-md">
                          {ex.categoria}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <p className="text-[11px] font-black font-mono text-slate-900">${formatCurrency(ex.precio)}</p>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditingExamen(ex);
                              setFormData({
                                nombre: ex.nombre,
                                precio: ex.precio.toString(),
                                categoria: ex.categoria,
                                parametros: ex.parametros || []
                              });
                              setIsExamenModalOpen(true);
                            }}
                            className="p-2 text-slate-300 hover:text-slate-900 rounded-lg transition-all"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => deleteExamen(ex.id)}
                            className="p-2 text-slate-300 hover:text-rose-500 rounded-lg transition-all"
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
        )}

        {/* PARÁMETROS TÉCNICOS */}
        {tabActiva === "parametros" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 px-1">Secciones Clínicas</h3>
                <div className="space-y-1">
                  {(["quimica", "hematologia", "coagulacion"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setSeccionActiva(tab)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${seccionActiva === tab ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50"
                        }`}
                    >
                      <span>{tab}</span>
                      <ChevronRight size={14} className={seccionActiva === tab ? "opacity-100" : "opacity-0"} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                  Los valores definidos aquí actúan como bárejos base para todos los reportes impresos. Asegúrese de incluir las unidades correspondientes.
                </p>
              </div>
            </div>

            <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col h-[700px]">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-3">
                  <Sliders size={16} /> Parámetros: {seccionActiva}
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-6">
                {valoresRef.map((item) => {
                  const isChanged = item.valor_referencia !== item.originalValue;
                  return (
                    <div key={item.id}>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase mb-2 ml-1 tracking-tighter">
                        {item.nombre_examen}
                      </label>
                      <input
                        type="text"
                        value={item.valor_referencia}
                        onChange={(e) =>
                          setValoresRef((prev) =>
                            prev.map((v) => (v.id === item.id ? { ...v, valor_referencia: e.target.value } : v))
                          )
                        }
                        className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-[11px] font-bold uppercase transition-all outline-none ${isChanged ? "border-slate-300 ring-2 ring-slate-100" : "border-slate-50 focus:border-slate-200 focus:bg-white"
                          }`}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="p-8 bg-white border-t border-slate-50">
                <button
                  onClick={saveAllValoresRef}
                  disabled={savingRef}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-slate-200"
                >
                  {savingRef ? "ESPERE..." : "Actualizar Baremos Técnicos"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* APARIENCIA */}
        {tabActiva === "apariencia" && (
          <div className="max-w-xl mx-auto py-10 animate-in zoom-in-95 duration-300">
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-10">
              <div className="flex items-center gap-4 border-b border-slate-50 pb-8">
                <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-300">
                  <Layout size={24} />
                </div>
                <div>
                  <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest leading-none mb-1">Apariencia</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Personalización de reportes PDF</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Texto de pie de página (Legal / Contacto)</label>
                  <textarea
                    value={footerText || "© 2024 Laboratorio Clínico - Todos los derechos reservados"}
                    onChange={(e) => setFooterText(e.target.value)}
                    className="w-full p-6 bg-slate-50 border border-slate-50 rounded-2xl focus:border-slate-200 focus:bg-white outline-none transition-all text-[11px] font-bold h-40 resize-none leading-relaxed"
                    placeholder="Escriba aquí la dirección, teléfonos o leyendas legales..."
                  />
                </div>
                <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all">
                  Guardar Preferencias
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL EXAMEN MINIMALISTA */}
      {isExamenModalOpen && (
        <div className="fixed inset-0 bg-slate-900/10 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">ADMINISTRADOR</p>
                <h3 className="text-[11px] font-black text-slate-900 uppercase">
                  {editingExamen ? "EDITAR ESTUDIO" : "NUEVO REGISTRO"}
                </h3>
              </div>
              <button onClick={() => setIsExamenModalOpen(false)} className="text-slate-300 hover:text-slate-900 transition-colors"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmitExamen} className="p-8 space-y-6">
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase mb-1.5 block tracking-widest">Nombre del Examen</label>
                <input
                  required type="text" value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl outline-none text-[11px] font-bold uppercase transition-all focus:bg-white focus:ring-1 focus:ring-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase mb-1.5 block tracking-widest">Área Med.</label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-[10px] font-bold uppercase outline-none cursor-pointer appearance-none"
                  >
                    {["Hematología", "Química Clínica", "Heces", "Orina", "Coagulación", "Bacteriología", "Misceláneos", "Materiales", "Grupo Sanguíneo"].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase mb-1.5 block tracking-widest">Precio ($)</label>
                  <input
                    required type="text"
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: formatPrice(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-[11px] font-black text-slate-900 outline-none"
                  />
                </div>
              </div>

              {/* SELECCIÓN DE PARÁMETROS */}
              {FORM_FIELDS[formData.categoria] && (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <label className="text-[9px] font-bold text-slate-400 uppercase mb-3 block tracking-widest">
                    Parámetros que incluye
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto custom-scrollbar">
                    {FORM_FIELDS[formData.categoria].map((field) => {
                      const isSelected = formData.parametros.includes(field.id);
                      return (
                        <button
                          key={field.id}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              parametros: isSelected
                                ? prev.parametros.filter(p => p !== field.id)
                                : [...prev.parametros, field.id]
                            }));
                          }}
                          className={`text-left px-3 py-2 rounded-xl text-[10px] font-bold uppercase transition-all flex items-center gap-2 ${isSelected
                            ? "bg-slate-900 text-white shadow-md shadow-slate-200"
                            : "bg-white text-slate-400 hover:bg-slate-100 border border-slate-100"
                            }`}
                        >
                          <div className={`w-2 h-2 rounded-full ${isSelected ? "bg-green-400" : "bg-slate-200"}`} />
                          {field.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-slate-100 hover:bg-slate-800 transition-all"
                >
                  CONFIRMAR CAMBIOS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #F1F5F9; border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
