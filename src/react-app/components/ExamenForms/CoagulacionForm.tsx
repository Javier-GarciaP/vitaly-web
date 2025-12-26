import React, { useRef, useEffect } from "react";
import { Activity, Clock, ShieldAlert, FileText } from "lucide-react";

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
    fibrinogeno: " mg/dL"
  };

  // --- SOLUCIÓN AL PROBLEMA DE GUARDADO Y ESTADO INICIAL ---
  useEffect(() => {
    if (resultados && !resultados.anticoagulado) {
      onChange({ 
        ...resultados, 
        anticoagulado: "No", // Valor por defecto real
        tp_isi: resultados.tp_isi || "1.0" 
      });
    }
  }, []);

  const handleChange = (field: string, value: string) => {
    onChange({ ...resultados, [field]: value });
  };

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

  const sectionCard = "bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4 transition-all hover:shadow-md";
  const labelBase = "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block";
  const inputBase = "w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all placeholder:text-slate-300";

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10" ref={formRef} onKeyDown={handleKeyDown}>
      
      {/* HEADER DE SECCIÓN */}
      <div className="flex items-center gap-4 bg-slate-900 p-6 rounded-[2rem] text-white">
        <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Activity size={24} />
        </div>
        <div>
          <h3 className="text-xl font-black tracking-tight">Pruebas de Hemostasia</h3>
          <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-[0.2em]">Tiempos de Coagulación y Fibrinógeno</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* TIEMPO DE PROTROMBINA */}
        <div className={sectionCard}>
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-indigo-500" />
            <h4 className="font-black text-slate-700 text-sm uppercase">Tiempo de Protrombina (TP)</h4>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className={labelBase}>Control</label>
              <input name="tp_control" type="text" value={resultados?.tp_control || ""} onChange={(e) => handleChange("tp_control", e.target.value)} className={inputBase} placeholder="12.5" />
            </div>
            <div>
              <label className={labelBase}>Paciente</label>
              <input name="tp_paciente" type="text" value={resultados?.tp_paciente || ""} onChange={(e) => handleChange("tp_paciente", e.target.value)} className={inputBase} placeholder="13.0" />
            </div>
            <div>
              <label className={labelBase}>Actividad %</label>
              <input name="tp_act" type="text" value={resultados?.tp_act || ""} onChange={(e) => handleChange("tp_act", e.target.value)} className={inputBase} placeholder="100" />
            </div>
            <div>
              <label className={labelBase}>Razón</label>
              <input name="tp_razon" type="text" value={resultados?.tp_razon || ""} onChange={(e) => handleChange("tp_razon", e.target.value)} className={inputBase} placeholder="1.0" />
            </div>
            <div>
              <label className={labelBase}>INR</label>
              <input name="tp_inr" type="text" value={resultados?.tp_inr || ""} onChange={(e) => handleChange("tp_inr", e.target.value)} className={inputBase} placeholder="1.0" />
            </div>
            <div>
              <label className={labelBase}>ISI</label>
              <input name="tp_isi" type="text" value={resultados?.tp_isi || ""} onChange={(e) => handleChange("tp_isi", e.target.value)} className={inputBase} placeholder="1.0" />
            </div>
          </div>
        </div>

        {/* TTP ACTIVA & FIBRINOGENO */}
        <div className={sectionCard}>
          <div className="flex items-center gap-2 mb-2">
            <Activity size={16} className="text-rose-500" />
            <h4 className="font-black text-slate-700 text-sm uppercase">TTP Activa y Fibrinógeno</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelBase}>TTPA Control</label>
              <input name="tpt_control" type="text" value={resultados?.tpt_control || ""} onChange={(e) => handleChange("tpt_control", e.target.value)} className={inputBase} placeholder="30.0" />
            </div>
            <div>
              <label className={labelBase}>TTPA Paciente</label>
              <input name="tpt_paciente" type="text" value={resultados?.tpt_paciente || ""} onChange={(e) => handleChange("tpt_paciente", e.target.value)} className={inputBase} placeholder="32.0" />
            </div>
            <div className="md:col-span-2 pt-2">
              <label className={labelBase}>Fibrinógeno</label>
              <div className="relative">
                <input name="fibrinogeno" type="text" value={resultados?.fibrinogeno || ""} onChange={(e) => handleChange("fibrinogeno", e.target.value)} className={`${inputBase} bg-rose-50/30 border-rose-100 focus:border-rose-400`} placeholder="200 - 400" />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-rose-300 uppercase">Crítico</div>
              </div>
            </div>
          </div>
        </div>

        {/* ESTADO ANTICOAGULACION */}
        <div className={`${sectionCard} lg:col-span-2 !bg-indigo-50/50 border-indigo-100`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
               <ShieldAlert className="text-indigo-600" size={20} />
               <div>
                 <h4 className="font-black text-indigo-900 text-sm uppercase">Protocolo de Anticoagulación</h4>
                 <p className="text-[10px] font-bold text-indigo-400 uppercase">Información vital para interpretación</p>
               </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 flex-1 max-w-2xl">
              <div className="flex-1">
                <label className={`${labelBase} text-indigo-400`}>Estado Actual</label>
                <select 
                  name="anticoagulado" 
                  value={resultados?.anticoagulado || "No"} 
                  onChange={(e) => handleChange("anticoagulado", e.target.value)} 
                  className={`${inputBase} !bg-white border-indigo-200`}
                >
                  <option value="No">No recibe tratamiento</option>
                  <option value="Sí">Paciente Anticoagulado</option>
                </select>
              </div>
              
              {resultados?.anticoagulado === "Sí" && (
                <div className="flex-1 animate-in slide-in-from-right-4 duration-300">
                  <label className={`${labelBase} text-indigo-400`}>Medicamento y Dosis</label>
                  <input 
                    name="medicamento" 
                    type="text" 
                    value={resultados?.medicamento || ""} 
                    onChange={(e) => handleChange("medicamento", e.target.value)} 
                    className={`${inputBase} !bg-white border-indigo-200`} 
                    placeholder="Ej. Warfarina 5mg" 
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* OBSERVACIONES */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-2 ml-4">
            <FileText size={14} className="text-slate-400" />
            <label className={labelBase}>Notas e Interpretación Técnica</label>
          </div>
          <textarea
            name="observacion"
            value={resultados?.observacion || ""}
            onChange={(e) => handleChange("observacion", e.target.value)}
            className="w-full bg-white border-2 border-slate-100 rounded-[2rem] px-8 py-6 text-sm font-medium text-slate-600 outline-none focus:border-indigo-500 transition-all min-h-[120px] shadow-sm resize-none"
            placeholder="Escriba aquí notas sobre hemólisis, fibrina o sugerencias clínicas..."
          />
        </div>
      </div>
    </div>
  );
}