import { useState, useEffect } from "react";
import { Search, Activity, ChevronLeft, Database } from "lucide-react";
import PatientMonitor from "@/react-app/components/ControlPanel/PatientMonitor";
import ResultComparison from "@/react-app/components/ControlPanel/ResultComparison";
import { formatDisplayDate } from "@/utils/date";

interface Paciente {
    id: number;
    nombre: string;
    cedula: string;
}

export default function ControlPacientePage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<Paciente[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<Paciente | null>(null);
    const [selectedExam, setSelectedExam] = useState<any | null>(null);
    const [referencias, setReferencias] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Efecto para búsqueda de pacientes
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm.length > 1) {
                setIsSearching(true);
                try {
                    const res = await fetch("/api/pacientes");
                    const data = (await res.json()) as Paciente[];
                    const filtered = data.filter((p: Paciente) =>
                        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.cedula.includes(searchTerm)
                    );
                    setSearchResults(filtered.slice(0, 5));
                } catch (error) {
                    console.error("Error buscando pacientes:", error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    // Efecto para cargar referencias cuando se selecciona un examen
    useEffect(() => {
        if (selectedExam) {
            loadReferencias(selectedExam.tipo);
        }
    }, [selectedExam]);

    const loadReferencias = async (tipo: string) => {
        try {
            let tabla = "";
            if (tipo === "Química Clínica") tabla = "quimica";
            else if (tipo === "Hematología") tabla = "hematologia";
            else if (tipo === "Coagulación") tabla = "coagulacion";
            else {
                setReferencias([]);
                return;
            }

            const res = await fetch(`/api/valores-referencia?tabla=${tabla}`);
            const data = (await res.json()) as any[];
            setReferencias(data);
        } catch (error) {
            console.error("Error cargando referencias:", error);
            setReferencias([]);
        }
    };

    const handleSelectPatient = (patient: Paciente) => {
        setSelectedPatient(patient);
        setSearchTerm("");
        setSearchResults([]);
        setSelectedExam(null);
    };

    const handleBackToSearch = () => {
        setSelectedPatient(null);
        setSelectedExam(null);
    };

    return (
        <div className="max-w-[1500px] mx-auto p-4 md:p-8 space-y-10 animate-in fade-in duration-700">

            {/* HEADER BIO-EVOLUTIVO */}
            <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-100 shrink-0 transition-all">
                        <Activity size={20} />
                    </div>
                    <div>
                        <h1 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] leading-none mb-2">Seguimiento Bio-Evolutivo</h1>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Análisis técnico de comparativas referenciales</p>
                    </div>
                </div>
                {selectedPatient && (
                    <button
                        onClick={handleBackToSearch}
                        className="px-6 py-3 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-900 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 border border-slate-100 shadow-sm active:scale-95"
                    >
                        <ChevronLeft size={14} /> Cambiar Paciente
                    </button>
                )}
            </div>

            <main className="relative">
                {!selectedPatient ? (
                    /* VISTA DE BÚSQUEDA INVERTIDA Y MINIMALISTA */
                    <div className="max-w-xl mx-auto min-h-[60vh] flex flex-col justify-between py-12 animate-in fade-in duration-1000">
                        {/* PARTE SUPERIOR: TEXTO DE BIENVENIDA */}
                        <div className="text-center pt-10">
                            <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-slate-200 shadow-sm">
                                <Activity size={28} />
                            </div>
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] mb-3">Monitor Clínico</h2>
                            <p className="text-xs font-bold text-slate-900 uppercase tracking-tight">Evolución de Datos Médicos</p>
                        </div>

                        {/* PARTE INFERIOR: BUSCADOR CON AUTOCOMPLETADO HACIA ARRIBA */}
                        <div className="relative mt-auto pt-20">
                            {/* AUTOCOMPLETADO FLOTANTE - AHORA HACIA ARRIBA */}
                            {searchResults.length > 0 && (
                                <div className="absolute bottom-full left-0 right-0 mb-4 bg-white/80 backdrop-blur-xl border-t border-slate-50 rounded-t-[2rem] shadow-[0_-20px_50px_-15px_rgba(0,0,0,0.05)] overflow-hidden z-[500] animate-in slide-in-from-bottom-4 duration-300">
                                    <div className="px-8 py-3 bg-slate-50/30">
                                        <span className="text-[7px] font-black text-slate-300 uppercase tracking-[0.4em]">Resultados sugeridos</span>
                                    </div>
                                    <div className="max-h-[280px] overflow-y-auto no-scrollbar">
                                        {searchResults.map((patient) => (
                                            <button
                                                key={patient.id}
                                                onClick={() => handleSelectPatient(patient)}
                                                className="w-full flex items-center gap-5 px-8 py-4 hover:bg-slate-50 transition-all border-b border-slate-50/50 last:border-0 group"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center font-black text-[10px] text-slate-300 group-hover:text-slate-900 transition-colors">
                                                    {patient.nombre.charAt(0)}
                                                </div>
                                                <div className="text-left flex-1 min-w-0">
                                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest truncate group-hover:text-slate-900">{patient.nombre}</p>
                                                    <p className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter opacity-70">REF: {patient.cedula}</p>
                                                </div>
                                                <div className="w-1 h-1 rounded-full bg-slate-100 group-hover:bg-blue-400" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="relative group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-200 transition-colors group-focus-within:text-slate-900" size={18} />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="BUSCAR EXPEDIENTE..."
                                    className="w-full pl-16 pr-8 py-5 bg-slate-50/50 hover:bg-white border-transparent focus:bg-white border focus:border-slate-100 rounded-2xl outline-none text-[11px] font-black uppercase tracking-[0.2em] shadow-sm focus:shadow-xl focus:shadow-slate-100 transition-all placeholder:text-slate-200"
                                    autoFocus
                                />
                                {isSearching && (
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2">
                                        <div className="w-4 h-4 border-2 border-slate-100 border-t-slate-900 rounded-full animate-spin" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* VISTA DE MONITOR ACTIVA REDISEÑADA */
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-in fade-in duration-1000">
                        <div className="lg:col-span-4 lg:sticky lg:top-8 h-fit">
                            <div className="bg-white border border-slate-100 rounded-[3rem] p-4 shadow-sm">
                                <PatientMonitor
                                    pacienteId={selectedPatient.id}
                                    pacienteNombre={selectedPatient.nombre}
                                    onExamSelect={setSelectedExam}
                                />
                            </div>
                        </div>

                        {/* DERECHA: COMPARATIVA TÉCNICA */}
                        <div className="lg:col-span-8">
                            {selectedExam ? (
                                <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm animate-in slide-in-from-right-8 duration-700 ease-out min-h-[700px]">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 border-b border-slate-50 pb-10">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 bg-slate-50 text-slate-900 rounded-[1.5rem] flex items-center justify-center border border-slate-100 shadow-inner">
                                                <Database size={24} />
                                            </div>
                                            <div>
                                                <h4 className="text-[13px] font-black text-slate-900 uppercase tracking-[0.2em] mb-1">{selectedExam.tipo}</h4>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                    <Activity size={12} /> Análisis Bioquímico Detallado
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="inline-block px-4 py-1.5 bg-slate-900 text-white rounded-full text-[9px] font-black uppercase tracking-widest mb-2">
                                                {formatDisplayDate(selectedExam.fecha)}
                                            </div>
                                            <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Protocolo ID: VTL-{selectedExam.id}</p>
                                        </div>
                                    </div>

                                    <div className="px-2">
                                        <ResultComparison
                                            examType={selectedExam.tipo}
                                            results={selectedExam.resultados}
                                            references={referencias}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="h-[700px] flex flex-col items-center justify-center bg-white border border-slate-100 rounded-[3rem] p-12 text-center shadow-sm border-dashed">
                                    <div className="w-24 h-24 bg-slate-50 text-slate-100 rounded-full flex items-center justify-center mb-8 border border-slate-50 ring-8 ring-slate-50/50">
                                        <Activity size={40} className="animate-pulse" />
                                    </div>
                                    <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] mb-4">Esperando selección</h3>
                                    <p className="text-[11px] text-slate-200 font-bold uppercase tracking-widest max-w-xs leading-relaxed">
                                        Seleccione un informe del monitor lateral para desglosar la visualización técnica
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #f1f5f9; border-radius: 20px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #e2e8f0; }
            `}</style>
        </div>
    );
}
