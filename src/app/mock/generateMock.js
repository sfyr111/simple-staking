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
exports.generateMock = void 0;
const bitcoin = __importStar(require("bitcoinjs-lib"));
const ecpair_1 = __importDefault(require("ecpair"));
const ecc = __importStar(require("tiny-secp256k1"));
bitcoin.initEccLib(ecc);
const network = bitcoin.networks.regtest;
const ECPair = (0, ecpair_1.default)(ecc);
const generateMock = () => {
    // 生成5个随机的公钥私钥
    const keys = Array.from({ length: 5 }, () => ECPair.makeRandom({ network }));
    return keys.map(keyPair => ({
        address: bitcoin.payments.p2tr({ pubkey: keyPair.publicKey.slice(1, 33), network }).address,
        privateKey: keyPair.toWIF(),
        publicKey: keyPair.publicKey.toString('hex'),
    }));
};
exports.generateMock = generateMock;
const keys = (0, exports.generateMock)();
console.log(keys);
// [
//   {
//     address: "bcrt1psw5qv658evh7nqqpwxk8neryjaae8rs0ygzeh8m448aj6xwsu6psk5tkuz",
//     privateKey: "cNjEdTh2Aq9uCRqUnTaFv62i6HWgr4EEzosNaya8ssTry8NNgjRm",
//     publicKey: "0283a8066a87cb2fe9800171ac79e464977b938e0f22059b9f75a9fb2d19d0e683"
//   },
//   {
//     address: "bcrt1putkv5qe6axcsk28khszwk80l2w29ls8lu6s2xxdmgp78ngc777kq2yxkl5",
//     privateKey: "cTbxCLr6bejXQDiv1Poottc9UF4DtoDBFD99ZMT85v4wq7c8gxrA",
//     publicKey: "02e2ecca033ae9b10b28f6bc04eb1dff53945fc0ffe6a0a319bb407c79a31ef7ac"
//   },
//   {
//     address: "bcrt1pz73eahumhqnhsuup4ja4rn4uh2cskru0q6mn9h95hr2w56hrmvys39vkga",
//     privateKey: "cP3fkGwdh3LMHu7na61hJYF494Ske7eoSq8LyMmivGb1aM1aUuQL",
//     publicKey: "0217a39edf9bb827787381acbb51cebcbab10b0f8f06b732dcb4b8d4ea6ae3db09"
//   },
//   {
//     address: "bcrt1p4ava77vgell9smwj2all3erfyqhmxzn2vrj3hvd93ze88xcm7x9q68hjr6",
//     privateKey: "cQo7ZZCshP5EuSPuY2rZLDETpsSAEX7Si6nXKrT2TLpTC3Rjv9Kp",
//     publicKey: "03af59df7988cffe586dd2577ff8e469202fb30a6a60e51bb1a588b2739b1bf18a"
//   },
//   {
//     address: "bcrt1pxmp3rjeee306vykdl9qyqm8d20ngptdfqgkza06ls9gsaz53cthq2en2zc",
//     privateKey: "cSdApzo5fFykq2u9Rt6Hm32E2yF9XqMu8kueiDXS7q5ndfypHJC1",
//     publicKey: "0236c311cb39cc5fa612cdf940406ced53e680ada9022c2ebf5f81510e8a91c2ee"
//   }
// ]
exports.default = exports.generateMock;
//# sourceMappingURL=generateMock.js.map