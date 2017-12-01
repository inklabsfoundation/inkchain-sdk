const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const inkUtils = require('../inkchain/InkUtils');
const Client = require('inkchain-client');
const Wallet = require('../inkchain/wallet').Wallet;

app.use(bodyParser.json({extended: true}));

app.get('/help', (req, res)=>{
    const generate_account = '' +
        '<h3>生成用户账户/Generate user account</h3>' +
        '<strong>GET</strong> /generate-account' + '<br>' +
        '<br>' +
        '<strong>EXAMPLE:</strong>' + '<br>' +
        '<strong>GET</strong> <pre>/generate-account</pre>' + '<br>' +
        '<strong>RETURN</strong> <pre>{"address": "ade1c8fc654c3487581f7b63dfaa878f6e8094cd", "private_key": "d82f1ee62990afce74df39cab8ebbac726a4376c3bab8f6ed26c536e4be2249f"}</pre>' + '<br>';
    const get_account = '' +
        '<h3>获取用户账户信息/Get user account info</h3>' +
        '<strong>GET</strong> /get-account/{address}' + '<br>' +
        '<br>' +
        '<strong>EXAMPLE:</strong>' + '<br>' +
        '<strong>GET</strong> <pre>/get-account/0dd7c16a70d42f9e952225862855edd0098a4920</pre>' + '<br>' +
        '<strong>RETURN</strong> <pre>{"Name":"0dd7c16a70d42f9e952225862855edd0098a4920","Balance":{"Tobee":999999999770}}</pre>' + '<br>';
    const get_balance = '' +
        '<h3>获取用户账户余额/Get user account balance</h3>' +
        '<strong>GET</strong> /get-balance/{address}/{coin_type}' + '<br>' +
        '<br>' +
        '<strong>EXAMPLE:</strong>' + '<br>' +
        '<strong>GET</strong> <pre>/get-balance/0dd7c16a70d42f9e952225862855edd0098a4920/Tobee</pre>' + '<br>' +
        '<strong>RETURN</strong> <pre>{"Tobee":"999999999806"}</pre>' + '<br>';
    const transfer = '' +
        '<h3>发起转账交易/Send transaction</h3>' +
        '<strong>POST</strong> /transfer' + '<br>' +
        '<br>' +
        '<strong>EXAMPLE:</strong>' + '<br>' +
        '<strong>POST</strong> <pre>/transfer</pre>' + '<br>' +
        '<strong>DATA</strong> <pre>{\n' +
        '  "amount": "9",\n' +
        '  "message": "%E5%93%88%E5%93%88%E5%92%8C%E8%8C%83%E5%9B%B4%E5%8F%8A%E4%BD%9B%E9%97%AE%E4%BD%9B%20i%E6%9C%BA%E5%93%A6%E5%B0%B134i%20%E5%93%A6%E9%A3%9E%E6%9C%BA30%E2%9C%88%EF%B8%8F49%20%F0%9F%92%A2389%E5%8F%8D%E6%82%943%E7%A6%8F%E6%8A%A53%20%E9%99%84%E8%BF%914%E4%BA%86%E2%9C%88%EF%B8%8F%E5%BC%80%E6%88%BF%E9%97%B44i%20%E5%93%A6%E5%8F%91%E5%87%A04i%E9%A3%9E%E6%9C%BA%E5%93%A6%E6%BF%80%E5%8F%91of4%E5%87%8F%E8%82%A5%E4%BA%86%E5%BC%80%E5%B0%B1%E5%88%86%E5%BC%80%E4%BA%86%E5%AE%B64%E5%90%A642%E5%87%A0%E5%88%864%E8%83%BD%E8%8A%A34%E5%A6%AE%E4%BD%9B34%E5%A6%AE%E4%BD%9B%E6%89%A3%E5%8D%96%E9%A3%9E%E6%9C%BA%E7%9C%8B%E7%AB%8B%E6%B3%95%E5%B1%803%E6%89%A3%E4%BA%86%E8%85%93%E5%B0%BC%E5%9F%BA%E7%A7%91%E9%9A%86%E5%8D%9A%E9%99%84%E8%BF%91%E5%B0%81%E5%8C%85%E6%89%A3%E4%BA%86%E5%87%A0%E5%88%86%E5%90%88%E8%AE%A1%E5%AE%A2%E6%88%B7%E6%B3%95%E5%85%B0%E5%85%8B%E9%9F%A9%E5%A4%8D%E6%A6%98%E7%9C%8B%E5%A5%BD%E4%BC%9A%E8%AE%A1%E6%B3%95%E8%AF%9Dv%20%E6%AF%95%E6%81%AD%E6%AF%95%E6%95%AC%E5%92%96%E5%96%B1%E9%A5%AD%E5%94%AF%E9%A5%AD%E5%90%8E21%E5%85%8B%E6%8B%89%E6%88%91%E5%B0%B1%E9%A5%BF%E5%93%AD%E4%BA%86%E9%A3%9E%E6%9C%BA%E8%BF%9D%E6%B3%95%20i%20%E5%93%A6%E5%BE%AE%E7%A7%AF%E5%88%86%20i%20%E5%93%A6%E5%BE%AE%E7%A7%AF%E5%88%86%20i%20%E6%9D%83%E5%A8%81%E8%82%8C%E8%82%A4lwe%20%20%20we%20fwkejfklqewjflkwef",\n' +
        '  "coin_type": "Tobee",\n' +
        '  "private_key": "af06d6fc98c25b201777bcd3d4d1828fb6cdb7897bea6cf4157d733c5175f1e0",\n' +
        '  "to_address": "3c97f146e8de9807ef723538521fcecd5f64c79a"\n' +
        '}</pre>' +
        '<strong>RETURN</strong> <pre>{"transaction_id": "f7d4a4007330788153389a0277458e6a80c5c831c953efab6c73e9dcb1552624"}</pre>' + '<br>';
    const get_transaction = '' +
        '<h3>获取交易信息/Get transaction info by transaction_id</h3>' +
        '<strong>GET</strong> /get-transaction/{transaction_id}' + '<br>' +
        '<br>' +
        '<strong>EXAMPLE:</strong>' + '<br>' +
        '<strong>GET</strong> <pre>/get-transaction/f7d4a4007330788153389a0277458e6a80c5c831c953efab6c73e9dcb1552624</pre>' + '<br>' +
        '<strong>RETURN</strong> <pre>{"validationCode":0,"transactionEnvelope":{"signature":"30440220050d98010ba241d8e172bb81936be0ace5cb590974a57ac9aa07933c3d850d12022003a49518e493332ab72af8c6f32a732d3e44db68a2b252625238f48831144ece","payload":{"header":{"channel_header":{"type":"ENDORSER_TRANSACTION","version":3,"timestamp":"Fri Dec 01 2017 15:06:28 GMT+0800 (CST)","channel_id":"mychannel","tx_id":"f7d4a4007330788153389a0277458e6a80c5c831c953efab6c73e9dcb1552624","epoch":0,"extension":"12071205746f6b656e"},"signature_header":{"creator":{"Mspid":"Org1MSP","IdBytes":"-----BEGIN CERTIFICATE-----\\nMIICGjCCAcCgAwIBAgIRANfNECvok9C6hT58XJZ/lJAwCgYIKoZIzj0EAwIwczEL\\nMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNhbiBG\\ncmFuY2lzY28xGTAXBgNVBAoTEG9yZzEuZXhhbXBsZS5jb20xHDAaBgNVBAMTE2Nh\\nLm9yZzEuZXhhbXBsZS5jb20wHhcNMTcwNjIzMTIzMzE5WhcNMjcwNjIxMTIzMzE5\\nWjBbMQswCQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5pYTEWMBQGA1UEBxMN\\nU2FuIEZyYW5jaXNjbzEfMB0GA1UEAwwWVXNlcjFAb3JnMS5leGFtcGxlLmNvbTBZ\\nMBMGByqGSM49AgEGCCqGSM49AwEHA0IABHV6X/kWuQK6xhXe9OenQZKDI7/zax7Y\\njYlRvUlHgCoqKIy8fFAat3glGbVX1oo2oZ7cMJVlFnbuiPdrg4vkyjejTTBLMA4G\\nA1UdDwEB/wQEAwIHgDAMBgNVHRMBAf8EAjAAMCsGA1UdIwQkMCKAIA5ykiTos/MX\\nhMipPFuO9vTByR2ebld8RcMxY2Cf5AARMAoGCCqGSM49BAMCA0gAMEUCIQDbCDrW\\neqZ4yw7vcEhnNExiRZTv0xcVbRF8JgGozLz6qwIgZoXcqxvkJaBdZpwzg4f0RvVQ\\nQrjJMURXXchQ1Mnd5+o=\\n-----END CERTIFICATE-----\\n"},"nonce":"c652a2c03303a79595d03ec2699a435b6acfd7a16211dec1"}},"data":{"actions":[{"header":{"creator":{"Mspid":"Org1MSP","IdBytes":"-----BEGIN CERTIFICATE-----\\nMIICGjCCAcCgAwIBAgIRANfNECvok9C6hT58XJZ/lJAwCgYIKoZIzj0EAwIwczEL\\nMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNhbiBG\\ncmFuY2lzY28xGTAXBgNVBAoTEG9yZzEuZXhhbXBsZS5jb20xHDAaBgNVBAMTE2Nh\\nLm9yZzEuZXhhbXBsZS5jb20wHhcNMTcwNjIzMTIzMzE5WhcNMjcwNjIxMTIzMzE5\\nWjBbMQswCQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5pYTEWMBQGA1UEBxMN\\nU2FuIEZyYW5jaXNjbzEfMB0GA1UEAwwWVXNlcjFAb3JnMS5leGFtcGxlLmNvbTBZ\\nMBMGByqGSM49AgEGCCqGSM49AwEHA0IABHV6X/kWuQK6xhXe9OenQZKDI7/zax7Y\\njYlRvUlHgCoqKIy8fFAat3glGbVX1oo2oZ7cMJVlFnbuiPdrg4vkyjejTTBLMA4G\\nA1UdDwEB/wQEAwIHgDAMBgNVHRMBAf8EAjAAMCsGA1UdIwQkMCKAIA5ykiTos/MX\\nhMipPFuO9vTByR2ebld8RcMxY2Cf5AARMAoGCCqGSM49BAMCA0gAMEUCIQDbCDrW\\neqZ4yw7vcEhnNExiRZTv0xcVbRF8JgGozLz6qwIgZoXcqxvkJaBdZpwzg4f0RvVQ\\nQrjJMURXXchQ1Mnd5+o=\\n-----END CERTIFICATE-----\\n"},"nonce":"c652a2c03303a79595d03ec2699a435b6acfd7a16211dec1"},"payload":{"chaincode_proposal_payload":{"input":{"id_generation_alg":"","sig":"235e41dd58a93fa90c9fddb357e7e4974fd105e88e9d162402a3016d6d862bf116a8baf3167d51b38643c7d6142a5f1e3dd8a369583a74e00f269b31fb04a82d01","chaincode_spec":{"type":"GOLANG","chaincode_id":{"path":"","name":"token","version":""},"input":{"args":["transfer","3c97f146e8de9807ef723538521fcecd5f64c79a","Tobee","9"]},"timeout":0},"sender_spec":{"sender":"0dd7c16a70d42f9e952225862855edd0098a4920","counter":{"low":44,"high":0,"unsigned":true},"ink_limit":"10","msg":"哈哈和范围及佛问佛 i机哦就34i 哦飞机30✈️49 💢389反悔3福报3 附近4了✈️开房间4i 哦发几4i飞机哦激发of4减肥了开就分开了家4否42几分4能芣4妮佛34妮佛扣卖飞机看立法局3扣了腓尼基科隆博附近封包扣了几分合计客户法兰克韩复榘看好会计法话v 毕恭毕敬咖喱饭唯饭后21克拉我就饿哭了飞机违法 i 哦微积分 i 哦微积分 i 权威肌肤lwe we fwkejfklqewjflkwef"}}},"action":{"proposal_response_payload":{"proposal_hash":"693694e94aba4299946bd63fb53ece5360e809b3264e9833f4130d747d91a285","extension":{"results":{"TxRwSet":{"data_model":0,"ns_rwset":[{"namespace":"lscc","rwset":{"reads":[{"key":"token","version":{"block_num":{"low":1,"high":0,"unsigned":true},"tx_num":{"low":0,"high":0,"unsigned":true}}}],"range_queries_info":[],"writes":[]}}]},"Transet":{"from":"0dd7c16a70d42f9e952225862855edd0098a4920","from_ver":{"block_num":{"low":5727,"high":0,"unsigned":true},"tx_num":{"low":0,"high":0,"unsigned":true}},"transet":[{"to":"3c97f146e8de9807ef723538521fcecd5f64c79a","balance_type":"Tobee","amount":"9"}]}},"events":{"chaincode_id":"","tx_id":"","event_name":"","payload":{"type":"Buffer","data":[]}},"response":{"status":200,"message":"","payload":""}}},"endorsements":[{"endorser":{"Mspid":"Org1MSP","IdBytes":"-----BEGIN -----\\nMIICGDCCAb+gAwIBAgIQPcMFFEB/vq6mEL6vXV7aUTAKBggqhkjOPQQDAjBzMQsw\\nCQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5pYTEWMBQGA1UEBxMNU2FuIEZy\\nYW5jaXNjbzEZMBcGA1UEChMQb3JnMS5leGFtcGxlLmNvbTEcMBoGA1UEAxMTY2Eu\\nb3JnMS5leGFtcGxlLmNvbTAeFw0xNzA2MjMxMjMzMTlaFw0yNzA2MjExMjMzMTla\\nMFsxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMRYwFAYDVQQHEw1T\\nYW4gRnJhbmNpc2NvMR8wHQYDVQQDExZwZWVyMC5vcmcxLmV4YW1wbGUuY29tMFkw\\nEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEzS9k2gCKHcat8Wj4T2nB1uyC8R2zg3um\\nxdTL7nmgFWp0uyCCbQQxD/VS+8R/3DNvEFkvzhcjc9NU/nRqMirpLqNNMEswDgYD\\nVR0PAQH/BAQDAgeAMAwGA1UdEwEB/wQCMAAwKwYDVR0jBCQwIoAgDnKSJOiz8xeE\\nyKk8W4729MHJHZ5uV3xFwzFjYJ/kABEwCgYIKoZIzj0EAwIDRwAwRAIgHBdxbHUG\\nrFUzKPX9UmmN3SwigWcRUREUy/GTb3hDIAsCIEF1BxTqv8ilQYE8ql0wJL4mTber\\nHE6DFYvvBCUnicUh\\n-----END -----\\n"},"signature":"3045022100dda80e7f1a07aa8743b706888f3a0722f323198e57e3683375783dc6aba5eeaa02202bee6def1c77ffe737bf1a68910191b159c0c15bb30034d26fee4d8a7ffc8ed4"},{"endorser":{"Mspid":"Org2MSP","IdBytes":"-----BEGIN -----\\nMIICGjCCAcCgAwIBAgIRANDlqX1daKI2aN0Qm7vrfKAwCgYIKoZIzj0EAwIwczEL\\nMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNhbiBG\\ncmFuY2lzY28xGTAXBgNVBAoTEG9yZzIuZXhhbXBsZS5jb20xHDAaBgNVBAMTE2Nh\\nLm9yZzIuZXhhbXBsZS5jb20wHhcNMTcwNjIzMTIzMzE5WhcNMjcwNjIxMTIzMzE5\\nWjBbMQswCQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5pYTEWMBQGA1UEBxMN\\nU2FuIEZyYW5jaXNjbzEfMB0GA1UEAxMWcGVlcjAub3JnMi5leGFtcGxlLmNvbTBZ\\nMBMGByqGSM49AgEGCCqGSM49AwEHA0IABP8N39LBcB0qJyb3v9Y9WIPfYHOfWPna\\nT8WyWzGisrYvHVF+GLfDLFrjQs0uN8QPsTsqYlnXDs/Mjv7tZaE9NuqjTTBLMA4G\\nA1UdDwEB/wQEAwIHgDAMBgNVHRMBAf8EAjAAMCsGA1UdIwQkMCKAIKfUfvpGproH\\ncwyFD+0sE3XfJzYNcif0jNwvgOUFZ4AFMAoGCCqGSM49BAMCA0gAMEUCIQDa1gKe\\nPRVRN/i8hUptACw02V7V9Yeo7kKlbQ6vWU5fqAIgXg2xAQ4TjwXOHlKbIyYZ7fox\\ncekBJ+E8yAFm8XQrfy0=\\n-----END -----\\n"},"signature":"3045022100d7126e0b7c58aef576aff1532b21b71f30fe3f7041731c4fc14014bd0bf194e202203f222cd67be7c6c9d4aba99669273d2cb0a0ec2185777feb8c5ad7a775d2a297"}]}}}]}}}}</pre>' + '<br>';

    let help_content = generate_account + '<hr>' +get_account + '<hr>' +get_balance + '<hr>' + transfer + '<hr>' + get_transaction;

    res.send(help_content);
});

