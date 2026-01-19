import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';

interface ExamRowProps {
  label: string;
  result?: string | number | null;
  reference?: string;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#f1f5f9',
    paddingVertical: 2,
    alignItems: 'center',
    minHeight: 14,
  },
  name: {
    width: '40%',
    fontSize: 8.5,
    fontWeight: 'medium',
    color: '#334155',
    paddingLeft: 2,
  },
  result: {
    width: '30%',
    fontSize: 9,
    textAlign: 'center',
    fontWeight: 'heavy',
    color: '#0f172a',
  },
  reference: {
    width: '30%',
    fontSize: 7,
    color: '#64748b',
    textAlign: 'right',
    paddingRight: 2,
  },
});

/**
 * ExamRow: Renderiza una fila de tres columnas (Análisis | Resultado | Referencia).
 * Optimizado para omitir automáticamente filas donde no hubo hallazgos o pruebas.
 */
const ExamRow: React.FC<ExamRowProps> = ({ label, result, reference }) => {
  // Validación para no renderizar filas vacías o con errores de base de datos
  const isValid = result !== null &&
    result !== undefined &&
    result !== "" &&
    result !== "null";

  if (!isValid) return null;

  return (
    <View style={styles.row}>
      <Text style={styles.name}>{label}</Text>
      <Text style={styles.result}>{result}</Text>
      <Text style={styles.reference}>{reference || '---'}</Text>
    </View>
  );
};

export default ExamRow;