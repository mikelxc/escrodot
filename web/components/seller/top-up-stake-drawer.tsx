"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface TopUpStakeDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentStake: string
}

export function TopUpStakeDrawer({ open, onOpenChange, currentStake }: TopUpStakeDrawerProps) {
  const { toast } = useToast()
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleTopUp = async () => {
    if (!amount || Number.parseFloat(amount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
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
        title: "Stake increased!",
        description: `You've successfully added ${amount} WND to your stake.`,
      })

      setAmount("")
    }, 2000)

    // In a real implementation, you would use wagmi hooks:
    // const { writeContract } = useWriteContract()
    // try {
    //   const hash = await writeContract({
    //     address: CONTRACT_ADDRESS,
    //     abi: CONTRACT_ABI,
    //     functionName: 'addStake',
    //     value: parseEther(amount)
    //   })
    //   // Handle success
    // } catch (error) {
    //   // Handle error
    // }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md bg-black border-r border-gray-800 text-white">
        <SheetHeader>
          <SheetTitle className="text-xl">Top Up Stake</SheetTitle>
          <SheetDescription className="text-gray-400">
            Add more WND to your stake to create more services
          </SheetDescription>
        </SheetHeader>

        <div className="py-6">
          <div className="rounded-md bg-pink-500/10 p-4 border border-pink-500/20 mb-6">
            <h4 className="font-medium mb-2">Current Stake</h4>
            <p className="text-2xl font-bold text-pink-500">{currentStake} WND</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount to Add (WND)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-black border-gray-800 focus-visible:ring-pink-500"
            />
          </div>

          <div className="text-sm text-gray-400 mt-4">
            <p>
              Your stake secures your services and allows you to create more offerings. The minimum stake required is 2x
              the price of each service you create.
            </p>
          </div>
        </div>

        <SheetFooter>
          <Button onClick={handleTopUp} className="w-full bg-pink-500 hover:bg-pink-600" disabled={isLoading}>
            {isLoading ? "Processing..." : "Add Stake"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
