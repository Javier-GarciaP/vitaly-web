import { useState, useEffect } from "react";
import { Save, ClipboardList, Plus, Trash2, X, TestTube2, FlaskConical } from "lucide-react";

interface BacteriologiaFormProps {
  resultados: any;
  onChange: (resultados: any) => void;
}

export default function BacteriologiaForm({ resultados, onChange }: BacteriologiaFormProps) {
  const [textoAnti, setTextoAnti] = useState("");
  const [sugerencias, setSugerencias] = useState<string[]>([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [plantillas, setPlantillas] = useState<any[]>([]);
  const [showPlantillas, setShowPlantillas] = useState(false);

  const listaAntibioticos = [
    "Amikacina", "Amoxi-Ac.Clavulánico", "Ampicilina-Sulbactan", "Cefepime", "Aztreonar", "Ceftazidima",
    "Ceftriaxone", "Meropenem", "Imipenem", "Ertapenem", "Ciprofloxacina", "Levofloxacina",
    "Nitrofurantoina", "Trimetropin-Sulfa", "Pipera-Tazobac", "Eritromicina", "Clindamicina",
    "Rifampicina", "Ampicilina", "Linezolid", "Azitromicina", "Oxacilina", "Tigeciclina", "Colistin", "Gentamicina"
  ];

  const germenes = ["Negativo", "Escherichia coli", "Staphylococcus aureus", "Proteus vulgaris", "Klebsiella pneumoniae", "Pseudomonas aeruginosa"];

  // --- SOLUCIÓN AL PROBLEMA DE GUARDADO ---
  // Sincroniza el estado inicial si los selects vienen vacíos para que el primer valor sea real
  useEffect(() => {
    if (resultados && !resultados.germen_a) {
      onChange({ ...resultados, germen_a: germenes[0], germen_b: "Negativo" });
    }
  }, []);

  const cargarPlantillas = async () => {
    try {
      const res = await fetch('/api/plantillas/bacteriologia');
      if (res.ok) setPlantillas(await res.json());
    } catch (e) { console.error(e); }
  };

  useEffect(() => { cargarPlantillas(); }, []);

  const handleChange = (field: string, value: any) => {
    onChange({ ...resultados, [field]: value });
  };

  const manejarEscrituraAnti = (val: string) => {
    setTextoAnti(val);
    if (val.trim().length > 0) {
      const filtradas = listaAntibioticos.filter(a => 
        a.toLowerCase().includes(val.toLowerCase())
      );
      setSugerencias(filtradas);
      setMostrarSugerencias(true);
    } else {
      setMostrarSugerencias(false);
    }
  };

  const agregarAntibiotico = (nombre?: string) => {
    const nombreFinal = nombre || textoAnti;
    if (!nombreFinal.trim()) return;

    const actual = resultados.antibiograma_list || [];
    if (actual.find((item: any) => item.nombre.toLowerCase() === nombreFinal.toLowerCase())) {
        setTextoAnti("");
        setMostrarSugerencias(false);
        return;
    }

    const nuevaLista = [...actual, { nombre: nombreFinal, a: "", b: "" }];
    handleChange("antibiograma_list", nuevaLista);
    setTextoAnti("");
    setMostrarSugerencias(false);
  };

  const proximoValor = (actual: string) => {
    if (!actual) return "S";
    if (actual === "S") return "R";
    if (actual === "R") return "I";
    return "";
  };

  const toggleValor = (nombre: string, campo: 'a' | 'b') => {
    const nuevaLista = (resultados.antibiograma_list || []).map((item: any) => {
      if (item.nombre === nombre) {
        return { ...item, [campo]: proximoValor(item[campo]) };
      }
      return item;
    });
    handleChange("antibiograma_list", nuevaLista);
  };

  const eliminarAntibiotico = (nombre: string) => {
    const nuevaLista = resultados.antibiograma_list.filter((item: any) => item.nombre !== nombre);
    handleChange("antibiograma_list", nuevaLista);
  };

  const aplicarPlantilla = (p: any) => {
    onChange({
      ...resultados,
      muestra: p.muestra_default,
      obs_directa: p.observacion_directa,
      gram: p.tincion_gram,
      recuento: p.recuento_colonias,
      cultivo: p.cultivo,
      cultivo_hongos: p.cultivo_hongos
    });
    setShowPlantillas(false);
  };

  const inputBase = "w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all";
  const labelBase = "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block";
  const areaBase = "w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 outline-none focus:border-indigo-500 focus:bg-white transition-all min-h-[100px] resize-none";

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-10">
      
      {/* HEADER E INTERACCIONES */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <FlaskConical size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Análisis Bacteriológico</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Módulo de Cultivos y Antibiograma</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
            <div className="relative">
                <button 
                  onClick={() => setShowPlantillas(!showPlantillas)} 
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-black hover:bg-indigo-600 hover:text-white transition-all uppercase tracking-widest"
                >
                  <ClipboardList size={16} /> Plantillas
                </button>

                {showPlantillas && (
                    <div className="absolute z-[100] top-full mt-3 right-0 w-72 bg-white shadow-2xl border border-slate-100 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                        <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                            <span className="font-black text-[10px] text-slate-500 uppercase">Seleccionar Formato</span>
                            <X size={14} className="cursor-pointer" onClick={() => setShowPlantillas(false)}/>
                        </div>
                        <div className="max-h-64 overflow-y-auto p-2">
                            {plantillas.map(p => (
                                <button key={p.id} onClick={() => aplicarPlantilla(p)} className="w-full text-left p-3 hover:bg-indigo-50 rounded-xl transition-colors group">
                                    <p className="text-xs font-bold text-slate-700 group-hover:text-indigo-600">{p.nombre_plantilla}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <button onClick={() => {}} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-black hover:bg-emerald-600 transition-all uppercase tracking-widest shadow-lg shadow-emerald-100">
              <Save size={16} /> Guardar
            </button>
        </div>
      </div>

      {/* SECCIÓN PRINCIPAL: DATOS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
                <div>
                  <label className={labelBase}>Muestra / Origen</label>
                  <input type="text" value={resultados?.muestra || ""} onChange={(e) => handleChange("muestra", e.target.value)} className={inputBase} placeholder="Ej. Orina, Secreción..." />
                </div>
                <div>
                  <label className={labelBase}>Germen Principal (A)</label>
                  <select value={resultados?.germen_a || ""} onChange={(e) => handleChange("germen_a", e.target.value)} className={inputBase}>
                    {germenes.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelBase}>Germen Secundario (B)</label>
                  <select value={resultados?.germen_b || ""} onChange={(e) => handleChange("germen_b", e.target.value)} className={inputBase}>
                    {germenes.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
            </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                <div><label className={labelBase}>Observación Directa</label><textarea value={resultados?.obs_directa || ""} onChange={(e) => handleChange("obs_directa", e.target.value)} className={areaBase} /></div>
                <div><label className={labelBase}>Tinción de Gram</label><textarea value={resultados?.gram || ""} onChange={(e) => handleChange("gram", e.target.value)} className={areaBase} /></div>
            </div>
            <div className="space-y-6 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                <div><label className={labelBase}>Recuento de Colonias</label><textarea value={resultados?.recuento || ""} onChange={(e) => handleChange("recuento", e.target.value)} className={areaBase} /></div>
                <div><label className={labelBase}>Cultivo (Aislamiento)</label><textarea value={resultados?.cultivo || ""} onChange={(e) => handleChange("cultivo", e.target.value)} className={areaBase} /></div>
            </div>
        </div>
      </div>

      {/* ANTIBIOGRAMA PROFESIONAL */}
      <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-800">
        <div className="px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
             <TestTube2 className="text-indigo-400" size={20}/>
             <h4 className="text-white font-black text-sm uppercase tracking-widest">Tabla de Sensibilidad Antibiótica</h4>
          </div>
          
          <div className="relative flex gap-2">
            <div className="relative group">
                <input 
                    type="text"
                    value={textoAnti}
                    onChange={(e) => manejarEscrituraAnti(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && agregarAntibiotico()}
                    placeholder="Buscar antibiótico..."
                    className="bg-slate-800 text-white text-xs px-5 py-3 rounded-xl outline-none w-64 border border-transparent focus:border-indigo-500 transition-all font-bold"
                />
                {mostrarSugerencias && sugerencias.length > 0 && (
                    <div className="absolute z-[110] top-full mt-2 left-0 w-full bg-white border border-slate-100 shadow-2xl rounded-xl overflow-hidden animate-in fade-in duration-200">
                        {sugerencias.map(s => (
                            <div key={s} onClick={() => agregarAntibiotico(s)} className="px-4 py-2.5 text-slate-700 text-xs font-bold hover:bg-indigo-600 hover:text-white cursor-pointer transition-colors border-b border-slate-50 last:border-0">
                                {s}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <button onClick={() => agregarAntibiotico()} className="bg-indigo-600 hover:bg-indigo-500 p-3 rounded-xl text-white transition-transform active:scale-90 shadow-lg shadow-indigo-900/40">
                <Plus size={18}/>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-8 py-4 text-left">Fármaco Analizado</th>
                <th className="px-8 py-4 text-center">{resultados?.germen_a || "GERMEN A"}</th>
                <th className="px-8 py-4 text-center">{resultados?.germen_b || "GERMEN B"}</th>
                <th className="px-8 py-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {(resultados?.antibiograma_list || []).map((item: any) => (
                <tr key={item.nombre} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-8 py-4 font-black text-slate-200">{item.nombre}</td>
                  
                  <td onClick={() => toggleValor(item.nombre, 'a')} className="px-8 py-4 text-center cursor-pointer">
                    <span className={`inline-block w-10 py-1.5 rounded-lg font-black text-[11px] transition-all transform active:scale-75 ${
                      item.a === 'S' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                      item.a === 'R' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 
                      item.a === 'I' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-slate-700 text-slate-500'
                    }`}>
                      {item.a || '-'}
                    </span>
                  </td>

                  <td onClick={() => toggleValor(item.nombre, 'b')} className="px-8 py-4 text-center cursor-pointer">
                    <span className={`inline-block w-10 py-1.5 rounded-lg font-black text-[11px] transition-all transform active:scale-75 ${
                      item.b === 'S' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                      item.b === 'R' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 
                      item.b === 'I' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-slate-700 text-slate-500'
                    }`}>
                      {item.b || '-'}
                    </span>
                  </td>

                  <td className="px-8 py-4 text-right">
                    <button onClick={() => eliminarAntibiotico(item.nombre)} className="p-2 text-slate-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(resultados?.antibiograma_list || []).length === 0 && (
            <div className="py-12 text-center text-slate-500 italic text-xs">
                No hay antibióticos registrados para esta muestra.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}