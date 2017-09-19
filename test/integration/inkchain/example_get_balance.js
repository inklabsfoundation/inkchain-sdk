/**
 * Created by wangh09 on 2017/9/19.
 */
'use strict';

var tape = require('tape');
var _test = require('tape-promise');
var test = _test(tape);
var inkUtils = require('./inkUtils.js');

test('\n\n***** End-to-end flow: query chaincode *****\n\n', (t) => {

    inkUtils.getBalance('org1',["4230a12f5b0693dd88bb35c79d7e56a68614b199","CCToken"])
        .then((result) => {
            t.pass('Successfully query chaincode on the channel. Response:' + result);
            t.end();
        }, (err) => {
            t.fail('Failed to query chaincode on the channel. ' + err.stack ? err.stack : err);
            t.end();
        }).catch((err) => {
        t.fail('Test failed due to unexpected reasons. ' + err.stack ? err.stack : err);
        t.end();
    });

});
