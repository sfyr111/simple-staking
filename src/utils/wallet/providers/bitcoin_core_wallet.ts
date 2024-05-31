import Client from "bitcoin-core";
import {
  WalletProvider,
  Network,
  Fees,
  UTXO,
  WalletInfo,
} from "../wallet_provider";

export class BitcoinCoreWallet extends WalletProvider {
  private client: Client;

  constructor(walletName = "legacy_wallet") {
    super();
    this.client = new Client({
      wallet: walletName,
      network: 'regtest',
      username: '111111',
      password: '111111',
      host: 'localhost',
      port: 18443 // default Bitcoin Core RPC port for regtest
    });
  }

  async connectWallet(): Promise<this> {
    'use server';
    // Attempt to get the wallet info to check if the client can connect to the node
    try {
      const walletInfo = await this.client.getWalletInfo();
      console.log(walletInfo); // log to verify connection
      return walletInfo;
      // return this;
    } catch (error) {
      throw new Error('Failed to connect to Bitcoin Core: ' + (error as Error).message);
    }
  }

  async getNetwork() {
    return Network.SIGNET;
  }

  on(eventName: string, callBack: () => void) {
    this.client.on(eventName, callBack);
  }

  async getWalletProviderName(): Promise<string> {
    return "bitcoin_core";
  }

  async getAddress(): Promise<string> {
    // Check if an address with a specific label exists
    const label = "primary";
    const addresses = await this.client.listReceivedByAddress();
    if (addresses.length > 0 && addresses[0].address) {
      return addresses[0].address;
    } else {
      // If no address with this label, create a new taproot address and label it
      const newAddress = await this.client.getNewAddress();
      console.log("Taproot Address:", newAddress);
      return newAddress;
    }
  }

  async getNewAddress(): Promise<string> {
    // Check if an address with a specific label exists
    const label = "primary";
    const addresses = await this.client.listReceivedByAddress(0, true, true, label);
    if (addresses.length > 0 && addresses[0].address) {
      return addresses[0].address;
    } else {
      // If no address with this label, create a new taproot address and label it
      const newAddress = await this.client.getNewAddress(label, "bech32m");
      console.log("Taproot Address:", newAddress);
      return newAddress;
    }
  }

  async getPublicKeyHex(): Promise<string> {
    // Example of retrieving the public key of the first address in the wallet
    const address = await this.getAddress();
    const validateAddressInfo = await this.client.validateAddress(address);
    return validateAddressInfo.pubkey;
  }

  async getPublicKey(address: string): Promise<string> {
    // Example of retrieving the public key of the first address in the wallet
    const res = await this.client.getAddressInfo(address);
    return res.pubkey;
  }

  async signPsbt(psbtHex: string): Promise<string> {
    const signedPsbt = await this.client.walletProcessPSBT(psbtHex);
    return signedPsbt.psbt; // Return the signed PSBT
  }

  async signPsbts(psbtsHexes: string[]): Promise<string[]> {
    const signedPsbts = [];
    for (const psbtHex of psbtsHexes) {
      const signedPsbt = await this.signPsbt(psbtHex);
      signedPsbts.push(signedPsbt);
    }
    return signedPsbts;
  }

  async signMessageBIP322(message: string): Promise<string> {
    // Using the address derived for the wallet
    const address = await this.getAddress();
    const signature = await this.client.signMessage(address, message);
    return signature;
  }

  async getNetworkFees(): Promise<Fees> {
    const result = await this.client.estimateSmartFee(6); // 6 is the number of blocks for confirmation target
    return {
      fastestFee: result.feerate, // Convert appropriately if needed
      halfHourFee: result.feerate,
      hourFee: result.feerate,
      economyFee: result.feerate,
      minimumFee: result.feerate
    };
  }


  // Implement other methods using bitcoin-core client
  // For example:
  async getBalance(): Promise<number> {
    return this.client.getBalance();
  }

  async pushTx(txHex: string): Promise<string> {
    return this.client.sendRawTransaction(txHex);
  }

  async getUtxos(address: string, amount?: number): Promise<UTXO[]> {
    const utxos = await this.client.listUnspent(0, 9999999, [address]);
    const filteredUtxos = utxos.map((utxo: any) => ({
      txid: utxo.txid,
      vout: utxo.vout,
      value: utxo.amount * 1e8, // Convert BTC to satoshis
      scriptPubKey: utxo.scriptPubKey
    }));

    if (amount) {
      let totalAmount = 0;
      const result = [];
      for (const utxo of filteredUtxos) {
        totalAmount += utxo.value;
        result.push(utxo);
        if (totalAmount >= amount) break;
      }
      return totalAmount >= amount ? result : [];
    }

    return filteredUtxos;
  }

  async getBTCTipHeight(): Promise<number> {
    const blockchainInfo = await this.client.getBlockchainInfo();
    return blockchainInfo.blocks;
  }
}

export let bitcoinWallet: BitcoinCoreWallet;

export const initBitcoinCoreWallet = (walletName?: string) => {
  bitcoinWallet = new BitcoinCoreWallet(walletName);
  return bitcoinWallet;
};
