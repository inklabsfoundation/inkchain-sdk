/**
 * Created by wangh09 on 2017/9/18.
 */
'use strict';
var path = require('path');
module.exports.WORK_PATH = path.join(__dirname,'../');

var utils = require('inkchain-client/lib/utils.js');
var logger = utils.getLogger('inkchain testing');
const Long = require('long');
var ethUtils = require('ethereumjs-util');
const CHANNEL_NAME = "mychannel";
module.exports.CHANNEL_NAME = CHANNEL_NAME;


var ORGS;
var Client = require('inkchain-client');
var testUtil = require('./utils/unit/util.js');
var fs = require('fs');
var util = require('util');

var the_user = null;
var tx_id = null;

function init() {
    if (!ORGS) {
        Client.addConfigFile(path.join(__dirname, './config.json'));
        ORGS = Client.getConfigSetting('test-network');
    }
}

function installChaincode(org, chaincode_id, chaincode_path, version, t, get_admin) {
    init();
    Client.setConfigSetting('request-timeout', 60000);
    var channel_name = Client.getConfigSetting('E2E_CONFIGTX_CHANNEL_NAME', CHANNEL_NAME);

    var client = new Client();
    // client.setDevMode(true);
    var channel = client.newChannel(channel_name);

    var orgName = ORGS[org].name;
    var cryptoSuite = Client.newCryptoSuite();
    cryptoSuite.setCryptoKeyStore(Client.newCryptoKeyStore({path: testUtil.storePathForOrg(orgName)}));
    client.setCryptoSuite(cryptoSuite);

    var caRootsPath = ORGS.orderer.tls_cacerts;
    let data = fs.readFileSync(path.join(__dirname, caRootsPath));
    let caroots = Buffer.from(data).toString();

    channel.addOrderer(
        client.newOrderer(
            ORGS.orderer.url,
            {
                'pem': caroots,
                'ssl-target-name-override': ORGS.orderer['server-hostname']
            }
        )
    );

    var targets = [];
    for (let key in ORGS[org]) {
        if (ORGS[org].hasOwnProperty(key)) {
            if (key.indexOf('peer') === 0) {
                let data = fs.readFileSync(path.join(__dirname, ORGS[org][key]['tls_cacerts']));
                let peer = client.newPeer(
                    ORGS[org][key].requests,
                    {
                        pem: Buffer.from(data).toString(),
                        'ssl-target-name-override': ORGS[org][key]['server-hostname']
                    }
                );

                targets.push(peer);    // a peer can be the target this way
                channel.addPeer(peer); // or a peer can be the target this way
                                       // you do not have to do both, just one, when there are
                                       // 'targets' in the request, those will be used and not
                                       // the peers added to the channel
            }
        }
    }

    return Client.newDefaultKeyValueStore({
        path: testUtil.storePathForOrg(orgName)
    }).then((store) => {
        client.setStateStore(store);

        // get the peer org's admin required to send install chaincode requests
        return testUtil.getSubmitter(client, get_admin /* get peer org admin */, org);
    }).then((admin) => {
            t.pass('Successfully enrolled user \'admin\'');
            the_user = admin;

            // send proposal to endorser
            var request = {
                targets: targets,
                chaincodePath: chaincode_path,
                chaincodeId: chaincode_id,
                chaincodeVersion: version
            };

            return client.installChaincode(request);
        },
        (err) => {
            t.fail('Failed to enroll user \'admin\'. ' + err);
            throw new Error('Failed to enroll user \'admin\'. ' + err);
        }).then((results) => {
            var proposalResponses = results[0];

            var proposal = results[1];
            var all_good = true;
            var errors = [];
            for(var i in proposalResponses) {
                let one_good = false;
                if (proposalResponses && proposalResponses[i].response && proposalResponses[i].response.status === 200) {
                    one_good = true;
                    logger.info('install proposal was good');
                } else {
                    logger.error('install proposal was bad');
                    errors.push(proposalResponses[i]);
                }
                all_good = all_good & one_good;
            }
            if (all_good) {
                t.pass(util.format('Successfully sent install Proposal and received ProposalResponse: Status - %s', proposalResponses[0].response.status));
            } else {
                throw new Error(util.format('Failed to send install Proposal or receive valid response: %s', errors));
            }
        },
        (err) => {
            t.fail('Failed to send install proposal due to error: ' + err.stack ? err.stack : err);
            throw new Error('Failed to send install proposal due to error: ' + err.stack ? err.stack : err);
        });
}

module.exports.installChaincode = installChaincode;

