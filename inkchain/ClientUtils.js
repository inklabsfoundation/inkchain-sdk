/**
 * Created by wangh09 on 2017/12/11.
 */
let grpc = require('grpc');
let _ccProto = grpc.load('inkchain-client/lib/protos/peer/chaincode.proto').protos;
let ethUtils = require('ethereumjs-util');
const Long = require('long');
let inkUtils = require('./InkUtils');
function signTX(ccId, fcn, arg, msg, counter, inkLimit, priKey) {
    let args = [];
    let senderAddress = ethUtils.privateToAddress(new Buffer(priKey, "hex"));
    let senderSpec = {
        sender: Buffer.from(senderAddress.toString("hex")),
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

function invoke(userOrg, ccId, version, func, args, senderAddress, msg, inkLimit, counter, sig) {
    let senderSpec = {
        sender: Buffer.from(senderAddress),
        counter: Long.fromString(counter.toString()),
        ink_limit: Buffer.from(inkLimit),
        msg: Buffer.from(msg)
    };
    return inkUtils.invokeChaincode(userOrg, ccId, version, func, args, true, senderSpec, sig, false);
}

let sdk_counter = 0;
let queue_length = 0;
let max_queue_length = 10;
let mutex_counter = false;
let clean_counter = false;
let sender_address = "";

async function invokeChaincodeSigned(userOrg, ccId, version, func, args, inkLimit, msg, priKey, isAdmin) {
    if(mutex_counter || queue_length >= max_queue_length) {
        await sleep(300);
        return invokeChaincodeSigned(userOrg, ccId, version, func, args, inkLimit, msg, priKey, isAdmin);
    } else {
        mutex_counter = true;
        let senderAddress = ethUtils.privateToAddress(new Buffer(priKey,"hex")).toString('hex');
        if(senderAddress != sender_address) {
            sdk_counter = 0;
            sender_address = senderAddress;
        }
        if(sdk_counter == null || sdk_counter == 0) {
            // query counter & send transaction
            let promise = Promise.resolve();
            return promise.then(() => {
                return inkUtils.queryChaincode('org1', ccId, 'counter', [senderAddress]).then((counter) => {
                    sdk_counter = parseInt(counter[0]) + 1;

                    let sig = signTX(ccId, func, args, msg, counter[0].toString(), inkLimit, priKey);

                    queue_length ++;
                    mutex_counter = false;
                    return invoke(userOrg, ccId, version, func, args, senderAddress, msg, inkLimit, counter[0].toString(), sig);
                });
            }).catch((err) => {
                if(mutex_counter)
                    clean_counter = true;
                else
                    sdk_counter = 0;
                queue_length--;
                return invokeChaincodeSigned(userOrg, ccId, version, func, args, inkLimit, msg, priKey, isAdmin);
            }).then((result) => {
                queue_length--;
                return result;
            });
        } else {
            // counter++ & send transaction
            if(clean_counter) {
                clean_counter = false;
                sdk_counter = 0;
                mutex_counter = false;
                return invokeChaincodeSigned(userOrg, ccId, version, func, args, inkLimit, msg, priKey, isAdmin);
            } else {
                let counter_now = sdk_counter;
                sdk_counter ++;
                queue_length ++;
                mutex_counter = false;
                let sig = signTX(ccId, func, args, msg, counter_now, inkLimit, priKey);
                return invoke(userOrg, ccId, version, func, args, senderAddress, msg, inkLimit, counter_now, sig).then((result)=>{
                    queue_length--;
                    return result;
                }).catch((err)=>{
                    if(mutex_counter) {
                        clean_counter = true;
                    } else {
                        sdk_counter = 0;
                    }
                    queue_length--;
                    return invokeChaincodeSigned(userOrg, ccId, version, func, args, inkLimit, msg, priKey, isAdmin);
                });

            }
        }
    }
}
module.exports.invokeChaincodeSigned = invokeChaincodeSigned;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}