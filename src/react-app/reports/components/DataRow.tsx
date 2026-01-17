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
    paddingVertical: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f1f5f9',
    alignItems: 'center',
  },
  label: {
    fontSize: 8.5,
    color: '#334155',
    fontWeight: 'medium',
    width: '60%',
  },
  value: {
    fontSize: 9,
    color: '#0f172a',
    width: '40%',
    textAlign: 'right',
    fontWeight: 'bold',
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