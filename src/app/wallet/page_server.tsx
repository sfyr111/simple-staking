
import { BitcoinCoreWallet } from "@/utils/wallet/providers/bitcoin_core_wallet";

const WalletPage = () => {

    const wallet = new BitcoinCoreWallet();
    wallet.connectWallet().then(async () => {
      const balance = await wallet.getBalance()
      console.log('-----')
      console.log('balnce', balance)
    })
          // .then(() => wallet.getAddress())

  return (
    <div>
      <h1>Bitcoin Core Wallet Test</h1>
    </div>
  );
};

export default WalletPage;
