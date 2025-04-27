'use client';
import { Chain, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { assetHubWestend } from '../chains/polkadot-asset-hub'

export const config = getDefaultConfig({
  appName: 'EscroDot',
  projectId: 'YOUR_PROJECT_ID',
  chains: [
    assetHubWestend as Chain
  ],
  ssr: true,
});
