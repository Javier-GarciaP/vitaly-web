import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { 
  CheckCircle2, 
  FileText, 
  User,  
  AlertOctagon, 
  Calendar, 
  ShieldCheck,
  Dna,
  Lock,
  Printer,
  ChevronRight,
  Hash
} from "lucide-react";

export default function PublicVerify() {
  const { uuid } = useParams();
  const [examen, setExamen] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/verify/${uuid}`)
      .then(res => res.json())
      .then(data => { setExamen(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [uuid]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-emerald-600"></div>
          <Dna className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-600 animate-pulse" size={24} />
        </div>
        <p className="mt-6 text-slate-500 font-bold tracking-widest text-xs uppercase animate-pulse">
          Validando Certificado Digital...
        </p>
      </div>
    );
  }

  if (!examen || examen.error) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white shadow-2xl rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border border-red-100 animate-in zoom-in duration-300">
          <div className="bg-red-500 p-6 md:p-10 text-white text-center">
            <div className="bg-white/20 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 backdrop-blur-sm">
              <AlertOctagon size={32} />
            </div>
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight">Fallo de Verificación</h1>
          </div>
          <div className="p-6 md:p-10 text-center">
            <p className="text-slate-600 text-sm md:text-base font-medium leading-relaxed mb-6 md:mb-8">
              El código consultado no corresponde a ningún documento emitido o validado por nuestra institución.
            </p>
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl mb-6 md:mb-8">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest text-left px-1">ID de consulta</p>
              <p className="text-[10px] md:text-xs font-mono text-red-500 break-all bg-white p-3 rounded-lg border border-red-50 shadow-sm">{uuid}</p>
            </div>
            <p className="text-[10px] md:text-xs text-slate-400 font-medium">
              Si posee un documento físico con este código, podría tratarse de una copia no autorizada.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-2 md:p-12 font-sans flex flex-col items-center">
      <div className="max-w-3xl w-full bg-white shadow-xl md:shadow-[0_32px_64px_-15px_rgba(0,0,0,0.1)] rounded-[2rem] md:rounded-[3rem] overflow-hidden border border-white relative">
        
        {/* Marca de Agua de Seguridad */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.03] rotate-12">
           <Dna size={300} className="md:w-[400px]" />
        </div>

        {/* Header de Certificación */}
        <div className="bg-slate-900 p-6 md:p-10 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 bg-emerald-500 text-white w-fit px-3 py-1 rounded-lg">
                <ShieldCheck size={14} />
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">Documento Verificado</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase">LABORATORIO <span className="text-emerald-400">VITALY</span></h1>
            </div>
            
            <div className="flex items-center gap-4 bg-white/5 p-3 md:p-4 rounded-2xl backdrop-blur-md border border-white/10">
              <div className="bg-emerald-500 p-2 md:p-3 rounded-xl shadow-lg shadow-emerald-500/20">
                <CheckCircle2 size={24} className="md:w-[28px]" />
              </div>
              <div>
                <p className="text-[9px] md:text-[10px] font-black text-emerald-400 uppercase tracking-widest">Estatus</p>
                <p className="text-xs md:text-sm font-bold">Autenticidad Confirmada</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 md:p-12 space-y-8 md:space-y-10 relative z-10">
          
          {/* Grid de Información del Paciente */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-100 rounded-xl md:rounded-2xl flex items-center justify-center text-slate-500 shrink-0">
                <User size={20} />
              </div>
              <div>
                <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Paciente Titular</p>
                <p className="text-lg md:text-xl font-black text-slate-800 leading-tight">{examen.paciente_nombre}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Hash size={12} className="text-emerald-600" />
                  <p className="text-xs md:text-sm font-bold text-slate-500">{examen.paciente_cedula}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl md:rounded-[2rem] p-4 md:p-6 border border-slate-100 flex items-center">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm border border-slate-100">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Fecha de Emisión</p>
                  <p className="text-xs md:text-sm font-black text-slate-700">{examen.fecha}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sección de Resultados Adaptativa */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 px-1">
              <div className="w-1.5 h-6 md:w-2 md:h-8 bg-emerald-500 rounded-full"></div>
              <h3 className="text-sm md:text-lg font-black text-slate-800 uppercase tracking-tight">Análisis: {examen.tipo}</h3>
            </div>

            {/* VISTA MÓVIL (Cards) - Oculta en MD+ */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {examen.resultados && Object.entries(examen.resultados).map(([key, value]) => (
                <div key={key} className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">{key.replace(/_/g, ' ')}</p>
                  <p className="text-base font-black text-slate-900">{String(value)}</p>
                </div>
              ))}
            </div>

            {/* VISTA DESKTOP (Tabla) - Oculta en < MD */}
            <div className="hidden md:block bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-xl shadow-slate-200/20">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Parámetro</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {examen.resultados && Object.entries(examen.resultados).map(([key, value]) => (
                    <tr key={key} className="group hover:bg-emerald-50/30 transition-colors">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3 text-slate-600 group-hover:text-emerald-700">
                          <ChevronRight size={14} className="text-emerald-500 opacity-0 group-hover:opacity-100 -ml-4 transition-all" />
                          <span className="font-bold text-sm capitalize">{key.replace(/_/g, ' ')}</span>
                        </div>
                      </td>
                      <td className="px-8 py-4 text-right font-black text-slate-900 text-base tabular-nums">
                        {String(value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sello de Garantía y Firmas */}
          <div className="pt-6 md:pt-10 border-t border-dashed border-slate-200">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <Lock size={12} className="text-emerald-600" />
                  <p className="text-[9px] md:text-[10px] font-black text-slate-800 uppercase tracking-widest">Protocolo de Integridad</p>
                </div>
                <p className="text-[10px] md:text-[11px] text-slate-400 leading-relaxed font-medium max-w-sm">
                  Este certificado digital vincula permanentemente los resultados con el registro maestro del Laboratorio Vitaly.
                </p>
              </div>
              
              <div className="w-full md:w-auto">
                <div className="bg-slate-50 p-3 md:p-4 rounded-xl md:rounded-2xl border border-slate-100 text-center">
                   <p className="text-[8px] font-mono text-slate-400 mb-1 uppercase tracking-tighter">Identificador Único (UUID)</p>
                   <p className="text-[9px] md:text-[10px] font-mono font-bold text-slate-600 break-all">{uuid}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Botones de Acción Posteriores */}
      <div className="flex flex-col sm:flex-row gap-3 mt-8 w-full max-w-3xl px-2">
        <button 
          onClick={() => window.print()}
          className="flex-1 bg-white text-slate-600 hover:text-emerald-600 px-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-sm border border-slate-200 transition-all flex items-center justify-center gap-3"
        >
          <Printer size={18} /> Imprimir
        </button>
        <button 
          className="flex-1 bg-slate-900 text-white px-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-900/10 transition-all flex items-center justify-center gap-3"
        >
          <FileText size={18} /> Descargar PDF
        </button>
      </div>
      
      <p className="mt-8 mb-4 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] text-center">
        © 2025 Laboratorio Vitaly
      </p>
    </div>
  );
}