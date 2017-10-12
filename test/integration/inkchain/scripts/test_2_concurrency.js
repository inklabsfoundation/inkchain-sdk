/**
 * Created by wangh09 on 2017/10/11.
 */
'use strict';

var tape = require('tape');
var _test = require('tape-promise');
var test = _test(tape);
var inkUtils = require('../InkUtils.js');

let wallet = require('../wallet.js');
let timeout = 4000;
let NAccounts = 1000;
test('\n\n***** End-to-end flow: invoke chaincode *****\n\n', (t) => {
    var addrArr = [];
    var priArr = [];
    let address = wallet.Wallet;
    for(let i = 0; i < NAccounts; i++) {
        address.generate();
        addrArr.push(address.getAddress());
        priArr.push(address.getPriKey());
    }
    var start = 0;

    //****** Send Token

    for(let i = 0; i < addrArr.length; i++) {
        (function(i) {
            setTimeout(()=> {
                inkUtils.invokeChaincodeSigned('org1', 'token', 'v0', 'transfer', [addrArr[i], "CCCToken", "1"], "1", "hello world", "bab0c1204b2e7f344f9d1fbe8ad978d5355e32b8fa45b10b600d64ca970e0dc9")
                    .then((result) => {
                        t.pass('success');
                        inkUtils.queryChaincode('org1', 'token', 'getBalance', ["411b6f8f24F28CaAFE514c16E11800167f8EBd89","CCCToken"])
                            .then((result) => {
                                t.pass('Successfully query chaincode on the channel. Response:' + result);
                                if(i == 0) {
                                    start = result[0];
                                }
                            }, (err) => {
                                t.fail('Failed to query chaincode on the channel. ' + err.stack ? err.stack : err);
                                t.end();
                            }).catch((err) => {
                            t.fail('Test failed due to unexpected reasons. ' + err.stack ? err.stack : err);
                            t.end();
                        });
                    }, (err) => {
                        t.fail('Failed to query chaincode on the channel. ' + err.stack ? err.stack : err);
                        t.end();
                    }).catch((err) => {
                    t.fail('Test failed due to unexpected reasons. ' + err.stack ? err.stack : err);
                    t.end();
                })}, timeout * i);
        })(i);
    }

    //****** Concurrently send back

    setTimeout(()=>{
        for(let i = 0; i < addrArr.length; i++) {
            process.nextTick(function () {
                inkUtils.invokeChaincodeSigned('org1', 'token', 'v0','transfer', ['411b6f8f24F28CaAFE514c16E11800167f8EBd89',"CCCToken","1"],"1", "hello world",priArr[i])
                    .then((result) => {
                        t.pass('success');
                    }, (err) => {
                        t.fail('Failed to query chaincode on the channel. ' + err.stack ? err.stack : err);
                        t.end();
                    }).catch((err) => {
                    t.fail('Test failed due to unexpected reasons. ' + err.stack ? err.stack : err);
                    t.end();
                });
            });}
    }, timeout * addrArr.length);

    //******* check
    setTimeout(()=>{
        inkUtils.queryChaincode('org1', 'token', 'getBalance', ["411b6f8f24F28CaAFE514c16E11800167f8EBd89","CCCToken"])
            .then((result) => {
                t.pass('Successfully query chaincode on the channel. Response:' + result);
                console.log(result[0].toString(),start.toString());
                t.equal(result[0].toString(),start.toString());
                t.end()
            }, (err) => {
                t.fail('Failed to query chaincode on the channel. ' + err.stack ? err.stack : err);
                t.end();
            }).catch((err) => {
            t.fail('Test failed due to unexpected reasons. ' + err.stack ? err.stack : err);
            t.end();
        });
    }, timeout * (addrArr.length + 10));
});