/**
 * Created by wangh09 on 2017/10/16.
 */
var path = require('path');
var utils = require('inkchain-client/lib/utils.js');
var logger = utils.getLogger('query');

var tape = require('tape');
var _test = require('tape-promise');
var test = _test(tape);

var org = 'org1';
var orgName;
var Client = require('inkchain-client');
var Peer = require('inkchain-client/lib/Peer.js');
var Orderer = require('inkchain-client/lib/Orderer.js');

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

    utils.setConfigSetting('key-value-store','inkchain-client/lib/impl/FileKeyValueStore.js');
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
        t.pass('Successfully initialized channel');
        // use default primary peer
        // send query
        return channel.queryBlock(0);
    }).then((block) => {
        logger.debug(' Channel getBlock() returned block number=%s',block.header.number);
        t.equal(block.header.number.toString(),'0','checking query results are correct that we got zero block back');
        t.equal(block.data.data[0].payload.data.config.channel_group.groups.Orderer.groups.OrdererMSP.values.MSP.value.config.name,'OrdererMSP','checking query results are correct that we got the correct orderer MSP name');
        t.equal(block.data.data[0].payload.data.config.channel_group.groups.Application.groups.Org2MSP.policies.Writers.policy.type,'SIGNATURE','checking query results are correct that we got the correct policy type');
        t.equal(block.data.data[0].payload.data.config.channel_group.groups.Application.policies.Writers.policy.policy.rule,'ANY','checking query results are correct that we got the correct policy rule');
        t.equal(block.data.data[0].payload.data.config.channel_group.policies.Admins.mod_policy,'Admins','checking query results are correct that we got the correct mod policy name');
        return channel.queryBlock(1);
    }).then((block) => {
        logger.debug(' Channel getBlock() returned block number=%s',block.header.number);
        t.equal(block.header.number.toString(),'1','checking query results are correct that we got a transaction block back');
        t.equal(block.data.data[0].payload.data.actions[0].payload.action.endorsements[0].endorser.Mspid,'Org1MSP','checking query results are correct that we got a transaction block back with correct endorsement MSP id');

        tx_id = 'cf636bd1584605572faf51490e26398560bda48dfc2cd698ade4a95166315713';
        logger.debug('getConfigSetting("E2E_TX_ID") = %s', tx_id);
        if (tx_id === 'notfound') {
            logger.error('   Did you set the E2E_TX_ID environment variable after running invoke-transaction.js ?');
            throw new Error('Could not get tx_id from ConfigSetting "E2E_TX_ID"');
        } else {
            t.pass('Got tx_id from ConfigSetting "E2E_TX_ID"');
            // send query
            return channel.queryTransaction(tx_id, peer0); //assumes the end-to-end has run first
        }
    }).then((processed_transaction) => {
        t.equals('mychannel', processed_transaction.transactionEnvelope.payload.header.channel_header.channel_id,
            'test for header channel name');
        t.equals('Org1MSP', processed_transaction.transactionEnvelope.payload.header.signature_header.creator.Mspid,
            'test for header channel mspid in identity');
        t.equals('Org1MSP', processed_transaction.transactionEnvelope.payload.data.actions['0']
                .payload.action.endorsements['0'].endorser.Mspid,
            'test for endorser mspid in identity');
        t.equals('Org1MSP', processed_transaction.transactionEnvelope.payload.data.actions['0'].header.creator.Mspid,
            'test for creator mspid in identity');
        t.equals(200, processed_transaction.transactionEnvelope.payload.data.actions['0'].payload.action
                .proposal_response_payload.extension.response.status,
            'test for transation status');
        t.equals(0, processed_transaction.transactionEnvelope.payload.data.actions['0']
                .payload.action.proposal_response_payload.extension.results.TxRwSet.data_model,
            'test for data model value');
/*
        t.equals('a', processed_transaction.transactionEnvelope.payload.data.actions['0']
                .payload.action.proposal_response_payload.extension.results.TxRwSet.ns_rwset['0']
                .rwset.writes['0'].key,
            'test for write set key value');

        t.equals('2', processed_transaction.transactionEnvelope.payload.data.actions['0']
                .payload.action.proposal_response_payload.extension.results.TxRwSet.ns_rwset['0']
                .rwset.reads[1].version.block_num.toString(),
            'test for read set block num');
*/

        // the "target peer" must be a peer in the same org as the app
        // which in this case is "peer0"
        // send query
        return channel.queryInfo(peer0);
    }).then((blockchainInfo) => {
        t.pass('got back blockchain info ');
        logger.debug(' Channel queryInfo() returned block height='+blockchainInfo.height);
        logger.debug(' Channel queryInfo() returned block previousBlockHash='+blockchainInfo.previousBlockHash);
        logger.debug(' Channel queryInfo() returned block currentBlockHash='+blockchainInfo.currentBlockHash);
        var block_hash = blockchainInfo.currentBlockHash;
        // send query
        return channel.queryBlockByHash(block_hash, peer0);
    }).then((block) => {
        logger.debug(' Channel queryBlockByHash() returned block number=%s',block.header.number);
        t.pass('got back block number '+ block.header.number);
        t.end();
    }).catch((err) => {
        throw new Error(err.stack ? err.stack : err);
    });
});