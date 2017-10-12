/**
 * Created by wangh09 on 2017/10/11.
 */

'use strict';

var tape = require('tape');
var _test = require('tape-promise');
var test = _test(tape);
var inkUtils = require('../InkUtils.js');

let wallet = require('../wallet.js');
let count = 10;
let start = 0;
let timeout = 4000;
test('\n\n***** End-to-end flow: invoke chaincode *****\n\n', (t) => {

    //************ issue token
    inkUtils.invokeChaincode('org1', 'tscc','1.0','registerAndIssueToken', ['CCTEST','10','18','411b6f8f24F28CaAFE514c16E11800167f8EBd89'], false)
        .then((result) => {
            if(result){
                t.pass('Successfully invoke transaction chaincode on channel');
            }
            else {
                t.fail('Failed to invoke transaction chaincode ');
                t.end();
            }
        }, (err) => {
            t.fail('Failed to invoke transaction chaincode on channel. ' + err.stack ? err.stack : err);
            t.end();
        }).then(() => {
        t.end();
    }).catch((err) => {
        t.fail('Test failed due to unexpected reasons. ' + err.stack ? err.stack : err);
        t.end();
    });

    //************ serial send
    setTimeout(()=>{
    inkUtils.queryChaincode('org1', 'token', 'getBalance', ["411b6f8f24F28CaAFE514c16E11800167f8EBd89","CCTEST"])
        .then((result) => {
            t.pass('Successfully query chaincode on the channel. Response:' + result);
            start = parseInt(result[0].toString());
        }, (err) => {
            t.fail('Failed to query chaincode on the channel. ' + err.stack ? err.stack : err);
            t.end();
        }).catch((err) => {
        t.fail('Test failed due to unexpected reasons. ' + err.stack ? err.stack : err);
        t.end();
    })}, 4000);

    for(let i = 0; i < count; i++) {
        (function(i) {
            setTimeout(()=> {
                inkUtils.invokeChaincodeSigned('org1', 'token', 'v0', 'transfer', ["4708A97Bf6F53c2Ca664BB003eF80fa6B997D656", "CCTEST", "1"], "1", "hello world", "bab0c1204b2e7f344f9d1fbe8ad978d5355e32b8fa45b10b600d64ca970e0dc9")
                    .then((result) => {
                        t.pass('success');
                        t.end();
                    }, (err) => {
                        t.fail('Failed to query chaincode on the channel. ' + err.stack ? err.stack : err);
                        t.end();
                    }).catch((err) => {
                    t.fail('Test failed due to unexpected reasons. ' + err.stack ? err.stack : err);
                    t.end();
                })}, 4000 + timeout*i);
        })(i);
    }

    //************* check
    setTimeout(() => {
        inkUtils.queryChaincode('org1', 'token', 'getBalance', ["411b6f8f24F28CaAFE514c16E11800167f8EBd89","CCTEST"])
            .then((result) => {
                t.pass('Successfully query chaincode on the channel. Response:' + result);
                let end = parseInt(result[0]);
                if(end == 0){
                    if(start - count < 0) {
                        t.pass("success.");
                    }
                } else {
                    t.equal(start - count, end)
                }
            }, (err) => {
                t.fail('Failed to query chaincode on the channel. ' + err.stack ? err.stack : err);
                t.end();
            }).catch((err) => {
            t.fail('Test failed due to unexpected reasons. ' + err.stack ? err.stack : err);
            t.end();
        });
    }, 4000 + timeout * (count + 5));

});