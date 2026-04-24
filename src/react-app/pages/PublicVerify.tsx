import { useEffect, useState } from "react";
import { useParams } from "react-router";
import {
  AlertOctagon,
  ShieldCheck,
  Dna,
  Printer,
  ChevronRight,
  User,
  Calendar,
  Fingerprint,
  FileText,
  BadgeCheck,
  CloudLightning
} from "lucide-react";
import { formatDisplayDate } from "@/utils/date";

import ExamenesService from "../../services/ExamenesService";

export default function PublicVerify() {
  const { uuid } = useParams();
  const [examen, setExamen] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uuid) return;
    const loadExamen = async () => {
      try {
        const data = await ExamenesService.getByUuid(uuid);
        setExamen(data);
      } catch (error) {
        console.error("Error verificando examen:", error);
      } finally {
        setLoading(false);
      }
    };
    loadExamen();
  }, [uuid]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#fbfcfd]">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-[3px] border-slate-100 border-t-slate-900 shadow-sm"></div>
          <CloudLightning className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-300 animate-pulse" size={20} />
        </div>
        <p className="mt-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] animate-pulse">
          Validando Certificado...
        </p>
      </div>
    );
  }

  if (!examen || examen.error) {
    return (
      <div className="min-h-screen bg-[#fbfcfd] flex items-center justify-center p-6">
        <div className="max-w-md w-full animate-in zoom-in-95 duration-700 bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50">
          <div className="w-24 h-24 bg-rose-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-inner border border-rose-100">
            <AlertOctagon size={40} className="text-rose-500" />
          </div>
          <div className="text-center space-y-4">
            <h1 className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-900 leading-none">Error de Validación</h1>
            <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase tracking-wider">
              No se encontró un registro digital asociado a este código de validación.
            </p>
          </div>
          <div className="mt-12 p-8 bg-slate-50/50 rounded-3xl border border-slate-100/50 text-center">
            <p className="text-[8px] font-black text-slate-300 uppercase mb-3 tracking-[0.2em]">Hash de Consulta</p>
            <p className="text-[10px] font-mono font-bold text-slate-500 break-all leading-tight">{uuid}</p>
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
              <div key={idx} className="bg-slate-50/30 p-4 rounded-2xl border border-slate-100/50">
                {renderValue(item)}
              </div>
            ))}
          </div>
        );
      }
    }
    return String(value);
  };

  const renderAntibiograma = (list: any[]) => {
    if (!list || list.length === 0) return null;
    return (
      <div className="mt-10 overflow-hidden rounded-[2.5rem] border border-slate-100 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="py-4 px-6 text-[9px] font-black uppercase tracking-[0.2em]">Antibiótico</th>
              <th className="py-4 px-6 text-[9px] font-black uppercase tracking-[0.2em] text-right">Sensibilidad</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 bg-white">
            {list.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-4 px-6 text-[10px] font-bold text-slate-700 uppercase">{item.antibiotico}</td>
                <td className="py-4 px-6 text-right">
                  <span className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${item.sensibilidad === 'Sensible' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                    item.sensibilidad === 'Resistente' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                      'bg-slate-50 text-slate-600 border border-slate-100'
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
    <div className="min-h-screen bg-[#fbfcfd] p-4 md:p-8 lg:p-12 font-sans selection:bg-slate-900 selection:text-white printable-area flex justify-center">

      {/* BACKGROUND DECORATION */}
      <div className="fixed top-0 left-0 right-0 h-64 bg-gradient-to-b from-slate-100/50 to-transparent -z-10" />

      <div className="max-w-4xl w-full bg-white relative animate-in fade-in duration-700 bg-white p-8 md:p-20 rounded-[4rem] shadow-2xl shadow-slate-200/60 border border-white">

        {/* HEADER DE MARCA */}
        <div className="flex flex-col items-center mb-20">
          <div className="relative mb-8 group">
            <div className="absolute -inset-4 bg-slate-900/5 rounded-[3rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative w-20 h-20 bg-slate-900 text-white rounded-[2.5rem] flex items-center justify-center shadow-2xl ring-8 ring-white">
              <Dna size={40} className="animate-in zoom-in-50 duration-500" />
            </div>
          </div>
          <h1 className="text-[20px] md:text-[28px] font-black text-slate-900 uppercase tracking-[0.4em] leading-none mb-4 text-center">VITALY PRO</h1>
          <div className="flex items-center gap-2.5 px-5 py-2 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 shadow-sm animate-in slide-in-from-top-2 duration-700">
            <BadgeCheck size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Registro Digital Verificado</span>
          </div>
        </div>

        {/* CONTENEDOR DE INFORMACIÓN PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">

          {/* PACIENTE */}
          <div className="lg:col-span-12 p-10 bg-slate-50/50 rounded-[3rem] border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <User size={120} />
            </div>
            <div className="relative">
              <p className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">
                <Fingerprint size={12} /> Datos del Paciente
              </p>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 uppercase tracking-tight leading-none mb-6">{examen.paciente_nombre}</h2>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl shadow-sm border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">DNI</span>
                  <span className="text-[11px] font-black text-slate-900">{examen.paciente_cedula}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl shadow-sm border border-slate-100">
                  <Calendar size={12} className="text-slate-300" />
                  <span className="text-[11px] font-black text-slate-900">{formatDisplayDate(examen.fecha)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* METADATOS EXTRA */}
          <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 rounded-[2.5rem] border border-slate-100 flex items-center gap-6">
              <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center">
                <FileText size={20} />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Tipo de Estudio</p>
                <p className="text-[12px] font-black text-slate-900 uppercase">{examen.tipo}</p>
              </div>
            </div>
            <div className="p-8 rounded-[2.5rem] border border-slate-100 flex items-center gap-6">
              <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Hash Digital</p>
                <p className="text-[10px] font-mono font-bold text-slate-500 uppercase">{uuid?.substring(0, 18)}...</p>
              </div>
            </div>
          </div>
        </div>

        {/* CUERPO DE RESULTADOS */}
        <div className="space-y-16 mb-20">
          <div className="flex items-center gap-6">
            <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.4em]">Resultados Clínicos</h3>
            <div className="flex-1 h-[1px] bg-slate-100" />
          </div>

          {Array.isArray(examen.resultados) ? (
            <div className="grid gap-10">
              {examen.resultados.map((sub: any, idx: number) => (
                <div key={idx} className="group p-8 md:p-12 rounded-[3.5rem] border border-slate-100 hover:border-slate-200 transition-all bg-white relative overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-100">
                  <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-50">
                    <h4 className="text-[13px] font-black text-slate-900 uppercase tracking-[0.2em]">
                      {sub.nombre_examen || `Módulo #${idx + 1}`}
                    </h4>
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Nº {idx + 1}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    {Object.entries(sub).map(([rk, rv]) => {
                      if (rk === 'nombre_examen' || rk === 'observacion' || rk === '_highlightFields' || rk === 'highlightFields') return null;
                      return (
                        <div key={rk} className="flex justify-between items-center group/row">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight group-hover/row:text-slate-600 transition-colors">{rk.replace(/_/g, ' ')}</span>
                          <span className="text-[12px] font-black text-slate-900 uppercase">{String(rv)}</span>
                        </div>
                      );
                    })}
                  </div>

                  {sub.observacion && (
                    <div className="mt-10 p-6 bg-amber-50/20 rounded-3xl border border-amber-100/30">
                      <p className="text-[9px] font-black text-amber-600 uppercase mb-2">Dictamen / Observación</p>
                      <p className="text-[11px] font-medium text-slate-600 italic leading-relaxed">{sub.observacion}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="animate-in fade-in duration-1000">
              <div className="bg-white rounded-[3.5rem] border border-slate-100 p-8 md:p-12 shadow-sm">
                <div className="grid grid-cols-1 gap-y-2">
                  {Object.entries(examen.resultados || {}).map(([key, value]) => {
                    if (key === 'antibiograma_list' || key === 'observacion' || key === '_highlightFields' || key === 'highlightFields') return null;
                    return (
                      <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between py-5 border-b border-slate-50 last:border-0 hover:bg-slate-50/30 transition-colors px-4 rounded-2xl">
                        <div className="flex items-center gap-4 mb-2 sm:mb-0">
                          <ChevronRight size={12} className="text-slate-300" />
                          <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em]">{key.replace(/_/g, ' ')}</span>
                        </div>
                        <div className="text-[13px] font-black text-slate-900 uppercase tracking-tight">
                          {renderValue(value)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {examen.resultados?.antibiograma_list && renderAntibiograma(examen.resultados.antibiograma_list)}
              </div>

              {examen.resultados?.observacion && (
                <div className="mt-12 p-10 bg-slate-900 rounded-[3.5rem] text-white shadow-2xl shadow-slate-900/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-10 opacity-10">
                    <FileText size={80} />
                  </div>
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-6">
                      <AlertOctagon size={20} className="text-emerald-400" />
                      <h4 className="text-[11px] font-black uppercase tracking-[0.3em]">Comentarios Médicos</h4>
                    </div>
                    <p className="text-[12px] font-medium leading-relaxed uppercase tracking-wide opacity-80 border-l-2 border-slate-700 pl-6">{examen.resultados.observacion}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* BOTÓN DE IMPRESIÓN */}
        <div className="mt-20 no-print">
          <button
            onClick={() => window.print()}
            className="w-full py-6 bg-slate-900 text-white rounded-[2rem] text-[11px] font-black uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 shadow-2xl shadow-slate-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Printer size={20} /> Generar Certificado Físico
          </button>
          <div className="mt-8 flex flex-col items-center gap-2">
            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Documento Protegido por Infraestructura D1</p>
            <div className="flex gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/50" />
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/20" />
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="mt-32 pt-12 border-t border-slate-50 text-center space-y-6">
          <div>
            <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.5em] mb-2">Vitaly Pro Clinical Engine</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Tecnología de Verificación Biomédica de Vanguardia</p>
          </div>
          <div className="flex justify-center gap-12 pt-4">
            <div className="text-center">
              <p className="text-[8px] font-black text-slate-300 uppercase mb-1">Sede Central</p>
              <p className="text-[9px] font-black text-slate-400 uppercase">Vitaly Labs — 2025</p>
            </div>
            <div className="text-center">
              <p className="text-[8px] font-black text-slate-300 uppercase mb-1">Seguridad</p>
              <p className="text-[9px] font-black text-slate-400 uppercase">SSL 256-Bit Encrypted</p>
            </div>
          </div>
        </footer>
      </div>

      <style>{`
        @media print {
            body { background: white !important; padding: 0 !important; }
            .bg-white { box-shadow: none !important; border: none !important; padding: 0 !important; }
            .no-print { display: none !important; }
            .printable-area { background: white !important; padding: 0 !important; width: 100% !important; max-width: none !important; }
            h1, h2, h3, h4, span, p { color: black !important; }
            .bg-slate-900 { background-color: #000 !important; color: white !important; }
            .rounded-[4rem], .rounded-[3.5rem] { border-radius: 0 !important; }
            .shadow-2xl, .shadow-xl { box-shadow: none !important; }
        }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
}
