"use client"

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
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface RaiseDisputeModalProps {
  purchase: {
    id: string
    serviceId: string
    serviceName: string
    provider: string
    providerName: string
    price: string
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RaiseDisputeModal({ purchase, open, onOpenChange }: RaiseDisputeModalProps) {
  const { toast } = useToast()
  const [reason, setReason] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for the dispute",
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
        title: "Dispute raised",
        description: "Your dispute has been submitted for arbitration.",
      })
    }, 2000)

    // In a real implementation, you would use wagmi hooks:
    // const { writeContract } = useWriteContract()
    // try {
    //   const hash = await writeContract({
    //     address: CONTRACT_ADDRESS,
    //     abi: CONTRACT_ABI,
    //     functionName: 'raiseDispute',
    //     args: [purchase.serviceId, purchase.id, reason]
    //   })
    //   // Handle success
    // } catch (error) {
    //   // Handle error
    // }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black border border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Raise Dispute for <span className="text-pink-500">{purchase.serviceName}</span>
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Explain why you're disputing this service. An arbiter will review your case.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-md bg-pink-500/10 p-4 border border-pink-500/20">
            <h4 className="font-medium mb-2">Purchase Details</h4>
            <p className="text-sm text-gray-300">Service: {purchase.serviceName}</p>
            <p className="text-sm text-gray-300">Provider: {purchase.providerName}</p>
            <p className="text-sm text-gray-300">Amount: {purchase.price} WND</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="reason" className="text-sm font-medium">
              Reason for Dispute
            </label>
            <Textarea
              id="reason"
              placeholder="Explain why you're disputing this service..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="h-32 bg-black border-gray-800 focus-visible:ring-pink-500"
            />
          </div>

          <div className="text-sm text-gray-400">
            <p>
              By raising a dispute, the payment will be held in escrow until an arbiter reviews your case. This process
              may take some time.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-gray-800">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-pink-500 hover:bg-pink-600" disabled={isLoading}>
            {isLoading ? "Submitting..." : "Submit Dispute"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
