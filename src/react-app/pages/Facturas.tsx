import { useEffect, useState, useMemo } from "react";
import {
  Plus,
  Trash2,
  X,
  Search,
  Edit2,
  Receipt,
  ChevronRight
} from "lucide-react";

import { useNotification } from "@/react-app/context/NotificationContext";
import { formatCurrency, formatCurrencyInput, cleanCurrencyInput, numberToWords } from "@/utils/currency";
import { getTodayDate } from "@/utils/date";

interface Paciente {
  id: number;
  cedula: string;
  nombre: string;
  sexo: string;
  edad: string;
}

interface ExamenPredefinido {
  id: number;
  nombre: string;
  precio: number;
  categoria: string;
  parametros?: string[];
}

interface ExamenFactura {
  nombre: string;
  precio: number;
  categoria: string;
  parametros?: string[];
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
  const { showNotification, confirmAction } = useNotification();
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [examenesPredefinidos, setExamenesPredefinidos] = useState<ExamenPredefinido[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  // POS State
  const [pacienteInput, setPacienteInput] = useState("");
  const [showSugerencias, setShowSugerencias] = useState(false);
  const [isNuevoPaciente, setIsNuevoPaciente] = useState(false);
  const [nuevoPaciente, setNuevoPaciente] = useState({ nombre: "", cedula: "", edad: "", sexo: "" });
  const [carrito, setCarrito] = useState<ExamenFactura[]>([]);
  const [fecha, setFecha] = useState(getTodayDate());
  const [isSaving, setIsSaving] = useState(false);
  const [busquedaExamen, setBusquedaExamen] = useState("");
  const [selectedExamenIndex, setSelectedExamenIndex] = useState(0);
  const [selectedPacienteIndex, setSelectedPacienteIndex] = useState(0);
  const [customExamen, setCustomExamen] = useState({ nombre: "", precio: "" });


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
    } catch (e) { console.error(e); }
  };

  const loadPacientes = async () => {
    try {
      const res = await fetch("/api/pacientes");
      const data = await res.json();
      setPacientes(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  };

  const loadExamenesPredefinidos = async () => {
    try {
      const res = await fetch("/api/examenes-predefinidos");
      if (!res.ok) throw new Error("Error al cargar exámenes predefinidos");
      const data = await res.json();
      setExamenesPredefinidos(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  };

  const facturasFiltradas = useMemo(() => {
    return facturas.filter(f =>
      (f.paciente_nombre?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (f.paciente_cedula || "").includes(searchTerm)
    );
  }, [searchTerm, facturas]);

  const sugerenciasPacientes = useMemo(() => {
    if (pacienteInput.length < 2) return [];
    return pacientes.filter(p =>
      p.nombre.toLowerCase().includes(pacienteInput.toLowerCase()) ||
      p.cedula.includes(pacienteInput)
    ).slice(0, 5);
  }, [pacienteInput, pacientes]);

  const sugerenciasExamenes = useMemo(() => {
    if (!busquedaExamen) return [];
    return examenesPredefinidos.filter(e =>
      e.nombre.toLowerCase().includes(busquedaExamen.toLowerCase())
    ).slice(0, 5);
  }, [busquedaExamen, examenesPredefinidos]);

  const openModal = () => {
    setEditingId(null);
    setPacienteInput("");
    setCarrito([]);
    setIsNuevoPaciente(false);
    setFecha(getTodayDate());
    setShowModal(true);
    (window as any)._selected_patient_id = null;
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const seleccionarPaciente = (p: Paciente) => {
    setPacienteInput(p.nombre);
    setNuevoPaciente({ nombre: p.nombre, cedula: p.cedula, edad: p.edad || "", sexo: p.sexo || "" });
    (window as any)._selected_patient_id = p.id;
    setShowSugerencias(false);
    setIsNuevoPaciente(false);
    setSelectedPacienteIndex(0);
  };


  const toggleNuevoPaciente = () => {
    if (!isNuevoPaciente) {
      const input = pacienteInput.trim();
      const esCedula = /^\d+$/.test(input);
      setNuevoPaciente({
        nombre: esCedula ? "" : input,
        cedula: esCedula ? input : "",
        edad: "",
        sexo: ""
      });
      (window as any)._selected_patient_id = null;
    }
    setIsNuevoPaciente(!isNuevoPaciente);
  };

  const handleRegistrarPaciente = async () => {
    if (!nuevoPaciente.nombre || !nuevoPaciente.cedula || !nuevoPaciente.sexo) {
      showNotification("error", "Datos Incompletos", "Nombre, Cédula y Sexo son obligatorios");
      return;
    }
    try {
      const res = await fetch("/api/pacientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoPaciente)
      });
      if (!res.ok) throw new Error("Error al guardar paciente");
      const newP = (await res.json()) as Paciente;

      (window as any)._selected_patient_id = newP.id;
      setPacienteInput(newP.nombre);
      setIsNuevoPaciente(false);
      loadPacientes();
      showNotification("success", "Paciente Registrado", `${newP.nombre} ha sido añadido y seleccionado`);
    } catch (e) {
      console.error(e);
      showNotification("error", "Error", "No se pudo registrar al paciente");
    }
  };

  const addToCarrito = (nombre: string, precio: number, categoria: string, parametros?: string[]) => {
    setCarrito([...carrito, { nombre, precio, categoria, parametros }]);
    setBusquedaExamen("");
    setSelectedExamenIndex(0);
  };

  const removeFromCarrito = (index: number) => {
    setCarrito(carrito.filter((_, i) => i !== index));
  };

  const total = carrito.reduce((sum, item) => sum + item.precio, 0);

  const resetPOS = () => {
    setEditingId(null);
    setPacienteInput("");
    setCarrito([]);
    setIsNuevoPaciente(false);
    setBusquedaExamen("");
    (window as any)._selected_patient_id = null;
  };

  const handleGuardarFactura = async () => {
    if (carrito.length === 0) return;

    let patientId = (window as any)._selected_patient_id;

    setIsSaving(true);
    try {
      if (isNuevoPaciente && !patientId) {
        if (!nuevoPaciente.nombre || !nuevoPaciente.cedula) {
          showNotification("error", "Datos de Paciente", "Complete nombre y cédula para continuar");
          setIsSaving(false);
          return;
        }
        const resP = await fetch("/api/pacientes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nuevoPaciente)
        });
        if (!resP.ok) throw new Error("Error al guardar paciente");
        const newP = (await resP.json()) as Paciente;
        patientId = newP.id;
        (window as any)._selected_patient_id = patientId;
      }

      if (!patientId) {
        showNotification("info", "Falta Paciente", "Debe elegir o registrar un paciente");
        setIsSaving(false);
        return;
      }

      const payload = {
        paciente_id: patientId,
        examenes: carrito,
        total,
        fecha,
        categorias: [...new Set(carrito.map(c => c.categoria))]
      };

      const url = editingId ? `/api/facturas/${editingId}` : "/api/facturas";
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showNotification("success", editingId ? "Factura Actualizada" : "Factura Generada", `Total: ${formatCurrency(total)}`);
        loadFacturas();
        setShowModal(false);
        resetPOS();
      }
    } catch (e) {
      console.error(e);
      showNotification("error", "Error", "Error en el proceso de facturación");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEliminarFactura = async (id: number) => {
    confirmAction({
      title: "Eliminar Factura",
      message: "¿Estás seguro de eliminar este registro? Esta acción removerá permanentemente la factura del historial.",
      variant: "danger",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/facturas/${id}`, { method: "DELETE" });
          if (res.ok) {
            showNotification("delete", "Factura Eliminada", "El registro ha sido removido del historial");
            loadFacturas();
          }
        } catch (e) {
          console.error(e);
          showNotification("error", "Error", "No se pudo eliminar la factura");
        }
      }
    });
  };

  const handleEditarFactura = (f: Factura) => {
    setEditingId(f.id);
    setPacienteInput(f.paciente_nombre);
    (window as any)._selected_patient_id = f.paciente_id;
    setCarrito(f.examenes);
    setFecha(f.fecha);
    setShowModal(true);
  };

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex items-end justify-between border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-sm font-bold text-slate-900 uppercase tracking-[0.2em]">Facturación</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1">Caja y control de ingresos</p>
        </div>
        <button onClick={openModal} className="text-[10px] font-bold uppercase text-blue-600 flex items-center gap-2">
          <Plus size={14} /> Nueva Entrada
        </button>
      </div>

      {/* SEARCH */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
        <input
          type="text" placeholder="BUSCAR PACIENTE..." value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-100 rounded-xl outline-none text-[11px] font-bold uppercase placeholder:text-slate-300 shadow-sm"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Paciente</th>
              <th className="px-6 py-4">Fecha</th>
              <th className="px-6 py-4 text-right">Total</th>
              <th className="px-6 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {facturasFiltradas.map((f) => (
              <tr key={f.id} className="group hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono text-[10px] text-slate-400">#F-{f.id}</td>
                <td className="px-6 py-4">
                  <p className="text-[11px] font-bold text-slate-700 uppercase leading-none mb-1">{f.paciente_nombre}</p>
                  <p className="text-[9px] text-slate-400 font-bold font-mono">{f.paciente_cedula}</p>
                </td>
                <td className="px-6 py-4 text-[11px] font-bold text-slate-500">{f.fecha?.split("-").reverse().join("/") || "N/A"}</td>
                <td className="px-6 py-4 text-right font-black text-slate-900 text-xs">${formatCurrency(f.total)}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEditarFactura(f)} className="p-1.5 text-slate-300 hover:text-blue-600"><Edit2 size={13} /></button>
                    <button onClick={() => handleEliminarFactura(f.id)} className="p-1.5 text-slate-300 hover:text-rose-600"><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* POS MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/10 backdrop-blur-sm flex items-center justify-center z-[150] p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center shrink-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Punto de Venta / Facturación</p>
              <button onClick={closeModal} className="text-slate-300 hover:text-slate-900 transition-colors"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
              {/* LEFT: SELECTION */}
              <div className="flex-1 p-8 overflow-y-auto space-y-8 bg-slate-50/20">
                {/* PATIENT */}
                <div>
                  <div className="flex justify-between items-center mb-4 px-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Paciente</label>
                    <button onClick={toggleNuevoPaciente} className="text-[9px] font-bold text-blue-600 hover:underline uppercase">
                      {isNuevoPaciente ? "Volver a búsqueda" : "+ Nuevo Paciente"}
                    </button>
                  </div>

                  {!isNuevoPaciente ? (
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                      <input
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-100 rounded-xl outline-none text-[11px] font-bold uppercase focus:border-slate-300 shadow-sm"
                        placeholder="BUSCAR NOMBRE O CÉDULA..."
                        value={pacienteInput}
                        onChange={(e) => { setPacienteInput(e.target.value); setShowSugerencias(true); setSelectedPacienteIndex(0); }}
                        onKeyDown={(e) => {
                          if (showSugerencias && sugerenciasPacientes.length > 0) {
                            if (e.key === "ArrowDown") {
                              setSelectedPacienteIndex(prev => (prev < sugerenciasPacientes.length - 1 ? prev + 1 : 0));
                              e.preventDefault();
                            } else if (e.key === "ArrowUp") {
                              setSelectedPacienteIndex(prev => (prev > 0 ? prev - 1 : sugerenciasPacientes.length - 1));
                              e.preventDefault();
                            } else if (e.key === "Enter") {
                              seleccionarPaciente(sugerenciasPacientes[selectedPacienteIndex]);
                              e.preventDefault();
                            }
                          }
                        }}
                      />
                      {showSugerencias && sugerenciasPacientes.length > 0 && (
                        <div className="absolute z-[160] w-full mt-1 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden">
                          {sugerenciasPacientes.map((p, idx) => (
                            <button
                              key={p.id}
                              onMouseEnter={() => setSelectedPacienteIndex(idx)}
                              onClick={() => seleccionarPaciente(p)}
                              className={`w-full px-4 py-3 text-left border-b border-slate-50 last:border-0 flex justify-between items-center transition-colors ${selectedPacienteIndex === idx ? "bg-slate-50 border-l-4 border-l-blue-500" : "bg-white"}`}
                            >
                              <span className="font-bold text-[10px] text-slate-700 uppercase">{p.nombre}</span>
                              <span className="text-[8px] font-bold text-slate-400 uppercase font-mono">{p.cedula}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm animate-in slide-in-from-top-2">
                      <div className="md:col-span-2">
                        <label className="text-[8px] font-bold text-slate-400 uppercase ml-1">Nombre</label>
                        <input className="w-full px-3 py-2 bg-slate-50 border-none rounded-lg text-[10px] font-bold uppercase outline-none focus:ring-1 focus:ring-blue-100" value={nuevoPaciente.nombre} onChange={e => setNuevoPaciente({ ...nuevoPaciente, nombre: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-[8px] font-bold text-slate-400 uppercase ml-1">Cédula</label>
                        <input className="w-full px-3 py-2 bg-slate-50 border-none rounded-lg text-[10px] font-bold outline-none focus:ring-1 focus:ring-blue-100" value={nuevoPaciente.cedula} onChange={e => setNuevoPaciente({ ...nuevoPaciente, cedula: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-[8px] font-bold text-slate-400 uppercase ml-1">Edad</label>
                        <input className="w-full px-3 py-2 bg-slate-50 border-none rounded-lg text-[10px] font-bold outline-none focus:ring-1 focus:ring-blue-100" value={nuevoPaciente.edad} onChange={e => setNuevoPaciente({ ...nuevoPaciente, edad: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-[8px] font-bold text-slate-400 uppercase ml-1">Sexo</label>
                        <select
                          required
                          className="w-full px-3 py-2 bg-slate-50 border-none rounded-lg text-[10px] font-bold outline-none focus:ring-1 focus:ring-blue-100 appearance-none cursor-pointer"
                          value={nuevoPaciente.sexo}
                          onChange={e => setNuevoPaciente({ ...nuevoPaciente, sexo: e.target.value })}
                        >
                          <option value="">-</option>
                          <option value="M">M</option>
                          <option value="F">F</option>
                        </select>
                      </div>
                      <div className="md:col-span-4 mt-2">
                        <button
                          onClick={handleRegistrarPaciente}
                          className="w-full py-2.5 bg-blue-600 text-white text-[10px] font-bold uppercase rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                        >
                          Guardar y Seleccionar Paciente
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* EXAMS */}
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-4 block px-1">Añadir Estudios</label>
                  <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-100 rounded-xl outline-none text-[11px] font-bold uppercase focus:border-slate-300 shadow-sm"
                      placeholder="BUSCAR EXAMEN (GLICEMIA, HEMATOLOGIA...)"
                      value={busquedaExamen}
                      onChange={(e) => { setBusquedaExamen(e.target.value); setSelectedExamenIndex(0); }}
                      onKeyDown={(e) => {
                        if (sugerenciasExamenes.length > 0) {
                          if (e.key === "ArrowDown") {
                            setSelectedExamenIndex((prev) => (prev < sugerenciasExamenes.length - 1 ? prev + 1 : 0));
                            e.preventDefault();
                          } else if (e.key === "ArrowUp") {
                            setSelectedExamenIndex((prev) => (prev > 0 ? prev - 1 : sugerenciasExamenes.length - 1));
                            e.preventDefault();
                          } else if (e.key === "Enter") {
                            const ex = sugerenciasExamenes[selectedExamenIndex];
                            addToCarrito(ex.nombre, ex.precio, ex.categoria, ex.parametros);
                            e.preventDefault();
                          }
                        }
                      }}
                    />
                    {busquedaExamen && sugerenciasExamenes.length > 0 && (
                      <div className="absolute z-[160] w-full mt-1 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden">
                        {sugerenciasExamenes.map((ex, idx) => (
                          <button
                            key={ex.id}
                            onMouseEnter={() => setSelectedExamenIndex(idx)}
                            onClick={() => addToCarrito(ex.nombre, ex.precio, ex.categoria, ex.parametros)}
                            className={`w-full px-4 py-3 text-left border-b border-slate-50 last:border-0 flex justify-between items-center transition-colors ${selectedExamenIndex === idx ? "bg-slate-50 border-l-4 border-l-blue-500" : "bg-white"}`}
                          >
                            <div>
                              <p className="font-bold text-[10px] text-slate-700 uppercase">{ex.nombre}</p>
                              <p className="text-[8px] font-bold text-slate-400 uppercase">{ex.categoria}</p>
                            </div>
                            <span className="font-bold text-[10px] text-blue-600">${formatCurrency(ex.precio)}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl">
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-4">Servicio Personalizado</p>
                    <div className="flex gap-2">
                      <input placeholder="DESCRIPCIÓN" className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[10px] font-bold outline-none focus:border-blue-500" value={customExamen.nombre} onChange={e => setCustomExamen({ ...customExamen, nombre: e.target.value })} />
                      <input placeholder="$0" className="w-20 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[10px] font-bold outline-none focus:border-blue-500" value={customExamen.precio} onChange={e => setCustomExamen({ ...customExamen, precio: formatCurrencyInput(e.target.value) })} />
                      <button onClick={() => { if (customExamen.nombre && customExamen.precio) { addToCarrito(customExamen.nombre, parseInt(cleanCurrencyInput(customExamen.precio)), "Otros"); setCustomExamen({ nombre: "", precio: "" }); } }} className="bg-blue-600 hover:bg-blue-500 p-2 rounded-lg transition-colors"><Plus size={16} /></button>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: TICKET */}
              <div className="w-full lg:w-[380px] border-t lg:border-t-0 lg:border-l border-slate-50 bg-white flex flex-col">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <Receipt size={18} className="text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Resumen</span>
                  </div>
                  <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="text-[10px] font-bold text-slate-400 border-none outline-none focus:ring-0 bg-transparent" />
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-3">
                  {carrito.map((item, i) => (
                    <div key={i} className="flex justify-between items-center group animate-in slide-in-from-right-2">
                      <div className="flex items-center gap-2">
                        <button onClick={() => removeFromCarrito(i)} className="p-1 hover:bg-rose-50 text-rose-300 hover:text-rose-500 rounded-md transition-all"><Trash2 size={12} /></button>
                        <div>
                          <p className="text-[10px] font-bold text-slate-700 uppercase leading-none">{item.nombre}</p>
                          <p className="text-[8px] text-slate-400 font-bold uppercase mt-1">{item.categoria}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-900">${formatCurrency(item.precio)}</span>
                    </div>
                  ))}
                  {carrito.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center opacity-20">
                      <Receipt size={32} />
                      <p className="text-[10px] font-bold uppercase mt-2">Ticket Vacío</p>
                    </div>
                  )}
                </div>

                <div className="p-8 border-t border-slate-50 space-y-6">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Monto Total</span>
                    <div className="text-right">
                      <p className="text-2xl font-black text-slate-900 tracking-tighter">${formatCurrency(total)}</p>
                      {total > 0 && <p className="text-[8px] font-bold text-slate-300 italic uppercase mt-1">Son: {numberToWords(total)}</p>}
                    </div>
                  </div>

                  <button
                    disabled={carrito.length === 0 || isSaving}
                    onClick={handleGuardarFactura}
                    className={`w-full py-4 rounded-2xl font-bold uppercase tracking-[0.2em] text-[11px] transition-all shadow-xl shadow-slate-100 flex items-center justify-center gap-2 ${carrito.length > 0 ? "bg-slate-900 text-white hover:bg-slate-800" : "bg-slate-50 text-slate-300 cursor-not-allowed shadow-none"}`}
                  >
                    {isSaving ? <span className="animate-pulse">Procesando...</span> : <>{editingId ? "Actualizar" : "Completar Venta"} <ChevronRight size={16} /></>}
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
