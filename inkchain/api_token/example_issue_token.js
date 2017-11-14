/**
 * Created by wangh09 on 2017/9/19.
 */
'use strict';

var tape = require('tape');
var _test = require('tape-promise');
var test = _test(tape);
var inkUtils = require('../InkUtils.js');

test('\n\n***** End-to-end flow: invoke transaction to issue token *****\n\n', (t) => {
    inkUtils.issueToken('org1', 'ascc','v0','registerAndIssueToken', ['INK','1000000000000','18','411b6f8f24F28CaAFE514c16E11800167f8EBd89'], true)
        .then((result) => {
            if(result){
                t.pass('Successfully invoke transaction chaincode on channel');
                return sleep(1000);
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
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
