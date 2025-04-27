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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { StakeBadge } from "@/components/arbiter/stake-badge"

interface JudgePanelProps {
  dispute: {
    id: string
    serviceId: string
    purchaseId: string
    serviceName: string
    buyer: string
    buyerName: string
    provider: string
    providerName: string
    price: string
    reason: string
    evidence: string
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function JudgePanel({ dispute, open, onOpenChange }: JudgePanelProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [stakeAmount, setStakeAmount] = useState(dispute.price)
  const [decision, setDecision] = useState<"refund" | "deny">("refund")

  const handleResolve = async () => {
    if (!stakeAmount || Number.parseFloat(stakeAmount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid stake amount",
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
        title: "Dispute resolved!",
        description: `You've successfully resolved the dispute in favor of the ${
          decision === "refund" ? "buyer" : "provider"
        }.`,
      })
    }, 2000)

    // In a real implementation, you would use wagmi hooks:
    // const { writeContract } = useWriteContract()
    // try {
    //   const hash = await writeContract({
    //     address: CONTRACT_ADDRESS,
    //     abi: CONTRACT_ABI,
    //     functionName: 'resolveDispute',
    //     args: [dispute.serviceId, dispute.purchaseId, decision === "refund", parseEther(stakeAmount)],
    //     value: parseEther(stakeAmount)
    //   })
    //   // Handle success
    // } catch (error) {
    //   // Handle error
    // }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black border border-gray-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Resolve <span className="text-pink-500">Dispute</span>
          </DialogTitle>
          <DialogDescription className="text-gray-400">Review the evidence and make a fair judgment</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-md bg-pink-500/10 p-4 border border-pink-500/20">
            <h4 className="font-medium mb-2">Dispute Details</h4>
            <p className="text-sm text-gray-300">Service: {dispute.serviceName}</p>
            <p className="text-sm text-gray-300">Buyer: {dispute.buyerName}</p>
            <p className="text-sm text-gray-300">Provider: {dispute.providerName}</p>
            <p className="text-sm text-gray-300">Amount: {dispute.price} WND</p>
            <div className="mt-2">
              <p className="text-sm font-medium">Reason:</p>
              <p className="text-sm text-gray-300">{dispute.reason}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="stake-amount">Stake Amount (WND)</Label>
              <StakeBadge amount={stakeAmount} />
            </div>
            <Input
              id="stake-amount"
              type="number"
              step="0.01"
              min={dispute.price}
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              className="bg-black border-gray-800 focus-visible:ring-pink-500"
            />
            <p className="text-xs text-gray-400">You must stake at least the purchase amount ({dispute.price} WND)</p>
          </div>

          <div className="space-y-2">
            <Label>Decision</Label>
            <RadioGroup value={decision} onValueChange={(value) => setDecision(value as "refund" | "deny")}>
              <div className="flex items-center space-x-2 rounded-md border border-gray-800 p-3">
                <RadioGroupItem value="refund" id="refund" className="text-pink-500" />
                <Label htmlFor="refund" className="flex-1 cursor-pointer">
                  <div className="font-medium">Refund Buyer</div>
                  <div className="text-xs text-gray-400">The buyer's complaint is valid</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-md border border-gray-800 p-3">
                <RadioGroupItem value="deny" id="deny" className="text-pink-500" />
                <Label htmlFor="deny" className="flex-1 cursor-pointer">
                  <div className="font-medium">Deny Refund</div>
                  <div className="text-xs text-gray-400">The provider fulfilled their obligation</div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="text-sm text-gray-400">
            <p>
              Your decision is final and will be executed on-chain. You will earn a small fee for your arbitration
              service.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-gray-800">
            Cancel
          </Button>
          <Button onClick={handleResolve} className="bg-pink-500 hover:bg-pink-600" disabled={isLoading}>
            {isLoading ? "Processing..." : "Resolve Dispute"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
