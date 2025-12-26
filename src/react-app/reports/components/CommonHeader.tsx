import React from 'react';
import { View, Text, Image, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1.5pt solid #6e2020',
    paddingBottom: 5,
    marginBottom: 10,
  },
  labInfo: {
    flexDirection: 'column',
  },
  labName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6e2020',
  },
  qrBox: {
    alignItems: 'center',
    textAlign: 'center',
  },
  qrImage: {
    width: 45,
    height: 45,
  },
  qrText: {
    fontSize: 5,
    color: '#666',
    marginTop: 1,
    textTransform: 'uppercase'
  }
});

interface CommonHeaderProps {
  patient: any;
  title: string;
  qrImage?: string; // CAMBIO: Recibe directamente el string Base64 generado fuera
}

const CommonHeader: React.FC<CommonHeaderProps> = ({ patient, title, qrImage }) => {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.labInfo}>
        <Text style={styles.labName}>LABORATORIO VITALY</Text>
        <Text style={{ fontSize: 10, fontWeight: 'bold' }}>{title}</Text>
        <Text style={{ fontSize: 8 }}>
          Paciente: {patient?.nombre} {patient?.cedula}
        </Text>
      </View>

      {/* Solo mostramos el QR si la imagen existe */}
      {qrImage && (
        <View style={styles.qrBox}>
          <Image src={qrImage} style={styles.qrImage} />
          <Text style={styles.qrText}>Verificación</Text>
          <Text style={styles.qrText}>Digital</Text>
        </View>
      )}
    </View>
  );
};

export default CommonHeader;