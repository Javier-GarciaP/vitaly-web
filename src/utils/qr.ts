import QRCode from 'qrcode';

export const generateQRBase64 = async (uuid: string): Promise<string> => {
  // Cambia esta URL por la URL real donde publicarás tu web
  const baseUrl = window.location.origin; 
  const validationUrl = `${baseUrl}/varificar/${uuid}`;

  try {
    return await QRCode.toDataURL(validationUrl, {
      margin: 1,
      width: 100,
      color: {
        dark: '#6e2020', // Tu color corporativo
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('Error QR:', err);
    return '';
  }
};