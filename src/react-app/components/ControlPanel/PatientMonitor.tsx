import { useEffect, useState } from "react";
import { Calendar, FileText, Loader } from "lucide-react";

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

            // FILTRO DE CONTROL PROFESIONAL: Solo los que tienen comparativa técnica
            const TIPOS_VALIDOS = ["Hematología", "Química Clínica", "Coagulación"];
            const filteredData = data.filter(e => TIPOS_VALIDOS.includes(e.tipo));

            // Ordenar por fecha descendente (más reciente primero)
            const sorted = filteredData.sort((a: HistoricalExam, b: HistoricalExam) =>
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
    const examTypes: string[] = Array.from(new Set(examenes.map(e => e.tipo)));

    // Filtrar exámenes por tipo seleccionado
    const filteredExamenes: HistoricalExam[] = selectedType === "all"
        ? examenes
        : examenes.filter(e => e.tipo === selectedType);

    // Calcular estadísticas
    const totalExamenes: number = examenes.length;
    const completados: number = examenes.filter(e => e.estado === "completado").length;

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
            {/* Header con estadísticas Minimalista */}
            <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl shadow-slate-200">
                <div className="mb-6">
                    <p className="text-[7px] font-black uppercase tracking-[0.4em] mb-2 text-slate-400">Panel Bio-Evolutivo</p>
                    <h2 className="text-sm font-black uppercase tracking-widest">{pacienteNombre}</h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                        <div className="text-xl font-black">{totalExamenes}</div>
                        <div className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-1">Bio-Registros</div>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                        <div className="text-xl font-black text-emerald-400">{completados}</div>
                        <div className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-1">Verificados</div>
                    </div>
                </div>
            </div>

            {/* Filtros por tipo de examen Minimalistas */}
            <div className="bg-white rounded-2xl border border-slate-100 p-2 flex gap-1 overflow-x-auto no-scrollbar">
                <button
                    onClick={() => setSelectedType("all")}
                    className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${selectedType === "all"
                        ? "bg-slate-900 text-white shadow-lg"
                        : "bg-transparent text-slate-400 hover:text-slate-900"
                        }`}
                >
                    Todos
                </button>
                {examTypes.map(type => (
                    <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${selectedType === type
                            ? "bg-slate-900 text-white shadow-lg"
                            : "bg-transparent text-slate-400 hover:text-slate-900"
                            }`}
                    >
                        {type}
                    </button>
                ))}
            </div>

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
