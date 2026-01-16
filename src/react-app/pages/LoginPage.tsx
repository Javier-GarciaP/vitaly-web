import { useState } from "react";
import { useNavigate } from "react-router";
import { Activity, ShieldCheck, Loader2, Lock } from "lucide-react";
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
        //Esperar un momento para que el usuario vea la animación
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
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center p-4 relative overflow-hidden">

      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, rgb(0, 102, 204) 1px, transparent 0)',
        backgroundSize: '40px 40px'
      }} />

      <div className="relative w-full max-w-[420px] animate-fade-in">

        {/* Card Principal */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 md:p-10 relative">

          {/* Logo y Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md mb-5">
              <Activity size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Vitaly<span className="text-blue-600">Lab</span>
            </h1>
            <div className="mt-3 flex items-center gap-2 px-4 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
              <Lock size={14} className="text-slate-400" />
              <p className="text-xs font-semibold text-slate-500">Sistema de Acceso Seguro</p>
            </div>
          </div>

          {/* Body */}
          <div className="space-y-5">
            <div className="space-y-2 text-center">
              <h2 className="text-lg font-semibold text-slate-800">Iniciar Sesión</h2>
              <p className="text-sm text-slate-500">Use su cuenta institucional de Google</p>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 py-3.5 px-6 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 hover:border-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? (
                <Loader2 className="animate-spin text-blue-600" size={20} />
              ) : (
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  className="w-5 h-5"
                />
              )}
              <span className="text-sm">{isLoggingIn ? "Verificando..." : "Continuar con Google"}</span>
            </button>
          </div>

          {/* Footer del Card */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck size={16} className="text-emerald-500" />
              <span className="font-medium">Conexión segura SSL/TLS</span>
            </div>
          </div>
        </div>

        {/* Info adicional fuera del card */}
        <p className="text-center mt-6 text-slate-400 text-xs">
          &copy; {new Date().getFullYear()} Vitaly Lab Management System
        </p>
      </div>
    </div>
  );
}