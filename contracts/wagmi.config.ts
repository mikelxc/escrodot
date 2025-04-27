import { defineConfig } from '@wagmi/cli'
import * as ServiceEscrow from "./.deploys/pinned-contracts/420420421/0xc9e25a24d6d98c3877817827e7d1f7a6c12d811f.json"

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
