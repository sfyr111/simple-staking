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
        const covenantPks = [
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
        ];
        const finalityPks = [
            {
                address: "bcrt1p4ava77vgell9smwj2all3erfyqhmxzn2vrj3hvd93ze88xcm7x9q68hjr6",
                privateKey: "cQo7ZZCshP5EuSPuY2rZLDETpsSAEX7Si6nXKrT2TLpTC3Rjv9Kp",
                publicKey: "03af59df7988cffe586dd2577ff8e469202fb30a6a60e51bb1a588b2739b1bf18a"
            },
        ];
        const covenantECpairs = covenantPks.map(covenantPk => ECPair.fromWIF(covenantPk.privateKey, network));
        const finalityECpairs = finalityPks.map(finalityPk => ECPair.fromWIF(finalityPk.privateKey, network));
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
            // const sighashTypes = bitcoin.Transaction.SIGHASH_DEFAULT;  // 使用 Taproot 推荐的默认 sighash
            // 确保使用对应的方法进行签名
            psbt.signInput(i, privateKey);
            finalityECpairs.forEach((keyECpair) => psbt.signInput(i, keyECpair));
            covenantECpairs.forEach((keyECpair) => psbt.signInput(i, keyECpair));
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
        // Signed transaction hex: 02000000000101d017469f304d8f37c631776e5eb7e747107bb8c49d418048d39a7a199742140000000000006c00000001ec909600000000001600140670a92035ad0828f4a7b30f82fb6811e8d4af6203402113aee2d88edf44c89b4b396524cb8f221a4df674293b53eb86af23b506221b9071bff0ebc62c04ebcc5ddb855a637e19c443d34f855dcd50c994a41b0e7c5225203e61dd9b70d4f6d5a2c30f955995b4186f0374c781a69cbbce244b7140d24281ad016cb261c183a8066a87cb2fe9800171ac79e464977b938e0f22059b9f75a9fb2d19d0e683e600bb980e85f47f009a36ff53e19fb28206d7640cf64b1edb25f9ecbd68e2fe778768440b134a62dd0cefc852f1b4a843af0dada9c8809f68215691957897cb00000000
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
// PSBT base64
// cHNidP8BAFICAAAAAdAXRp8wTY83xjF3bl6350cQe7jEnUGASNOaehmXQhQAAAAAAABsAAAAAeyQlgAAAAAAFgAUBnCpIDWtCCj0p7MPgvtoEejUr2IAAAAAAAEBK4CWmAAAAAAAIlEgrJ5v+3rZAb5OGIyz+kIonP844WV2uGh80mBs/SXtiIxiFcGDqAZqh8sv6YABcax55GSXe5OODyIFm591qfstGdDmg+YAu5gOhfR/AJo2/1Phn7KCBtdkDPZLHtsl+ey9aOL+d4doRAsTSmLdDO/IUvG0qEOvDa2pyICfaCFWkZV4l8smID5h3Ztw1PbVosMPlVmVtBhvA3THgaacu84kS3FA0kKBrQFsssABFyCDqAZqh8sv6YABcax55GSXe5OODyIFm591qfstGdDmgwAiAgI+Yd2bcNT21aLDD5VZlbQYbwN0x4GmnLvOJEtxQNJCgRBQmfBkAAAAgAAAAIABAACAAA==
handleWithdrawalTransaction(process.argv[2]);
//# sourceMappingURL=handlePsbtBase64.js.map