"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface AgentCardProps {
  agent: {
    id: string
    name: string
    description: string
    price: string
    provider: string
    providerName: string
    tags: string[]
    gatewayUrl: string
    purchases: number
    disputes: number
  }
  onBuy: () => void
}

export function AgentCard({ agent, onBuy }: AgentCardProps) {
  const initials = agent.providerName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <Card className="overflow-hidden border border-gray-800 bg-black hover:border-pink-500/50 transition-all">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8 bg-pink-500/20">
              <AvatarFallback className="text-pink-500">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold">{agent.name}</h3>
              <p className="text-xs text-gray-400">by {agent.providerName}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-pink-500">{agent.price} WND</div>
            <div className="text-xs text-gray-400">{agent.purchases} purchases</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-gray-300 mb-3">{agent.description}</p>
        <div className="flex flex-wrap gap-1">
          {agent.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs border-pink-500/50 text-pink-500">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button onClick={onBuy} className="w-full bg-pink-500 hover:bg-pink-600">
          Hire Agent
        </Button>
      </CardFooter>
    </Card>
  )
}
