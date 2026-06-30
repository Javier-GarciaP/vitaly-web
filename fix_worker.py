import re

with open("src/worker/index.ts", "r") as f:
    content = f.read()

# Fix the broken app.get("/v/:uuid") block
start = content.find('app.get("/v/:uuid", async (c) => {')
end = content.find('// --- EVOLUCIÓN PACIENTE ---')

replacement = """app.get("/v/:uuid", async (c) => {
  const uuid = c.req.param("uuid");
  const result = await c.env.DB.prepare(
    `
    SELECT e.tipo, e.fecha, e.estado, e.resultados, p.nombre as paciente_nombre, p.cedula as paciente_cedula
    FROM examenes e JOIN pacientes p ON e.paciente_id = p.id WHERE e.uuid = ?
  `
  )
    .bind(uuid)
    .first();

  if (!result) {
    return c.html(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Validación Fallida</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div class="max-w-md w-full bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl text-center">
          <div class="text-[40px] mb-6">⚠️</div>
          <h1 class="text-[11px] font-black uppercase tracking-[0.4em] text-slate-900 mb-4">Validación Fallida</h1>
          <p class="text-[11px] text-slate-400 font-bold leading-relaxed uppercase tracking-wider">El documento consultado no figura en nuestros registros maestros.</p>
          <div class="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-100/50">
            <p class="text-[8px] font-black text-slate-300 uppercase mb-3 tracking-widest text-center">ID de Rastreo</p>
            <p class="text-[9px] font-mono text-slate-500 break-all text-center">${uuid}</p>
          </div>
        </div>
      </body>
      </html>
    `, 404);
  }

  const resultados = result.resultados ? JSON.parse((result as any).resultados) : {};

  // Función recursiva básica para renderizar valores
  const renderValue = (val: any): string => {
    if (val === null || val === undefined) return "-";
    if (typeof val === 'object') {
      if (Array.isArray(val)) {
        return val.map(v => `<div class="bg-slate-50 p-2 my-1 rounded">${renderValue(v)}</div>`).join('');
      }
      return Object.entries(val).map(([k, v]) => {
        if (k === 'antibiograma_list' || k === 'observacion' || k === 'nombre_examen') return '';
        return `<div class="flex justify-between border-b border-slate-100 pb-1 mb-1">
          <span class="text-[9px] font-black text-slate-400 uppercase tracking-tighter">${k.replace(/_/g, ' ')}</span>
          <span class="text-[10px] font-bold text-slate-800 uppercase">${String(v)}</span>
        </div>`;
      }).join('');
    }
    return String(val);
  };

  const resultadosHtml = Object.entries(resultados).map(([key, val]) => {
    if (key === 'antibiograma_list' || key === 'observacion') return '';
    return `
      <div class="flex flex-col sm:flex-row justify-between py-4 border-b border-slate-50">
        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">${key.replace(/_/g, ' ')}</span>
        <span class="text-[12px] font-black text-slate-900 uppercase">${renderValue(val)}</span>
      </div>
    `;
  }).join('');

  return c.html(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Laboratorio Vitaly - Certificado Verificado</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="min-h-screen bg-slate-50/30 p-4 md:p-10 font-sans flex flex-col items-center">
      <div class="max-w-4xl w-full bg-white p-8 md:p-16 rounded-[4rem] shadow-2xl border border-white">
        
        <div class="flex flex-col items-center mb-16 text-center">
          <div class="w-16 h-16 bg-slate-900 text-white rounded-[2rem] flex items-center justify-center shadow-2xl mb-6 text-2xl">🧬</div>
          <h1 class="text-[16px] md:text-[20px] font-black text-slate-900 uppercase tracking-[0.5em] mb-3">Laboratorio Vitaly</h1>
          <div class="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100/50">
            <span class="text-[9px] font-black uppercase tracking-widest">✅ Documento Verificado</span>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 pb-12 border-b border-slate-100">
          <div>
            <p class="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4">Información del Titular</p>
            <h2 class="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">${result.paciente_nombre}</h2>
            <div class="flex flex-wrap gap-3">
              <span class="px-3 py-1 bg-slate-50 text-slate-400 text-[9px] font-black rounded-lg uppercase">DNI ${result.paciente_cedula}</span>
              <span class="px-3 py-1 bg-slate-50 text-slate-400 text-[9px] font-black rounded-lg uppercase">Fecha: ${result.fecha}</span>
            </div>
          </div>
          <div>
            <p class="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4">Detalles de Validación</p>
            <div class="bg-slate-50/50 p-6 rounded-3xl border border-slate-100/50 space-y-4">
              <div class="flex justify-between">
                <span class="text-[8px] font-black text-slate-300 uppercase">ID de Certificado</span>
                <span class="text-[10px] font-mono font-bold text-slate-500">${uuid?.split('-')[0]}-VALID</span>
              </div>
              <div class="flex justify-between">
                <span class="text-[8px] font-black text-slate-300 uppercase">Tipo de Informe</span>
                <span class="text-[10px] font-bold text-slate-900 uppercase">${result.tipo}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-4">
          ${resultadosHtml}
        </div>
        
        ${resultados.observacion ? `
        <div class="mt-12 p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl">
          <h4 class="text-[10px] font-black uppercase tracking-widest mb-4">Interpretación Clínica / Observaciones</h4>
          <p class="text-[11px] font-medium leading-relaxed uppercase tracking-wide opacity-80">${resultados.observacion}</p>
        </div>
        ` : ''}
        
      </div>
      
      <footer class="mt-24 text-center">
        <p class="text-[9px] font-black text-slate-300 uppercase tracking-[0.6em] mb-2">Digital Identity Verified</p>
        <p class="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Vitaly Pro Clinical Management System</p>
      </footer>
    </body>
    </html>
  `);
});

"""

content = content[:start] + replacement + content[end:]

with open("src/worker/index.ts", "w") as f:
    f.write(content)
