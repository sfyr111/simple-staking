const Client = require('bitcoin-core');
const wallet1 = new Client({
    network: 'regtest',
    port: 18443,
    wallet: 'legacy_wallet',
    username: '111111',
    password: '111111'
});



(async function() {
    console.log(wallet1)
    console.log( await wallet1.getNewAddress())
    console.log(await  wallet1.getAddressInfo('bcrt1quf9urzl60pzkzay6l3cey44ak4a0hzdk5l928w'))
    console.log( await wallet1.listAddressGroupings())
    console.log(await wallet1.getBalance());
}());
