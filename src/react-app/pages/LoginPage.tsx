import { useState } from "react";
import { useNavigate } from "react-router";
import { Activity, ShieldCheck, Loader2, Lock } from "lucide-react";
import { signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { auth, provider } from "@/react-app/lib/firebase"; 

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
        navigate("/");
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
    <div className="min-h-screen w-full bg-[#f1f5f9] flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Decorativo - Menos intrusivo */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200/30 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-200/30 rounded-full blur-[120px]" />

      <div className="relative w-full max-w-[400px] animate-in fade-in zoom-in-95 duration-700">
        
        {/* Card Principal */}
        <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white p-8 md:p-10 relative z-10">
          
          {/* Logo y Header */}
          <div className="flex flex-col items-center text-center mb-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg mb-6 group transition-transform hover:rotate-12">
              <Activity size={28} className="text-blue-400" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Vitaly<span className="text-blue-600">Lab</span>
            </h1>
            <div className="mt-2 flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full">
              <Lock size={12} className="text-slate-500" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sistema de Acceso Privado</p>
            </div>
          </div>

          {/* Body */}
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-lg font-bold text-slate-800">Iniciar Sesión</h2>
              <p className="text-xs text-slate-400 font-medium">Use su cuenta institucional de Google</p>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 py-3.5 px-6 rounded-xl font-bold text-slate-700 hover:bg-slate-50 hover:border-blue-400 hover:shadow-md transition-all duration-300 group disabled:opacity-50"
            >
              {isLoggingIn ? (
                <Loader2 className="animate-spin text-blue-600" size={20} />
              ) : (
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  className="w-5 h-5 group-hover:scale-110 transition-transform"
                />
              )}
              <span className="text-sm">{isLoggingIn ? "Verificando..." : "Entrar con Google"}</span>
            </button>
          </div>

          {/* Footer del Card */}
          <div className="mt-10 pt-6 border-t border-slate-50">
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                <ShieldCheck size={14} className="text-emerald-500" />
                Seguridad de datos activa
              </div>
            </div>
          </div>
        </div>

        {/* Info adicional fuera del card */}
        <p className="text-center mt-8 text-slate-400 text-[11px] font-medium">
          &copy; {new Date().getFullYear()} Vitaly Lab Management System. <br />
          Desarrollado para entornos de alta precisión.
        </p>
      </div>
    </div>
  );
}