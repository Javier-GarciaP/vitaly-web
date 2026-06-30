import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/react-app/index.css";
import App from "@/react-app/App.tsx";
import { Buffer } from 'buffer';
import { initLocalDb } from "@/react-app/services/localDb";

if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
  
  // Override fetch to automatically prepend the WORKER_URL (for cloud sync calls)
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    let [resource, config] = args;
    if (typeof resource === 'string' && resource.startsWith('/api')) {
      const workerUrl = localStorage.getItem('WORKER_URL') || '';
      resource = workerUrl + resource;
      
      // Inject API KEY
      config = config || {};
      config.headers = {
        ...config.headers,
        "x-api-key": "vitaly-super-secret-key"
      };
    }
    return originalFetch(resource, config);
  };
}

// Initialize local SQLite database (only in Tauri)
initLocalDb().then(() => {
  console.log("[Vitaly] App inicializada correctamente.");
}).catch((err) => {
  console.warn("[Vitaly] SQLite no disponible (modo web):", err);
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
