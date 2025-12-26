import { useEffect, useState, useMemo } from "react";
import {
  Plus,
  Trash2,
  X,
  Search,
  Edit2,
  ChevronRight,
  Check,
  Receipt,
  User,
  Calendar,
  CreditCard,
  Layers,
} from "lucide-react";

// --- Interfaces ---
interface Paciente {
  id: number;
  cedula: string;
  nombre: string;
}

interface ExamenPredefinido {
  id: number;
  nombre: string;
  precio: number;
  categoria: string;
}

interface ExamenFactura {
  nombre: string;
  precio: number;
}

interface Factura {
  id: number;
  paciente_id: number;
  paciente_nombre: string;
  paciente_cedula: string;
  examenes: ExamenFactura[];
  total: number;
  fecha: string;
}

export default function FacturasPage() {
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [examenesPredefinidos, setExamenesPredefinidos] = useState<
    ExamenPredefinido[]
  >([]);
  const [showModal, setShowModal] = useState(false);
  const [notification, setNotification] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [pacienteInput, setPacienteInput] = useState("");
  const [showSugerencias, setShowSugerencias] = useState(false);

  const [busquedaExamen, setBusquedaExamen] = useState("");
  const [showExamenesSug, setShowExamenesSug] = useState(false);

  const [formData, setFormData] = useState({
    paciente_id: "",
    fecha: new Date().toISOString().split("T")[0],
  });

  const [examenesSeleccionados, setExamenesSeleccionados] = useState<
    ExamenFactura[]
  >([]);
  const [examenPersonalizado, setExamenPersonalizado] = useState({
    nombre: "",
    precio: "",
  });

  useEffect(() => {
    loadFacturas();
    loadPacientes();
    loadExamenesPredefinidos();
  }, []);

  const loadFacturas = async () => {
    try {
      const res = await fetch("/api/facturas");
      const data = await res.json();
      setFacturas(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadPacientes = async () => {
    try {
      const res = await fetch("/api/pacientes");
      const data = await res.json();
      setPacientes(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadExamenesPredefinidos = async () => {
    try {
      const res = await fetch("/api/examenes-predefinidos");
      const data = await res.json();
      setExamenesPredefinidos(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  const facturasFiltradas = useMemo(() => {
    return facturas.filter(
      (f) =>
        (f.paciente_nombre?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) || (f.paciente_cedula || "").includes(searchTerm)
    );
  }, [searchTerm, facturas]);

  const sugerenciasPacientes = useMemo(() => {
    if (pacienteInput.length < 2) return [];
    return pacientes
      .filter(
        (p) =>
          p.nombre.toLowerCase().includes(pacienteInput.toLowerCase()) ||
          p.cedula.includes(pacienteInput)
      )
      .slice(0, 5);
  }, [pacienteInput, pacientes]);

  const sugerenciasExamenes = useMemo(() => {
    if (!busquedaExamen) return [];
    return examenesPredefinidos
      .filter((e) =>
        e.nombre.toLowerCase().includes(busquedaExamen.toLowerCase())
      )
      .slice(0, 8);
  }, [busquedaExamen, examenesPredefinidos]);

  const seleccionarPaciente = (p: Paciente) => {
    setFormData({ ...formData, paciente_id: p.id.toString() });
    setPacienteInput(`${p.nombre} (${p.cedula})`);
    setShowSugerencias(false);
  };

  const agregarExamen = (nombre: string, precio: number) => {
    setExamenesSeleccionados((prev) => [...prev, { nombre, precio }]);
    setBusquedaExamen("");
    setShowExamenesSug(false);
  };

  const handleKeyDownExamen = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && sugerenciasExamenes.length > 0) {
      e.preventDefault();
      agregarExamen(
        sugerenciasExamenes[0].nombre,
        sugerenciasExamenes[0].precio
      );
    }
  };

  const eliminarExamen = (index: number) => {
    setExamenesSeleccionados(
      examenesSeleccionados.filter((_, i) => i !== index)
    );
  };

  const calcularTotal = () =>
    examenesSeleccionados.reduce((sum, ex) => sum + ex.precio, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (examenesSeleccionados.length === 0 || !formData.paciente_id) return;

    const payload = {
      paciente_id: parseInt(formData.paciente_id),
      examenes: examenesSeleccionados,
      total: calcularTotal(),
      fecha: formData.fecha,
    };

    try {
      const url = editingId ? `/api/facturas/${editingId}` : "/api/facturas";
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showNotification(
          editingId ? "Factura actualizada" : "Factura generada con éxito"
        );
        loadFacturas();
        closeModal();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openModal = () => {
    setEditingId(null);
    setFormData({
      paciente_id: "",
      fecha: new Date().toISOString().split("T")[0],
    });
    setPacienteInput("");
    setExamenesSeleccionados([]);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setBusquedaExamen("");
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3000);
  };

  // Función para eliminar factura
  const handleEliminarFactura = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta factura?")) return;

    try {
      const res = await fetch(`/api/facturas/${id}`, { method: "DELETE" });
      if (res.ok) {
        showNotification("Factura eliminada correctamente");
        loadFacturas(); // Recargar la lista
      } else {
        alert("Error al eliminar la factura");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Función para cargar datos en el modal y editar
  const handleEditarFactura = (factura: Factura) => {
    setEditingId(factura.id);
    setFormData({
      paciente_id: factura.paciente_id.toString(),
      fecha: factura.fecha,
    });
    setPacienteInput(`${factura.paciente_nombre} (${factura.paciente_cedula})`);
    setExamenesSeleccionados(factura.examenes);
    setShowModal(true);
  };

  const categorias = [...new Set(examenesPredefinidos.map((e) => e.categoria))];

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-700">
      {/* HEADER DE PÁGINA */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Receipt size={18} className="text-blue-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Administración Financiera
            </span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Facturación
          </h1>
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-80">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar por paciente o cédula..."
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-transparent border-2 focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-bold text-slate-700 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={openModal}
            className="bg-slate-900 text-white px-8 py-4 rounded-2xl hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 font-bold active:scale-95 flex items-center gap-2 whitespace-nowrap"
          >
            <Plus size={20} /> Nueva Factura
          </button>
        </div>
      </div>

      {notification && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-[2rem] shadow-2xl z-[100] animate-in slide-in-from-bottom-10 flex items-center gap-3">
          <Check className="text-emerald-400" />
          <span className="font-bold">{notification}</span>
        </div>
      )}

      {/* TABLA DE FACTURAS */}
      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.15em]">
                <th className="px-8 py-6">ID Factura</th>
                <th className="px-8 py-6">Paciente</th>
                <th className="px-8 py-6">Fecha Emisión</th>
                <th className="px-8 py-6">Exámenes</th>
                <th className="px-8 py-6 text-right">Total</th>
                <th className="px-8 py-6 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {facturasFiltradas.map((f) => (
                <tr
                  key={f.id}
                  className="group hover:bg-blue-50/30 transition-colors"
                >
                  <td className="px-8 py-5 font-mono text-[11px] text-slate-400">
                    #F-00{f.id}
                  </td>
                  <td className="px-8 py-5">
                    <p className="font-black text-slate-800 text-sm leading-tight">
                      {f.paciente_nombre}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                      {f.paciente_cedula}
                    </p>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-bold text-slate-600 flex items-center gap-2">
                      <Calendar size={14} className="text-slate-300" />
                      {new Date(f.fecha).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex -space-x-2">
                      {f.examenes?.slice(0, 3).map((ex, i) => (
                        <div
                          key={i}
                          className="h-7 px-3 bg-white border border-slate-100 rounded-lg flex items-center text-[9px] font-black text-blue-600 shadow-sm uppercase tracking-tighter"
                        >
                          {ex.nombre}
                        </div>
                      ))}
                      {f.examenes?.length > 3 && (
                        <div className="h-7 w-7 bg-slate-100 rounded-lg flex items-center justify-center text-[9px] font-black text-slate-400 border border-white">
                          +{f.examenes.length - 3}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right font-black text-slate-900 text-lg">
                    <span className="text-blue-500 text-xs mr-1">$</span>
                    {f.total.toFixed(2)}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* BOTÓN EDITAR */}
                      <button
                        onClick={() => handleEditarFactura(f)}
                        className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl shadow-sm transition-all"
                      >
                        <Edit2 size={16} />
                      </button>

                      {/* BOTÓN ELIMINAR */}
                      <button
                        onClick={() => handleEliminarFactura(f.id)}
                        className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-white rounded-xl shadow-sm transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL POS (Punto de Venta) */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col h-[90vh] animate-in zoom-in-95">
            {/* Header Modal */}
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                  <Receipt size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    Nueva Factura
                  </h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                    Módulo de facturación electrónica
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-4 hover:bg-white rounded-[1.5rem] text-slate-300 hover:text-red-500 shadow-sm transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
              {/* LADO IZQUIERDO: SELECCIÓN Y CATÁLOGO */}
              <div className="flex-1 p-10 overflow-y-auto space-y-10 custom-scrollbar">
                {/* Selección de Paciente */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="relative">
                    <label className="text-[11px] font-black text-slate-400 uppercase mb-3 block ml-1 tracking-widest">
                      Información del Cliente
                    </label>
                    <div className="group relative">
                      <User
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors"
                        size={18}
                      />
                      <input
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-[1.5rem] outline-none font-bold text-slate-700 transition-all placeholder:text-slate-300"
                        placeholder="Buscar paciente..."
                        value={pacienteInput}
                        onChange={(e) => {
                          setPacienteInput(e.target.value);
                          setShowSugerencias(true);
                        }}
                      />
                    </div>
                    {showSugerencias && sugerenciasPacientes.length > 0 && (
                      <div className="absolute z-[110] w-full mt-3 bg-white border border-slate-100 rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-top-2">
                        {sugerenciasPacientes.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => seleccionarPaciente(p)}
                            className="w-full px-6 py-4 text-left hover:bg-blue-50 flex justify-between items-center border-b border-slate-50 last:border-0 group transition-colors"
                          >
                            <span className="font-bold text-slate-700 group-hover:text-blue-600">
                              {p.nombre}
                            </span>
                            <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                              {p.cedula}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase mb-3 block ml-1 tracking-widest">
                      Fecha de Cobro
                    </label>
                    <div className="relative">
                      <Calendar
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                        size={18}
                      />
                      <input
                        type="date"
                        value={formData.fecha}
                        onChange={(e) =>
                          setFormData({ ...formData, fecha: e.target.value })
                        }
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-[1.5rem] outline-none font-bold text-slate-700 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Buscador de Exámenes */}
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-slate-400 uppercase mb-1 block ml-1 tracking-widest">
                    Buscador Rápido de Estudios
                  </label>
                  <div className="relative">
                    <input
                      className="w-full px-6 py-6 bg-blue-50/30 border-2 border-dashed border-blue-100 rounded-[2rem] focus:ring-0 focus:border-blue-500 focus:border-solid outline-none font-bold text-lg text-slate-700 placeholder:text-blue-200 transition-all"
                      placeholder="Escriba el análisis clínico y presione Enter..."
                      value={busquedaExamen}
                      onChange={(e) => {
                        setBusquedaExamen(e.target.value);
                        setShowExamenesSug(true);
                      }}
                      onKeyDown={handleKeyDownExamen}
                    />
                    {showExamenesSug && sugerenciasExamenes.length > 0 && (
                      <div className="absolute z-[110] w-full mt-3 bg-white border border-slate-100 rounded-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-top-2">
                        {sugerenciasExamenes.map((ex) => (
                          <button
                            key={ex.id}
                            type="button"
                            onClick={() => agregarExamen(ex.nombre, ex.precio)}
                            className="w-full px-8 py-4 text-left hover:bg-blue-600 hover:text-white flex justify-between items-center transition-colors group"
                          >
                            <span className="font-bold">{ex.nombre}</span>
                            <span className="font-black text-blue-600 group-hover:text-white">
                              ${ex.precio.toFixed(2)}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Catálogo por Categorías */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <Layers size={16} className="text-slate-400" />
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                      Catálogo Disponible
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                    {categorias.map((cat) => (
                      <div key={cat} className="space-y-3">
                        <p className="text-[10px] font-black text-blue-500 uppercase flex items-center gap-2 border-b border-blue-50 pb-2">
                          <ChevronRight size={14} /> {cat}
                        </p>
                        <div className="grid gap-2">
                          {examenesPredefinidos
                            .filter((e) => e.categoria === cat)
                            .map((ex) => (
                              <button
                                key={ex.id}
                                type="button"
                                onClick={() =>
                                  agregarExamen(ex.nombre, ex.precio)
                                }
                                className="w-full text-left p-4 rounded-2xl border-2 border-slate-50 hover:border-blue-200 hover:bg-white transition-all flex justify-between items-center group"
                              >
                                <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900">
                                  {ex.nombre}
                                </span>
                                <span className="text-xs font-black text-slate-300 group-hover:text-blue-600 transition-colors">
                                  ${ex.precio.toFixed(2)}
                                </span>
                              </button>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Manual */}
                <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl shadow-slate-200 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10" />
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">
                    Ítem personalizado
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                    <input
                      placeholder="Descripción del servicio"
                      value={examenPersonalizado.nombre}
                      onChange={(e) =>
                        setExamenPersonalizado({
                          ...examenPersonalizado,
                          nombre: e.target.value,
                        })
                      }
                      className="flex-[3] bg-white/10 border-transparent border-2 focus:border-white/30 rounded-xl px-5 py-3 text-sm outline-none transition-all placeholder:text-slate-500"
                    />
                    <div className="flex-[1] relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                        $
                      </span>
                      <input
                        placeholder="Precio"
                        type="number"
                        value={examenPersonalizado.precio}
                        onChange={(e) =>
                          setExamenPersonalizado({
                            ...examenPersonalizado,
                            precio: e.target.value,
                          })
                        }
                        className="w-full bg-white/10 border-transparent border-2 focus:border-white/30 rounded-xl pl-8 pr-4 py-3 text-sm outline-none transition-all"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          examenPersonalizado.nombre &&
                          examenPersonalizado.precio
                        ) {
                          agregarExamen(
                            examenPersonalizado.nombre,
                            parseFloat(examenPersonalizado.precio)
                          );
                          setExamenPersonalizado({ nombre: "", precio: "" });
                        }
                      }}
                      className="bg-white text-slate-900 px-6 py-3 rounded-xl hover:bg-blue-400 hover:text-white transition-all font-black flex items-center justify-center"
                    >
                      <Check size={20} />
                    </button>
                  </div>
                </div>
              </div>

              {/* LADO DERECHO: TICKET DE COBRO */}
              <div className="w-full lg:w-[420px] bg-slate-50/80 p-10 flex flex-col border-l border-slate-100 relative">
                <div className="absolute top-0 left-0 w-full h-2 bg-[radial-gradient(circle_at_center,_#e2e8f0_1px,_transparent_1px)] bg-[length:12px_12px]" />

                <div className="flex-1">
                  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 text-center">
                    Detalle de Operación
                  </h3>

                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {examenesSeleccionados.map((ex, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-start group animate-in slide-in-from-right-5 duration-300"
                      >
                        <div className="flex gap-4">
                          <button
                            onClick={() => eliminarExamen(i)}
                            className="mt-1 text-slate-200 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                          <div>
                            <p className="text-sm font-black text-slate-800 leading-tight">
                              {ex.nombre}
                            </p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">
                              Servicio Profesional
                            </p>
                          </div>
                        </div>
                        <p className="font-black text-slate-700 text-sm">
                          ${ex.precio.toFixed(2)}
                        </p>
                      </div>
                    ))}
                    {examenesSeleccionados.length === 0 && (
                      <div className="text-center py-20 opacity-20">
                        <Receipt size={64} className="mx-auto mb-4" />
                        <p className="text-xs font-black uppercase tracking-widest">
                          Esperando ítems
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-10 pt-10 border-t-2 border-dashed border-slate-200 space-y-6">
                  <div className="flex justify-between items-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                    <span>Subtotal Neto</span>
                    <span>${calcularTotal().toFixed(2)}</span>
                  </div>

                  <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-slate-900 font-black uppercase text-xs tracking-tighter">
                        Total a Pagar
                      </span>
                      <CreditCard size={18} className="text-blue-500" />
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-blue-600">
                        $
                      </span>
                      <span className="text-5xl font-black text-slate-900 tracking-tighter tabular-nums">
                        {calcularTotal().toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={
                      examenesSeleccionados.length === 0 ||
                      !formData.paciente_id
                    }
                    className={`w-full py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs transition-all shadow-2xl active:scale-[0.97] ${
                      examenesSeleccionados.length > 0 && formData.paciente_id
                        ? "bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                    }`}
                  >
                    Emitir Factura
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estilos para scrollbars limpios */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
}
