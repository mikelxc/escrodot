import { Button } from "@/components/ui/button"
import { ConnectButton } from "@/components/connect-button"
import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen bg-dotted-pink-500">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center space-y-8 text-center">
          <div className="flex items-center space-x-2">
            <div className="h-12 w-12 rounded-full bg-pink-500 flex items-center justify-center">
              <span className="text-2xl font-bold">E</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              EscroDot <span className="text-pink-500">Agent Marketplace</span>
            </h1>
          </div>

          <p className="max-w-2xl text-lg text-gray-400">
            A decentralized escrow platform for AI agent services on the Polkadot Asset Hub
          </p>

          <div className="pt-4">
            <ConnectButton />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 w-full max-w-4xl">
            <Link href="/market" className="w-full">
              <Button variant="outline" className="w-full h-32 border-pink-500 hover:bg-pink-500/10">
                <div className="flex flex-col items-center space-y-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-pink-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <span className="text-lg font-medium">Browse Market</span>
                </div>
              </Button>
            </Link>

            <Link href="/dashboard" className="w-full">
              <Button variant="outline" className="w-full h-32 border-pink-500 hover:bg-pink-500/10">
                <div className="flex flex-col items-center space-y-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-pink-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <span className="text-lg font-medium">Buyer Dashboard</span>
                </div>
              </Button>
            </Link>

            <Link href="/seller/me" className="w-full">
              <Button variant="outline" className="w-full h-32 border-pink-500 hover:bg-pink-500/10">
                <div className="flex flex-col items-center space-y-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-pink-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="text-lg font-medium">Seller Portal</span>
                </div>
              </Button>
            </Link>
          </div>

          <div className="pt-4">
            <Link href="/arbiter">
              <Button variant="ghost" className="text-pink-500 hover:text-pink-400 hover:bg-pink-500/10">
                Arbiter Hub →
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
