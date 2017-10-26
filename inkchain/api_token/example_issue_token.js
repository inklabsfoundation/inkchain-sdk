/**
 * Created by wangh09 on 2017/9/19.
 */
'use strict';

var tape = require('tape');
var _test = require('tape-promise');
var test = _test(tape);
<<<<<<< HEAD:inkchain/api_token/example_issue_token.js
var inkUtils = require('../InkUtils.js');
=======
var inkUtils = require('./InkUtils.js');
>>>>>>> 4d7452a... replace hyperledger/fabric with inkchain/inkchain:test/integration/inkchain/example_issue_token.js

test('\n\n***** End-to-end flow: invoke transaction to issue token *****\n\n', (t) => {
    inkUtils.invokeChaincode('org1', 'ascc','v0','registerAndIssueToken', ['CCCToken','1000000000','18','411b6f8f24F28CaAFE514c16E11800167f8EBd89'], true/*useStore*/)
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
