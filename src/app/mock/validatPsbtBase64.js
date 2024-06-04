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
const psbtBase64 = "cHNidP8BAFICAAAAAbypNwubGHHUmyWhIEOJmvyGkbBwTUWl/Vec2WybXObBAAAAAADwAwAAAeyQlgAAAAAAFgAUBnCpIDWtCCj0p7MPgvtoEejUr2IAAAAAAAEBK4CWmAAAAAAAIlEgA5Od1/3f8l57HQ368NXfpBgv8aqKM7QUx2H9BfXccCNiFcCDqAZqh8sv6YABcax55GSXe5OODyIFm591qfstGdDmg+YAu5gOhfR/AJo2/1Phn7KCBtdkDPZLHtsl+ey9aOL+d4doRAsTSmLdDO/IUvG0qEOvDa2pyICfaCFWkZV4l8snID5h3Ztw1PbVosMPlVmVtBhvA3THgaacu84kS3FA0kKBrQLwA7LAARcgg6gGaofLL+mAAXGseeRkl3uTjg8iBZufdan7LRnQ5oMAAA==";
const psbt = bitcoin.Psbt.fromBase64(psbtBase64); // 加载PSBT
const validator = (pubKey, signature, hash) => {
    return bitcoin.ECPair.fromPublicKey(pubKey)
        .verify(hash, signature);
};
psbt.data.inputs.forEach((input, index) => {
    if (!psbt.validateSignaturesOfInput(index, validator)) {
        console.log(`Input ${index} has invalid or incomplete signatures.`);
    }
});
//# sourceMappingURL=validatPsbtBase64.js.map