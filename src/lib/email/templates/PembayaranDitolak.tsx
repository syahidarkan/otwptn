import {
  Body, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from '@react-email/components'

interface Props {
  full_name: string
  notes?: string
}

export default function PembayaranDitolak({ full_name, notes }: Props) {
  return (
    <Html>
      <Head />
      <Preview>Update pendaftaran otwptn kamu</Preview>
      <Body style={{ backgroundColor: '#F5F5F0', fontFamily: 'Arial, sans-serif', margin: 0 }}>
        <Section style={{ backgroundColor: '#FFD400', padding: '20px 40px' }}>
          <Text style={{ fontWeight: '800', fontSize: '20px', color: '#111111', margin: 0 }}>
            otwptn
          </Text>
        </Section>

        <Container style={{ maxWidth: '560px', margin: '0 auto', padding: '0 20px 40px' }}>
          <Section style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '40px', marginTop: '24px' }}>
            <Heading style={{ fontSize: '24px', color: '#111111', margin: '0 0 8px' }}>
              Perlu Tindakan Lanjut
            </Heading>
            <Text style={{ color: '#888888', marginTop: '0' }}>Halo, {full_name}!</Text>

            <Text style={{ color: '#1A1A1A', lineHeight: '1.7' }}>
              Sayangnya, kami belum bisa memverifikasi bukti pembayaranmu. Mohon upload ulang
              bukti transfer yang valid.
            </Text>

            {notes && (
              <>
                <Hr style={{ borderColor: '#E8E8E2', margin: '24px 0' }} />
                <Text style={{ fontWeight: '700', color: '#111111', marginBottom: '8px' }}>
                  Catatan Admin:
                </Text>
                <Text style={{ color: '#1A1A1A', backgroundColor: '#FEF2F2', padding: '12px', borderRadius: '8px', fontSize: '14px' }}>
                  {notes}
                </Text>
              </>
            )}

            <Hr style={{ borderColor: '#E8E8E2', margin: '24px 0' }} />

            <Text style={{ color: '#1A1A1A', lineHeight: '1.7' }}>
              Silakan hubungi kami via WhatsApp atau email jika ada pertanyaan, atau
              daftar ulang di <strong>otwptn.vercel.app/daftar</strong> dengan bukti pembayaran yang benar.
            </Text>
          </Section>

          <Text style={{ color: '#888888', fontSize: '12px', textAlign: 'center', marginTop: '24px' }}>
            otwptn.vercel.app — Platform Bimbingan Jalur Non-Test PTN
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
