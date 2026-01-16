import { useState, useEffect } from "react";
import { Search, Activity, User, ChevronLeft } from "lucide-react";
import PatientMonitor from "@/react-app/components/ControlPanel/PatientMonitor";
import ResultComparison from "@/react-app/components/ControlPanel/ResultComparison";

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
            if (searchTerm.length > 2) {
                setIsSearching(true);
                try {
                    // Nota: Asumimos que existe un endpoint de búsqueda o filtramos de todos
                    // Por ahora usaremos el endpoint de pacientes y filtraremos en cliente si la API no soporta busqueda directa
                    // Idealmente: /api/pacientes?search=${searchTerm}
                    const res = await fetch("/api/pacientes");
                    const data = (await res.json()) as Paciente[];
                    // Filtrado simple en cliente por ahora
                    const filtered = data.filter((p: Paciente) =>
                        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.cedula.includes(searchTerm)
                    );
                    setSearchResults(filtered.slice(0, 5)); // Limitamos a 5 resultados
                } catch (error) {
                    console.error("Error buscando pacientes:", error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 500);

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
        setSelectedExam(null); // Resetear examen seleccionado
    };

    const handleBackToSearch = () => {
        setSelectedPatient(null);
        setSelectedExam(null);
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 font-sans text-slate-700">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* HEADER PRINCIPAL */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 ring-4 ring-white">
                            <Activity size={30} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                                Control Profesional
                            </h1>
                            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                Monitor de Pacientes y Análisis Clínico
                            </div>
                        </div>
                    </div>

                    {selectedPatient && (
                        <button
                            onClick={handleBackToSearch}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all"
                        >
                            <ChevronLeft size={16} /> Cambiar Paciente
                        </button>
                    )}
                </header>

                {/* CONTENIDO PRINCIPAL */}
                <main className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {!selectedPatient ? (
                        // VISTA DE BÚSQUEDA DE PACIENTE
                        <div className="max-w-xl mx-auto mt-20">
                            <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-slate-100 text-center space-y-8">
                                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-600 mb-4">
                                    <User size={40} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 mb-2">Seleccionar Paciente</h2>
                                    <p className="text-slate-500 font-medium text-sm">
                                        Busque por nombre o número de cédula para acceder al historial clínico y herramientas de análisis.
                                    </p>
                                </div>

                                <div className="relative">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Escriba nombre o cédula..."
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold text-slate-700 transition-all"
                                            autoFocus
                                        />
                                        {isSearching && (
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                        )}
                                    </div>

                                    {/* Resultados de búsqueda flotantes */}
                                    {searchResults.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-20 text-left">
                                            {searchResults.map((patient) => (
                                                <button
                                                    key={patient.id}
                                                    onClick={() => handleSelectPatient(patient)}
                                                    className="w-full flex items-center gap-4 p-4 hover:bg-blue-50 transition-colors border-b border-slate-50 last:border-0"
                                                >
                                                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-xs">
                                                        {patient.nombre.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-sm">{patient.nombre}</p>
                                                        <p className="text-xs text-slate-400 font-medium">CI: {patient.cedula}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        // VISTA DE MONITOR Y ANÁLISIS
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Columna Izquierda: Monitor e Historial */}
                            <div className="lg:col-span-4 xl:col-span-5 space-y-6">
                                <PatientMonitor
                                    pacienteId={selectedPatient.id}
                                    pacienteNombre={selectedPatient.nombre}
                                    onExamSelect={setSelectedExam}
                                />
                            </div>

                            {/* Columna Derecha: Detalle y Comparación */}
                            <div className="lg:col-span-8 xl:col-span-7 space-y-6">
                                {selectedExam ? (
                                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm animate-in fade-in slide-in-from-right-4 duration-500">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                                                    <h3 className="text-lg font-black text-slate-800">Resultados del Examen</h3>
                                                </div>
                                                <p className="text-sm font-bold text-slate-400">
                                                    {selectedExam.tipo}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-sm font-bold text-slate-700">
                                                    {new Date(selectedExam.fecha + "T12:00:00").toLocaleDateString("es-ES", {
                                                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                                    })}
                                                </span>
                                                <span className="text-xs font-black text-blue-500 uppercase tracking-widest mt-1">
                                                    ID REF: {selectedExam.id}
                                                </span>
                                            </div>
                                        </div>

                                        <ResultComparison
                                            examType={selectedExam.tipo}
                                            results={selectedExam.resultados}
                                            references={referencias}
                                        />
                                    </div>
                                ) : (
                                    <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-10 text-center">
                                        <Activity className="text-slate-300 mb-6" size={64} />
                                        <h3 className="text-xl font-bold text-slate-800 mb-2">Seleccione un examen</h3>
                                        <p className="text-slate-500 font-medium max-w-sm">
                                            Haga clic en cualquier examen del historial (columna izquierda) para ver el análisis detallado y la comparación con valores de referencia.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
