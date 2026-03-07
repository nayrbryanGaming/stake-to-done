import { http, createConfig, fallback } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

export const config = createConfig({
    chains: [baseSepolia],
    connectors: [
        injected(),
    ],
    transports: {
        [baseSepolia.id]: fallback([
            http('https://sepolia.base.org'),
            http('https://base-sepolia-rpc.publicnode.com'),
            http('https://base-sepolia.blockpi.network/v1/rpc/public'),
            http('https://1rpc.io/base-sepolia'),
            http()
        ]),
    },
})
