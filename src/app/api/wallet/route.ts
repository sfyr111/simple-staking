import { initBitcoinCoreWallet, bitcoinWallet } from '@/utils/wallet/providers/bitcoin_core_wallet';

export async function GET(request: Request) {
  try {
    const wallet = initBitcoinCoreWallet();
    const walletInfo = await wallet.connectWallet();

    return Response.json(walletInfo)
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 })
  }
}
