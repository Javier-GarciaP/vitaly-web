import React from 'react';
import { View, StyleSheet, Text, Image } from '@react-pdf/renderer';
import ReportLayout from '../components/ReportLayout';
// 1. Usamos tu tipo centralizado de paciente
import { Paciente } from '@/types/types';

interface PortadaGeneralProps {
  patient: Paciente;
  logoUrl?: string;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 60, 
  },
  logo: {
    width: 500, // Un poco más grande para la portada
    height: 'auto',
    marginBottom: 25,
    marginRight: 170,
  },
  labName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6e2020', 
    textAlign: 'center',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 11,
    color: '#666',
    marginBottom: 50,
    letterSpacing: 4, // Espaciado elegante
    fontWeight: 'light',
  },
  patientCard: {
    width: '85%',
    borderWidth: 1.5,
    borderColor: '#6e2020',
    borderRadius: 8,
    padding: 20,
    backgroundColor: '#fff',
    // Sombra visual simulada con bordes
  },
  cardTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#6e2020',
    marginBottom: 15,
    textAlign: 'center',
    letterSpacing: 1,
    borderBottomWidth: 0.5,
    borderBottomColor: '#6e2020',
    paddingBottom: 5,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
    borderBottomWidth: 0.3,
    borderBottomColor: '#eee',
    paddingBottom: 3,
  },
  label: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#444',
    width: 90,
  },
  value: {
    fontSize: 10,
    flex: 1,
    textTransform: 'uppercase',
    color: '#000',
  },
  notice: {
    marginTop: 40,
    fontSize: 8,
    color: '#888',
    textAlign: 'center',
    width: '70%',
    lineHeight: 1.4,
  }
});

const PortadaGeneral: React.FC<PortadaGeneralProps> = ({ patient, logoUrl }) => {
  return (
    <ReportLayout>
      <View style={styles.container}>
        {/* Identidad Visual */}
        {logoUrl && (
          <Image src={logoUrl} style={styles.logo} />
        )}

        <Text style={styles.labName}>Laboratorio Vitaly</Text>
        <Text style={styles.subtitle}>INFORME MÉDICO DE LABORATORIO</Text>

        {/* Tarjeta de Presentación del Paciente */}
        <View style={styles.patientCard}>
          <Text style={styles.cardTitle}>DATOS DE IDENTIFICACIÓN</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>PACIENTE:</Text>
            <Text style={styles.value}>{patient?.nombre || 'S/N'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>CÉDULA / ID:</Text>
            <Text style={styles.value}>{patient?.cedula || 'S/C'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>EDAD:</Text>
            <Text style={styles.value}>{patient?.edad || 'N/A'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>FECHA EMISIÓN:</Text>
            <Text style={styles.value}>
              {new Date().toLocaleDateString('es-ES', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </View>
        </View>

        <Text style={styles.notice}>
          Este informe es estrictamente confidencial y los resultados deben ser 
          interpretados por un médico profesional.
        </Text>
      </View>
    </ReportLayout>
  );
};

export default PortadaGeneral;