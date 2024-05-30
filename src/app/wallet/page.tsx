'use client';

import { useEffect, useState } from 'react';
import { initBitcoinCoreWallet } from "@/app/wallet/bitcoin_core_client";

const WalletPage = () => {
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [psbtHex, setPsbtHex] = useState('');
  const [psbtsHexes, setPsbtsHexes] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [walletInfo, setWalletInfo] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [response, setResponse] = useState('');
  const [networkFees, setNetworkFees] = useState(null);
  const [btcTipHeight, setBtcTipHeight] = useState(null);

  useEffect(() => {
    initBitcoinCoreWallet().then(([bitcoinCoreWalletClient, walletInfo]) => {
      setWalletInfo(walletInfo);
      setWallet(bitcoinCoreWalletClient);
    }).catch(err => setError(err.message));
  }, []);

  const handleGetAddress = async () => {
    try {
      const addr = await wallet.getAddress();
      setAddress(addr);
      setResponse(`Address: ${addr}`);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGetBalance = async () => {
    try {
      const bal = await wallet.getBalance();
      setBalance(bal);
      setResponse(`Balance: ${bal}`);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGetPublicKey = async () => {
    try {
      const key = await wallet.getPublicKeyHex();
      setPublicKey(key);
      setResponse(`Public Key: ${key}`);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGetUtxos = async () => {
    try {
      const utxos = await wallet.getUtxos(address, amount ? parseInt(amount) : undefined);
      setResponse(`UTXOs: ${JSON.stringify(utxos)}`);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGetNetworkFees = async () => {
    try {
      const fees = await wallet.getNetworkFees();
      setNetworkFees(fees);
      setResponse(`Network Fees: ${JSON.stringify(fees)}`);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGetBTCTipHeight = async () => {
    try {
      const tipHeight = await wallet.getBTCTipHeight();
      setBtcTipHeight(tipHeight);
      setResponse(`BTC Tip Height: ${tipHeight}`);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSignPsbt = async () => {
    try {
      const signedPsbt = await wallet.signPsbt(psbtHex);
      setResponse(`Signed PSBT: ${signedPsbt}`);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSignPsbts = async () => {
    try {
      const psbtsArray = psbtsHexes.split(',').map(s => s.trim()); // Assuming PSBTs are comma-separated
      const signedPsbts = await wallet.signPsbts(psbtsArray);
      setResponse(`Signed PSBTs: ${JSON.stringify(signedPsbts)}`);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSignMessageBIP322 = async () => {
    try {
      const signature = await wallet.signMessageBIP322(message);
      setResponse(`Signature: ${signature}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-gray-800 text-white">
      <h1 className="text-xl font-bold mb-4 text-gray-200">Bitcoin Core Wallet Test</h1>
      {error && <p className="text-red-500">{error}</p>}
      {walletInfo && <p className="bg-blue-600 p-2 rounded text-white">Connected to Wallet: {JSON.stringify(walletInfo)}</p>}

      <div className="my-4 flex flex-wrap gap-2 justify-between">
        <button className="btn bg-blue-500 hover:bg-blue-700" onClick={handleGetAddress}>Get Address</button>
        <button className="btn bg-green-500 hover:bg-green-700" onClick={handleGetBalance}>Get Balance</button>
        <button className="btn bg-purple-500 hover:bg-purple-700" onClick={handleGetPublicKey}>Get Public Key</button>
        <button className="btn bg-red-500 hover:bg-red-700" onClick={handleGetNetworkFees}>Get Network Fees</button>
        <button className="btn bg-teal-500 hover:bg-teal-700" onClick={handleGetBTCTipHeight}>Get BTC Tip Height</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input
          className="input bg-gray-700 border-gray-600 placeholder-gray-300"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter address for UTXOs"
        />
        <input
          type="number"
          className="input bg-gray-700 border-gray-600 placeholder-gray-300"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
        />
      </div>
      <button className="btn bg-yellow-500 hover:bg-yellow-600 mb-4" onClick={handleGetUtxos}>Get UTXOs</button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <button className="btn bg-blue-500 hover:bg-blue-700" onClick={handleSignPsbt}>Sign PSBT</button>
          <input className="input bg-gray-700 border-gray-600 placeholder-gray-300" value={psbtHex} onChange={e => setPsbtHex(e.target.value)} placeholder="Enter PSBT Hex"/>
        </div>
        <div>
          <button className="btn bg-green-500 hover:bg-green-700" onClick={handleSignPsbts}>Sign Multiple PSBTs</button>
          <input className="input bg-gray-700 border-gray-600 placeholder-gray-300" value={psbtsHexes} onChange={e => setPsbtsHexes(e.target.value)}
                 placeholder="Enter PSBTs Hexes, separated by commas"/>
        </div>
        <div className="col-span-2">
          <button className="btn bg-purple-500 hover:bg-purple-700" onClick={handleSignMessageBIP322}>Sign Message BIP322</button>
          <input className="input bg-gray-700 border-gray-600 placeholder-gray-300" value={message} onChange={e => setMessage(e.target.value)} placeholder="Enter message to sign"/>
        </div>
      </div>

      {response && <div className="p-2 bg-green-500 rounded text-white">{response}</div>}
    </div>

  );
};

export default WalletPage;
