import { initBitcoinCoreWallet } from '@/utils/wallet/providers/bitcoin_core_wallet';

export async function POST(request: Request) {
  try {
    const bitcoinWallet = initBitcoinCoreWallet()

    const requestBody = await request.json();
    const { psbtHexs } = requestBody;
    const signedPsbts = await bitcoinWallet.signPsbts(psbtHexs);
    return Response.json(signedPsbts)
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 })
  }
}
