import React from 'react';
import { View, StyleSheet, Text, Image } from '@react-pdf/renderer';
import ReportLayout from '../components/ReportLayout';
import { GrupoSanguineoData, Paciente } from '@/types/types';

interface GrupoSanguineoProps {
  data: GrupoSanguineoData;
  patient: Paciente;
  logoUrl?: string;
}

const styles = StyleSheet.create({
  masterContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    gap: 20,
  },
  creditCard: {
    width: 242, 
    height: 153,
    borderRadius: 12,
    border: '1pt solid #6e2020',
    backgroundColor: '#ffffff',
    position: 'relative', // Obligatorio para que los hijos absolutos se orienten aquí
    overflow: 'hidden',
    padding: 12,
  },
  // LOGO: Ahora flota sobre el diseño
  logoCard: {
    position: 'absolute',
    bottom: 20,
    left: -50,
    width: 190,  // Puedes amp0liarlo y no moverá los textos
    height: 190,
    objectFit: 'contain',
  },
  cardDecor: {
    position: 'absolute',
    right: -20,
    top: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f8f1f1',
    zIndex: -1,
  },
  // Header alineado a la derecha para no chocar con el logo absoluto
  headerContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end', 
    width: '100%',
    marginBottom: 15,
  },
  labName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6e2020',
  },
  cardTitle: {
    fontSize: 6,
    letterSpacing: 0.5,
    color: '#666',
  },
  patientInfo: {
    marginTop: 25, // Espacio para que el nombre empiece debajo del área del logo
  },
  patientName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#222',
    textTransform: 'uppercase',
  },
  patientId: {
    fontSize: 9,
    color: '#555',
  },
  resultsContainer: {
    flexDirection: 'row',
    marginTop: 'auto',
    backgroundColor: '#6e2020',
    borderRadius: 6,
    padding: 8,
    justifyContent: 'space-around',
  },
  resultBlock: {
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 6,
    color: '#ffcccc',
  },
  resultValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  // Dorso
  backCard: {
    justifyContent: 'space-between',
  },
  signatureArea: {
    backgroundColor: '#f5f5f5',
    height: 40,
    width: '100%',
    borderWidth: 0.5,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    marginTop: 5,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

const GrupoSanguineo: React.FC<GrupoSanguineoProps> = ({ data, patient, logoUrl }) => {
  if (!data?.grupo_sanguineo && !data?.factor_rh) return null;

  return (
    <ReportLayout>
      <View style={styles.masterContainer}>
        
        {/* ANVERSO */}
        <View style={styles.creditCard}>
          <View style={styles.cardDecor} />
          
          {/* EL LOGO: Al ser absolute, no empuja el resto de los View */}
          {logoUrl && <Image src={logoUrl} style={styles.logoCard} />}

          <View style={styles.headerContainer}>
            <Text style={styles.labName}>LABORATORIO VITALY</Text>
            <Text style={styles.cardTitle}>IDENTIFICACIÓN SANGUÍNEA</Text>
          </View>

          <View style={styles.patientInfo}>
            <Text style={styles.patientName}>{patient?.nombre || 'PACIENTE NO REGISTRADO'}</Text>
            <Text style={styles.patientId}>C.I.: {patient?.cedula || 'S/C'}</Text>
          </View>

          <View style={styles.resultsContainer}>
            <View style={styles.resultBlock}>
              <Text style={styles.resultLabel}>GRUPO</Text>
              <Text style={styles.resultValue}>{data?.grupo_sanguineo || '-'}</Text>
            </View>
            <View style={styles.resultBlock}>
              <Text style={styles.resultLabel}>FACTOR RH</Text>
              <Text style={styles.resultValue}>{data?.factor_rh || '-'}</Text>
            </View>
          </View>
        </View>

        {/* REVERSO */}
        <View style={[styles.creditCard, styles.backCard]}>
          <View>
            <Text style={{ fontSize: 7, fontWeight: 'bold' }}>FIRMA BIOANALISTA:</Text>
            <View style={styles.signatureArea}>
              <Text style={{ fontSize: 5, color: '#999' }}>Sello del Laboratorio</Text>
            </View>
          </View>

          <View style={{ fontSize: 6, textAlign: 'center', color: '#666' }}>
            <Text>Este documento es personal e intransferible.</Text>
            <Text>San José de Bolívar, Táchira • RIF: J-50413383-3</Text>
          </View>
          
          <Text style={{ fontSize: 5, textAlign: 'right', color: '#999' }}>
            Emisión: {patient.fecha}
          </Text>
        </View>

      </View>
    </ReportLayout>
  );
};

export default GrupoSanguineo;