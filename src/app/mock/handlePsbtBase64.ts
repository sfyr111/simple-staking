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

  const publicKey = privateKey.publicKey.toString('hex');

  console.log('publicKey: ', publicKey)
  console.log(publicKey === '023e61dd9b70d4f6d5a2c30f955995b4186f0374c781a69cbbce244b7140d24281')
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

  // Signed transaction hex: 02000000000101d017469f304d8f37c631776e5eb7e747107bb8c49d418048d39a7a199742140000000000006c00000001ec909600000000001600140670a92035ad0828f4a7b30f82fb6811e8d4af6203402113aee2d88edf44c89b4b396524cb8f221a4df674293b53eb86af23b506221b9071bff0ebc62c04ebcc5ddb855a637e19c443d34f855dcd50c994a41b0e7c5225203e61dd9b70d4f6d5a2c30f955995b4186f0374c781a69cbbce244b7140d24281ad016cb261c183a8066a87cb2fe9800171ac79e464977b938e0f22059b9f75a9fb2d19d0e683e600bb980e85f47f009a36ff53e19fb28206d7640cf64b1edb25f9ecbd68e2fe778768440b134a62dd0cefc852f1b4a843af0dada9c8809f68215691957897cb00000000
  return txHex;
}

// 假设您有一个函数来获取保存的 PSBT 和私钥
async function handleWithdrawalTransaction(psbtBase64) {
  console.log('psbtBase64: ', psbtBase64);
  const privateKeyWIF = 'cVdXE4grxmNeLEjnMFqYTg7og7owy25cLBmwxodMMFhpPE1ki8S8'; // 使用适当的值
  const network = bitcoin.networks.regtest; // 或 bitcoin.networks.testnet

  if (psbtBase64) {
    const txHex = await signAndExtractTransaction(psbtBase64, privateKeyWIF, network);
    console.log("Signed transaction hex:", txHex);
  } else {
    console.error("No PSBT data found.");
  }
}


// PSBT base64
// cHNidP8BAFICAAAAAdAXRp8wTY83xjF3bl6350cQe7jEnUGASNOaehmXQhQAAAAAAABsAAAAAeyQlgAAAAAAFgAUBnCpIDWtCCj0p7MPgvtoEejUr2IAAAAAAAEBK4CWmAAAAAAAIlEgrJ5v+3rZAb5OGIyz+kIonP844WV2uGh80mBs/SXtiIxiFcGDqAZqh8sv6YABcax55GSXe5OODyIFm591qfstGdDmg+YAu5gOhfR/AJo2/1Phn7KCBtdkDPZLHtsl+ey9aOL+d4doRAsTSmLdDO/IUvG0qEOvDa2pyICfaCFWkZV4l8smID5h3Ztw1PbVosMPlVmVtBhvA3THgaacu84kS3FA0kKBrQFsssABFyCDqAZqh8sv6YABcax55GSXe5OODyIFm591qfstGdDmgwAiAgI+Yd2bcNT21aLDD5VZlbQYbwN0x4GmnLvOJEtxQNJCgRBQmfBkAAAAgAAAAIABAACAAA==

handleWithdrawalTransaction(process.argv[2]);
