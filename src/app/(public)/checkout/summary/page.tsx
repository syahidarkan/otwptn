import SummaryClient from './SummaryClient'

export default async function OrderSummaryPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams
  const orderId = (searchParams?.order_id as string) || 'OTW-2026-88192'
  const tier = (searchParams?.tier as string) || 'nectar'
  const name = (searchParams?.name as string) || 'Arvel Valerian'
  const paymentMethod = (searchParams?.payment_method as string) || 'bca_va'
  const amount = (searchParams?.amount as string) || '99000'

  return (
    <SummaryClient
      orderId={orderId}
      tier={tier}
      name={name}
      paymentMethod={paymentMethod}
      amount={amount}
    />
  )
}
