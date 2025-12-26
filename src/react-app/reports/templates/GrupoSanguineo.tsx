import React from 'react';
import { View, StyleSheet, Text, Image } from '@react-pdf/renderer';
import ReportLayout from '../components/ReportLayout';
import { GrupoSanguineoData, Paciente } from '@/types/types';

interface GrupoSanguineoProps {
  data: GrupoSanguineoData;
  patient: Paciente;
  logoUrl?: string;
  qrImage?: string;
}

const styles = StyleSheet.create({
  masterContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    gap: 20, // Espacio entre frente y dorso para el corte
  },
  // Formato Tarjeta de Crédito (85.6mm x 54mm aprox)
  creditCard: {
    width: 242,
    height: 153,
    borderRadius: 12,
    border: '1pt solid #6e2020',
    backgroundColor: '#ffffff',
    position: 'relative',
    overflow: 'hidden',
    padding: 12,
  },
  // Decoración de fondo (Simula chip o diseño moderno)
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
  // Frente de la tarjeta
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoCard: {
    width: 55,
    height: 55,
    marginRight: 8,
  },
  labName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6e2020',
  },
  cardTitle: {
    fontSize: 7,
    letterSpacing: 1,
    color: '#666',
    textTransform: 'uppercase',
  },
  patientName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 15,
    color: '#222',
  },
  patientId: {
    fontSize: 9,
    color: '#555',
    marginBottom: 10,
  },
  // Bloque de resultados estilo "Chip/SmartCard"
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
    marginBottom: 2,
  },
  resultValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  // Dorso de la tarjeta
  backCard: {
    justifyContent: 'space-between',
  },
  magneticStripe: {
    backgroundColor: '#333',
    height: 30,
    width: '120%',
    marginLeft: -20,
    marginTop: 5,
  },
  infoText: {
    fontSize: 6,
    textAlign: 'center',
    color: '#666',
    paddingHorizontal: 10,
  },
  signatureArea: {
    backgroundColor: '#f2f2f2',
    height: 25,
    width: '100%',
    borderWidth: 0.5,
    borderColor: '#ccc',
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
  }
});

const GrupoSanguineo: React.FC<GrupoSanguineoProps> = ({ data, patient, logoUrl }) => {
  if (!data?.grupo_sanguineo && !data?.factor_rh) return null;

  return (
    <ReportLayout>
      <View style={styles.masterContainer}>
        
        {/* ANVERSO (FRENTE) */}
        <View style={styles.creditCard}>
          <View style={styles.cardDecor} />
          
          <View style={styles.headerRow}>
            {logoUrl && <Image src={logoUrl} style={styles.logoCard} />}
            <View>
              <Text style={styles.labName}>LABORATORIO VITALY</Text>
              <Text style={styles.cardTitle}>Blood Group Identification</Text>
            </View>
          </View>

          <Text style={styles.patientName}>{patient?.nombre || 'NOMBRE DEL PACIENTE'}</Text>
          <Text style={styles.patientId}>ID: {patient?.cedula || 'S/C'}</Text>

          <View style={styles.resultsContainer}>
            <View style={styles.resultBlock}>
              <Text style={styles.resultLabel}>GRUPO</Text>
              <Text style={styles.resultValue}>{data?.grupo_sanguineo || '-'}</Text>
            </View>
            <View style={styles.resultBlock}>
              <Text style={styles.resultLabel}>FACTOR RH</Text>
              <Text style={styles.resultValue}>{data?.factor_rh || '-'}</Text>
            </View>
            {data?.du && (
              <View style={styles.resultBlock}>
                <Text style={styles.resultLabel}>DU</Text>
                <Text style={styles.resultValue}>{data?.du}</Text>
              </View>
            )}
          </View>
        </View>

        {/* REVERSO (DORSO) */}
        <View style={[styles.creditCard, styles.backCard]}>
          <View style={styles.magneticStripe} />
          
          <View>
            <Text style={{ fontSize: 6, fontWeight: 'bold', marginLeft: 5 }}>FIRMA BIOANALISTA:</Text>
            <View style={styles.signatureArea}>
              <Text style={{ fontSize: 5, color: '#aaa' }}>Válido con sello del laboratorio</Text>
            </View>
          </View>

          <View style={styles.infoText}>
            <Text>Este documento es de carácter informativo y personal.</Text>
            <Text>En caso de emergencia, presente esta tarjeta al personal médico.</Text>
            <Text style={{ marginTop: 4, fontWeight: 'bold' }}>San José de Bolívar, Táchira • RIF: J-50413383-3</Text>
          </View>
          
          <Text style={{ fontSize: 5, textAlign: 'right', color: '#999' }}>
            Emitido: {new Date().toLocaleDateString()}
          </Text>
        </View>

      </View>
    </ReportLayout>
  );
};

export default GrupoSanguineo;