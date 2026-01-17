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

  /* ESTILOS MINIMALISTAS */
  const labelBase = "text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block";
  const inputBase = "w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-slate-900 transition-all placeholder:text-slate-300";
  const sectionCard = "p-4 rounded-xl bg-white border border-slate-100 shadow-sm transition-all hover:shadow-md";

  if (!Array.isArray(resultados)) return null;

  return (
    <div className="flex flex-col h-full bg-white w-full">
      {/* TABS DE EXÁMENES */}
      <div className="flex items-center gap-2 pb-2 bg-white border-b border-slate-100 overflow-x-auto no-scrollbar mb-4">
        {resultados.map((ex: any, i: number) => (
          <div key={i} className="flex-shrink-0 flex items-center group">
            <button
              onClick={() => setIndexActivo(i)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all border ${indexActivo === i
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
                }`}
            >
              <span className="truncate max-w-[80px] inline-block align-bottom">{ex.examen_solicitado || `Estudio ${i + 1}`}</span>
            </button>
            {resultados.length > 1 && (
              <button
                onClick={() => eliminarExamenDeLista(i)}
                className="ml-1 p-1 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <X size={10} />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={agregarNuevoExamen}
          className="p-1.5 bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all border border-slate-200"
          title="Añadir Estudio"
        >
          <Plus size={14} />
        </button>
      </div>

      <div className="flex-1 space-y-4 pb-20">

        <div className={sectionCard}>
          <div className="grid grid-cols-1 gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className={labelBase}>Estudio Solicitado</label>
                <input
                  type="text"
                  value={resultados[indexActivo]?.examen_solicitado || ""}
                  onChange={(e) => handleChange("examen_solicitado", e.target.value)}
                  className={inputBase}
                  placeholder="Nombre del examen"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelBase}>Método</label>
                <input
                  type="text"
                  value={resultados[indexActivo]?.metodo || ""}
                  onChange={(e) => handleChange("metodo", e.target.value)}
                  className={inputBase}
                  placeholder="Método..."
                />
              </div>
              <div>
                <label className={labelBase}>Muestra</label>
                <input
                  type="text"
                  value={resultados[indexActivo]?.muestra || ""}
                  onChange={(e) => handleChange("muestra", e.target.value)}
                  className={inputBase}
                  placeholder="Tipo..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-2 px-1">
            <label className={labelBase}>Resultados / Informe</label>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLibrary(true)}
                className="text-[9px] font-bold uppercase text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-1"
              >
                <Search size={10} /> Plantillas
              </button>
              <button
                onClick={guardarComoPlantilla}
                disabled={isSaving}
                className="text-[9px] font-bold uppercase text-emerald-600 hover:text-emerald-700 transition-colors disabled:opacity-50"
              >
                Guardar
              </button>
            </div>
          </div>

          <textarea
            value={resultados[indexActivo]?.resultado_texto || ""}
            onChange={(e) => handleChange("resultado_texto", e.target.value)}
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-slate-900 outline-none text-xs leading-relaxed text-slate-700 resize-none transition-all min-h-[200px]"
            placeholder="Describa los resultados..."
          />
        </div>
      </div>

      {/* BIBLIOTECA - MODAL */}
      {showLibrary && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setShowLibrary(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl flex flex-col max-h-[60vh] overflow-hidden animate-in zoom-in-95 duration-200">

            <div className="p-3 border-b flex justify-between items-center bg-slate-50">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Layers size={12} /> Biblioteca Misceláneos
              </span>
              <button onClick={() => setShowLibrary(false)} className="text-slate-400 hover:text-slate-900 transition-colors"><X size={16} /></button>
            </div>

            <div className="p-2 border-b">
              <div className="relative">
                <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="BUSCAR..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-100 border-none rounded-lg py-1.5 pl-8 pr-3 text-[10px] text-slate-600 outline-none focus:ring-1 focus:ring-slate-300 uppercase font-bold"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {plantillasFiltradas.length > 0 ? (
                plantillasFiltradas.map((p) => (
                  <div key={p.id} className="group relative flex items-center">
                    <button
                      onClick={() => { aplicarPlantilla(p); setShowLibrary(false); }}
                      className="flex-1 text-left p-2 hover:bg-slate-50 rounded-lg transition-all"
                    >
                      <div className="font-bold text-[10px] text-slate-700 uppercase truncate">
                        {p.nombre_examen}
                      </div>
                      <div className="text-[8px] text-slate-400 uppercase mt-0.5">
                        {p.metodo || 'Sin método'}
                      </div>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); eliminarPlantillaBase(p.id); }}
                      className="p-2 text-slate-200 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-[9px] text-slate-300 font-bold uppercase">No hay plantillas</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}