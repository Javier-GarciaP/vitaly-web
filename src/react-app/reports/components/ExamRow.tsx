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
    borderBottomColor: '#eee', // Color más suave para una apariencia más limpia
    paddingVertical: 4,
    alignItems: 'center',
    minHeight: 18, // Asegura consistencia visual
  },
  name: { 
    width: '40%', 
    fontSize: 9, 
    fontWeight: 'bold',
    color: '#333',
    paddingLeft: 2,
  },
  result: { 
    width: '30%', 
    fontSize: 10, 
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#000', // El resultado siempre en negro puro para contraste
  },
  reference: { 
    width: '30%', 
    fontSize: 8, 
    color: '#666', 
    textAlign: 'right',
    paddingRight: 2,
    fontStyle: 'italic',
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