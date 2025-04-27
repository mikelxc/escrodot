"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { OpenDisputesGrid } from "@/components/arbiter/open-disputes-grid"
import { ConnectButton } from "@/components/connect-button"
import { useAccount } from "wagmi"

// Mock data for demonstration
const mockArbiterInfo = {
  stake: "10.0",
  resolvedDisputes: 12,
  earnings: "3.5",
}

export function ArbiterHub() {
  const { isConnected } = useAccount()
  const [isEligible, setIsEligible] = useState(true)

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-gray-800 rounded-lg bg-black/50">
        <p className="text-gray-400 mb-4">Connect your wallet to access the Arbiter Hub</p>
        <ConnectButton />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <Card className="flex-1 border-gray-800 bg-black/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Arbiter Stake</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-pink-500">{mockArbiterInfo.stake} WND</div>
            <p className="text-sm text-gray-400 mt-1">Your stake determines which disputes you can resolve</p>
          </CardContent>
        </Card>

        <Card className="flex-1 border-gray-800 bg-black/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Resolved Disputes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-pink-500">{mockArbiterInfo.resolvedDisputes}</div>
            <p className="text-sm text-gray-400 mt-1">Total disputes you've resolved</p>
          </CardContent>
        </Card>

        <Card className="flex-1 border-gray-800 bg-black/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-pink-500">{mockArbiterInfo.earnings} WND</div>
            <p className="text-sm text-gray-400 mt-1">Total earnings from arbitration</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Open Disputes</h2>
        <Button
          variant="outline"
          className="border-pink-500 text-pink-500 hover:bg-pink-500/10"
          onClick={() => setIsEligible(!isEligible)}
        >
          {isEligible ? "Show All" : "Show Eligible"}
        </Button>
      </div>

      <OpenDisputesGrid showOnlyEligible={isEligible} />
    </div>
  )
}
