import { http, createConfig, fallback } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { injected, coinbaseWallet } from 'wagmi/connectors'

export const config = createConfig({
  chains: [baseSepolia],
  connectors: [
    injected(),
    coinbaseWallet({ appName: 'Stake-To-Done' }),
  ],
  transports: {
    [baseSepolia.id]: fallback([
      http('https://sepolia.base.org'),
      http('https://base-sepolia-rpc.publicnode.com'),
      http('https://base-sepolia.blockpi.network/v1/rpc/public'),
      http(),
    ]),
  },
})