/**
 * Created by wangh09 on 2017/10/17.
 */
'use strict';


var path = require('path');
var utils = require('fabric-client/lib/utils.js');
var logger = utils.getLogger('query');

var tape = require('tape');
var _test = require('tape-promise');
var test = _test(tape);

var org = 'org1';
var orgName;
var Client = require('fabric-client');
var Peer = require('fabric-client/lib/Peer.js');
var Orderer = require('fabric-client/lib/Orderer.js');

var inkUtils = require('../../InkUtils.js');
var channel_name = inkUtils.CHANNEL_NAME;

var util = require('util');
var fs = require('fs');
var testUtil = require('../../utils/unit/util.js');
var client = new Client();
var channel = client.newChannel(channel_name);

var the_user = null;

var ORGS;
var data;
var peer0;
test('  ---->>>>> Query channel working <<<<<-----', function(t) {
    Client.addConfigFile(path.join(inkUtils.WORK_PATH, 'inkchain', 'config.json'));
    ORGS = Client.getConfigSetting('test-network');
    orgName = ORGS[org].name;
    var caRootsPath = ORGS.orderer.tls_cacerts;
    data = fs.readFileSync(path.join(inkUtils.WORK_PATH, 'inkchain', caRootsPath));

    let caroots = Buffer.from(data).toString();

    channel.addOrderer(
        new Orderer(
            ORGS.orderer.url,
            {
                'pem': caroots,
                'ssl-target-name-override': ORGS.orderer['server-hostname']
            }
        )
    );

    data = fs.readFileSync(path.join(inkUtils.WORK_PATH, 'inkchain', ORGS[org].peer1['tls_cacerts']));
    peer0 = new Peer(
        ORGS[org].peer1.requests,
        {
            pem: Buffer.from(data).toString(),
            'ssl-target-name-override': ORGS[org].peer1['server-hostname']
        });
    data = fs.readFileSync(path.join(inkUtils.WORK_PATH, 'inkchain', ORGS['org2'].peer1['tls_cacerts']));
    var peer1 = new Peer(
        ORGS['org2'].peer1.requests,
        {
            pem: Buffer.from(data).toString(),
            'ssl-target-name-override': ORGS['org2'].peer1['server-hostname']
        });

    channel.addPeer(peer0);
    channel.addPeer(peer1);

    utils.setConfigSetting('key-value-store','fabric-client/lib/impl/FileKeyValueStore.js');
    var cryptoSuite = Client.newCryptoSuite();
    cryptoSuite.setCryptoKeyStore(Client.newCryptoKeyStore({path: testUtil.storePathForOrg(orgName)}));
    client.setCryptoSuite(cryptoSuite);

    return Client.newDefaultKeyValueStore({
        path: testUtil.storePathForOrg(orgName)
    }).then( function (store) {
        client.setStateStore(store);
        return testUtil.getSubmitter(client, t, org);
    }).then((admin) => {
        t.pass('Successfully enrolled user \'admin\'');
        the_user = admin;

        // read the config block from the orderer for the channel
        // and initialize the verify MSPs based on the participating
        // organizations
        return channel.initialize();
    }).then((success) => {
        return inkUtils.invokeChaincode('org2', 'lscc','1.0','getchaincodes', [], false/*useStore*/)
    }).then((result) => {
        console.log(result);
        if(result){
            t.pass('Successfully invoke transaction chaincode on channel');
            t.end();
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




test('\n\n***** End-to-end flow: *****\n\n', (t) => {

});