import React, { useRef, useEffect } from "react";
import { Droplets, TestTube, Microscope, ClipboardCheck, AlertCircle } from "lucide-react";

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
  const selectBase = "w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-amber-500 focus:bg-white transition-all appearance-none cursor-pointer";
  const inputBase = "w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-amber-500 focus:bg-white transition-all placeholder:text-slate-300";

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10" ref={formRef} onKeyDown={handleKeyDown}>
      
      {/* HEADER DINÁMICO */}
      <div className="flex items-center gap-4 bg-amber-500 p-6 rounded-[2.5rem] text-white shadow-xl shadow-amber-500/10">
        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
          <Droplets size={24} />
        </div>
        <div>
          <h3 className="text-xl font-black tracking-tight text-white">Uroanálisis Completo</h3>
          <p className="text-[10px] font-bold text-amber-100 uppercase tracking-[0.2em]">Examen Físico - Químico - Sedimento</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CARACTERES GENERALES (FÍSICO) */}
        <div className={sectionCard}>
          <div className="flex items-center gap-2 mb-2 border-b border-slate-50 pb-3">
            <ClipboardCheck size={18} className="text-amber-500" />
            <h4 className="font-black text-slate-700 text-xs uppercase tracking-wider">Análisis Físico</h4>
          </div>
          <div className="space-y-4">
            <div>
              <label className={labelBase}>Aspecto</label>
              <select value={resultados?.aspecto || "Lig. Turbia"} onChange={(e) => handleChange("aspecto", e.target.value)} className={selectBase}>
                <option value="Limpido">Limpido</option>
                <option value="Lig. Turbia">Lig. Turbia</option>
                <option value="Turbia">Turbia</option>
              </select>
            </div>
            <div>
              <label className={labelBase}>Color</label>
              <select value={resultados?.color || "Amarillo"} onChange={(e) => handleChange("color", e.target.value)} className={selectBase}>
                <option value="Amarillo">Amarillo</option>
                <option value="Ambar">Ambar</option>
                <option value="Sanguinolento">Sanguinolento</option>
                <option value="Incoloro">Incoloro</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelBase}>Reacción</label>
                <select value={resultados?.reaccion || "Acida"} onChange={(e) => handleChange("reaccion", e.target.value)} className={selectBase}>
                  <option value="Acida">Acida</option>
                  <option value="Alcalina">Alcalina</option>
                  <option value="Neutra">Neutra</option>
                </select>
              </div>
              <div>
                <label className={labelBase}>PH</label>
                <input type="text" value={resultados?.ph || ""} onChange={(e) => handleChange("ph", e.target.value)} className={inputBase} placeholder="5.0 - 7.0" />
              </div>
            </div>
            <div>
              <label className={labelBase}>Densidad</label>
              <input type="text" value={resultados?.densidad || ""} onChange={(e) => handleChange("densidad", e.target.value)} className={inputBase} placeholder="1.015 - 1.025" />
            </div>
          </div>
        </div>

        {/* EXAMEN QUÍMICO */}
        <div className={`${sectionCard} lg:col-span-2`}>
          <div className="flex items-center gap-2 mb-2 border-b border-slate-50 pb-3">
            <TestTube size={18} className="text-amber-500" />
            <h4 className="font-black text-slate-700 text-xs uppercase tracking-wider">Examen Químico (Tira Reactiva)</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {[
              { label: "Pigmento Bil.", key: "pigmento_bil" },
              { label: "Glucosa", key: "glucosa" },
              { label: "Nitritos", key: "nitritos" },
              { label: "Proteína", key: "proteina" },
              { label: "Hemoglobina", key: "hemoglobina" },
              { label: "Acetona", key: "acetona" },
            ].map((item) => (
              <div key={item.key}>
                <label className={labelBase}>{item.label}</label>
                <select 
                  value={resultados?.[item.key] || "Negativo"} 
                  onChange={(e) => handleChange(item.key, e.target.value)} 
                  className={`${selectBase} ${resultados?.[item.key]?.includes('Post') ? '!border-red-300 !bg-red-50' : ''}`}
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
              <select value={resultados?.urobilin || "Normal"} onChange={(e) => handleChange("urobilin", e.target.value)} className={selectBase}>
                <option value="Normal">Normal</option>
                <option value="Lig. Aumentado">Lig. Aumentado</option>
                <option value="Aumentado">Aumentado</option>
              </select>
            </div>
          </div>
        </div>

        {/* EXAMEN MICROSCÓPICO (SEDIMENTO) */}
        <div className={`${sectionCard} lg:col-span-3 !bg-slate-900 text-white`}>
          <div className="flex items-center gap-2 mb-2 border-b border-slate-700 pb-3">
            <Microscope size={18} className="text-amber-400" />
            <h4 className="font-black text-amber-50 text-xs uppercase tracking-wider">Sedimento Urinario (Microscopio)</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div>
              <label className={`${labelBase} text-slate-500`}>Leucocitos</label>
              <input type="text" value={resultados?.leucocitos || ""} onChange={(e) => handleChange("leucocitos", e.target.value)} className={`${inputBase} !bg-slate-800 border-slate-700 text-white focus:border-amber-400`} placeholder="0-2 xc" />
            </div>
            <div>
              <label className={`${labelBase} text-slate-500`}>Hematies</label>
              <input type="text" value={resultados?.hematies || ""} onChange={(e) => handleChange("hematies", e.target.value)} className={`${inputBase} !bg-slate-800 border-slate-700 text-white focus:border-amber-400`} placeholder="0-1 xc" />
            </div>
            <div>
              <label className={`${labelBase} text-slate-500`}>Células Epit.</label>
              <input type="text" value={resultados?.celulas_epit || ""} onChange={(e) => handleChange("celulas_epit", e.target.value)} className={`${inputBase} !bg-slate-800 border-slate-700 text-white focus:border-amber-400`} placeholder="Escasas" />
            </div>
            <div>
              <label className={`${labelBase} text-slate-500`}>Cilindros</label>
              <input type="text" value={resultados?.cilindros || ""} onChange={(e) => handleChange("cilindros", e.target.value)} className={`${inputBase} !bg-slate-800 border-slate-700 text-white focus:border-amber-400`} placeholder="No se observan" />
            </div>
            <div>
              <label className={`${labelBase} text-slate-500`}>Cristales</label>
              <input type="text" value={resultados?.cristales || ""} onChange={(e) => handleChange("cristales", e.target.value)} className={`${inputBase} !bg-slate-800 border-slate-700 text-white focus:border-amber-400`} placeholder="No se observan" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-800">
            <div>
              <label className={`${labelBase} text-amber-400`}>Bacterias</label>
              <select value={resultados?.bacterias || "Escasas"} onChange={(e) => handleChange("bacterias", e.target.value)} className={`${selectBase} !bg-slate-800 border-slate-700 text-white`}>
                <option value="Escasas">Escasas</option>
                <option value="Reg. Cantidad">Reg. Cantidad</option>
                <option value="Abundante">Abundantes</option>
              </select>
            </div>
            <div>
              <label className={`${labelBase} text-amber-400`}>Levaduras</label>
              <select value={resultados?.levaduras || "No se observan"} onChange={(e) => handleChange("levaduras", e.target.value)} className={`${selectBase} !bg-slate-800 border-slate-700 text-white`}>
                <option value="No se observan">No se observan</option>
                <option value="Aisladas">Aisladas</option>
                <option value="Aisladas - Gemación">Aisladas - Gemación</option>
              </select>
            </div>
            <div>
              <label className={`${labelBase} text-amber-400`}>Filam. de Moco</label>
              <select value={resultados?.filam_moco || "No contiene"} onChange={(e) => handleChange("filam_moco", e.target.value)} className={`${selectBase} !bg-slate-800 border-slate-700 text-white`}>
                <option value="No contiene">No contiene</option>
                <option value="Escasas">Escasas</option>
                <option value="Reg. Cantidad">Reg. Cantidad</option>
                <option value="Abundante">Abundante</option>
              </select>
            </div>
          </div>
        </div>

        {/* OBSERVACIÓN */}
        <div className="lg:col-span-3">
          <div className="flex items-center gap-2 mb-2 ml-4">
            <AlertCircle size={14} className="text-slate-400" />
            <label className={labelBase}>Notas del Examen</label>
          </div>
          <textarea
            value={resultados?.observacion || ""}
            onChange={(e) => handleChange("observacion", e.target.value)}
            className="w-full bg-white border-2 border-slate-100 rounded-[2rem] px-8 py-6 text-sm font-medium text-slate-600 outline-none focus:border-amber-500 transition-all min-h-[100px] shadow-sm resize-none"
            placeholder="Morfología bacteriana, descripción de cristales específicos, etc."
          />
        </div>
      </div>
    </div>
  );
}