import { useEffect, useState } from "react";
import {
  Users,
  TestTube,
  Clock,
  FileText,
  Activity,
  PieChart as PieIcon,
  ArrowUpRight,
  Calendar,
  Wifi,
  WifiOff,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

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
    <div className={`flex items-center gap-2.5 bg-white p-1.5 pr-3 rounded-xl shadow-sm border transition-all ${
      isOnline ? "border-emerald-100" : "border-red-100"
    }`}>
      <div className={`flex h-8 w-8 items-center justify-center rounded-lg shadow-sm ${
        isOnline ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
      }`}>
        {isOnline ? <Wifi size={16} /> : <WifiOff size={16} className="animate-pulse" />}
      </div>
      <div className="hidden sm:block">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none mb-0.5">Estado</p>
        <p className={`text-xs font-bold leading-tight ${isOnline ? "text-emerald-700" : "text-red-700"}`}>
          {isOnline ? "Online" : "Offline"}
        </p>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Estadisticas | null>(null);

  useEffect(() => {
    fetch("/api/estadisticas")
      .then((res) => res.json() as Promise<Estadisticas>)
      .then((data) => setStats(data))
      .catch((err) => console.error("Error cargando estadísticas:", err));
  }, []);

  const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"];

  const cards = [
    { title: "Pacientes", value: stats?.totalPacientes || 0, icon: Users, bgColor: "bg-blue-50", iconColor: "text-blue-600" },
    { title: "Exámenes", value: stats?.totalExamenes || 0, icon: TestTube, bgColor: "bg-emerald-50", iconColor: "text-emerald-600" },
    { title: "Pendientes", value: stats?.examenesPendientes || 0, icon: Clock, bgColor: "bg-orange-50", iconColor: "text-orange-600", pulse: (stats?.examenesPendientes || 0) > 0 },
    { title: "Facturas Hoy", value: stats?.facturasHoy || 0, icon: FileText, bgColor: "bg-violet-50", iconColor: "text-violet-600" },
  ];

  return (
    <div className="max-w-[1600px] mx-auto space-y-4 md:space-y-6 animate-in fade-in duration-500 pb-6">
      
      {/* HEADER COMPACTO */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-none">
            Panel de Control - Dia de la maquina de escribir
          </h1>
          <div className="flex items-center gap-1.5 mt-1.5 text-slate-500">
            <Calendar size={12} />
            <p className="text-[11px] md:text-xs font-bold uppercase tracking-wide">
              {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>
        </div>
        <ConnectionStatus />
      </div>

      {/* CARDS: Altura fija y diseño denso */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className={`bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:border-blue-200 transition-all group relative overflow-hidden ${
                card.pulse ? "ring-2 ring-orange-500/20" : ""
              }`}
            >
              <div className="flex justify-between items-center mb-3">
                <div className={`p-2 rounded-xl ${card.bgColor} ${card.iconColor}`}>
                  <Icon size={18} />
                </div>
                <ArrowUpRight size={14} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter leading-none">
                  {card.value}
                </p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 truncate">
                  {card.title}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        {/* GRÁFICO: Ajuste de altura para Laptop */}
        <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-200 p-5 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm md:text-base font-black text-slate-800 tracking-tight uppercase">
                Distribución de Análisis
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">Volumen por categoría de estudio</p>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
              <PieIcon size={16} />
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
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.distribucion.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", fontSize: "12px" }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    content={({ payload }) => (
                      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-4">
                        {payload?.map((entry: any, index) => (
                          <div key={index} className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-[10px] font-bold text-slate-500 uppercase">{entry.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-2">
                <div className="w-8 h-8 border-3 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* ACCESOS DIRECTOS: Más densos y oscuros para contraste */}
        <div className="lg:col-span-4 bg-slate-950 rounded-2xl p-5 md:p-6 shadow-xl flex flex-col">
          <h2 className="text-sm font-black text-white tracking-widest uppercase mb-1">Acceso Rápido</h2>
          <p className="text-[11px] text-slate-500 mb-5">Atajos de operación</p>

          <div className="space-y-2 flex-1">
            {[
              { label: "Nuevo Paciente", sub: "Registro", icon: Users, color: "bg-blue-600", href: "/pacientes" },
              { label: "Emitir Factura", sub: "Cobro", icon: FileText, color: "bg-emerald-600", href: "/facturas" },
              { label: "Cargar Resultados", sub: "Laboratorio", icon: TestTube, color: "bg-violet-600", href: "/examenes" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 ${link.color} rounded-lg text-white shadow-lg`}>
                    <link.icon size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-[13px] leading-none">{link.label}</h3>
                    <p className="text-[9px] text-slate-500 uppercase font-black tracking-tighter mt-1">{link.sub}</p>
                  </div>
                </div>
                <ArrowUpRight size={14} className="text-slate-600 group-hover:text-white transition-colors" />
              </a>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-white/5">
            <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/20 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Activity size={14} className="text-blue-400" />
                <p className="text-white font-bold text-xs uppercase tracking-tight">Soporte Vitaly</p>
              </div>
              <p className="text-slate-400 text-[10px] leading-relaxed">Manuales y tutoriales disponibles en el panel de ayuda.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}