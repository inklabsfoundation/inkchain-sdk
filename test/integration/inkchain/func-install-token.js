/**
 * Copyright 2017 IBM All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

// This is an end-to-end test that focuses on exercising all parts of the fabric APIs
// in a happy-path scenario
'use strict';

var utils = require('fabric-client/lib/utils.js');
var logger = utils.getLogger('E2E install-chaincode');

var tape = require('tape');
var _test = require('tape-promise');
var test = _test(tape);

var testUtil = require('../../unit/util.js');

var inkchainUtils = require('./InkUtils.js');

const TOKEN_CHAINCODE_PATH = 'github.com/token';
const TOKEN_CHAINCODE_ID = 'token';
const TOKEN_VERSION = 'v0';

var sleep = require('sleep');

test('\n\n***** inkchain flow: chaincode install *****\n\n', (t) => {
    testUtil.setupChaincodeDeploy();


    inkchainUtils.installChaincode('org1',TOKEN_CHAINCODE_ID, TOKEN_CHAINCODE_PATH, TOKEN_VERSION, t, true)
        .then(() => {
            t.pass('Successfully installed chaincode in peers of organization "org1"');
            return inkchainUtils.installChaincode('org2',TOKEN_CHAINCODE_ID, TOKEN_CHAINCODE_PATH, TOKEN_VERSION, t, true);
        }, (err) => {
            t.fail('Failed to install chaincode in peers of organization "org1". ' + err.stack ? err.stack : err);
            logger.error('Failed to install chaincode in peers of organization "org1". ');
            return inkchainUtils.installChaincode('org2',TOKEN_CHAINCODE_ID, TOKEN_CHAINCODE_PATH, TOKEN_VERSION, t, true);
        }).then(() => {
        t.pass('Successfully installed chaincode in peers of organization "org2"');
        return inkchainUtils.sleep(5000);
    }, (err) => {
        t.fail('Failed to install chaincode in peers of organization "org2". ' + err.stack ? err.stack : err);
        logger.error('Failed to install chaincode in peers of organization "org2". ');
        t.end();
    }).then(() => {
        logger.debug('Successfully slept 5s to wait for chaincode installation to be completed');
        t.end();
    }).catch((err) => {
        t.fail('Test failed due to unexpected reasons. ' + err.stack ? err.stack : err);
        t.end();
    });

});
