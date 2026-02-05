import React, { useRef, useEffect } from "react";
import { Activity, Beaker, BarChart3, Clock } from "lucide-react";

interface HematologiaFormProps {
  resultados: any;
  onChange: (resultados: any) => void;
}

export default function HematologiaForm({ resultados, onChange }: HematologiaFormProps) {
  const formRef = useRef<HTMLDivElement>(null);

  const unidades: { [key: string]: string } = {
    hematies: " mill/mm³",
    hemoglobina: " g/dL",
    hematocrito: " %",
    vcm: " fL",
    hcm: " pg",
    chcm: " g/l",
    leucocitos: " /mm³",
    plaquetas: " /mm³",
    neutrofilos: " %",
    linfocitos: " %",
    monocitos: " %",
    eosinofilos: " %",
    basofilos: " %",
    vsg_1h: " mm",
    vsg_2h: " mm",
  };

  const handleChange = (field: string, value: string) => {
    onChange({ ...resultados, [field]: value });
  };

  const isHighlighted = (field: string) => resultados?._highlightFields?.includes(field) ? "ring-2 ring-red-500 bg-red-50" : "";

  // Cálculo del Índice de Katz automático
  useEffect(() => {
    const h1 = parseFloat(resultados?.vsg_1h);
    const h2 = parseFloat(resultados?.vsg_2h);

    if (!isNaN(h1) && !isNaN(h2)) {
      const indice = ((h2 / 2) + h1) / 2;
      const formattedIndice = indice.toFixed(2);
      if (resultados?.vsg_indice !== formattedIndice) {
        handleChange("vsg_indice", formattedIndice);
      }
    }
  }, [resultados?.vsg_1h, resultados?.vsg_2h]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const target = e.target as HTMLInputElement;
      const fieldName = target.name;

      if (unidades[fieldName] && target.value.trim() !== "" && !target.value.includes(unidades[fieldName].trim())) {
        const numericValue = target.value.replace(/[a-zA-Z/%³\s]/g, "").trim();
        if (numericValue !== "") {
          const newValue = numericValue + unidades[fieldName];
          handleChange(fieldName, newValue);
        }
      }

      const form = formRef.current;
      if (form) {
        const focusableElements = form.querySelectorAll('input, textarea');
        const index = Array.from(focusableElements).indexOf(target);
        if (index > -1 && index < focusableElements.length - 1) {
          e.preventDefault();
          (focusableElements[index + 1] as HTMLElement).focus();
        }
      }
    }
  };

  const sectionCard = "p-5 rounded-2xl bg-slate-50/50 border border-slate-100 transition-all hover:bg-slate-50 group";
  const labelBase = "text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block";
  const inputBase = "w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[13px] font-bold text-slate-700 outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all placeholder:text-slate-300";

  return (
    <div className="w-full space-y-6 pb-20" ref={formRef} onKeyDown={handleKeyDown}>

      {/* HEADER SIMPLE */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="w-8 h-8 bg-red-50 text-red-500 rounded-lg flex items-center justify-center">
          <Activity size={16} />
        </div>
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Hematología Completa</h3>
      </div>

      <div className="grid grid-cols-1 gap-6">

        {/* SERIE ROJA */}
        <div className={sectionCard}>
          <div className="flex items-center gap-2 mb-4">
            <Beaker size={14} className="text-red-500" />
            <h4 className="font-bold text-slate-900 text-[10px] uppercase tracking-wider">Serie Roja</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className={labelBase}>Hematíes</label>
              <input name="hematies" type="text" value={resultados?.hematies || ""} onChange={(e) => handleChange("hematies", e.target.value)} className={`${inputBase} ${isHighlighted("hematies")}`} placeholder="4.5 - 5.5" />
            </div>
            <div>
              <label className={labelBase}>Hemoglobina</label>
              <input name="hemoglobina" type="text" value={resultados?.hemoglobina || ""} onChange={(e) => handleChange("hemoglobina", e.target.value)} className={`${inputBase} ${isHighlighted("hemoglobina")}`} placeholder="12.0 - 16.0" />
            </div>
            <div>
              <label className={labelBase}>Hematocrito</label>
              <input name="hematocrito" type="text" value={resultados?.hematocrito || ""} onChange={(e) => handleChange("hematocrito", e.target.value)} className={`${inputBase} ${isHighlighted("hematocrito")}`} placeholder="37 - 47" />
            </div>
            <div>
              <label className={labelBase}>V.C.M.</label>
              <input name="vcm" type="text" value={resultados?.vcm || ""} onChange={(e) => handleChange("vcm", e.target.value)} className={`${inputBase} ${isHighlighted("vcm")}`} placeholder="80 - 100" />
            </div>
            <div>
              <label className={labelBase}>H.C.M.</label>
              <input name="hcm" type="text" value={resultados?.hcm || ""} onChange={(e) => handleChange("hcm", e.target.value)} className={`${inputBase} ${isHighlighted("hcm")}`} placeholder="27 - 32" />
            </div>
            <div>
              <label className={labelBase}>C.H.C.M.</label>
              <input name="chcm" type="text" value={resultados?.chcm || ""} onChange={(e) => handleChange("chcm", e.target.value)} className={`${inputBase} ${isHighlighted("chcm")}`} placeholder="32 - 36" />
            </div>
          </div>
        </div>

        {/* SERIE BLANCA Y PLAQUETAS */}
        <div className={sectionCard}>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={14} className="text-red-500" />
            <h4 className="font-bold text-slate-900 text-[10px] uppercase tracking-wider">Serie Blanca & Plaquetas</h4>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelBase}>Leucocitos</label>
                <input name="leucocitos" type="text" value={resultados?.leucocitos || ""} onChange={(e) => handleChange("leucocitos", e.target.value)} className={`${inputBase} bg-blue-50/10 border-blue-200 focus:border-blue-500 focus:ring-blue-500/10 ${isHighlighted("leucocitos")}`} placeholder="5k - 10k" />
              </div>
              <div>
                <label className={labelBase}>Plaquetas</label>
                <input name="plaquetas" type="text" value={resultados?.plaquetas || ""} onChange={(e) => handleChange("plaquetas", e.target.value)} className={`${inputBase} bg-blue-50/10 border-blue-200 focus:border-blue-500 focus:ring-blue-500/10 ${isHighlighted("plaquetas")}`} placeholder="150k - 450k" />
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-100">
              <div className="col-span-1">
                <label className={labelBase}>Neut.</label>
                <input name="neutrofilos" type="text" value={resultados?.neutrofilos || ""} onChange={(e) => handleChange("neutrofilos", e.target.value)} className={`${inputBase} ${isHighlighted("neutrofilos")}`} placeholder="%" />
              </div>
              <div className="col-span-1">
                <label className={labelBase}>Linf.</label>
                <input name="linfocitos" type="text" value={resultados?.linfocitos || ""} onChange={(e) => handleChange("linfocitos", e.target.value)} className={`${inputBase} ${isHighlighted("linfocitos")}`} placeholder="%" />
              </div>
              <div className="col-span-1">
                <label className={labelBase}>Mono.</label>
                <input name="monocitos" type="text" value={resultados?.monocitos || ""} onChange={(e) => handleChange("monocitos", e.target.value)} className={`${inputBase} ${isHighlighted("monocitos")}`} placeholder="%" />
              </div>
              <div className="col-span-1">
                <label className={labelBase}>Eos.</label>
                <input name="eosinofilos" type="text" value={resultados?.eosinofilos || ""} onChange={(e) => handleChange("eosinofilos", e.target.value)} className={`${inputBase} ${isHighlighted("eosinofilos")}`} placeholder="%" />
              </div>
              <div className="col-span-1">
                <label className={labelBase}>Baso.</label>
                <input name="basofilos" type="text" value={resultados?.basofilos || ""} onChange={(e) => handleChange("basofilos", e.target.value)} className={`${inputBase} ${isHighlighted("basofilos")}`} placeholder="%" />
              </div>
            </div>
          </div>
        </div>

        {/* V.S.G. Y KATZ */}
        <div className={sectionCard}>
          <div className="flex items-center gap-2 mb-4">
            <Clock size={14} className="text-slate-400" />
            <h4 className="font-bold text-slate-900 text-[10px] uppercase tracking-wider">VSG & Índice de Katz</h4>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className={labelBase}>1ª Hora</label>
              <input name="vsg_1h" type="text" value={resultados?.vsg_1h || ""} onChange={(e) => handleChange("vsg_1h", e.target.value)} className={`${inputBase} ${isHighlighted("vsg_1h")}`} placeholder="mm" />
            </div>
            <div>
              <label className={labelBase}>2ª Hora</label>
              <input name="vsg_2h" type="text" value={resultados?.vsg_2h || ""} onChange={(e) => handleChange("vsg_2h", e.target.value)} className={`${inputBase} ${isHighlighted("vsg_2h")}`} placeholder="mm" />
            </div>
            <div className="col-span-2 lg:col-span-1">
              <label className={`${labelBase} text-red-500`}>Índice Katz</label>
              <div className="relative">
                <input name="vsg_indice" type="text" value={resultados?.vsg_indice || ""} readOnly className={`${inputBase} bg-red-50 border-red-100 text-red-600 font-black`} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-red-300 uppercase">Auto</span>
              </div>
            </div>
          </div>
        </div>

        {/* OBSERVACIONES */}
        <div>
          <label className={labelBase}>Notas / Observaciones</label>
          <textarea
            name="observacion"
            value={resultados?.observacion || ""}
            onChange={(e) => handleChange("observacion", e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 outline-none focus:border-slate-400 focus:bg-white transition-all min-h-[80px] resize-none"
            placeholder="Observaciones adicionales..."
          />
        </div>
      </div>
    </div>
  );
}