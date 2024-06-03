"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ecc = __importStar(require("tiny-secp256k1"));
const ecpair_1 = __importDefault(require("ecpair"));
const bitcoin = require('bitcoinjs-lib');
// 初始化使用 tiny-secp256k1 的 ECC 库
bitcoin.initEccLib(ecc);
const ECPair = (0, ecpair_1.default)(ecc);
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