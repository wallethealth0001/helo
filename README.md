# BSC Wallet Center

A React and TypeScript frontend for WalletConnect, Trust Wallet, BNB Smart Chain, read-only balance checks, explicit BEP-20 allowance management, and transaction receipt tracking.

## Setup

1. Copy `.env.example` to `.env.local`.
2. Set `VITE_WALLETCONNECT_PROJECT_ID` to a WalletConnect Cloud project ID.
3. Add the app's exact origin to that WalletConnect project's origin allowlist.
4. Review `VITE_APPROVAL_SPENDER_ADDRESS` and `VITE_USDT_CONTRACT_ADDRESS`; defaults are the source-derived values:
   - USDT: `0x55d398326f99059fF775485246999027B3197955`
   - Spender/contract: `0xc387226df446B7b508a5a90203FA1549F9B9947D`
   - RPC: `https://bsc-dataseed1.binance.org/`
5. Run `npm install`, `npm test`, and `npm run build`.
6. Start with `npm run dev`.

## Wallet and Trust Wallet behavior

- EIP-6963 announcements and legacy `window.ethereum` providers are discovered without prompting. The app reads only `eth_accounts` and `eth_chainId` to inspect existing permissions and network capability.
- Trust Wallet is identified only from provider metadata/flags, not merely from the presence of `window.ethereum`.
- The Trust Wallet flow uses a user-activated official universal link after the WalletConnect URI is ready. A custom-scheme retry, QR, and copy-URI fallback remain available.
- Launch attempts and browser return/background signals are informational only. The UI reports connected only after a valid BSC WalletConnect session is approved.
- Pairing URIs and wallet account addresses are not written to diagnostic logs.

## Check Now

The Check Now action opens wallet selection when disconnected. After a valid BSC session, it reads the wallet's BNB and USDT balances and displays the UI-reference certificate. It does not claim to perform threat intelligence or a security audit, and it does not submit approvals, transfers, or gas funding.

## Security boundaries

- Private keys, mnemonics, Telegram credentials, and bot tokens are never accepted or stored by the frontend.
- Gas sponsorship and wallet funding are not implemented.
- Telegram delivery is disabled until a consented secured backend exists.
- A transaction hash alone is not success; the receipt and allowance read-back must confirm the result.
- Approvals require an explicit review and wallet confirmation; no approval occurs on connection.
- Certificate identifiers are UI references, not independently verifiable on-chain records.

## Validation limits

Automated tests cover EIP-6963 and injected-provider capability discovery, link construction, and platform classification. Real iPhone Safari / Android Chrome handoff tests require physical devices with Trust Wallet installed and have not been performed here.
