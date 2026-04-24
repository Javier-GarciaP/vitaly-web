import { useState, useEffect } from "react";
import {
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { TrendingUp, Activity, Calendar, AlertCircle } from "lucide-react";
import PacientesService, { EvolucionData } from "../../../services/PacientesService";
import { FORM_FIELDS } from "../../../utils/formFields";

interface EvolutionViewProps {
    pacienteId: number;
    pacienteNombre: string;
    initialCategory?: string;
}

export default function EvolutionView({ pacienteId, pacienteNombre, initialCategory }: EvolutionViewProps) {
    const [category, setCategory] = useState(initialCategory || "Hematología");
    const [selectedParam, setSelectedParam] = useState<string>("");
    const [historicalData, setHistoricalData] = useState<EvolucionData[]>([]);
    const [loading, setLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        loadHistory();
    }, [pacienteId, category]);

    const loadHistory = async () => {
        setLoading(true);
        try {
            const data = await PacientesService.getEvolution(pacienteId, category);
            setHistoricalData(data);

            // Auto-select first available numeric param if none selected or not in new data
            if (data.length > 0) {
                const params = Object.keys(data[0].valores).filter(k => k !== "_highlightFields" && k !== "observacion");
                if (params.length > 0 && (!selectedParam || !params.includes(selectedParam))) {
                    setSelectedParam(params[0]);
                }
            } else {
                setSelectedParam("");
            }
        } catch (error) {
            console.error("Error loading evolution data:", error);
        } finally {
            setLoading(false);
        }
    };

    const categories = ["Hematología", "Química Clínica", "Coagulación", "PSA"];

    // Get parameter label
    const getParamLabel = (id: string) => {
        const fields = FORM_FIELDS[category];
        return fields?.find(f => f.id === id)?.label || id.toUpperCase();
    };

    const chartData = historicalData
        .filter(item => item.valores[selectedParam] !== undefined && !isNaN(parseFloat(String(item.valores[selectedParam]).replace(/,/g, ''))))
        .map(item => ({
            fecha: new Date(item.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: '2-digit' }),
            fullDate: new Date(item.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }),
            valor: parseFloat(String(item.valores[selectedParam]).replace(/,/g, '')),
        }));

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-100 shadow-2xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-600" />
                        <p className="text-sm font-black text-slate-900">
                            {payload[0].value} <span className="text-[10px] text-slate-400 font-bold ml-1">UNIDADES</span>
                        </p>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* SELECTORES FLOTANTES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Categoría Técnica</label>
                    <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 overflow-x-auto no-scrollbar">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat)}
                                className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${category === cat
                                    ? "bg-white text-blue-600 shadow-sm border border-slate-100"
                                    : "text-slate-400 hover:text-slate-600"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Parámetro a Graficar</label>
                    <select
                        value={selectedParam}
                        onChange={(e) => setSelectedParam(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-3.5 text-[10px] font-black uppercase tracking-widest outline-none focus:bg-white focus:border-blue-200 transition-all appearance-none cursor-pointer"
                        disabled={historicalData.length === 0}
                    >
                        {historicalData.length > 0 ? (
                            Object.keys(historicalData[0].valores)
                                .filter(k => k !== "_highlightFields" && k !== "observacion")
                                .map(key => (
                                    <option key={key} value={key}>{getParamLabel(key)}</option>
                                ))
                        ) : (
                            <option value="">Sin datos disponibles</option>
                        )}
                    </select>
                </div>
            </div>

            {/* ÁREA DE GRÁFICA PREMIUM */}
            <div className="bg-slate-50/50 border border-slate-100 rounded-[2.5rem] p-8 min-h-[450px] relative overflow-hidden group">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10 transition-all">
                        <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                    </div>
                ) : historicalData.length < 2 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12">
                        <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-slate-200 mb-4 shadow-sm border border-slate-50">
                            <Activity size={32} />
                        </div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2">Datos Insuficientes</h4>
                        <p className="text-[11px] text-slate-300 font-bold uppercase tracking-widest max-w-[240px]">
                            Se requieren al menos 2 estudios completados para generar una curva evolutiva
                        </p>
                    </div>
                ) : (
                    <div className="h-[400px] w-full">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                                    <TrendingUp size={18} />
                                </div>
                                <div>
                                    <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-widest mb-0.5">{getParamLabel(selectedParam)}</h3>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Historial Bio-Evolutivo de {pacienteNombre} • {historicalData.length} Registros</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <div className="px-3 py-1 bg-white border border-slate-100 rounded-lg text-[8px] font-black text-slate-400 uppercase tracking-widest">MIN: {Math.min(...chartData.map(d => d.valor))}</div>
                                <div className="px-3 py-1 bg-white border border-slate-100 rounded-lg text-[8px] font-black text-slate-400 uppercase tracking-widest">MAX: {Math.max(...chartData.map(d => d.valor))}</div>
                            </div>
                        </div>

                        {isMounted && (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                                    <defs>
                                        <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="6 6" stroke="#e2e8f0" vertical={false} />
                                    <XAxis
                                        dataKey="fecha"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '900' }}
                                        dy={15}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '900' }}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#2563eb', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                    <Area
                                        type="monotone"
                                        dataKey="valor"
                                        stroke="#2563eb"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorValor)"
                                        animationDuration={1500}
                                        dot={{ r: 4, fill: '#fff', strokeWidth: 3, stroke: '#2563eb' }}
                                        activeDot={{ r: 6, strokeWidth: 0, fill: '#1e3a8a' }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                )}
            </div>

            {/* FOOTER INFO */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-100 rounded-3xl p-6 flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-50 text-blue-600 rounded-xl flex items-center justify-center">
                        <Activity size={20} />
                    </div>
                    <div>
                        <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Tendencia</p>
                        <p className="text-[10px] font-black text-slate-700 uppercase">Análisis Progresivo</p>
                    </div>
                </div>
                <div className="bg-white border border-slate-100 rounded-3xl p-6 flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-50 text-emerald-600 rounded-xl flex items-center justify-center">
                        <Calendar size={20} />
                    </div>
                    <div>
                        <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Intervalo</p>
                        <p className="text-[10px] font-black text-slate-700 uppercase">Historial Completo</p>
                    </div>
                </div>
                <div className="bg-white border border-slate-100 rounded-3xl p-6 flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-50 text-amber-600 rounded-xl flex items-center justify-center">
                        <AlertCircle size={20} />
                    </div>
                    <div>
                        <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Referencia</p>
                        <p className="text-[10px] font-black text-slate-700 uppercase">Valores Base</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
