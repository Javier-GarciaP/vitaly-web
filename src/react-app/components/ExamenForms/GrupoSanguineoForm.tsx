import React, { useRef, useEffect } from "react";
import { Droplets, Dna, AlertCircle } from "lucide-react";

interface GrupoSanguineoFormProps {
  resultados: any;
  onChange: (resultados: any) => void;
}

export default function GrupoSanguineoForm({ resultados, onChange }: GrupoSanguineoFormProps) {
  const formRef = useRef<HTMLDivElement>(null);

  // --- SOLUCIÓN AL PROBLEMA DE GUARDADO ---
  // Sincronizamos valores iniciales para que el estado no esté 'undefined'
  useEffect(() => {
    if (resultados && (!resultados.grupo_sanguineo || !resultados.factor_rh)) {
      onChange({
        ...resultados,
        grupo_sanguineo: resultados.grupo_sanguineo || "O", // Valor común por defecto
        factor_rh: resultados.factor_rh || "Post.(+)",
        du: resultados.du || ""
      });
    }
  }, []);

  const handleChange = (field: string, value: string) => {
    onChange({ ...resultados, [field]: value });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const form = formRef.current;
      if (form) {
        const focusableElements = form.querySelectorAll('select, textarea');
        const index = Array.from(focusableElements).indexOf(e.target as HTMLElement);

        if (index > -1 && index < focusableElements.length - 1) {
          e.preventDefault();
          (focusableElements[index + 1] as HTMLElement).focus();
        }
      }
    }
  };

  const labelBase = "text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block";
  const selectBase = "w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[12px] font-bold text-slate-700 outline-none focus:border-rose-500 transition-all cursor-pointer";
  const sectionCard = "p-5 rounded-2xl bg-slate-50/50 border border-slate-100 transition-all hover:bg-slate-50 group";

  return (
    <div className="w-full space-y-6 pb-20" ref={formRef} onKeyDown={handleKeyDown}>

      {/* HEADER SIMPLE */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="w-8 h-8 bg-rose-50 text-rose-500 rounded-lg flex items-center justify-center">
          <Droplets size={16} />
        </div>
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Inmunohematología</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

        {/* PANEL DE SELECCIÓN */}
        <div className={sectionCard}>
          <div className="flex items-center gap-2 mb-4">
            <Dna size={14} className="text-slate-400" />
            <h4 className="font-bold text-slate-900 text-[10px] uppercase tracking-wider">Configuración de Tipaje</h4>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <label className={labelBase}>Grupo Sanguíneo (Sistema ABO)</label>
              <select
                value={resultados?.grupo_sanguineo || "O"}
                onChange={(e) => handleChange("grupo_sanguineo", e.target.value)}
                className={selectBase}
              >
                <option value="A">Grupo A</option>
                <option value="B">Grupo B</option>
                <option value="AB">Grupo AB</option>
                <option value="O">Grupo O</option>
              </select>
            </div>

            <div className="relative">
              <label className={labelBase}>Factor RH</label>
              <select
                value={resultados?.factor_rh || "Post.(+)"}
                onChange={(e) => handleChange("factor_rh", e.target.value)}
                className={selectBase}
              >
                <option value="Post.(+)">Positivo (+)</option>
                <option value="Neg.(-)">Negativo (-)</option>
              </select>
            </div>

            <div className="relative">
              <label className={labelBase}>Variante Du (Si aplica)</label>
              <select
                value={resultados?.du || "Neg.(-)"}
                onChange={(e) => handleChange("du", e.target.value)}
                className={selectBase}
              >
                <option value=" ">Seleccionar...</option>
                <option value="Neg.(-)">No Detectado / Negativo</option>
                <option value="Post.(+)">Detectado / Positivo</option>
              </select>
            </div>
          </div>
        </div>

        {/* VISUALIZADOR DE RESULTADO */}
        <div className="flex flex-col items-center justify-center space-y-4">

          <div className="w-full bg-slate-900 rounded-2xl p-6 text-center shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Droplets size={64} className="text-white" />
            </div>

            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Tipificación Final</p>

            <div className="flex items-center justify-center">
              <span className="text-6xl font-black text-white leading-none">
                {resultados?.grupo_sanguineo || "O"}
              </span>
              <span className={`text-4xl font-black ml-2 self-start mt-1 ${resultados?.factor_rh === "Post.(+)" ? "text-emerald-400" : "text-rose-400"}`}>
                {resultados?.factor_rh === "Post.(+)" ? "+" : resultados?.factor_rh === "Neg.(-)" ? "−" : ""}
              </span>
            </div>

            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full">
              <div className={`w-1.5 h-1.5 rounded-full ${resultados?.factor_rh === "Post.(+)" ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
              <span className="text-[9px] font-bold text-white uppercase tracking-widest">
                {resultados?.factor_rh === "Post.(+)" ? "Positivo" : "Negativo"}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 text-slate-400 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 w-full">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <p className="text-[9px] font-bold uppercase tracking-tight leading-relaxed">
              Verifique la aglutinación en placa antes de confirmar.
            </p>
          </div>
        </div>

        {/* OBSERVACIONES */}
        <div className="md:col-span-2 space-y-3">
          <label className={labelBase}>Notas de Laboratorio</label>
          <textarea
            value={resultados?.observacion || ""}
            onChange={(e) => handleChange("observacion", e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 outline-none focus:border-rose-500 transition-all min-h-[80px] resize-none"
            placeholder="Escriba aquí observaciones sobre aglutinación débil, pruebas cruzadas, etc."
          />
        </div>
      </div>
    </div>
  );
}