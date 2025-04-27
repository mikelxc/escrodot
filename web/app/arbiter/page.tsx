import { ArbiterHub } from "@/components/arbiter/arbiter-hub"

export default function ArbiterPage() {
  return (
    <main className="min-h-screen bg-dotted-pink-500">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">
          <span className="text-pink-500">Arbiter</span> Hub
        </h1>
        <ArbiterHub />
      </div>
    </main>
  )
}
