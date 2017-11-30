/**
 * Created by wangh09 on 2017/9/19.
 */
'use strict';

var tape = require('tape');
var _test = require('tape-promise');
var test = _test(tape);
var inkUtils = require('../InkUtils.js');

test('\n\n***** End-to-end flow: invoke chaincode *****\n\n', (t) => {
    inkUtils.invokeChaincodeSigned('org1', 'token', 'v0', 'transfer', ["3c97f146e8de9807ef723538521fcecd5f64c79a", "INK", "1000"], "10", "hello world", "bab0c1204b2e7f344f9d1fbe8ad978d5355e32b8fa45b10b600d64ca970e0dc9", false)
        .then((result) => {
            t.pass('success');
            t.end();
            console.log('tx_id:' + result);
        }, (err) => {
            t.fail('Failed to query chaincode on the channel. ' + err.stack ? err.stack : err);
            t.end();
        }).catch((err) => {
        t.fail('Test failed due to unexpected reasons. ' + err.stack ? err.stack : err);
        t.end();
    });
});
