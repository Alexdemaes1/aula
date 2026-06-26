import { Document, Page, View, Text, Image, StyleSheet, Font } from '@react-pdf/renderer'
import path from 'path'
import { formatSpent } from '@/lib/completion'

// Cormorant Garamond (estática, instancia SemiBold) para títulos; Helvetica
// built-in para el cuerpo. Se registra desde el fichero local (incluido en el
// bundle vía outputFileTracingIncludes). Si falla, degradamos sin romper el PDF.
let cormorantAvailable = false
try {
  Font.register({
    family: 'Cormorant',
    src: path.join(process.cwd(), 'public', 'fonts', 'CormorantGaramond-SemiBold.ttf'),
  })
  cormorantAvailable = true
} catch {
  cormorantAvailable = false
}
const HEADING_FONT = cormorantAvailable ? 'Cormorant' : 'Helvetica-Bold'

// Equivalentes hex de los OKLCH de marca (afinados).
const JADE = '#1f3d34'
const DARK = '#16241f'
const GOLD = '#c79a45'
const SEAL = '#b5462f'
const CREAM = '#f7ede2'

const styles = StyleSheet.create({
  page: { padding: 0, backgroundColor: '#ffffff', fontFamily: 'Helvetica' },
  frame: {
    margin: 22,
    flexGrow: 1,
    borderWidth: 3,
    borderColor: JADE,
    borderStyle: 'solid',
    padding: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerFrame: { position: 'absolute', top: 30, left: 30, right: 30, bottom: 30, borderWidth: 1, borderColor: GOLD },
  logo: { width: 78, height: 78, marginBottom: 14 },
  kicker: { fontSize: 11, letterSpacing: 3, color: GOLD, marginBottom: 8 },
  title: { fontFamily: HEADING_FONT, fontSize: 30, color: JADE, marginBottom: 18, textAlign: 'center' },
  subtle: { fontSize: 11, color: '#555555', marginBottom: 4 },
  name: { fontFamily: HEADING_FONT, fontSize: 24, color: DARK, marginVertical: 8, textAlign: 'center' },
  courseLine: { fontSize: 14, color: DARK, marginVertical: 10, textAlign: 'center' },
  meta: { fontSize: 10, color: '#666666', marginTop: 6 },
  seal: {
    width: 50,
    height: 50,
    borderRadius: 9,
    backgroundColor: SEAL,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  sealText: { fontFamily: HEADING_FONT, fontSize: 17, color: CREAM, letterSpacing: 1 },
  sealCaption: { fontSize: 7, letterSpacing: 2, color: GOLD, marginTop: 5 },
  signRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 26, paddingHorizontal: 24 },
  signBlock: { alignItems: 'center', width: 200 },
  signLine: { borderTopWidth: 1, borderTopColor: '#999999', width: 180, marginBottom: 4 },
  signName: { fontFamily: HEADING_FONT, fontSize: 13, color: DARK },
  signRole: { fontSize: 9, color: '#777777' },
})

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

export interface CertificateProps {
  studentName: string
  courseTitle: string
  completedAt: string
  secondsSpent: number
  logo?: string // data-URI del logo, inyectado por el route
}

export function CertificateDocument({ studentName, courseTitle, completedAt, secondsSpent, logo }: CertificateProps) {
  return (
    <Document title={`Certificado — ${courseTitle}`} author="Centro Tian Ying Fa">
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.frame}>
          <View style={styles.innerFrame} />
          {logo ? <Image style={styles.logo} src={logo} /> : null}
          <Text style={styles.kicker}>CENTRO TIAN YING FA</Text>
          <Text style={styles.title}>CERTIFICADO DE FINALIZACIÓN</Text>
          <Text style={styles.subtle}>Se otorga el presente certificado a</Text>
          <Text style={styles.name}>{studentName}</Text>
          <Text style={styles.subtle}>por haber completado satisfactoriamente el curso</Text>
          <Text style={styles.courseLine}>«{courseTitle}»</Text>
          <Text style={styles.meta}>
            Fecha de finalización: {formatDate(completedAt)}  ·  Tiempo dedicado: {formatSpent(secondsSpent)}
          </Text>
          {/* Sello del centro (cinabrio) */}
          <View style={styles.seal}>
            <Text style={styles.sealText}>TYF</Text>
          </View>
          <Text style={styles.sealCaption}>SELLO DEL CENTRO</Text>
          <View style={styles.signRow}>
            <View style={styles.signBlock}>
              <View style={styles.signLine} />
              <Text style={styles.signName}>Sifu Salvador Montiel</Text>
              <Text style={styles.signRole}>Instructor</Text>
            </View>
            <View style={styles.signBlock}>
              <View style={styles.signLine} />
              <Text style={styles.signName}>Centro Tian Ying Fa</Text>
              <Text style={styles.signRole}>Dirección</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  )
}
