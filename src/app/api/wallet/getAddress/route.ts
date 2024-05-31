import { initBitcoinCoreWallet } from '@/utils/wallet/providers/bitcoin_core_wallet';

export async function GET(request: Request) {
  try {
    const bitcoinWallet = initBitcoinCoreWallet();

    const data = await bitcoinWallet.getAddress();

    return Response.json({ data })
  } catch (error) {
    console.log('bitcoinWallet.getAddress() error, ', error)
    return Response.json({ error: (error as Error).message }, { status: 500 })
  }
}
