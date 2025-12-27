import { useState, useEffect } from "react";
import {
  Save,
  ClipboardList,
  Plus,
  Trash2,
  X,
  TestTube2,
  FlaskConical,
  CheckCircle2,
  Eraser,
} from "lucide-react";

import { BacteriologiaData } from "@/types/types";

interface BacteriologiaFormProps {
  resultados: any;
  onChange: (resultados: any) => void;
}

export default function BacteriologiaForm({
  resultados,
  onChange,
}: BacteriologiaFormProps) {
  // Estados de UI y Autocompletado
  const [textoAnti, setTextoAnti] = useState("");
  const [sugerencias, setSugerencias] = useState<string[]>([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [plantillas, setPlantillas] = useState<any[]>([]);
  const [showPlantillas, setShowPlantillas] = useState(false);
  const [notificacion, setNotificacion] = useState<{
    msg: string;
    tipo: "success" | "error";
  } | null>(null);

  
  const listaAntibioticos = [
    "Amikacina", "Amoxi-Ac.Clavulánico", "Ampicilina-Sulbactan", "Cefepime",
    "Aztreonar", "Ceftazidima", "Ceftriaxone", "Meropenem", "Imipenem",
    "Ertapenem", "Ciprofloxacina", "Levofloxacina", "Nitrofurantoina",
    "Trimetropin-Sulfa", "Pipera-Tazobac", "Eritromicina", "Clindamicina",
    "Rifampicina", "Ampicilina", "Linezolid", "Azitromicina", "Oxacilina",
    "Tigeciclina", "Colistin", "Gentamicina",
  ];

  const germenes = [
    "Negativo", "Escherichia coli", "Staphylococcus aureus",
    "Proteus vulgaris", "Klebsiella pneumoniae", "Pseudomonas aeruginosa",
  ];

  const notify = (msg: string, tipo: "success" | "error" = "success") => {
    setNotificacion({ msg, tipo });
    setTimeout(() => setNotificacion(null), 3000);
  };

  const cargarPlantillas = async () => {
    try {
      const res = await fetch("/api/plantillas/bacteriologia");
      if (res.ok) {
        const data: BacteriologiaData[] = await res.json();
        // Mantenemos los datos tal cual vienen de la DB (asegurando que traen 'id')
        setPlantillas(data);
      }
    } catch (e) {
      console.error("Error cargando plantillas:", e);
    }
  };

  useEffect(() => {
    cargarPlantillas();
  }, []);

  const handleChange = (field: string, value: any) => {
    onChange({ ...resultados, [field]: value });
  };

  // --- GESTIÓN DE PLANTILLAS ---

  const aplicarPlantilla = (p: any) => {
    onChange({
      ...resultados,
      muestra: p.muestra_default || "",
      obs_directa: p.observacion_directa || "",
      gram: p.tincion_gram || "",
      recuento: p.recuento_colonias || "",
      cultivo: p.cultivo || "",
      cultivo_hongos: p.cultivo_hongos || "",
    });
    setShowPlantillas(false);
    notify(`Plantilla "${p.nombre_plantilla}" aplicada`);
  };

  const guardarPlantilla = async () => {
    const nombre = prompt("Nombre para la nueva plantilla:");
    if (!nombre) return;

    const payload = {
      nombre_plantilla: nombre,
      muestra_default: resultados.muestra || "",
      observacion_directa: resultados.obs_directa || "",
      tincion_gram: resultados.gram || "",
      recuento_colonias: resultados.recuento || "",
      cultivo: resultados.cultivo || "",
      cultivo_hongos: resultados.cultivo_hongos || "",
    };

    try {
      const res = await fetch("/api/plantillas/bacteriologia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        notify("Plantilla guardada");
        cargarPlantillas(); // Recargar para obtener el nuevo ID generado
      }
    } catch (e) {
      notify("Error al guardar", "error");
    }
  };

  const eliminarPlantilla = async (
    e: React.MouseEvent,
    id: number | string | undefined
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!id) {
      notify("ID de plantilla no encontrado en la base de datos", "error");
      console.error("Intento de eliminar una plantilla sin ID válido:", id);
      return;
    }

    if (!confirm("¿Seguro que deseas eliminar esta plantilla?")) return;

    try {
      const res = await fetch(`/api/plantillas/bacteriologia/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });


      if (res.ok) {
        notify("Plantilla eliminada correctamente", "success");
        setPlantillas((prev) => prev.filter((p) => p.id !== id));
      } else {
        notify("Error al eliminar", "error");
      }
    } catch (e) {
      console.error("Error conexión:", e);
      notify("No se pudo conectar con el servidor", "error");
    }
  };

  const limpiarFormulario = () => {
    onChange({
      ...resultados,
      muestra: "",
      obs_directa: "",
      gram: "",
      recuento: "",
      cultivo: "",
      cultivo_hongos: "",
      antibiograma_list: [],
    });
    setShowPlantillas(false);
    notify("Formulario vaciado");
  };

  // --- LÓGICA DE AUTOCOMPLETADO ---

  const manejarEscrituraAnti = (val: string) => {
    setTextoAnti(val);
    if (val.trim().length > 0) {
      const filtradas = listaAntibioticos.filter((a) =>
        a.toLowerCase().includes(val.toLowerCase())
      );
      setSugerencias(filtradas);
      setMostrarSugerencias(true);
      setSelectedIndex(-1);
    } else {
      setMostrarSugerencias(false);
    }
  };

  const agregarAntibiotico = (nombre?: string) => {
    const nombreFinal = nombre || textoAnti;
    if (!nombreFinal.trim()) return;

    const actual = resultados.antibiograma_list || [];
    if (actual.find((item: any) => item.nombre.toLowerCase() === nombreFinal.toLowerCase())) {
      setTextoAnti("");
      setMostrarSugerencias(false);
      return;
    }

    const nuevaLista = [...actual, { nombre: nombreFinal, a: "", b: "" }];
    handleChange("antibiograma_list", nuevaLista);
    setTextoAnti("");
    setMostrarSugerencias(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (mostrarSugerencias && sugerencias.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < sugerencias.length - 1 ? prev + 1 : prev));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (selectedIndex >= 0) agregarAntibiotico(sugerencias[selectedIndex]);
        else agregarAntibiotico();
      } else if (e.key === "Escape") {
        setMostrarSugerencias(false);
      }
    } else if (e.key === "Enter") {
      agregarAntibiotico();
    }
  };

  const toggleValor = (nombre: string, campo: "a" | "b") => {
    const nuevaLista = (resultados.antibiograma_list || []).map((item: any) => {
      if (item.nombre === nombre) {
        const actual = item[campo];
        const sig = !actual ? "S" : actual === "S" ? "R" : actual === "R" ? "I" : "";
        return { ...item, [campo]: sig };
      }
      return item;
    });
    handleChange("antibiograma_list", nuevaLista);
  };

  const eliminarAntibiotico = (nombre: string) => {
    const nuevaLista = (resultados.antibiograma_list || []).filter(
      (item: any) => item.nombre !== nombre
    );
    handleChange("antibiograma_list", nuevaLista);
  };

  // --- ESTILOS ---
  const inputBase = "w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all";
  const labelBase = "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block";
  const areaBase = "w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 outline-none focus:border-indigo-500 focus:bg-white transition-all min-h-[100px] resize-none";

  return (
    <div className="relative space-y-8 max-w-6xl mx-auto pb-10">
      {/* NOTIFICACIÓN FLOTANTE */}
      {notificacion && (
        <div className="fixed top-6 right-6 z-[200] flex items-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 animate-in slide-in-from-top-10 fade-in duration-500">
          <CheckCircle2 className={notificacion.tipo === "success" ? "text-emerald-400" : "text-rose-400"} size={20} />
          <span className="text-sm font-black uppercase tracking-wider">{notificacion.msg}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <FlaskConical size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Análisis Bacteriológico</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Módulo de Cultivos</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowPlantillas(!showPlantillas)}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-black hover:bg-indigo-600 hover:text-white transition-all uppercase tracking-widest"
            >
              <ClipboardList size={16} /> Plantillas
            </button>

            {showPlantillas && (
              <div className="absolute z-[100] top-full mt-3 right-0 w-80 bg-white shadow-2xl border border-slate-100 rounded-2xl overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                  <span className="font-black text-[10px] text-slate-500 uppercase">Mis Modelos</span>
                  <X size={14} className="cursor-pointer text-slate-400" onClick={() => setShowPlantillas(false)} />
                </div>
                <div className="max-h-80 overflow-y-auto p-2 space-y-1">
                  <button
                    onClick={limpiarFormulario}
                    className="w-full flex items-center gap-3 p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors group"
                  >
                    <Eraser size={16} className="opacity-70" />
                    <span className="text-xs font-black uppercase">Limpiar Todo</span>
                  </button>

                  <div className="h-px bg-slate-100 my-2" />

                  {plantillas.length === 0 ? (
                    <p className="text-center py-4 text-[10px] font-bold text-slate-400 uppercase">No hay plantillas</p>
                  ) : (
                    plantillas.map((p, idx) => (
                      <div
                        key={p.id || `temp-key-${idx}`}
                        className="group relative flex items-center bg-slate-50/50 hover:bg-indigo-50 rounded-xl transition-all mb-1"
                      >
                        <button onClick={() => aplicarPlantilla(p)} className="w-full text-left p-3 pr-12">
                          <p className="text-xs font-bold text-slate-700 group-hover:text-indigo-700 transition-colors uppercase tracking-tight">
                            {p.nombre_plantilla}
                          </p>
                        </button>
                        <button
                          onClick={(e) => eliminarPlantilla(e, p.id)}
                          className="absolute right-2 p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 z-10"
                          type="button"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <button
            onClick={guardarPlantilla}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-black hover:bg-emerald-600 transition-all uppercase tracking-widest shadow-lg shadow-emerald-100"
          >
            <Save size={16} /> Guardar Formato
          </button>
        </div>
      </div>

      {/* CUERPO DEL FORMULARIO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
            <div>
              <label className={labelBase}>Muestra / Origen</label>
              <input
                type="text"
                value={resultados?.muestra || ""}
                onChange={(e) => handleChange("muestra", e.target.value)}
                className={inputBase}
              />
            </div>
            <div>
              <label className={labelBase}>Germen A</label>
              <select
                value={resultados?.germen_a || ""}
                onChange={(e) => handleChange("germen_a", e.target.value)}
                className={inputBase}
              >
                <option value="">Seleccionar...</option>
                {germenes.map((g) => (<option key={g} value={g}>{g}</option>))}
              </select>
            </div>
            <div>
              <label className={labelBase}>Germen B</label>
              <select
                value={resultados?.germen_b || ""}
                onChange={(e) => handleChange("germen_b", e.target.value)}
                className={inputBase}
              >
                <option value="">Seleccionar...</option>
                {germenes.map((g) => (<option key={g} value={g}>{g}</option>))}
              </select>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <div>
              <label className={labelBase}>Observación Directa</label>
              <textarea
                value={resultados?.obs_directa || ""}
                onChange={(e) => handleChange("obs_directa", e.target.value)}
                className={areaBase}
              />
            </div>
            <div>
              <label className={labelBase}>Tinción de Gram</label>
              <textarea
                value={resultados?.gram || ""}
                onChange={(e) => handleChange("gram", e.target.value)}
                className={areaBase}
              />
            </div>
          </div>
          <div className="space-y-6 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <div>
              <label className={labelBase}>Recuento de Colonias</label>
              <textarea
                value={resultados?.recuento || ""}
                onChange={(e) => handleChange("recuento", e.target.value)}
                className={areaBase}
              />
            </div>
            <div>
              <label className={labelBase}>Cultivo</label>
              <textarea
                value={resultados?.cultivo || ""}
                onChange={(e) => handleChange("cultivo", e.target.value)}
                className={areaBase}
              />
            </div>
            <div>
              <label className={labelBase}>Cultivo de Hongos</label>
              <textarea
                value={resultados?.cultivo_hongos || ""}
                onChange={(e) => handleChange("cultivo_hongos", e.target.value)}
                className={areaBase}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ANTIBIOGRAMA */}
      <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-800">
        <div className="px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <TestTube2 className="text-indigo-400" size={20} />
            <h4 className="text-white font-black text-sm uppercase tracking-widest">Antibiograma</h4>
          </div>
          <div className="relative flex gap-2">
            <div className="relative">
              <input
                type="text"
                value={textoAnti}
                onChange={(e) => manejarEscrituraAnti(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Buscar antibiótico..."
                className="bg-slate-800 text-white text-xs px-5 py-3 rounded-xl outline-none w-64 border border-transparent focus:border-indigo-500 font-bold shadow-inner"
              />
              {mostrarSugerencias && sugerencias.length > 0 && (
                <div className="absolute z-[110] top-full mt-2 left-0 w-full bg-white border border-slate-100 shadow-2xl rounded-xl overflow-hidden">
                  {sugerencias.map((s, idx) => (
                    <div
                      key={s}
                      onClick={() => agregarAntibiotico(s)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`px-4 py-2.5 text-xs font-bold cursor-pointer transition-colors border-b border-slate-50 last:border-0 ${
                        idx === selectedIndex ? "bg-indigo-600 text-white" : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => agregarAntibiotico()} className="bg-indigo-600 hover:bg-indigo-500 p-3 rounded-xl text-white transition-transform active:scale-90 shadow-lg">
              <Plus size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[250px]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-8 py-4 text-left">Fármaco</th>
                <th className="px-8 py-4 text-center">{resultados?.germen_a || "Germen A"}</th>
                <th className="px-8 py-4 text-center">{resultados?.germen_b || "Germen B"}</th>
                <th className="px-8 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {(resultados?.antibiograma_list || []).map((item: any, idx: number) => (
                <tr key={`${item.nombre}-${idx}`} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-8 py-4 font-black text-slate-200">{item.nombre}</td>
                  <td onClick={() => toggleValor(item.nombre, "a")} className="px-8 py-4 text-center cursor-pointer select-none">
                    <span className={`inline-block w-10 py-1.5 rounded-lg font-black text-[11px] ${
                      item.a === "S" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                      item.a === "R" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                      item.a === "I" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-slate-700 text-slate-500"
                    }`}>
                      {item.a || "-"}
                    </span>
                  </td>
                  <td onClick={() => toggleValor(item.nombre, "b")} className="px-8 py-4 text-center cursor-pointer select-none">
                    <span className={`inline-block w-10 py-1.5 rounded-lg font-black text-[11px] ${
                      item.b === "S" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                      item.b === "R" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                      item.b === "I" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-slate-700 text-slate-500"
                    }`}>
                      {item.b || "-"}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <button onClick={() => eliminarAntibiotico(item.nombre)} className="p-2 text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}