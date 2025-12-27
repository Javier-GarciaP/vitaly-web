import { useState } from "react";
import { useNavigate } from "react-router";
import { Activity, ShieldCheck, Loader2 } from "lucide-react";
// Importamos lo necesario de Firebase
import { signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, getFirestore } from "firebase/firestore";
// Importamos la configuración que ya tienes
import { auth, provider } from "@/react-app/lib/firebase"; 

export default function LoginPage() {
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Obtenemos la instancia de Firestore usando el auth ya configurado
  const db = getFirestore();

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email;

      if (!email) throw new Error("No se pudo obtener el email");

      // Buscamos el documento cuyo ID sea el email
      const docRef = doc(db, "whiteList", email);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        console.log("Acceso autorizado para:", email);
        navigate("/");
      } else {
        // MUY IMPORTANTE: Si no está en la lista, cerramos sesión en Firebase
        await signOut(auth);
        alert(`Acceso denegado: El correo ${email} no está registrado en el sistema de Vitaly Lab.`);
      }
    } catch (error: any) {
      console.error("Error en autenticación:", error);
      alert("Ocurrió un error al intentar iniciar sesión.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] flex items-center justify-center p-4">
      {/* Círculos decorativos */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-100/50 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="relative w-full max-w-[450px] bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/5 border border-slate-100 p-10 md:p-14 overflow-hidden">
        
        <div className="flex flex-col items-center text-center space-y-4 mb-10">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-200">
            <Activity size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Vitaly <span className="text-blue-600">Lab</span>
            </h1>
            <p className="text-slate-500 font-medium mt-2">Gestión Profesional</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-lg font-bold text-slate-800">Bienvenido</h2>
            <p className="text-sm text-slate-400">Solo personal autorizado</p>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={isLoggingIn}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-100 py-4 px-6 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 hover:border-blue-200 transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
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
            {isLoggingIn ? "Verificando..." : "Entrar con Google"}
          </button>

          <div className="flex items-center gap-2 justify-center text-[10px] text-slate-400 uppercase font-black tracking-widest pt-4">
            <ShieldCheck size={14} className="text-emerald-500" />
            Acceso Protegido por Firestore
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />
      </div>
    </div>
  );
}