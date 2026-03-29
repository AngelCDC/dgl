import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontSize: 10,
  },
  title: {
    fontSize: 16,
    marginBottom: 12,
    fontWeight: 700,
  },
  section: {
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 6,
    fontWeight: 700,
  },
  text: {
    marginBottom: 4,
  },
});

export default function SolicitudLevantamientoProcuraPDF({ data }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Ficha de Levantamiento de Procura</Text>

        <View style={styles.section}>
          <Text style={styles.subtitle}>Información general</Text>
          <Text style={styles.text}>Empresa: {data.empresaCliente}</Text>
          <Text style={styles.text}>Nombre comercial: {data.nombreComercial || '-'}</Text>
          <Text style={styles.text}>
            Fecha: {data.fecha.dd}/{data.fecha.mm}/{data.fecha.aaaa}
          </Text>
          <Text style={styles.text}>Ciudad: {data.ciudad || '-'}</Text>
          <Text style={styles.text}>Dirección: {data.direccion || '-'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>Contacto principal</Text>
          <Text style={styles.text}>Nombre: {data.contactoPrincipal?.nombre || '-'}</Text>
          <Text style={styles.text}>Cargo: {data.contactoPrincipal?.cargo || '-'}</Text>
          <Text style={styles.text}>Teléfono: {data.contactoPrincipal?.telefono || '-'}</Text>
          <Text style={styles.text}>Email: {data.contactoPrincipal?.email || '-'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>Objetivo de la reunión</Text>
          <Text style={styles.text}>{data.objetivoReunion}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>Productos del cliente</Text>
          {data.productosCliente.map((producto, index) => (
            <View key={index} style={{ marginBottom: 8 }}>
              <Text style={styles.text}>• Producto: {producto.nombreProducto}</Text>
              <Text style={styles.text}>  Categoría: {producto.categoria || '-'}</Text>
              <Text style={styles.text}>
                {'  '}Descripción: {producto.descripcionGeneral || '-'}
              </Text>
              <Text style={styles.text}>
                {'  '}Características:{' '}
                {producto.caracteristicasPrincipales?.length
                  ? producto.caracteristicasPrincipales.join(', ')
                  : '-'}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>Necesidades de procura</Text>
          {data.necesidadesProcura.map((item, index) => (
            <View key={index} style={{ marginBottom: 8 }}>
              <Text style={styles.text}>
                • Producto relacionado: {item.productoRelacionado}
              </Text>
              <Text style={styles.text}>  Tipo: {item.tipoNecesidad}</Text>
              <Text style={styles.text}>  Descripción: {item.descripcion}</Text>
              <Text style={styles.text}>
                {'  '}Especificaciones mínimas: {item.especificacionesMinimas || '-'}
              </Text>
              <Text style={styles.text}>  Prioridad: {item.prioridad || '-'}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>Próximos pasos</Text>
          {data.proximosPasos.map((paso, index) => (
            <Text key={index} style={styles.text}>
              • {paso}
            </Text>
          ))}
        </View>
      </Page>
    </Document>
  );
}