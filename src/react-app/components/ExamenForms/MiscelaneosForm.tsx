import { useState, useEffect } from "react";
import {
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

  const labelBase = "text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block";
  const inputBase = "w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-slate-900 transition-all placeholder:text-slate-300";

  if (!Array.isArray(resultados)) return null;

  return (
    <div className="flex flex-col h-full max-h-[80vh] overflow-hidden bg-white border border-slate-200 rounded-2xl">

      {/* TABS - Minimalista */}
      <div className="flex items-center gap-1 p-2 bg-slate-50 border-b border-slate-200 overflow-x-auto no-scrollbar">
        {resultados.map((ex: any, i: number) => (
          <div key={i} className="flex-shrink-0 flex items-center">
            <button
              onClick={() => setIndexActivo(i)}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${indexActivo === i
                ? "bg-slate-900 text-white"
                : "text-slate-400 hover:bg-slate-200"
                }`}
            >
              {ex.examen_solicitado || `Estudio ${i + 1}`}
            </button>
            <button
              onClick={() => eliminarExamenDeLista(i)}
              className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors mr-2"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        <button
          onClick={agregarNuevoExamen}
          className="p-1.5 text-slate-400 hover:text-slate-900 transition-colors border-l border-slate-200 pl-3 ml-1"
          title="Añadir Estudio"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden relative">

        {/* EDITOR */}
        <div className={`flex-1 flex flex-col p-6 space-y-4 overflow-y-auto custom-scrollbar transition-all ${showLibrary ? 'mr-0' : ''}`}>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelBase}>Estudio</label>
              <input
                type="text"
                value={resultados[indexActivo]?.examen_solicitado || ""}
                onChange={(e) => handleChange("examen_solicitado", e.target.value)}
                className={inputBase}
                placeholder="Nombre del examen"
              />
            </div>
            <div>
              <label className={labelBase}>Método</label>
              <input
                type="text"
                value={resultados[indexActivo]?.metodo || ""}
                onChange={(e) => handleChange("metodo", e.target.value)}
                className={inputBase}
                placeholder="Método utilizado"
              />
            </div>
            <div>
              <label className={labelBase}>Muestra</label>
              <input
                type="text"
                value={resultados[indexActivo]?.muestra || ""}
                onChange={(e) => handleChange("muestra", e.target.value)}
                className={inputBase}
                placeholder="Tipo de muestra"
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-[300px] mt-4">
            <div className="flex justify-between items-center mb-2 px-1">
              <label className={labelBase}>Resultados / Informe</label>
              <div className="flex gap-2">
                <button
                  onClick={guardarComoPlantilla}
                  disabled={isSaving}
                  className="text-[9px] font-bold uppercase text-emerald-600 hover:text-emerald-700 transition-colors disabled:opacity-50"
                >
                  Guardar Plantilla
                </button>
                <span className="text-slate-200">|</span>
                <button
                  onClick={() => setShowLibrary(!showLibrary)}
                  className={`text-[9px] font-bold uppercase transition-colors ${showLibrary ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                  {showLibrary ? 'Cerrar Biblioteca' : 'Ver Plantillas'}
                </button>
              </div>
            </div>

            <textarea
              value={resultados[indexActivo]?.resultado_texto || ""}
              onChange={(e) => handleChange("resultado_texto", e.target.value)}
              className="flex-1 w-full p-4 bg-white border border-slate-200 rounded-xl focus:border-slate-900 outline-none text-sm leading-relaxed text-slate-600 resize-none transition-all"
              placeholder="Describa los resultados..."
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