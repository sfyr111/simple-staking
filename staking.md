确保质押目标地址能够生成 Taproot 地址通常需要使用层次确定性钱包（HD Wallet）。尽管这类钱包不允许直接导出公钥和私钥，它们可以通过钱包描述符进行密钥管理，并支持随机生成地址以直接广播交易，而不必通过钱包创建。
**示例 TR 地址：**
- **地址**：`bcrt1psw5qv658evh7nqqpwxk8neryjaae8rs0ygzeh8m448aj6xwsu6psk5tkuz`
- **私钥**：`cNjEdTh2Aq9uCRqUnTaFv62i6HWgr4EEzosNaya8ssTry8NNgjRm`
- **公钥**：`0283a8066a87cb2fe9800171ac79e464977b938e0f22059b9f75a9fb2d19d0e683`

对于质押者，不必使用 HD Wallet，但必须能够导出公钥和私钥，因此可以选择传统钱包（Legacy Wallet）。
**示例传统钱包：**
- **钱包名称**：legacy_wallet
- **SegWit 地址**：`bcrt1q2dmyercfmdkfflngfu35564kfmc37trh87a99h`
- **公钥**：`02a3969e084dac08e9689cae93114ccc66336fa5f4fccd422a8217233873d6e743`
- **私钥**：`cUL26R5qfRXKsTRTm9cryxYdcfaSGNwT7arpntVazszBwxCTFvE3`

**特别点关于 TR 地址：**
- Taproot 地址的 UTXO 在创建输入时需要 `tapInternalKey` 公钥，而在花费时则需通过 Schnorr 签名机制进行签名。所有输入都需以此方式处理以满足 Taproot 的安全要求。
- 使用 `ECPair.makeRandom` 生成的是基于 ECDSA 标准的密钥对。为了使其与 Taproot 兼容，需要对公钥进行 X-only 压缩（即使用 `.slice(1,33)`）以满足 Schnorr 签名的需求。
- Tapproot 地址 utxos 构建交易时必须需要`tapInternalKey`公钥, regtest 网络先使用传统钱包暂时不传。 
+ 根据 utxos 类型和钱包地址 构建交易
```typescript
    const input = inputUTXOs[i];
    psbt.addInput({
      hash: input.txid,
      index: input.vout,
      witnessUtxo: {
        script: Buffer.from(input.scriptPubKey, "hex"),
        value: input.value,
      },
      // this is needed only if the wallet is in taproot mode
      ...(btcWallet.isTapRoot && { tapInternalKey: btcWallet.publicKeyNoCoord }),
      sequence: 0xfffffffd, // Enable locktime by setting the sequence value to (RBF-able)
    });
```

+ 生成 keyPair 和 Taproot 地址
```typescript
import * as ecc from "tiny-secp256k1";
import ECPairFactory from "ecpair";

const bitcoin = require('bitcoinjs-lib');

// 初始化使用 tiny-secp256k1 的 ECC 库
bitcoin.initEccLib(ecc);
const ECPair = ECPairFactory(ecc);

// 选择网络，这里为回归测试网
const network = bitcoin.networks.regtest; // 也可以是 bitcoin.networks.bitcoin 用于生产环境

// 生成 Taproot 兼容的密钥对
const keyPair = ECPair.makeRandom({ network });

// 使用 payments API 生成 Taproot 地址，确保使用公钥的 X-coordinate
const { address } = bitcoin.payments.p2tr({ pubkey: keyPair.publicKey.slice(1, 33), network });

// 打印公钥、私钥和地址
console.log("Public Key (HEX):", keyPair.publicKey.toString('hex'));
console.log("Private Key (WIF):", keyPair.toWIF());
console.log("Taproot Address:", address);
```

+ 委员会和最终确认者
```typescript
[
  {
    address: "bcrt1psw5qv658evh7nqqpwxk8neryjaae8rs0ygzeh8m448aj6xwsu6psk5tkuz",
    privateKey: "cNjEdTh2Aq9uCRqUnTaFv62i6HWgr4EEzosNaya8ssTry8NNgjRm",
    publicKey: "0283a8066a87cb2fe9800171ac79e464977b938e0f22059b9f75a9fb2d19d0e683"
  },
  {
    address: "bcrt1putkv5qe6axcsk28khszwk80l2w29ls8lu6s2xxdmgp78ngc777kq2yxkl5",
    privateKey: "cTbxCLr6bejXQDiv1Poottc9UF4DtoDBFD99ZMT85v4wq7c8gxrA",
    publicKey: "02e2ecca033ae9b10b28f6bc04eb1dff53945fc0ffe6a0a319bb407c79a31ef7ac"
  },
  {
    address: "bcrt1pz73eahumhqnhsuup4ja4rn4uh2cskru0q6mn9h95hr2w56hrmvys39vkga",
    privateKey: "cP3fkGwdh3LMHu7na61hJYF494Ske7eoSq8LyMmivGb1aM1aUuQL",
    publicKey: "0217a39edf9bb827787381acbb51cebcbab10b0f8f06b732dcb4b8d4ea6ae3db09"
  },
  {
    address: "bcrt1p4ava77vgell9smwj2all3erfyqhmxzn2vrj3hvd93ze88xcm7x9q68hjr6",
    privateKey: "cQo7ZZCshP5EuSPuY2rZLDETpsSAEX7Si6nXKrT2TLpTC3Rjv9Kp",
    publicKey: "03af59df7988cffe586dd2577ff8e469202fb30a6a60e51bb1a588b2739b1bf18a"
  },
  {
    address: "bcrt1pxmp3rjeee306vykdl9qyqm8d20ngptdfqgkza06ls9gsaz53cthq2en2zc",
    privateKey: "cSdApzo5fFykq2u9Rt6Hm32E2yF9XqMu8kueiDXS7q5ndfypHJC1",
    publicKey: "0236c311cb39cc5fa612cdf940406ced53e680ada9022c2ebf5f81510e8a91c2ee"
  }
]
```
