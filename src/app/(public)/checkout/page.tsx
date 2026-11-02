import CheckoutClient from './CheckoutClient'

export default async function CheckoutPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams
  const tier = (searchParams?.tier as string) || 'nectar'
  const initialSnapOpen = searchParams?.snap === '1'

  return <CheckoutClient initialTier={tier} initialSnapOpen={initialSnapOpen} />
}
