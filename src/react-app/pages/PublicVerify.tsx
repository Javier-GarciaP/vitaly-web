import { useEffect, useState } from "react";
import { useParams } from "react-router";
import {
  AlertOctagon,
  Calendar,
  ShieldCheck,
  Dna,
  Lock,
  Printer,
  Hash,
  ArrowDownToLine,
  ChevronRight
} from "lucide-react";
import { formatDisplayDate } from "@/utils/date";

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
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-100 border-t-slate-900"></div>
          <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-200 animate-pulse" size={16} />
        </div>
        <p className="mt-8 text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] animate-pulse">
          Validando Certificado
        </p>
      </div>
    );
  }

  if (!examen || examen.error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <div className="max-w-md w-full animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-rose-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-sm border border-rose-100">
            <AlertOctagon size={32} className="text-rose-500" />
          </div>
          <div className="text-center space-y-4">
            <h1 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-900">Validación Fallida</h1>
            <p className="text-[11px] text-slate-400 font-bold leading-relaxed uppercase tracking-wider">
              El documento consultado no figura en nuestros registros maestros.
            </p>
          </div>
          <div className="mt-12 p-6 bg-slate-50 rounded-2xl border border-slate-100/50">
            <p className="text-[8px] font-black text-slate-300 uppercase mb-3 tracking-widest text-center">ID de Rastreo</p>
            <p className="text-[9px] font-mono text-slate-500 break-all text-center">{uuid}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6 md:p-20 font-sans flex flex-col items-center selection:bg-slate-900 selection:text-white">
      <div className="max-w-4xl w-full relative animate-in fade-in duration-1000">

        {/* LOGO SIMPLIFICADO */}
        <div className="flex flex-col items-center mb-16">
          <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-2xl mb-6">
            <Dna size={24} />
          </div>
          <h1 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.5em] leading-none mb-2">Laboratorio Vitaly</h1>
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100/50">
            <ShieldCheck size={10} />
            <span className="text-[8px] font-black uppercase tracking-widest">Digitalmente Verificado</span>
          </div>
        </div>

        {/* CONTENIDO DEL CERTIFICADO */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

          {/* INFO PACIENTE Y METADATOS */}
          <div className="lg:col-span-4 space-y-12">
            <section>
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4">Información del Titular</p>
              <div className="space-y-1">
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">{examen.paciente_nombre}</h2>
                <p className="text-[10px] font-bold text-slate-400 tabular-nums">DNI {examen.paciente_cedula}</p>
              </div>
            </section>

            <section>
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4">Detalles de Emisión</p>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-300 uppercase">Fecha de Validación</p>
                    <p className="text-[11px] font-bold text-slate-900 uppercase">{formatDisplayDate(examen.fecha)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100">
                    <Hash size={18} />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-300 uppercase">Folio Electrónico</p>
                    <p className="text-[11px] font-bold font-mono text-slate-900">VTL-{uuid?.split('-')[0].toUpperCase()}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="pt-8 border-t border-slate-50">
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4">Canal de Integridad</p>
              <div className="flex items-start gap-3">
                <Lock size={12} className="text-slate-400 mt-0.5" />
                <p className="text-[9px] text-slate-400 font-bold leading-relaxed uppercase tracking-wider">
                  Los datos mostrados están encriptados y vinculados al protocolo de seguridad de la institución.
                </p>
              </div>
            </section>
          </div>

          {/* TABLA DE RESULTADOS ULTRA LIMPIA */}
          <div className="lg:col-span-8">
            <div className="mb-8">
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4">Contenido del Informe</p>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100">
                {examen.tipo}
              </h3>
            </div>

            <div className="bg-white overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-50">
                    <th className="py-4 text-[9px] font-black text-slate-300 uppercase tracking-widest px-2">Análisis</th>
                    <th className="py-4 text-[9px] font-black text-slate-300 uppercase tracking-widest text-right px-2">Magnitud</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50/50">
                  {examen.resultados && Object.entries(examen.resultados).map(([key, value]) => (
                    <tr key={key} className="group">
                      <td className="py-5 px-2">
                        <div className="flex items-center gap-3">
                          <ChevronRight size={10} className="text-slate-200 group-hover:text-slate-900 transition-colors" />
                          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight group-hover:text-slate-900 transition-colors">{key.replace(/_/g, ' ')}</span>
                        </div>
                      </td>
                      <td className="py-5 text-right font-black text-slate-900 text-[12px] tabular-nums px-2">
                        {String(value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* BOTONES DE ACCIÓN DISCRETOS */}
            <div className="flex gap-4 mt-20 border-t border-slate-100 pt-10">
              <button
                onClick={() => window.print()}
                className="flex-1 px-8 py-4 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 border border-slate-100 hover:shadow-xl hover:shadow-slate-100"
              >
                <Printer size={16} /> Imprimir Certificado
              </button>
              <button
                className="flex-1 px-8 py-4 bg-slate-900 text-white rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 shadow-2xl shadow-slate-200 hover:bg-slate-800"
              >
                <ArrowDownToLine size={16} /> Descargar PDF
              </button>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="mt-32 text-center space-y-2">
          <p className="text-[9px] font-black text-slate-200 uppercase tracking-[0.6em]">Digital Identity Verified</p>
          <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Vitaly Pro Clinical Management System — 2025</p>
        </footer>
      </div>

      <style>{`
        @media print {
            .bg-white { background-color: white !important; }
            button { display: none !important; }
            .shadow-2xl { shadow: none !important; }
        }
      `}</style>
    </div>
  );
}

// Subcomponente local para evitar el error de importación si no está en el ámbito
function Activity({ size, className }: { size: number, className: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  )
}