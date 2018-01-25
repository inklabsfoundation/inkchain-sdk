/**
 * Created by wangh09 on 2018/1/15.
 */

let grpc = require('grpc');
let _ccProto = grpc.load('inkchain-client/lib/protos/peer/chaincode.proto').protos;
let ethUtils = require('ethereumjs-util');
const Long = require('long');
let invokeHandler = require('../invoke-signed');
let settingsConfig = require('../config');
function signTX(ccId, fcn, arg, msg, counter, inkLimit, priKey) {
    let args = [];
    let senderAddress = ethUtils.privateToAddress(new Buffer(priKey, "hex"));
    let senderSpec = {
        sender: Buffer.from(settingsConfig.AddressPrefix + senderAddress.toString("hex")),
        counter: Long.fromString(counter.toString()),
        ink_limit: Buffer.from(inkLimit),
        msg: Buffer.from(msg)
    };
    args.push(Buffer.from(fcn ? fcn : 'invoke', 'utf8'));
    for (let i=0; i<arg.length; i++) {
        args.push(Buffer.from(arg[i], 'utf8'));
    }
    let invokeSpec = {
        type: _ccProto.ChaincodeSpec.Type.GOLANG,
        chaincode_id: {
            name: ccId
        },
        input: {
            args: args
        }
    };
    let cciSpec = new _ccProto.ChaincodeInvocationSpec();
    let signContent = new _ccProto.SignContent();
    signContent.setChaincodeSpec(invokeSpec);
    signContent.setSenderSpec(senderSpec);
    signContent.id_generation_alg = cciSpec.id_generation_alg;
    let signHash = ethUtils.sha256(signContent.toBuffer());
    let sigrsv = ethUtils.ecsign(signHash, new Buffer(priKey, "hex"));

    return Buffer.concat([
        ethUtils.setLengthLeft(sigrsv.r, 32),
        ethUtils.setLengthLeft(sigrsv.s, 32),
        ethUtils.toBuffer(sigrsv.v - 27)
    ]);
}

let sdk_counter = 0;
let queue_length = 0;
let max_queue_length = 10;
let mutex_counter = false;
let sender_address = "";
function invoke(from, to, tokenId, amount, msg, counter, sig) {
    let data = {
        to_address: to,
        from_address: from,
        coin_type: tokenId,
        amount: amount,
        message: msg,
        counter: req.body.counter,
        sig: req.body.sig
    };

    data = JSON.stringify(data);
    var opt = {
        method: "POST",
        host: "localhost",
        port: 8081,
        path: "/transfer",
        headers: {
            "Content-Type": 'application/json',
            "Content-Length": data.length
        }
    };

    var req = http.request(opt, function (serverFeedback) {
        if (serverFeedback.statusCode == 200) {
            var body = "";
            serverFeedback.on('data', function (data) { body += data; })
                .on('end', function () { res.send(200, body); });
        }
        else {
            res.send(500, "error");
        }
    });
    req.write(data + "\n");
    req.end();
}
async function invokeChaincodeSigned(peerNames, channelName, ccId, fcn, args, inkLimit, msg, priKey) {
    while(mutex_counter || queue_length >= max_queue_length) {
        await sleep(300);
    }
    mutex_counter = true;
    let senderAddress = settingsConfig.AddressPrefix + ethUtils.privateToAddress(new Buffer(priKey,"hex")).toString('hex');
    if(senderAddress != sender_address) {
        sdk_counter = 0;
        sender_address = senderAddress;
    }
    if(sdk_counter == 0) {
        return invokeHandler.query(peerNames[0], channelName, ccId, 'counter',[senderAddress]).then((counter) => {
            let sig = signTX(ccId, fcn, args, msg, counter[0].toString(), inkLimit, priKey);
            sdk_counter = parseInt(counter[0]) + 1;
            queue_length++;
            mutex_counter = false;
            return invokeHandler.invoke(peerNames, channelName, ccId, fcn, args, senderAddress, msg, inkLimit, counter[0].toString(), sig).then((result)=> {
                queue_length--;
                return result;
            }).catch((err)=>{
                console.log(err);
                sdk_counter = 0;
            });
        });
    } else {
        let counter_now = sdk_counter;
        sdk_counter ++;
        queue_length ++;
        mutex_counter = false;
        let sig = signTX(ccId, fcn, args, msg, counter_now, inkLimit, priKey);
        return invokeHandler.invoke(peerNames, channelName, ccId, fcn, args, senderAddress, msg, inkLimit, counter_now, sig).then((result)=>{
            queue_length--;
            return result;
        }).catch((err)=>{
            console.log(err);
            sdk_counter = 0;
        });
    }
}
module.exports.invokeChaincodeSigned = invokeChaincodeSigned;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}