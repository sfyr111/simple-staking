'use client';

import { useEffect, useState } from 'react';
import { initBitcoinCoreWallet, bitcoinWallet } from "@/utils/wallet/providers/bitcoin_core_wallet";

const WalletPage = () => {
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [balance, setBalance] = useState(0);

  initBitcoinCoreWallet()

  async function connectWallet() {

    await bitcoinWallet.connectWallet();
  }

  async function getBalance() {

    const balance = await bitcoinWallet.getBalance();
    console.log(balance);
    setBalance(balance);
  }

  return (
    <div>
      <h1>Bitcoin Core Wallet Test</h1>

      <button onClick={connectWallet}>connectWallet</button>

      <button onClick={getBalance}>getBalance</button>

      <div>
        Balance: {balance}
      </div>
    </div>
  );
};

export default WalletPage;
