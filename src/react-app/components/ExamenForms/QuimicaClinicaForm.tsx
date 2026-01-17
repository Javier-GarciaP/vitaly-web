import React, { useRef, useEffect } from "react";
import { FlaskConical, Activity, Droplets, HeartPulse, ClipboardList } from "lucide-react";

interface QuimicaClinicaFormProps {
  resultados: any;
  onChange: (resultados: any) => void;
}

export default function QuimicaClinicaForm({ resultados, onChange }: QuimicaClinicaFormProps) {
  const formRef = useRef<HTMLDivElement>(null);

  const handleChange = (field: string, value: string) => {
    onChange({ ...resultados, [field]: value });
  };

  const isHighlighted = (field: string) => resultados?._highlightFields?.includes(field) ? "ring-2 ring-blue-500 bg-blue-50" : "";

  // Cálculos Automáticos
  useEffect(() => {
    // 1. Cálculo de Bilirrubina Indirecta
    const bt = parseFloat(resultados?.bilirr_total);
    const bd = parseFloat(resultados?.bilirr_directa);
    if (!isNaN(bt) && !isNaN(bd)) {
      const bi = (bt - bd).toFixed(2);
      if (resultados?.bilirr_indirecta !== bi) handleChange("bilirr_indirecta", bi);
    }

    // 2. Cálculo de Relación A/G
    const alb = parseFloat(resultados?.albumina);
    const glob = parseFloat(resultados?.globulinas);
    if (!isNaN(alb) && !isNaN(glob) && glob !== 0) {
      const rag = (alb / glob).toFixed(2);
      if (resultados?.relacion_ag !== rag) handleChange("relacion_ag", rag);
    }
  }, [resultados?.bilirr_total, resultados?.bilirr_directa, resultados?.albumina, resultados?.globulinas]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const form = formRef.current;
      if (form) {
        const focusableElements = form.querySelectorAll('input, textarea');
        const index = Array.from(focusableElements).indexOf(e.target as HTMLElement);
        if (index > -1 && index < focusableElements.length - 1) {
          e.preventDefault();
          (focusableElements[index + 1] as HTMLElement).focus();
        }
      }
    }
  };

  const sectionCard = "p-5 rounded-2xl bg-slate-50/50 border border-slate-100 transition-all hover:bg-slate-50 group";
  const labelBase = "text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block";
  const inputBase = "w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[13px] font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300";
  const autoInput = "w-full bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 text-[13px] font-black text-blue-700 outline-none cursor-default";

  return (
    <div className="w-full space-y-6 pb-20" ref={formRef} onKeyDown={handleKeyDown}>

      {/* HEADER SIMPLE */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
          <FlaskConical size={16} />
        </div>
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Química Sanguínea</h3>
      </div>

      <div className="grid grid-cols-1 gap-6">

        {/* GLICEMIA Y RENAL */}
        <div className={sectionCard}>
          <div className="flex items-center gap-2 mb-4">
            <Activity size={14} className="text-blue-600" />
            <h4 className="font-bold text-slate-900 text-[10px] uppercase tracking-wider">Metabolismo & Renal</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className={labelBase}>Glicemia</label>
              <input type="text" value={resultados?.glicemia || ""} onChange={(e) => handleChange("glicemia", e.target.value)} className={`${inputBase} ${isHighlighted("glicemia")}`} placeholder="mg/dL" />
            </div>
            <div>
              <label className={labelBase}>Urea</label>
              <input type="text" value={resultados?.urea || ""} onChange={(e) => handleChange("urea", e.target.value)} className={`${inputBase} ${isHighlighted("urea")}`} placeholder="mg/dL" />
            </div>
            <div>
              <label className={labelBase}>Creatinina</label>
              <input type="text" value={resultados?.creatinina || ""} onChange={(e) => handleChange("creatinina", e.target.value)} className={`${inputBase} ${isHighlighted("creatinina")}`} placeholder="mg/dL" />
            </div>
          </div>
        </div>

        {/* PERFIL LIPÍDICO */}
        <div className={sectionCard}>
          <div className="flex items-center gap-2 mb-4">
            <HeartPulse size={14} className="text-rose-500" />
            <h4 className="font-bold text-slate-900 text-[10px] uppercase tracking-wider">Perfil Lipídico</h4>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className={labelBase}>Colesterol</label>
              <input type="text" value={resultados?.colesterol || ""} onChange={(e) => handleChange("colesterol", e.target.value)} className={`${inputBase} ${isHighlighted("colesterol")}`} placeholder="Total" />
            </div>
            <div>
              <label className={labelBase}>HDL</label>
              <input type="text" value={resultados?.hdl || ""} onChange={(e) => handleChange("hdl", e.target.value)} className={`${inputBase} ${isHighlighted("hdl")}`} placeholder="Bueno" />
            </div>
            <div>
              <label className={labelBase}>Triglicéridos</label>
              <input type="text" value={resultados?.trigliceridos || ""} onChange={(e) => handleChange("trigliceridos", e.target.value)} className={`${inputBase} ${isHighlighted("trigliceridos")}`} />
            </div>
          </div>
        </div>

        {/* PERFIL HEPÁTICO */}
        <div className={sectionCard}>
          <div className="flex items-center gap-2 mb-4">
            <Droplets size={14} className="text-amber-500" />
            <h4 className="font-bold text-slate-900 text-[10px] uppercase tracking-wider">Hepático & Enzimas</h4>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              <div>
                <label className={labelBase}>TGO</label>
                <input type="text" value={resultados?.tgo || ""} onChange={(e) => handleChange("tgo", e.target.value)} className={`${inputBase} ${isHighlighted("tgo")}`} />
              </div>
              <div>
                <label className={labelBase}>TGP</label>
                <input type="text" value={resultados?.tgp || ""} onChange={(e) => handleChange("tgp", e.target.value)} className={`${inputBase} ${isHighlighted("tgp")}`} />
              </div>
              <div>
                <label className={labelBase}>Fosf.</label>
                <input type="text" value={resultados?.fosf_alc || ""} onChange={(e) => handleChange("fosf_alc", e.target.value)} className={`${inputBase} ${isHighlighted("fosf_alc")}`} />
              </div>
              <div>
                <label className={labelBase}>LDH</label>
                <input type="text" value={resultados?.ldh || ""} onChange={(e) => handleChange("ldh", e.target.value)} className={`${inputBase} ${isHighlighted("ldh")}`} />
              </div>
              <div>
                <label className={labelBase}>Amilasa</label>
                <input type="text" value={resultados?.amilasa || ""} onChange={(e) => handleChange("amilasa", e.target.value)} className={`${inputBase} ${isHighlighted("amilasa")}`} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 border-t border-slate-100 pt-3">
              <div>
                <label className={labelBase}>Bilirr. Tot.</label>
                <input type="text" value={resultados?.bilirr_total || ""} onChange={(e) => handleChange("bilirr_total", e.target.value)} className={`${inputBase} ${isHighlighted("bilirr_total")}`} />
              </div>
              <div>
                <label className={labelBase}>Bilirr. Dir.</label>
                <input type="text" value={resultados?.bilirr_directa || ""} onChange={(e) => handleChange("bilirr_directa", e.target.value)} className={`${inputBase} ${isHighlighted("bilirr_directa")}`} />
              </div>
              <div>
                <label className={`${labelBase} text-blue-500`}>Indir. <span className="opacity-50">(Auto)</span></label>
                <input type="text" value={resultados?.bilirr_indirecta || ""} readOnly className={autoInput} />
              </div>
            </div>
          </div>
        </div>

        {/* PROTEÍNAS */}
        <div className={sectionCard}>
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList size={14} className="text-indigo-500" />
            <h4 className="font-bold text-slate-900 text-[10px] uppercase tracking-wider">Proteínas</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className={labelBase}>Proteínas T.</label>
              <input type="text" value={resultados?.proteinas_tot || ""} onChange={(e) => handleChange("proteinas_tot", e.target.value)} className={`${inputBase} ${isHighlighted("proteinas_tot")}`} />
            </div>
            <div>
              <label className={labelBase}>Albúmina</label>
              <input type="text" value={resultados?.albumina || ""} onChange={(e) => handleChange("albumina", e.target.value)} className={`${inputBase} ${isHighlighted("albumina")}`} />
            </div>
            <div>
              <label className={labelBase}>Globulinas</label>
              <input type="text" value={resultados?.globulinas || ""} onChange={(e) => handleChange("globulinas", e.target.value)} className={`${inputBase} ${isHighlighted("globulinas")}`} />
            </div>
            <div>
              <label className={labelBase}>Ác. Úrico</label>
              <input type="text" value={resultados?.ac_urico || ""} onChange={(e) => handleChange("ac_urico", e.target.value)} className={`${inputBase} ${isHighlighted("ac_urico")}`} />
            </div>
            <div>
              <label className={labelBase}>Calcio</label>
              <input type="text" value={resultados?.calcio || ""} onChange={(e) => handleChange("calcio", e.target.value)} className={`${inputBase} ${isHighlighted("calcio")}`} />
            </div>
            <div>
              <label className={labelBase}>Fósforo</label>
              <input type="text" value={resultados?.fosforo || ""} onChange={(e) => handleChange("fosforo", e.target.value)} className={`${inputBase} ${isHighlighted("fosforo")}`} />
            </div>
            <div className="col-span-2">
              <label className={`${labelBase} text-blue-500`}>Rel. A/G</label>
              <input type="text" value={resultados?.relacion_ag || ""} readOnly className={autoInput} />
            </div>
          </div>
        </div>

        {/* NOTAS */}
        <div>
          <label className={labelBase}>Notas Técnicas</label>
          <textarea
            value={resultados?.observacion || ""}
            onChange={(e) => handleChange("observacion", e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 outline-none focus:border-blue-500 min-h-[80px] resize-none"
            placeholder="Notas del bioanalista..."
          />
        </div>
      </div>
    </div>
  );
}