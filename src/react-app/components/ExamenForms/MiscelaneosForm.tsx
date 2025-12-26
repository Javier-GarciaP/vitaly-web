import { useState, useEffect } from "react";
import { Save, Trash2, FileText, Plus } from "lucide-react";
import {MiscelaneosData} from '@/types/types'

interface MiscelaneosFormProps {
  resultados: any;
  onChange: (resultados: any) => void;
}

export default function MiscelaneosForm({ resultados, onChange }: MiscelaneosFormProps) {
  // Estado local para las plantillas cargadas de la DB
  const [plantillas, setPlantillas] = useState<any[]>([]);

  // 1. CARGA REAL DESDE LA API
  const cargarPlantillas = async () => {
    try {
      const res = await fetch('/api/plantillas/miscelaneos');
      if (res.ok) {
        const data = await res.json() as MiscelaneosData[];
        setPlantillas(data);
      }
    } catch (error) {
      console.error("Error cargando plantillas:", error);
    }
  };

  useEffect(() => {
    cargarPlantillas();
  }, []);

  const handleChange = (field: string, value: string) => {
    onChange({ ...resultados, [field]: value });
  };

  // 2. APLICAR PLANTILLA (Mapeo de columnas DB -> Formulario)
  const aplicarPlantilla = (p: any) => {
    onChange({
      ...resultados,
      examen_solicitado: p.nombre_examen,
      metodo: p.metodo,
      muestra: p.muestra,
      resultado_texto: p.contenido_plantilla
    });
  };

  // 3. GUARDAR COMO PLANTILLA (Envío con nombres de columna exactos)
  const guardarComoPlantilla = async () => {
    if (!resultados.examen_solicitado) {
      alert("Asigne un nombre al examen solicitado para guardar la plantilla");
      return;
    }

    const payload = {
      nombre_examen: resultados.examen_solicitado,
      metodo: resultados.metodo || "",
      muestra: resultados.muestra || "",
      contenido_plantilla: resultados.resultado_texto || ""
    };

    try {
      const res = await fetch('/api/plantillas/miscelaneos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("Plantilla guardada correctamente");
        cargarPlantillas(); // Recargar lista lateral automáticamente
      } else {
        alert("Error al guardar la plantilla en el servidor");
      }
    } catch (error) {
      alert("Error de conexión con el servidor");
    }
  };

  // 4. ELIMINAR PLANTILLA
  const eliminarPlantilla = async (id: number) => {
    if (!confirm("¿Seguro que desea eliminar esta plantilla?")) return;

    try {
      const res = await fetch(`/api/plantillas/miscelaneos/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        // Actualizar estado local eliminando el item sin recargar todo
        setPlantillas(plantillas.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  const limpiarCampos = () => {
    onChange({
      examen_solicitado: "",
      metodo: "",
      muestra: "",
      resultado_texto: ""
    });
  };

  const inputStyle = "w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none";
  const labelStyle = "block text-sm font-bold text-blue-900 mb-1";

  return (
    <div className="flex flex-col md:flex-row gap-6">
      
      {/* SECCIÓN PRINCIPAL: EDITOR */}
      <div className="flex-1 space-y-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelStyle}>Examen Solicitado:</label>
              <input
                type="text"
                value={resultados?.examen_solicitado || ""}
                onChange={(e) => handleChange("examen_solicitado", e.target.value)}
                className={inputStyle}
                placeholder="Nombre del examen..."
              />
            </div>
            <div>
              <label className={labelStyle}>Método:</label>
              <input
                type="text"
                value={resultados?.metodo || ""}
                onChange={(e) => handleChange("metodo", e.target.value)}
                className={inputStyle}
              />
            </div>
            <div>
              <label className={labelStyle}>Muestra:</label>
              <input
                type="text"
                value={resultados?.muestra || ""}
                onChange={(e) => handleChange("muestra", e.target.value)}
                className={inputStyle}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className={labelStyle}>Resultado:</label>
              <button 
                onClick={guardarComoPlantilla}
                className="flex items-center gap-2 text-xs bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition"
              >
                <Save size={14} /> Guardar como plantilla
              </button>
            </div>
            <textarea
              value={resultados?.resultado_texto || ""}
              onChange={(e) => handleChange("resultado_texto", e.target.value)}
              className="w-full px-4 py-4 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[300px] font-mono text-sm"
              placeholder="Diseñe el resultado aquí..."
            />
          </div>
        </div>
      </div>

      {/* SECCIÓN LATERAL: GESTOR DE PLANTILLAS */}
      <div className="w-full md:w-72 space-y-4">
        <div className="bg-blue-900 text-white p-4 rounded-t-xl flex items-center gap-2">
          <FileText size={18} />
          <span className="font-bold">Plantillas</span>
        </div>
        <div className="bg-blue-50 p-4 rounded-b-xl border border-blue-100 max-h-[500px] overflow-y-auto">
          {plantillas.length === 0 ? (
            <p className="text-xs text-blue-400 text-center italic">No hay plantillas guardadas</p>
          ) : (
            <div className="space-y-2">
              {plantillas.map((p) => (
                <div key={p.id} className="group relative">
                  <button
                    onClick={() => aplicarPlantilla(p)}
                    className="w-full text-left p-3 bg-white border border-blue-200 rounded-lg text-sm hover:border-blue-500 hover:bg-blue-100 transition pr-8"
                  >
                    <div className="font-bold text-blue-900 truncate">{p.nombre_examen}</div>
                    <div className="text-[10px] text-blue-500 uppercase">{p.metodo}</div>
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); // Evita que se aplique la plantilla al intentar borrarla
                      eliminarPlantilla(p.id);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-red-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
                    title="Eliminar plantilla"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <button 
            onClick={limpiarCampos}
            className="w-full mt-4 flex items-center justify-center gap-2 py-2 border-2 border-dashed border-blue-300 text-blue-500 rounded-lg hover:bg-blue-100 transition text-sm font-semibold"
          >
            <Plus size={16} /> Nueva en blanco
          </button>
        </div>
      </div>
    </div>
  );
}