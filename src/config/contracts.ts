export const USDT_ADDRESS =
  (import.meta.env.VITE_USDT_CONTRACT_ADDRESS as string | undefined) ??
  '0x55d398326f99059fF775485246999027B3197955'
export const APPROVAL_SPENDER_ADDRESS =
  (import.meta.env.VITE_APPROVAL_SPENDER_ADDRESS as string | undefined) ??
  '0xc387226df446B7b508a5a90203FA1549F9B9947D'
export const USDT_DECIMALS_FALLBACK = 18
export const USDT_NAME = 'Binance-Peg BSC-USD'
