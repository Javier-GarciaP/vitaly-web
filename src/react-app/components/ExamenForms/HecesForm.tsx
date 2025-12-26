import React, { useRef, useEffect } from "react";
import { Microscope, Activity, Leaf, FileText } from "lucide-react";

interface HecesFormProps {
  resultados: any;
  onChange: (resultados: any) => void;
}

export default function HecesForm({ resultados, onChange }: HecesFormProps) {
  const formRef = useRef<HTMLDivElement>(null);

  // --- SOLUCIÓN AL PROBLEMA DE GUARDADO ---
  useEffect(() => {
    // Si el objeto resultados está vacío o le faltan campos clave, inicializamos
    if (resultados && !resultados.aspecto) {
      onChange({ 
        ...resultados, 
        aspecto: "Heterogeneo",
        color: "Marron",
        consistencia: "Pastosa",
        hb: "Negativo",
        moco: "Ausente",
        reaccion: "Neutra",
        flora_bacteriana: "Reg. Cantidad",
        sangre_oculta: "Negativa"
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
        const focusableElements = form.querySelectorAll('input, select, textarea');
        const index = Array.from(focusableElements).indexOf(e.target as HTMLElement);
        
        if (index > -1 && index < focusableElements.length - 1) {
          e.preventDefault();
          (focusableElements[index + 1] as HTMLElement).focus();
        }
      }
    }
  };

  const sectionCard = "bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-5 transition-all hover:shadow-md";
  const labelBase = "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block";
  const selectBase = "w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 focus:bg-white transition-all appearance-none cursor-pointer";
  const inputBase = "w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 focus:bg-white transition-all placeholder:text-slate-300";

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10" ref={formRef} onKeyDown={handleKeyDown}>
      
      {/* HEADER DINÁMICO */}
      <div className="flex items-center gap-4 bg-emerald-900 p-6 rounded-[2.5rem] text-white shadow-xl shadow-emerald-900/10">
        <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Microscope size={24} />
        </div>
        <div>
          <h3 className="text-xl font-black tracking-tight text-emerald-50">Coproanálisis</h3>
          <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-[0.2em]">Examen Físico, Químico y Microscópico</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CARACTERES GENERALES */}
        <div className={`${sectionCard} lg:col-span-2`}>
          <div className="flex items-center gap-2 mb-2 border-b border-slate-50 pb-3">
            <Activity size={18} className="text-emerald-500" />
            <h4 className="font-black text-slate-700 text-xs uppercase tracking-wider">Macroscópico y Químico</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className={labelBase}>Aspecto</label>
              <select value={resultados?.aspecto || "Heterogeneo"} onChange={(e) => handleChange("aspecto", e.target.value)} className={selectBase}>
                <option value="Heterogeneo">Heterogeneo</option>
                <option value="Homogeneo">Homogeneo</option>
              </select>
            </div>
            <div>
              <label className={labelBase}>Color</label>
              <select value={resultados?.color || "Marron"} onChange={(e) => handleChange("color", e.target.value)} className={selectBase}>
                <option value="Amarillo">Amarillo</option>
                <option value="Marron">Marron</option>
                <option value="Rojizo">Rojizo</option>
                <option value="Verdoso">Verdoso</option>
                <option value="Negro">Negro</option>
                <option value="Acólico">Acólico (Blanco)</option>
              </select>
            </div>
            <div>
              <label className={labelBase}>Consistencia</label>
              <select value={resultados?.consistencia || "Pastosa"} onChange={(e) => handleChange("consistencia", e.target.value)} className={selectBase}>
                <option value="Blanda">Blanda</option>
                <option value="Dura">Dura</option>
                <option value="Pastosa">Pastosa</option>
                <option value="Diarreica">Diarreica</option>
                <option value="Liquida">Liquida</option>
                <option value="Mocosa">Mocosa</option>
              </select>
            </div>
            <div>
              <label className={labelBase}>HB (Sangre)</label>
              <select value={resultados?.hb || "Negativo"} onChange={(e) => handleChange("hb", e.target.value)} className={selectBase}>
                <option value="Negativo">Negativo</option>
                <option value="Trazas">Trazas</option>
                <option value="Post(+)">Positivo (+)</option>
                <option value="Post(++)">Positivo (++)</option>
                <option value="Post(+++)">Positivo (+++)</option>
              </select>
            </div>
            <div>
              <label className={labelBase}>Moco</label>
              <select value={resultados?.moco || "Ausente"} onChange={(e) => handleChange("moco", e.target.value)} className={selectBase}>
                <option value="Ausente">Ausente</option>
                <option value="Escaso">Escaso</option>
                <option value="Reg. Cantidad">Reg. Cantidad</option>
                <option value="Abundante">Abundante</option>
              </select>
            </div>
            <div>
              <label className={labelBase}>Reacción</label>
              <select value={resultados?.reaccion || "Neutra"} onChange={(e) => handleChange("reaccion", e.target.value)} className={selectBase}>
                <option value="Alcalina">Alcalina</option>
                <option value="Acida">Acida</option>
                <option value="Neutra">Neutra</option>
              </select>
            </div>
            <div className="md:col-span-1">
              <label className={labelBase}>PH</label>
              <input type="text" value={resultados?.ph || ""} onChange={(e) => handleChange("ph", e.target.value)} className={inputBase} placeholder="Ej. 7.0" />
            </div>
          </div>
        </div>

        {/* OTROS EXÁMENES / MICROSCOPIO */}
        <div className={sectionCard}>
          <div className="flex items-center gap-2 mb-2 border-b border-slate-50 pb-3">
            <Leaf size={18} className="text-emerald-500" />
            <h4 className="font-black text-slate-700 text-xs uppercase tracking-wider">Parasitológico</h4>
          </div>

          <div className="space-y-4">
            <div>
              <label className={labelBase}>Sangre Oculta</label>
              <select value={resultados?.sangre_oculta || "Negativa"} onChange={(e) => handleChange("sangre_oculta", e.target.value)} className={selectBase}>
                <option value="Negativa">Negativa</option>
                <option value="Post(+)">Positiva (+)</option>
              </select>
            </div>
            <div>
              <label className={labelBase}>Flora Bacteriana</label>
              <select value={resultados?.flora_bacteriana || "Reg. Cantidad"} onChange={(e) => handleChange("flora_bacteriana", e.target.value)} className={selectBase}>
                <option value="Reg. Cantidad">Reg. Cantidad</option>
                <option value="Escasa">Escasa</option>
                <option value="Aumentada">Aumentada</option>
              </select>
            </div>
            <div>
              <label className={labelBase}>Parásitos / Observación</label>
              <select value={resultados?.parasitos || "No se observan"} onChange={(e) => handleChange("parasitos", e.target.value)} className={selectBase}>
                <option value="No se observan">No se observan</option>
                <option value="Blastocystis sp xc">Blastocystis sp xc</option>
                <option value="Quiste de Entamoeba histolytica">Quiste de Entamoeba histolytica</option>
                <option value="Trofozoito de E. histolytica">Trofozoito de E. histolytica</option>
                <option value="Huevos de helminto">Huevos de helminto</option>
              </select>
            </div>
          </div>
        </div>

        {/* CAMPOS DE TEXTO DETALLADOS */}
        <div className={`${sectionCard} lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6 !bg-slate-900 text-white`}>
            <div>
              <label className={`${labelBase} text-emerald-400`}>Polimorfonucleares</label>
              <input type="text" value={resultados?.po_nucleares || ""} onChange={(e) => handleChange("po_nucleares", e.target.value)} className={`${inputBase} !bg-slate-800 border-slate-700 text-white focus:border-emerald-400`} placeholder="0-2 xc" />
            </div>
            <div>
              <label className={`${labelBase} text-emerald-400`}>Restos Alimenticios</label>
              <input type="text" value={resultados?.re_alimenticios || ""} onChange={(e) => handleChange("re_alimenticios", e.target.value)} className={`${inputBase} !bg-slate-800 border-slate-700 text-white focus:border-emerald-400`} placeholder="Moderados" />
            </div>
            <div>
              <label className={`${labelBase} text-emerald-400`}>Azúcares Reductores</label>
              <input type="text" value={resultados?.az_reductores || ""} onChange={(e) => handleChange("az_reductores", e.target.value)} className={`${inputBase} !bg-slate-800 border-slate-700 text-white focus:border-emerald-400`} placeholder="Negativo" />
            </div>
        </div>

        {/* OBSERVACIÓN FINAL */}
        <div className="lg:col-span-3">
          <div className="flex items-center gap-2 mb-2 ml-4">
            <FileText size={14} className="text-slate-400" />
            <label className={labelBase}>Observaciones del Bioanalista</label>
          </div>
          <textarea
            value={resultados?.observacion || ""}
            onChange={(e) => handleChange("observacion", e.target.value)}
            className="w-full bg-white border-2 border-slate-100 rounded-[2rem] px-8 py-6 text-sm font-medium text-slate-600 outline-none focus:border-emerald-500 transition-all min-h-[100px] shadow-sm resize-none"
            placeholder="Notas sobre movilidad de trofozoítos, presencia de levaduras, etc."
          />
        </div>
      </div>
    </div>
  );
}