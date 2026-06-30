import { useState } from "react";
import { Cloud, DownloadCloud, UploadCloud, AlertTriangle, RefreshCcw } from "lucide-react";
import { useNotification } from "@/react-app/context/NotificationContext";
import { pullFromCloud, pushToCloud } from "@/react-app/services/syncService";

export function SyncModule() {
  const { showNotification, confirmAction } = useNotification();
  const [syncing, setSyncing] = useState<"idle" | "push" | "pull">("idle");
  const [log, setLog] = useState<string[]>([]);
  
  const workerUrl = localStorage.getItem("WORKER_URL") || "";
  const isCop = workerUrl.includes("cop");
  const isUsd = workerUrl.includes("usd");
  const currentDbName = isCop ? "Vitaly COP (Pesos)" : isUsd ? "Vitaly USD (Dólares)" : "Desconocida";

  const addLog = (msg: string) => {
    setLog(prev => [msg, ...prev].slice(0, 10)); // keep last 10
  };

  const handlePush = async () => {
    confirmAction({
      title: "Respaldar a la Nube",
      message: `¿Estás seguro de subir todos los datos locales a la base de datos ${currentDbName}?`,
      variant: "info",
      onConfirm: async () => {
        setSyncing("push");
        addLog("Iniciando respaldo hacia Cloudflare...");
        try {
          const result = await pushToCloud();
          if (result.errors.length > 0) {
            showNotification("error", "Respaldo Incompleto", "Ocurrieron errores al subir algunos registros.");
            addLog(`❌ Errores: ${result.errors.length}`);
            result.errors.forEach(e => addLog(`- ${e}`));
          } else {
            showNotification("success", "Respaldo Exitoso", `Se subieron ${result.pushed} registros a la nube.`);
            addLog(`✅ Respaldo exitoso. Registros subidos: ${result.pushed}`);
          }
        } catch (error: any) {
          showNotification("error", "Error de Respaldo", "No se pudo comunicar con el servidor.");
          addLog(`❌ Error fatal: ${error.message}`);
        } finally {
          setSyncing("idle");
        }
      }
    });
  };

  const handlePull = async () => {
    confirmAction({
      title: "Restaurar desde la Nube",
      message: `⚠️ ADVERTENCIA: Esta acción descargará los datos de ${currentDbName} y sobrescribirá los datos locales existentes. ¿Deseas continuar?`,
      variant: "danger",
      onConfirm: async () => {
        setSyncing("pull");
        addLog("Iniciando descarga desde Cloudflare...");
        try {
          const result = await pullFromCloud();
          if (result.errors.length > 0) {
            showNotification("error", "Restauración Incompleta", "Ocurrieron errores al descargar algunos registros.");
            addLog(`⚠️ Errores: ${result.errors.length}`);
            result.errors.forEach(e => addLog(`- ${e}`));
          } else {
            showNotification("success", "Restauración Exitosa", `Se descargaron ${result.pulled} registros.`);
            addLog(`✅ Restauración exitosa. Registros actualizados: ${result.pulled}`);
          }
        } catch (error: any) {
          showNotification("error", "Error de Restauración", "No se pudo comunicar con el servidor.");
          addLog(`❌ Error fatal: ${error.message}`);
        } finally {
          setSyncing("idle");
        }
      }
    });
  };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden p-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-50">
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
          <Cloud size={24} />
        </div>
        <div>
          <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-900">Respaldo y Sincronización</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1">
            Conectado actualmente a: <span className="text-blue-600 font-black">{currentDbName}</span>
          </p>
        </div>
      </div>

      {!workerUrl && (
        <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600">
          <AlertTriangle size={20} />
          <p className="text-[10px] font-bold uppercase tracking-wide">
            No estás conectado a ningún entorno. Inicia sesión para sincronizar.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* PUSH CARD */}
        <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 text-slate-900">
              <UploadCloud size={20} className="text-blue-500" />
              <h3 className="text-[11px] font-black uppercase tracking-widest">Respaldar a la Nube</h3>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-relaxed mb-6">
              Envía los pacientes, facturas y exámenes creados en tu computadora hacia Cloudflare. Protege tu información ante pérdidas.
            </p>
          </div>
          <button
            onClick={handlePush}
            disabled={syncing !== "idle" || !workerUrl}
            className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all shadow-md ${
              syncing === "push" ? "bg-slate-200 text-slate-400" : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200"
            }`}
          >
            {syncing === "push" ? <RefreshCcw className="animate-spin" size={16} /> : <UploadCloud size={16} />}
            {syncing === "push" ? "Subiendo..." : "Subir Datos"}
          </button>
        </div>

        {/* PULL CARD */}
        <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 text-slate-900">
              <DownloadCloud size={20} className="text-emerald-500" />
              <h3 className="text-[11px] font-black uppercase tracking-widest">Restaurar desde la Nube</h3>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-relaxed mb-6">
              Descarga todos los datos existentes en Cloudflare a esta computadora. <span className="text-rose-500 font-black">Atención: Esto puede sobrescribir datos locales.</span>
            </p>
          </div>
          <button
            onClick={handlePull}
            disabled={syncing !== "idle" || !workerUrl}
            className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all shadow-md ${
              syncing === "pull" ? "bg-slate-200 text-slate-400" : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200"
            }`}
          >
            {syncing === "pull" ? <RefreshCcw className="animate-spin" size={16} /> : <DownloadCloud size={16} />}
            {syncing === "pull" ? "Descargando..." : "Bajar Datos"}
          </button>
        </div>
      </div>

      {/* LOGS */}
      {log.length > 0 && (
        <div className="bg-slate-900 rounded-2xl p-6 text-slate-300 font-mono text-[10px] space-y-2 max-h-40 overflow-y-auto">
          {log.map((msg, i) => (
            <div key={i} className="flex items-start gap-2 border-b border-white/5 pb-2 last:border-0 last:pb-0">
              <span className="text-slate-500 shrink-0">[{new Date().toLocaleTimeString()}]</span>
              <span>{msg}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
