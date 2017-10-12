/**
 * Created by wangh09 on 2017/10/12.
 */

'use strict';

var tape = require('tape');
var _test = require('tape-promise');
var test = _test(tape);
var inkUtils = require('../InkUtils.js');

let wallet = require('../wallet.js');
let amount = 0;
let NSending = 2;
let sentId = 0;
test('\n\n***** End-to-end flow: invoke chaincode *****\n\n', (t) => {
    var addrArr = [];
    var priArr = [];
    let address = wallet.Wallet;
    for(let i = 0; i < NSending; i++) {
        address.generate();
        addrArr.push(address.getAddress());
        priArr.push(address.getPriKey());
        console.log(addrArr[i]);
        console.log(priArr[i]);
    }

    inkUtils.queryChaincode('org1', 'token', 'getBalance', ["411b6f8f24F28CaAFE514c16E11800167f8EBd89","CCCToken"])
        .then((result) => {
            t.pass('Successfully query chaincode on the channel. Response:' + result);
            amount = result[0].toString();
            t.end()
        }, (err) => {
            t.fail('Failed to query chaincode on the channel. ' + err.stack ? err.stack : err);
            t.end();
        }).catch((err) => {
        t.fail('Test failed due to unexpected reasons. ' + err.stack ? err.stack : err);
        t.end();
    });

    setTimeout(()=>{
        for(let i = 0; i < NSending; i++) {
            inkUtils.invokeChaincodeSigned('org1', 'token', 'v0', 'transfer', [addrArr[i], "CCCToken", amount+""], "1", "hello world", "bab0c1204b2e7f344f9d1fbe8ad978d5355e32b8fa45b10b600d64ca970e0dc9")
                .then((result) => {
                    t.pass('success');
                    t.end();
                }, (err) => {
                    t.fail('Failed to query chaincode on the channel. ' + err.stack ? err.stack : err);
                    t.end();
                }).catch((err) => {
                t.fail('Test failed due to unexpected reasons. ' + err.stack ? err.stack : err);
                t.end();
            });
        }
    }, 2000);

    setTimeout(()=>{
        inkUtils.queryChaincode('org1', 'token', 'getBalance', ["411b6f8f24F28CaAFE514c16E11800167f8EBd89","CCCToken"])
            .then((result) => {
                t.pass('Successfully query chaincode on the channel. Response:' + result);
                t.equal(result[0].toString(), '0');
                t.end()
            }, (err) => {
                t.fail('Failed to query chaincode on the channel. ' + err.stack ? err.stack : err);
                t.end();
            }).catch((err) => {
            t.fail('Test failed due to unexpected reasons. ' + err.stack ? err.stack : err);
            t.end();
        });

        for(let i = 0; i < NSending; i++) {
            inkUtils.queryChaincode('org1', 'token', 'getBalance', [addrArr[i], "CCCToken"])
                .then((result) => {
                    if(result.toString() == amount + "," + amount) {
                        sentId = i;
                        t.equal(amount, result[0].toString());
                        console.log(amount + "~sent id saved~");
                    }
                }, (err) => {
                    t.end();
                }).catch((err) => {
                t.fail('Test failed due to unexpected reasons. ' + err.stack ? err.stack : err);
                t.end();
            });
        }
    }, 6000);

    setTimeout(()=>{
        inkUtils.invokeChaincodeSigned('org1', 'token', 'v0', 'transfer', ['411b6f8f24F28CaAFE514c16E11800167f8EBd89', "CCCToken", amount], "1", "hello world", priArr[sentId])
            .then((result) => {
                t.pass('success');
                t.end();
            }, (err) => {
                t.fail('Failed to query chaincode on the channel. ' + err.stack ? err.stack : err);
                t.end();
            }).catch((err) => {
            t.fail('Test failed due to unexpected reasons. ' + err.stack ? err.stack : err);
            t.end();
        });
    }, 7000);


    setTimeout(()=>{
        inkUtils.queryChaincode('org1', 'token', 'getBalance', ["411b6f8f24F28CaAFE514c16E11800167f8EBd89","CCCToken"])
            .then((result) => {
                t.pass('Successfully query chaincode on the channel. Response:' + result);
                t.equal(result[0].toString(), amount);
                t.end()
            }, (err) => {
                t.fail('Failed to query chaincode on the channel. ' + err.stack ? err.stack : err);
                t.end();
            }).catch((err) => {
            t.fail('Test failed due to unexpected reasons. ' + err.stack ? err.stack : err);
            t.end();
        });
    }, 12000);




});

