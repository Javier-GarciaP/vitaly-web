import { useEffect, useState, useMemo } from "react";
import {
  Plus,
  Trash2,
  X,
  Search,
  Edit2,
  Receipt,
  ChevronRight,
  UserCheck,
  UserPlus,
  ArrowRight,
  Check
} from "lucide-react";
import { useRef } from "react";

import { useNotification } from "@/react-app/context/NotificationContext";
import { formatCurrency, formatCurrencyInput, cleanCurrencyInput, numberToWords } from "@/utils/currency";
import { getTodayDate } from "@/utils/date";

import FacturasService, { Factura } from "../../services/FacturasService";
import PacientesService, { Paciente } from "../../services/PacientesService";
import ExamenesService, { ExamenPredefinido } from "../../services/ExamenesService";

interface ExamenFactura {
  nombre: string;
  precio: number;
  categoria: string;
  parametros?: string[];
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

  const patientInputRef = useRef<HTMLInputElement>(null);
  const examInputRef = useRef<HTMLInputElement>(null);
  const nombreRef = useRef<HTMLInputElement>(null);
  const cedulaRef = useRef<HTMLInputElement>(null);
  const edadRef = useRef<HTMLInputElement>(null);
  const sexoRef = useRef<HTMLSelectElement>(null);
  const registrarBtnRef = useRef<HTMLButtonElement>(null);

  const matchedPatient = useMemo(() => {
    if (pacienteInput.length < 2) return null;
    return pacientes.find(p => p.nombre.toLowerCase() === pacienteInput.toLowerCase() || p.cedula === pacienteInput);
  }, [pacienteInput, pacientes]);


  useEffect(() => {
    loadFacturas();
    loadPacientes();
    loadExamenesPredefinidos();
  }, []);

  const loadFacturas = async () => {
    try {
      const data = await FacturasService.getAll();
      setFacturas(data);
    } catch (e) { console.error(e); }
  };

  const loadPacientes = async () => {
    try {
      const data = await PacientesService.getAll();
      setPacientes(data);
    } catch (e) { console.error(e); }
  };

  const loadExamenesPredefinidos = async () => {
    try {
      const data = await ExamenesService.getPredefinidos();
      setExamenesPredefinidos(data);
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
      (p.cedula || "").includes(pacienteInput)
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
    setNuevoPaciente({ nombre: p.nombre, cedula: p.cedula || "", edad: p.edad || "", sexo: p.sexo || "" });
    (window as any)._selected_patient_id = p.id;
    setShowSugerencias(false);
    setIsNuevoPaciente(false);
    setSelectedPacienteIndex(0);
    // Autofocus exam search after selection
    setTimeout(() => examInputRef.current?.focus(), 100);
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
      setTimeout(() => nombreRef.current?.focus(), 100);
    } else {
      setTimeout(() => patientInputRef.current?.focus(), 100);
    }
    setIsNuevoPaciente(!isNuevoPaciente);
  };

