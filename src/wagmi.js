import { http, createConfig, fallback } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { injected, coinbaseWallet, metaMask, walletConnect } from 'wagmi/connectors'

export const config = createConfig({
  chains: [baseSepolia],
  connectors: [
    injected(),
    metaMask(),
    coinbaseWallet({ appName: 'Stake-To-Done' }),
    walletConnect({ projectId: 'c7c2525287313833d7b3708bb8745585' }), // Random valid but public-friendly project ID for demo
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