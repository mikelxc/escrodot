import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface ServiceCardProps {
  service: {
    id: string
    name: string
    description: string
    price: string
    gatewayUrl: string
    stake: string
    purchases: number
    disputes: number
    pendingClaims: number
  }
  isOwner: boolean
}

export function ServiceCard({ service, isOwner }: ServiceCardProps) {
  return (
    <Card className="overflow-hidden border border-gray-800 bg-black hover:border-pink-500/50 transition-all">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg">{service.name}</h3>
          <div className="text-right">
            <div className="text-lg font-bold text-pink-500">{service.price} WND</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-gray-300 mb-3">{service.description}</p>
        <p className="text-xs text-gray-400 truncate">Gateway: {service.gatewayUrl}</p>

        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="bg-pink-500/10 p-2 rounded-md text-center">
            <div className="text-lg font-semibold">{service.purchases}</div>
            <div className="text-xs text-gray-400">Purchases</div>
          </div>
          <div className="bg-pink-500/10 p-2 rounded-md text-center">
            <div className="text-lg font-semibold">{service.stake} WND</div>
            <div className="text-xs text-gray-400">Staked</div>
          </div>
          <div className="bg-pink-500/10 p-2 rounded-md text-center">
            <div className="text-lg font-semibold">{service.disputes}</div>
            <div className="text-xs text-gray-400">Disputes</div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        {isOwner ? (
          <div className="flex w-full space-x-2">
            <Button variant="outline" className="flex-1 border-pink-500 text-pink-500 hover:bg-pink-500/10">
              Edit
            </Button>
            {service.pendingClaims > 0 && (
              <Button className="flex-1 bg-pink-500 hover:bg-pink-600">Claim ({service.pendingClaims})</Button>
            )}
          </div>
        ) : (
          <Link href={`/market?service=${service.id}`} className="w-full">
            <Button className="w-full bg-pink-500 hover:bg-pink-600">View in Market</Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  )
}
