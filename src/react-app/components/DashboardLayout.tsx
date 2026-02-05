import { Link, Outlet, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Users,
  FileText,
  TestTube,
  ClipboardList,
  Menu,
  X,
  Crown,
  Settings,
  LogOut,
  Activity,
} from "lucide-react";
import { useState, useEffect } from "react";
import { auth } from "@/react-app/lib/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { NotificationProvider, useNotification } from "@/react-app/context/NotificationContext";
import { SettingsProvider } from "@/react-app/context/SettingsContext";

function DashboardLayoutContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; photo: string } | null>(null);
  const [isFastMode, setIsFastMode] = useState(() => localStorage.getItem("fastMode") === "true");

  // Atajos de teclado: Ctrl + Shift + F (Facturación), Ctrl + Shift + M (Panel Maestro), Ctrl + Shift + X (Toggle Fast Mode)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const isCmdOrCtrl = e.ctrlKey || e.metaKey;

      if (isCmdOrCtrl && e.shiftKey && key === 'f') navigate("/facturas");
      if (isCmdOrCtrl && e.shiftKey && key === 'm') navigate("/panel");
      if (isCmdOrCtrl && e.shiftKey && key === 'x') {
        const next = !isFastMode;
        setIsFastMode(next);
        localStorage.setItem("fastMode", String(next));
        if (next) {
          showNotification("success", "Modo Fast Activo", "Operaciones críticas priorizadas");
        } else {
          showNotification("info", "Modo Normal", "Todos los módulos restablecidos");
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate, isFastMode, showNotification]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          name: currentUser.displayName || "Admin Vitaly",
          email: currentUser.email || "",
          photo: currentUser.photoURL || "",
        });
      } else {
        // Fallback para Tauri sin login
        const isTauri = typeof window !== "undefined" && (window as any).__TAURI_INTERNALS__;
        if (isTauri) {
          setUser({
            name: "Admin Vitaly",
            email: "desktop@vitaly.pro",
            photo: "",
          });
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
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

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [location.pathname, isMobile]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      showNotification("info", "Sesión Finalizada", "Has salido del sistema de forma segura");
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión", error);
      showNotification("error", "Error", "No se pudo cerrar la sesión");
    }
  };

  // Reordenado: Módulos Clínicos Prioritarios Primero
  const allMenuItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/pacientes", label: "Pacientes", icon: Users },
    { path: "/facturas", label: "Facturación", icon: FileText, priority: true },
    { path: "/examenes", label: "Estudios", icon: TestTube },
    { path: "/resultados", label: "Resultados", icon: ClipboardList },
    { path: "/control-paciente", label: "Control Profesional", icon: Activity },
    { path: "/panel", label: "Panel Maestro", icon: Crown, priority: true },
    { path: "/configuracion", label: "Configuración", icon: Settings }
  ];

  // En Modo Fast solo se muestran facturas y panel maestro
  const menuItems = isFastMode
    ? allMenuItems.filter(item => item.priority)
    : allMenuItems;

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`relative min-h-screen bg-white flex font-sans antialiased text-slate-900 overflow-x-hidden ${isFastMode ? "selection:bg-blue-600 selection:text-white" : ""}`}>

      {/* OVERLAY MINIMALISTA */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/10 backdrop-blur-sm z-[120] transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR PREMIUM */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white border-r border-slate-50 transition-all duration-300 z-[130] flex flex-col ${sidebarOpen
          ? "translate-x-0 w-64 shadow-2xl shadow-slate-100"
          : isMobile
            ? "-translate-x-full w-64"
            : "translate-x-0 w-20"
          }`}
      >
        {/* Logo Area Simplified */}
        <div className="h-20 flex items-center justify-between px-6 shrink-0">
          {(sidebarOpen || isMobile) && (
            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 transition-all">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-lg font-black text-xs text-white transition-colors duration-500 ${isFastMode ? "bg-blue-600 shadow-blue-100" : "bg-red-900"}`}>
                V
              </div>
              <div>
                <h1 className="text-[11px] font-black tracking-[0.2em] uppercase text-slate-900 leading-none mb-1">
                  Vitaly Pro
                </h1>
                <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest leading-none">
                  {isFastMode ? "Fast Clinical Ops" : "Management UI"}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-300 hover:text-slate-900 ${!sidebarOpen && !isMobile && "mx-auto"}`}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group relative ${active
                  ? isFastMode ? "bg-blue-600 text-white shadow-xl shadow-blue-100" : "bg-slate-900 text-white shadow-xl shadow-slate-200"
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
                  }`}
              >
                <div className="flex items-center gap-4">
                  <Icon
                    size={active ? 18 : 16}
                    className={`shrink-0 transition-all ${active ? "text-white" : "group-hover:text-slate-900"}`}
                  />
                  {(sidebarOpen || isMobile) && (
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${active ? "text-white" : "text-slate-500"}`}>
                        {item.label}
                      </span>
                      {item.priority && (
                        <div className={`w-1 h-1 rounded-full ${active ? "bg-white" : "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"}`} />
                      )}
                    </div>
                  )}
                </div>
                {item.priority && (sidebarOpen || isMobile) && !active && (
                  <span className="text-[8px] font-black text-slate-200 uppercase tracking-tight">Focus</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Sidebar Clean */}
        <div className="p-4 border-t border-slate-50 shrink-0 space-y-4">
          {isFastMode && (sidebarOpen || isMobile) && (
            <div className="px-4 py-3 bg-blue-50 rounded-xl border border-blue-100 animate-in zoom-in-95">
              <p className="text-[7px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1 text-center">Modo Fast Activo</p>
              <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest text-center">Ctrl + Shift + X para salir</p>
            </div>
          )}

          {(sidebarOpen || isMobile) ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-9 h-9 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-[10px] font-black text-slate-400 shrink-0 shadow-sm">
                  {user?.name?.substring(0, 2).toUpperCase() || "AD"}
                </div>
                <div className="flex flex-col min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-tight text-slate-900 truncate mb-1">{user?.name}</p>
                  <p className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all group"
              >
                <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Cerrar Sesión</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-300 text-[10px] font-black">
                {user?.name?.substring(0, 2).toUpperCase() || "AD"}
              </div>
              <button onClick={handleLogout} className="p-3 text-slate-300 hover:text-rose-500 transition-colors">
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className={`flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300 ${sidebarOpen && !isMobile ? "ml-64" : !isMobile ? "ml-20" : "ml-0"
        }`}>

        {/* Topbar móvil Minimalista */}
        {isMobile && (
          <header className={`bg-white border-b border-slate-50 px-6 h-16 flex items-center justify-between sticky top-0 z-[100] w-full ${isFastMode ? "border-blue-100" : ""}`}>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 text-slate-400 hover:text-slate-900 active:scale-95 transition-all"
              >
                <Menu size={20} />
              </button>
              <h1 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em]">Vitaly</h1>
            </div>
            <div className="flex items-center gap-3">
              {isFastMode && <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />}
              <div className="w-9 h-9 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center">
                <span className="text-[9px] font-bold text-slate-300">{user?.name?.substring(0, 2).toUpperCase()}</span>
              </div>
            </div>
          </header>
        )}

        {/* Contenido Principal */}
        <main className="flex-1 bg-white w-full relative">
          <div className="p-4 md:p-8 overflow-x-hidden">
            <div className="max-w-[1500px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
              <Outlet context={{ isFastMode }} />
            </div>
          </div>
        </main>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

export default function DashboardLayout() {
  return (
    <NotificationProvider>
      <SettingsProvider>
        <DashboardLayoutContent />
      </SettingsProvider>
    </NotificationProvider>
  );
}