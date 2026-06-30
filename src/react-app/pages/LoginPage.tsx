import { useState } from "react";
import { useNavigate } from "react-router";
import { Activity, ShieldCheck, Lock } from "lucide-react";
import { dispararCanones } from "@/utils/Confetti";

export default function LoginPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Configura aquí tus URLs de los workers de Cloudflare
    // Si tienes dominio personalizado, ponlo aquí (ej. https://vitaly-db-cop.workers.dev)
    const WORKER_COP_URL = import.meta.env.VITE_WORKER_URL_COP || "https://vitaly-db-cop.tu-usuario.workers.dev";
    const WORKER_USD_URL = import.meta.env.VITE_WORKER_URL_USD || "https://vitaly-db-usd.tu-usuario.workers.dev";

    if (password === "vitalycop") {
      localStorage.setItem("WORKER_URL", WORKER_COP_URL);
      localStorage.setItem("DB_MODE", "COP");
      dispararCanones();
      setTimeout(() => navigate("/"), 1000);
    } else if (password === "vitalyusd") {
      localStorage.setItem("WORKER_URL", WORKER_USD_URL);
      localStorage.setItem("DB_MODE", "USD");
      dispararCanones();
      setTimeout(() => navigate("/"), 1000);
    } else {
      setError("Contraseña incorrecta. Acceso denegado.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center p-6 selection:bg-slate-900 selection:text-white">
      <div className="w-full max-w-[380px] animate-in fade-in slide-in-from-bottom-4 duration-1000">
        {/* CABECERA MINIMALISTA */}
        <div className="text-center mb-12">
          <div className="w-14 h-14 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <Activity size={24} strokeWidth={2.5} />
          </div>
          <h1 className="text-[14px] font-black text-slate-900 uppercase tracking-[0.5em] mb-3">Vitaly Pro</h1>
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">Gestión Clínica Local</p>
        </div>

        {/* CONTENEDOR DE ACCIÓN */}
        <form onSubmit={handleLogin} className="space-y-8">
          <div className="text-center">
            <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Autenticación</h2>
            <p className="text-[12px] font-bold text-slate-900 uppercase">Selección de Entorno</p>
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="password"
              placeholder="Ingrese su credencial..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 py-4 pl-12 pr-4 rounded-2xl text-[12px] font-medium text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all placeholder:text-slate-400"
            />
          </div>

          {error && (
            <p className="text-[10px] font-bold text-rose-500 uppercase text-center tracking-wider">{error}</p>
          )}

          <button
            type="submit"
            className="w-full relative flex items-center justify-center gap-4 bg-slate-900 text-white py-5 px-8 rounded-2xl transition-all duration-300 hover:bg-slate-800 hover:shadow-2xl hover:shadow-slate-900/20 active:scale-95"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
              Acceder al Sistema
            </span>
          </button>

          {/* INDICADORES DE SEGURIDAD DISCRETOS */}
          <div className="flex flex-col items-center gap-4 pt-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100/50">
              <ShieldCheck size={12} className="text-slate-400" />
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Almacenamiento Local Activo</span>
            </div>
          </div>
        </form>

        {/* FOOTER */}
        <footer className="mt-24 text-center">
          <p className="text-[8px] font-bold text-slate-200 uppercase tracking-widest">
            © {new Date().getFullYear()} Vitaly Lab — Uso Interno
          </p>
        </footer>
      </div>
    </div>
  );
}