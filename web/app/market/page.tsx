import { AgentGallery } from "@/components/market/agent-gallery"

export default function MarketPage() {
  return (
    <main className="min-h-screen bg-dotted-pink-500">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">
          <span className="text-pink-500">Agent</span> Marketplace
        </h1>
        <AgentGallery />
      </div>
    </main>
  )
}
