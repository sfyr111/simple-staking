import { initBitcoinCoreWallet } from '@/utils/wallet/providers/bitcoin_core_wallet';

export async function GET(request: Request) {
  try {
    const bitcoinWallet = initBitcoinCoreWallet()

    const data = await bitcoinWallet.getPublicKey(new URL(request.url).searchParams.get('address'));

    return Response.json(data)
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 })
  }
}
