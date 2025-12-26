import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';

// 1. Interfaz para las propiedades del componente
interface DataRowProps {
  label: string;
  value?: string | number | null;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3, // Un poco más de aire para legibilidad
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee', // Color más suave para que no compita con el texto
    alignItems: 'center',
  },
  label: { 
    fontSize: 9, 
    color: '#333', // Gris oscuro para mejor contraste
    fontWeight: 'bold',
    width: '60%', // Asegura que las etiquetas largas no rompan el layout
  },
  value: { 
    fontSize: 9, 
    color: '#000',
    width: '40%',
    textAlign: 'right', // Alineación a la derecha típica de valores de laboratorio
  },
});

/**
 * Componente genérico para filas de datos simples.
 * Ideal para resultados que no requieren valores de referencia o unidades.
 */
const DataRow: React.FC<DataRowProps> = ({ label, value }) => {
  // Verificación robusta de valores vacíos o nulos
  // Se añade verificación para evitar que el string "null" de la BD se renderice
  if (value === null || value === undefined || value === "" || value === "null") {
    return null;
  }

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}:</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
};

export default DataRow;