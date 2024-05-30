'use client';

import React, { useState } from 'react';
import { networks, Psbt } from "bitcoinjs-lib";
import { StakingScriptData, stakingTransaction, withdrawTimelockUnbondedTransaction } from 'btc-staking-ts';
import { getPublicKeyNoCoord, isSupportedAddressType, toNetwork } from "@/utils/wallet";
import { WalletProvider } from "@/utils/wallet/wallet_provider";
import { OKXWallet } from "@/utils/wallet/providers/okx_wallet";
import config from "./config";

// 1 Collect system parameters
const covenant_pks = [
  "02f0e0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f",
  "02f0e0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f",
  "02f0e0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f",
];
const covenantPks: Buffer[] = covenant_pks.map((pk) => Buffer.from(pk, "hex"));
const covenantThreshold: number = 3;
const minUnbondingTime: number = 101;
const magicBytes: Buffer = Buffer.from("62627434", "hex"); // "bbt4" tag
// Optional field. Value coming from current global param activationHeight
const lockHeight: number = 0;

// 2 User selected parameters
// const stakerPk: Buffer = btcWallet.publicKeyNoCoord();
const mockStakerPkHex = '02abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
const stakerPk: Buffer = Buffer.from(mockStakerPkHex, 'hex');


const finalityProvider = {
  btc_pk_hex: "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",  // 示例公钥
};

const finalityProviders: Buffer[] = [
  Buffer.from(finalityProvider.btc_pk_hex, "hex"),
];
const stakingDuration: number = 144;
const stakingAmount: number = 1000;
const unbondingTime: number = minUnbondingTime;

// 3 Staking parameters
const inputUTXOs = [
  {
    txid: "e472d65b0c9c1bac9ffe53708007e57ab830f1bf09af4bfbd17e780b641258fc",
    vout: 2,
    value: 9265692,
    scriptPubKey: "0014505049839bc32f869590adc5650c584e17c917fc",
  },
];
const feeRate: number = 18;
// const changeAddress: string = btcWallet.address;
const changeAddress: string = 'tb1qabcde12345vwxyz67890abcdef1234567xyzqsd';
const network = networks.testnet;

const StakingPage = () => {
  // State for storing blockchain-related data
  const [balance, setBalance] = useState(0);
  const [transaction, setTransaction] = useState(null);
  const [btcWallet, setBTCWallet] = useState<WalletProvider>();
  const [btcWalletBalanceSat, setBTCWalletBalanceSat] = useState(0);
  const [btcWalletNetwork, setBTCWalletNetwork] = useState<networks.Network>();
  const [publicKeyNoCoord, setPublicKeyNoCoord] = useState("");

  const [scripts, setScripts] = useState({});
  const [stakingTx, setStakingTx] = useState(null);


  const [address, setAddress] = useState("");

  // Example function to connect to a wallet (you'll need to define this logic)
  const connectWallet = async () => {
    try {
      let walletProvider: WalletProvider = new OKXWallet();

      await walletProvider.connectWallet();
      const address = await walletProvider.getAddress();
      // check if the wallet address type is supported in babylon
      const supported = isSupportedAddressType(address);
      if (!supported) {
        throw new Error(
          "Invalid address type. Please use a Native SegWit or Taproot",
        );
      }

      const balanceSat = await walletProvider.getBalance();
      const publicKeyNoCoord = getPublicKeyNoCoord(
        await walletProvider.getPublicKeyHex(),
      );
      setBTCWallet(walletProvider);
      setBTCWalletBalanceSat(balanceSat);
      setBTCWalletNetwork(toNetwork(await walletProvider.getNetwork()));
      setAddress(address);
      setPublicKeyNoCoord(publicKeyNoCoord.toString("hex"));
    } catch (error) {
      console.error('Error connecting to wallet:', error);
    }
  };

  // Function to initiate a staking transaction
  const initiateStaking = async () => {
    try {
      // Create staking script data object
      const stakingScriptData = new StakingScriptData(
        stakerPk,
        finalityProviders,
        covenantPks,
        covenantThreshold,
        stakingDuration,
        minUnbondingTime,
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
    const unsignedStakingPsbt: { psbt: Psbt, fee: number } = stakingTransaction(
      scripts,
      stakingAmount,
      changeAddress,
      inputUTXOs,
      network,
      feeRate,
      btcWallet.isTaproot ? btcWallet.publicKeyNoCoord() : undefined,
      lockHeight,
    );

    const signedStakingPsbt = await btcWallet.signPsbt(unsignedStakingPsbt.psbt.toHex());
    const stakingTx = Psbt.fromHex(signedStakingPsbt).extractTransaction();
    setStakingTx(stakingTx);
  };

  const createWithdrawalTransaction = async () => {
    // The index of the staking/unbonding output in the staking/unbonding
    // transcation.
    const stakingOutputIndex: number = 0;

    // The fee that the withdrawl transaction should use.
    const withdrawalFee: number = 500;

    // The address to which the funds should be withdrawed to.
    const withdrawalAddress: string = btcWallet.address;

    const unsignedWithdrawalPsbt: { psbt: Psbt, fee: number } = withdrawTimelockUnbondedTransaction(
      scripts,
      stakingTx,
      btcWallet.address,
      network,
      feeRate,
      stakingOutputIndex,
    );
  };


  // Function to handle withdrawal from staking
  const handleWithdrawal = async () => {
    // Include logic for withdrawal
    console.log('Withdrawal initiated');
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="space-y-4">
        <button onClick={connectWallet} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4">
          Connect Wallet
        </button>
        <button onClick={initiateStaking} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4">
          Initiate Staking
        </button>
        <button onClick={createStakingTransaction} className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded mb-4">
          Create Staking Transaction
        </button>
        <button onClick={createWithdrawalTransaction} className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded mb-4">
          Create Withdrawal Transaction
        </button>
        <button onClick={handleWithdrawal} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
          Handle Withdrawal
        </button>
        <div>Current Address: {address}</div>
        <div>Current Balance: {balance}</div>
        {/* Optional: Display the transaction details */}
      </div>
    </main>
  );
};

export default StakingPage;
