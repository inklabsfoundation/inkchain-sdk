/**
 * Created by wangh09 on 2017/9/18.
 */
'use strict';
var utils = require('fabric-client/lib/utils.js');
var logger = utils.getLogger('inkchain testing');

const CHANNEL_NAME = "mychannel";
module.exports.CHANNEL_NAME = CHANNEL_NAME;

var ORGS;
var Client = require('fabric-client');
var path = require('path');
var testUtil = require('../../unit/util.js');
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
        return testUtil.getSubmitter(client, t, get_admin /* get peer org admin */, org);
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
        return testUtil.getSubmitter(client, t, true /* use peer org admin*/, userOrg);

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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
module.exports.sleep = sleep;