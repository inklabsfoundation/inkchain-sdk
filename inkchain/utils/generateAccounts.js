/**
 * Created by wangh09 on 2017/10/19.
 */

let wallet = require('../wallet.js');
var addrArr = [];
var priArr = [];
let address = wallet.Wallet;
const NAccounts = 10;
for(let i = 0; i < NAccounts; i++) {
    address.generate();
    addrArr[address.getAddress()] = address.getPriKey();
//    addrArr.push(address.getAddress());
//    priArr.push(address.getPriKey());
}
console.log(addrArr);