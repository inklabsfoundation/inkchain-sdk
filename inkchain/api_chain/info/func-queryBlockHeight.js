/**
 * Created by wangh09 on 2017/10/17.
 */
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
        return channel.queryInfo(peer0);
    }).then((blockchainInfo) => {
        t.pass('got back blockchain info ');
        logger.debug(' Channel queryInfo() returned block height='+blockchainInfo.height);
        logger.debug(' Channel queryInfo() returned block previousBlockHash='+blockchainInfo.previousBlockHash);
        logger.debug(' Channel queryInfo() returned block currentBlockHash='+blockchainInfo.currentBlockHash);
        console.log("blockheight:" + blockchainInfo.height);
    }).catch((err) => {
        throw new Error(err.stack ? err.stack : err);
    });
});