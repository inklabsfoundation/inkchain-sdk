/**
 * Created by wangh09 on 2017/10/11.
 */
var ethUtils = require('ethereumjs-util');
var crypto = require('crypto');
let address_prefix = "i";
class PrivKeyWallet {
    constructor(){
    }
    generate() {
        this.priKey = crypto.randomBytes(32);
        this.pubKey = ethUtils.privateToPublic(this.priKey);
        this.address = ethUtils.publicToAddress(this.pubKey);
    }
    getPriKey() {
        return this.priKey.toString('hex');
    }
    getAddress() {
        return ethUtils.toChecksumAddress(`${this.address.toString('hex')}`).replace('0x',address_prefix).toLowerCase()
    }
}
exports.Wallet = new PrivKeyWallet();