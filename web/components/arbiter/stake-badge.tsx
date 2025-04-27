import { Badge } from "@/components/ui/badge"

interface StakeBadgeProps {
  amount: string
}

export function StakeBadge({ amount }: StakeBadgeProps) {
  // Mock check if user has sufficient stake
  const userStake = 10.0
  const isEligible = Number.parseFloat(amount) <= userStake

  return (
    <Badge
      variant="outline"
      className={`${isEligible ? "border-green-500 text-green-500" : "border-red-500 text-red-500"}`}
    >
      {isEligible ? "Eligible" : "Insufficient Stake"}
    </Badge>
  )
}
