import { useEffect, useState } from "react";
import { useParams } from "react-router";
import {
  AlertOctagon, ShieldCheck,
  Dna,
  Printer,
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
    if (value === null || value === undefined) return "-";
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        return (
          <div className="space-y-4 w-full mt-2">
            {value.map((item, idx) => (
              <div key={idx} className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                {renderValue(item)}
              </div>
            ))}
          </div>
        );
      }
      return (
        <div className="grid grid-cols-1 gap-2">
          {Object.entries(value).map(([ik, iv]) => {
            if (ik === 'antibiograma_list' || ik === 'observacion' || ik === 'nombre_examen') return null;
            return (
              <div key={ik} className="flex justify-between items-baseline border-b border-slate-100/50 pb-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mr-4">{ik.replace(/_/g, ' ')}</span>
                <span className="text-[10px] font-bold text-slate-800 uppercase text-right">{String(iv)}</span>
              </div>
            );
          })}
        </div>
      );
    }
    return String(value);
  };

  const renderAntibiograma = (list: any[]) => {
    if (!list || list.length === 0) return null;
    return (
      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="py-3 px-4 text-[9px] font-black uppercase tracking-widest">Antibiótico</th>
              <th className="py-3 px-4 text-[9px] font-black uppercase tracking-widest text-right">Sensibilidad</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {list.map((item, idx) => (
              <tr key={idx}>
                <td className="py-3 px-4 text-[10px] font-bold text-slate-700 uppercase">{item.antibiotico}</td>
                <td className="py-3 px-4 text-[10px] font-black text-slate-900 text-right uppercase">
                  <span className={`px-2 py-1 rounded-md ${item.sensibilidad === 'Sensible' ? 'bg-emerald-50 text-emerald-600' :
                    item.sensibilidad === 'Resistente' ? 'bg-rose-50 text-rose-600' :
                      'bg-slate-50 text-slate-600'
                    }`}>
                    {item.sensibilidad}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/30 p-4 md:p-10 lg:p-20 font-sans flex flex-col items-center selection:bg-slate-900 selection:text-white overflow-x-hidden printable-area">
      <div className="max-w-4xl w-full relative animate-in fade-in duration-1000 bg-white p-8 md:p-16 rounded-[4rem] shadow-2xl shadow-slate-200/50 border border-white">

        {/* LOGO SIMPLIFICADO */}
        <div className="flex flex-col items-center mb-16">
          <div className="w-16 h-16 bg-slate-900 text-white rounded-[2rem] flex items-center justify-center shadow-2xl mb-6 ring-8 ring-slate-50">
            <Dna size={32} />
          </div>
          <h1 className="text-[16px] md:text-[20px] font-black text-slate-900 uppercase tracking-[0.5em] leading-none mb-3 text-center">Laboratorio Vitaly</h1>
          <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100/50 shadow-sm">
            <ShieldCheck size={12} />
            <span className="text-[9px] font-black uppercase tracking-widest">Documento Verificado</span>
          </div>
        </div>

        {/* INFO PACIENTE Y METADATOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 pb-12 border-b border-slate-100">
          <section>
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4">Información del Titular</p>
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none mb-2">{examen.paciente_nombre}</h2>
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1 bg-slate-50 text-slate-400 text-[9px] font-black rounded-lg uppercase border border-slate-100">DNI {examen.paciente_cedula}</span>
                <span className="px-3 py-1 bg-slate-50 text-slate-400 text-[9px] font-black rounded-lg uppercase border border-slate-100">Emitido el {formatDisplayDate(examen.fecha)}</span>
              </div>
            </div>
          </section>

          <section>
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4">Detalles de Validación</p>
            <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100/50 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[8px] font-black text-slate-300 uppercase">ID de Certificado</span>
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">{uuid?.split('-')[0]}-VALID</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[8px] font-black text-slate-300 uppercase">Tipo de Informe</span>
                <span className="text-[10px] font-bold text-slate-900 uppercase">{examen.tipo}</span>
              </div>
            </div>
          </section>
        </div>

        {/* RESULTADOS */}
        <div className="space-y-12">
          {/* Si resultados es un Array (Misceláneos múltiples) */}
          {Array.isArray(examen.resultados) ? (
            <div className="space-y-16">
              {examen.resultados.map((sub: any, idx: number) => (
                <div key={idx} className="animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="h-[2px] flex-1 bg-slate-100" />
                    <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.4em] px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                      {sub.nombre_examen || `Estudio #${idx + 1}`}
                    </h3>
                    <div className="h-[2px] flex-1 bg-slate-100" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                    {Object.entries(sub).map(([rk, rv]) => {
                      if (rk === 'nombre_examen' || rk === 'observacion') return null;
                      return (
                        <div key={rk} className="flex justify-between items-center border-b border-slate-50 pb-2">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight">{rk.replace(/_/g, ' ')}</span>
                          <span className="text-[11px] font-bold text-slate-900 uppercase">{String(rv)}</span>
                        </div>
                      );
                    })}
                  </div>
                  {sub.observacion && (
                    <div className="mt-6 p-4 bg-amber-50/30 rounded-2xl border border-amber-100/50">
                      <p className="text-[8px] font-black text-amber-600 uppercase mb-1">Observaciones</p>
                      <p className="text-[10px] font-medium text-slate-600 italic leading-relaxed">{sub.observacion}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            /* Caso Normal / Bacteriología */
            <div className="animate-in fade-in duration-700">
              <div className="grid grid-cols-1 gap-y-4">
                {Object.entries(examen.resultados || {}).map(([key, value]) => {
                  if (key === 'antibiograma_list' || key === 'observacion') return null;
                  return (
                    <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-slate-50 hover:bg-slate-50/30 transition-colors px-2">
                      <div className="flex items-center gap-3 mb-2 sm:mb-0">
                        <ChevronRight size={10} className="text-slate-200" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{key.replace(/_/g, ' ')}</span>
                      </div>
                      <div className="text-[12px] font-black text-slate-900 uppercase tracking-tight">
                        {renderValue(value)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Antibiograma Specific */}
              {examen.resultados?.antibiograma_list && renderAntibiograma(examen.resultados.antibiograma_list)}

              {/* Observación General */}
              {examen.resultados?.observacion && (
                <div className="mt-12 p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl shadow-slate-900/10">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertOctagon size={16} className="text-emerald-400" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest">Interpretación Clínica / Observaciones</h4>
                  </div>
                  <p className="text-[11px] font-medium leading-relaxed uppercase tracking-wide opacity-80">{examen.resultados.observacion}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ACCIÓN DE IMPRESIÓN (Solo visible en pantalla) */}
        <div className="bg-slate-50 mt-16 p-8 rounded-[3rem] border border-slate-100 flex flex-col items-center gap-4 group no-print">
          <button
            onClick={() => window.print()}
            className="w-full sm:w-auto px-12 py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4 shadow-2xl shadow-slate-200 hover:scale-105 active:scale-95"
          >
            <Printer size={18} /> Imprimir Copia de Seguridad
          </button>
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">La descarga de PDF ha sido inhabilitada por seguridad</p>
        </div>

        {/* FOOTER */}
        <footer className="mt-24 text-center space-y-3">
          <div className="flex justify-center gap-2 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-glow shadow-emerald-400/50" />
            <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
            <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
          </div>
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.6em]">Digital Identity Verified</p>
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Vitaly Pro Clinical Management System — 2025</p>
        </footer>
      </div>

      <style>{`
        @media print {
            body { background: white !important; padding: 0 !important; }
            .bg-white { box-shadow: none !important; border: none !important; padding: 0 !important; }
            .no-print { display: none !important; }
            .printable-area { background: white !important; padding: 0 !important; }
            footer { margin-top: 50px !important; }
            .shadow-2xl, .shadow-xl, .shadow-sm { box-shadow: none !important; }
            h1, h2, h3, h4, span, p { color: black !important; }
            .bg-slate-900 { background-color: #000 !important; color: white !important; }
        }
      `}</style>
    </div>
  );
}

function Activity({ size, className }: { size: number, className: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  )
}