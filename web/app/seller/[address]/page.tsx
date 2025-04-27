import { SellerPortal } from "@/components/seller/seller-portal"

export default async function SellerPage(props: { params: Promise<{ address: string }> }) {
  const params = await props.params;
  return (
    <main className="min-h-screen bg-dotted-pink-500">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">
          <span className="text-pink-500">Seller</span> Portal
        </h1>
        <SellerPortal address={params.address} />
      </div>
    </main>
  )
}
