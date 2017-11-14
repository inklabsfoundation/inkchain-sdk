/**
 * Created by wangh09 on 2017/9/19.
 */
'use strict';

var tape = require('tape');
var _test = require('tape-promise');
var test = _test(tape);
var inkUtils = require('../InkUtils.js');

test('\n\n***** End-to-end flow: query chaincode *****\n\n', (t) => {

    inkUtils.getBalance('org1',["411b6f8f24F28CaAFE514c16E11800167f8EBd89","INK"], null,false)
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
