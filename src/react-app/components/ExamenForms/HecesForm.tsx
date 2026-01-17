import React, { useRef, useEffect } from "react";
import { Microscope, Activity, Leaf } from "lucide-react";

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

  const isHighlighted = (field: string) => resultados?._highlightFields?.includes(field) ? "ring-2 ring-emerald-500 bg-emerald-50" : "";

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

  const sectionCard = "p-5 rounded-2xl bg-slate-50/50 border border-slate-100 transition-all hover:bg-slate-50 group";
  const labelBase = "text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block";
  const selectBase = "w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[12px] font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all cursor-pointer";
  const inputBase = "w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[12px] font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all placeholder:text-slate-300";

  return (
    <div className="w-full space-y-6 pb-20" ref={formRef} onKeyDown={handleKeyDown}>

      {/* HEADER SIMPLE */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="w-8 h-8 bg-emerald-50 text-emerald-500 rounded-lg flex items-center justify-center">
          <Microscope size={16} />
        </div>
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Coproanálisis</h3>
      </div>

      <div className="grid grid-cols-1 gap-6">

        {/* CARACTERES GENERALES */}
        <div className={sectionCard}>
          <div className="flex items-center gap-2 mb-4">
            <Activity size={14} className="text-emerald-500" />
            <h4 className="font-bold text-slate-900 text-[10px] uppercase tracking-wider">Macroscópico y Químico</h4>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className={labelBase}>Aspecto</label>
              <select value={resultados?.aspecto || "Heterogeneo"} onChange={(e) => handleChange("aspecto", e.target.value)} className={`${selectBase} ${isHighlighted("aspecto")}`}>
                <option value="Heterogeneo">Heterogeneo</option>
                <option value="Homogeneo">Homogeneo</option>
              </select>
            </div>
            <div>
              <label className={labelBase}>Color</label>
              <select value={resultados?.color || "Marron"} onChange={(e) => handleChange("color", e.target.value)} className={`${selectBase} ${isHighlighted("color")}`}>
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
              <select value={resultados?.consistencia || "Pastosa"} onChange={(e) => handleChange("consistencia", e.target.value)} className={`${selectBase} ${isHighlighted("consistencia")}`}>
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
              <select value={resultados?.hb || "Negativo"} onChange={(e) => handleChange("hb", e.target.value)} className={`${selectBase} ${isHighlighted("hb")}`}>
                <option value="Negativo">Negativo</option>
                <option value="Trazas">Trazas</option>
                <option value="Post(+)">Positivo (+)</option>
                <option value="Post(++)">Positivo (++)</option>
                <option value="Post(+++)">Positivo (+++)</option>
              </select>
            </div>
            <div>
              <label className={labelBase}>Moco</label>
              <select value={resultados?.moco || "Ausente"} onChange={(e) => handleChange("moco", e.target.value)} className={`${selectBase} ${isHighlighted("moco")}`}>
                <option value="Ausente">Ausente</option>
                <option value="Escaso">Escaso</option>
                <option value="Reg. Cantidad">Reg. Cantidad</option>
                <option value="Abundante">Abundante</option>
              </select>
            </div>
            <div>
              <label className={labelBase}>Reacción</label>
              <select value={resultados?.reaccion || "Neutra"} onChange={(e) => handleChange("reaccion", e.target.value)} className={`${selectBase} ${isHighlighted("reaccion")}`}>
                <option value="Alcalina">Alcalina</option>
                <option value="Acida">Acida</option>
                <option value="Neutra">Neutra</option>
              </select>
            </div>
            <div className="col-span-1">
              <label className={labelBase}>PH</label>
              <input type="text" value={resultados?.ph || ""} onChange={(e) => handleChange("ph", e.target.value)} className={`${inputBase} ${isHighlighted("ph")}`} placeholder="Ej. 7.0" />
            </div>
          </div>
        </div>

        {/* OTROS EXÁMENES / MICROSCOPIO */}
        <div className={sectionCard}>
          <div className="flex items-center gap-2 mb-4">
            <Leaf size={14} className="text-emerald-500" />
            <h4 className="font-bold text-slate-900 text-[10px] uppercase tracking-wider">Parasitológico</h4>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelBase}>Sangre Oculta</label>
                <select value={resultados?.sangre_oculta || "Negativa"} onChange={(e) => handleChange("sangre_oculta", e.target.value)} className={`${selectBase} ${isHighlighted("sangre_oculta")}`}>
                  <option value="Negativa">Negativa</option>
                  <option value="Post(+)">Positiva (+)</option>
                </select>
              </div>
              <div>
                <label className={labelBase}>Flora Bacteriana</label>
                <select value={resultados?.flora_bacteriana || "Reg. Cantidad"} onChange={(e) => handleChange("flora_bacteriana", e.target.value)} className={`${selectBase} ${isHighlighted("flora_bacteriana")}`}>
                  <option value="Reg. Cantidad">Reg. Cantidad</option>
                  <option value="Escasa">Escasa</option>
                  <option value="Aumentada">Aumentada</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelBase}>Parásitos / Observación</label>
              <select value={resultados?.parasitos || "No se observan"} onChange={(e) => handleChange("parasitos", e.target.value)} className={`${selectBase} ${isHighlighted("parasitos")}`}>
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
        <div className={sectionCard}>
          <div className="flex items-center gap-2 mb-4">
            <Microscope size={14} className="text-emerald-700" />
            <h4 className="font-bold text-slate-900 text-[10px] uppercase tracking-wider">Microscópico Detallado</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className={labelBase}>Polimorfonucleares</label>
              <input type="text" value={resultados?.po_nucleares || ""} onChange={(e) => handleChange("po_nucleares", e.target.value)} className={`${inputBase} ${isHighlighted("po_nucleares")}`} placeholder="0-2 xc" />
            </div>
            <div>
              <label className={labelBase}>Restos Alimenticios</label>
              <input type="text" value={resultados?.re_alimenticios || ""} onChange={(e) => handleChange("re_alimenticios", e.target.value)} className={`${inputBase} ${isHighlighted("re_alimenticios")}`} placeholder="Moderados" />
            </div>
            <div>
              <label className={labelBase}>Azúcares Reductores</label>
              <input type="text" value={resultados?.az_reductores || ""} onChange={(e) => handleChange("az_reductores", e.target.value)} className={`${inputBase} ${isHighlighted("az_reductores")}`} placeholder="Negativo" />
            </div>
          </div>
        </div>

        {/* OBSERVACIÓN FINAL */}
        <div>
          <label className={labelBase}>Observaciones</label>
          <textarea
            value={resultados?.observacion || ""}
            onChange={(e) => handleChange("observacion", e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 outline-none focus:border-emerald-500 transition-all min-h-[80px] resize-none"
            placeholder="Observaciones adicionales..."
          />
        </div>
      </div>
    </div>
  );
}