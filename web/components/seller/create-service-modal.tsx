"use client"

import type React from "react"

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

interface CreateServiceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateServiceModal({ open, onOpenChange }: CreateServiceModalProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    gatewayUrl: "",
  })

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

    setIsLoading(true)

    // Simulate transaction
    setTimeout(() => {
      setIsLoading(false)
      onOpenChange(false)

      toast({
        title: "Service created!",
        description: `Your service "${formData.name}" has been created successfully.`,
      })

      // Reset form
      setFormData({
        name: "",
        description: "",
        price: "",
        gatewayUrl: "",
      })
    }, 2000)

    // In a real implementation, you would use wagmi hooks:
    // const { writeContract } = useWriteContract()
    // try {
    //   const hash = await writeContract({
    //     address: CONTRACT_ADDRESS,
    //     abi: CONTRACT_ABI,
    //     functionName: 'createService',
    //     args: [formData.price, formData.gatewayUrl]
    //   })
    //   // Handle success
    // } catch (error) {
    //   // Handle error
    // }
  }

  // Calculate required stake (2x the price)
  const requiredStake = formData.price ? (Number.parseFloat(formData.price) * 2).toFixed(2) : "0.00"

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

          <div className="rounded-md bg-pink-500/10 p-4 border border-pink-500/20">
            <h4 className="font-medium mb-2">Stake Requirement</h4>
            <p className="text-sm text-gray-300">
              Required stake: <span className="font-bold text-pink-500">{requiredStake} WND</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              You must have at least 2x the service price staked to create this service.
            </p>
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-gray-800">
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} className="bg-pink-500 hover:bg-pink-600" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Service"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
