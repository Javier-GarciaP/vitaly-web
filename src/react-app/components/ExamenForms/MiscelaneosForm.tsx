import { useState, useEffect } from "react";
import {
  Save,
  Trash2,
  Plus,
  Layers,
  Search,
  X,
} from "lucide-react";
import { MiscelaneosData } from "@/types/types";

interface MiscelaneosFormProps {
  resultados: any;
  onChange: (resultados: any) => void;
}

export default function MiscelaneosForm({
  resultados,
  onChange,
}: MiscelaneosFormProps) {
  const [plantillas, setPlantillas] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [indexActivo, setIndexActivo] = useState(0);
  const [showLibrary, setShowLibrary] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!Array.isArray(resultados) || resultados.length === 0) {
      onChange([{ examen_solicitado: "", metodo: "", muestra: "", resultado_texto: "" }]);
    }
  }, []);

  const cargarPlantillas = async () => {
    try {
      const res = await fetch("/api/plantillas/miscelaneos");
      if (res.ok) {
        const data = (await res.json()) as MiscelaneosData[];
        setPlantillas(data);
      }
    } catch (error) {
      console.error("Error cargando plantillas:", error);
    }
  };

  useEffect(() => { cargarPlantillas(); }, []);

  const plantillasFiltradas = plantillas.filter((p) =>
    p.nombre_examen?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.metodo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChange = (field: string, value: string) => {
    const nuevosResultados = [...resultados];
    nuevosResultados[indexActivo] = { ...nuevosResultados[indexActivo], [field]: value };
    onChange(nuevosResultados);
  };

  const agregarNuevoExamen = () => {
    const nuevo = { examen_solicitado: "", metodo: "", muestra: "", resultado_texto: "" };
    onChange([...resultados, nuevo]);
    setIndexActivo(resultados.length);
  };

  const eliminarExamenDeLista = (idx: number) => {
    if (resultados.length === 1) return;
    const filtrados = resultados.filter((_: any, i: number) => i !== idx);
    onChange(filtrados);
    setIndexActivo(0);
  };

  const aplicarPlantilla = (p: any) => {
    const nuevosResultados = [...resultados];
    nuevosResultados[indexActivo] = {
      ...nuevosResultados[indexActivo],
      examen_solicitado: p.nombre_examen,
      metodo: p.metodo,
      muestra: p.muestra,
      resultado_texto: p.contenido_plantilla,
    };
    onChange(nuevosResultados);
  };

  const guardarComoPlantilla = async () => {
    const actual = resultados[indexActivo];
    if (!actual?.examen_solicitado) {
      alert("Asigne un nombre al examen solicitado antes de guardar");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/plantillas/miscelaneos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre_examen: actual.examen_solicitado,
          metodo: actual.metodo || "",
          muestra: actual.muestra || "",
          contenido_plantilla: actual.resultado_texto || "",
        }),
      });

      if (res.ok) {
        await cargarPlantillas();
        setShowLibrary(true); // Abrimos la biblioteca para ver la nueva plantilla
      }
    } catch (error) {
      alert("Error al guardar plantilla");
    } finally {
      setIsSaving(false);
    }
  };

  const eliminarPlantillaBase = async (id: number) => {
    if (!confirm("¿Eliminar esta plantilla definitivamente?")) return;
    try {
      const res = await fetch(`/api/plantillas/miscelaneos/${id}`, { method: "DELETE" });
      if (res.ok) setPlantillas((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const labelBase = "text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block";
  const inputBase = "w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all";

  if (!Array.isArray(resultados)) return null;

  return (
    <div className="flex flex-col h-full max-h-[80vh] overflow-hidden bg-white border border-slate-200 rounded-2xl">
      
      {/* TABS SUPERIORES */}
      <div className="flex items-center gap-2 p-3 bg-slate-50 border-b border-slate-200 overflow-x-auto no-scrollbar">
        {resultados.map((ex: any, i: number) => (
          <div key={i} className="flex-shrink-0 flex items-center group">
            <button
              onClick={() => setIndexActivo(i)}
              className={`px-4 py-2 rounded-l-lg text-[10px] font-black uppercase tracking-tight transition-all border-y border-l ${
                indexActivo === i 
                ? "bg-indigo-600 border-indigo-600 text-white shadow-sm" 
                : "bg-white border-slate-200 text-slate-400 hover:text-slate-600"
              }`}
            >
              {ex.examen_solicitado || `Examen ${i + 1}`}
            </button>
            <button 
              onClick={() => eliminarExamenDeLista(i)}
              className={`px-2 py-2 rounded-r-lg border-y border-r transition-all ${
                indexActivo === i ? "bg-indigo-600 border-indigo-600 text-indigo-200 hover:text-white" : "bg-white border-slate-200 text-slate-300 hover:text-rose-500"
              }`}
            >
              <X size={14} />
            </button>
          </div>
        ))}
        <button 
          onClick={agregarNuevoExamen}
          className="flex items-center gap-2 px-3 py-2 bg-white text-indigo-600 border border-dashed border-indigo-300 rounded-lg hover:bg-indigo-50 transition-all text-[10px] font-bold uppercase ml-2"
        >
          <Plus size={14} /> Nuevo Examen
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* EDITOR */}
        <div className={`flex-1 flex flex-col p-6 space-y-4 overflow-y-auto custom-scrollbar transition-all ${showLibrary ? 'mr-0' : ''}`}>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelBase}>Nombre del Examen</label>
              <input
                type="text"
                value={resultados[indexActivo]?.examen_solicitado || ""}
                onChange={(e) => handleChange("examen_solicitado", e.target.value)}
                className={inputBase}
                placeholder="Ej: Citología"
              />
            </div>
            <div>
              <label className={labelBase}>Método</label>
              <input
                type="text"
                value={resultados[indexActivo]?.metodo || ""}
                onChange={(e) => handleChange("metodo", e.target.value)}
                className={inputBase}
                placeholder="Ej: Coloración de Papanicolaou"
              />
            </div>
            <div>
              <label className={labelBase}>Tipo de Muestra</label>
              <input
                type="text"
                value={resultados[indexActivo]?.muestra || ""}
                onChange={(e) => handleChange("muestra", e.target.value)}
                className={inputBase}
                placeholder="Ej: Exudado Vaginal"
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-[350px] mt-2">
            <div className="flex justify-between items-end mb-2">
              <label className={labelBase}>Descripción de Resultados / Informe</label>
              <div className="flex gap-2">
                <button
                  onClick={guardarComoPlantilla}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 text-[9px] font-black uppercase bg-emerald-500 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-600 transition-all shadow-sm disabled:opacity-50"
                >
                  <Save size={14} /> {isSaving ? 'Guardando...' : 'Crear Plantilla'}
                </button>
                <button
                  onClick={() => setShowLibrary(!showLibrary)}
                  className={`flex items-center gap-1.5 text-[9px] font-black uppercase px-3 py-1.5 rounded-lg transition-all border ${
                    showLibrary ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Layers size={14} /> Biblioteca
                </button>
              </div>
            </div>

            <textarea
              value={resultados[indexActivo]?.resultado_texto || ""}
              onChange={(e) => handleChange("resultado_texto", e.target.value)}
              className="flex-1 w-full p-6 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white outline-none font-mono text-[13px] leading-relaxed text-slate-700 shadow-inner resize-none transition-colors"
              placeholder="Escriba el informe detallado..."
            />
          </div>
        </div>

        {/* BIBLIOTECA LATERAL */}
        {showLibrary && (
          <div className="w-72 bg-slate-900 flex flex-col border-l border-slate-800 animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <Layers size={14} className="text-indigo-400" /> Mis Plantillas
                </span>
                <button onClick={() => setShowLibrary(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X size={16} />
                </button>
              </div>
              <div className="relative">
                <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text"
                  placeholder="FILTRAR..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-800 border-none rounded-lg py-2 pl-9 pr-4 text-[10px] text-white outline-none focus:ring-1 focus:ring-indigo-500 uppercase font-bold"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
              {plantillasFiltradas.length > 0 ? (
                plantillasFiltradas.map((p) => (
                  <div key={p.id} className="group relative">
                    <button
                      onClick={() => aplicarPlantilla(p)}
                      className="w-full text-left p-3 bg-slate-800/40 border border-slate-800 rounded-lg hover:border-indigo-500/50 hover:bg-slate-800 transition-all pr-10"
                    >
                      <div className="font-bold text-[10px] text-indigo-100 uppercase truncate">
                        {p.nombre_examen}
                      </div>
                      <div className="text-[8px] text-slate-500 uppercase mt-1">
                        {p.metodo || 'Sin método'}
                      </div>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); eliminarPlantillaBase(p.id); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">No hay plantillas</p>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-indigo-900/10 border-t border-slate-800">
              <p className="text-[9px] text-indigo-300 font-medium leading-tight text-center">
                Al crear una plantilla, aparecerá aquí automáticamente.
              </p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
      `}</style>
    </div>
  );
}