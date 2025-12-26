import React, { ReactNode } from 'react';
import { Page, View, StyleSheet, Document } from '@react-pdf/renderer';

interface ReportLayoutProps {
  children: ReactNode;
}

const styles = StyleSheet.create({
  page: {
    padding: 20, // Margen general de la hoja
    backgroundColor: '#fff',
  },
  // Contenedor principal para el diseño de media hoja
  mainContainer: {
    flexDirection: 'row',
    height: '100%',
  },
  leftColumn: {
    width: '50%',
    paddingRight: 25,
    paddingLeft: 10,
    borderRightWidth: 0.5, 
    borderRightColor: '#ccc',
    borderRightStyle: 'dashed',
    // Flex y Relative son clave para que el Footer (absolute) funcione
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    height: '100%',
  },
  rightColumn: {
    width: '50%',
    // Espacio vacío para ahorro de papel o duplicado
  }
});

/**
 * ReportLayout: Define el formato físico del documento.
 * Configurado en tamaño CARTA Horizontal para optimizar impresión local.
 */
const ReportLayout: React.FC<ReportLayoutProps> = ({ children }) => (
  <Document title="Reporte de Laboratorio Clínico">
    <Page size="LETTER" orientation="landscape" style={styles.page}>
      <View style={styles.mainContainer}>
        {/* Lado izquierdo: El reporte real */}
        <View style={styles.leftColumn}>
          {children}
        </View>

        {/* Lado derecho: Espacio en blanco para corte manual */}
        <View style={styles.rightColumn} />
      </View>
    </Page>
  </Document>
);

export default ReportLayout;