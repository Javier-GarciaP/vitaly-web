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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full animate-in zoom-in-95 duration-500 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50">
          <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-inner border border-rose-100">
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

  const renderValue = (value: any) => {
    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        return (
          <div className="space-y-3 mt-2 w-full">
            {value.map((item, idx) => (
              <div key={idx} className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                {renderValue(item)}
              </div>
            ))}
          </div>
        );
      }
      return (
        <div className="space-y-1.5">
          {Object.entries(value).map(([ik, iv]) => (
            <div key={ik} className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4 py-1.5 border-b border-slate-100/20 last:border-0">
              <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-tighter shrink-0">{ik.replace(/_/g, ' ')}</span>
              <span className="text-[10px] md:text-[11px] font-bold text-slate-800 uppercase break-words">{String(iv)}</span>
            </div>
          ))}
        </div>
      );
    }
    return String(value);
  };

  return (
    <div className="min-h-screen bg-white p-4 md:p-10 lg:p-20 font-sans flex flex-col items-center selection:bg-slate-900 selection:text-white overflow-x-hidden">
      <div className="max-w-5xl w-full relative animate-in fade-in duration-1000">

        {/* LOGO SIMPLIFICADO */}
        <div className="flex flex-col items-center mb-10 md:mb-16">
          <div className="w-14 h-14 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl mb-6 ring-8 ring-slate-50">
            <Dna size={28} />
          </div>
          <h1 className="text-[14px] md:text-[16px] font-black text-slate-900 uppercase tracking-[0.4em] leading-none mb-3 text-center">Laboratorio Vitaly</h1>
          <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100/50 shadow-sm">
            <ShieldCheck size={12} />
            <span className="text-[9px] font-black uppercase tracking-widest">Validación Segura</span>
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
            <div className="mb-6 md:mb-10">
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4">Contenido del Informe</p>
              <div className="bg-slate-900 px-6 py-5 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center justify-between">
                <h3 className="text-[11px] font-black text-white uppercase tracking-widest">
                  {examen.tipo}
                </h3>
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-glow shadow-emerald-400/50" />
              </div>
            </div>

            <div className="bg-white overflow-hidden">
              <div className="md:hidden space-y-6">
                {/* Mobile View for Results */}
                {examen.resultados && Object.entries(examen.resultados).map(([key, value]) => (
                  <div key={key} className="pb-4 border-b border-slate-50 last:border-0">
                    <div className="flex items-center gap-2 mb-2">
                      <ChevronRight size={10} className="text-slate-200" />
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{key.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="pl-4 text-[13px] font-black text-slate-900 uppercase leading-snug">
                      {renderValue(value)}
                    </div>
                  </div>
                ))}
              </div>

              <table className="hidden md:table w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-50">
                    <th className="py-4 text-[9px] font-black text-slate-300 uppercase tracking-widest px-2">Análisis Solicitado</th>
                    <th className="py-4 text-[9px] font-black text-slate-300 uppercase tracking-widest text-right px-2">Resultado / Hallazgo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50/50">
                  {examen.resultados && Object.entries(examen.resultados).map(([key, value]) => (
                    <tr key={key} className="group hover:bg-slate-50/30 transition-colors">
                      <td className="py-6 px-2 align-top">
                        <div className="flex items-center gap-3">
                          <ChevronRight size={10} className="text-slate-200 group-hover:text-slate-900 transition-colors" />
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight group-hover:text-slate-900 transition-colors">{key.replace(/_/g, ' ')}</span>
                        </div>
                      </td>
                      <td className="py-6 text-right font-black text-slate-900 text-[12px] tabular-nums px-2 max-w-[300px]">
                        {renderValue(value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* BOTONES DE ACCIÓN DISCRETOS */}
            <div className="flex flex-col sm:flex-row gap-4 mt-16 md:mt-24 border-t border-slate-100 pt-10">
              <button
                onClick={() => window.print()}
                className="flex-1 px-8 py-5 bg-slate-50 text-slate-500 hover:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-4 border border-slate-100/50 hover:bg-white hover:shadow-xl hover:shadow-slate-100"
              >
                <Printer size={18} /> Imprimir Certificado
              </button>
              <button
                className="flex-1 px-8 py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-4 shadow-2xl shadow-slate-200 hover:bg-slate-800 active:scale-95"
              >
                <ArrowDownToLine size={18} /> Descargar Informe PDF
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