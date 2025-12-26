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

export default function DashboardPage() {
  const [stats, setStats] = useState<Estadisticas | null>(null);

  useEffect(() => {
    fetch("/api/estadisticas")
      .then((res) => res.json() as Promise<Estadisticas>) // Forzamos el tipo aquí
      .then((data) => setStats(data)) // Ahora 'data' es de tipo Estadisticas
      .catch((err) => console.error("Error cargando estadísticas:", err));
  }, []);

  const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"];

  const cards = [
    {
      title: "Total Pacientes",
      value: stats?.totalPacientes || 0,
      icon: Users,
      color: "from-blue-600 to-indigo-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Total Exámenes",
      value: stats?.totalExamenes || 0,
      icon: TestTube,
      color: "from-emerald-600 to-teal-600",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      title: "Exámenes Pendientes",
      value: stats?.examenesPendientes || 0,
      icon: Clock,
      color: "from-orange-600 to-amber-600",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      pulse: (stats?.examenesPendientes || 0) > 0,
    },
    {
      title: "Facturas Hoy",
      value: stats?.facturasHoy || 0,
      icon: FileText,
      color: "from-violet-600 to-purple-600",
      bgColor: "bg-violet-50",
      iconColor: "text-violet-600",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* HEADER DINÁMICO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Panel de Control
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Calendar size={14} className="text-slate-400" />
            <p className="text-slate-500 text-sm font-medium">
              {new Date().toLocaleDateString("es-ES", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white p-1.5 pr-4 rounded-2xl shadow-sm border border-slate-100 w-fit">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-200">
            <Activity size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none">
              Status
            </p>
            <p className="text-sm font-bold text-slate-700 leading-tight">
              Servidor Activo
            </p>
          </div>
        </div>
      </div>

      {/* CARDS PRINCIPALES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className={`relative bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden ${
                card.pulse ? "ring-2 ring-orange-500/20" : ""
              }`}
            >
              <div className="flex justify-between items-start relative z-10">
                <div
                  className={`p-3 rounded-2xl ${card.bgColor} ${card.iconColor} group-hover:scale-110 transition-transform`}
                >
                  <Icon size={24} />
                </div>
                <ArrowUpRight
                  size={20}
                  className="text-slate-200 group-hover:text-slate-400 transition-colors"
                />
              </div>

              <div className="mt-6 relative z-10">
                <p className="text-4xl font-black text-slate-900 tracking-tighter">
                  {card.value}
                </p>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">
                  {card.title}
                </p>
              </div>

              {/* Decoración de fondo */}
              <div
                className={`absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br ${card.color} opacity-[0.03] rounded-full group-hover:scale-150 transition-transform duration-700`}
              />
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* GRÁFICO - Diseño Limpio */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">
                Estadísticas de Análisis
              </h2>
              <p className="text-sm text-slate-400">
                Distribución por categoría de estudio
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl text-slate-400">
              <PieIcon size={20} />
            </div>
          </div>

          <div className="h-[350px] w-full">
            {stats?.distribucion ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.distribucion}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {stats.distribucion.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        strokeWidth={0}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "20px",
                      border: "none",
                      boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
                      padding: "12px",
                    }}
                    itemStyle={{ fontWeight: "bold" }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    content={({ payload }) => (
                      <div className="flex flex-wrap justify-center gap-4 mt-8">
                        {payload?.map((entry: any, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">
                              {entry.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-slate-400 font-medium text-sm">
                  Analizando datos...
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ACCESOS DIRECTOS - Estilo Sidebar lateral */}
        <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-xl shadow-blue-900/10 flex flex-col">
          <h2 className="text-xl font-black text-white tracking-tight mb-2">
            Acceso Rápido
          </h2>
          <p className="text-slate-500 text-sm mb-8">Operaciones frecuentes</p>

          <div className="space-y-3">
            {[
              {
                label: "Nuevo Paciente",
                sub: "Registro inicial",
                icon: Users,
                color: "bg-blue-500",
                href: "/pacientes",
              },
              {
                label: "Emitir Factura",
                sub: "Cobro de servicios",
                icon: FileText,
                color: "bg-emerald-500",
                href: "/facturas",
              },
              {
                label: "Cargar Resultados",
                sub: "Laboratorio clínico",
                icon: TestTube,
                color: "bg-violet-500",
                href: "/examenes",
              },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-white/10 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2.5 ${link.color} rounded-xl text-white shadow-lg`}
                  >
                    <link.icon size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">
                      {link.label}
                    </h3>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">
                      {link.sub}
                    </p>
                  </div>
                </div>
                <ArrowUpRight
                  size={16}
                  className="text-slate-600 group-hover:text-white transition-colors"
                />
              </a>
            ))}
          </div>

          <div className="mt-auto pt-8">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-3xl relative overflow-hidden">
              <p className="text-white font-bold text-sm relative z-10">
                ¿Necesitas ayuda?
              </p>
              <p className="text-blue-100 text-xs mt-1 relative z-10">
                Consulta el manual de usuario o contacta a soporte.
              </p>
              <Activity
                size={80}
                className="absolute -right-4 -bottom-4 text-white/10 rotate-12"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
