## staking

## 关键代码文件

+ 代码文件：`src/app/wallet/page.tsx`

+ 模拟 WalletProvider `src/app/wallet/bitcoin_core_client.ts` 前端页面调用向 API 接口发起请求(替换 OKX 等真实钱包方法)

+ API 接口 `src/app/api/wallet/{methodName}` API 接口接收请求调用 RpcWalletProvider 方法

+ RpcWalletProvider `src/utils/wallet/providers/bitcoin_core_wallet.ts` 调用 bitcoin-core rpc-client 方法操作 bitcoind


## 前端页面功能 `src/app/wallet/page.tsx`

+ 钱包连接获取钱包信息 `connectWallet`

+ 获取地址 `handleGetAddress`

+ 获取余额 `handleGetBalance`

+ 获取当前钱包公钥 `handleGetPublicKey`

+ 获取网络交易费用 `handleGetNetworkFees`

+ 获取当前区块高度 `handleGetBTCTipHeight`

+ 获取 UTXOS `handleGetUtxos`

+ 初始化质押脚本 `initiateStaking`

+ 创建质押交易并签名返回 txHex `createStakingTransaction`

+ 创建赎回交易并签名返回 txHex `createWithdrawalTransaction` base64 在控制台打印
  + bitcoin-cli 对 psbt 的 leafScript 签名支持不足需手动签名 
  + `src/app/mock/handlePsbtBase64.ts` 执行 `ts-node src/app/mock/handlePsbtBase64.ts {psbtBase64}`
  + 需要当前钱包私钥创建 keyEpair 进行手动签名 leafScript

+ 创建惩罚交易并签名返回 txHex `createSlashTransaction`
  + 执行 `ts-node src/app/mock/handlePsbtBase64.ts {psbtBase64}` 的多签功能
  ```typescript
  psbt.signInput(i, privateKey);
  finalityECpairs.forEach((keyECpair) => psbt.signInput(i, keyECpair));
  covenantECpairs.forEach((keyECpair) => psbt.signInput(i, keyECpair));
  ```

+ 签名 psbt 交易 `handleSignPsbt`

+ 广播交易 txHex 返回 txId `handlePushTx`


    
