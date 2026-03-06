import { http, createConfig, wagmiConnectors } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

export const config = createConfig({
    chains: [baseSepolia],
    connectors: [
        injected(),
    ],
    transports: {
        [baseSepolia.id]: http(),
    },
})
