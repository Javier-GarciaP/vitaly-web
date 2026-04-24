import { useState } from "react";
import { Activity, ShieldCheck, Loader2, KeyRound, User } from "lucide-react";
import { dispararCanones } from "@/utils/Confetti";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError("");

    try {
      // Simular un ligero retraso para UX de seguridad
      await new Promise(resolve => setTimeout(resolve, 800));

      if (username === "vitaly" && password === "vitalycop") {
        localStorage.setItem("vitaly_workspace", "cop");
        dispararCanones();
        setTimeout(() => {
          // Usamos window.location.href en lugar de navigate para forzar
          // la recarga de toda la aplicación y reconectar la base de datos correcta.
          window.location.href = "/";
        }, 1500);
      } else if (username === "vitaly" && password === "vitalyusd") {
        localStorage.setItem("vitaly_workspace", "usd");
        dispararCanones();
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      } else {
        setError("Credenciales incorrectas o acceso denegado.");
      }
    } catch (err) {
      setError("Error al procesar el acceso.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center p-6 selection:bg-slate-900 selection:text-white">
      <div className="w-full max-w-[380px] animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        {/* CABECERA MINIMALISTA */}
        <div className="text-center mb-16">
          <div className="w-14 h-14 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <Activity size={24} strokeWidth={2.5} />
          </div>
          <h1 className="text-[14px] font-black text-slate-900 uppercase tracking-[0.5em] mb-3">Vitaly Pro</h1>
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">Management Clinical Suite</p>
        </div>

        {/* CONTENEDOR DE ACCIÓN */}
        <div className="space-y-8">
          <div className="text-center mb-8">
            <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Autenticación</h2>
            <p className="text-[12px] font-bold text-slate-900 uppercase">Acceso restringido a personal</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-[10px] font-bold text-center uppercase tracking-wider rounded-xl border border-red-100">
                {error}
              </div>
            )}
            
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User size={16} className="text-slate-400 group-focus-within:text-slate-900 transition-colors" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Usuario"
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:border-slate-900 focus:bg-white transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <KeyRound size={16} className="text-slate-400 group-focus-within:text-slate-900 transition-colors" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:border-slate-900 focus:bg-white transition-all placeholder:text-slate-400"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full group relative flex items-center justify-center gap-4 bg-slate-900 border border-slate-900 py-4 px-8 rounded-2xl transition-all duration-300 hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-200 disabled:opacity-50 mt-2"
            >
              {isLoggingIn ? (
                <Loader2 className="animate-spin text-white" size={18} />
              ) : (
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                  Ingresar al Sistema
                </span>
              )}
            </button>
          </form>

          {/* INDICADORES DE SEGURIDAD DISCRETOS */}
          <div className="flex flex-col items-center gap-4 pt-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100/50">
              <ShieldCheck size={12} className="text-slate-400" />
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Protocolo de Seguridad Activo</span>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="mt-20 text-center">
          <p className="text-[8px] font-bold text-slate-200 uppercase tracking-widest">
            © {new Date().getFullYear()} Vitaly Lab — Todos los derechos reservados
          </p>
        </footer>
      </div>
    </div>
  );
}