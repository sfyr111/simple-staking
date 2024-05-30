import { initBitcoinCoreWallet } from '@/utils/wallet/providers/bitcoin_core_wallet';

export async function GET(request: Request) {
  try {
    const bitcoinWallet = initBitcoinCoreWallet()

    const { searchParams } = new URL(request.url)

    const address = searchParams.get("address");
    const amount = searchParams.get("amount") ? parseInt(searchParams.get("amount")as string) : undefined;
    const data = await bitcoinWallet.getUtxos(address || '', amount);

    return Response.json({ data })
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 })
  }
}
