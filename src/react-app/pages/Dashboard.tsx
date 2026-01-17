import { useEffect, useState } from "react";
import { useOutletContext } from "react-router";
import {
  Users,
  TestTube,
  Clock,
  FileText,
  ArrowUpRight,
  Wifi,
  WifiOff,
  Zap,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { getDayName, formatDisplayDate, getTodayDate } from "@/utils/date";

interface Estadisticas {
  totalPacientes: number;
  totalExamenes: number;
  examenesPendientes: number;
  facturasHoy: number;
  distribucion: { name: string; value: number }[];
}

const ConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(
    typeof window !== "undefined" ? window.navigator.onLine : true
  );

  useEffect(() => {
    const handleStatusChange = () => setIsOnline(window.navigator.onLine);
    window.addEventListener("online", handleStatusChange);
    window.addEventListener("offline", handleStatusChange);
    return () => {
      window.removeEventListener("online", handleStatusChange);
      window.removeEventListener("offline", handleStatusChange);
    };
  }, []);

  return (
    <div className={`flex items-center gap-2 bg-white px-2 py-1.5 transition-all text-slate-400`}>
      {isOnline ? <Wifi size={12} className="text-emerald-500" /> : <WifiOff size={12} className="text-rose-500" />}
      <span className="text-[10px] font-bold uppercase tracking-widest">
        {isOnline ? "En Línea" : "Sin Conexión"}
      </span>
    </div>
  );
};

export default function DashboardPage() {
  const { isFastMode } = useOutletContext<{ isFastMode: boolean }>();
  const [stats, setStats] = useState<Estadisticas | null>(null);

  useEffect(() => {
    fetch("/api/estadisticas")
      .then((res) => res.json() as Promise<Estadisticas>)
      .then((data) => setStats(data))
      .catch((err) => console.error("Error cargando estadísticas:", err));
  }, []);

  const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"];

  const cards = [
    { title: "Pacientes", value: stats?.totalPacientes || 0, icon: Users },
    { title: "Exámenes", value: stats?.totalExamenes || 0, icon: TestTube },
    { title: "Pendientes", value: stats?.examenesPendientes || 0, icon: Clock },
    { title: "Facturas Hoy", value: stats?.facturasHoy || 0, icon: FileText },
  ];

  return (
    <div className="max-w-[1600px] mx-auto space-y-5 md:space-y-6 animate-fade-in pb-6">

      {/* FAST MODE BANNER */}
      {isFastMode && (
        <div className="bg-blue-600 text-white px-8 py-5 rounded-[2rem] shadow-2xl shadow-blue-100 flex items-center justify-between group overflow-hidden relative">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-1">
              <Zap size={16} className="fill-white" />
              <h2 className="text-[11px] font-black uppercase tracking-[0.3em]">Modo Fast Clínico Activo</h2>
            </div>
            <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest opacity-80">
              Operaciones optimizadas para Facturación y Procesamiento Maestro
            </p>
          </div>
          <div className="relative z-10 bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
            <p className="text-[9px] font-black uppercase tracking-widest text-white">Presione <span className="bg-white text-blue-600 px-1.5 py-0.5 rounded ml-1">Shift + X</span> para modo normal</p>
          </div>
          {/* Decorative effect */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000" />
        </div>
      )}

      {/* TOP HEADER */}
      <div className="flex items-end justify-between border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-sm font-bold text-slate-900 uppercase tracking-[0.2em]">Dashboard</h1>
            {isFastMode && (
              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[8px] font-black uppercase tracking-widest rounded-full border border-blue-100">Fast Mode</span>
            )}
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1">
            {getDayName()}, {formatDisplayDate(getTodayDate())}
          </p>
        </div>
        <ConnectionStatus />
      </div>

      {/* CARDS - Minimalistas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white p-6 border border-slate-100 rounded-2xl hover:border-slate-300 transition-all group">
              <div className="flex items-center gap-3 mb-4">
                <Icon size={16} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {card.title}
                </p>
              </div>
              <p className="text-2xl font-black text-slate-900 tracking-tight">
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* GRÁFICO - Limpio */}
        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-3xl p-8 transition-all hover:border-slate-200">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">
                Distribución de Análisis
              </h2>
              <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">Estadísticas por categoría</p>
            </div>
          </div>

          <div className="h-[280px] md:h-[320px] w-full">
            {stats?.distribucion ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.distribucion}
                    cx="50%" cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {stats.distribucion.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "1px solid #E2E8F0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", fontSize: "12px" }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    content={({ payload }) => (
                      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
                        {payload?.map((entry: any, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: entry.color }} />
                            <span className="text-xs font-medium text-slate-600">{entry.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-sm text-slate-400">Cargando datos...</p>
              </div>
            )}
          </div>
        </div>

        {/* ACCESOS RÁPIDOS - Minimalista */}
        <div className="lg:col-span-4 bg-white border border-slate-100 rounded-3xl p-8 hover:border-slate-200 transition-all">
          <h2 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-6">Operaciones Rápidas</h2>

          <div className="space-y-1">
            {[
              { label: "Pacientes", href: "/pacientes" },
              { label: "Facturas", href: "/facturas" },
              { label: "Resultados", href: "/examenes" },
              { label: "Configuración", href: "/configuracion" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0 hover:px-2 transition-all group"
              >
                <span className="text-xs font-bold text-slate-500 group-hover:text-slate-900 uppercase tracking-tight">{link.label}</span>
                <ArrowUpRight size={14} className="text-slate-200 group-hover:text-slate-900 transition-colors" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}