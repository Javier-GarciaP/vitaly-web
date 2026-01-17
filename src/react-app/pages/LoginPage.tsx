import { useState } from "react";
import { useNavigate } from "react-router";
import { Activity, ShieldCheck, Loader2 } from "lucide-react";
import { signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { auth, provider } from "@/react-app/lib/firebase";
import { dispararCanones } from "@/utils/Confetti";

export default function LoginPage() {
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const db = getFirestore();

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email;

      if (!email) throw new Error("No se pudo obtener el email");

      const docRef = doc(db, "whiteList", email);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        dispararCanones();
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        await signOut(auth);
        alert(`Acceso denegado: El correo ${email} no está en la lista blanca de Vitaly Lab.`);
      }
    } catch (error: any) {
      console.error("Error en autenticación:", error);
      alert("Error al intentar iniciar sesión.");
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
        <div className="space-y-12">
          <div className="text-center">
            <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Autenticación</h2>
            <p className="text-[12px] font-bold text-slate-900 uppercase">Acceso restringido a personal</p>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={isLoggingIn}
            className="w-full group relative flex items-center justify-center gap-4 bg-white border border-slate-100 py-5 px-8 rounded-2xl transition-all duration-300 hover:border-slate-900 hover:shadow-2xl hover:shadow-slate-100 disabled:opacity-50"
          >
            {isLoggingIn ? (
              <Loader2 className="animate-spin text-slate-900" size={18} />
            ) : (
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="w-5 h-5 grayscale group-hover:grayscale-0 transition-all duration-500"
              />
            )}
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">
              {isLoggingIn ? "Verificando Credenciales" : "Continuar con Google"}
            </span>
          </button>

          {/* INDICADORES DE SEGURIDAD DISCRETOS */}
          <div className="flex flex-col items-center gap-4 pt-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100/50">
              <ShieldCheck size={12} className="text-slate-400" />
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Protocolo de Seguridad Activo</span>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="mt-24 text-center">
          <p className="text-[8px] font-bold text-slate-200 uppercase tracking-widest">
            © {new Date().getFullYear()} Vitaly Lab — Todos los derechos reservados
          </p>
        </footer>
      </div>

    </div>
  );
}