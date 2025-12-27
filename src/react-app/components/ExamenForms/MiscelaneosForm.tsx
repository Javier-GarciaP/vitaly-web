import { useState, useEffect } from "react";
import {
  Save,
  Trash2,
  Plus,
  Beaker,
  ClipboardList,
  Layers,
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

  // 1. CARGA REAL DESDE LA API
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

  useEffect(() => {
    cargarPlantillas();
  }, []);

  const handleChange = (field: string, value: string) => {
    onChange({ ...resultados, [field]: value });
  };

  const aplicarPlantilla = (p: any) => {
    onChange({
      ...resultados,
      examen_solicitado: p.nombre_examen,
      metodo: p.metodo,
      muestra: p.muestra,
      resultado_texto: p.contenido_plantilla,
    });
  };

  const guardarComoPlantilla = async () => {
    if (!resultados.examen_solicitado) {
      alert("Asigne un nombre al examen solicitado para guardar la plantilla");
      return;
    }

    const payload = {
      nombre_examen: resultados.examen_solicitado,
      metodo: resultados.metodo || "",
      muestra: resultados.muestra || "",
      contenido_plantilla: resultados.resultado_texto || "",
    };

    try {
      const res = await fetch("/api/plantillas/miscelaneos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Plantilla guardada correctamente");
        cargarPlantillas();
      } else {
        alert("Error al guardar la plantilla");
      }
    } catch (error) {
      alert("Error de conexión");
    }
  };

  const eliminarPlantilla = async (id: number) => {
    if (!confirm("¿Seguro que desea eliminar esta plantilla?")) return;

    try {
      const res = await fetch(`/api/plantillas/miscelaneos/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // Filtramos por ID para removerla de la UI instantáneamente
        setPlantillas((prev) => prev.filter((p) => p.id !== id));
        // Si tienes un sistema de notificaciones:
        // notify("Plantilla eliminada correctamente");
      }
    } catch (error) {
      console.error("Error de red al eliminar:", error);
      alert("No se pudo conectar con el servidor.");
    }
  };

  const limpiarCampos = () => {
    onChange({
      examen_solicitado: "",
      metodo: "",
      muestra: "",
      resultado_texto: "",
    });
  };

  const labelBase =
    "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block";
  const inputBase =
    "w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all";

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto pb-10">
      {/* SECCIÓN PRINCIPAL: EDITOR */}
      <div className="flex-1 space-y-6">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8">
          <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Beaker size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">
                Editor de Resultados
              </h3>
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em]">
                Exámenes Especiales / Misceláneos
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <label className={labelBase}>Examen Solicitado</label>
              <input
                type="text"
                value={resultados?.examen_solicitado || ""}
                onChange={(e) =>
                  handleChange("examen_solicitado", e.target.value)
                }
                className={inputBase}
                placeholder="Ej. Prueba de Esfuerzo"
              />
            </div>
            <div>
              <label className={labelBase}>Método</label>
              <input
                type="text"
                value={resultados?.metodo || ""}
                onChange={(e) => handleChange("metodo", e.target.value)}
                className={inputBase}
                placeholder="Inmunoensayo..."
              />
            </div>
            <div>
              <label className={labelBase}>Muestra</label>
              <input
                type="text"
                value={resultados?.muestra || ""}
                onChange={(e) => handleChange("muestra", e.target.value)}
                className={inputBase}
                placeholder="Suero, Orina..."
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-end px-1">
              <div>
                <label className={labelBase}>Desarrollo del Informe</label>
                <p className="text-[10px] text-slate-400 font-medium">
                  Use este espacio para detallar hallazgos clínicos
                </p>
              </div>
              <button
                onClick={guardarComoPlantilla}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-emerald-500 text-white px-4 py-2 rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100"
              >
                <Save size={14} /> Guardar Plantilla
              </button>
            </div>

            <textarea
              value={resultados?.resultado_texto || ""}
              onChange={(e) => handleChange("resultado_texto", e.target.value)}
              className="w-full p-8 bg-slate-50 border-2 border-slate-100 rounded-[2rem] focus:border-indigo-500 focus:bg-white outline-none min-h-[400px] font-mono text-sm leading-relaxed text-slate-600 shadow-inner"
              placeholder="Comience a escribir el informe final..."
            />
          </div>
        </div>
      </div>

      {/* SECCIÓN LATERAL: GESTOR DE PLANTILLAS */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        <div className="bg-slate-900 rounded-[2rem] overflow-hidden shadow-xl flex flex-col h-full max-h-[750px]">
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center gap-3 text-white mb-1">
              <Layers size={18} className="text-indigo-400" />
              <span className="font-black text-sm uppercase tracking-wider">
                Biblioteca
              </span>
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase">
              Plantillas Guardadas
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {plantillas.length === 0 ? (
              <div className="py-10 text-center space-y-3">
                <ClipboardList
                  size={32}
                  className="mx-auto text-slate-700 opacity-50"
                />
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                  Sin plantillas
                </p>
              </div>
            ) : (
              plantillas.map((p) => (
                <div
                  key={p.id}
                  className="group relative animate-in fade-in slide-in-from-right-2 duration-300"
                >
                  <button
                    onClick={() => aplicarPlantilla(p)}
                    className="w-full text-left p-4 bg-slate-800/50 border border-slate-800 rounded-2xl hover:border-indigo-500/50 hover:bg-slate-800 transition-all pr-10"
                  >
                    <div className="font-black text-xs text-indigo-100 truncate mb-1 uppercase tracking-tight">
                      {p.nombre_examen}
                    </div>
                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
                      Met: {p.metodo || "N/A"}
                    </div>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      eliminarPlantilla(p.id);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="p-4 bg-slate-800/30 border-t border-slate-800">
            <button
              onClick={limpiarCampos}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.2em]"
            >
              <Plus size={16} /> Nueva en Blanco
            </button>
          </div>
        </div>

        {/* INFO CARD */}
        <div className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100">
          <p className="text-[10px] font-bold text-indigo-400 uppercase leading-relaxed text-center">
            Las plantillas guardadas incluyen formato de texto, método y tipo de
            muestra.
          </p>
        </div>
      </div>
    </div>
  );
}