function issueToken(org, ccId, version, func, args, get_admin) {
    init();
    Client.setConfigSetting('request-timeout', 60000);
    var channel_name = Client.getConfigSetting('E2E_CONFIGTX_CHANNEL_NAME', CHANNEL_NAME);

    var client = new Client();
    var pass_results = null;
    // client.setDevMode(true);
    var channel = client.newChannel(channel_name);

    var orgName = ORGS[org].name;
    var cryptoSuite = Client.newCryptoSuite();
    cryptoSuite.setCryptoKeyStore(Client.newCryptoKeyStore({path: testUtil.storePathForOrg(orgName)}));
    client.setCryptoSuite(cryptoSuite);

    var caRootsPath = ORGS.orderer.tls_cacerts;
    let data = fs.readFileSync(path.join(__dirname, caRootsPath));
    let caroots = Buffer.from(data).toString();

    channel.addOrderer(
        client.newOrderer(
            ORGS.orderer.url,
            {
                'pem': caroots,
                'ssl-target-name-override': ORGS.orderer['server-hostname']
            }
        )
    );

    var targets = [];
    var eventhubs = [];

    for (let key in ORGS[org]) {
        if (ORGS[org].hasOwnProperty(key)) {
            if (key.indexOf('peer') === 0) {
                let data = fs.readFileSync(path.join(__dirname, ORGS[org][key]['tls_cacerts']));
                let peer = client.newPeer(
                    ORGS[org][key].requests,
                    {
                        pem: Buffer.from(data).toString(),
                        'ssl-target-name-override': ORGS[org][key]['server-hostname']
                    }
                );

                targets.push(peer);    // a peer can be the target this way
                channel.addPeer(peer); // or a peer can be the target this way
                                       // you do not have to do both, just one, when there are
                                       // 'targets' in the request, those will be used and not
                                       // the peers added to the channel
            }
        }
    }

    return Client.newDefaultKeyValueStore({
        path: testUtil.storePathForOrg(orgName)
    }).then((store) => {
        client.setStateStore(store);

        // get the peer org's admin required to send install chaincode requests
        return testUtil.getSubmitter(client, get_admin /* get peer org admin */, org);
    }).then((admin) => {
        the_user = admin;
        return channel.initialize();
    }).then((nothing)=>{
            // an event listener can only register with a peer in its own org
            tx_id = client.newTransactionID();
            utils.setConfigSetting('E2E_TX_ID', tx_id.getTransactionID());
            console.log('transaction id:' + tx_id.getTransactionID());
            logger.debug('setConfigSetting("E2E_TX_ID") = %s', tx_id.getTransactionID());
            // send proposal to endorser
            var request = {
                chaincodeId : ccId,
                fcn: func,
                args: args,
                txId: tx_id,
            };
            return channel.sendTransactionProposal(request);
        },
        (err) => {
            throw new Error('Failed to enroll user \'admin\'. ' + err);
        }).then((results) =>{
            pass_results = results;
            var sleep_time = 0;
            // can use "sleep=30000" to give some time to manually stop and start
            // the peer so the event hub will also stop and start
            if (process.argv.length > 2) {
                if (process.argv[2].indexOf('sleep=') === 0) {
                    sleep_time = process.argv[2].split('=')[1];
                }
            }
            logger.debug('*****************************************************************************');
            logger.debug('stop and start the peer event hub ---- N  O  W ----- you have ' + sleep_time + ' millis');
            logger.debug('*****************************************************************************');
            return sleep(sleep_time);
        }).then((nothing) => {
            var proposalResponses = pass_results[0];

            var proposal = pass_results[1];
            var all_good = true;
            for(var i in proposalResponses) {
                let one_good = false;
                let proposal_response = proposalResponses[i];
                if( proposal_response.response && proposal_response.response.status === 200) {
                    logger.debug('transaction proposal has response status of good');
                    one_good = channel.verifyProposalResponse(proposal_response);
                    if(one_good) {
                        logger.debug(' transaction proposal signature and endorser are valid');
                    }
                } else {
                    logger.debug('transaction proposal was bad');
                }
                all_good = all_good & one_good;
            }
            if (all_good) {
                // check all the read/write sets to see if the same, verify that each peer
                // got the same results on the proposal
                all_good = channel.compareProposalResponseResults(proposalResponses);
                logger.debug('compareProposalResponseResults exection did not throw an error');
                if(all_good){
                    logger.debug(' All proposals have a matching read/writes sets');
                }
                else {
                    logger.debug(' All proposals do not have matching read/write sets');
                }
            }
            if (all_good) {
                // check to see if all the results match
                logger.debug('Successfully sent Proposal and received ProposalResponse');
                logger.debug(util.format('Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s", metadata - "%s", endorsement signature: %s', proposalResponses[0].response.status, proposalResponses[0].response.message, proposalResponses[0].response.payload, proposalResponses[0].endorsement.signature));
                var request = {
                    proposalResponses: proposalResponses,
                    proposal: proposal
                };

                // set the transaction listener and set a timeout of 30sec
                // if the transaction did not get committed within the timeout period,
                // fail the test
                var deployId = tx_id.getTransactionID();

                var eventPromises = [];
                eventhubs.forEach((eh) => {
                    let txPromise = new Promise((resolve, reject) => {
                        let handle = setTimeout(reject, 120000);

                        eh.registerTxEvent(deployId.toString(),
                            (tx, code) => {
                                clearTimeout(handle);
                                eh.unregisterTxEvent(deployId);

                                if (code !== 'VALID') {
                                    logger.debug('The balance transfer transaction was invalid, code = ' + code);
                                    reject();
                                } else {
                                    logger.debug('The balance transfer transaction has been committed on peer '+ eh.getPeerAddr());
                                    resolve();
                                }
                            },
                            (err) => {
                                clearTimeout(handle);
                                logger.debug('Successfully received notification of the event call back being cancelled for '+ deployId);
                                resolve();
                            }
                        );
                    });

                    eventPromises.push(txPromise);
                });
                var sendPromise = channel.sendTransaction(request);
                return Promise.all([sendPromise].concat(eventPromises))
                    .then((results) => {
                        logger.debug(' event promise all complete and testing complete');
                        return results[0]; // the first returned value is from the 'sendPromise' which is from the 'sendTransaction()' call
                    }).catch((err) => {
                        for(var key in eventhubs) {
                            var event = eventhubs[key];
                            if (event && event.isconnected()) {
                                logger.debug('Disconnecting the event hub');
                                event.disconnect();
                            }
                        }
                        logger.debug('Failed to send transaction and get notifications within the timeout period.');
                        throw new Error('Failed to send transaction and get notifications within the timeout period.');

                    });

            } else {
                logger.debug('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
                throw new Error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
            }
        }, (err) => {

            logger.debug('Failed to send proposal due to error: ' + err.stack ? err.stack : err);
            throw new Error('Failed to send proposal due to error: ' + err.stack ? err.stack : err);

        }).then((response) => {
            for(var key in eventhubs) {
                var event = eventhubs[key];
                if (event && event.isconnected()) {
                    logger.debug('Disconnecting the event hub');
                    event.disconnect();
                }
            }
            if (response.status === 'SUCCESS') {
                logger.debug('Successfully sent transaction to the orderer.');
                logger.debug('******************************************************************');
                logger.debug('To manually run /test/integration/query.js, set the following environment variables:');
                logger.debug('export E2E_TX_ID='+'\''+tx_id.getTransactionID()+'\'');
                logger.debug('******************************************************************');
                logger.debug('invokeChaincode end');
                return true;
            } else {
                logger.debug('Failed to order the transaction. Error code: ' + response.status);
                throw new Error('Failed to order the transaction. Error code: ' + response.status);
            }
        }, (err) => {

            logger.debug('Failed to send transaction due to error: ' + err.stack ? err.stack : err);
            throw new Error('Failed to send transaction due to error: ' + err.stack ? err.stack : err);

        });
}

module.exports.issueToken = issueToken;

function instantiateChaincode(userOrg, chaincode_id, chaincode_path, version, upgrade, t){
    init();

    Client.setConfigSetting('request-timeout', 60000);
    var channel_name = Client.getConfigSetting('E2E_CONFIGTX_CHANNEL_NAME', CHANNEL_NAME);

    var targets = [],
        eventhubs = [];
    var type = 'instantiate';
    if(upgrade) type = 'upgrade';
    // override t.end function so it'll always disconnect the event hub
    t.end = ((context, ehs, f) => {
        return function() {
            for(var key in ehs) {
                var eventhub = ehs[key];
                if (eventhub && eventhub.isconnected()) {
                    logger.debug('Disconnecting the event hub');
                    eventhub.disconnect();
                }
            }

            f.apply(context, arguments);
        };
    })(t, eventhubs, t.end);

    var client = new Client();
    var channel = client.newChannel(channel_name);

    var orgName = ORGS[userOrg].name;
    var cryptoSuite = Client.newCryptoSuite();
    cryptoSuite.setCryptoKeyStore(Client.newCryptoKeyStore({path: testUtil.storePathForOrg(orgName)}));
    client.setCryptoSuite(cryptoSuite);

    var caRootsPath = ORGS.orderer.tls_cacerts;
    let data = fs.readFileSync(path.join(__dirname, caRootsPath));
    let caroots = Buffer.from(data).toString();

    channel.addOrderer(
        client.newOrderer(
            ORGS.orderer.url,
            {
                'pem': caroots,
                'ssl-target-name-override': ORGS.orderer['server-hostname']
            }
        )
    );

    var targets = [];
    var badTransientMap = { 'test1': 'transientValue' }; // have a different key than what the chaincode example_cc1.go expects in Init()
    var transientMap = { 'test': 'transientValue' };

    return Client.newDefaultKeyValueStore({
        path: testUtil.storePathForOrg(orgName)
    }).then((store) => {

        client.setStateStore(store);
        return testUtil.getSubmitter(client, true /* use peer org admin*/, userOrg);

    }).then((admin) => {

        t.pass('Successfully enrolled user \'admin\'');
        the_user = admin;

        for(let org in ORGS) {
            if (ORGS[org].hasOwnProperty('peer1')) {
                let key = 'peer1';
                let data = fs.readFileSync(path.join(__dirname, ORGS[org][key]['tls_cacerts']));
                logger.debug(' create new peer %s', ORGS[org][key].requests);
                let peer = client.newPeer(
                    ORGS[org][key].requests,
                    {
                        pem: Buffer.from(data).toString(),
                        'ssl-target-name-override': ORGS[org][key]['server-hostname']
                    }
                );

                targets.push(peer);
                channel.addPeer(peer);
            }
        }

        // an event listener can only register with a peer in its own org
        logger.debug(' create new eventhub %s', ORGS[userOrg]['peer1'].events);
        let data = fs.readFileSync(path.join(__dirname, ORGS[userOrg]['peer1']['tls_cacerts']));
        let eh = client.newEventHub();
        eh.setPeerAddr(
            ORGS[userOrg]['peer1'].events,
            {
                pem: Buffer.from(data).toString(),
                'ssl-target-name-override': ORGS[userOrg]['peer1']['server-hostname']
            }
        );
        eh.connect();
        eventhubs.push(eh);

        // read the config block from the orderer for the channel
        // and initialize the verify MSPs based on the participating
        // organizations
        return channel.initialize();
    }, (err) => {

        t.fail('Failed to enroll user \'admin\'. ' + err);
        throw new Error('Failed to enroll user \'admin\'. ' + err);

    }).then(() => {
        logger.debug(' orglist:: ', channel.getOrganizations());
        // the v1 chaincode has Init() method that expects a transient map
        if (upgrade) {
            // first test that a bad transient map would get the chaincode to return an error
            let request = buildChaincodeProposal(client, the_user, chaincode_id, chaincode_path, version, upgrade, badTransientMap);
            tx_id = request.txId;

            logger.debug(util.format(
                'Upgrading chaincode "%s" at path "%s" to version "%s" by passing args "%s" to method "%s" in transaction "%s"',
                request.chaincodeId,
                request.chaincodePath,
                request.chaincodeVersion,
                request.args,
                request.fcn,
                request.txId.getTransactionID()
            ));

            return channel.sendUpgradeProposal(request)
                .then((results) => {
                    let proposalResponses = results[0];

                    if (version === 'v1') {
                        // expecting both peers to return an Error due to the bad transient map
                        let success = false;
                        if (proposalResponses && proposalResponses.length > 0) {
                            proposalResponses.forEach((response) => {
                                if (response instanceof Error &&
                                    response.message.indexOf('Did not find expected key "test" in the transient map of the proposal')) {
                                    success = true;
                                } else {
                                    success = false;
                                }
                            });
                        }

                        if (success) {
                            // successfully tested the negative conditions caused by
                            // the bad transient map, now send the good transient map
                            request = buildChaincodeProposal(client, the_user, chaincode_id, chaincode_path, version, upgrade, transientMap);
                            tx_id = request.txId;

                            return channel.sendUpgradeProposal(request);
                        } else {
                            throw new Error('Failed to test for bad transient map. The chaincode should have rejected the upgrade proposal.');
                        }
                    } else if (version === 'v3') {
                        return Promise.resolve(results);
                    }
                });
        } else {
            let request = buildChaincodeProposal(client, the_user, chaincode_id, chaincode_path, version, upgrade, transientMap);
            tx_id = request.txId;

            return channel.sendInstantiateProposal(request);
        }

    }, (err) => {

        t.fail(util.format('Failed to initialize the channel. %s', err.stack ? err.stack : err));
        throw new Error('Failed to initialize the channel');

    }).then((results) => {

        var proposalResponses = results[0];

        var proposal = results[1];
        var all_good = true;
        for(var i in proposalResponses) {
            let one_good = false;
            if (proposalResponses && proposalResponses[i].response && proposalResponses[i].response.status === 200) {
                // special check only to test transient map support during chaincode upgrade
                one_good = true;
                logger.info(type +' proposal was good');
            } else {
                logger.error(type +' proposal was bad');
            }
            all_good = all_good & one_good;
        }
        if (all_good) {
            t.pass('Successfully sent Proposal and received ProposalResponse');
            logger.debug(util.format('Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s", metadata - "%s", endorsement signature: %s', proposalResponses[0].response.status, proposalResponses[0].response.message, proposalResponses[0].response.payload, proposalResponses[0].endorsement.signature));
            var request = {
                proposalResponses: proposalResponses,
                proposal: proposal
            };

            // set the transaction listener and set a timeout of 30sec
            // if the transaction did not get committed within the timeout period,
            // fail the test
            var deployId = tx_id.getTransactionID();

            var eventPromises = [];
            eventhubs.forEach((eh) => {
                let txPromise = new Promise((resolve, reject) => {
                    let handle = setTimeout(reject, 120000);

                    eh.registerTxEvent(deployId.toString(), (tx, code) => {
                        t.pass('The chaincode ' + type + ' transaction has been committed on peer '+ eh.getPeerAddr());
                        clearTimeout(handle);
                        eh.unregisterTxEvent(deployId);

                        if (code !== 'VALID') {
                            t.fail('The chaincode ' + type + ' transaction was invalid, code = ' + code);
                            reject();
                        } else {
                            t.pass('The chaincode ' + type + ' transaction was valid.');
                            resolve();
                        }
                    });
                });
                logger.debug('register eventhub %s with tx=%s',eh.getPeerAddr(),deployId);
                eventPromises.push(txPromise);
            });

            var sendPromise = channel.sendTransaction(request);
            return Promise.all([sendPromise].concat(eventPromises))
                .then((results) => {

                    logger.debug('Event promise all complete and testing complete');
                    return results[0]; // just first results are from orderer, the rest are from the peer events

                }).catch((err) => {

                    t.fail('Failed to send ' + type + ' transaction and get notifications within the timeout period.');
                    throw new Error('Failed to send ' + type + ' transaction and get notifications within the timeout period.');

                });

        } else {
            t.fail('Failed to send ' + type + ' Proposal or receive valid response. Response null or status is not 200. exiting...');
            throw new Error('Failed to send ' + type + ' Proposal or receive valid response. Response null or status is not 200. exiting...');
        }
    }, (err) => {

        t.fail('Failed to send ' + type + ' proposal due to error: ' + err.stack ? err.stack : err);
        throw new Error('Failed to send ' + type + ' proposal due to error: ' + err.stack ? err.stack : err);

    }).then((response) => {
        //TODO should look into the event responses
        if (!(response instanceof Error) && response.status === 'SUCCESS') {
            t.pass('Successfully sent ' + type + 'transaction to the orderer.');
            return true;
        } else {
            t.fail('Failed to order the ' + type + 'transaction. Error code: ' + response.status);
            Promise.reject(new Error('Failed to order the ' + type + 'transaction. Error code: ' + response.status));
        }
    }, (err) => {

        t.fail('Failed to send ' + type + ' due to error: ' + err.stack ? err.stack : err);
        Promise.reject(new Error('Failed to send instantiate due to error: ' + err.stack ? err.stack : err));
    });
};

function buildChaincodeProposal(client, the_user, chaincode_id, chaincode_path, version, upgrade, transientMap) {
    var tx_id = client.newTransactionID();

    // send proposal to endorser
    var request = {
        chaincodePath: chaincode_path,
        chaincodeId: chaincode_id,
        chaincodeVersion: version,
        fcn: 'init',
        args: [],
        txId: tx_id,
        // use this to demonstrate the following policy:
        // 'if signed by org1 admin, then that's the only signature required,
        // but if that signature is missing, then the policy can also be fulfilled
        // when members (non-admin) from both orgs signed'
        'endorsement-policy': {
            identities: [
                { role: { name: 'member', mspId: ORGS['org1'].mspid }},
                { role: { name: 'member', mspId: ORGS['org2'].mspid }},
                { role: { name: 'admin', mspId: ORGS['org1'].mspid }}
            ],
            policy: {
                '1-of': [
                    { 'signed-by': 2},
                    { '2-of': [{ 'signed-by': 0}, { 'signed-by': 1 }]}
                ]
            }
        }
    };

    if(upgrade) {
        // use this call to test the transient map support during chaincode instantiation
        request.transientMap = transientMap;
    }

    return request;
}


module.exports.instantiateChaincode = instantiateChaincode;


function invokeChaincodeSigned(userOrg, ccId, version, func, args, inkLimit, msg, priKey, isAdmin) {
    init();

    let senderAddress = ethUtils.privateToAddress(new Buffer(priKey,"hex"));
    let promise = Promise.resolve();

    return promise.then(()=>{
        return queryChaincode('org1', ccId, 'counter', [senderAddress.toString("hex")]).then((counter)=>{
            let senderSpec = {
                sender:Buffer.from(senderAddress.toString("hex")),
                counter:Long.fromString(counter[0].toString()),
                ink_limit:Buffer.from(inkLimit),
                msg:Buffer.from(msg)
            };
            return invokeChaincode(userOrg, ccId, version, func, args, true, senderSpec, priKey, isAdmin);
        });
    }, (err) => {
        console.log('Failed to query chaincode on the channel. ' + err.stack ? err.stack : err);
        throw new Error('Failed to send proposal due to error: ' + err.stack ? err.stack : err);
    }).catch((err) => {
        console.log('Test failed due to unexpected reasons. ' + err.stack ? err.stack : err);
        throw new Error('Failed to send proposal due to error: ' + err.stack ? err.stack : err);
    });

}
module.exports.invokeChaincodeSigned = invokeChaincodeSigned;

function invokeChaincode(userOrg, ccId, version, func, args, useStore, senderSpec, priKey, isAdmin){
    init();
    if(arguments.length < 7) {
        senderSpec = null;
        priKey = null;
        isAdmin = false;
    }
    logger.debug('invokeChaincode begin');
    Client.setConfigSetting('request-timeout', 60000);
    var channel_name = Client.getConfigSetting('E2E_CONFIGTX_CHANNEL_NAME', CHANNEL_NAME);

    var targets = [],
        eventhubs = [];
    var pass_results = null;

    // this is a transaction, will just use org's identity to
    // submit the request. intentionally we are using a different org
    // than the one that instantiated the chaincode, although either org
    // should work properly
    var client = new Client();
    var channel = client.newChannel(channel_name);

    var orgName = ORGS[userOrg].name;
    var cryptoSuite = Client.newCryptoSuite();
    if (useStore) {
        cryptoSuite.setCryptoKeyStore(Client.newCryptoKeyStore({path: testUtil.storePathForOrg(orgName)}));
        client.setCryptoSuite(cryptoSuite);
    }

    var caRootsPath = ORGS.orderer.tls_cacerts;
    let data = fs.readFileSync(path.join(__dirname, caRootsPath));
    let caroots = Buffer.from(data).toString();

    channel.addOrderer(
        client.newOrderer(
            ORGS.orderer.url,
            {
                'pem': caroots,
                'ssl-target-name-override': ORGS.orderer['server-hostname']
            }
        )
    );

    var orgName = ORGS[userOrg].name;

    var promise;
    if (useStore) {
        promise = Client.newDefaultKeyValueStore({
            path: testUtil.storePathForOrg(orgName)});
    } else {
        promise = Promise.resolve(useStore);
    }
    return promise.then((store) => {
        if (store) {
            client.setStateStore(store);
        }
        return testUtil.getSubmitter(client, isAdmin, userOrg);
    }).then((admin) => {
        logger.debug('Successfully enrolled user');
        the_user = admin;
        // set up the channel to use each org's 'peer1' for
        // both requests and events
        for (let key in ORGS) {
            if (ORGS.hasOwnProperty(key) && typeof ORGS[key].peer1 !== 'undefined') {
                let data = fs.readFileSync(path.join(__dirname, ORGS[key].peer1['tls_cacerts']));
                let peer = client.newPeer(
                    ORGS[key].peer1.requests,
                    {
                        pem: Buffer.from(data).toString(),
                        'ssl-target-name-override': ORGS[key].peer1['server-hostname']
                    }
                );
                channel.addPeer(peer);
            }
        }

        // an event listener can only register with a peer in its own org
        let data = fs.readFileSync(path.join(__dirname, ORGS[userOrg].peer1['tls_cacerts']));
        let eh = client.newEventHub();
        eh.setPeerAddr(
            ORGS[userOrg].peer1.events,
            {
                pem: Buffer.from(data).toString(),
                'ssl-target-name-override': ORGS[userOrg].peer1['server-hostname'],
                'grpc.http2.keepalive_time' : 15
            }
        );
        eh.connect();
        eventhubs.push(eh);

        return channel.initialize();

    }).then((nothing) => {
        logger.debug(' orglist:: ', channel.getOrganizations());

        tx_id = client.newTransactionID();
        utils.setConfigSetting('E2E_TX_ID', tx_id.getTransactionID());
        logger.debug('setConfigSetting("E2E_TX_ID") = %s', tx_id.getTransactionID());

        // send proposal to endorser
        var request = {
            chaincodeId : ccId,
            fcn: func,
            args: args,
            txId: tx_id,
            senderSpec:senderSpec,
            priKey:priKey
        };
        return channel.sendTransactionProposal(request);

    }, (err) => {

        logger.debug('Failed to enroll user \'admin\'. ' + err);
        throw new Error('Failed to enroll user \'admin\'. ' + err);
    }).then((results) =>{
        pass_results = results;
        var sleep_time = 0;
        // can use "sleep=30000" to give some time to manually stop and start
        // the peer so the event hub will also stop and start
        if (process.argv.length > 2) {
            if (process.argv[2].indexOf('sleep=') === 0) {
                sleep_time = process.argv[2].split('=')[1];
            }
        }
        logger.debug('*****************************************************************************');
        logger.debug('stop and start the peer event hub ---- N  O  W ----- you have ' + sleep_time + ' millis');
        logger.debug('*****************************************************************************');
        return sleep(sleep_time);
    }).then((nothing) => {
        var proposalResponses = pass_results[0];

        var proposal = pass_results[1];
        var all_good = true;
        for(var i in proposalResponses) {
            let one_good = false;
            let proposal_response = proposalResponses[i];
            if( proposal_response.response && proposal_response.response.status === 200) {
                logger.debug('transaction proposal has response status of good');
                one_good = channel.verifyProposalResponse(proposal_response);
                if(one_good) {
                    logger.debug(' transaction proposal signature and endorser are valid');
                }
            } else {
                logger.debug('transaction proposal was bad');
            }
            all_good = all_good & one_good;
        }
        if (all_good) {
            // check all the read/write sets to see if the same, verify that each peer
            // got the same results on the proposal
            all_good = channel.compareProposalResponseResults(proposalResponses);
            logger.debug('compareProposalResponseResults exection did not throw an error');
            if(all_good){
                logger.debug(' All proposals have a matching read/writes sets');
            }
            else {
                logger.debug(' All proposals do not have matching read/write sets');
            }
        }
        if (all_good) {
            // check to see if all the results match
            logger.debug('Successfully sent Proposal and received ProposalResponse');
            logger.debug(util.format('Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s", metadata - "%s", endorsement signature: %s', proposalResponses[0].response.status, proposalResponses[0].response.message, proposalResponses[0].response.payload, proposalResponses[0].endorsement.signature));
            var request = {
                proposalResponses: proposalResponses,
                proposal: proposal
            };

            // set the transaction listener and set a timeout of 30sec
            // if the transaction did not get committed within the timeout period,
            // fail the test
            var deployId = tx_id.getTransactionID();

            var eventPromises = [];
            eventhubs.forEach((eh) => {
                let txPromise = new Promise((resolve, reject) => {
                    let handle = setTimeout(reject, 120000);

                    eh.registerTxEvent(deployId.toString(),
                        (tx, code) => {
                            clearTimeout(handle);
                            eh.unregisterTxEvent(deployId);

                            if (code !== 'VALID') {
                                logger.debug('The balance transfer transaction was invalid, code = ' + code);
                                reject();
                            } else {
                                logger.debug('The balance transfer transaction has been committed on peer '+ eh.getPeerAddr());
                                resolve();
                            }
                        },
                        (err) => {
                            clearTimeout(handle);
                            logger.debug('Successfully received notification of the event call back being cancelled for '+ deployId);
                            resolve();
                        }
                    );
                });

                eventPromises.push(txPromise);
            });
            var sendPromise = channel.sendTransaction(request);
            return Promise.all([sendPromise].concat(eventPromises))
                .then((results) => {
                    logger.debug(' event promise all complete and testing complete');
                    return results[0]; // the first returned value is from the 'sendPromise' which is from the 'sendTransaction()' call
                }).catch((err) => {
                    for(var key in eventhubs) {
                        var event = eventhubs[key];
                        if (event && event.isconnected()) {
                            logger.debug('Disconnecting the event hub');
                            event.disconnect();
                        }
                    }
                    logger.debug('Failed to send transaction and get notifications within the timeout period.');
                    throw new Error('Failed to send transaction and get notifications within the timeout period.');

                });

        } else {
            logger.debug('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
            throw new Error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
        }
    }, (err) => {

        logger.debug('Failed to send proposal due to error: ' + err.stack ? err.stack : err);
        throw new Error('Failed to send proposal due to error: ' + err.stack ? err.stack : err);

    }).then((response) => {
        for(var key in eventhubs) {
            var event = eventhubs[key];
            if (event && event.isconnected()) {
                logger.debug('Disconnecting the event hub');
                event.disconnect();
            }
        }
        if (response.status === 'SUCCESS') {
            logger.debug('Successfully sent transaction to the orderer.');
            logger.debug('******************************************************************');
            logger.debug('To manually run /test/integration/query.js, set the following environment variables:');
            logger.debug('export E2E_TX_ID='+'\''+tx_id.getTransactionID()+'\'');
            logger.debug('******************************************************************');
            logger.debug('invokeChaincode end');
            return tx_id.getTransactionID();
        } else {
            logger.debug('Failed to order the transaction. Error code: ' + response.status);
            throw new Error('Failed to order the transaction. Error code: ' + response.status);
        }
    }, (err) => {

        logger.debug('Failed to send transaction due to error: ' + err.stack ? err.stack : err);
        throw new Error('Failed to send transaction due to error: ' + err.stack ? err.stack : err);

    });
};

module.exports.invokeChaincode = invokeChaincode;

function queryChaincode(org,ccId, func, args, transientMap, isAdmin) {
    init();
    Client.setConfigSetting('request-timeout', 60000);
    var channel_name = Client.getConfigSetting('E2E_CONFIGTX_CHANNEL_NAME', CHANNEL_NAME);

    // this is a transaction, will just use org's identity to
    // submit the request. intentionally we are using a different org
    // than the one that submitted the "move" transaction, although either org
    // should work properly
    var client = new Client();
    var channel = client.newChannel(channel_name);

    var orgName = ORGS[org].name;
    var cryptoSuite = Client.newCryptoSuite();
    cryptoSuite.setCryptoKeyStore(Client.newCryptoKeyStore({path: testUtil.storePathForOrg(orgName)}));
    client.setCryptoSuite(cryptoSuite);
    var targets = [];
    // set up the channel to use each org's 'peer1' for
    // both requests and events
    for (let key in ORGS) {
        if (ORGS.hasOwnProperty(key) && typeof ORGS[key].peer1 !== 'undefined') {
            let data = fs.readFileSync(path.join(__dirname, ORGS[key].peer1['tls_cacerts']));
            let peer = client.newPeer(
                ORGS[key].peer1.requests,
                {
                    pem: Buffer.from(data).toString(),
                    'ssl-target-name-override': ORGS[key].peer1['server-hostname']
                });
            channel.addPeer(peer);
        }
    }
    return Client.newDefaultKeyValueStore({
        path: testUtil.storePathForOrg(orgName)
    }).then((store) => {
        client.setStateStore(store);
        return testUtil.getSubmitter(client, isAdmin, org);

    }).then((admin) => {
            the_user = admin;
            // send query
            var request = {
                chaincodeId : ccId,
                txId: tx_id,
                fcn: func,
                args: args
            };

            if (transientMap) {
                request.transientMap = transientMap;
                request.fcn = 'testTransient';
            }
            return channel.queryByChaincode(request);
        },
        (err) => {
            logger.debug('Failed to get submitter \'admin\'. Error: ' + err.stack ? err.stack : err );
            throw new Error('Failed to get submitter');
        }).then((response_payloads) => {
            if (response_payloads) {
                return response_payloads;
            } else {
                logger.debug('response_payloads is null');
                throw new Error('Failed to get response on query');
            }
        },
        (err) => {
            logger.debug('Failed to send query due to error: ' + err.stack ? err.stack : err);
            throw new Error('Failed, got error on query');
        });
};

module.exports.queryChaincode = queryChaincode;


const TOKEN_ID = "token";
const GET_BLANCE_FUNC = "getBalance";

function getBalance(org, args, transientMap, isAdmin) {
    init();
    Client.setConfigSetting('request-timeout', 60000);
    var channel_name = Client.getConfigSetting('E2E_CONFIGTX_CHANNEL_NAME', CHANNEL_NAME);

    var client = new Client();
    var channel = client.newChannel(channel_name);

    var orgName = ORGS[org].name;
    var cryptoSuite = Client.newCryptoSuite();
    cryptoSuite.setCryptoKeyStore(Client.newCryptoKeyStore({path: testUtil.storePathForOrg(orgName)}));
    client.setCryptoSuite(cryptoSuite);
    var targets = [];
    // set up the channel to use each org's 'peer1' for
    // both requests and events
    for (let key in ORGS) {
        if (ORGS.hasOwnProperty(key) && typeof ORGS[key].peer1 !== 'undefined') {
            let data = fs.readFileSync(path.join(__dirname, ORGS[key].peer1['tls_cacerts']));
            let peer = client.newPeer(
                ORGS[key].peer1.requests,
                {
                    pem: Buffer.from(data).toString(),
                    'ssl-target-name-override': ORGS[key].peer1['server-hostname']
                });
            channel.addPeer(peer);
        }
    }
    return Client.newDefaultKeyValueStore({
        path: testUtil.storePathForOrg(orgName)
    }).then((store) => {
        client.setStateStore(store);
        return testUtil.getSubmitter(client, isAdmin, org);

    }).then((admin) => {
            the_user = admin;
            // send query
            var request = {
                chaincodeId : TOKEN_ID,
                txId: tx_id,
                fcn: GET_BLANCE_FUNC,
                args: args
            };

            if (transientMap) {
                request.transientMap = transientMap;
                request.fcn = 'testTransient';
            }
            return channel.queryByChaincode(request);
        },
        (err) => {
            logger.debug('Failed to get submitter \'admin\'. Error: ' + err.stack ? err.stack : err );
            throw new Error('Failed to get submitter');
        }).then((response_payloads) => {
            if (response_payloads) {
                return response_payloads;
            } else {
                logger.debug('response_payloads is null');
                throw new Error('Failed to get response on query');
            }
        },
        (err) => {
            console.log(err);
            logger.debug('Failed to send query due to error: ' + err.stack ? err.stack : err);
            throw new Error('Failed, got error on query');
        });
};

module.exports.getBalance = getBalance;

const GET_ACCOUNT_FUNC = "getAccount";

function getAccount(org, args, transientMap, isAdmin) {
    init();
    Client.setConfigSetting('request-timeout', 60000);
    var channel_name = Client.getConfigSetting('E2E_CONFIGTX_CHANNEL_NAME', CHANNEL_NAME);

    var client = new Client();
    var channel = client.newChannel(channel_name);

    var orgName = ORGS[org].name;
    var cryptoSuite = Client.newCryptoSuite();
    cryptoSuite.setCryptoKeyStore(Client.newCryptoKeyStore({path: testUtil.storePathForOrg(orgName)}));
    client.setCryptoSuite(cryptoSuite);
    var targets = [];
    // set up the channel to use each org's 'peer1' for
    // both requests and events
    for (let key in ORGS) {
        if (ORGS.hasOwnProperty(key) && typeof ORGS[key].peer1 !== 'undefined') {
            let data = fs.readFileSync(path.join(__dirname, ORGS[key].peer1['tls_cacerts']));
            let peer = client.newPeer(
                ORGS[key].peer1.requests,
                {
                    pem: Buffer.from(data).toString(),
                    'ssl-target-name-override': ORGS[key].peer1['server-hostname']
                });
            channel.addPeer(peer);
        }
    }
    return Client.newDefaultKeyValueStore({
        path: testUtil.storePathForOrg(orgName)
    }).then((store) => {
        client.setStateStore(store);
        return testUtil.getSubmitter(client, isAdmin, org);

    }).then((admin) => {
            the_user = admin;
            // send query
            var request = {
                chaincodeId : TOKEN_ID,
                txId: tx_id,
                fcn: GET_ACCOUNT_FUNC,
                args: args
            };

            if (transientMap) {
                request.transientMap = transientMap;
                request.fcn = 'testTransient';
            }
            return channel.queryByChaincode(request);
        },
        (err) => {
            logger.debug('Failed to get submitter \'admin\'. Error: ' + err.stack ? err.stack : err );
            throw new Error('Failed to get submitter');
        }).then((response_payloads) => {
            if (response_payloads) {
                return response_payloads;
            } else {
                logger.debug('response_payloads is null');
                throw new Error('Failed to get response on query');
            }
        },
        (err) => {
            logger.debug('Failed to send query due to error: ' + err.stack ? err.stack : err);
            throw new Error('Failed, got error on query');
        });
};

module.exports.getAccount = getAccount;


function querySystemCC(org, ccId, func, args, get_admin) {
    init();
    Client.setConfigSetting('request-timeout', 60000);
    var channel_name = Client.getConfigSetting('E2E_CONFIGTX_CHANNEL_NAME', CHANNEL_NAME);

    var client = new Client();
    var pass_results = null;
    // client.setDevMode(true);
    var channel = client.newChannel(channel_name);

    var orgName = ORGS[org].name;
    var cryptoSuite = Client.newCryptoSuite();
    cryptoSuite.setCryptoKeyStore(Client.newCryptoKeyStore({path: testUtil.storePathForOrg(orgName)}));
    client.setCryptoSuite(cryptoSuite);

    var caRootsPath = ORGS.orderer.tls_cacerts;
    let data = fs.readFileSync(path.join(__dirname, caRootsPath));
    let caroots = Buffer.from(data).toString();

    channel.addOrderer(
        client.newOrderer(
            ORGS.orderer.url,
            {
                'pem': caroots,
                'ssl-target-name-override': ORGS.orderer['server-hostname']
            }
        )
    );

    var targets = [];
    var eventhubs = [];

    for (let key in ORGS[org]) {
        if (ORGS[org].hasOwnProperty(key)) {
            if (key.indexOf('peer') === 0) {
                let data = fs.readFileSync(path.join(__dirname, ORGS[org][key]['tls_cacerts']));
                let peer = client.newPeer(
                    ORGS[org][key].requests,
                    {
                        pem: Buffer.from(data).toString(),
                        'ssl-target-name-override': ORGS[org][key]['server-hostname']
                    }
                );

                targets.push(peer);    // a peer can be the target this way
                channel.addPeer(peer); // or a peer can be the target this way
                                       // you do not have to do both, just one, when there are
                                       // 'targets' in the request, those will be used and not
                                       // the peers added to the channel
            }
        }
    }

    return Client.newDefaultKeyValueStore({
        path: testUtil.storePathForOrg(orgName)
    }).then((store) => {
        client.setStateStore(store);

        // get the peer org's admin required to send install chaincode requests
        return testUtil.getSubmitter(client, get_admin /* get peer org admin */, org);
    }).then((admin) => {
        the_user = admin;
        return channel.initialize();
    }).then((nothing)=>{
            // an event listener can only register with a peer in its own org
            tx_id = client.newTransactionID();
            utils.setConfigSetting('E2E_TX_ID', tx_id.getTransactionID());
            console.log('transaction id:' + tx_id.getTransactionID());
            logger.debug('setConfigSetting("E2E_TX_ID") = %s', tx_id.getTransactionID());
            // send proposal to endorser
            var request = {
                chaincodeId : ccId,
                fcn: func,
                args: args,
                txId: tx_id,
            };
            return channel.sendTransactionProposal(request);
        },
        (err) => {
            throw new Error('Failed to enroll user \'admin\'. ' + err);
        }).then((results) =>{
        pass_results = results;
        var sleep_time = 0;
        // can use "sleep=30000" to give some time to manually stop and start
        // the peer so the event hub will also stop and start
        if (process.argv.length > 2) {
            if (process.argv[2].indexOf('sleep=') === 0) {
                sleep_time = process.argv[2].split('=')[1];
            }
        }
        logger.debug('*****************************************************************************');
        logger.debug('stop and start the peer event hub ---- N  O  W ----- you have ' + sleep_time + ' millis');
        logger.debug('*****************************************************************************');
        return sleep(sleep_time);
    }).then((nothing) => {
        var proposalResponses = pass_results[0];

        var proposal = pass_results[1];
        var all_good = true;
        for(var i in proposalResponses) {
            let one_good = false;
            let proposal_response = proposalResponses[i];
            if( proposal_response.response && proposal_response.response.status === 200) {
                logger.debug('transaction proposal has response status of good');
                one_good = channel.verifyProposalResponse(proposal_response);
                if(one_good) {
                    logger.debug(' transaction proposal signature and endorser are valid');
                }
            } else {
                logger.debug('transaction proposal was bad');
            }
            all_good = all_good & one_good;
        }
        if (all_good) {
            // check all the read/write sets to see if the same, verify that each peer
            // got the same results on the proposal
            all_good = channel.compareProposalResponseResults(proposalResponses);
            logger.debug('compareProposalResponseResults exection did not throw an error');
            if(all_good){
                logger.debug(' All proposals have a matching read/writes sets');
            }
            else {
                logger.debug(' All proposals do not have matching read/write sets');
            }
        }
        if (all_good) {
            // check to see if all the results match
            logger.debug('Successfully sent Proposal and received ProposalResponse');
            logger.debug(util.format('Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s", metadata - "%s", endorsement signature: %s', proposalResponses[0].response.status, proposalResponses[0].response.message, proposalResponses[0].response.payload, proposalResponses[0].endorsement.signature));
            var request = {
                proposalResponses: proposalResponses,
                proposal: proposal
            };

            // set the transaction listener and set a timeout of 30sec
            // if the transaction did not get committed within the timeout period,
            // fail the test
            var deployId = tx_id.getTransactionID();

            var eventPromises = [];
            eventhubs.forEach((eh) => {
                let txPromise = new Promise((resolve, reject) => {
                    let handle = setTimeout(reject, 120000);

                    eh.registerTxEvent(deployId.toString(),
                        (tx, code) => {
                            clearTimeout(handle);
                            eh.unregisterTxEvent(deployId);

                            if (code !== 'VALID') {
                                logger.debug('The balance transfer transaction was invalid, code = ' + code);
                                reject();
                            } else {
                                logger.debug('The balance transfer transaction has been committed on peer '+ eh.getPeerAddr());
                                resolve();
                            }
                        },
                        (err) => {
                            clearTimeout(handle);
                            logger.debug('Successfully received notification of the event call back being cancelled for '+ deployId);
                            resolve();
                        }
                    );
                });

                eventPromises.push(txPromise);
            });
            var sendPromise = channel.sendTransaction(request);
            return Promise.all([sendPromise].concat(eventPromises))
                .then((results) => {
                    logger.debug(' event promise all complete and testing complete');
                    return results[0]; // the first returned value is from the 'sendPromise' which is from the 'sendTransaction()' call
                }).catch((err) => {
                    for(var key in eventhubs) {
                        var event = eventhubs[key];
                        if (event && event.isconnected()) {
                            logger.debug('Disconnecting the event hub');
                            event.disconnect();
                        }
                    }
                    logger.debug('Failed to send transaction and get notifications within the timeout period.');
                    throw new Error('Failed to send transaction and get notifications within the timeout period.');

                });

        } else {
            logger.debug('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
            throw new Error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
        }
    }, (err) => {

        logger.debug('Failed to send proposal due to error: ' + err.stack ? err.stack : err);
        throw new Error('Failed to send proposal due to error: ' + err.stack ? err.stack : err);

    }).then((response) => {
        for(var key in eventhubs) {
            var event = eventhubs[key];
            if (event && event.isconnected()) {
                logger.debug('Disconnecting the event hub');
                event.disconnect();
            }
        }
        if (response.status === 'SUCCESS') {
            logger.debug('Successfully sent transaction to the orderer.');
            logger.debug('******************************************************************');
            logger.debug('To manually run /test/integration/query.js, set the following environment variables:');
            logger.debug('export E2E_TX_ID='+'\''+tx_id.getTransactionID()+'\'');
            logger.debug('******************************************************************');
            logger.debug('invokeChaincode end');
            return true;
        } else {
            logger.debug('Failed to order the transaction. Error code: ' + response.status);
            throw new Error('Failed to order the transaction. Error code: ' + response.status);
        }
    }, (err) => {

        logger.debug('Failed to send transaction due to error: ' + err.stack ? err.stack : err);
        throw new Error('Failed to send transaction due to error: ' + err.stack ? err.stack : err);

    });
}
module.exports.querySystemCC = querySystemCC;
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
module.exports.sleep = sleep;