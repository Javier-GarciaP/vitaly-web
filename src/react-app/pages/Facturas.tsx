import { useEffect, useState, useMemo } from "react";
import {
  Plus,
  Trash2,
  X,
  Search,
  Edit2,
  Check,
  Receipt,
  User,
  Calendar,
  Layers,
  FileText,
  ChevronDown,
} from "lucide-react";

// --- Interfaces Actualizadas ---
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
  categoria: string; // Campo crucial para la lógica que pides
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

  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [openCategories, setOpenCategories] = useState<string[]>([]); // Para controlar qué listas están abiertas

  const getLocalDate = () => {
    const date = new Date();
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().split("T")[0];
  };

  const [formData, setFormData] = useState({
    paciente_id: "",
    fecha: getLocalDate(),
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

  // --- Lógica de categorías para el Backend ---
  const categoriasPresentes = useMemo(() => {
    const cats = examenesSeleccionados
      .map((ex) => ex.categoria)
      .filter((c) => c !== "Otros"); // Opcional: filtrar si no quieres crear exámenes para "Varios"
    return [...new Set(cats)];
  }, [examenesSeleccionados]);

  const seleccionarPaciente = (p: Paciente) => {
    setFormData({ ...formData, paciente_id: p.id.toString() });
    setPacienteInput(`${p.nombre} (${p.cedula})`);
    setShowSugerencias(false);
  };

  const agregarExamen = (nombre: string, precio: number, categoria: string) => {
    setExamenesSeleccionados((prev) => [
      ...prev,
      { nombre, precio, categoria },
    ]);
    setBusquedaExamen("");
    setShowExamenesSug(false);
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
      categorias: categoriasPresentes, // Esta lista le dice al backend qué exámenes de laboratorio crear
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
          editingId
            ? "Factura actualizada correctamente"
            : "Factura y órdenes generadas"
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
    setFormData({ paciente_id: "", fecha: getLocalDate() });
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

  const handleEliminarFactura = async (id: number) => {
    if (
      !confirm(
        "¿Estás seguro de que deseas eliminar esta factura? Esto podría afectar los exámenes vinculados."
      )
    )
      return;
    try {
      const res = await fetch(`/api/facturas/${id}`, { method: "DELETE" });
      if (res.ok) {
        showNotification("Factura eliminada");
        loadFacturas();
      }
    } catch (error) {
      console.error(error);
    }
  };

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

  const listaCategorias = [
    ...new Set(examenesPredefinidos.map((e) => e.categoria)),
  ];

  // Función para alternar categorías
  const toggleCategory = (cat: string) => {
    setOpenCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  // 2. Manejador de teclado actualizado
  const handleKeyDownExamen = (e: React.KeyboardEvent) => {
    if (sugerenciasExamenes.length > 0) {
      if (e.key === "ArrowDown") {
        setSelectedIndex((prev) =>
          prev < sugerenciasExamenes.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === "Enter" && selectedIndex >= 0) {
        const ex = sugerenciasExamenes[selectedIndex];
        agregarExamen(ex.nombre, ex.precio, ex.categoria);
        setBusquedaExamen("");
        setSelectedIndex(-1);
      }
    }
  };

  return (
  <div className="max-w-[1400px] mx-auto p-4 md:p-6 lg:p-8 space-y-4 md:space-y-8 animate-in fade-in duration-700">
    {/* HEADER DE PÁGINA - Más compacto */}
    <div className="bg-white p-5 md:p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-4">
      <div className="text-center lg:text-left">
        <div className="flex items-center justify-center lg:justify-start gap-2 mb-1">
          <Receipt size={16} className="text-blue-500" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
            Administración Financiera
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
          Facturación
        </h1>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-3 w-full lg:w-auto">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Buscar paciente..."
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-transparent border-2 focus:border-blue-500 focus:bg-white rounded-xl outline-none font-bold text-sm text-slate-700 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={openModal}
          className="w-full md:w-auto bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-all shadow-lg font-bold active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap text-sm"
        >
          <Plus size={18} /> Nueva Factura
        </button>
      </div>
    </div>

    {notification && (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl z-[110] animate-in slide-in-from-bottom-10 flex items-center gap-3">
        <Check size={18} className="text-emerald-400" />
        <span className="font-bold text-sm">{notification}</span>
      </div>
    )}

    {/* LISTADO DE FACTURAS - Tabla en PC, Cards en Móvil */}
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Vista Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-slate-400 text-[9px] font-black uppercase tracking-widest">
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Paciente</th>
              <th className="px-6 py-4">Fecha</th>
              <th className="px-6 py-4">Exámenes</th>
              <th className="px-6 py-4 text-right">Total</th>
              <th className="px-6 py-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {facturasFiltradas.map((f) => (
              <tr key={f.id} className="group hover:bg-blue-50/30 transition-colors">
                <td className="px-6 py-4 font-mono text-[10px] text-slate-400">#F-{f.id}</td>
                <td className="px-6 py-4">
                  <p className="font-black text-slate-800 text-sm leading-tight">{f.paciente_nombre}</p>
                  <p className="text-[9px] text-slate-400 font-bold">{f.paciente_cedula}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-bold text-slate-600 flex items-center gap-2">
                    <Calendar size={12} className="text-slate-300" />
                    {f.fecha.split("-").reverse().join("/")}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex -space-x-1">
                    {f.examenes?.slice(0, 2).map((ex, i) => (
                      <div key={i} className="px-2 py-1 bg-white border border-slate-100 rounded-md text-[8px] font-black text-blue-600 uppercase">
                        {ex.nombre}
                      </div>
                    ))}
                    {f.examenes?.length > 2 && (
                      <div className="h-5 w-5 bg-slate-100 rounded-md flex items-center justify-center text-[8px] font-black text-slate-400">
                        +{f.examenes.length - 2}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-black text-slate-900 text-base">
                  <span className="text-blue-500 text-xs mr-0.5">$</span>{f.total.toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEditarFactura(f)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleEliminarFactura(f.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-white rounded-lg transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vista Móvil (Cards) */}
      <div className="md:hidden divide-y divide-slate-50">
        {facturasFiltradas.map((f) => (
          <div key={f.id} className="p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-black text-slate-800 text-sm leading-tight">{f.paciente_nombre}</p>
                <p className="text-[10px] text-slate-400 font-bold">{f.paciente_cedula}</p>
              </div>
              <span className="font-black text-slate-900 text-sm">${f.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                <Calendar size={10} /> {f.fecha.split("-").reverse().join("/")}
              </span>
              <div className="flex gap-2">
                <button onClick={() => handleEditarFactura(f)} className="p-2 bg-slate-50 text-slate-600 rounded-lg"><Edit2 size={14} /></button>
                <button onClick={() => handleEliminarFactura(f.id)} className="p-2 bg-red-50 text-red-600 rounded-lg"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* MODAL POS - MEJORADO RESPONSIVE */}
    {showModal && (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end md:items-center justify-center z-[100] p-0 md:p-4">
        <div className="bg-white rounded-t-[2rem] md:rounded-[2rem] shadow-2xl w-full max-w-7xl overflow-hidden flex flex-col h-[95vh] md:h-[90vh] animate-in slide-in-from-bottom md:zoom-in-95 duration-300">
          
          {/* HEADER MODAL - Más pequeño */}
          <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <Receipt size={20} />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">
                  {editingId ? "Editar Factura" : "Nueva Factura"}
                </h2>
                <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-md">
                  Terminal Activa
                </span>
              </div>
            </div>
            <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-all">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
            {/* LADO IZQUIERDO: SELECCIÓN */}
            <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6 custom-scrollbar bg-slate-50/30">
              {/* Info Cliente y Fecha */}
              <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block ml-1 tracking-widest">Paciente</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl outline-none font-bold text-xs transition-all"
                      placeholder="Buscar paciente..."
                      value={pacienteInput}
                      onChange={(e) => { setPacienteInput(e.target.value); setShowSugerencias(true); }}
                    />
                  </div>
                  {showSugerencias && sugerenciasPacientes.length > 0 && (
                    <div className="absolute z-[120] w-full mt-1 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden">
                      {sugerenciasPacientes.map((p) => (
                        <button key={p.id} type="button" onClick={() => seleccionarPaciente(p)} className="w-full px-4 py-2 text-left hover:bg-blue-600 hover:text-white flex justify-between items-center border-b border-slate-50 last:border-0 transition-colors group">
                          <div className="flex flex-col">
                            <span className="font-bold text-xs group-hover:text-white">{p.nombre}</span>
                            <span className="text-[8px] font-black text-slate-400 group-hover:text-blue-200 uppercase">{p.cedula}</span>
                          </div>
                          <Check size={12} className="text-emerald-500 group-hover:text-white" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block ml-1 tracking-widest">Fecha Contable</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input
                      type="date"
                      value={formData.fecha}
                      onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl outline-none font-bold text-xs transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Buscador de Estudios */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" size={18} />
                <input
                  className="w-full pl-12 pr-6 py-4 bg-white border-2 border-dashed border-blue-100 rounded-2xl focus:border-blue-500 focus:border-solid outline-none font-bold text-sm text-slate-700 transition-all shadow-sm"
                  placeholder="Buscar análisis (Ej: Glicemia...)"
                  value={busquedaExamen}
                  onChange={(e) => { setBusquedaExamen(e.target.value); setShowExamenesSug(true); setSelectedIndex(-1); }}
                  onKeyDown={handleKeyDownExamen}
                />
                {showExamenesSug && sugerenciasExamenes.length > 0 && (
                  <div className="absolute z-[110] w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden">
                    {sugerenciasExamenes.map((ex, index) => (
                      <button
                        key={ex.id}
                        type="button"
                        onClick={() => agregarExamen(ex.nombre, ex.precio, ex.categoria)}
                        className={`w-full px-6 py-3 text-left flex justify-between items-center transition-colors ${selectedIndex === index ? "bg-blue-600 text-white" : "hover:bg-blue-50"}`}
                      >
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">{ex.nombre}</span>
                          <span className={`text-[8px] uppercase font-black ${selectedIndex === index ? "text-blue-100" : "text-slate-400"}`}>{ex.categoria}</span>
                        </div>
                        <span className={`font-black text-sm ${selectedIndex === index ? "text-white" : "text-blue-600"}`}>${ex.precio.toFixed(2)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Navegar Catálogo - Acordeón más pequeño */}
              <div className="space-y-2">
                <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2">Catálogo</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {listaCategorias.map((cat) => (
                    <div key={cat} className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
                      <button
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className="w-full px-4 py-3 flex justify-between items-center hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Layers size={14} className="text-blue-500" />
                          <span className="font-black text-slate-700 text-[10px] uppercase tracking-tight">{cat}</span>
                        </div>
                        <ChevronDown size={16} className={`text-slate-300 transition-transform ${openCategories.includes(cat) ? "rotate-180" : ""}`} />
                      </button>
                      {openCategories.includes(cat) && (
                        <div className="border-t border-slate-50 bg-slate-50/30 divide-y divide-slate-50">
                          {examenesPredefinidos.filter((e) => e.categoria === cat).map((ex) => (
                            <button key={ex.id} type="button" onClick={() => agregarExamen(ex.nombre, ex.precio, ex.categoria)} className="w-full px-6 py-2 flex justify-between items-center hover:bg-white group transition-all">
                              <span className="text-[11px] font-bold text-slate-600 group-hover:text-blue-700">{ex.nombre}</span>
                              <span className="text-[10px] font-black text-slate-400 group-hover:text-blue-500">${ex.precio.toFixed(2)}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Item Personalizado - Compacto */}
              <div className="p-4 bg-slate-900 rounded-2xl text-white shadow-lg">
                <p className="text-[8px] font-black text-slate-500 uppercase mb-3 tracking-widest flex items-center gap-2">
                  <FileText size={10} /> Servicio Especial
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    placeholder="Descripción..."
                    value={examenPersonalizado.nombre}
                    onChange={(e) => setExamenPersonalizado({ ...examenPersonalizado, nombre: e.target.value })}
                    className="flex-[3] bg-white/5 border-white/10 border rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-500 transition-all"
                  />
                  <input
                    placeholder="$ 0.00"
                    type="number"
                    value={examenPersonalizado.precio}
                    onChange={(e) => setExamenPersonalizado({ ...examenPersonalizado, precio: e.target.value })}
                    className="flex-[1] bg-white/5 border-white/10 border rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (examenPersonalizado.nombre && examenPersonalizado.precio) {
                        agregarExamen(examenPersonalizado.nombre, parseFloat(examenPersonalizado.precio), "Otros");
                        setExamenPersonalizado({ nombre: "", precio: "" });
                      }
                    }}
                    className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-500 font-black text-xs"
                  >
                    <Plus size={16} className="mx-auto" />
                  </button>
                </div>
              </div>
            </div>

            {/* LADO DERECHO: TICKET - Optimizado para móviles */}
            <div className="w-full lg:w-[380px] bg-white flex flex-col border-t lg:border-t-0 lg:border-l border-slate-100 max-h-[40vh] lg:max-h-full">
              <div className="p-4 pb-2 shrink-0 text-center border-b lg:border-b-0 border-slate-50">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Resumen</h3>
                <div className="h-0.5 w-8 bg-blue-600 mx-auto rounded-full" />
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 custom-scrollbar">
                {examenesSeleccionados.map((ex, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl group">
                    <div className="flex items-center gap-3">
                      <button onClick={() => eliminarExamen(i)} className="p-1.5 bg-white text-slate-300 hover:text-red-500 rounded-md transition-all">
                        <Trash2 size={12} />
                      </button>
                      <div>
                        <p className="text-[11px] font-black text-slate-800 leading-tight">{ex.nombre}</p>
                        <span className="text-[8px] font-bold text-blue-500 uppercase">{ex.categoria}</span>
                      </div>
                    </div>
                    <p className="font-black text-xs text-slate-700">${ex.precio.toFixed(2)}</p>
                  </div>
                ))}
                {examenesSeleccionados.length === 0 && (
                  <div className="text-center py-10 opacity-20">
                    <Receipt size={32} className="mx-auto mb-2" />
                    <p className="text-[8px] font-black uppercase tracking-widest">Vacío</p>
                  </div>
                )}
              </div>

              <div className="p-4 md:p-6 bg-white border-t border-slate-50 shrink-0 space-y-3">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Total a Pagar</span>
                  <span className="text-2xl font-black text-slate-900 tracking-tighter">
                    <span className="text-blue-500 text-sm mr-1">$</span>{calcularTotal().toFixed(2)}
                  </span>
                </div>
                
                <button
                  disabled={examenesSeleccionados.length === 0 || !formData.paciente_id}
                  onClick={handleSubmit}
                  className="w-full bg-blue-600 disabled:bg-slate-100 disabled:text-slate-400 text-white py-4 rounded-xl font-black text-sm shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Check size={18} /> {editingId ? "Actualizar Factura" : "Finalizar y Cobrar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);
}
