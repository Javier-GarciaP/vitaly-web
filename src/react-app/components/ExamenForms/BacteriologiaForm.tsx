import { useState, useEffect } from "react";
import { Save, ClipboardList, Plus, Trash2, Beaker, X } from "lucide-react";

interface BacteriologiaFormProps {
  resultados: any;
  onChange: (resultados: any) => void;
}

export default function BacteriologiaForm({ resultados, onChange }: BacteriologiaFormProps) {
  // Estados para el autocompletado
  const [textoAnti, setTextoAnti] = useState("");
  const [sugerencias, setSugerencias] = useState<string[]>([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  
  const [plantillas, setPlantillas] = useState<any[]>([]);
  const [showPlantillas, setShowPlantillas] = useState(false);

  const listaAntibioticos = [
    "Amikacina", "Amoxi-Ac.Clavulánico", "Ampicilina-Sulbactan", "Cefepime", "Aztreonar", "Ceftazidima",
    "Ceftriaxone", "Meropenem", "Imipenem", "Ertapenem", "Ciprofloxacina", "Levofloxacina",
    "Nitrofurantoina", "Trimetropin-Sulfa", "Pipera-Tazobac", "Eritromicina", "Clindamicina",
    "Rifampicina", "Ampicilina", "Linezolid", "Azitromicina", "Oxacilina", "Tigeciclina", "Colistin", "Gentamicina"
  ];

  const germenes = ["", "Escherichia coli", "Staphylococcus aureus", "Proteus vulgaris", "Klebsiella pneumoniae"];

  const cargarPlantillas = async () => {
    try {
      const res = await fetch('/api/plantillas/bacteriologia');
      if (res.ok) setPlantillas(await res.json());
    } catch (e) { console.error(e); }
  };

  useEffect(() => { cargarPlantillas(); }, []);

  const handleChange = (field: string, value: any) => {
    onChange({ ...resultados, [field]: value });
  };

  // --- LÓGICA DE AUTOCOMPLETADO Y ANTIBIOGRAMA ---
  
  const manejarEscrituraAnti = (val: string) => {
    setTextoAnti(val);
    if (val.trim().length > 0) {
      const filtradas = listaAntibioticos.filter(a => 
        a.toLowerCase().includes(val.toLowerCase())
      );
      setSugerencias(filtradas);
      setMostrarSugerencias(true);
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
  };

  const proximoValor = (actual: string) => {
    if (!actual) return "S";
    if (actual === "S") return "R";
    if (actual === "R") return "I";
    return "";
  };

  const toggleValor = (nombre: string, campo: 'a' | 'b') => {
    const nuevaLista = resultados.antibiograma_list.map((item: any) => {
      if (item.nombre === nombre) {
        return { ...item, [campo]: proximoValor(item[campo]) };
      }
      return item;
    });
    handleChange("antibiograma_list", nuevaLista);
  };

  const eliminarAntibiotico = (nombre: string) => {
    const nuevaLista = resultados.antibiograma_list.filter((item: any) => item.nombre !== nombre);
    handleChange("antibiograma_list", nuevaLista);
  };

  // --- GESTIÓN DE PLANTILLAS ---
  const guardarPlantilla = async () => {
    const nombre = prompt("Nombre de la plantilla:");
    if (!nombre) return;
    const payload = {
      nombre_plantilla: nombre,
      muestra_default: resultados.muestra || "",
      observacion_directa: resultados.obs_directa || "",
      tincion_gram: resultados.gram || "",
      recuento_colonias: resultados.recuento || "",
      cultivo: resultados.cultivo || "",
      cultivo_hongos: resultados.cultivo_hongos || ""
    };
    try {
      const res = await fetch('/api/plantillas/bacteriologia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) { alert("Guardado"); cargarPlantillas(); }
    } catch (e) { alert("Error"); }
  };

  const aplicarPlantilla = (p: any) => {
    onChange({
      ...resultados,
      muestra: p.muestra_default,
      obs_directa: p.observacion_directa,
      gram: p.tincion_gram,
      recuento: p.recuento_colonias,
      cultivo: p.cultivo,
      cultivo_hongos: p.cultivo_hongos
    });
    setShowPlantillas(false);
  };

  const inputStyle = "w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm";
  const labelStyle = "block text-xs font-bold text-blue-800 uppercase mb-1";
  const areaStyle = "w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[80px] text-sm font-mono";

  return (
    <div className="space-y-6 relative">
      
      {/* MODAL DE PLANTILLAS */}
      {showPlantillas && (
        <div className="absolute z-50 top-12 right-0 w-80 bg-white shadow-2xl border border-blue-200 rounded-xl p-4">
          <div className="flex justify-between items-center mb-3 border-b pb-2">
            <span className="font-bold text-blue-900 text-sm">Plantillas Bacteriología</span>
            <button onClick={() => setShowPlantillas(false)}><X size={16}/></button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {plantillas.map(p => (
              <div key={p.id} className="flex gap-2">
                <button onClick={() => aplicarPlantilla(p)} className="flex-1 text-left text-xs p-2 hover:bg-blue-50 rounded border border-blue-100 italic">
                  {p.nombre_plantilla}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CABECERA */}
      <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-blue-50 pb-2">
          <h3 className="text-blue-900 font-bold flex items-center gap-2">
            <Beaker size={18} /> DATOS DE CULTIVO
          </h3>
          <div className="flex gap-2">
            <button onClick={() => setShowPlantillas(!showPlantillas)} className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-bold hover:bg-blue-200">
              <ClipboardList size={14} /> CARGAR PLANTILLA
            </button>
            <button onClick={guardarPlantilla} className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-md text-xs font-bold hover:bg-green-200">
              <Save size={14} /> GUARDAR FORMATO
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelStyle}>Muestra / Origen</label>
            <input type="text" value={resultados?.muestra || ""} onChange={(e) => handleChange("muestra", e.target.value)} className={inputStyle} />
          </div>
          <div>
            <label className={labelStyle}>Germen A</label>
            <select value={resultados?.germen_a || ""} onChange={(e) => handleChange("germen_a", e.target.value)} className={inputStyle}>
              {germenes.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className={labelStyle}>Germen B</label>
            <select value={resultados?.germen_b || ""} onChange={(e) => handleChange("germen_b", e.target.value)} className={inputStyle}>
              {germenes.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ÁREAS DE TEXTO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div><label className={labelStyle}>Observación Directa</label><textarea value={resultados?.obs_directa || ""} onChange={(e) => handleChange("obs_directa", e.target.value)} className={areaStyle} /></div>
          <div><label className={labelStyle}>Tinción de Gram</label><textarea value={resultados?.gram || ""} onChange={(e) => handleChange("gram", e.target.value)} className={areaStyle} /></div>
          <div><label className={labelStyle}>Recuento de Colonias</label><textarea value={resultados?.recuento || ""} onChange={(e) => handleChange("recuento", e.target.value)} className={areaStyle} /></div>
        </div>
        <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div><label className={labelStyle}>Cultivo (Aislamiento)</label><textarea value={resultados?.cultivo || ""} onChange={(e) => handleChange("cultivo", e.target.value)} className={areaStyle} /></div>
          <div><label className={labelStyle}>Cultivo de Hongos</label><textarea value={resultados?.cultivo_hongos || ""} onChange={(e) => handleChange("cultivo_hongos", e.target.value)} className={areaStyle} /></div>
        </div>
      </div>

      {/* ANTIBIOGRAMA CON AUTOCOMPLETE */}
      <div className="bg-white rounded-xl border border-blue-200 overflow-hidden shadow-md">
        <div className="bg-blue-900 text-white px-4 py-3 font-bold text-sm uppercase flex justify-between items-center">
          <span>Antibiograma (Clic en celda para S/R/I)</span>
          
          <div className="relative flex gap-2 items-center">
            <div className="relative">
                <input 
                    type="text"
                    value={textoAnti}
                    onChange={(e) => manejarEscrituraAnti(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && agregarAntibiotico()}
                    placeholder="Escribir antibiótico..."
                    className="bg-white text-blue-900 text-xs p-2 rounded outline-none w-48 shadow-inner"
                />
                {mostrarSugerencias && sugerencias.length > 0 && (
                    <div className="absolute z-[60] top-full left-0 w-full bg-white border border-blue-200 shadow-xl rounded-b-md max-h-40 overflow-y-auto">
                        {sugerencias.map(s => (
                            <div 
                                key={s} 
                                onClick={() => agregarAntibiotico(s)}
                                className="p-2 text-blue-900 text-[10px] hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0"
                            >
                                {s}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <button onClick={() => agregarAntibiotico()} className="bg-blue-500 hover:bg-blue-400 p-2 rounded text-white transition">
                <Plus size={14}/>
            </button>
          </div>
        </div>

        <div className="min-h-[200px]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-blue-100 text-blue-900 text-xs">
                <th className="px-6 py-3 text-left">ANTIBIÓTICO</th>
                <th className="px-6 py-3 text-center">{resultados?.germen_a || "GERMEN A"}</th>
                <th className="px-6 py-3 text-center">{resultados?.germen_b || "GERMEN B"}</th>
                <th className="px-4 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {resultados?.antibiograma_list?.map((item: any) => (
                <tr key={item.nombre} className="hover:bg-blue-50/50 transition">
                  <td className="px-6 py-3 font-medium text-gray-700">{item.nombre}</td>
                  
                  <td onClick={() => toggleValor(item.nombre, 'a')} className="px-6 py-3 text-center cursor-pointer select-none active:scale-95">
                    <span className={`inline-block w-8 py-1 rounded font-bold text-xs ${
                      item.a === 'S' ? 'bg-green-100 text-green-700' : 
                      item.a === 'R' ? 'bg-red-100 text-red-700' : 
                      item.a === 'I' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {item.a || '-'}
                    </span>
                  </td>

                  <td onClick={() => toggleValor(item.nombre, 'b')} className="px-6 py-3 text-center cursor-pointer select-none active:scale-95">
                    <span className={`inline-block w-8 py-1 rounded font-bold text-xs ${
                      item.b === 'S' ? 'bg-green-100 text-green-700' : 
                      item.b === 'R' ? 'bg-red-100 text-red-700' : 
                      item.b === 'I' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {item.b || '-'}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <button onClick={() => eliminarAntibiotico(item.nombre)} className="text-gray-300 hover:text-red-500">
                      <Trash2 size={14} />
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