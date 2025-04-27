"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { JudgePanel } from "@/components/arbiter/judge-panel"

// Mock data for demonstration
const mockDisputes = [
  {
    id: "1",
    serviceId: "2",
    purchaseId: "4",
    serviceName: "Content Writer",
    buyer: "0x6543...2109",
    buyerName: "BlogWriter",
    provider: "0x2345...6789",
    providerName: "WriterPro",
    price: "0.75",
    disputeDate: "2025-04-26T10:15:00Z",
    reason: "The content delivered was completely off-topic and didn't follow my instructions.",
    evidence: "https://api.example.com/evidence/2/4",
  },
  {
    id: "2",
    serviceId: "3",
    purchaseId: "5",
    serviceName: "Image Generator",
    buyer: "0x5432...1098",
    buyerName: "ArtLover",
    provider: "0x3456...7890",
    providerName: "PixelMaster",
    price: "1.2",
    disputeDate: "2025-04-25T14:30:00Z",
    reason: "The generated images were low quality and didn't match my description at all.",
    evidence: "https://api.example.com/evidence/3/5",
  },
  {
    id: "3",
    serviceId: "4",
    purchaseId: "6",
    serviceName: "Data Analyzer",
    buyer: "0x4321...0987",
    buyerName: "DataScientist",
    provider: "0x4567...8901",
    providerName: "DataWiz",
    price: "0.9",
    disputeDate: "2025-04-24T09:45:00Z",
    reason: "The analysis contains critical errors and the visualizations are misleading.",
    evidence: "https://api.example.com/evidence/4/6",
  },
]

interface OpenDisputesGridProps {
  showOnlyEligible: boolean
}

export function OpenDisputesGrid({ showOnlyEligible }: OpenDisputesGridProps) {
  const [selectedDispute, setSelectedDispute] = useState<(typeof mockDisputes)[0] | null>(null)
  const [judgePanelOpen, setJudgePanelOpen] = useState(false)

  // In a real implementation, you would filter based on the user's stake
  const disputes = showOnlyEligible
    ? mockDisputes.filter((dispute) => Number.parseFloat(dispute.price) <= 1.0)
    : mockDisputes

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleJudge = (dispute: (typeof mockDisputes)[0]) => {
    setSelectedDispute(dispute)
    setJudgePanelOpen(true)
  }

  return (
    <>
      {disputes.length === 0 ? (
        <div className="text-center p-8 border border-gray-800 rounded-lg bg-black/50">
          <p className="text-gray-400">
            {showOnlyEligible
              ? "No eligible disputes found. Try increasing your stake or check back later."
              : "No open disputes at the moment."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {disputes.map((dispute) => (
            <Card key={dispute.id} className="border border-gray-800 bg-black/50">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold">{dispute.serviceName}</h3>
                    <p className="text-xs text-gray-400">Disputed on {formatDate(dispute.disputeDate)}</p>
                  </div>
                  <Badge className="bg-red-500">{dispute.price} WND</Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Buyer:</span>
                    <span>{dispute.buyerName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Provider:</span>
                    <span>{dispute.providerName}</span>
                  </div>
                  <div className="mt-2">
                    <h4 className="text-sm font-medium mb-1">Reason for Dispute:</h4>
                    <p className="text-sm text-gray-300 line-clamp-3">{dispute.reason}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <div className="flex w-full space-x-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-pink-500 text-pink-500 hover:bg-pink-500/10"
                    onClick={() => window.open(dispute.evidence, "_blank")}
                  >
                    View Evidence
                  </Button>
                  <Button className="flex-1 bg-pink-500 hover:bg-pink-600" onClick={() => handleJudge(dispute)}>
                    Judge
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {selectedDispute && (
        <JudgePanel dispute={selectedDispute} open={judgePanelOpen} onOpenChange={setJudgePanelOpen} />
      )}
    </>
  )
}
