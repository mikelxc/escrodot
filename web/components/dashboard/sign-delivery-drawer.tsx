"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useAccount, useSignMessage } from "wagmi"

interface SignDeliveryDrawerProps {
  purchase: {
    id: string
    serviceId: string
    serviceName: string
    provider: string
    providerName: string
    price: string
    status: string
    deliveryUrl: string
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignDeliveryDrawer({ purchase, open, onOpenChange }: SignDeliveryDrawerProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [deliveryContent, setDeliveryContent] = useState<string | null>(null)
  const { address } = useAccount()

  const { signMessageAsync } = useSignMessage()

  // Mock delivery content
  const mockDeliveryContent = {
    READY_TO_SIGN: `# AI-Generated Code Review

Here's my analysis of your codebase:

1. **Performance Improvements**:
   - Identified 3 potential memory leaks
   - Suggested 5 optimizations for render performance

2. **Security Audit**:
   - No critical vulnerabilities found
   - 2 minor issues with input validation

3. **Code Quality**:
   - Overall structure is good
   - Recommended refactoring for 3 components

Would you like me to implement these changes for you?`,
    CLAIMED: `# Content Creation Complete

Here's the blog post you requested on "The Future of Blockchain":

## The Future of Blockchain: Beyond Cryptocurrency

Blockchain technology has evolved significantly since the introduction of Bitcoin. Today, it's being applied to supply chain management, healthcare records, voting systems, and more.

The next generation of blockchain platforms will focus on:

1. **Scalability** - Handling millions of transactions per second
2. **Interoperability** - Seamless communication between different blockchains
3. **Sustainability** - Reducing energy consumption through new consensus mechanisms

These advancements will enable blockchain to become a foundational technology for the digital economy.`,
  }

  // Simulate fetching delivery content
  useState(() => {
    if (open && !deliveryContent) {
      // In a real implementation, you would fetch from the delivery URL
      setTimeout(() => {
        setDeliveryContent(
          mockDeliveryContent[purchase.status as keyof typeof mockDeliveryContent] || "No content available",
        )
      }, 1000)
    }
  })

  const handleSign = async () => {
    if (!address) return

    setIsLoading(true)

    try {
      // Create a message to sign that includes purchase details
      const message = `I confirm receipt of delivery for service ${purchase.serviceId}, purchase ${purchase.id}. Release payment to provider ${purchase.provider}.`

      // Sign the message
      const signature = await signMessageAsync({ message })

      // In a real implementation, you would send this signature to your contract
      // through a server action or directly via wagmi hooks

      toast({
        title: "Delivery confirmed!",
        description: "You've successfully signed the delivery confirmation.",
      })

      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Signing failed",
        description: "There was an error signing the delivery confirmation.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg md:max-w-xl bg-black border-l border-gray-800 text-white">
        <SheetHeader>
          <SheetTitle className="text-xl">
            <span className="text-pink-500">{purchase.serviceName}</span> Delivery
          </SheetTitle>
          <SheetDescription className="text-gray-400">
            Review the delivery from {purchase.providerName} and sign to release payment
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 h-[calc(100vh-12rem)] overflow-y-auto">
          {!deliveryContent ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
            </div>
          ) : (
            <div className="prose prose-invert max-w-none">
              <div className="rounded-md bg-gray-900 p-6 border border-gray-800">
                <pre className="whitespace-pre-wrap">{deliveryContent}</pre>
              </div>
            </div>
          )}
        </div>

        <SheetFooter>
          {purchase.status === "READY_TO_SIGN" ? (
            <div className="flex w-full space-x-2">
              <Button
                variant="outline"
                className="flex-1 border-red-500 text-red-500 hover:bg-red-500/10"
                onClick={() => onOpenChange(false)}
              >
                Reject
              </Button>
              <Button
                className="flex-1 bg-pink-500 hover:bg-pink-600"
                onClick={handleSign}
                disabled={isLoading || !deliveryContent}
              >
                {isLoading ? "Signing..." : "Sign & Release Payment"}
              </Button>
            </div>
          ) : (
            <Button className="w-full" variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
