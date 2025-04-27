"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export function WithdrawStakeButton() {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleWithdraw = async () => {
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
      setOpen(false)

      toast({
        title: "Stake withdrawn!",
        description: `You've successfully withdrawn ${amount} WND from your stake.`,
      })

      setAmount("")
    }, 2000)

    // In a real implementation, you would use wagmi hooks:
    // const { writeContract } = useWriteContract()
    // try {
    //   const hash = await writeContract({
    //     address: CONTRACT_ADDRESS,
    //     abi: CONTRACT_ABI,
    //     functionName: 'withdrawStake',
    //     args: [parseEther(amount)]
    //   })
    //   // Handle success
    // } catch (error) {
    //   // Handle error
    // }
  }

  return (
    <>
      <Button
        variant="outline"
        className="border-red-500 text-red-500 hover:bg-red-500/10"
        onClick={() => setOpen(true)}
      >
        Withdraw
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-black border border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl">Withdraw Stake</DialogTitle>
            <DialogDescription className="text-gray-400">Withdraw WND from your stake</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="rounded-md bg-red-500/10 p-4 border border-red-500/20">
              <h4 className="font-medium mb-2 text-red-500">Warning</h4>
              <p className="text-sm text-gray-300">
                Withdrawing stake may affect your ability to maintain services. You must keep at least 2x the price of
                each service staked.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="withdraw-amount">Amount to Withdraw (WND)</Label>
              <Input
                id="withdraw-amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-black border-gray-800 focus-visible:ring-red-500"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} className="border-gray-800">
              Cancel
            </Button>
            <Button onClick={handleWithdraw} className="bg-red-500 hover:bg-red-600" disabled={isLoading}>
              {isLoading ? "Processing..." : "Withdraw"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