  const handleRegistrarPaciente = async () => {
    if (!nuevoPaciente.nombre || !nuevoPaciente.sexo) {
      showNotification("error", "Datos Incompletos", "Nombre y Sexo son obligatorios");
      return;
    }
    try {
      const newP = await PacientesService.create(nuevoPaciente);

      (window as any)._selected_patient_id = newP.id;
      setPacienteInput(newP.nombre);
      setIsNuevoPaciente(false);
      loadPacientes();
      showNotification("success", "Paciente Registrado", `${newP.nombre} ha sido añadido y seleccionado`);
      // Focus exam search
      setTimeout(() => examInputRef.current?.focus(), 100);
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
        if (!nuevoPaciente.nombre) {
          showNotification("error", "Datos de Paciente", "Complete el nombre para continuar");
          setIsSaving(false);
          return;
        }
        const newP = await PacientesService.create(nuevoPaciente);
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
      };

      if (editingId) {
        await FacturasService.update(editingId, payload);
        showNotification("success", "Factura Actualizada", `Total: ${formatCurrency(total)}`);
      } else {
        await FacturasService.create(payload);
        showNotification("success", "Factura Generada", `Total: ${formatCurrency(total)}`);
      }

      loadFacturas();
      setShowModal(false);
      resetPOS();

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
          await FacturasService.delete(id);
          showNotification("delete", "Factura Eliminada", "El registro ha sido removido del historial");
          loadFacturas();
        } catch (e: any) {
          console.error(e);
          showNotification("error", "Error Borrado", e.message || "No se pudo eliminar la factura");
        }
      }
    });
  };

  const handleEditarFactura = (f: Factura) => {
    setEditingId(f.id || null);
    setPacienteInput(f.paciente_nombre || "");
    (window as any)._selected_patient_id = f.paciente_id;
    setCarrito(f.examenes || []);
    setFecha(f.fecha || getTodayDate());
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
                  <p className="text-[11px] font-bold text-slate-700 uppercase leading-none mb-1">{f.paciente_nombre || "Desconocido"}</p>
                  <p className="text-[9px] text-slate-400 font-bold font-mono">{f.paciente_cedula || "N/A"}</p>
                </td>
                <td className="px-6 py-4 text-[11px] font-bold text-slate-500">{f.fecha?.split("-").reverse().join("/") || "N/A"}</td>
                <td className="px-6 py-4 text-right font-black text-slate-900 text-xs">${formatCurrency(f.total)}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEditarFactura(f)} className="p-1.5 text-slate-300 hover:text-blue-600"><Edit2 size={13} /></button>
                    <button onClick={() => { if (f.id) handleEliminarFactura(f.id) }} className="p-1.5 text-slate-300 hover:text-rose-600"><Trash2 size={13} /></button>
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
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col h-[85vh] animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-50 flex justify-between items-center shrink-0">
              <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">Punto de Venta / Facturación</p>
              <button onClick={closeModal} className="text-slate-300 hover:text-slate-900 transition-colors"><X size={18} /></button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
              {/* LEFT: SELECTION */}
              <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50/20 text-slate-900">
                {/* PATIENT */}
                <div>
                  <div className="flex justify-between items-center mb-3 px-1">
                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">Identificación del Paciente</label>
                    <button onClick={toggleNuevoPaciente} className="text-[10px] font-black text-blue-600 hover:underline uppercase">
                      {isNuevoPaciente ? "Volver a búsqueda" : "+ Nuevo Paciente"}
                    </button>
                  </div>

                  {!isNuevoPaciente ? (
                    <div className="relative group">
                      <div className="flex items-center gap-2 mb-2">
                        <Search className="text-slate-900" size={16} />
                        <span className="text-[12px] font-black uppercase text-slate-900">Buscar en Registro</span>
                      </div>
                      <input
                        ref={patientInputRef}
                        className={`w-full px-5 py-3 bg-white border-2 ${matchedPatient ? 'border-emerald-600' : 'border-slate-200'} rounded-xl outline-none text-[14px] font-black uppercase focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm placeholder:text-slate-300`}
                        placeholder="NOMBRE O CÉDULA..."
                        value={pacienteInput}
                        onChange={(e) => { setPacienteInput(e.target.value); setShowSugerencias(true); setSelectedPacienteIndex(0); }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            if (showSugerencias && sugerenciasPacientes.length > 0) {
                              seleccionarPaciente(sugerenciasPacientes[selectedPacienteIndex]);
                              e.preventDefault();
                            } else if (matchedPatient) {
                              seleccionarPaciente(matchedPatient);
                              e.preventDefault();
                            } else if (pacienteInput.length >= 2) {
                              toggleNuevoPaciente();
                              e.preventDefault();
                            }
                          } else if (showSugerencias && sugerenciasPacientes.length > 0) {
                            if (e.key === "ArrowDown") {
                              setSelectedPacienteIndex(prev => (prev < sugerenciasPacientes.length - 1 ? prev + 1 : 0));
                              e.preventDefault();
                            } else if (e.key === "ArrowUp") {
                              setSelectedPacienteIndex(prev => (prev > 0 ? prev - 1 : sugerenciasPacientes.length - 1));
                              e.preventDefault();
                            }
                          }
                        }}
                      />

                      {/* STATUS BAR UNDER INPUT */}
                      {pacienteInput.length >= 2 && (
                        <div className={`mt-3 px-4 py-2 rounded-lg flex items-center justify-between border-b-4 shadow-sm animate-in slide-in-from-top-2 ${matchedPatient ? 'bg-emerald-600 border-emerald-800' : 'bg-slate-900 border-slate-950'}`}>
                          <div className="flex items-center gap-3 text-white">
                            {matchedPatient ? <UserCheck size={18} /> : <UserPlus size={18} />}
                            <div className="flex flex-col">
                              <span className="text-[11px] font-black uppercase tracking-tight">
                                {matchedPatient ? 'Paciente Registrado' : 'Paciente No Encontrado'}
                              </span>
                              <span className="text-[9px] font-bold opacity-80 uppercase leading-none">
                                {matchedPatient ? 'ENTER para seleccionar' : 'ENTER para Crear Nuevo'}
                              </span>
                            </div>
                          </div>
                          {matchedPatient && (
                            <div className="bg-white/20 text-white px-2 py-1 rounded text-[10px] font-black uppercase">
                              Listo
                            </div>
                          )}
                        </div>
                      )}

                      {showSugerencias && sugerenciasPacientes.length > 0 && (
                        <div className="absolute z-[160] w-full mt-2 bg-white border-2 border-slate-950 rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-top-2">
                          {sugerenciasPacientes.map((p, idx) => (
                            <button
                              key={p.id}
                              onMouseEnter={() => setSelectedPacienteIndex(idx)}
                              onClick={() => seleccionarPaciente(p)}
                              className={`w-full px-5 py-3 text-left border-b border-slate-100 last:border-0 flex justify-between items-center transition-all ${selectedPacienteIndex === idx ? "bg-blue-600 text-white" : "bg-white"}`}
                            >
                              <div className="flex items-center gap-4">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[14px] font-black ${selectedPacienteIndex === idx ? 'bg-white text-blue-600' : 'bg-slate-900 text-white'}`}>
                                  {p.nombre[0].toUpperCase()}
                                </div>
                                <div>
                                  <p className={`font-black text-[13px] uppercase leading-none ${selectedPacienteIndex === idx ? 'text-white' : 'text-slate-900'}`}>{p.nombre}</p>
                                  <p className={`text-[10px] font-black uppercase font-mono mt-0.5 ${selectedPacienteIndex === idx ? 'text-blue-100' : 'text-slate-400'}`}>{p.cedula}</p>
                                </div>
                              </div>
                              {selectedPacienteIndex === idx && <ArrowRight size={16} className="animate-in slide-in-from-left-4" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-6 rounded-3xl border-2 border-blue-600 shadow-lg animate-in slide-in-from-top-4 duration-500">
                      <div className="md:col-span-4 mb-2">
                        <h3 className="text-[16px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                          <UserPlus size={24} className="text-blue-600" /> Registro de Nuevo Paciente
                        </h3>
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-[10px] font-black text-slate-900 uppercase mb-2 block tracking-widest px-1">Nombre Completo</label>
                        <input
                          ref={nombreRef}
                          className="w-full px-4 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl text-[13px] font-black uppercase outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all shadow-inner"
                          value={nuevoPaciente.nombre}
                          onChange={e => setNuevoPaciente({ ...nuevoPaciente, nombre: e.target.value })}
                          onKeyDown={e => e.key === "Enter" && (e.preventDefault(), cedulaRef.current?.focus())}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-[10px] font-black text-slate-900 uppercase mb-2 block tracking-widest px-1">Cédula</label>
                        <input
                          ref={cedulaRef}
                          className="w-full px-4 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl text-[13px] font-black outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all shadow-inner"
                          value={nuevoPaciente.cedula}
                          onChange={e => setNuevoPaciente({ ...nuevoPaciente, cedula: e.target.value })}
                          onKeyDown={e => e.key === "Enter" && (e.preventDefault(), edadRef.current?.focus())}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-[10px] font-black text-slate-900 uppercase mb-2 block tracking-widest px-1">Edad</label>
                        <input
                          ref={edadRef}
                          className="w-full px-4 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl text-[13px] font-black outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all shadow-inner"
                          placeholder="EX: 30 AÑOS"
                          value={nuevoPaciente.edad}
                          onChange={e => setNuevoPaciente({ ...nuevoPaciente, edad: e.target.value })}
                          onKeyDown={e => e.key === "Enter" && (e.preventDefault(), sexoRef.current?.focus())}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-[10px] font-black text-slate-900 uppercase mb-2 block tracking-widest px-1">Género</label>
                        <select
                          ref={sexoRef}
                          required
                          className="w-full px-4 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl text-[13px] font-black outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all appearance-none cursor-pointer shadow-inner"
                          value={nuevoPaciente.sexo}
                          onChange={e => setNuevoPaciente({ ...nuevoPaciente, sexo: e.target.value })}
                          onKeyDown={e => e.key === "Enter" && (e.preventDefault(), registrarBtnRef.current?.focus())}
                        >
                          <option value="">- SELECCIONAR -</option>
                          <option value="M">MASCULINO</option>
                          <option value="F">FEMENINO</option>
                          <option value="Otro">OTRO</option>
                        </select>
                      </div>

                      <div className="md:col-span-4 mt-2">
                        <button
                          ref={registrarBtnRef}
                          onClick={handleRegistrarPaciente}
                          className="w-full py-3 bg-slate-900 text-white text-[13px] font-black uppercase rounded-2xl hover:bg-blue-600 transition-all shadow-md flex items-center justify-center gap-3 active:scale-95 border-b-4 border-slate-950"
                        >
                          <Check size={18} /> Registrar y Continuar
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* EXAM SELECTION SECTION */}
                <div className="mt-8">
                  <div className="flex items-center gap-3 mb-3 px-1">
                    <Search className="text-slate-900" size={18} />
                    <label className="text-[12px] font-black text-slate-900 uppercase tracking-widest">Añadir Estudios Médicos</label>
                    {carrito.length > 0 && (
                      <span className="bg-blue-600 text-white text-[10px] px-3 py-1 rounded-full font-black uppercase animate-in zoom-in shadow-sm">
                        {carrito.length} Items
                      </span>
                    )}
                  </div>

                  <div className="relative mb-6">
                    <input
                      ref={examInputRef}
                      className="w-full px-5 py-3.5 bg-white border-2 border-slate-200 rounded-xl outline-none text-[16px] font-black uppercase focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm placeholder:text-slate-300"
                      placeholder="ESCRIBA EL EXAMEN..."
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
                            addToCarrito(ex.nombre, ex.precio, ex.categoria || "Misceláneos", ex.parametros);
                            e.preventDefault();
                          }
                        }
                      }}
                    />

                    {busquedaExamen && sugerenciasExamenes.length > 0 && (
                      <div className="absolute z-[160] w-full mt-2 bg-white border-2 border-slate-950 rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-top-2">
                        {sugerenciasExamenes.map((ex, idx) => (
                          <button
                            key={ex.id}
                            onMouseEnter={() => setSelectedExamenIndex(idx)}
                            onClick={() => addToCarrito(ex.nombre, ex.precio, ex.categoria || "Misceláneos", ex.parametros)}
                            className={`w-full px-6 py-4 text-left border-b border-slate-100 last:border-0 flex justify-between items-center transition-all ${selectedExamenIndex === idx ? "bg-blue-600 text-white" : "bg-white"}`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[16px] font-black ${selectedExamenIndex === idx ? 'bg-white text-blue-600' : 'bg-slate-900 text-white'}`}>
                                {ex.nombre[0].toUpperCase()}
                              </div>
                              <div>
                                <p className={`font-black text-[14px] uppercase leading-none mb-1 ${selectedExamenIndex === idx ? 'text-white' : 'text-slate-900'}`}>{ex.nombre}</p>
                                <p className={`text-[10px] font-black uppercase opacity-60 ${selectedExamenIndex === idx ? 'text-blue-100' : 'text-slate-500'}`}>{ex.categoria}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-5">
                              <span className={`font-black text-[16px] ${selectedExamenIndex === idx ? 'text-white' : 'text-slate-900'}`}>${formatCurrency(ex.precio)}</span>
                              {selectedExamenIndex === idx && <ArrowRight size={20} className="animate-in slide-in-from-left-4" />}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-xl relative overflow-hidden group">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">Servicio Personalizado</p>
                    <div className="flex flex-col md:flex-row gap-3 relative z-10">
                      <input
                        placeholder="DESCRIPCIÓN..."
                        className="flex-[2] bg-white/10 border-2 border-white/10 rounded-lg px-4 py-2 text-[12px] font-black outline-none focus:border-blue-500 focus:bg-white/20 transition-all uppercase"
                        value={customExamen.nombre}
                        onChange={e => setCustomExamen({ ...customExamen, nombre: e.target.value })}
                      />
                      <input
                        placeholder="$0"
                        className="flex-1 bg-white/10 border-2 border-white/10 rounded-lg px-4 py-2 text-[12px] font-black outline-none focus:border-blue-500 focus:bg-white/20 transition-all"
                        value={customExamen.precio}
                        onChange={e => setCustomExamen({ ...customExamen, precio: formatCurrencyInput(e.target.value) })}
                      />
                      <button
                        onClick={() => { if (customExamen.nombre && customExamen.precio) { addToCarrito(customExamen.nombre, parseInt(cleanCurrencyInput(customExamen.precio)), "Otros"); setCustomExamen({ nombre: "", precio: "" }); } }}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 rounded-lg transition-all flex items-center justify-center shadow-lg active:scale-95"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE: FINAL SUMMARY TICKET */}
              <div className="w-full lg:w-[350px] border-t lg:border-t-0 lg:border-l border-slate-100 bg-white flex flex-col shadow-[-10px_0_20px_rgba(0,0,0,0.02)]">
                <div className="p-5 border-b border-slate-50 flex items-center justify-between shrink-0 bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <Receipt size={18} className="text-slate-900" />
                    <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest leading-none">Resumen</span>
                  </div>
                  <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="text-[10px] font-black text-slate-900 border-none outline-none focus:ring-0 bg-transparent" />
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                  {carrito.map((item, i) => (
                    <div key={i} className="flex justify-between items-start group animate-in slide-in-from-right-2 border-b border-slate-50 pb-3 last:border-0">
                      <div className="flex items-start gap-2 flex-1">
                        <button onClick={() => removeFromCarrito(i)} className="mt-0.5 p-1.5 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-100 transition-all"><Trash2 size={14} /></button>
                        <div>
                          <p className="text-[11px] font-black text-slate-900 uppercase leading-none mt-1">{item.nombre}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-tight">{item.categoria}</p>
                        </div>
                      </div>
                      <span className="text-[12px] font-black text-slate-900 px-2 py-0.5 bg-slate-50 rounded italic">${formatCurrency(item.precio)}</span>
                    </div>
                  ))}

                  {carrito.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center opacity-10 py-10">
                      <Receipt size={60} />
                      <p className="text-[12px] font-black uppercase mt-4 tracking-widest text-center">Ticket<br />Vacío</p>
                    </div>
                  )}
                </div>

                <div className="p-6 border-t border-slate-100 space-y-6">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Total a Cobrar</span>
                    <div className="bg-slate-900 p-4 rounded-2xl shadow-lg border-b-4 border-slate-950 relative overflow-hidden group">
                      <p className="text-2xl font-black text-white text-center tracking-tighter">${formatCurrency(total)}</p>
                    </div>
                    {total > 0 && (
                      <p className="text-[9px] font-black text-blue-600 text-center uppercase tracking-tight">
                        SON: {numberToWords(total)}
                      </p>
                    )}
                  </div>

                  <button
                    disabled={carrito.length === 0 || isSaving}
                    onClick={handleGuardarFactura}
                    className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all shadow-lg flex items-center justify-center gap-3 active:scale-95 border-b-4 ${carrito.length > 0 ? "bg-emerald-600 text-white hover:bg-emerald-500 border-emerald-800" : "bg-slate-200 text-slate-400 cursor-not-allowed border-slate-300 shadow-none"}`}
                  >
                    {isSaving ? <span className="animate-pulse text-[10px]">PROCESANDO...</span> : <>{editingId ? "Actualizar" : "Vender"} <ChevronRight size={16} /></>}
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
