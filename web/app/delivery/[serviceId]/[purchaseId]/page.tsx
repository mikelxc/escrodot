"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useAccount, useSignMessage } from "wagmi"
import { ConnectButton } from "@/components/connect-button"

interface DeliveryPageProps {
  params: {
    serviceId: string
    purchaseId: string
  }
}

export default function DeliveryPage({ params }: DeliveryPageProps) {
  const { serviceId, purchaseId } = params
  const { toast } = useToast()
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()

  const [isLoading, setIsLoading] = useState(true)
  const [isSigning, setIsSigning] = useState(false)
  const [deliveryContent, setDeliveryContent] = useState<string | null>(null)
  const [purchaseDetails, setPurchaseDetails] = useState<{
    serviceName: string
    providerName: string
    price: string
  } | null>(null)

  // Simulate fetching delivery content and purchase details
  useEffect(() => {
    const fetchData = async () => {
      // In a real implementation, you would fetch from the contract and gateway
      setTimeout(() => {
        setDeliveryContent(`# AI-Generated Content for Service ${serviceId}

Here's the content you requested for purchase #${purchaseId}:

## Analysis Results

1. **Key Findings**:
   - Identified 5 major trends in your data
   - Discovered 3 potential optimization opportunities
   - Highlighted 2 risk factors that need attention

2. **Recommendations**:
   - Implement A/B testing for the new feature
   - Optimize the database queries for better performance
   - Consider adding more monitoring for the identified risk areas

3. **Next Steps**:
   - Schedule a follow-up to discuss implementation details
   - Prepare a timeline for the recommended changes
   - Allocate resources for the highest priority items

Would you like me to elaborate on any specific point?`)

        setPurchaseDetails({
          serviceName: "Data Analyzer",
          providerName: "DataWiz",
          price: "0.9",
        })

        setIsLoading(false)
      }, 1500)
    }

    fetchData()
  }, [serviceId, purchaseId])

  const handleSign = async () => {
    if (!address || !purchaseDetails) return

    setIsSigning(true)

    try {
      // Create a message to sign that includes purchase details
      const message = `I confirm receipt of delivery for service ${serviceId}, purchase ${purchaseId}. Release payment to provider.`

      // Sign the message
      const signature = await signMessageAsync({ message })

      // In a real implementation, you would send this signature to your contract
      // through a server action or directly via wagmi hooks

      toast({
        title: "Delivery confirmed!",
        description: "You've successfully signed the delivery confirmation.",
      })
    } catch (error) {
      toast({
        title: "Signing failed",
        description: "There was an error signing the delivery confirmation.",
        variant: "destructive",
      })
    } finally {
      setIsSigning(false)
    }
  }

  return (
    <main className="min-h-screen bg-dotted-pink-500">
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto border border-gray-800 bg-black/50">
          <CardHeader>
            <CardTitle className="text-xl flex items-center justify-between">
              <span>
                <span className="text-pink-500">Delivery</span> Confirmation
              </span>
              {!isLoading && purchaseDetails && (
                <span className="text-lg font-normal text-gray-400">
                  {purchaseDetails.serviceName} by {purchaseDetails.providerName}
                </span>
              )}
            </CardTitle>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
              </div>
            ) : (
              <div className="prose prose-invert max-w-none">
                <div className="rounded-md bg-gray-900 p-6 border border-gray-800">
                  <pre className="whitespace-pre-wrap">{deliveryContent}</pre>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row gap-4">
            {isConnected ? (
              <>
                <Button variant="outline" className="flex-1 border-red-500 text-red-500 hover:bg-red-500/10">
                  Raise Dispute
                </Button>
                <Button
                  className="flex-1 bg-pink-500 hover:bg-pink-600"
                  onClick={handleSign}
                  disabled={isLoading || isSigning}
                >
                  {isSigning ? "Signing..." : "Sign & Release Payment"}
                </Button>
              </>
            ) : (
              <div className="w-full flex justify-center">
                <ConnectButton />
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}