app.get('/generate-account', (req, res)=>{
    Wallet.generate();
    res.json({"address": Wallet.getAddress(), "private_key": Wallet.getPriKey()});
});
app.get('/get-account/:address', (req, res)=>{
    const address = req.params.address;
    inkUtils.getAccount('org1',[address], null, false)
        .then((result) => {
            res.json(JSON.parse(result[0].toString().replace(":\"{", ":{").replace("}\"}", "}}")));
        }, (err) => {
            res.json(err);
        }).catch((err) => {
            res.json(err);
        });
});
app.get('/get-balance/:address/:coin_type', (req, res)=>{
    const address = req.params.address;
    const coin_type = req.params.coin_type;
    inkUtils.getBalance('org1',[address, coin_type], null,false)
        .then((result) => {
            res.json(JSON.parse(result[0].toString()));
        }, (err) => {
            res.json(err);
        }).catch((err) => {
            res.json(err);
        });
});
app.post('/transfer', (req, res)=>{
    const to_address = req.body.to_address;
    const coin_type = req.body.coin_type;
    const amount = req.body.amount;
    const message = req.body.message;
    const private_key = req.body.private_key;
    inkUtils.invokeChaincodeSigned('org1', 'token', 'v0','transfer', [to_address, coin_type, amount],"10", message, private_key, false)
        .then((result) => {
            res.json({"transaction_id": result});
        }, (err) => {
            res.json(err);
        }).catch((err) => {
            res.json(err);
        });
});
app.get('/get-transaction/:transaction_id', (req, res)=>{
    const transaction_id = req.params.transaction_id;
    inkUtils.queryChaincode('org1', 'qscc','GetTransactionByID', ["mychannel", transaction_id])
        .then((result) => {
            res.json(Client.decodeTransaction(result[0]));
        }, (err) => {
            res.json(err);
        }).catch((err) => {
            res.json(err);
        });
});

let server = app.listen(8081, ()=>{

    let host = server.address().address;
    let port = server.address().port;

    console.log("inkchain restful api, help http://%s:%s/help", host, port)

});