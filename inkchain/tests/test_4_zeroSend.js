/**
 * Created by wangh09 on 2017/10/11.
 */
'use strict';


let clientUtils = require('../ClientUtils');
let wallet = require('../wallet.js');
let count = 20000;

function invokeTransfer(msg) {
    return clientUtils.invokeChaincodeSigned('org1', 'token', 'v0', 'transfer', ["3c97f146e8de9807ef723538521fcecd5f64c79a", "INK", "1"], "10", msg, "bab0c1204b2e7f344f9d1fbe8ad978d5355e32b8fa45b10b600d64ca970e0dc9", false)
        .then((result) => {
            return result;
        });
}
for(let i = 0; i < count; i++) {
    invokeTransfer("hello world" + i.toString()).then((result) => {
        console.log(result);
    });
}