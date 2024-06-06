'use client';

import React, { useEffect, useState } from 'react';
import { initBitcoinCoreWallet } from "@/app/wallet/bitcoin_core_client";
import GlobalParams from "@/app/mock/parameters/global-params.json";
import { initBTCCurve, slashTimelockUnbondedTransaction, StakingScriptData, stakingTransaction, withdrawTimelockUnbondedTransaction } from "@/btc-staking-ts";
import { Psbt, Transaction, networks } from "bitcoinjs-lib";
import { StakingScripts } from "@/btc-staking-ts/types/StakingScripts";
import { UTXO } from "@/btc-staking-ts/types/UTXO";
import { toNetwork } from "@/utils/wallet";

const globalParams = GlobalParams.versions[0];
const finalityProviders = ['03af59df7988cffe586dd2577ff8e469202fb30a6a60e51bb1a588b2739b1bf18a']
const stakingDuration = 108; // 10000 # ~70 days
const stakingAmount = 0.1 * 1e8;
const magicBytes: Buffer = Buffer.from("62627434", "hex"); // "bbt4" tag

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
  const [utxos, setUtxos] = useState<UTXO[]>([]);
  const [stakingTx, setStakingTx] = useState<Transaction | null>(null);
  const [withdrawalTx, setWithdrawalTx] = useState<Transaction | null>(null);
  const [pushHex, setPushHex] = useState('');
  const [psbtBase64, setPsbtBase64] = useState('');
  const [currentTx, setCurrentTx] = useState<Transaction | null>(null);
  const [currentTxHex, setCurrentTxHex] = useState('');

  const [scripts, setScripts] = useState<StakingScripts>({
    dataEmbedScript: Buffer.from(""),
    slashingScript: Buffer.from(""),
    timelockScript: Buffer.from(""),
    unbondingScript: Buffer.from(""),
    unbondingTimelockScript: Buffer.from(""),
  });

  useEffect(() => {
    connectWallet();
    initBTCCurve();
    console.log("GlobalParams: ", GlobalParams.versions[0]);
  }, []);

  const connectWallet = async () => {
    try {
      const [walletClient, walletInfo] = await initBitcoinCoreWallet();
      setWallet(walletClient);
      setWalletInfo(walletInfo);
    } catch (err) {
      console.error('err: ', err);
      setError(err.message);
    }
  }

  const handleGetAddress = async () => {
    try {
      const addr = await wallet.getAddress();
      setAddress(addr);
      setResponse(`Address: ${addr}`);
      console.log(addr)
    } catch (err) {
      console.error('err: ', err)
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
      const key = await wallet.getPublicKeyHex(address);

      console.log('pk: ', key);
      console.log('pk: ', Buffer.from(key, 'hex').subarray(1,33))
      console.log('pk: ', Buffer.from(key, 'hex').slice(1,33))
      console.log()
      console.log('pk: ', Buffer.from(key, 'hex').subarray(1,33).toString('hex'))
      console.log('pk: ', Buffer.from(key, 'hex').slice(1,33).toString('hex'))
      setPublicKey(key);
      setResponse(`Public Key: ${key}`);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGetUtxos = async () => {
    try {
      const utxos = await wallet.getUtxos(address, amount ? parseInt(amount) : undefined);
      setUtxos(utxos);
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

  // staking handle
  const initiateStaking = async () => {
    try {
      // Create staking script data object
      const stakingScriptData = new StakingScriptData(
          Buffer.from(publicKey, 'hex').subarray(1, 33), // stakerPk
          finalityProviders.map(pk => Buffer.from(pk, 'hex').slice(1, 33)),
          globalParams.covenant_pks.map(pk => Buffer.from(pk, 'hex').slice(1, 33)),
          globalParams.covenant_quorum,
          stakingDuration, // input
          globalParams.unbonding_time,// minUnbondingTime,
          magicBytes,
      );

      // Build the staking scripts
      const builtScripts = stakingScriptData.buildScripts();
      const {
        timelockScript,
        unbondingScript,
        slashingScript,
        dataEmbedScript,
        unbondingTimelockScript,
      } = builtScripts;
      setScripts(builtScripts);

      // Log the scripts for demonstration (replace this with actual transaction logic)
      console.log('Timelock Script:', timelockScript);
      console.log('Unbonding Script:', unbondingScript);
      console.log('Slashing Script:', slashingScript);
      console.log('Data Embed Script:', dataEmbedScript);
      console.log('Unbonding Timelock Script:', unbondingTimelockScript);

      // Here you would proceed to create and send the transaction using the above scripts
      // For example, you might call stakingTransaction(...) or another similar function

      alert('Staking scripts built and logged to console.');
    } catch (error) {
      console.error('Error initiating staking:', error);
    }
  };

  const createStakingTransaction = async () => {
    const network = await wallet.getNetwork();
    const lockHeight = await wallet.getBTCTipHeight();
    const { fastestFee } = await wallet.getNetworkFees();


    const unsignedStakingPsbt: { psbt: Psbt, fee: number } = stakingTransaction(
        scripts,
        stakingAmount,
        address, // changeAddress,
        utxos, // inputUTXOs,
        toNetwork(network),
        fastestFee, // feeRate,
        Buffer.from(publicKey, 'hex').subarray(1, 33),
        lockHeight - 1, // from global params
    );

    const signedStakingPsbt = await wallet.signPsbt(unsignedStakingPsbt.psbt.toHex());
    const stakingTx = Psbt.fromHex(signedStakingPsbt).extractTransaction();
    console.log(stakingTx);
    /*
    // Buffer.from(base64value, 'base64').toString('hex')

    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
    */
    console.log(stakingTx.toHex()); // 获取广播到网络的十六进制字符串
    setStakingTx(stakingTx);
    setCurrentTx(stakingTx);
    // 成功的 txid c1e65c9b6cd99c57fda5454d70b09186fc9a894320a1259bd471189b0b37a9bc
  };

  const createWithdrawalTransaction = async () => {
    // The index of the staking/unbonding output in the staking/unbonding
    // transcation.
    const stakingOutputIndex: number = 0;

    const network = await wallet.getNetwork();
    const { fastestFee } = await wallet.getNetworkFees();

    // The fee that the withdrawl transaction should use.
    const withdrawalFee: number = fastestFee;

    // The address to which the funds should be withdrawed to.
    const withdrawalAddress: string = address;

    const unsignedWithdrawalPsbt: { psbt: Psbt, fee: number } = withdrawTimelockUnbondedTransaction(
        scripts,
        currentTx, // stakingTx,
        withdrawalAddress,
        toNetwork(network),
        withdrawalFee, // feeRate,
        stakingOutputIndex,
    );

    const psbtBase64 = unsignedWithdrawalPsbt.psbt.toBase64();

    console.log('psbtBase64: ', psbtBase64);

    const unSignedWithdrawalPsbtHex: string = unsignedWithdrawalPsbt.psbt.toHex();
    console.log('unSignedWithdrawalPsbtHex: ', unSignedWithdrawalPsbtHex)

    // Sign the PSBT
    const signedWithdrawalPsbt = await wallet.signPsbt(unSignedWithdrawalPsbtHex);

    const finalPsbt = Psbt.fromHex(signedWithdrawalPsbt);
    finalPsbt.finalizeAllInputs();

    // Extract the finalized transaction
    const withdrawalTx = Psbt.fromHex(signedWithdrawalPsbt).extractTransaction();
    // const withdrawalTx = Transaction.fromHex(signedWithdrawalPsbt); // old implementation

    // Optionally, you might want to serialize the transaction for broadcast
    console.log(withdrawalTx);
    console.log(withdrawalTx.toHex()); // Hex string to be broadcasted

    // If there's a function to set or store the withdrawal transaction
    setWithdrawalTx(withdrawalTx);

    // If you have broadcasting functionality or need to broadcast the tx
    // broadcastTransaction(withdrawalTx.toHex());
  };

  // Function to handle withdrawal from staking
  const createSlashTransaction = async () => {
    const network = await wallet.getNetwork();
    const { fastestFee } = await wallet.getNetworkFees();

    const slashOutputIndex = 0;
    const slashingRate = 0.5;
    const slashFee = fastestFee;
    const slashingAddress = 'bcrt1q7gjfeaydr8edeupkw3encq8pksnalvnda5yakt'; // slash_wallet


    const unsignedSlashPsbt : { psbt : Psbt } = slashTimelockUnbondedTransaction(
      scripts,
      currentTx, // stakingTx,
      slashingAddress,
      slashingRate, // feeRate
      slashFee, // fee,
      toNetwork(network),
      slashOutputIndex,
    );

    // 输出未签名的 PSBT 信息
    const psbtBase64 = unsignedSlashPsbt.psbt.toBase64();
    console.log('psbtBase64: ', psbtBase64);

    const unSignedSlashPsbtHex = unsignedSlashPsbt.psbt.toHex();
    console.log('unSignedSlashPsbtHex: ', unSignedSlashPsbtHex);

    // 签名 PSBT
    const signedSlashPsbt = await wallet.signPsbt(unSignedSlashPsbtHex);
    const finalPsbt = Psbt.fromHex(signedSlashPsbt);
    finalPsbt.finalizeAllInputs();

    // 提取最终的交易
    const slashTx = finalPsbt.extractTransaction();

    // 输出交易信息，以便于广播
    console.log('slashTx: ', slashTx);
    console.log('slashTx.toHex(): ', slashTx.toHex()); // Hex string to be broadcasted
;

  };

  const handlePushTx = async () => {
    const txId = await wallet.pushTx(pushHex);
    // {"error":"non-BIP68-final"} timelock error
    setResponse(`Transaction ID: ${txId}`);
  }

  const handlePsbtBase64 = async () => {
    const txHex = Buffer.from(psbtBase64, 'base64').toString('hex');
    const tx = Psbt.fromHex(txHex).extractTransaction();
    console.log('txHex: ', txHex)
    setCurrentTx(tx);
    setCurrentTxHex(txHex);
  }

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

      {/*  staking logic actions */}
      <div className="grid grid-cols-2 gap-4">
        <button className="px-4 py-2 font-bold text-white bg-green-500 rounded hover:bg-green-600" onClick={initiateStaking}>
          Initiate Staking
        </button>
        <button className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-600" onClick={createStakingTransaction}>
          Create Staking Transaction
        </button>
        <button className="px-4 py-2 font-bold text-white bg-red-500 rounded hover:bg-red-600" onClick={createWithdrawalTransaction}>
          Create Withdrawal Transaction
        </button>
        <button className="px-4 py-2 font-bold text-white bg-yellow-500 rounded hover:bg-yellow-600" onClick={createSlashTransaction}>
          Create Slash Transaction
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <button className="btn bg-blue-500 hover:bg-blue-700" onClick={handlePushTx}>Push TX</button>
          <input className="input bg-gray-700 border-gray-600 placeholder-gray-300" value={pushHex} onChange={e => setPushHex(e.target.value)} placeholder="Enter Push Hex"/>
        </div>

        <div>
          <button className="btn bg-blue-500 hover:bg-blue-700" onClick={handlePsbtBase64}>Recover TX</button>
          <input className="input bg-gray-700 border-gray-600 placeholder-gray-300" value={psbtBase64} onChange={e => setPsbtBase64(e.target.value)} placeholder="Enter Psbt Base64"/>
        </div>
      </div>
    </div>

  );
};

export default WalletPage;
