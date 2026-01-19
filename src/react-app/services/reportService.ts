export const descargarReporte = async (tipo: string, datos: any) => {
  try {
    const response = await fetch(`https://vitaly-reportes-api.onrender.com/api/pdf/generar/${tipo}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datos),
    });

    if (!response.ok) throw new Error('Error al generar el reporte');

    // 1. Recibir el PDF como un "blob" (archivo binario)
    const blob = await response.blob();
    
    // 2. Crear una URL temporal para el archivo
    const url = window.URL.createObjectURL(blob);
    
    // 3. Abrir en una pestaña nueva (modo visualización)
    window.open(url, '_blank');

    // Opcional: Si quieres que se descargue directamente, usa esto:
    /*
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Reporte_${tipo}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    */
  } catch (error) {
    console.error("Error conectando con el servidor de reportes:", error);
    alert("No se pudo generar el reporte. Verifica que el servidor esté activo.");
  }
};