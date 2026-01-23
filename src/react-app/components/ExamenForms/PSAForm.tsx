import React, { useEffect } from "react";
import { Activity, FlaskConical, Beaker } from "lucide-react";

interface PSAFormProps {
    resultados: any;
    onChange: (resultados: any) => void;
}

export default function PSAForm({ resultados, onChange }: PSAFormProps) {

    const handleChange = (field: string, value: string) => {
        onChange({ ...resultados, [field]: value });
    };

    // Autocalcular Indice PSA (L/T * 100)
    useEffect(() => {
        const total = parseFloat(resultados?.psa_total);
        const libre = parseFloat(resultados?.psa_libre);

        if (!isNaN(total) && !isNaN(libre) && total > 0) {
            const indice = ((libre / total) * 100).toFixed(2);
            if (resultados?.indice_psa !== indice) {
                handleChange("indice_psa", indice);
            }
        }
    }, [resultados?.psa_total, resultados?.psa_libre]);

    // Si el método está vacío, poner "Elisa" por defecto
    useEffect(() => {
        if (!resultados?.metodo) {
            handleChange("metodo", "Elisa");
        }
    }, []);

    const sectionCard = "p-5 rounded-2xl bg-slate-50/50 border border-slate-100 transition-all hover:bg-slate-50 group";
    const labelBase = "text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block";
    const inputBase = "w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[13px] font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300";
    const autoInput = "w-full bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 text-[13px] font-black text-blue-700 outline-none cursor-default";

    return (
        <div className="w-full space-y-6 pb-20">

            {/* HEADER */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                    <Activity size={16} />
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Antígeno Prostático Específico (PSA)</h3>
            </div>

            <div className="grid grid-cols-1 gap-6">

                {/* RESULTADOS PSA */}
                <div className={sectionCard}>
                    <div className="flex items-center gap-2 mb-4">
                        <FlaskConical size={14} className="text-blue-600" />
                        <h4 className="font-bold text-slate-900 text-[10px] uppercase tracking-wider">Análisis Cuantitativo</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className={labelBase}>PSA Total</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={resultados?.psa_total || ""}
                                    onChange={(e) => handleChange("psa_total", e.target.value)}
                                    className={inputBase}
                                    placeholder="0.00"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-300">ng/ml</span>
                            </div>
                        </div>

                        <div>
                            <label className={labelBase}>PSA Libre</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={resultados?.psa_libre || ""}
                                    onChange={(e) => handleChange("psa_libre", e.target.value)}
                                    className={inputBase}
                                    placeholder="0.00"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-300">ng/ml</span>
                            </div>
                        </div>

                        <div>
                            <label className={`${labelBase} text-blue-500`}>Índice (L/T) <span className="opacity-50">(Auto)</span></label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={resultados?.indice_psa || ""}
                                    readOnly
                                    className={autoInput}
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-blue-300">%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* METODO Y OTROS */}
                <div className={sectionCard}>
                    <div className="flex items-center gap-2 mb-4">
                        <Beaker size={14} className="text-amber-500" />
                        <h4 className="font-bold text-slate-900 text-[10px] uppercase tracking-wider">Metodología</h4>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className={labelBase}>Método de Análisis</label>
                            <input
                                type="text"
                                value={resultados?.metodo || ""}
                                onChange={(e) => handleChange("metodo", e.target.value)}
                                className={inputBase}
                                placeholder="Elisa"
                            />
                        </div>
                    </div>
                </div>

                {/* OBSERVACIONES */}
                <div>
                    <label className={labelBase}>Observaciones</label>
                    <textarea
                        value={resultados?.observacion || ""}
                        onChange={(e) => handleChange("observacion", e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 outline-none focus:border-blue-500 min-h-[80px] resize-none"
                        placeholder="Notas técnicas..."
                    />
                </div>

            </div>
        </div>
    );
}
