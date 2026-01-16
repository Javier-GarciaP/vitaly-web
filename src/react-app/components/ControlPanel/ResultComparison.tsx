import { AlertTriangle, CheckCircle, TrendingDown, TrendingUp, Activity } from "lucide-react";

interface ValueStatus {
    value: string | number;
    reference: string;
    status: "normal" | "high" | "low" | "unknown";
    label: string;
}

interface ResultComparisonProps {
    examType: string;
    results: any;
    references: Array<{ nombre_examen: string; valor_referencia: string }>;
}

export default function ResultComparison({ examType, results, references }: ResultComparisonProps) {

    // Función para determinar si un valor está dentro del rango de referencia
    const analyzeValue = (value: string | number | undefined, reference: string, label: string): ValueStatus => {
        if (!value || value === "" || value === "-" || value === "N/A") {
            return { value: "-", reference, status: "unknown", label };
        }

        const numValue = typeof value === "number" ? value : parseFloat(String(value).replace(/,/g, ""));

        if (isNaN(numValue)) {
            return { value: String(value), reference, status: "unknown", label };
        }

        // Analizar diferentes formatos de rangos de referencia
        // Formato: "70 - 110 mg/dL" o "Hasta 200" o "> 45" o "< 15"
        const refStr = reference.toLowerCase();

        // Caso 1: "Hasta X" o "Hasta X unidad"
        if (refStr.includes("hasta")) {
            const match = refStr.match(/hasta\s+([\d.]+)/);
            if (match) {
                const maxValue = parseFloat(match[1]);
                return {
                    value: String(value),
                    reference,
                    status: numValue <= maxValue ? "normal" : "high",
                    label
                };
            }
        }

        // Caso 2: "> X" (mayor que)
        if (refStr.includes(">") && !refStr.includes("<")) {
            const match = refStr.match(/>\s*(=?)\s*([\d.]+)/);
            if (match) {
                const minValue = parseFloat(match[2]);
                const includeEqual = match[1] === "=";
                return {
                    value: String(value),
                    reference,
                    status: includeEqual
                        ? (numValue >= minValue ? "normal" : "low")
                        : (numValue > minValue ? "normal" : "low"),
                    label
                };
            }
        }

        // Caso 3: "< X" (menor que)
        if (refStr.includes("<") && !refStr.includes(">")) {
            const match = refStr.match(/<\s*(=?)\s*([\d.]+)/);
            if (match) {
                const maxValue = parseFloat(match[2]);
                const includeEqual = match[1] === "=";
                return {
                    value: String(value),
                    reference,
                    status: includeEqual
                        ? (numValue <= maxValue ? "normal" : "high")
                        : (numValue < maxValue ? "normal" : "high"),
                    label
                };
            }
        }

        // Caso 4: "X - Y" (rango)
        const rangeMatch = refStr.match(/([\d.]+)\s*-\s*([\d.]+)/);
        if (rangeMatch) {
            const minValue = parseFloat(rangeMatch[1]);
            const maxValue = parseFloat(rangeMatch[2]);

            let status: "normal" | "high" | "low" = "normal";
            if (numValue < minValue) status = "low";
            else if (numValue > maxValue) status = "high";

            return { value: String(value), reference, status, label };
        }

        // Si no se puede analizar, lo marcamos como desconocido
        return { value: String(value), reference, status: "unknown", label };
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "normal":
                return <CheckCircle size={18} className="text-emerald-500" />;
            case "high":
                return <TrendingUp size={18} className="text-red-500" />;
            case "low":
                return <TrendingDown size={18} className="text-amber-500" />;
            default:
                return <Activity size={18} className="text-slate-400" />;
        }
    };

    const getStatusBg = (status: string) => {
        switch (status) {
            case "normal":
                return "bg-emerald-50 border-emerald-200";
            case "high":
                return "bg-red-50 border-red-200";
            case "low":
                return "bg-amber-50 border-amber-200";
            default:
                return "bg-slate-50 border-slate-200";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "normal":
                return "text-emerald-700";
            case "high":
                return "text-red-700";
            case "low":
                return "text-amber-700";
            default:
                return "text-slate-600";
        }
    };

    // Función para obtener el valor de referencia de la BD
    const getReference = (nombre: string): string => {
        const ref = references.find(r =>
            r.nombre_examen.toLowerCase() === nombre.toLowerCase()
        );
        return ref?.valor_referencia || "N/A";
    };

    // Mapeo de campos según tipo de examen
    const getExamFields = (): ValueStatus[] => {
        if (!results) return [];

        switch (examType) {
            case "Química Clínica":
                return [
                    analyzeValue(results.glicemia, getReference("Glicemia"), "Glicemia"),
                    analyzeValue(results.urea, getReference("Urea"), "Urea"),
                    analyzeValue(results.creatinina, getReference("Creatinina"), "Creatinina"),
                    analyzeValue(results.ac_urico, getReference("Ácido Úrico"), "Ácido Úrico"),
                    analyzeValue(results.colesterol, getReference("Colesterol Total"), "Colesterol Total"),
                    analyzeValue(results.trigliceridos, getReference("Triglicéridos"), "Triglicéridos"),
                    analyzeValue(results.hdl, getReference("Colesterol HDL"), "Colesterol HDL"),
                    analyzeValue(results.ldh, getReference("Colesterol LDL"), "Colesterol LDL"),
                    analyzeValue(results.tgo, getReference("T.G.O (AST)"), "T.G.O (AST)"),
                    analyzeValue(results.tgp, getReference("T.G.P (ALT)"), "T.G.P (ALT)"),
                ].filter(item => item.value !== "-");

            case "Hematología":
                return [
                    analyzeValue(results.hematies, getReference("Hematíes"), "Hematíes"),
                    analyzeValue(results.hemoglobina, getReference("Hemoglobina"), "Hemoglobina"),
                    analyzeValue(results.hematocrito, getReference("Hematocrito"), "Hematocrito"),
                    analyzeValue(results.leucocitos, getReference("Leucocitos"), "Leucocitos"),
                    analyzeValue(results.plaquetas, getReference("Plaquetas"), "Plaquetas"),
                    analyzeValue(results.neutrofilos, getReference("Neutrófilos"), "Neutrófilos"),
                    analyzeValue(results.linfocitos, getReference("Linfocitos"), "Linfocitos"),
                ].filter(item => item.value !== "-");

            case "Coagulación":
                return [
                    analyzeValue(results.tp_paciente, getReference("TP Paciente"), "TP Paciente"),
                    analyzeValue(results.tpt_paciente, getReference("TPT Paciente"), "TPT Paciente"),
                    analyzeValue(results.fibrinogeno, getReference("Fibrinógeno"), "Fibrinógeno"),
                    analyzeValue(results.tp_inr, getReference("INR"), "INR"),
                ].filter(item => item.value !== "-");

            default:
                return [];
        }
    };

    const examFields = getExamFields();

    if (examFields.length === 0) {
        return (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center">
                <Activity className="mx-auto text-slate-300 mb-3" size={40} />
                <p className="text-sm font-bold text-slate-400">
                    No hay valores disponibles para comparar
                </p>
            </div>
        );
    }

    const normalCount = examFields.filter(f => f.status === "normal").length;
    const highCount = examFields.filter(f => f.status === "high").length;
    const lowCount = examFields.filter(f => f.status === "low").length;
    const totalCount = examFields.length;

    return (
        <div className="space-y-6">
            {/* Resumen Visual */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl">
                <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Activity size={16} />
                    Resumen de Control
                </h3>
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                        <div className="text-2xl font-black">{normalCount}</div>
                        <div className="text-[10px] font-bold opacity-80">Normales</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                        <div className="text-2xl font-black text-red-300">{highCount}</div>
                        <div className="text-[10px] font-bold opacity-80">Elevados</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                        <div className="text-2xl font-black text-amber-300">{lowCount}</div>
                        <div className="text-[10px] font-bold opacity-80">Bajos</div>
                    </div>
                </div>

                {/* Barra de progreso */}
                <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-emerald-400 transition-all duration-500"
                        style={{ width: `${(normalCount / totalCount) * 100}%` }}
                    />
                </div>
                <p className="text-[10px] font-bold text-center mt-2 opacity-80">
                    {Math.round((normalCount / totalCount) * 100)}% dentro de rangos normales
                </p>
            </div>

            {/* Tabla de Valores */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto max-h-96 custom-scrollbar">
                    <table className="w-full">
                        <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
                            <tr>
                                <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Parámetro
                                </th>
                                <th className="px-4 py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Valor
                                </th>
                                <th className="px-4 py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Referencia
                                </th>
                                <th className="px-4 py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Estado
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {examFields.map((field, index) => (
                                <tr key={index} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <span className="font-bold text-sm text-slate-700">{field.label}</span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`font-mono font-bold text-sm ${getStatusText(field.status)}`}>
                                            {field.value}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="text-xs font-medium text-slate-500">{field.reference}</span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${getStatusBg(field.status)}`}>
                                            {getStatusIcon(field.status)}
                                            <span className={`text-[10px] font-black uppercase ${getStatusText(field.status)}`}>
                                                {field.status === "normal" ? "Normal" : field.status === "high" ? "Alto" : field.status === "low" ? "Bajo" : "N/A"}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Alertas */}
            {(highCount > 0 || lowCount > 0) && (
                <div className="bg-amber-50 border-l-4 border-amber-500 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
                        <div>
                            <p className="font-bold text-sm text-amber-900">Valores fuera de rango detectados</p>
                            <p className="text-xs text-amber-700 mt-1">
                                Se recomienda revisión médica para {highCount + lowCount} parámetro(s) alterado(s).
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
        </div>
    );
}
