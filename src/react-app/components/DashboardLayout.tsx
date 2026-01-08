import { Link, Outlet, useLocation, useNavigate } from "react-router";
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
  LogOut,
} from "lucide-react";
import { useState, useEffect } from "react";
import { auth } from "@/react-app/lib/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false); // Iniciar cerrado por seguridad en móvil
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; photo: string } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          name: currentUser.displayName || "Admin Vitaly",
          email: currentUser.email || "",
          photo: currentUser.photoURL || "",
        });
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // Solo forzar estado si cambia el breakpoint
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Cerrar sidebar al cambiar de ruta en móvil
  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [location.pathname, isMobile]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

  const menuItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/pacientes", label: "Pacientes", icon: Users },
    { path: "/facturas", label: "Facturación", icon: FileText },
    { path: "/examenes", label: "Estudios", icon: TestTube },
    { path: "/resultados", label: "Resultados", icon: ClipboardList },
    { path: "/panel", label: "Panel Maestro", icon: Crown },
    { path: "/configuracion", label: "Configuración", icon: Settings}
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="relative min-h-screen bg-[#f8fafc] flex font-sans antialiased text-slate-900 overflow-x-hidden">
      
      {/* OVERLAY PARA MÓVIL */}
      {isMobile && sidebarOpen &&  (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[120] transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed top-0 left-0 h-full bg-slate-950 text-white transition-all duration-300 z-[130] flex flex-col shadow-2xl ${
          sidebarOpen 
            ? "translate-x-0 w-64" 
            : isMobile 
              ? "-translate-x-full w-64" 
              : "translate-x-0 w-20"
        }`}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-white/5 shrink-0">
          {(sidebarOpen || isMobile) && (
            <div className="flex items-center gap-2.5 animate-in fade-in slide-in-from-left-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg font-black text-sm text-white italic">
                V
              </div>
              <h1 className="text-lg font-black tracking-tight uppercase italic text-white">
                Vitaly - Pro 🎅
              </h1>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-1.5 hover:bg-white/10 rounded-lg transition-all text-slate-400 hover:text-white ${!sidebarOpen && !isMobile && "mx-auto"}`}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                  active
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon 
                    size={18} 
                    className={`shrink-0 transition-colors ${active ? "text-white" : "group-hover:text-blue-400"}`} 
                  />
                  {(sidebarOpen || isMobile) && (
                    <span className="font-bold text-[13px] tracking-tight whitespace-nowrap">
                      {item.label}
                    </span>
                  )}
                </div>
                {active && (sidebarOpen || isMobile) && (
                  <ChevronRight size={12} className="opacity-50" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Sidebar */}
        <div className="p-3 border-t border-white/5 bg-black/20 shrink-0">
          {(sidebarOpen || isMobile) ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 p-2 bg-white/[0.03] rounded-xl border border-white/5">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0">
                  {user?.name?.substring(0, 2).toUpperCase() || "AD"}
                </div>
                <div className="flex flex-col min-w-0">
                  <p className="text-[12px] font-bold truncate text-slate-100 leading-none mb-1">{user?.name}</p>
                  <p className="text-[10px] text-slate-500 truncate leading-none">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-all group"
              >
                <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span className="font-bold text-xs">Cerrar Sesión</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 bg-blue-600/20 rounded-lg border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-[10px]">
                {user?.name?.substring(0, 2).toUpperCase() || "AD"}
              </div>
              <button onClick={handleLogout} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className={`flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300 ${
        sidebarOpen && !isMobile ? "ml-64" : !isMobile ? "ml-20" : "ml-0"
      }`}>
        
        {/* Topbar móvil */}
        {isMobile && (
          <header className="bg-white border-b border-slate-200 px-4 h-14 flex items-center justify-between sticky top-0 z-[100] w-full">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSidebarOpen(true)} 
                className="p-2 bg-slate-100 text-slate-600 rounded-lg active:scale-95 transition-transform"
              >
                <Menu size={20} />
              </button>
              <h1 className="font-black text-blue-600 uppercase italic tracking-tighter text-base">Vitaly</h1>
            </div>
            <div className="w-8 h-8 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
               {user?.photo ? (
                 <img src={user.photo} alt="User" className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-400">
                   {user?.name?.substring(0, 2).toUpperCase()}
                 </div>
               )}
            </div>
          </header>
        )}

        {/* Contenido Principal */}
        <main className="flex-1 bg-[#f8fafc] w-full relative">
          <div className="p-4 md:p-6 lg:p-8 max-w-full overflow-x-hidden">
            <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}