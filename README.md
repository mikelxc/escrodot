# EscroDot - Polkadot Smart Contract DApp

EscroDot ports a complete escrow/staking workflow to Polkadot’s new Asset-Hub EVM:

- Factory pattern – one deploy of EscroDotFactory spins up a dedicated ServiceEscrow contract per agent, holding its own ledger yet sharing a centralized stake pot for slashing.
- Workflow – stake → list → buyer locks payment → off-chain agent returns a hash through CCIP-Read → buyer signs if happy → provider claims funds.
- Open arbitration – anyone posting stake ≥ job value can judge; refunds come from the provider’s collateral.
- Modern React front-end – Next.js + Tailwind + shadcn/ui, wagmi/viem hooks, RainbowKit wallet flow, Polkadot pink-on-black styling.
 

This project implements an escrow service on the Polkadot network using smart contracts and a React frontend. It allows users to create and manage escrow agreements with features like deposit, release, and dispute resolution.
<img width="1728" alt="Create new agents" src="https://github.com/user-attachments/assets/600a46df-b989-424a-a709-558172ffb6e9" />
<img width="1728" alt="get contents" src="https://github.com/user-attachments/assets/ffe35db6-4c69-4e3d-874d-370b008bdaae" />
<img width="1728" alt="Screenshot 2025-04-27 at 1 02 22 PM" src="https://github.com/user-attachments/assets/5d6e4a03-a953-49fb-97d4-b4eeda9f8bec" />

## Features

- Smart contract-based escrow system
- React frontend with Tailwind CSS
- Integration with MetaMask wallet
- Real-time balance and value tracking
- Transaction management interface

## Tech Stack

* [ethers](https://docs.ethers.org/v6/) for smart contract interaction
* [Tailwind CSS](https://tailwindcss.com) for styling
* [Vite](https://vite.dev/) for development tooling
* [Polkadot](https://polkadot.network/) for blockchain infrastructure

## Smart Contracts

The project includes two main smart contracts:
- `EscroDot.sol`: The main escrow contract with full functionality
- `EscroDotLite.sol`: A simplified version of the escrow contract

### Contract Features
- Create escrow agreements
- Deposit funds
- Release funds to beneficiaries
- Dispute resolution mechanism
- Signature verification for secure transactions

## Development Setup

### Smart Contract Development

#### Using Remix IDE
1. Run `pnpm remixd` to start the Remix development environment
2. Go to https://remix.polkadot.io and activate the REMIXD plugin
3. Start developing your smart contracts
4. After deploying and pinning a smart contract, run `pnpm contracts:export` to export contract data

#### Local Development
1. Edit smart contracts in the `contracts` directory
2. Run `pnpm contracts:build` to compile smart contracts
3. Run `pnpm contracts:deploy` to deploy them

Required environment variables:
- `ACCOUNT_SEED`: Seed phrase for the account that will sign the deployment
- `RPC_URL`: RPC endpoint URL (e.g., `https://westend-asset-hub-eth-rpc.polkadot.io` for Westend Asset Hub)

### Frontend Development

1. Run `pnpm frontend:dev` to start the development server
2. The frontend will automatically connect to your deployed smart contracts
3. Use MetaMask to interact with the contracts

## Interacting with Smart Contracts

The frontend provides a user-friendly interface to:
- View current contract state
- Check stored values
- Monitor contract balance
- Execute transactions
- Manage escrow agreements

Example contract interaction:
```ts
import { Contract } from "ethers";
import { contracts, ContractData } from "contracts"

const contractData: ContractData = contracts["your-contract-address"];
const contract = new Contract(contractData.address, contractData.abi, signer);

// Interact with contract methods
const transactionResponse = await contract.yourMethod();
```

## Additional Resources

* [Polkadot Smart Contracts Documentation](https://contracts.polkadot.io/)
* [Ethers.js Documentation](https://docs.ethers.org/v6/)
* [Polkadot Network](https://polkadot.network/)

