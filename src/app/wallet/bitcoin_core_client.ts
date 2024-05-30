// Assuming fetch is available globally (e.g., in a browser environment)
export class BitcoinCoreWalletClient {
  public baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async connectWallet(): Promise<any> {
    return fetch(`${this.baseURL}/connectWallet`).then(res => res.json());
  }

  async getNetwork(): Promise<any> {
    return fetch(`${this.baseURL}/getNetwork`).then(res => res.json());
  }

  async getAddress(): Promise<any> {
    return fetch(`${this.baseURL}/getAddress`).then(res => res.json());
  }

  async getPublicKeyHex(): Promise<any> {
    return fetch(`${this.baseURL}/getPublicKeyHex`).then(res => res.json());
  }

  async signPsbt(psbtHex: string): Promise<any> {
    return fetch(`${this.baseURL}/signPsbt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ psbtHex })
    }).then(res => res.json());
  }

  async signPsbts(psbtsHexes: string[]): Promise<any> {
    return fetch(`${this.baseURL}/signPsbts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ psbtsHexes })
    }).then(res => res.json());
  }

  async signMessageBIP322(message: string): Promise<any> {
    return fetch(`${this.baseURL}/signMessageBIP322`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    }).then(res => res.json());
  }

  async getNetworkFees(): Promise<any> {
    return fetch(`${this.baseURL}/getNetworkFees`).then(res => res.json());
  }

  async getBalance(): Promise<any> {
    return fetch(`${this.baseURL}/getBalance`).then(res => res.json());
  }

  async pushTx(txHex: string): Promise<any> {
    return fetch(`${this.baseURL}/pushTx`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ txHex })
    }).then(res => res.json());
  }

  async getUtxos(address: string, amount?: number): Promise<any> {
    const queryParams = new URLSearchParams({ address });
    if (amount !== undefined) {
      queryParams.append('amount', amount.toString());
    }

    return fetch(`${this.baseURL}/getUtxos?${queryParams.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    }).then(res => res.json());
  }


  async getBTCTipHeight(): Promise<any> {
    return fetch(`${this.baseURL}/getBTCTipHeight`).then(res => res.json());
  }
}

export async function initBitcoinCoreWallet(baseURL: string = '/api/wallet') {
  const btcWalletClient = new BitcoinCoreWalletClient(baseURL);

  const walletInfo = await fetch(`${btcWalletClient.baseURL}`).then(res => res.json());

  return [btcWalletClient, walletInfo];
}

// Example usage:
// const btcWalletClient = new BitcoinCoreWalletClient("http://localhost:3000/api");
// btcWalletClient.getBalance().then(balance => console.log(balance));
