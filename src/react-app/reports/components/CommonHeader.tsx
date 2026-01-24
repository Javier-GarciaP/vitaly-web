import React from 'react';
import { View, Text, Image, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottom: '1pt solid #e2e8f0',
    paddingBottom: 10,
    marginBottom: 10,
  },
  leftColumn: {
    flexDirection: 'column',
    flex: 1,
  },
  labName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#800020', // Vinotinto
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  examTitle: {
    fontSize: 10,
    fontWeight: 'medium',
    color: '#64748b', // Slate 500
    marginTop: 2,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  patientGrid: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
  },
  infoGroup: {
    flexDirection: 'column',
  },
  label: {
    fontSize: 6,
    color: '#94a3b8',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    marginBottom: 1,
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 9,
    color: '#1e293b',
    fontWeight: 'medium',
  },
  qrBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 15,
  },
  qrImage: {
    width: 45,
    height: 45,
    borderRadius: 4,
  },
});

interface CommonHeaderProps {
  patient: {
    nombre: string;
    cedula: string;
    edad?: string | number;
    fechaExamen: string;
  };
  title: string;
  qrImage?: string;
}


const CommonHeader: React.FC<CommonHeaderProps> = ({ patient, title, qrImage }) => {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.leftColumn}>
        <Text style={styles.labName}>Laboratorio Clínico Vitaly</Text>
        <Text style={styles.examTitle}>{title}</Text>

        <View style={styles.patientGrid}>
          <View style={styles.infoGroup}>
            <Text style={styles.label}>PACIENTE</Text>
            <Text style={styles.value}>{patient?.nombre.toUpperCase()}</Text>
          </View>
          <View style={styles.infoGroup}>
            <Text style={styles.label}>CÉDULA</Text>
            <Text style={styles.value}>V-{patient?.cedula}</Text>
          </View>
          <View style={styles.infoGroup}>
            <Text style={styles.label}>EDAD</Text>
            <Text style={styles.value}>{patient?.edad}</Text>
          </View>
          <View style={styles.infoGroup}>
            <Text style={styles.label}>FECHA</Text>
            <Text style={styles.value}>{patient?.fechaExamen}</Text>
          </View>
        </View>
      </View>

      {qrImage && (
        <View style={styles.qrBox}>
          <Image src={qrImage} style={styles.qrImage} />
        </View>
      )}
    </View>
  );
};

export default CommonHeader;