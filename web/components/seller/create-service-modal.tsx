"use client"

import React from "react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useWalletClient, useWriteContract, useAccount, useWaitForTransactionReceipt, usePublicClient } from 'wagmi'
import { escrowAbi, escrowAddress } from "@/lib/contract"
import { parseEther, isAddress } from 'viem'
import { Loader2 } from "lucide-react"
import Link from "next/link"

interface CreateServiceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateServiceModal({ open, onOpenChange }: CreateServiceModalProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined)
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const { writeContract, isPending } = useWriteContract()
  const { data: receipt, isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    gatewayUrl: "",
  })

  const priceInWei = formData.price ? parseEther(formData.price) : parseEther("0")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!formData.name || !formData.description || !formData.price || !formData.gatewayUrl) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    if (!address) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        variant: "destructive",
      })
      return
    }

    if (!publicClient) {
      toast({
        title: "Error",
        description: "Failed to initialize public client",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // First simulate the transaction
      const { request } = await publicClient.simulateContract({
        address: escrowAddress,
        abi: escrowAbi,
        functionName: 'createService',
        args: [
          // formData.name,
          priceInWei,
          formData.gatewayUrl,
          // formData.description
        ] as const,
        value: priceInWei,
        account: address,
      })

      // Then write the contract
      const hash = await writeContract({
        address: escrowAddress,
        abi: escrowAbi,
        functionName: 'createService',
        args: [
          // formData.name,
          priceInWei,
          formData.gatewayUrl,
          // formData.description
        ] as const,
        value: priceInWei,
      }) as unknown as `0x${string}`

      setTxHash(hash)
      toast({
        title: "Transaction submitted",
        description: (
          <div className="flex flex-col gap-2">
            <p>Your service "{formData.name}" is being created.</p>
            <Link 
              href={`https://westend.subscan.io/extrinsic/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-500 hover:underline"
            >
              View transaction on Subscan
            </Link>
          </div>
        ),
      })
    } catch (error) {
      console.error('Error creating service:', error)
      toast({
        title: "Error",
        description: "Failed to create service. Please check your inputs and try again.",
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
        title: "Service created!",
        description: `Your service "${formData.name}" has been created successfully.`,
      })
    }
  }, [receipt, formData.name, onOpenChange, toast])

  // Calculate required stake 
  const requiredStake = formData.price ? (Number.parseFloat(formData.price)).toFixed(2) : "0.00"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black border border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl">Create New Service</DialogTitle>
          <DialogDescription className="text-gray-400">List your AI agent service on the marketplace</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Service Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g., Code Assistant"
              value={formData.name}
              onChange={handleChange}
              className="bg-black border-gray-800 focus-visible:ring-pink-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe what your service does..."
              value={formData.description}
              onChange={handleChange}
              className="h-20 bg-black border-gray-800 focus-visible:ring-pink-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price (WND)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={formData.price}
              onChange={handleChange}
              className="bg-black border-gray-800 focus-visible:ring-pink-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gatewayUrl">Gateway URL</Label>
            <Input
              id="gatewayUrl"
              name="gatewayUrl"
              placeholder="https://your-agent-gateway.com"
              value={formData.gatewayUrl}
              onChange={handleChange}
              className="bg-black border-gray-800 focus-visible:ring-pink-500"
            />
          </div>

          {/* <div className="space-y-2">
            <Label htmlFor="gatewaySigner">Gateway Signer</Label>
            <Input
              id="gatewaySigner"
              name="gatewaySigner"
              placeholder="0x0000000000000000000000000000000000000000"
              value={formData.gatewaySigner}
              onChange={handleChange}
              className="bg-black border-gray-800 focus-visible:ring-pink-500"
            />
          </div> */}

          <div className="rounded-md bg-pink-500/10 p-4 border border-pink-500/20">
            <h4 className="font-medium mb-2">Stake Requirement</h4>
            <p className="text-sm text-gray-300">
              Required stake: <span className="font-bold text-pink-500">{requiredStake} WND</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              You must have at least the service price staked to create this service.
            </p>
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-gray-800">
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={handleSubmit} 
            className="bg-pink-500 hover:bg-pink-600" 
            disabled={isLoading || isPending || isConfirming}
          >
            {isLoading || isPending || isConfirming ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isConfirming ? "Confirming..." : "Creating..."}
              </>
            ) : (
              "Create Service"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
