/**
 * Created by wangh09 on 2017/9/19.
 */
'use strict';

var tape = require('tape');
var _test = require('tape-promise');
var test = _test(tape);
var inkUtils = require('./inkUtils.js');

test('\n\n***** End-to-end flow: invoke transaction to issue token *****\n\n', (t) => {
    inkUtils.invokeChaincode('org1', 'tscc','1.0','registerAndIssueToken', ['CCToken','1000000000','18','4230a12f5b0693dd88bb35c79d7e56a68614b199'], false/*useStore*/)
        .then((result) => {
            if(result){
                t.pass('Successfully invoke transaction chaincode on channel');
                return sleep(5000);
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
