import { initBitcoinCoreWallet } from '@/utils/wallet/providers/bitcoin_core_wallet';

export async function POST(request: Request) {
  try {
    const bitcoinWallet = initBitcoinCoreWallet()

    const requestBody = await request.json();
    const { message } = requestBody;
    const signature = await bitcoinWallet.signMessageBIP322(message);
    return Response.json(signature)
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 })
  }
}
