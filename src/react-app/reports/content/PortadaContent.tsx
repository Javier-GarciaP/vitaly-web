import React from 'react';
import { View, StyleSheet, Text, Image } from '@react-pdf/renderer';
import { Paciente } from '@/types/types';

interface PortadaGeneralProps {
  patient: Paciente;
  logoUrl?: string;
}

const styles = StyleSheet.create({
  pageContainer: {
    flexDirection: 'row',
    height: '100%',
    backgroundColor: '#ffffff',
    position: 'relative', // Contexto para posicionamiento absoluto
  },
  sidebar: {
    width: 10,
    backgroundColor: '#6e2020',
    height: '100%',
  },
  mainContent: {
    flex: 1,
    padding: 40,
    // Este padding superior reserva el espacio donde "flotará" el logo
    paddingTop: 160,
    flexDirection: 'column',
  },
  // EL LOGO: Ahora es independiente del resto de los elementos
  logoAbsolute: {
    position: 'absolute',
    top: -73,
    right: -40,
    left: -5,
    width: 300,      // Puedes subirlo a 200 o más y no moverá nada
    height: 300,
    objectFit: 'contain',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 30,
    width: '100%',
  },
  labName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#6e2020',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 9,
    color: '#666',
    letterSpacing: 3,
    textAlign: 'center',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  patientCard: {
    padding: 20,
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
    borderLeftWidth: 4,
    borderLeftColor: '#6e2020',
    width: '100%',
  },
  cardTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6e2020',
    marginBottom: 15,
    textTransform: 'uppercase',
  },
  infoRow: {
    marginBottom: 10,
  },
  label: {
    fontSize: 8,
    color: '#888',
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textTransform: 'uppercase',
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
  },
  notice: {
    fontSize: 7.5,
    color: '#999',
    textAlign: 'center',
    marginBottom: 15,
    paddingHorizontal: 30,
  },
  bottomLine: {
    width: '100%',
    borderTopWidth: 0.5,
    borderTopColor: '#eee',
    paddingTop: 10,
    textAlign: 'center',
    fontSize: 7,
    color: '#bbb',
  }
});

const PortadaContent: React.FC<PortadaGeneralProps> = ({ patient, logoUrl }) => {
  return (
    <View>
      <View style={styles.pageContainer}>
        {/* Barra Lateral */}
        <View style={styles.sidebar} />

        {/* LOGO FLOTANTE (Encima de todo) */}
        {logoUrl && (
          <Image src={logoUrl} style={styles.logoAbsolute} />
        )}

        <View style={styles.mainContent}>

          {/* TÍTULOS (Ubicados debajo del espacio del logo gracias al paddingTop) */}
          <View style={styles.headerSection}>
            <Text style={styles.labName}>LABORATORIO CLÍNICO VITALY</Text>
            <Text style={styles.subtitle}>Resultados de Laboratorio</Text>
          </View>

          {/* FICHA DEL PACIENTE */}
          <View style={styles.patientCard}>
            <Text style={styles.cardTitle}>Datos del Paciente</Text>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Nombre Completo</Text>
              <Text style={styles.value}>{patient?.nombre || 'YULI GARCIA'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Cédula de Identidad</Text>
              <Text style={styles.value}>{patient?.cedula || '17527149'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Edad / Fecha</Text>
              <Text style={styles.value}>
                {patient?.edad || '39'}  |  {new Date().toLocaleDateString('es-ES')}
              </Text>
            </View>
          </View>

          {/* PIE DE PÁGINA */}
          <View style={styles.footer}>
            <Text style={styles.notice}>
              Este documento es un reporte médico oficial. La confidencialidad de los
              datos está garantizada bajo las normativas de salud vigentes.
            </Text>
            <Text style={styles.bottomLine}>
              San José de Bolívar, Táchira • RIF: J-50413383-3
            </Text>
          </View>

        </View>
      </View>
    </View>
  );
};

export default PortadaContent;