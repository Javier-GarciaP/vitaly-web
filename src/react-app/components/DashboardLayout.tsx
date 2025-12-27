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
  LogOut, // Icono para cerrar sesión
} from "lucide-react";
import { useState, useEffect } from "react";
import { auth } from "@/react-app/lib/firebase"; // Asegúrate de que la ruta sea correcta
import { signOut, onAuthStateChanged } from "firebase/auth";

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; photo: string } | null>(null);

  // Escuchar el estado de autenticación para mostrar datos reales
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
      if (mobile) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    <div className="min-h-screen bg-[#f8fafc] flex font-sans antialiased text-slate-900 overflow-hidden p-3">
      {/* OVERLAY para móvil */}
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
        {/* Logo Area */}
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

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
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
              </Link>
            );
          })}
        </nav>

        {/* Footer Sidebar con Logout */}
        <div className="p-4 border-t border-white/5 space-y-3">
          {(sidebarOpen || isMobile) ? (
            <>
              <div className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-2xl border border-white/5">
                {user?.photo ? (
                  <img src={user.photo} alt="Avatar" className="w-10 h-10 rounded-xl object-cover" />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-xs font-bold">
                    {user?.name?.substring(0, 2).toUpperCase() || "AD"}
                  </div>
                )}
                <div className="flex flex-col min-w-0">
                  <p className="text-sm font-bold truncate text-slate-100">{user?.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-2xl transition-colors duration-200 group"
              >
                <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span className="font-bold text-sm text-red-400/90 group-hover:text-red-400">Cerrar Sesión</span>
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 bg-blue-600/20 rounded-xl border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs">
                {user?.name?.substring(0, 2).toUpperCase() || "AD"}
              </div>
              <button
                onClick={handleLogout}
                className="p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                title="Cerrar Sesión"
              >
                <LogOut size={20} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
        sidebarOpen && !isMobile ? "ml-72" : !isMobile ? "ml-24" : "ml-0"
      }`}>
        {/* Topbar móvil */}
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
            {user?.photo && <img src={user.photo} alt="User" className="w-9 h-9 rounded-lg" />}
          </header>
        )}

        {/* Contenido Principal */}
        <main className="flex-1 h-screen overflow-y-auto px-4 md:px-8 py-6">
          <div className="max-w-7xl mx-auto animate-in fade-in zoom-in-95 duration-500">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}