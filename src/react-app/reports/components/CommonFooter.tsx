import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 25,
    right: 25,
    borderTopWidth: 0.5,
    borderTopColor: '#e2e8f0',
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoContainer: {
    width: '100%',
  },
  text: {
    fontSize: 7,
    color: '#94a3b8',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});

/**
 * CommonFooter: Pie de página institucional.
 * La propiedad 'fixed' asegura su aparición en todas las hojas del documento.
 */
const CommonFooter: React.FC = () => (
  <View style={styles.footer} fixed>
    <View style={styles.infoContainer}>
      <Text style={styles.text}>Calle 4 Entre Carrera 5 y 6, Sector Campo Alegre</Text>
      <Text style={styles.text}>San José de Bolívar, Táchira - Tel: (0424) 7234517</Text>
      <Text style={styles.text}>RIF: J-50413383-3 | Bioanalista Responsable</Text>
    </View>
  </View>
);


export default CommonFooter;