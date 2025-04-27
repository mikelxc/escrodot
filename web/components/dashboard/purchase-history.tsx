"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SignDeliveryDrawer } from "@/components/dashboard/sign-delivery-drawer"
import { RaiseDisputeModal } from "@/components/dashboard/raise-dispute-modal"
import { ConnectButton } from "@/components/connect-button"
import { useAccount } from "wagmi"

// Mock data for demonstration
const mockPurchases = [
  {
    id: "1",
    serviceId: "1",
    serviceName: "Code Assistant",
    provider: "0x1234...5678",
    providerName: "CodeMaster",
    price: "0.5",
    status: "WAIT_DELIVERY",
    purchaseDate: "2025-04-25T12:00:00Z",
    deliveryUrl: "",
  },
  {
    id: "2",
    serviceId: "3",
    serviceName: "Image Generator",
    provider: "0x3456...7890",
    providerName: "PixelMaster",
    price: "1.2",
    status: "READY_TO_SIGN",
    purchaseDate: "2025-04-24T15:30:00Z",
    deliveryUrl: "https://api.example.com/delivery/3/2",
  },
  {
    id: "3",
    serviceId: "2",
    serviceName: "Content Writer",
    provider: "0x2345...6789",
    providerName: "WriterPro",
    price: "0.75",
    status: "CLAIMED",
    purchaseDate: "2025-04-20T09:15:00Z",
    deliveryUrl: "https://api.example.com/delivery/2/3",
  },
  {
    id: "4",
    serviceId: "4",
    serviceName: "Data Analyzer",
    provider: "0x4567...8901",
    providerName: "DataWiz",
    price: "0.9",
    status: "DISPUTED",
    purchaseDate: "2025-04-18T14:45:00Z",
    deliveryUrl: "https://api.example.com/delivery/4/4",
  },
]

export function PurchaseHistory() {
  const { isConnected } = useAccount()
  const [signDrawerOpen, setSignDrawerOpen] = useState(false)
  const [disputeModalOpen, setDisputeModalOpen] = useState(false)
  const [selectedPurchase, setSelectedPurchase] = useState<(typeof mockPurchases)[0] | null>(null)

  const handleViewDelivery = (purchase: (typeof mockPurchases)[0]) => {
    setSelectedPurchase(purchase)
    setSignDrawerOpen(true)
  }

  const handleRaiseDispute = (purchase: (typeof mockPurchases)[0]) => {
    setSelectedPurchase(purchase)
    setDisputeModalOpen(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "WAIT_DELIVERY":
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-500">
            Awaiting Delivery
          </Badge>
        )
      case "READY_TO_SIGN":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-500">
            Ready to Sign
          </Badge>
        )
      case "CLAIMED":
        return (
          <Badge variant="outline" className="border-green-500 text-green-500">
            Completed
          </Badge>
        )
      case "DISPUTED":
        return (
          <Badge variant="outline" className="border-red-500 text-red-500">
            Disputed
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-gray-800 rounded-lg bg-black/50">
        <p className="text-gray-400 mb-4">Connect your wallet to view your purchase history</p>
        <ConnectButton />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-800 bg-black/50">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Service</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockPurchases.map((purchase) => (
              <TableRow key={purchase.id} className="hover:bg-pink-500/5">
                <TableCell className="font-medium">{purchase.serviceName}</TableCell>
                <TableCell>{purchase.providerName}</TableCell>
                <TableCell>{purchase.price} WND</TableCell>
                <TableCell>{formatDate(purchase.purchaseDate)}</TableCell>
                <TableCell>{getStatusBadge(purchase.status)}</TableCell>
                <TableCell className="text-right">
                  {purchase.status === "READY_TO_SIGN" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-pink-500 text-pink-500 hover:bg-pink-500/10"
                      onClick={() => handleViewDelivery(purchase)}
                    >
                      View & Sign
                    </Button>
                  )}
                  {(purchase.status === "WAIT_DELIVERY" || purchase.status === "READY_TO_SIGN") && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-2 border-red-500 text-red-500 hover:bg-red-500/10"
                      onClick={() => handleRaiseDispute(purchase)}
                    >
                      Dispute
                    </Button>
                  )}
                  {purchase.status === "CLAIMED" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-green-500 text-green-500 hover:bg-green-500/10"
                      onClick={() => handleViewDelivery(purchase)}
                    >
                      View Result
                    </Button>
                  )}
                  {purchase.status === "DISPUTED" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-500 text-gray-500 hover:bg-gray-500/10"
                      disabled
                    >
                      Pending Arbitration
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedPurchase && (
        <>
          <SignDeliveryDrawer purchase={selectedPurchase} open={signDrawerOpen} onOpenChange={setSignDrawerOpen} />
          <RaiseDisputeModal purchase={selectedPurchase} open={disputeModalOpen} onOpenChange={setDisputeModalOpen} />
        </>
      )}
    </div>
  )
}
