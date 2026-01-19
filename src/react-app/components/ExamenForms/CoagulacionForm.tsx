import React, { useRef, useEffect } from "react";
import { Activity, Clock, ShieldAlert } from "lucide-react";

interface CoagulacionFormProps {
  resultados: any;
  onChange: (resultados: any) => void;
}

export default function CoagulacionForm({ resultados, onChange }: CoagulacionFormProps) {
  const formRef = useRef<HTMLDivElement>(null);

  // Unidades automáticas
  const unidades: { [key: string]: string } = {
    tp_control: " seg",
    tp_paciente: " seg",
    tp_act: " %",
    tp_razon: " raz",
    tpt_control: " seg",
    tpt_paciente: " seg",
    fibrinogeno: " %"
  };

  // --- SOLUCIÓN AL PROBLEMA DE GUARDADO Y ESTADO INICIAL ---
  useEffect(() => {
    if (resultados && !resultados.anticoagulado) {
      onChange({
        ...resultados,
        anticoagulado: "No", // Valor por defecto real
        tp_isi: resultados.tp_isi || "0.95"
      });
    }
  }, []);

  const handleChange = (field: string, value: string) => {
    onChange({ ...resultados, [field]: value });
  };

  const isHighlighted = (field: string) => resultados?._highlightFields?.includes(field) ? "ring-2 ring-indigo-500 bg-indigo-50" : "";

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const target = e.target as HTMLInputElement;
      const fieldName = target.name;

      // 1. Aplicar unidad automáticamente
      if (unidades[fieldName] && target.value.trim() !== "" && !target.value.includes(unidades[fieldName].trim())) {
        const numericValue = target.value.replace(/[a-zA-Z/%³\s]/g, "").trim();
        if (numericValue !== "") {
          const newValue = numericValue + unidades[fieldName];
          handleChange(fieldName, newValue);
        }
      }

      // 2. Salto inteligente de foco
      const form = formRef.current;
      if (form) {
        const focusableElements = form.querySelectorAll('input, select, textarea');
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
  const inputBase = "w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[12px] font-bold text-slate-700 outline-none focus:border-indigo-500 transition-all placeholder:text-slate-300";

  return (
    <div className="w-full space-y-6 pb-20" ref={formRef} onKeyDown={handleKeyDown}>

      {/* HEADER SIMPLE */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="w-8 h-8 bg-indigo-50 text-indigo-500 rounded-lg flex items-center justify-center">
          <Activity size={16} />
        </div>
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Hemostasia</h3>
      </div>

      <div className="grid grid-cols-1 gap-6">

        {/* TIEMPO DE PROTROMBINA */}
        <div className={sectionCard}>
          <div className="flex items-center gap-2 mb-4">
            <Clock size={14} className="text-indigo-500" />
            <h4 className="font-bold text-slate-900 text-[10px] uppercase tracking-wider">Tiempo de Protrombina (TP)</h4>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelBase}>Control</label>
              <input name="tp_control" type="text" value={resultados?.tp_control || ""} onChange={(e) => handleChange("tp_control", e.target.value)} className={`${inputBase} ${isHighlighted("tp_control")}`} placeholder="12.5" />
            </div>
            <div>
              <label className={labelBase}>Paciente</label>
              <input name="tp_paciente" type="text" value={resultados?.tp_paciente || ""} onChange={(e) => handleChange("tp_paciente", e.target.value)} className={`${inputBase} ${isHighlighted("tp_paciente")}`} placeholder="13.0" />
            </div>
            <div>
              <label className={labelBase}>Actividad %</label>
              <input name="tp_act" type="text" value={resultados?.tp_act || ""} onChange={(e) => handleChange("tp_act", e.target.value)} className={`${inputBase} ${isHighlighted("tp_act")}`} placeholder="100" />
            </div>
            <div>
              <label className={labelBase}>Razón</label>
              <input name="tp_razon" type="text" value={resultados?.tp_razon || ""} onChange={(e) => handleChange("tp_razon", e.target.value)} className={`${inputBase} ${isHighlighted("tp_razon")}`} placeholder="1.0" />
            </div>
            <div>
              <label className={labelBase}>INR</label>
              <input name="tp_inr" type="text" value={resultados?.tp_inr || ""} onChange={(e) => handleChange("tp_inr", e.target.value)} className={`${inputBase} ${isHighlighted("tp_inr")}`} placeholder="1.0" />
            </div>
            <div>
              <label className={labelBase}>ISI</label>
              <input name="tp_isi" type="text" value={resultados?.tp_isi || ""} onChange={(e) => handleChange("tp_isi", e.target.value)} className={`${inputBase} ${isHighlighted("tp_isi")}`} placeholder="0.95" />
            </div>
          </div>
        </div>

        {/* TTP ACTIVA & FIBRINOGENO */}
        <div className={sectionCard}>
          <div className="flex items-center gap-2 mb-4">
            <Activity size={14} className="text-rose-500" />
            <h4 className="font-bold text-slate-900 text-[10px] uppercase tracking-wider">TTP Activa y Fibrinógeno</h4>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelBase}>TTPA Control</label>
              <input name="tpt_control" type="text" value={resultados?.tpt_control || ""} onChange={(e) => handleChange("tpt_control", e.target.value)} className={`${inputBase} ${isHighlighted("tpt_control")}`} placeholder="30.0" />
            </div>
            <div>
              <label className={labelBase}>TTPA Paciente</label>
              <input name="tpt_paciente" type="text" value={resultados?.tpt_paciente || ""} onChange={(e) => handleChange("tpt_paciente", e.target.value)} className={`${inputBase} ${isHighlighted("tpt_paciente")}`} placeholder="32.0" />
            </div>
            <div className="col-span-2">
              <label className={labelBase}>Fibrinógeno</label>
              <div className="relative">
                <input name="fibrinogeno" type="text" value={resultados?.fibrinogeno || ""} onChange={(e) => handleChange("fibrinogeno", e.target.value)} className={`${inputBase} bg-rose-50 border-rose-100 focus:border-rose-400 ${isHighlighted("fibrinogeno")}`} placeholder="200 - 400" />
              </div>
            </div>
          </div>
        </div>

        {/* ESTADO ANTICOAGULACION */}
        <div className={sectionCard}>
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert size={14} className="text-indigo-500" />
            <h4 className="font-bold text-slate-900 text-[10px] uppercase tracking-wider">Anticoagulación</h4>
          </div>

          <div className="space-y-4">
            <div>
              <label className={labelBase}>Estado Actual</label>
              <select
                name="anticoagulado"
                value={resultados?.anticoagulado || "No"}
                onChange={(e) => handleChange("anticoagulado", e.target.value)}
                className={`${inputBase} !bg-white border-slate-200 cursor-pointer`}
              >
                <option value="No">No recibe tratamiento</option>
                <option value="Sí">Paciente Anticoagulado</option>
              </select>
            </div>

            {resultados?.anticoagulado === "Sí" && (
              <div className="animate-in slide-in-from-top-2 duration-300">
                <label className={labelBase}>Medicamento y Dosis</label>
                <input
                  name="medicamento"
                  type="text"
                  value={resultados?.medicamento || ""}
                  onChange={(e) => handleChange("medicamento", e.target.value)}
                  className={inputBase}
                  placeholder="Ej. Warfarina 5mg"
                />
              </div>
            )}
          </div>
        </div>

        {/* OBSERVACIONES */}
        <div>
          <label className={labelBase}>Notas / Interpretación</label>
          <textarea
            name="observacion"
            value={resultados?.observacion || ""}
            onChange={(e) => handleChange("observacion", e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 outline-none focus:border-indigo-500 transition-all min-h-[80px] resize-none"
            placeholder="Escriba aquí notas sobre hemólisis, fibrina o sugerencias clínicas..."
          />
        </div>
      </div>
    </div>
  );
}