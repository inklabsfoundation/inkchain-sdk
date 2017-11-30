/**
 * Created by wangh09 on 2017/11/28.
 */

'use strict';

var tape = require('tape');
var grpc = require('grpc');
var _test = require('tape-promise');
var test = _test(tape);
var inkUtils = require('../../InkUtils.js');
var Client = require('inkchain-client');
test('\n\n***** End-to-end flow: query chaincode *****\n\n', (t) => {
    //userOrg, ccId, version, func, args, useStore, senderSpec, priKey, isAdmin
    inkUtils.queryChaincode('org1', 'qscc','GetTransactionByID', ["mychannel", "272a058ead3ef8ad0089ee3a4ebdd51a1e83f4ad204d70a2cedb74d97eca3dc6"])
         .then((result) => {
            t.pass('Successfully query chaincode on the channel. Response:' +JSON.stringify(Client.decodeTransaction(result[0])));
            t.end();
        }, (err) => {
            t.fail('Failed to query chaincode on the channel. ' + err.stack ? err.stack : err);
            t.end();
        }).catch((err) => {
        t.fail('Test failed due to unexpected reasons. ' + err.stack ? err.stack : err);
        t.end();
    });
});