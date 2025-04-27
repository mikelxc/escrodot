'use client';
import React from "react"
import { Inter } from "next/font/google"
import '@rainbow-me/rainbowkit/styles.css';
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import dynamic from 'next/dynamic'

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

// Dynamically import client-side only components
const WagmiProvider = dynamic(() => import('wagmi').then(mod => mod.WagmiProvider), { ssr: false })
const RainbowKitProvider = dynamic(() => import('@rainbow-me/rainbowkit').then(mod => mod.RainbowKitProvider), { ssr: false })
const QueryClientProvider = dynamic(() => import('@tanstack/react-query').then(mod => mod.QueryClientProvider), { ssr: false })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [queryClient] = React.useState(() => new (require('@tanstack/react-query').QueryClient)())
  const config = require('@/components/wagmi-config').config

  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans bg-black text-white`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
              <RainbowKitProvider>
                {children}
              </RainbowKitProvider>
            </QueryClientProvider>
          </WagmiProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
