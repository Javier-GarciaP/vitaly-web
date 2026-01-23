import { Page, View, StyleSheet } from "@react-pdf/renderer";
import { ReactNode } from "react";
import CommonFooter from "./CommonFooter";

interface ReportLayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

const styles = StyleSheet.create({
  page: {
    paddingVertical: 10, // Margen general de la hoja
    backgroundColor: '#fff',
  },
  // Contenedor principal para el diseño de media hoja
  mainContainer: {
    flexDirection: 'row',
    height: '100%',
  },
  leftColumn: {
    width: '50%',
    paddingRight: 35,
    paddingLeft: 5,
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

const PageComponent: React.FC<ReportLayoutProps> = ({ children, showFooter = true }) => {
  return (
    <Page size="LETTER" orientation="landscape" style={styles.page}>
      <View style={styles.mainContainer}>
        {/* Lado izquierdo: El reporte real */}
        <View style={styles.leftColumn}>
          {children}
          {showFooter && <CommonFooter />}
        </View>
        <View style={styles.rightColumn} />
      </View>
    </Page>
  );
};

export default PageComponent;

