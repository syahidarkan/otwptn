import {
  Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from '@react-email/components'

interface Props {
  full_name: string
  wa_group_link: string
  is_review?: boolean
  mentor_name?: string | null
}

export default function PembayaranDikonfirmasi({ full_name, wa_group_link, is_review, mentor_name }: Props) {
  return (
    <Html>
      <Head />
      <Preview>Pembayaran dikonfirmasi — Selamat bergabung di otwptn!</Preview>
      <Body style={{ backgroundColor: '#F5F5F0', fontFamily: 'Arial, sans-serif', margin: 0 }}>
        <Section style={{ backgroundColor: '#FFD400', padding: '20px 40px' }}>
          <Text style={{ fontWeight: '800', fontSize: '20px', color: '#111111', margin: 0 }}>
            otwptn
          </Text>
        </Section>

        <Container style={{ maxWidth: '560px', margin: '0 auto', padding: '0 20px 40px' }}>
          <Section style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '40px', marginTop: '24px' }}>
            <Heading style={{ fontSize: '24px', color: '#111111', margin: '0 0 8px' }}>
              Selamat Bergabung! 🚀
            </Heading>
            <Text style={{ color: '#888888', marginTop: '0' }}>Halo, {full_name}!</Text>

            <Text style={{ color: '#1A1A1A', lineHeight: '1.7' }}>
              Pembayaranmu telah dikonfirmasi. Kamu sekarang resmi menjadi <strong>member otwptn</strong>.
              Yuk langsung mulai bimbingan!
            </Text>

            <Hr style={{ borderColor: '#E8E8E2', margin: '24px 0' }} />

            {is_review ? (
              <>
                <Text style={{ fontWeight: '700', color: '#111111', marginBottom: '8px' }}>
                  Langkah Selanjutnya:
                </Text>
                <Text style={{ color: '#1A1A1A', lineHeight: '1.8', margin: 0 }}>
                  1. Chat langsung ke mentor kamu<br />
                  2. Login ke otwptn dan akses e-course<br />
                  3. Mulai proses bimbingan
                </Text>
                {mentor_name && (
                  <Text style={{ color: '#888888', fontSize: '13px', marginTop: '12px' }}>
                    Mentor kamu: <strong>{mentor_name}</strong>
                  </Text>
                )}
                <Section style={{ textAlign: 'center', margin: '32px 0' }}>
                  <Button
                    href={wa_group_link}
                    style={{
                      backgroundColor: '#25D366',
                      color: '#ffffff',
                      padding: '14px 28px',
                      borderRadius: '10px',
                      fontWeight: '700',
                      fontSize: '15px',
                      display: 'inline-block',
                    }}
                  >
                    Chat Mentor Sekarang
                  </Button>
                </Section>
              </>
            ) : (
              <>
                <Text style={{ fontWeight: '700', color: '#111111', marginBottom: '8px' }}>
                  Langkah Selanjutnya:
                </Text>
                <Text style={{ color: '#1A1A1A', lineHeight: '1.8', margin: 0 }}>
                  1. Gabung ke grup WhatsApp mentor kamu<br />
                  2. Login ke otwptn.vercel.app<br />
                  3. Akses e-course dan mulai bimbingan
                </Text>
                <Section style={{ textAlign: 'center', margin: '32px 0' }}>
                  <Button
                    href={wa_group_link}
                    style={{
                      backgroundColor: '#25D366',
                      color: '#ffffff',
                      padding: '14px 28px',
                      borderRadius: '10px',
                      fontWeight: '700',
                      fontSize: '15px',
                      display: 'inline-block',
                    }}
                  >
                    Gabung Grup WhatsApp
                  </Button>
                </Section>
              </>
            )}

            <Section style={{ textAlign: 'center' }}>
              <Button
                href={`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`}
                style={{
                  backgroundColor: '#111111',
                  color: '#ffffff',
                  padding: '14px 28px',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '15px',
                  display: 'inline-block',
                }}
              >
                Akses Dashboard & E-Course
              </Button>
            </Section>
          </Section>

          <Text style={{ color: '#888888', fontSize: '12px', textAlign: 'center', marginTop: '24px' }}>
            otwptn.vercel.app — Platform Bimbingan Jalur Non-Test PTN
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
