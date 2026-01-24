import { useState, useEffect } from "react";
import {
  Search,
  X,
  Plus,
  Trash2,
  FlaskConical,
  Save,
  Edit2,
} from "lucide-react";
import { useNotification } from "@/react-app/context/NotificationContext";
import { BacteriologiaData } from "@/types/types";

interface BacteriologiaFormProps {
  resultados: any;
  onChange: (resultados: any) => void;
}

// Minimalist Input Modal Component
const InputModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  defaultValue = ""
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (val: string) => void;
  title: string;
  defaultValue?: string;
}) => {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (isOpen) setValue(defaultValue);
  }, [isOpen, defaultValue]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-[320px] rounded-[2rem] shadow-2xl border border-slate-100 p-6 animate-in zoom-in-95 duration-200">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 text-center">{title}</h3>
        <input
          autoFocus
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:border-slate-900 transition-all text-center mb-6 uppercase"
          placeholder="Nombre..."
          onKeyDown={(e) => e.key === 'Enter' && value.trim() && onConfirm(value)}
        />
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-3 text-[9px] font-black uppercase text-slate-400 hover:bg-slate-50 rounded-xl transition-colors">Cancelar</button>
          <button
            onClick={() => value.trim() && onConfirm(value)}
            disabled={!value.trim()}
            className="flex-1 py-3 bg-slate-900 text-white text-[9px] font-black uppercase rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default function BacteriologiaForm({
  resultados,
  onChange,
}: BacteriologiaFormProps) {
  const { showNotification, confirmAction } = useNotification();

  // Estados de Datos
  const [plantillas, setPlantillas] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showLibrary, setShowLibrary] = useState(false);

  // Modal Save
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [activeTemplateId, setActiveTemplateId] = useState<number | null>(null);

  // Estados de UI
  const [textoAnti, setTextoAnti] = useState("");
  const [sugerencias, setSugerencias] = useState<string[]>([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const listaAntibioticos = [
    "Amikacina", "Amoxi-Ac.Clavulánico", "Ampicilina-Sulbactan", "Cefepime",
    "Aztreonar", "Ceftazidima", "Ceftriaxone", "Meropenem", "Imipenem",
    "Ertapenem", "Ciprofloxacina", "Levofloxacina", "Nitrofurantoina",
    "Trimetropin-Sulfa", "Pipera-Tazobac", "Eritromicina", "Clindamicina",
    "Rifampicina", "Ampicilina", "Linezolid", "Azitromicina", "Oxacilina",
    "Tigeciclina", "Colistin", "Gentamicina",
  ];

  const germenes = [
    "Negativo", "Escherichia coli", "Staphylococcus aureus",
    "Proteus vulgaris", "Klebsiella pneumoniae", "Pseudomonas aeruginosa",
  ];

  const cargarPlantillas = async () => {
    try {
      const res = await fetch("/api/plantillas/bacteriologia");
      if (res.ok) {
        const data: BacteriologiaData[] = await res.json();
        setPlantillas(data);
      }
    } catch (e) {
      console.error("Error cargando plantillas:", e);
    }
  };

  useEffect(() => {
    cargarPlantillas();
  }, []);

  const plantillasFiltradas = plantillas.filter(p =>
    p.nombre_plantilla.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChange = (field: string, value: any) => {
    onChange({ ...resultados, [field]: value });
  };

  const aplicarPlantilla = (p: any) => {
    onChange({
      ...resultados,
      muestra: p.muestra_default || "",
      obs_directa: p.observacion_directa || "",
      gram: p.tincion_gram || "",
      recuento: p.recuento_colonias || "",
      cultivo: p.cultivo || "",
      cultivo_hongos: p.cultivo_hongos || "",
    });
    setActiveTemplateId(p.id);
    showNotification("success", "Plantilla aplicada");
  };

  const procesarGuardado = async (nombre: string) => {
    setShowSaveModal(false);
    const payload = {
      nombre_plantilla: nombre,
      muestra_default: resultados.muestra || "",
      observacion_directa: resultados.obs_directa || "",
      tincion_gram: resultados.gram || "",
      recuento_colonias: resultados.recuento || "",
      cultivo: resultados.cultivo || "",
      cultivo_hongos: resultados.cultivo_hongos || "",
    };

    try {
      const isEdit = activeTemplateId !== null;
      const url = isEdit ? `/api/plantillas/bacteriologia/${activeTemplateId}` : "/api/plantillas/bacteriologia";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        showNotification("success", isEdit ? "Plantilla actualizada" : "Plantilla guardada");
        cargarPlantillas();
      }
    } catch (e) {
      showNotification("error", "Error al procesar");
    }
  };

  const eliminarPlantilla = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    confirmAction({
      title: "Eliminar Plantilla",
      message: "¿Estás seguro de eliminar esta plantilla?",
      variant: "danger",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/plantillas/bacteriologia/${id}`, {
            method: "DELETE",
          });
          if (res.ok) {
            setPlantillas(prev => prev.filter(p => p.id !== id));
            showNotification("delete", "Plantilla eliminada");
          }
        } catch (e) {
          showNotification("error", "Error de conexión");
        }
      }
    });
  };

  const limpiarFormulario = () => {
    onChange({
      muestra: "",
      obs_directa: "",
      gram: "",
      recuento: "",
      cultivo: "",
      cultivo_hongos: "",
      antibiograma_list: [],
      germen_a: "",
      germen_b: "",
    });
    setActiveTemplateId(null);
    showNotification("info", "Formulario vaciado");
  };

  // --- LÓGICA DE AUTOCOMPLETADO ---
  const manejarEscrituraAnti = (val: string) => {
    setTextoAnti(val);
    if (val.trim().length > 0) {
      const filtradas = listaAntibioticos.filter((a) =>
        a.toLowerCase().includes(val.toLowerCase())
      );
      setSugerencias(filtradas);
      setMostrarSugerencias(true);
      setSelectedIndex(filtradas.length > 0 ? 0 : -1);
    } else {
      setMostrarSugerencias(false);
      setSelectedIndex(-1);
    }
  };


  const agregarAntibiotico = (nombre?: string) => {
    const nombreFinal = nombre || textoAnti;
    if (!nombreFinal.trim()) return;
    const actual = resultados.antibiograma_list || [];
    if (actual.find((item: any) => item.nombre.toLowerCase() === nombreFinal.toLowerCase())) {
      setTextoAnti(""); setMostrarSugerencias(false); return;
    }
    const nuevaLista = [...actual, { nombre: nombreFinal, a: "", b: "" }];
    handleChange("antibiograma_list", nuevaLista);
    setTextoAnti(""); setMostrarSugerencias(false); setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (mostrarSugerencias && sugerencias.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => (prev < sugerencias.length - 1 ? prev + 1 : prev));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (selectedIndex >= 0) agregarAntibiotico(sugerencias[selectedIndex]);
        else agregarAntibiotico();
      }
    } else if (e.key === "Enter") {
      agregarAntibiotico();
    }
  };

  const toggleValor = (nombre: string, campo: "a" | "b") => {
    const nuevaLista = (resultados.antibiograma_list || []).map((item: any) => {
      if (item.nombre === nombre) {
        const actual = item[campo];
        const sig = !actual ? "S" : actual === "S" ? "R" : actual === "R" ? "I" : "";
        return { ...item, [campo]: sig };
      }
      return item;
    });
    handleChange("antibiograma_list", nuevaLista);
  };

  const eliminarAntibiotico = (nombre: string) => {
    const nuevaLista = (resultados.antibiograma_list || []).filter((item: any) => item.nombre !== nombre);
    handleChange("antibiograma_list", nuevaLista);
  };

  const labelBase = "text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block";
  const inputBase = "w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-slate-900 transition-all placeholder:text-slate-300";
  const areaBase = "w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-600 outline-none focus:border-slate-900 transition-all min-h-[60px] resize-none";
  const sectionCard = "p-4 rounded-xl bg-white border border-slate-100 shadow-sm";

  return (
    <div className="w-full pb-20 space-y-5">
      <InputModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onConfirm={procesarGuardado}
        title="Guardar Plantilla"
        defaultValue={resultados.muestra || ""}
      />

      {/* HEADER COMPACTO */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-50 text-indigo-500 rounded-lg flex items-center justify-center">
            <FlaskConical size={16} />
          </div>
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Bacteriología</h3>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowLibrary(!showLibrary)} className={`text-[10px] font-bold uppercase transition-colors ${showLibrary ? 'text-indigo-600' : 'text-slate-400 hover:text-indigo-600'}`}>
            {showLibrary ? 'Cerrar' : 'Plantillas'}
          </button>
          <button onClick={() => setShowSaveModal(true)} className={`text-[10px] font-bold uppercase transition-colors flex items-center gap-1 ${activeTemplateId ? 'text-blue-600 hover:text-blue-700' : 'text-emerald-600 hover:text-emerald-700'}`}>
            {activeTemplateId ? (
              <>
                <Edit2 size={12} /> Editar
              </>
            ) : (
              <>
                <Save size={12} /> Guardar
              </>
            )}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className={sectionCard}>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className={labelBase}>Muestra</label>
              <input type="text" value={resultados?.muestra || ""} onChange={(e) => handleChange("muestra", e.target.value)} className={inputBase} placeholder="Ej: Orina" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelBase}>Germen A</label>
                <select value={resultados?.germen_a || ""} onChange={(e) => handleChange("germen_a", e.target.value)} className={inputBase}>
                  <option value="">Negativo</option>
                  {germenes.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className={labelBase}>Germen B</label>
                <select value={resultados?.germen_b || ""} onChange={(e) => handleChange("germen_b", e.target.value)} className={inputBase}>
                  <option value="">Negativo</option>
                  {germenes.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className={sectionCard}>
          <div className="space-y-3">
            <div>
              <label className={labelBase}>Observación Directa</label>
              <textarea value={resultados?.obs_directa || ""} onChange={(e) => handleChange("obs_directa", e.target.value)} className={areaBase} />
            </div>
            <div>
              <label className={labelBase}>Tinción de Gram</label>
              <textarea value={resultados?.gram || ""} onChange={(e) => handleChange("gram", e.target.value)} className={areaBase} />
            </div>
            <div>
              <label className={labelBase}>Recuento de Colonias</label>
              <textarea value={resultados?.recuento || ""} onChange={(e) => handleChange("recuento", e.target.value)} className={areaBase} />
            </div>
            <div>
              <label className={labelBase}>Resultado Cultivo</label>
              <textarea value={resultados?.cultivo || ""} onChange={(e) => handleChange("cultivo", e.target.value)} className={areaBase} />
            </div>
          </div>
        </div>

        <div className={sectionCard}>
          <label className={labelBase}>Cultivo para Micosis (Hongos)</label>
          <textarea
            value={resultados?.cultivo_hongos || ""}
            onChange={(e) => handleChange("cultivo_hongos", e.target.value)}
            className={`${areaBase} min-h-[50px]`}
            placeholder="Resultado de cultivo Sabouraud..."
          />
        </div>
      </div>

      {/* ANTIBIOGRAMA */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
            Antibiograma
            <span className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded text-[9px] w-6 text-center">
              {(resultados?.antibiograma_list || []).length}
            </span>
          </h4>
          <div className="flex gap-2 relative">
            <input
              type="text" value={textoAnti}
              onChange={(e) => manejarEscrituraAnti(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Fármaco..."
              className="text-[10px] bg-white border border-slate-300 rounded px-2 py-1 w-24 outline-none focus:border-slate-900 transition-all uppercase"
            />
            {mostrarSugerencias && sugerencias.length > 0 && (
              <div className="absolute z-[110] top-full right-0 mt-1 bg-white border border-slate-200 shadow-xl rounded-lg overflow-hidden w-40 max-h-40 overflow-y-auto">
                {sugerencias.map((s, idx) => (
                  <div key={s} onClick={() => agregarAntibiotico(s)} onMouseEnter={() => setSelectedIndex(idx)} className={`px-3 py-2 text-[10px] font-bold cursor-pointer ${idx === selectedIndex ? "bg-slate-100" : "hover:bg-slate-50"}`}>
                    {s}
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => agregarAntibiotico()} className="text-slate-400 hover:text-slate-900 transition-colors"><Plus size={14} /></button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-tighter bg-slate-50/50">
                <th className="px-3 py-2 text-left">Fármaco</th>
                <th className="px-1 py-2 text-center w-10">A</th>
                <th className="px-1 py-2 text-center w-10">B</th>
                <th className="px-2 py-2 text-right w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(resultados?.antibiograma_list || []).map((item: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-3 py-1.5 font-bold text-slate-700">{item.nombre}</td>
                  <td onClick={() => toggleValor(item.nombre, "a")} className="px-1 py-1.5 text-center cursor-pointer select-none">
                    <span className={`block px-1 rounded-md font-black ${item.a === "S" ? "bg-emerald-100 text-emerald-600" : item.a === "R" ? "bg-rose-100 text-rose-600" : item.a === "I" ? "bg-amber-100 text-amber-600" : "text-slate-200"}`}>
                      {item.a || "-"}
                    </span>
                  </td>
                  <td onClick={() => toggleValor(item.nombre, "b")} className="px-1 py-1.5 text-center cursor-pointer select-none">
                    <span className={`block px-1 rounded-md font-black ${item.b === "S" ? "bg-emerald-100 text-emerald-600" : item.b === "R" ? "bg-rose-100 text-rose-600" : item.b === "I" ? "bg-amber-100 text-amber-600" : "text-slate-200"}`}>
                      {item.b || "-"}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 text-right">
                    <button onClick={() => eliminarAntibiotico(item.nombre)} className="text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"><X size={12} /></button>
                  </td>
                </tr>
              ))}
              {(resultados?.antibiograma_list || []).length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-4 text-center text-slate-300 italic">No hay antibióticos registrados</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* BIBLIOTECA - Modal simple */}
      {showLibrary && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setShowLibrary(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl flex flex-col max-h-[60vh] overflow-hidden">
            <div className="p-3 border-b flex justify-between items-center bg-slate-50">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Plantillas</span>
              <button onClick={() => setShowLibrary(false)} className="text-slate-400 hover:text-slate-900 transition-colors"><X size={16} /></button>
            </div>
            <div className="p-2 border-b">
              <div className="relative">
                <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-100 border-none rounded-lg py-1.5 pl-8 pr-3 text-[10px] outline-none focus:ring-1 focus:ring-slate-300 transition-all uppercase font-bold text-slate-600"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {plantillasFiltradas.length === 0 && (
                <div className="py-8 text-center text-slate-300 text-[9px] uppercase font-bold tracking-widest">Sin resultados</div>
              )}
              {plantillasFiltradas.map((p) => (
                <div key={p.id} className="flex items-center group px-1">
                  <button onClick={() => { aplicarPlantilla(p); setShowLibrary(false); }} className="flex-1 text-left p-2 hover:bg-slate-50 rounded-lg transition-all">
                    <div className="text-[10px] font-bold uppercase text-slate-700">{p.nombre_plantilla}</div>
                    <div className="text-[8px] text-slate-400 uppercase font-medium">Muestra: {p.muestra_default || "-"}</div>
                  </button>
                  <button onClick={(e) => eliminarPlantilla(e, p.id)} className="p-2 text-slate-200 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="pt-2 border-t border-slate-100 text-center">
        <button onClick={limpiarFormulario} className="text-[9px] font-bold uppercase text-slate-300 hover:text-rose-500 transition-colors">
          Limpiar Todo
        </button>
      </div>
    </div>
  );
}