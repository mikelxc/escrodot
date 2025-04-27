"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface ClaimTableProps {
  claims: {
    id: string
    serviceId: string
    serviceName: string
    buyer: string
    buyerName: string
    price: string
    purchaseDate: string
    deliveryDate: string
    signature: string
  }[]
}

export function ClaimTable({ claims }: ClaimTableProps) {
  const { toast } = useToast()
  const [claimingIds, setClaimingIds] = useState<string[]>([])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleClaim = async (claim: (typeof claims)[0]) => {
    setClaimingIds((prev) => [...prev, claim.id])

    // Simulate transaction
    setTimeout(() => {
      setClaimingIds((prev) => prev.filter((id) => id !== claim.id))

      toast({
        title: "Payment claimed!",
        description: `You've successfully claimed ${claim.price} WND for service "${claim.serviceName}".`,
      })
    }, 2000)

    // In a real implementation, you would use wagmi hooks:
    // const { writeContract } = useWriteContract()
    // try {
    //   const hash = await writeContract({
    //     address: CONTRACT_ADDRESS,
    //     abi: CONTRACT_ABI,
    //     functionName: 'claimPayment',
    //     args: [claim.serviceId, claim.id, claim.signature]
    //   })
    //   // Handle success
    // } catch (error) {
    //   // Handle error
    // }
  }

  return (
    <div className="rounded-lg border border-gray-800 bg-black/50">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Service</TableHead>
            <TableHead>Buyer</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Delivery Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {claims.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-gray-400">
                No pending claims
              </TableCell>
            </TableRow>
          ) : (
            claims.map((claim) => (
              <TableRow key={claim.id} className="hover:bg-pink-500/5">
                <TableCell className="font-medium">{claim.serviceName}</TableCell>
                <TableCell>{claim.buyerName}</TableCell>
                <TableCell>{claim.price} WND</TableCell>
                <TableCell>{formatDate(claim.deliveryDate)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    className="bg-pink-500 hover:bg-pink-600"
                    size="sm"
                    onClick={() => handleClaim(claim)}
                    disabled={claimingIds.includes(claim.id)}
                  >
                    {claimingIds.includes(claim.id) ? "Claiming..." : "Claim Payment"}
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
