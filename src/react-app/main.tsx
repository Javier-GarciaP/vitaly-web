import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/react-app/index.css";
import App from "@/react-app/App.tsx";
import { Buffer } from 'buffer';

if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
  
  // Override fetch to automatically prepend the WORKER_URL
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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
