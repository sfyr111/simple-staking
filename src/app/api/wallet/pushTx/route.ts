import { initBitcoinCoreWallet } from '@/utils/wallet/providers/bitcoin_core_wallet';

export async function POST(request: Request) {
  try {
    const bitcoinWallet = initBitcoinCoreWallet()

    const requestBody = await request.json();
    const { txHex } = requestBody;
    const txId = await bitcoinWallet.pushTx(txHex);
    return Response.json(txId)
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 })
  }
}
