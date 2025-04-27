"use client"

import { useState } from "react"
import { AgentCard } from "@/components/market/agent-card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { BuyDialog } from "@/components/market/buy-dialog"

// Mock data for demonstration
const mockAgents = [
  {
    id: "1",
    name: "Code Assistant",
    description: "AI-powered coding assistant that helps with programming tasks",
    price: "0.5",
    provider: "0x1234...5678",
    providerName: "CodeMaster",
    tags: ["coding", "development", "assistance"],
    gatewayUrl: "https://api.example.com/agents/code-assistant",
    purchases: 24,
    disputes: 0,
  },
  {
    id: "2",
    name: "Content Writer",
    description: "Creates high-quality blog posts and articles on any topic",
    price: "0.75",
    provider: "0x2345...6789",
    providerName: "WriterPro",
    tags: ["writing", "content", "blog"],
    gatewayUrl: "https://api.example.com/agents/content-writer",
    purchases: 18,
    disputes: 1,
  },
  {
    id: "3",
    name: "Image Generator",
    description: "Creates custom images based on text descriptions",
    price: "1.2",
    provider: "0x3456...7890",
    providerName: "PixelMaster",
    tags: ["image", "art", "generation"],
    gatewayUrl: "https://api.example.com/agents/image-generator",
    purchases: 32,
    disputes: 2,
  },
  {
    id: "4",
    name: "Data Analyzer",
    description: "Analyzes data sets and provides insights and visualizations",
    price: "0.9",
    provider: "0x4567...8901",
    providerName: "DataWiz",
    tags: ["data", "analysis", "visualization"],
    gatewayUrl: "https://api.example.com/agents/data-analyzer",
    purchases: 15,
    disputes: 0,
  },
]

export function AgentGallery() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedAgent, setSelectedAgent] = useState<(typeof mockAgents)[0] | null>(null)
  const [buyDialogOpen, setBuyDialogOpen] = useState(false)

  // Get all unique tags
  const allTags = Array.from(new Set(mockAgents.flatMap((agent) => agent.tags)))

  // Filter agents based on search term and selected tags
  const filteredAgents = mockAgents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTags = selectedTags.length === 0 || selectedTags.some((tag) => agent.tags.includes(tag))

    return matchesSearch && matchesTags
  })

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const handleBuy = (agent: (typeof mockAgents)[0]) => {
    setSelectedAgent(agent)
    setBuyDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search agents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-black border-pink-500 focus-visible:ring-pink-500"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              className={`cursor-pointer ${
                selectedTags.includes(tag)
                  ? "bg-pink-500 hover:bg-pink-600"
                  : "border-pink-500 text-pink-500 hover:bg-pink-500/10"
              }`}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} onBuy={() => handleBuy(agent)} />
        ))}
      </div>

      {selectedAgent && <BuyDialog agent={selectedAgent} open={buyDialogOpen} onOpenChange={setBuyDialogOpen} />}
    </div>
  )
}
