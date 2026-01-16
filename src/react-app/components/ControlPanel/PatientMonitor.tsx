import { useEffect, useState } from "react";
import { Activity, TrendingUp, TrendingDown, Calendar, FileText, Loader } from "lucide-react";

interface HistoricalExam {
    id: number;
    tipo: string;
    fecha: string;
    estado: string;
    resultados: any;
}

interface PatientMonitorProps {
    pacienteId: number;
    pacienteNombre: string;
    onExamSelect?: (exam: HistoricalExam) => void;
}

export default function PatientMonitor({ pacienteId, pacienteNombre, onExamSelect }: PatientMonitorProps) {
    const [examenes, setExamenes] = useState<HistoricalExam[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState<string>("all");

    useEffect(() => {
        loadPatientHistory();
    }, [pacienteId]);

    const loadPatientHistory = async () => {
        setLoading(true);
        try {
            // Cargar todos los exámenes del paciente
            const res = await fetch(`/api/examenes?paciente_id=${pacienteId}`);
            const data = (await res.json()) as HistoricalExam[];

            // Ordenar por fecha descendente (más reciente primero)
            const sorted = data.sort((a: HistoricalExam, b: HistoricalExam) =>
                new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
            );

            setExamenes(sorted);
        } catch (error) {
            console.error("Error loading patient history:", error);
        } finally {
            setLoading(false);
        }
    };

    // Obtener tipos únicos de exámenes
    const examTypes = Array.from(new Set(examenes.map(e => e.tipo)));

    // Filtrar exámenes por tipo seleccionado
    const filteredExamenes = selectedType === "all"
        ? examenes
        : examenes.filter(e => e.tipo === selectedType);

    // Calcular estadísticas
    const totalExamenes = examenes.length;
    const completados = examenes.filter(e => e.estado === "completado").length;
    const pendientes = examenes.filter(e => e.estado !== "completado").length;

    // Obtener tendencias de un valor específico (ejemplo: glicemia)
    const getTrendForParameter = (paramName: string, examType: string) => {
        const typeExams = examenes
            .filter(e => e.tipo === examType && e.estado === "completado")
            .slice(0, 5); // Últimos 5 exámenes

        if (typeExams.length < 2) return null;

        const values = typeExams
            .map(e => {
                const value = e.resultados?.[paramName];
                const numValue = parseFloat(String(value).replace(/,/g, ""));
                return isNaN(numValue) ? null : numValue;
            })
            .filter(v => v !== null) as number[];

        if (values.length < 2) return null;

        const trend = values[0] > values[values.length - 1] ? "up" : "down";
        const changePercent = Math.abs(((values[0] - values[values.length - 1]) / values[values.length - 1]) * 100);

        return { trend, changePercent: changePercent.toFixed(1), values };
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const offset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() + offset).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader className="animate-spin text-blue-500" size={32} />
                <span className="ml-3 text-sm font-bold text-slate-500">Cargando historial...</span>
            </div>
        );
    }

    if (examenes.length === 0) {
        return (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center">
                <FileText className="mx-auto text-slate-300 mb-3" size={40} />
                <p className="text-sm font-bold text-slate-400">
                    No hay historial de exámenes para este paciente
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header con estadísticas */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl">
                <h3 className="text-xs font-black uppercase tracking-widest mb-1 opacity-80">
                    Monitor Profesional
                </h3>
                <h2 className="text-xl font-black mb-4">{pacienteNombre}</h2>

                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                        <div className="text-2xl font-black">{totalExamenes}</div>
                        <div className="text-[10px] font-bold opacity-80">Total</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                        <div className="text-2xl font-black text-emerald-300">{completados}</div>
                        <div className="text-[10px] font-bold opacity-80">Completados</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                        <div className="text-2xl font-black text-amber-300">{pendientes}</div>
                        <div className="text-[10px] font-bold opacity-80">Pendientes</div>
                    </div>
                </div>
            </div>

            {/* Filtros por tipo de examen */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">
                    Filtrar por tipo
                </label>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setSelectedType("all")}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 ${selectedType === "all"
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300"
                            }`}
                    >
                        Todos ({totalExamenes})
                    </button>
                    {examTypes.map(type => {
                        const count = examenes.filter(e => e.tipo === type).length;
                        return (
                            <button
                                key={type}
                                onClick={() => setSelectedType(type)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 ${selectedType === type
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300"
                                    }`}
                            >
                                {type} ({count})
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Análisis de tendencias (solo para Química y Hematología) */}
            {(selectedType === "Química Clínica" || selectedType === "Hematología" || selectedType === "all") && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <h3 className="text-sm font-black text-slate-700 mb-4 flex items-center gap-2">
                        <Activity size={18} className="text-blue-600" />
                        Análisis de Tendencias
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Tendencia de Glicemia */}
                        {(() => {
                            const trend = getTrendForParameter("glicemia", "Química Clínica");
                            if (!trend) return null;
                            return (
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-slate-600">Glicemia</span>
                                        <div className={`flex items-center gap-1 ${trend.trend === "up" ? "text-red-600" : "text-emerald-600"
                                            }`}>
                                            {trend.trend === "up" ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                            <span className="text-xs font-black">{trend.changePercent}%</span>
                                        </div>
                                    </div>
                                    <div className="flex items-end gap-1 h-12">
                                        {trend.values.reverse().map((val, i) => (
                                            <div
                                                key={i}
                                                className="flex-1 bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                                                style={{ height: `${(val / Math.max(...trend.values)) * 100}%` }}
                                                title={`${val}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Tendencia de Hemoglobina */}
                        {(() => {
                            const trend = getTrendForParameter("hemoglobina", "Hematología");
                            if (!trend) return null;
                            return (
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-slate-600">Hemoglobina</span>
                                        <div className={`flex items-center gap-1 ${trend.trend === "up" ? "text-emerald-600" : "text-red-600"
                                            }`}>
                                            {trend.trend === "up" ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                            <span className="text-xs font-black">{trend.changePercent}%</span>
                                        </div>
                                    </div>
                                    <div className="flex items-end gap-1 h-12">
                                        {trend.values.reverse().map((val, i) => (
                                            <div
                                                key={i}
                                                className="flex-1 bg-red-500 rounded-t transition-all hover:bg-red-600"
                                                style={{ height: `${(val / Math.max(...trend.values)) * 100}%` }}
                                                title={`${val}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            )}

            {/* Historial de exámenes */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50">
                    <h3 className="text-sm font-black text-slate-700 flex items-center gap-2">
                        <Calendar size={18} className="text-blue-600" />
                        Historial de Exámenes
                    </h3>
                </div>

                <div className="max-h-96 overflow-y-auto custom-scrollbar">
                    <div className="divide-y divide-slate-100">
                        {filteredExamenes.map((exam) => (
                            <div
                                key={exam.id}
                                onClick={() => onExamSelect && onExamSelect(exam)}
                                className={`p-4 hover:bg-slate-50 transition-colors ${onExamSelect ? 'cursor-pointer active:bg-slate-100' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm">{exam.tipo}</h4>
                                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-1">
                                            <Calendar size={12} />
                                            {formatDate(exam.fecha)}
                                        </p>
                                    </div>
                                    <span
                                        className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${exam.estado === "completado"
                                            ? "bg-emerald-100 text-emerald-700"
                                            : exam.estado === "en_proceso"
                                                ? "bg-blue-100 text-blue-700"
                                                : "bg-amber-100 text-amber-700"
                                            }`}
                                    >
                                        {exam.estado.replace("_", " ")}
                                    </span>
                                </div>

                                {/* Mostrar algunos valores clave si están disponibles */}
                                {exam.estado === "completado" && exam.resultados && (
                                    <div className="mt-3 bg-slate-50 rounded-lg p-3">
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            {exam.tipo === "Química Clínica" && (
                                                <>
                                                    {exam.resultados.glicemia && (
                                                        <div>
                                                            <span className="text-slate-500 font-medium">Glicemia: </span>
                                                            <span className="font-bold text-slate-700">{exam.resultados.glicemia}</span>
                                                        </div>
                                                    )}
                                                    {exam.resultados.colesterol && (
                                                        <div>
                                                            <span className="text-slate-500 font-medium">Colesterol: </span>
                                                            <span className="font-bold text-slate-700">{exam.resultados.colesterol}</span>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                            {exam.tipo === "Hematología" && (
                                                <>
                                                    {exam.resultados.hemoglobina && (
                                                        <div>
                                                            <span className="text-slate-500 font-medium">Hemoglobina: </span>
                                                            <span className="font-bold text-slate-700">{exam.resultados.hemoglobina}</span>
                                                        </div>
                                                    )}
                                                    {exam.resultados.leucocitos && (
                                                        <div>
                                                            <span className="text-slate-500 font-medium">Leucocitos: </span>
                                                            <span className="font-bold text-slate-700">{exam.resultados.leucocitos}</span>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
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
