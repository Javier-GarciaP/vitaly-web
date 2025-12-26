import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40, // Un poco más de margen para evitar cortes en impresoras
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#6e2020', // Sincronizado con el color institucional
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between', // Distribuye info a la izquierda y paginación a la derecha
  },
  infoContainer: {
    width: '70%',
  },
  text: {
    fontSize: 7, // Tamaño ligeramente menor para mayor elegancia
    color: '#555',
    marginBottom: 1,
    textTransform: 'uppercase',
  },
  pageNumber: {
    fontSize: 7,
    color: '#888',
    textAlign: 'right',
  }
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
    
    {/* Paginación automática proporcionada por react-pdf */}
    <Text 
      style={styles.pageNumber} 
      render={({ pageNumber, totalPages }) => (
        `Página ${pageNumber} de ${totalPages}`
      )} 
    />
  </View>
);

export default CommonFooter;