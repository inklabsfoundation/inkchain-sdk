/**
 * Created by wangh09 on 2018/1/20.
 */
let grpc = require('grpc');
let _ccProto = grpc.load('inkchain-client/lib/protos/peer/chaincode.proto').protos;
let ethUtils = require('ethereumjs-util');
const Long = require('long');
let settingsConfig = require('./config');
let invokeHandler = require('./invoke-transaction');
let queryHandler = require('./query');
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

function invoke(peerNames, channelName, chaincodeName, fcn, args, username, org, senderAddress, msg, inkLimit, counter, sig) {
    let senderSpec = {
        sender: Buffer.from(senderAddress),
        counter: Long.fromString(counter.toString()),
        ink_limit: Buffer.from(inkLimit),
        msg: Buffer.from(msg)
    };
    try {
        return invokeHandler.invokeChaincode(peerNames, channelName, chaincodeName, fcn, args, username, org, senderSpec, sig);
    } catch(err) {
        throw err;
    }
}
function queryCounter(peer, channelName, CC_ID, fcn, args, username, org) {
    try {
        return queryHandler.queryChaincode(peer, channelName, CC_ID, args, fcn, username, org);
    } catch(err) {
        throw err;
    }
}
async function invokeChaincodeSigned(peerNames, channelName, ccId, fcn, args, username, org, inkLimit, msg, priKey) {
    let senderAddress = settingsConfig.AddressPrefix + ethUtils.privateToAddress(new Buffer(priKey,"hex")).toString('hex');
    return queryCounter(peerNames[0], channelName, 'token', 'counter',[senderAddress],username,org).then((counter) => {
        let sig = signTX(ccId, fcn, args, msg, counter[0].toString(), inkLimit, priKey);
        return invoke(peerNames, channelName, ccId, fcn, args, username, org, senderAddress, msg, inkLimit, counter[0].toString(), sig).then((result)=> {
            return result;
        }).catch((err)=>{
            console.log(err);
        });
    });
}
module.exports.invokeChaincodeSigned = invokeChaincodeSigned;
