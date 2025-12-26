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
  CreditCard,
  Layers,
  FileText,
  AlertCircle,
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
                      {f.fecha.split("-").reverse().join("/")}
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
                      <button
                        onClick={() => handleEditarFactura(f)}
                        className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl shadow-sm transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
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

      {/* MODAL POS - MEJORADO */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-7xl overflow-hidden flex flex-col h-[90vh] animate-in zoom-in-95 duration-300">
            {/* HEADER MODAL */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                  <Receipt size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    {editingId ? "Editar Factura" : "Nueva Factura"}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-md">
                      <Check size={10} /> Terminal Activa
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400 hover:text-red-500 transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
              {/* LADO IZQUIERDO: SELECCIÓN Y CATÁLOGO (CON SCROLL) */}
              <div className="flex-1 p-8 overflow-y-auto space-y-8 custom-scrollbar bg-slate-50/30">
                {/* Info Cliente y Fecha */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative">
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest ml-2">
                      Paciente
                    </label>
                    <div className="relative group">
                      <User
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors"
                        size={18}
                      />
                      <input
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-bold text-slate-700 transition-all"
                        placeholder="Buscar paciente..."
                        value={pacienteInput}
                        onChange={(e) => {
                          setPacienteInput(e.target.value);
                          setShowSugerencias(true);
                        }}
                      />
                    </div>

                    {/* Autocompletado de Pacientes */}
                    {showSugerencias && sugerenciasPacientes.length > 0 && (
                      <div className="absolute z-[120] w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        {sugerenciasPacientes.map((p, index) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => seleccionarPaciente(p)}
                            className="w-full px-5 py-3 text-left hover:bg-blue-600 hover:text-white flex justify-between items-center border-b border-slate-50 last:border-0 transition-colors group"
                          >
                            <div className="flex flex-col">
                              <span className="font-bold text-sm group-hover:text-white">
                                {p.nombre}
                              </span>
                              <span className="text-[9px] font-black text-slate-400 group-hover:text-blue-200 uppercase">
                                {p.cedula}
                              </span>
                            </div>
                            <Check
                              size={14}
                              className="text-emerald-500 group-hover:text-white"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest ml-2">
                      Fecha Contable
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
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-bold text-slate-700 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Buscador de Estudios (Autocompletado con Teclado) */}
                <div className="space-y-3">
                  <div className="relative">
                    <Search
                      className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-400"
                      size={20}
                    />
                    <input
                      className="w-full pl-14 pr-6 py-5 bg-white border-2 border-dashed border-blue-100 rounded-[2rem] focus:ring-0 focus:border-blue-500 focus:border-solid outline-none font-bold text-lg text-slate-700 placeholder:text-blue-200 transition-all shadow-sm"
                      placeholder="Buscar análisis (Ej: Glicemia, Orina...)"
                      value={busquedaExamen}
                      onChange={(e) => {
                        setBusquedaExamen(e.target.value);
                        setShowExamenesSug(true);
                        setSelectedIndex(-1);
                      }}
                      onKeyDown={handleKeyDownExamen}
                    />

                    {showExamenesSug && sugerenciasExamenes.length > 0 && (
                      <div className="absolute z-[110] w-full mt-3 bg-white border border-slate-100 rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in duration-200">
                        {sugerenciasExamenes.map((ex, index) => (
                          <button
                            key={ex.id}
                            type="button"
                            onClick={() =>
                              agregarExamen(ex.nombre, ex.precio, ex.categoria)
                            }
                            className={`w-full px-8 py-4 text-left flex justify-between items-center transition-colors ${
                              selectedIndex === index
                                ? "bg-blue-600 text-white"
                                : "hover:bg-blue-50"
                            }`}
                          >
                            <div className="flex flex-col">
                              <span className="font-bold">{ex.nombre}</span>
                              <span
                                className={`text-[10px] uppercase font-black ${
                                  selectedIndex === index
                                    ? "text-blue-100"
                                    : "text-slate-400"
                                }`}
                              >
                                {ex.categoria}
                              </span>
                            </div>
                            <span
                              className={`font-black ${
                                selectedIndex === index
                                  ? "text-white"
                                  : "text-blue-600"
                              }`}
                            >
                              ${ex.precio.toFixed(2)}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Catálogo por Categorías (Acordeón/Lista Desplegable) */}
                <div className="space-y-3">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">
                    Navegar Catálogo
                  </h3>
                  {listaCategorias.map((cat) => (
                    <div
                      key={cat}
                      className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm"
                    >
                      <button
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className="w-full px-6 py-4 flex justify-between items-center hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-xl ${
                              openCategories.includes(cat)
                                ? "bg-blue-600 text-white"
                                : "bg-blue-50 text-blue-500"
                            }`}
                          >
                            <Layers size={16} />
                          </div>
                          <span className="font-black text-slate-700 text-sm uppercase tracking-tight">
                            {cat}
                          </span>
                        </div>
                        <ChevronDown
                          size={20}
                          className={`text-slate-300 transition-transform duration-300 ${
                            openCategories.includes(cat) ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {openCategories.includes(cat) && (
                        <div className="border-t border-slate-50 bg-slate-50/30 divide-y divide-slate-50 animate-in slide-in-from-top-2">
                          {examenesPredefinidos
                            .filter((e) => e.categoria === cat)
                            .map((ex) => (
                              <button
                                key={ex.id}
                                type="button"
                                onClick={() =>
                                  agregarExamen(
                                    ex.nombre,
                                    ex.precio,
                                    ex.categoria
                                  )
                                }
                                className="w-full px-10 py-4 flex justify-between items-center hover:bg-white group transition-all"
                              >
                                <span className="text-sm font-bold text-slate-600 group-hover:text-blue-700">
                                  {ex.nombre}
                                </span>
                                <span className="text-xs font-black text-slate-400 group-hover:text-blue-500">
                                  ${ex.precio.toFixed(2)}
                                </span>
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Item Personalizado */}
                <div className="p-6 bg-slate-900 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-10 -mt-10" />
                  <p className="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest flex items-center gap-2">
                    <FileText size={12} /> Servicio Especial No Catalogado
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                    <input
                      placeholder="Descripción del servicio..."
                      value={examenPersonalizado.nombre}
                      onChange={(e) =>
                        setExamenPersonalizado({
                          ...examenPersonalizado,
                          nombre: e.target.value,
                        })
                      }
                      className="flex-[3] bg-white/5 border-white/10 border-2 focus:border-blue-500 focus:bg-white/10 rounded-xl px-5 py-3 text-sm outline-none transition-all"
                    />
                    <div className="flex-[1] relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                        $
                      </span>
                      <input
                        placeholder="0.00"
                        type="number"
                        value={examenPersonalizado.precio}
                        onChange={(e) =>
                          setExamenPersonalizado({
                            ...examenPersonalizado,
                            precio: e.target.value,
                          })
                        }
                        className="w-full bg-white/5 border-white/10 border-2 focus:border-blue-500 focus:bg-white/10 rounded-xl pl-8 pr-4 py-3 text-sm outline-none transition-all"
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
                            parseFloat(examenPersonalizado.precio),
                            "Otros"
                          );
                          setExamenPersonalizado({ nombre: "", precio: "" });
                        }
                      }}
                      className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-500 transition-all font-black flex items-center justify-center"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              </div>

              {/* LADO DERECHO: TICKET DE COBRO (ESTÁTICO CON SCROLL INTERNO) */}
              <div className="w-full lg:w-[450px] bg-white flex flex-col border-l border-slate-100 h-full">
                {/* Resumen Header */}
                <div className="p-8 pb-4 shrink-0">
                  <div className="text-center">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                      Resumen de Factura
                    </h3>
                    <div className="h-1 w-12 bg-blue-600 mx-auto rounded-full" />
                  </div>
                </div>

                {/* Lista de Items Seleccionados (Scroll independiente) */}
                <div className="flex-1 overflow-y-auto px-8 space-y-3 custom-scrollbar min-h-0">
                  {examenesSeleccionados.map((ex, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl group animate-in slide-in-from-right-5"
                    >
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => eliminarExamen(i)}
                          className="p-2 bg-white text-slate-300 hover:text-red-500 hover:shadow-md rounded-lg transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                        <div>
                          <p className="text-sm font-black text-slate-800 leading-tight">
                            {ex.nombre}
                          </p>
                          <span className="text-[9px] font-bold text-blue-500 uppercase tracking-tighter">
                            {ex.categoria}
                          </span>
                        </div>
                      </div>
                      <p className="font-black text-slate-700">
                        ${ex.precio.toFixed(2)}
                      </p>
                    </div>
                  ))}

                  {examenesSeleccionados.length === 0 && (
                    <div className="text-center py-20 opacity-20">
                      <Receipt size={64} className="mx-auto mb-4" />
                      <p className="text-xs font-black uppercase tracking-widest">
                        Carrito Vacío
                      </p>
                    </div>
                  )}
                </div>

                {/* Bloque de Totales y Botón (Fijo al fondo) */}
                <div className="p-8 bg-white border-t border-slate-50 shrink-0 space-y-4">
                  {categoriasPresentes.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {categoriasPresentes.map((cat) => (
                        <span
                          key={cat}
                          className="text-[8px] font-black bg-blue-50 text-blue-600 px-2 py-1 rounded-md border border-blue-100 uppercase"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between items-center text-slate-400 font-bold uppercase text-[10px] tracking-widest px-2">
                    <span>Subtotal</span>
                    <span>${calcularTotal().toFixed(2)}</span>
                  </div>

                  <div className="bg-slate-900 p-6 rounded-[2.5rem] text-white shadow-xl">
                    <div className="flex justify-between items-center mb-1 opacity-60">
                      <span className="font-black uppercase text-[10px] tracking-widest">
                        Total Neto
                      </span>
                      <CreditCard size={16} />
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-blue-400">
                        $
                      </span>
                      <span className="text-5xl font-black tracking-tighter tabular-nums">
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
                    className={`w-full py-6 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-sm transition-all shadow-2xl active:scale-[0.97] ${
                      examenesSeleccionados.length > 0 && formData.paciente_id
                        ? "bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700"
                        : "bg-slate-100 text-slate-300 cursor-not-allowed"
                    }`}
                  >
                    Finalizar y Procesar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
}
