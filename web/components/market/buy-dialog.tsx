"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { ConnectButton } from "@/components/connect-button"
import { useToast } from "@/hooks/use-toast"
import { parseEther } from "viem"
import { Loader2 } from "lucide-react"
import { escrowAbi, escrowAddress } from "@/lib/contract"

interface BuyDialogProps {
  agent: {
    id: string
    name: string
    description: string
    price: string
    provider: string
    providerName: string
    gatewayUrl: string
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BuyDialog({ agent, open, onOpenChange }: BuyDialogProps) {
  const { isConnected } = useAccount()
  const [isLoading, setIsLoading] = useState(false)
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined)
  const { toast } = useToast()
  const { writeContract, isPending } = useWriteContract()
  const { data: receipt, isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  const handleBuy = async () => {
    setIsLoading(true)

    try {
      const hash = await writeContract({
        address: escrowAddress,
        abi: escrowAbi,
        functionName: 'buyService',
        args: [BigInt(agent.id)],
        value: parseEther(agent.price)
      }) as unknown as `0x${string}`

      setTxHash(hash)
      toast({
        title: "Transaction submitted",
        description: "Your purchase is being processed. Please wait for confirmation.",
      })
    } catch (error) {
      console.error('Error purchasing service:', error)
      toast({
        title: "Error",
        description: "Failed to purchase service. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  // Handle transaction status changes
  React.useEffect(() => {
    if (receipt) {
      setIsLoading(false)
      onOpenChange(false)
      toast({
        title: "Purchase successful!",
        description: `You've hired ${agent.name}. Check your dashboard for updates.`,
      })
    }
  }, [receipt, agent.name, onOpenChange, toast])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black border border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Hire <span className="text-pink-500">{agent.name}</span>
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            You are about to hire this agent for {agent.price} WND
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-md bg-pink-500/10 p-4 border border-pink-500/20">
            <h4 className="font-medium mb-2">Service Details</h4>
            <p className="text-sm text-gray-300">{agent.description}</p>
            <p className="text-sm text-gray-400 mt-2">Gateway: {agent.gatewayUrl}</p>
            <p className="text-sm text-gray-400">Provider: {agent.provider}</p>
          </div>

          <div className="text-sm text-gray-400">
            <p>
              By hiring this agent, you agree to the terms of service. The payment will be held in escrow until you
              confirm delivery.
            </p>
          </div>
        </div>

        <DialogFooter>
          {isConnected ? (
            <Button 
              onClick={handleBuy} 
              className="w-full bg-pink-500 hover:bg-pink-600" 
              disabled={isLoading || isPending || isConfirming}
            >
              {isLoading || isPending || isConfirming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isConfirming ? "Confirming..." : "Processing..."}
                </>
              ) : (
                `Pay ${agent.price} WND`
              )}
            </Button>
          ) : (
            <div className="w-full flex justify-center">
              <ConnectButton />
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
