import { initBitcoinCoreWallet } from '@/utils/wallet/providers/bitcoin_core_wallet';

export async function POST(request: Request) {
  try {
    const bitcoinWallet = initBitcoinCoreWallet()

    const requestBody = await request.json();
    const { psbtHex } = requestBody;
    const signedPsbt = await bitcoinWallet.signPsbt(psbtHex);
    return Response.json({ data: signedPsbt })
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 })
  }
}
