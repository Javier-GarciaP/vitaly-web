import React, { useRef, useEffect } from "react";
import { Droplets, TestTube, Microscope, ClipboardCheck } from "lucide-react";

interface OrinaFormProps {
  resultados: any;
  onChange: (resultados: any) => void;
}

export default function OrinaForm({ resultados, onChange }: OrinaFormProps) {
  const formRef = useRef<HTMLDivElement>(null);

  // Inicialización de valores por defecto para evitar envíos vacíos
  useEffect(() => {
    if (resultados && !resultados.aspecto) {
      onChange({
        ...resultados,
        aspecto: "Lig. Turbia",
        color: "Amarillo",
        reaccion: "Acida",
        pigmento_bil: "Negativo",
        glucosa: "Negativo",
        nitritos: "Negativo",
        proteina: "Negativo",
        hemoglobina: "Negativo",
        acetona: "Negativo",
        urobilin: "Normal",
        bacterias: "Escasas",
        filam_moco: "No contiene"
      });
    }
  }, []);

  const handleChange = (field: string, value: string) => {
    onChange({ ...resultados, [field]: value });
  };

  const isHighlighted = (field: string) => resultados?._highlightFields?.includes(field) ? "ring-2 ring-amber-500 bg-amber-50" : "";

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const target = e.target as HTMLInputElement;
      const fieldName = target.name;

      // Auto-append 'xc' (por campo) when pressing Enter in these specific fields
      if (fieldName && ["leucocitos", "hematies", "celulas_epit"].includes(fieldName)) {
        const val = target.value.trim();
        // Check if value is present and doesn't already have 'xc'
        if (val && !val.toLowerCase().includes("xc")) {
          handleChange(fieldName, `${val} xc`);
        }
      }

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
  const selectBase = "w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[12px] font-bold text-slate-700 outline-none focus:border-amber-500 transition-all cursor-pointer";
  const inputBase = "w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[12px] font-bold text-slate-700 outline-none focus:border-amber-500 transition-all placeholder:text-slate-300";

  return (
    <div className="w-full space-y-6 pb-20" ref={formRef} onKeyDown={handleKeyDown}>

      {/* HEADER SIMPLE */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="w-8 h-8 bg-amber-50 text-amber-500 rounded-lg flex items-center justify-center">
          <Droplets size={16} />
        </div>
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Uroanálisis Completo</h3>
      </div>

      <div className="grid grid-cols-1 gap-6">

        {/* CARACTERES GENERALES */}
        <div className={sectionCard}>
          <div className="flex items-center gap-2 mb-4">
            <ClipboardCheck size={14} className="text-amber-500" />
            <h4 className="font-bold text-slate-900 text-[10px] uppercase tracking-wider">Análisis Físico</h4>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelBase}>Aspecto</label>
              <select value={resultados?.aspecto || "Lig. Turbia"} onChange={(e) => handleChange("aspecto", e.target.value)} className={`${selectBase} ${isHighlighted("aspecto")}`}>
                <option value="Limpido">Limpido</option>
                <option value="Lig. Turbia">Lig. Turbia</option>
                <option value="Turbia">Turbia</option>
              </select>
            </div>
            <div>
              <label className={labelBase}>Color</label>
              <select value={resultados?.color || "Amarillo"} onChange={(e) => handleChange("color", e.target.value)} className={`${selectBase} ${isHighlighted("color")}`}>
                <option value="Amarillo">Amarillo</option>
                <option value="Ambar">Ambar</option>
                <option value="Sanguinolento">Sanguinolento</option>
                <option value="Incoloro">Incoloro</option>
              </select>
            </div>
            <div>
              <label className={labelBase}>Reacción</label>
              <select value={resultados?.reaccion || "Acida"} onChange={(e) => handleChange("reaccion", e.target.value)} className={`${selectBase} ${isHighlighted("reaccion")}`}>
                <option value="Acida">Acida</option>
                <option value="Alcalina">Alcalina</option>
                <option value="Neutra">Neutra</option>
              </select>
            </div>
            <div>
              <label className={labelBase}>PH / Densidad</label>
              <div className="flex gap-2">
                <input type="text" value={resultados?.ph || ""} onChange={(e) => handleChange("ph", e.target.value)} className={`${inputBase} ${isHighlighted("ph")}`} placeholder="PH" />
                <input type="text" value={resultados?.densidad || ""} onChange={(e) => handleChange("densidad", e.target.value)} className={`${inputBase} ${isHighlighted("densidad")}`} placeholder="Dens." />
              </div>
            </div>
          </div>
        </div>

        {/* QUÍMICO */}
        <div className={sectionCard}>
          <div className="flex items-center gap-2 mb-4">
            <TestTube size={14} className="text-amber-500" />
            <h4 className="font-bold text-slate-900 text-[10px] uppercase tracking-wider">Examen Químico</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: "P. Biliar", key: "pigmento_bil" },
              { label: "Glucosa", key: "glucosa" },
              { label: "Nitritos", key: "nitritos" },
              { label: "Proteína", key: "proteina" },
              { label: "Hb", key: "hemoglobina" },
              { label: "Acetona", key: "acetona" },
            ].map((item) => (
              <div key={item.key}>
                <label className={labelBase}>{item.label}</label>
                <select
                  value={resultados?.[item.key] || "Negativo"}
                  onChange={(e) => handleChange(item.key, e.target.value)}
                  className={`${selectBase} ${resultados?.[item.key]?.includes('Post') ? '!bg-rose-50 text-rose-600 !border-rose-100' : ''} ${isHighlighted(item.key)}`}
                >
                  <option value="Negativo">Negativo</option>
                  <option value="Trazas">Trazas</option>
                  <option value="Post(+)">Post(+)</option>
                  <option value="Post(++)">Post(++)</option>
                  <option value="Post(+++)">Post(+++)</option>
                </select>
              </div>
            ))}
            <div>
              <label className={labelBase}>Urobilín</label>
              <select value={resultados?.urobilin || "Normal"} onChange={(e) => handleChange("urobilin", e.target.value)} className={`${selectBase} ${isHighlighted("urobilin")}`}>
                <option value="Normal">Normal</option>
                <option value="Lig. Aumentado">Lig. Aum.</option>
                <option value="Aumentado">Aumentado</option>
              </select>
            </div>
          </div>
        </div>

        {/* SEDIMENTO - AHORA TEMA CLARO */}
        <div className={sectionCard}>
          <div className="flex items-center gap-2 mb-4">
            <Microscope size={14} className="text-amber-500" />
            <h4 className="font-bold text-slate-900 text-[10px] uppercase tracking-wider">Sedimento Urinario</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-4">
            <div>
              <label className={labelBase}>Leucocitos</label>
              <input type="text" name="leucocitos" value={resultados?.leucocitos || ""} onChange={(e) => handleChange("leucocitos", e.target.value)} className={`${inputBase} ${isHighlighted("leucocitos")}`} placeholder="0-2 xc" />
            </div>
            <div>
              <label className={labelBase}>Hematies</label>
              <input type="text" name="hematies" value={resultados?.hematies || ""} onChange={(e) => handleChange("hematies", e.target.value)} className={`${inputBase} ${isHighlighted("hematies")}`} placeholder="0-1 xc" />
            </div>
            <div>
              <label className={labelBase}>C. Epiteliales</label>
              <input type="text" name="celulas_epit" value={resultados?.celulas_epit || ""} onChange={(e) => handleChange("celulas_epit", e.target.value)} className={`${inputBase} ${isHighlighted("celulas_epit")}`} />
            </div>
            <div>
              <label className={labelBase}>Cilindros</label>
              <input type="text" value={resultados?.cilindros || ""} onChange={(e) => handleChange("cilindros", e.target.value)} className={`${inputBase} ${isHighlighted("cilindros")}`} />
            </div>
            <div>
              <label className={labelBase}>Cristales</label>
              <input type="text" value={resultados?.cristales || ""} onChange={(e) => handleChange("cristales", e.target.value)} className={`${inputBase} ${isHighlighted("cristales")}`} />
            </div>
            <div>
              <label className={labelBase}>Bacterias</label>
              <select value={resultados?.bacterias || "Escasas"} onChange={(e) => handleChange("bacterias", e.target.value)} className={`${selectBase} ${isHighlighted("bacterias")}`}>
                <option value="Escasas">Escasas</option>
                <option value="Reg. Cantidad">Reg. Cant.</option>
                <option value="Abundante">Abundante</option>
                <option value="Moderadas">Moderadas</option>
              </select>
            </div>
            <div>
              <label className={labelBase}>Levaduras</label>
              <select value={resultados?.levaduras || "No se observan"} onChange={(e) => handleChange("levaduras", e.target.value)} className={`${selectBase} ${isHighlighted("levaduras")}`}>
                <option value="No se observan">Negativo</option>
                <option value="Aisladas">Aisladas</option>
                <option value="Aisladas - Gemación">Gemación</option>
              </select>
            </div>
            <div>
              <label className={labelBase}>Filam. Moco</label>
              <select value={resultados?.filam_moco || "No contiene"} onChange={(e) => handleChange("filam_moco", e.target.value)} className={`${selectBase} ${isHighlighted("filam_moco")}`}>
                <option value="No contiene">Negativo</option>
                <option value="Escasas">Escasas</option>
                <option value="Reg. Cantidad">Reg. Cant.</option>
                <option value="Abundante">Abundante</option>
                <option value="Moderado">Moderado</option>
              </select>
            </div>
          </div>
        </div>

        {/* OBSERVACIONES */}
        <div>
          <label className={labelBase}>Notas / Observaciones</label>
          <textarea
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