/**
 * Created by wangh09 on 2017/12/13.
 */
'use strict';

let count = 20000;
let util = require('util');

require('../config');
let invokeSignedHandler = require('../invoke-signed');

let helper = require('../helper');

helper.getRegisteredUsers('user', 'org1');

function invokeTransfer(msg) {
    return invokeSignedHandler.invokeChaincodeSigned(['peer1'],'mychannel','token','transfer',["i3c97f146e8de9807ef723538521fcecd5f64c79a", "INK", "1000"],'user','org1','10',msg,'bab0c1204b2e7f344f9d1fbe8ad978d5355e32b8fa45b10b600d64ca970e0dc9').then((result) =>{
        console.log(result);
    });
}

let counter = 0;
for(let i = 0; i < count; i++) {
    invokeTransfer("hello world" + i.toString()).then((result) => {
        console.log(counter);
        counter++;
    });

}