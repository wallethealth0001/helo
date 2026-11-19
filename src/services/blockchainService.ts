import { BrowserProvider, JsonRpcProvider } from 'ethers'
import { BSC } from '../config/chains'

export function getReadProvider() {
  return new JsonRpcProvider(BSC.rpcUrls[0], {
    chainId: BSC.id,
    name: BSC.name,
  })
}

export function getBrowserProvider(provider: unknown) {
  return new BrowserProvider(provider as ConstructorParameters<typeof BrowserProvider>[0])
}

export function getChainId(provider: unknown) {
  const browserProvider = getBrowserProvider(provider)
  return browserProvider.getNetwork().then((network) => Number(network.chainId))
}
