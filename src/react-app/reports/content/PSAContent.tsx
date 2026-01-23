import React from 'react';
import { View, StyleSheet, Text } from '@react-pdf/renderer';
import CommonHeader from '../components/CommonHeader';
import ExamRow from '../components/ExamRow';
import { PSAData, Paciente } from '@/types/types';

interface ValorReferencia {
    nombre_examen: string;
    valor_referencia: string;
}

interface PSAReportProps {
    data: PSAData;
    patient: Paciente;
    qrImage?: string;
    references?: ValorReferencia[];
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 5,
    },
    card: {
        borderWidth: 1,
        borderColor: "#e2e8f0",
        borderRadius: 6,
        marginBottom: 8,
        overflow: "hidden",
    },
    cardHeader: {
        backgroundColor: "#800020",
        paddingVertical: 3,
        paddingHorizontal: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardTitle: {
        color: "#ffffff",
        fontSize: 9,
        fontWeight: "bold",
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    cardBody: {
        padding: 6,
        backgroundColor: "#fafafa",
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 0.5,
        borderBottomColor: '#cbd5e1',
        marginBottom: 4,
        paddingBottom: 2,
    },
    columnHead: {
        fontSize: 7,
        fontWeight: 'bold',
        color: '#64748b',
        textTransform: 'uppercase',
    },
    col1: { width: '40%' },
    col2: { width: '30%', textAlign: 'center' },
    col3: { width: '30%', textAlign: 'right' },

    metodoContainer: {
        marginTop: 10,
        paddingLeft: 8,
        borderLeftWidth: 2,
        borderLeftColor: '#800020',
    },
    metodoLabel: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#64748b',
        textTransform: 'uppercase',
    },
    metodoText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#1e293b',
        marginTop: 2,
    },
    cutoffContainer: {
        marginTop: 15,
        padding: 8,
        backgroundColor: '#fff5f5',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#fedada',
    },
    cutoffText: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#800020',
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    obsCard: {
        marginTop: 10,
        borderLeftWidth: 3,
        borderLeftColor: "#800020",
        backgroundColor: "#f8f9fa",
        padding: 8,
        borderRadius: 4,
    },
    obsTitle: {
        fontSize: 8,
        fontWeight: "bold",
        color: "#64748b",
        textTransform: "uppercase",
        marginBottom: 2,
    },
    obsText: {
        fontSize: 9,
        color: "#334155",
        lineHeight: 1.3,
    }
});

const PSAContent: React.FC<PSAReportProps> = ({ data, patient, qrImage, references }) => {
    const getRef = (nombre: string, fallback: string) => {
        if (!references) return fallback;
        const refObj = references.find(r =>
            r.nombre_examen.toLowerCase() === nombre.toLowerCase()
        );
        return refObj ? refObj.valor_referencia : fallback;
    };

    return (
        <View style={styles.container}>
            <CommonHeader
                patient={{
                    nombre: patient.nombre,
                    cedula: patient.cedula,
                    edad: patient.edad,
                    fechaExamen: patient.fecha || "",
                }}
                title="ANTÍGENO PROSTÁTICO ESPECÍFICO"
                qrImage={qrImage}
            />

            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>Inmunología / Marcadores Tumorales</Text>
                </View>
                <View style={styles.cardBody}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.columnHead, styles.col1]}>Análisis</Text>
                        <Text style={[styles.columnHead, styles.col2]}>Resultado</Text>
                        <Text style={[styles.columnHead, styles.col3]}>Referencia</Text>
                    </View>

                    <ExamRow
                        label="PSA Total"
                        result={data?.psa_total ? `${data.psa_total} ng/ml` : ''}
                        reference={getRef("PSA Total", "Hasta 4.0 ng/ml")}
                    />
                    <ExamRow
                        label="PSA Libre"
                        result={data?.psa_libre ? `${data.psa_libre} ng/ml` : ''}
                        reference={getRef("PSA Libre", "Hasta 0.93 ng/ml")}
                    />
                    <ExamRow
                        label="Indice PSAL/PSAT"
                        result={data?.indice_psa ? `${data.indice_psa}%` : ''}
                        reference=""
                    />
                </View>
            </View>

            <View style={styles.cutoffContainer}>
                <Text style={styles.cutoffText}>Rango CUT-OFF PARA INDICE PSAL/PSAT = 10%</Text>
            </View>

            <View style={styles.metodoContainer}>
                <Text style={styles.metodoLabel}>Metodología:</Text>
                <Text style={styles.metodoText}>{data?.metodo || "Elisa"}</Text>
            </View>

            {data?.observacion && data.observacion.trim() !== "" && (
                <View style={styles.obsCard}>
                    <Text style={styles.obsTitle}>OBSERVACIONES</Text>
                    <Text style={styles.obsText}>{data.observacion}</Text>
                </View>
            )}
        </View>
    );
};

export default PSAContent;
