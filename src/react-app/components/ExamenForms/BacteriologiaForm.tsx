import { useState, useEffect } from "react";
import {
  Save,
  ClipboardList,
  Plus,
  Trash2,
  TestTube2,
  FlaskConical,
  CheckCircle2,
  Eraser,
  Search,
  Layers,
} from "lucide-react";

import { BacteriologiaData } from "@/types/types";

interface BacteriologiaFormProps {
  resultados: any;
  onChange: (resultados: any) => void;
}

export default function BacteriologiaForm({
  resultados,
  onChange,
}: BacteriologiaFormProps) {
  // Estados de Datos
  const [plantillas, setPlantillas] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Estados de UI
  const [textoAnti, setTextoAnti] = useState("");
  const [sugerencias, setSugerencias] = useState<string[]>([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [notificacion, setNotificacion] = useState<{
    msg: string;
    tipo: "success" | "error";
  } | null>(null);

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

  const notify = (msg: string, tipo: "success" | "error" = "success") => {
    setNotificacion({ msg, tipo });
    setTimeout(() => setNotificacion(null), 3000);
  };

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
    notify(`Plantilla aplicada`);
  };

  const guardarPlantilla = async () => {
    const nombre = prompt("Nombre para la nueva plantilla:");
    if (!nombre) return;

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
      const res = await fetch("/api/plantillas/bacteriologia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        notify("Plantilla guardada");
        cargarPlantillas();
      }
    } catch (e) {
      notify("Error al guardar", "error");
    }
  };

  const eliminarPlantilla = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm("¿Eliminar esta plantilla?")) return;

    try {
      const res = await fetch(`/api/plantillas/bacteriologia/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setPlantillas(prev => prev.filter(p => p.id !== id));
        notify("Eliminada");
      }
    } catch (e) {
      notify("Error conexión", "error");
    }
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
    notify("Formulario vaciado");
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
      setSelectedIndex(-1);
    } else {
      setMostrarSugerencias(false);
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

  const inputBase = "w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all";
  const labelBase = "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block";
  const areaBase = "w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 outline-none focus:border-indigo-500 focus:bg-white transition-all min-h-[120px] resize-none";

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto pb-10">
      {/* NOTIFICACIÓN */}
      {notificacion && (
        <div className="fixed top-6 right-6 z-[200] flex items-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 animate-in slide-in-from-top-10 fade-in duration-500">
          <CheckCircle2 className={notificacion.tipo === "success" ? "text-emerald-400" : "text-rose-400"} size={20} />
          <span className="text-sm font-black uppercase tracking-wider">{notificacion.msg}</span>
        </div>
      )}

      {/* SECCIÓN PRINCIPAL: FORMULARIO */}
      <div className="flex-1 space-y-6">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8">
          <div className="flex items-center justify-between border-b border-slate-50 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <FlaskConical size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Cultivos y Bacteriología</h3>
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em]">Registro de Hallazgos</p>
              </div>
            </div>
            <button onClick={guardarPlantilla} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100">
              <Save size={14} /> Guardar Formato
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <label className={labelBase}>Muestra / Origen</label>
              <input type="text" value={resultados?.muestra || ""} onChange={(e) => handleChange("muestra", e.target.value)} className={inputBase} placeholder="Ej. Orina, Secreción..." />
            </div>
            <div>
              <label className={labelBase}>Germen Aislado A</label>
              <select value={resultados?.germen_a || ""} onChange={(e) => handleChange("germen_a", e.target.value)} className={inputBase}>
                <option value="">Ninguno</option>
                {germenes.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className={labelBase}>Germen Aislado B</label>
              <select value={resultados?.germen_b || ""} onChange={(e) => handleChange("germen_b", e.target.value)} className={inputBase}>
                <option value="">Ninguno</option>
                {germenes.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className={labelBase}>Observación Directa</label>
                <textarea value={resultados?.obs_directa || ""} onChange={(e) => handleChange("obs_directa", e.target.value)} className={areaBase} />
              </div>
              <div>
                <label className={labelBase}>Tinción de Gram</label>
                <textarea value={resultados?.gram || ""} onChange={(e) => handleChange("gram", e.target.value)} className={areaBase} />
              </div>
            </div>
            <div className="space-y-4">
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
        </div>

        {/* ANTIBIOGRAMA INTEGRADO */}
        <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-800">
          <div className="px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <TestTube2 className="text-indigo-400" size={20} />
              <h4 className="text-white font-black text-sm uppercase tracking-widest">Antibiograma</h4>
            </div>
            <div className="relative flex gap-2">
              <div className="relative">
                <input 
                  type="text" value={textoAnti} 
                  onChange={(e) => manejarEscrituraAnti(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Añadir antibiótico..."
                  className="bg-slate-800 text-white text-xs px-5 py-3 rounded-xl outline-none w-64 border border-transparent focus:border-indigo-500 font-bold"
                />
                {mostrarSugerencias && sugerencias.length > 0 && (
                  <div className="absolute z-[110] top-full mt-2 left-0 w-full bg-white border border-slate-100 shadow-2xl rounded-xl overflow-hidden">
                    {sugerencias.map((s, idx) => (
                      <div key={s} onClick={() => agregarAntibiotico(s)} onMouseEnter={() => setSelectedIndex(idx)} className={`px-4 py-2.5 text-xs font-bold cursor-pointer border-b last:border-0 ${idx === selectedIndex ? "bg-indigo-600 text-white" : "text-slate-700 hover:bg-slate-50"}`}>
                        {s}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => agregarAntibiotico()} className="bg-indigo-600 hover:bg-indigo-500 p-3 rounded-xl text-white shadow-lg"><Plus size={18} /></button>
            </div>
          </div>
          <div className="overflow-x-auto min-h-[200px]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-800/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                  <th className="px-8 py-4 text-left">Fármaco</th>
                  <th className="px-8 py-4 text-center">G. Aislado A</th>
                  <th className="px-8 py-4 text-center">G. Aislado B</th>
                  <th className="px-8 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {(resultados?.antibiograma_list || []).map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-8 py-4 font-black text-slate-200">{item.nombre}</td>
                    <td onClick={() => toggleValor(item.nombre, "a")} className="px-8 py-4 text-center cursor-pointer select-none">
                      <span className={`inline-block w-10 py-1.5 rounded-lg font-black text-[11px] ${item.a === "S" ? "bg-emerald-500/10 text-emerald-400" : item.a === "R" ? "bg-rose-500/10 text-rose-400" : item.a === "I" ? "bg-amber-500/10 text-amber-400" : "bg-slate-700 text-slate-500"}`}>
                        {item.a || "-"}
                      </span>
                    </td>
                    <td onClick={() => toggleValor(item.nombre, "b")} className="px-8 py-4 text-center cursor-pointer select-none">
                      <span className={`inline-block w-10 py-1.5 rounded-lg font-black text-[11px] ${item.b === "S" ? "bg-emerald-500/10 text-emerald-400" : item.b === "R" ? "bg-rose-500/10 text-rose-400" : item.b === "I" ? "bg-amber-500/10 text-amber-400" : "bg-slate-700 text-slate-500"}`}>
                        {item.b || "-"}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <button onClick={() => eliminarAntibiotico(item.nombre)} className="text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SECCIÓN LATERAL: GESTOR DE PLANTILLAS */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        <div className="bg-slate-900 rounded-[2rem] overflow-hidden shadow-xl flex flex-col h-full max-h-[850px]">
          <div className="p-6 border-b border-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-white">
              <Layers size={18} className="text-indigo-400" />
              <span className="font-black text-sm uppercase tracking-wider">Biblioteca</span>
            </div>
            <div className="relative group">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <input 
                type="text" placeholder="BUSCAR FORMATO..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2 pl-9 pr-4 text-[10px] font-black text-slate-300 outline-none focus:border-indigo-500/50 placeholder:text-slate-600 uppercase tracking-widest"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {plantillasFiltradas.length === 0 ? (
              <div className="py-10 text-center space-y-3">
                <ClipboardList size={32} className="mx-auto text-slate-700 opacity-50" />
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Sin resultados</p>
              </div>
            ) : (
              plantillasFiltradas.map((p) => (
                <div key={p.id} className="group relative animate-in fade-in slide-in-from-right-2 duration-300">
                  <button onClick={() => aplicarPlantilla(p)} className="w-full text-left p-4 bg-slate-800/50 border border-slate-800 rounded-2xl hover:border-indigo-500/50 hover:bg-slate-800 transition-all pr-10">
                    <div className="font-black text-xs text-indigo-100 truncate mb-1 uppercase tracking-tight">{p.nombre_plantilla}</div>
                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter truncate">Origen: {p.muestra_default || "No def."}</div>
                  </button>
                  <button onClick={(e) => eliminarPlantilla(e, p.id)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all p-1">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="p-4 bg-slate-800/30 border-t border-slate-800">
            <button onClick={limpiarFormulario} className="w-full flex items-center justify-center gap-2 py-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl hover:bg-rose-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.2em]">
              <Eraser size={16} /> Vacear Todo
            </button>
          </div>
        </div>
        <div className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100">
          <p className="text-[10px] font-bold text-indigo-400 uppercase leading-relaxed text-center">
            Seleccione una plantilla para autocompletar Gram, Cultivo y Recuento automáticamente.
          </p>
        </div>
      </div>
    </div>
  );
}