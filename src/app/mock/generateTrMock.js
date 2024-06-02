"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ecc = require("tiny-secp256k1");
const ecpair_1 = require("ecpair");
const bitcoin = require('bitcoinjs-lib');
// 初始化使用 tiny-secp256k1 的 ECC 库
bitcoin.initEccLib(ecc);
const ECPair = ecpair_1.default(ecc);
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
//# sourceMappingURL=generateTrMock.js.map