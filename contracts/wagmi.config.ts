import { defineConfig } from '@wagmi/cli'
import * as ServiceEscrow from "./.deploys/pinned-contracts/420420421/0x8329d87b6d9dc559c7b2df43bf8103018a4e0620.json"

export default defineConfig({
  out: 'src/generated.ts',
  contracts: [
    {
      name: ServiceEscrow.name,
      address: ServiceEscrow.address as `0x${string}`,
      abi: ServiceEscrow.abi as any,
    },
  ],
  plugins: [],
})
