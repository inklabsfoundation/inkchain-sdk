/**
 * Created by wangh09 on 2017/9/19.
 */
'use strict';

var tape = require('tape');
var _test = require('tape-promise');
var test = _test(tape);
var inkUtils = require('./InkUtils.js');

test('\n\n***** End-to-end flow: invoke chaincode *****\n\n', (t) => {
    inkUtils.invokeChaincodeSigned('org1', 'token', 'v0','transfer', ["3c97f146e8de9807ef723538521fcecd5f64c79a","CCToken","1000000"],"1", "hello world","bc4bcb06a0793961aec4ee377796e050561b6a84852deccea5ad4583bb31eebe")
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

});
