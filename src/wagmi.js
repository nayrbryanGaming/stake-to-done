import { http, createConfig, fallback } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { coinbaseWallet, injected } from 'wagmi/connectors'

export const config = createConfig({
  // Keep wallet session in-memory only to avoid stale persisted connector objects.
  // This prevents `connector.getChainId is not a function` after app/version changes.
  storage: null,
  // Detect all EIP-6963 injected wallets (MetaMask, Rabby, OKX, etc.).
  multiInjectedProviderDiscovery: true,
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