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
    <div className={`flex items-center gap-2.5 bg-white px-3 py-2 rounded-lg shadow-sm border transition-all ${isOnline ? "border-emerald-200" : "border-red-200"
      }`}>
      <div className={`flex h-7 w-7 items-center justify-center rounded-md ${isOnline ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
        }`}>
        {isOnline ? <Wifi size={14} /> : <WifiOff size={14} className="animate-pulse-subtle" />}
      </div>
      <div className="hidden sm:block">
        <p className="text-xs font-medium text-slate-500 leading-none">Estado</p>
        <p className={`text-sm font-semibold leading-tight ${isOnline ? "text-emerald-700" : "text-red-700"}`}>
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
    <div className="max-w-[1600px] mx-auto space-y-5 md:space-y-6 animate-fade-in pb-6">

      {/* HEADER PROFESIONAL */}
      <div className="flex items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Panel de Control
          </h1>
          <div className="flex items-center gap-2 mt-1.5 text-slate-500">
            <Calendar size={14} />
            <p className="text-xs font-medium">
              {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>
        </div>
        <ConnectionStatus />
      </div>

      {/* CARDS DE ESTADÍSTICAS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className={`bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all group ${card.pulse ? "ring-2 ring-orange-400/30" : ""
                }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-lg ${card.bgColor}`}>
                  <Icon size={20} className={card.iconColor} />
                </div>
                <ArrowUpRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
                  {card.value}
                </p>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  {card.title}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5">
        {/* GRÁFICO DE DISTRIBUCIÓN */}
        <div className="lg:col-span-8 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Distribución de Análisis
              </h2>
              <p className="text-xs text-slate-500 mt-1">Volumen por categoría de estudio</p>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg text-slate-400">
              <PieIcon size={18} />
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

        {/* PANEL DE ACCESOS RÁPIDOS */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-1">Acceso Rápido</h2>
          <p className="text-xs text-slate-500 mb-5">Atajos de operación</p>

          <div className="space-y-2 flex-1">
            {[
              { label: "Nuevo Paciente", sub: "Registro", icon: Users, color: "bg-blue-600", href: "/pacientes" },
              { label: "Emitir Factura", sub: "Cobro", icon: FileText, color: "bg-emerald-600", href: "/facturas" },
              { label: "Cargar Resultados", sub: "Laboratorio", icon: TestTube, color: "bg-violet-600", href: "/examenes" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 hover:border-slate-200 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 ${link.color} rounded-lg text-white shadow-sm`}>
                    <link.icon size={18} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm">{link.label}</h3>
                    <p className="text-xs text-slate-500">{link.sub}</p>
                  </div>
                </div>
                <ArrowUpRight size={16} className="text-slate-300 group-hover:text-slate-600 transition-colors" />
              </a>
            ))}
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Activity size={16} className="text-blue-600" />
                <p className="text-blue-900 font-semibold text-sm">Soporte Vitaly</p>
              </div>
              <p className="text-blue-700 text-xs leading-relaxed">Manuales y tutoriales disponibles en el panel de ayuda.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}