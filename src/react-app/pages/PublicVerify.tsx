import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { 
  CheckCircle2, 
  FileText, 
  User, 
  ClipboardList, 
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

  // 1. ESTADO DE CARGA (Sleek & Minimal)
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

  // 2. ESTADO DE ERROR (Documento Inválido)
  if (!examen || examen.error) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white shadow-2xl rounded-[2.5rem] overflow-hidden border border-red-100 animate-in zoom-in duration-300">
          <div className="bg-red-500 p-10 text-white text-center">
            <div className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
              <AlertOctagon size={40} />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight">Fallo de Verificación</h1>
          </div>
          <div className="p-10 text-center">
            <p className="text-slate-600 font-medium leading-relaxed mb-8">
              El código consultado no corresponde a ningún documento emitido o validado por nuestra institución.
            </p>
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl mb-8">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest text-left px-1">ID de consulta</p>
              <p className="text-xs font-mono text-red-500 break-all bg-white p-3 rounded-lg border border-red-50 shadow-sm">{uuid}</p>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Si posee un documento físico con este código, podría tratarse de una copia no autorizada.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 3. ESTADO DE ÉXITO (Documento Verificado)
  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-12 font-sans flex flex-col items-center">
      <div className="max-w-3xl w-full bg-white shadow-[0_32px_64px_-15px_rgba(0,0,0,0.1)] rounded-[3rem] overflow-hidden border border-white relative">
        
        {/* Marca de Agua de Seguridad */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.03] rotate-12">
           <Dna size={400} />
        </div>

        {/* Header de Certificación */}
        <div className="bg-slate-900 p-10 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 bg-emerald-500 text-white w-fit px-3 py-1 rounded-lg">
                <ShieldCheck size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Documento Verificado</span>
              </div>
              <h1 className="text-3xl font-black tracking-tighter">LABORATORIO <span className="text-emerald-400">VITALY</span></h1>
            </div>
            
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl backdrop-blur-md border border-white/10">
              <div className="bg-emerald-500 p-3 rounded-xl shadow-lg shadow-emerald-500/20">
                <CheckCircle2 size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Estatus</p>
                <p className="text-sm font-bold">Autenticidad Confirmada</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-12 space-y-10 relative z-10">
          
          {/* Grid de Información del Paciente */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 shadow-inner">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Paciente Titular</p>
                  <p className="text-xl font-black text-slate-800 leading-tight">{examen.paciente_nombre}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Hash size={12} className="text-emerald-600" />
                    <p className="text-sm font-bold text-slate-500">{examen.paciente_cedula}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm border border-slate-100">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Fecha de Emisión</p>
                  <p className="text-sm font-black text-slate-700">{new Date(examen.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sección de Resultados Estilizada */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Detalle del Análisis: {examen.tipo}</h3>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-xl shadow-slate-200/20">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Parámetro Evaluado</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Valor Reportado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {examen.resultados && Object.entries(examen.resultados).map(([key, value]) => (
                    <tr key={key} className="group hover:bg-emerald-50/30 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3 text-slate-600 group-hover:text-emerald-700 transition-colors">
                          <ChevronRight size={14} className="text-emerald-500 opacity-0 group-hover:opacity-100 -ml-4 transition-all" />
                          <span className="font-bold text-sm capitalize">{key.replace(/_/g, ' ')}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right font-black text-slate-900 text-base tabular-nums">
                        {String(value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sello de Garantía y Firmas */}
          <div className="pt-10 border-t border-dashed border-slate-200">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-md">
                <div className="flex items-center gap-2 mb-3">
                  <Lock size={14} className="text-emerald-600" />
                  <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Protocolo de Integridad</p>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                  Este certificado digital vincula permanentemente los resultados mostrados con el registro maestro del Laboratorio Vitaly. La validación electrónica es el único método definitivo para confirmar la veracidad de este informe médico.
                </p>
              </div>
              
              <div className="flex flex-col items-center gap-3">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-inner">
                   <p className="text-[9px] font-mono text-slate-400 mb-2 uppercase tracking-tighter">Identificador Único Global (UUID)</p>
                   <p className="text-[10px] font-mono font-bold text-slate-600 select-all">{uuid}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Botones de Acción Posteriores */}
      <div className="flex flex-col md:flex-row gap-4 mt-10">
        <button 
          onClick={() => window.print()}
          className="bg-white text-slate-600 hover:text-emerald-600 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-sm border border-slate-200 transition-all flex items-center gap-3 hover:shadow-lg active:scale-95"
        >
          <Printer size={18} /> Imprimir Comprobante
        </button>
        <button 
          className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 transition-all flex items-center gap-3 hover:bg-slate-800 active:scale-95"
        >
          <FileText size={18} /> Guardar como PDF
        </button>
      </div>
      
      <p className="mt-12 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
        © 2025 Laboratorio Vitaly - Sistema de Verificación Biomédica
      </p>
    </div>
  );
}