import ProductDetailClient from './ProductDetailClient'

export default async function ProductDetailPage(props: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await props.params
  const searchParams = await props.searchParams
  const id = params?.id || 'nectar'
  const initialCartOpen = searchParams?.cart === '1'

  return <ProductDetailClient id={id} initialCartOpen={initialCartOpen} />
}
