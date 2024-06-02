import * as ecc from "tiny-secp256k1";

import ECPairFactory from "ecpair";
const bitcoin = require('bitcoinjs-lib');

// 初始化使用 tiny-secp256k1 的 ECC 库

bitcoin.initEccLib(ecc);
const ECPair = ECPairFactory(ecc);

const psbtBase64 = "cHNidP8BAFICAAAAAbypNwubGHHUmyWhIEOJmvyGkbBwTUWl/Vec2WybXObBAAAAAADwAwAAAeyQlgAAAAAAFgAUBnCpIDWtCCj0p7MPgvtoEejUr2IAAAAAAAEBK4CWmAAAAAAAIlEgA5Od1/3f8l57HQ368NXfpBgv8aqKM7QUx2H9BfXccCNiFcCDqAZqh8sv6YABcax55GSXe5OODyIFm591qfstGdDmg+YAu5gOhfR/AJo2/1Phn7KCBtdkDPZLHtsl+ey9aOL+d4doRAsTSmLdDO/IUvG0qEOvDa2pyICfaCFWkZV4l8snID5h3Ztw1PbVosMPlVmVtBhvA3THgaacu84kS3FA0kKBrQLwA7LAARcgg6gGaofLL+mAAXGseeRkl3uTjg8iBZufdan7LRnQ5oMAAA=="

const psbt = bitcoin.Psbt.fromBase64(psbtBase64);  // 加载PSBT

const validator = (pubKey, signature, hash) => {
  return bitcoin.ECPair.fromPublicKey(pubKey)
                .verify(hash, signature);
};
psbt.data.inputs.forEach((input, index) => {
  if (!psbt.validateSignaturesOfInput(index, validator)) {
    console.log(`Input ${index} has invalid or incomplete signatures.`);
  }
});
