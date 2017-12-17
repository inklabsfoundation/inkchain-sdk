/**
 * Created by wangh09 on 2017/12/17.
 */
let path = require('path');
let os = require('os');
let helper = require('./helper');
var Client = require('inkchain-client');
var ORGS = Client.getConfigSetting('network-config');
let fs = require('fs');
var tempdir = path.join(os.tmpdir(), 'hfc');
let util = require('util');
var logger = helper.getLogger('Instantiate-Chaincode');
function storePathForOrg(org) {
    return path.join(tempdir, 'hfc-test-kvs')+ '_' + org;
}
function readAllFiles(dir) {
    var files = fs.readdirSync(dir);
    var certs = [];
    files.forEach((file_name) => {
        let file_path = path.join(dir,file_name);
        let data = fs.readFileSync(file_path);
        certs.push(data);
    });
    return certs;
}
function getAdmin(client, userOrg) {
    var keyPath = path.join(__dirname, util.format('../artifacts/channel/crypto-config/peerOrganizations/%s.example.com/users/Admin@%s.example.com/msp/keystore', userOrg, userOrg));
    var keyPEM = Buffer.from(readAllFiles(keyPath)[0]).toString();
    var certPath = path.join(__dirname, util.format('../artifacts/channel/crypto-config/peerOrganizations/%s.example.com/users/Admin@%s.example.com/msp/signcerts', userOrg, userOrg));
    var certPEM = readAllFiles(certPath)[0];

    var cryptoSuite = Client.newCryptoSuite();
    if (userOrg) {
        cryptoSuite.setCryptoKeyStore(Client.newCryptoKeyStore({path: storePathForOrg(ORGS[userOrg].name)}));
        client.setCryptoSuite(cryptoSuite);
    }

    return Promise.resolve(client.createUser({
        username: 'peer'+userOrg+'Admin',
        mspid: ORGS[userOrg].mspid,
        cryptoContent: {
            privateKeyPEM: keyPEM.toString(),
            signedCertPEM: certPEM.toString()
        }
    }));
}

function instantiateChaincode(channel_name, userOrg, chaincode_id, chaincode_path, version, upgrade){
    var the_user;
    var tx_id;
    Client.setConfigSetting('request-timeout', 120000);
    var targets = [],
        eventhubs = [];
    var type = 'instantiate';
    if(upgrade) type = 'upgrade';

    var client = new Client();
    var channel = client.newChannel(channel_name);

    var orgName = ORGS[userOrg].name;
    var cryptoSuite = Client.newCryptoSuite();
    cryptoSuite.setCryptoKeyStore(Client.newCryptoKeyStore({path: storePathForOrg(orgName)}));
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
    var badTransientMap = { 'test1': 'transientValue' }; // have a different key than what the chaincode example_cc1.go expects in Init()
    var transientMap = { 'test': 'transientValue' };

    return Client.newDefaultKeyValueStore({
        path: storePathForOrg(orgName)
    }).then((store) => {
        client.setStateStore(store);
        return getAdmin(client, userOrg);

    }).then((admin) => {

        the_user = admin;
        for(let org in ORGS) {
            if (ORGS[org].hasOwnProperty('peers') && ORGS[org]['peers'].hasOwnProperty('peer1')) {
                let key = 'peer1';
                let data = fs.readFileSync(path.join(__dirname, ORGS[org]['peers'][key]['tls_cacerts']));
                let peer = client.newPeer(
                    ORGS[org]['peers'][key].requests,
                    {
                        pem: Buffer.from(data).toString(),
                        'ssl-target-name-override': ORGS[org]['peers'][key]['server-hostname']
                    }
                );
                targets.push(peer);
                channel.addPeer(peer);
            }
        }

        // an event listener can only register with a peer in its own org
        logger.debug(' create new eventhub %s', ORGS[userOrg]['peers']['peer1'].events);
        let data = fs.readFileSync(path.join(__dirname, ORGS[userOrg]['peers']['peer1']['tls_cacerts']));
        let eh = client.newEventHub();
        eh.setPeerAddr(
            ORGS[userOrg]['peers']['peer1'].events,
            {
                pem: Buffer.from(data).toString(),
                'ssl-target-name-override': ORGS[userOrg]['peers']['peer1']['server-hostname']
            }
        );
        eh.connect();
        eventhubs.push(eh);

        // read the config block from the orderer for the channel
        // and initialize the verify MSPs based on the participating
        // organizations
        return channel.initialize();
    }, (err) => {
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
                        clearTimeout(handle);
                        eh.unregisterTxEvent(deployId);

                        if (code !== 'VALID') {
                            reject();
                        } else {
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
                throw new Error('Failed to send ' + type + ' transaction and get notifications within the timeout period.');

                });

        } else {
            throw new Error('Failed to send ' + type + ' Proposal or receive valid response. Response null or status is not 200. exiting...');
        }
    }, (err) => {
        throw new Error('Failed to send ' + type + ' proposal due to error: ' + err.stack ? err.stack : err);

    }).then((response) => {
        //TODO should look into the event responses
        for(var key in eventhubs) {
            var eventhub = eventhubs[key];
            if (eventhub && eventhub.isconnected()) {
                eventhub.disconnect();
            }
        }
        if (!(response instanceof Error) && response.status === 'SUCCESS') {
            return response;
        } else {
            Promise.reject(new Error('Failed to order the ' + type + 'transaction. Error code: ' + response.status));
        }
    }, (err) => {
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