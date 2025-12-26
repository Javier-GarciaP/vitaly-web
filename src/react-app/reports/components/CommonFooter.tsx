import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 45, // Ajustado para márgenes de impresión estándar
    right: 45,
    borderTopWidth: 1.5, // Un poco más grueso para mayor definición
    borderTopColor: '#6e2020', 
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  column: {
    flexDirection: 'column',
  },
  leftColumn: {
    width: '60%',
  },
  rightColumn: {
    width: '40%',
    textAlign: 'right',
  },
  text: {
    fontSize: 7.5, // Tamaño óptimo para lectura sin saturar
    color: '#333', // Un gris más oscuro para mejor contraste
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  bold: {
    fontWeight: 'bold',
    color: '#6e2020', // Resaltado con el color institucional
  }
});

/**
 * CommonFooter: Pie de página institucional optimizado.
 * Se eliminó la paginación para un diseño más limpio y estático.
 */
const CommonFooter: React.FC = () => (
  <View style={styles.footer} fixed>
    {/* Columna Izquierda: Ubicación */}
    <View style={[styles.column, styles.leftColumn]}>
      <Text style={styles.text}>Calle 4 Entre Carrera 5 y 6, Sector Campo Alegre</Text>
      <Text style={styles.text}>San José de Bolívar, Edo. Táchira</Text>
    </View>
    
    {/* Columna Derecha: Contacto y Responsabilidad */}
    <View style={[styles.column, styles.rightColumn]}>
      <Text style={[styles.text, styles.bold]}>RIF: J-50413383-3</Text>
      <Text style={styles.text}>WhatsApp: (0424) 7234517</Text>
      <Text style={styles.text}>Bioanalista Responsable</Text>
    </View>
  </View>
);

export default CommonFooter;