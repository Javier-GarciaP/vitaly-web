import React, { useRef, useEffect } from "react";
import { Droplets, Dna, FileText, AlertCircle } from "lucide-react";

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
        du: resultados.du || "Neg.(-)"
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

  const labelBase = "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block";
  const selectBase = "w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-rose-500 focus:bg-white transition-all appearance-none cursor-pointer";

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10" ref={formRef} onKeyDown={handleKeyDown}>
      
      {/* CABECERA ESTILO HEMATOLOGÍA */}
      <div className="flex items-center gap-4 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="w-14 h-14 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-200 animate-pulse">
          <Droplets size={28} />
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Grupo Sanguíneo y Factor Rh</h3>
          <p className="text-[10px] font-bold text-rose-400 uppercase tracking-[0.2em]">Inmunohematología Clínica</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* PANEL DE SELECCIÓN */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Dna size={18} className="text-slate-400" />
            <h4 className="font-black text-slate-700 text-xs uppercase tracking-wider">Configuración de Tipaje</h4>
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
                <option value="Neg.(-)">No Detectado / Negativo</option>
                <option value="Post.(+)">Detectado / Positivo</option>
              </select>
            </div>
          </div>
        </div>

        {/* VISUALIZADOR DE RESULTADO TIPO CARNET */}
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="relative group w-full max-w-[300px]">
            {/* Fondo decorativo */}
            <div className="absolute -inset-1 bg-gradient-to-r from-rose-500 to-orange-500 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            
            <div className="relative bg-white border border-slate-100 rounded-[2rem] p-8 text-center shadow-xl">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Tipificación Final</span>
              
              <div className="flex items-center justify-center mt-4">
                <span className="text-8xl font-black text-slate-800 leading-none">
                  {resultados?.grupo_sanguineo || "O"}
                </span>
                <span className="text-6xl font-black text-rose-500 ml-2 self-start mt-2">
                  {resultados?.factor_rh === "Post.(+)" ? "+" : resultados?.factor_rh === "Neg.(-)" ? "−" : ""}
                </span>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-50">
                 <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-900 rounded-full">
                    <div className={`w-2 h-2 rounded-full ${resultados?.factor_rh === "Post.(+)" ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                      {resultados?.factor_rh === "Post.(+)" ? "RH POSITIVO" : "RH NEGATIVO"}
                    </span>
                 </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-400 bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
            <AlertCircle size={16} />
            <p className="text-[10px] font-bold uppercase tracking-tight leading-relaxed">
              Verifique la aglutinación en placa <br/> antes de confirmar el resultado.
            </p>
          </div>
        </div>

        {/* OBSERVACIONES */}
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center gap-2 ml-4">
            <FileText size={14} className="text-slate-400" />
            <label className={labelBase}>Notas de Laboratorio</label>
          </div>
          <textarea
            value={resultados?.observacion || ""}
            onChange={(e) => handleChange("observacion", e.target.value)}
            className="w-full bg-white border-2 border-slate-100 rounded-[2rem] px-8 py-6 text-sm font-medium text-slate-600 outline-none focus:border-rose-500 transition-all min-h-[100px] shadow-sm resize-none"
            placeholder="Escriba aquí observaciones sobre aglutinación débil, pruebas cruzadas, etc."
          />
        </div>
      </div>
    </div>
  );
}