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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
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
// 函数来处理签名和提取交易
function signAndExtractTransaction(psbtBase64, privateKeyWIF, network) {
    return __awaiter(this, void 0, void 0, function* () {
        const privateKey = ECPair.fromWIF(privateKeyWIF, network);
        const psbt = bitcoin.Psbt.fromBase64(psbtBase64);
        const publicKey = privateKey.publicKey.toString('hex');
        console.log('publicKey: ', publicKey);
        console.log(publicKey === '023e61dd9b70d4f6d5a2c30f955995b4186f0374c781a69cbbce244b7140d24281');
        /*
        *
        * {
         "asm": "3e61dd9b70d4f6d5a2c30f955995b4186f0374c781a69cbbce244b7140d24281 OP_CHECKSIGVERIFY 1008 OP_CHECKSEQUENCEVERIFY",
         "desc": "raw(203e61dd9b70d4f6d5a2c30f955995b4186f0374c781a69cbbce244b7140d24281ad02f003b2)#fejnhmtz",
         "type": "nonstandard",
         "p2sh": "2Mz33BjfVVrtbU9QxVxWRXbYUXE3uv6F9ky",
         "segwit": {
         "asm": "0 03a3b77a35754da4934709a41c9f4eb0e1d16895babc74c10a437137fc635d75",
         "desc": "addr(bcrt1qqw3mw734w4x6fy68pxjpe86wkrsaz6y4h278fsg2gdcn0lrrt46sn4yvyt)#ffm9cu7e",
         "hex": "002003a3b77a35754da4934709a41c9f4eb0e1d16895babc74c10a437137fc635d75",
         "address": "bcrt1qqw3mw734w4x6fy68pxjpe86wkrsaz6y4h278fsg2gdcn0lrrt46sn4yvyt",
         "type": "witness_v0_scripthash",
         "p2sh-segwit": "2N73zbbYpJEqUx2f8J8brjysKWPGbUW9DRx"
         }
        * */
        // 签名所有输入
        for (let i = 0; i < psbt.inputCount; i++) {
            const sighashTypes = bitcoin.Transaction.SIGHASH_DEFAULT; // 使用 Taproot 推荐的默认 sighash
            // 确保使用对应的方法进行签名
            psbt.signInput(i, privateKey);
            // 验证签名，如果不验证，直接调用finalize可能会因为无效签名而出错
            // if (!psbt.validateSignaturesOfInput(i, privateKey.publicKey)) {
            //   throw new Error(`Invalid signature for input ${i}`);
            // }
        }
        // 完成所有输入
        psbt.finalizeAllInputs();
        // 提取交易
        const transaction = psbt.extractTransaction();
        const txHex = transaction.toHex();
        console.log(txHex);
        return txHex;
    });
}
// 假设您有一个函数来获取保存的 PSBT 和私钥
function handleWithdrawalTransaction(psbtBase64) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('psbtBase64: ', psbtBase64);
        const privateKeyWIF = 'cVdXE4grxmNeLEjnMFqYTg7og7owy25cLBmwxodMMFhpPE1ki8S8'; // 使用适当的值
        const network = bitcoin.networks.regtest; // 或 bitcoin.networks.testnet
        if (psbtBase64) {
            const txHex = yield signAndExtractTransaction(psbtBase64, privateKeyWIF, network);
            console.log("Signed transaction hex:", txHex);
        }
        else {
            console.error("No PSBT data found.");
        }
    });
}
// cHNidP8BAFICAAAAAbypNwubGHHUmyWhIEOJmvyGkbBwTUWl/Vec2WybXObBAAAAAADwAwAAAViLlAAAAAAAFgAUBnCpIDWtCCj0p7MPgvtoEejUr2IAAAAAAAEBK4CWmAAAAAAAIlEgA5Od1/3f8l57HQ368NXfpBgv8aqKM7QUx2H9BfXccCNiFcCDqAZqh8sv6YABcax55GSXe5OODyIFm591qfstGdDmg+YAu5gOhfR/AJo2/1Phn7KCBtdkDPZLHtsl+ey9aOL+d4doRAsTSmLdDO/IUvG0qEOvDa2pyICfaCFWkZV4l8snID5h3Ztw1PbVosMPlVmVtBhvA3THgaacu84kS3FA0kKBrQLwA7LAARcgg6gGaofLL+mAAXGseeRkl3uTjg8iBZufdan7LRnQ5oMAAA==
// cHNidP8BAFICAAAAAdAXRp8wTY83xjF3bl6350cQe7jEnUGASNOaehmXQhQAAAAAAABsAAAAAeyQlgAAAAAAFgAUBnCpIDWtCCj0p7MPgvtoEejUr2IAAAAAAAEBK4CWmAAAAAAAIlEgrJ5v+3rZAb5OGIyz+kIonP844WV2uGh80mBs/SXtiIxiFcGDqAZqh8sv6YABcax55GSXe5OODyIFm591qfstGdDmg+YAu5gOhfR/AJo2/1Phn7KCBtdkDPZLHtsl+ey9aOL+d4doRAsTSmLdDO/IUvG0qEOvDa2pyICfaCFWkZV4l8smID5h3Ztw1PbVosMPlVmVtBhvA3THgaacu84kS3FA0kKBrQFsssABFyCDqAZqh8sv6YABcax55GSXe5OODyIFm591qfstGdDmgwAiAgI+Yd2bcNT21aLDD5VZlbQYbwN0x4GmnLvOJEtxQNJCgRBQmfBkAAAAgAAAAIABAACAAA==
handleWithdrawalTransaction(process.argv[2]);
//# sourceMappingURL=handlePsbtBase64.js.map