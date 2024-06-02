import * as ecc from "tiny-secp256k1";
import ECPairFactory from "ecpair";

const bitcoin = require('bitcoinjs-lib');

// 初始化使用 tiny-secp256k1 的 ECC 库
bitcoin.initEccLib(ecc);
const ECPair = ECPairFactory(ecc);
// 函数来处理签名和提取交易
async function signAndExtractTransaction(psbtBase64: string, privateKeyWIF: string, network): Promise<string> {
  const privateKey = ECPair.fromWIF(privateKeyWIF, network);
  const psbt = bitcoin.Psbt.fromBase64(psbtBase64);

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
    const sighashTypes = bitcoin.Transaction.SIGHASH_DEFAULT;  // 使用 Taproot 推荐的默认 sighash
    // 确保使用对应的方法进行签名
    psbt.signInput(i, privateKey, sighashTypes);
    // 验证签名，如果不验证，直接调用finalize可能会因为无效签名而出错
    if (!psbt.validateSignaturesOfInput(i, privateKey.publicKey)) {
      throw new Error(`Invalid signature for input ${i}`);
    }
  }

  // 完成所有输入
  psbt.finalizeAllInputs();

  // 提取交易
  const transaction = psbt.extractTransaction();
  return transaction.toHex();
}

// 假设您有一个函数来获取保存的 PSBT 和私钥
async function handleWithdrawalTransaction(psbtBase64) {
  console.log('psbtBase64: ', psbtBase64);
  const privateKeyWIF = 'cNjEdTh2Aq9uCRqUnTaFv62i6HWgr4EEzosNaya8ssTry8NNgjRm'; // 使用适当的值
  const network = bitcoin.networks.regtest; // 或 bitcoin.networks.testnet

  if (psbtBase64) {
    const txHex = await signAndExtractTransaction(psbtBase64, privateKeyWIF, network);
    console.log("Signed transaction hex:", txHex);
  } else {
    console.error("No PSBT data found.");
  }
}

// cHNidP8BAFICAAAAAbypNwubGHHUmyWhIEOJmvyGkbBwTUWl/Vec2WybXObBAAAAAADwAwAAAViLlAAAAAAAFgAUBnCpIDWtCCj0p7MPgvtoEejUr2IAAAAAAAEBK4CWmAAAAAAAIlEgA5Od1/3f8l57HQ368NXfpBgv8aqKM7QUx2H9BfXccCNiFcCDqAZqh8sv6YABcax55GSXe5OODyIFm591qfstGdDmg+YAu5gOhfR/AJo2/1Phn7KCBtdkDPZLHtsl+ey9aOL+d4doRAsTSmLdDO/IUvG0qEOvDa2pyICfaCFWkZV4l8snID5h3Ztw1PbVosMPlVmVtBhvA3THgaacu84kS3FA0kKBrQLwA7LAARcgg6gGaofLL+mAAXGseeRkl3uTjg8iBZufdan7LRnQ5oMAAA==
handleWithdrawalTransaction(process.argv[2]);
