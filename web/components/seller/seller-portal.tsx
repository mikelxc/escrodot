"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreateServiceModal } from "@/components/seller/create-service-modal"
import { ServiceCard } from "@/components/seller/service-card"
import { ClaimTable } from "@/components/seller/claim-table"
import { TopUpStakeDrawer } from "@/components/seller/top-up-stake-drawer"
import { WithdrawStakeButton } from "@/components/seller/withdraw-stake-button"
import { ConnectButton } from "@/components/connect-button"
import { useAccount } from "wagmi"

// Mock data for demonstration
const mockServices = [
  {
    id: "1",
    name: "Code Assistant",
    description: "AI-powered coding assistant that helps with programming tasks",
    price: "0.5",
    gatewayUrl: "https://api.example.com/agents/code-assistant",
    stake: "2.5",
    purchases: 24,
    disputes: 0,
    pendingClaims: 3,
  },
  {
    id: "2",
    name: "Content Writer",
    description: "Creates high-quality blog posts and articles on any topic",
    price: "0.75",
    gatewayUrl: "https://api.example.com/agents/content-writer",
    stake: "3.0",
    purchases: 18,
    disputes: 1,
    pendingClaims: 1,
  },
]

const mockPendingClaims = [
  {
    id: "1",
    serviceId: "1",
    serviceName: "Code Assistant",
    buyer: "0x9876...5432",
    buyerName: "User123",
    price: "0.5",
    purchaseDate: "2025-04-25T12:00:00Z",
    deliveryDate: "2025-04-26T10:30:00Z",
    signature: "0x1234...abcd",
  },
  {
    id: "2",
    serviceId: "1",
    serviceName: "Code Assistant",
    buyer: "0x8765...4321",
    buyerName: "DevUser",
    price: "0.5",
    purchaseDate: "2025-04-24T14:15:00Z",
    deliveryDate: "2025-04-25T09:45:00Z",
    signature: "0x2345...bcde",
  },
  {
    id: "3",
    serviceId: "1",
    serviceName: "Code Assistant",
    buyer: "0x7654...3210",
    buyerName: "CodePro",
    price: "0.5",
    purchaseDate: "2025-04-23T16:30:00Z",
    deliveryDate: "2025-04-24T11:20:00Z",
    signature: "0x3456...cdef",
  },
  {
    id: "4",
    serviceId: "2",
    serviceName: "Content Writer",
    buyer: "0x6543...2109",
    buyerName: "BlogWriter",
    price: "0.75",
    purchaseDate: "2025-04-22T10:45:00Z",
    deliveryDate: "2025-04-23T13:15:00Z",
    signature: "0x4567...defg",
  },
]

interface SellerPortalProps {
  address: string
}

export function SellerPortal({ address }: SellerPortalProps) {
  const { isConnected, address: connectedAddress } = useAccount()
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [topUpDrawerOpen, setTopUpDrawerOpen] = useState(false)

  // Check if viewing own profile
  const isOwnProfile = address === "me" || address === connectedAddress

  // Mock total stake
  const totalStake = "5.5"

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-gray-800 rounded-lg bg-black/50">
        <p className="text-gray-400 mb-4">Connect your wallet to view your seller portal</p>
        <ConnectButton />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <Card className="flex-1 border-gray-800 bg-black/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Stake</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-3xl font-bold text-pink-500">{totalStake} WND</div>
              {isOwnProfile && (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    className="border-pink-500 text-pink-500 hover:bg-pink-500/10"
                    onClick={() => setTopUpDrawerOpen(true)}
                  >
                    Top Up
                  </Button>
                  <WithdrawStakeButton />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1 border-gray-800 bg-black/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-3xl font-bold text-pink-500">{mockServices.length}</div>
              {isOwnProfile && (
                <Button className="bg-pink-500 hover:bg-pink-600" onClick={() => setCreateModalOpen(true)}>
                  Create Service
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="services" className="w-full">
        <TabsList className="bg-black/50 border border-gray-800">
          <TabsTrigger value="services">Services</TabsTrigger>
          {isOwnProfile && <TabsTrigger value="claims">Pending Claims</TabsTrigger>}
        </TabsList>

        <TabsContent value="services" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockServices.map((service) => (
              <ServiceCard key={service.id} service={service} isOwner={isOwnProfile} />
            ))}
          </div>
        </TabsContent>

        {isOwnProfile && (
          <TabsContent value="claims" className="mt-6">
            <ClaimTable claims={mockPendingClaims} />
          </TabsContent>
        )}
      </Tabs>

      {isOwnProfile && (
        <>
          <CreateServiceModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
          <TopUpStakeDrawer open={topUpDrawerOpen} onOpenChange={setTopUpDrawerOpen} currentStake={totalStake} />
        </>
      )}
    </div>
  )
}
