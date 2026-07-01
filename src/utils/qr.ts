import QRCode from 'qrcode';

export const generateQRBase64 = async (uuid: string): Promise<string> => {
  // Usar el WORKER_URL guardado en localStorage (la URL de Cloudflare, no la local)
  const workerUrl = localStorage.getItem("WORKER_URL") || "";
  // La URL de verificación pública en la nube
  const validationUrl = workerUrl
    ? `${workerUrl}/verificar/${uuid}`
    : `https://vitaly-web-cop.venezuela.workers.dev/verificar/${uuid}`;

  try {
    return await QRCode.toDataURL(validationUrl, {
      margin: 1,
      width: 100,
      color: {
        dark: '#6e2020',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('Error QR:', err);
    return '';
  }
};