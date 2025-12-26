import { Link, Outlet, useLocation } from "react-router";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  TestTube, 
  ClipboardList,
  Menu,
  X,
  ChevronRight,
  Crown,
  Settings,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function DashboardLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/pacientes", label: "Pacientes", icon: Users },
    { path: "/facturas", label: "Facturacion", icon: FileText },
    { path: "/examenes", label: "Estudios", icon: TestTube },
    { path: "/resultados", label: "Resultados", icon: ClipboardList },
    { path: "/panel", label: "Panel Maestro", icon: Crown },
    { path: "/configuracion", label: "Configuracion", icon: Settings}
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans antialiased text-slate-900">
      {/* OVERLAY para móvil con desenfoque más profundo */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[60] transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed top-0 left-0 h-full bg-slate-950 text-white transition-all duration-300 z-[70] flex flex-col shadow-[20px_0_50px_rgba(0,0,0,0.1)] ${
          sidebarOpen ? "w-72" : isMobile ? "-left-72" : "w-24"
        }`}
      >
        {/* Logo Area con Gradiente */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/5">
          {(sidebarOpen || isMobile) && (
            <div className="flex items-center gap-3 animate-in slide-in-from-left-4">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 font-black text-white">
                V
              </div>
              <h1 className="text-xl font-black tracking-tight uppercase italic bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                Vitaly
              </h1>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 hover:bg-white/10 rounded-xl transition-all duration-200 text-slate-400 hover:text-white ${!sidebarOpen && !isMobile && "mx-auto"}`}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation - Espaciado mejorado */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => isMobile && setSidebarOpen(false)}
                className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-200 group relative ${
                  active
                    ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20"
                    : "text-slate-400 hover:bg-white/[0.03] hover:text-slate-100 hover:translate-x-1"
                }`}
              >
                <div className="flex items-center gap-4">
                  <Icon 
                    size={22} 
                    className={`transition-colors duration-200 ${active ? "text-white" : "group-hover:text-blue-400"}`} 
                  />
                  {(sidebarOpen || isMobile) && (
                    <span className="font-semibold text-[14px] tracking-wide animate-in fade-in duration-300">
                      {item.label}
                    </span>
                  )}
                </div>
                {active && (sidebarOpen || isMobile) && (
                  <ChevronRight size={14} className="opacity-70" />
                )}
                
                {/* Indicador visual minimalista cuando está cerrado */}
                {!sidebarOpen && !isMobile && active && (
                  <div className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Sidebar - Más elegante */}
        {(sidebarOpen || isMobile) ? (
          <div className="p-4 border-t border-white/5 bg-white/[0.01]">
            <div className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-2xl border border-white/5 transition-hover hover:bg-white/[0.05]">
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-xl shadow-inner flex items-center justify-center text-xs font-bold">
                AD
              </div>
              <div className="flex flex-col min-w-0">
                <p className="text-sm font-bold truncate text-slate-100">Admin BioLab</p>
                <p className="text-[11px] text-slate-500 truncate font-medium">Panel de Gestión</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 border-t border-white/5 flex justify-center">
            <div className="w-10 h-10 bg-blue-600/20 rounded-xl border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs">
              AD
            </div>
          </div>
        )}
      </aside>

      {/* MAIN CONTENT */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
        sidebarOpen && !isMobile ? "ml-72" : !isMobile ? "ml-24" : "ml-0"
      }`}>
        {/* Topbar móvil optimizada */}
        {isMobile && (
          <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(true)} 
                className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
              >
                <Menu size={20} />
              </button>
              <h1 className="font-black text-blue-600 uppercase italic tracking-tighter text-lg">Vitaly</h1>
            </div>
            <div className="w-9 h-9 bg-slate-100 rounded-full border border-slate-200 flex items-center justify-center">
              <Users size={16} className="text-slate-500" />
            </div>
          </header>
        )}

        <main className="p-4 sm:p-6 lg:p-10 min-h-screen">
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumb o Contexto Sutil (Opcional) */}
            {!isMobile && (
               <div className="mb-8 animate-in fade-in slide-in-from-top-2 duration-700">
                  <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    {menuItems.find(i => isActive(i.path))?.label || "Bienvenido"}
                  </h2>
                  <p className="text-slate-500 text-sm mt-1 font-medium">
                    Gestión integral de laboratorio clínico.
                  </p>
               </div>
            )}
            
            <div className="animate-in fade-in zoom-in-95 duration-500">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}