import {
  Body, Container, Head, Heading, Hr, Html, Preview,
  Section, Text, Row, Column,
} from '@react-email/components'
import { formatRupiah } from '@/lib/utils'
import { CATEGORY_LABEL, TIER_LABEL } from '@/lib/constants'
import type { JalurCategory, PackageTier } from '@/types'

interface Props {
  full_name: string
  category: JalurCategory
  tier: PackageTier
  total_price: number
  registration_id: string
}

export default function PendaftaranDiterima({ full_name, category, tier, total_price, registration_id }: Props) {
  return (
    <Html>
      <Head />
      <Preview>Pendaftaran bimbingan otwptn diterima — verifikasi dalam 1×24 jam</Preview>
      <Body style={{ backgroundColor: '#F5F5F0', fontFamily: 'Arial, sans-serif', margin: 0 }}>
        {/* Header */}
        <Section style={{ backgroundColor: '#FFD400', padding: '20px 40px' }}>
          <Text style={{ fontWeight: '800', fontSize: '20px', color: '#111111', margin: 0 }}>
            otwptn
          </Text>
        </Section>

        <Container style={{ maxWidth: '560px', margin: '0 auto', padding: '0 20px 40px' }}>
          <Section style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '40px', marginTop: '24px' }}>
            <Heading style={{ fontSize: '24px', color: '#111111', margin: '0 0 8px' }}>
              Pendaftaran Diterima! 🎉
            </Heading>
            <Text style={{ color: '#888888', marginTop: '0' }}>Halo, {full_name}!</Text>

            <Text style={{ color: '#1A1A1A', lineHeight: '1.7' }}>
              Pendaftaran bimbinganmu sudah kami terima. Tim kami akan memverifikasi pembayaranmu
              dalam <strong>1×24 jam</strong>. Kamu akan mendapat email konfirmasi setelah disetujui.
            </Text>

            <Hr style={{ borderColor: '#E8E8E2', margin: '24px 0' }} />

            <Text style={{ fontWeight: '700', color: '#111111', marginBottom: '12px' }}>
              Ringkasan Pesanan
            </Text>

            <Row>
              <Column style={{ color: '#888888', fontSize: '14px' }}>Kategori</Column>
              <Column style={{ color: '#111111', fontWeight: '600', fontSize: '14px', textAlign: 'right' }}>
                {CATEGORY_LABEL[category]}
              </Column>
            </Row>
            <Row style={{ marginTop: '8px' }}>
              <Column style={{ color: '#888888', fontSize: '14px' }}>Tier</Column>
              <Column style={{ color: '#111111', fontWeight: '600', fontSize: '14px', textAlign: 'right' }}>
                {TIER_LABEL[tier]}
              </Column>
            </Row>
            <Row style={{ marginTop: '8px', paddingTop: '12px', borderTop: '1px solid #E8E8E2' }}>
              <Column style={{ color: '#111111', fontWeight: '700', fontSize: '16px' }}>Total</Column>
              <Column style={{ color: '#111111', fontWeight: '800', fontSize: '16px', textAlign: 'right' }}>
                {formatRupiah(total_price)}
              </Column>
            </Row>

            <Hr style={{ borderColor: '#E8E8E2', margin: '24px 0' }} />

            <Text style={{ color: '#888888', fontSize: '13px' }}>
              Nomor Pendaftaran: <strong>{registration_id.slice(0, 8).toUpperCase()}</strong>
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
