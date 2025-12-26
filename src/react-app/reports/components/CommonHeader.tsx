import React from 'react';
import { View, Text, Image, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottom: '2pt solid #1e293b', // Color pizarra oscuro para un look moderno
    paddingBottom: 8,
    marginBottom: 15,
  },
  leftColumn: {
    flexDirection: 'column',
    flex: 1,
  },
  labName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af', // Azul médico profesional
    letterSpacing: 0.5,
  },
  examTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#475569',
    marginTop: 2,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  patientGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  infoItem: {
    flexDirection: 'column',
  },
  label: {
    fontSize: 7,
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  value: {
    fontSize: 9,
    color: '#0f172a',
    fontWeight: 'medium',
  },
  qrBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 15,
    paddingLeft: 15,
    borderLeft: '0.5pt solid #e2e8f0',
  },
  qrImage: {
    width: 50,
    height: 50,
  },
  qrText: {
    fontSize: 6,
    color: '#94a3b8',
    marginTop: 3,
    textAlign: 'center',
    fontWeight: 'bold',
  }
});

interface CommonHeaderProps {
  patient: {
    nombre: string;
    cedula: string;
    edad?: string | number;
    fechaExamen: string; // Fecha guardada en el examen
  };
  title: string;
  qrImage?: string;
}

const CommonHeader: React.FC<CommonHeaderProps> = ({ patient, title, qrImage }) => {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.leftColumn}>
        <Text style={styles.labName}>LABORATORIO VITALY</Text>
        <Text style={styles.examTitle}>{title}</Text>

        <View style={styles.patientGrid}>
          {/* Nombre y Cédula */}
          <View style={[styles.infoItem, { minWidth: '150pt' }]}>
            <Text style={styles.label}>Paciente</Text>
            <Text style={styles.value}>{patient?.nombre} ({patient?.cedula})</Text>
          </View>

          {/* Edad */}
          <View style={styles.infoItem}>
            <Text style={styles.label}>Edad</Text>
            <Text style={styles.value}>{patient?.edad ? `${patient.edad} años` : 'N/A'}</Text>
          </View>

          {/* Fecha del Examen (Real) */}
          <View style={styles.infoItem}>
            <Text style={styles.label}>Fecha del Análisis</Text>
            <Text style={styles.value}>{patient?.fechaExamen}</Text>
          </View>
        </View>
      </View>

      {/* Sección QR */}
      {qrImage && (
        <View style={styles.qrBox}>
          <Image src={qrImage} style={styles.qrImage} />
          <View>
            <Text style={styles.qrText}>RESULTADOS</Text>
            <Text style={styles.qrText}>VERIFICADOS</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default CommonHeader;