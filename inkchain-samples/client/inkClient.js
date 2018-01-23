/**
 * Created by wangh09 on 2018/1/15.
 */

let grpc = require('grpc');
require('es6-promise').polyfill();
require('isomorphic-fetch');
let _ccProto = grpc.load('client/protos/peer/chaincode.proto').protos;
let ethUtils = require('ethereumjs-util');
const Long = require('long');
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

let sdk_counter = 0;
let queue_length = 0;
let max_queue_length = 10;
let mutex_counter = false;
let sender_address = "";
let invoke_error = false;
async function transfer(to, tokenId, amount, msg, priKey) {
    while(mutex_counter || invoke_error || queue_length >= max_queue_length) {
        if(queue_length == 0) {
            invoke_error = false;
        }
        await sleep(300);
    }
    mutex_counter = true;
    let senderAddress = ethUtils.privateToAddress(new Buffer(priKey, "hex")).toString('hex');
    if(senderAddress != sender_address) {
        sdk_counter = 0;
        sender_address = senderAddress;
    }
    let ccId = 'token';
    let fcn = 'transfer';
    let inkLimit = "100";
    if (sdk_counter == 0) {
        return queryCounter(senderAddress).then((result) => {
            let sig = signTX(ccId, fcn, [to, tokenId, amount], msg, result.data, inkLimit, priKey);
            sdk_counter = parseInt(result.data) + 1;
            queue_length++;
            mutex_counter = false;
            return _transfer(senderAddress, to, tokenId, amount, msg, result.data, inkLimit, JSON.stringify(sig)).then((result) => {
                queue_length--;
                if (result.status_code != 200){
                    sdk_counter = 0;
                    invoke_error = true;
                    throw new Error("invoke fail");
                }
                return result;
            });
        });
    } else {
        let counter_now = sdk_counter;
        sdk_counter++;
        queue_length++;
        mutex_counter = false;
        let sig = signTX(ccId, fcn, [to, tokenId, amount], msg, counter_now, inkLimit, priKey);
        return _transfer(senderAddress, to, tokenId, amount, msg, counter_now.toString(), inkLimit, JSON.stringify(sig)).then((result) => {
            queue_length--;
            if (result.status_code != 200){
                sdk_counter = 0;
                invoke_error = true;
                throw new Error("invoke fail");
            }
            return result;
        });
    }
}
async function queryCounter(address) {
    let data = {
        from_address: address,
    };
    return fetch("http://localhost:8081/query-counter",{
        method:"POST",
        headers: {
            "Content-Type": 'application/json'
        },
        body:JSON.stringify(data)
    }).then((result)=>{
        return result.json();
    });
}
async function getAccount(address) {
    return fetch("http://localhost:8081/get-account/" + address,{
        method:"GET",
        headers: {
            "Content-Type": 'application/json'
        },
    }).then((result)=>{
        return result.json();
    });
}
async function queryTx(txId) {
    return fetch("http://localhost:8081/get-transaction/" + txId,{
        method:"GET",
        headers: {
            "Content-Type": 'application/json'
        },
    }).then((result)=>{
        return result.json();
    });
}
async function _transfer(from, to, tokenId, amount, msg, counter,inkLimit, sig) {
    let data = {
        to_address: to,
        from_address: from,
        coin_type: tokenId,
        amount: amount,
        message: msg,
        counter: counter,
        ink_limit: inkLimit,
        sig: sig
    };

    return fetch("http://localhost:8081/transfer",{
        method:"POST",
        headers: {
            "Content-Type": 'application/json'
        },
        body:JSON.stringify(data)
    }).then((result)=>{
        return result.json();
    });
}

async function invoke(ccId, fcn, args, msg, priKey) {
    while(mutex_counter || queue_length >= max_queue_length) {
        await sleep(300);
    }
    mutex_counter = true;
    let senderAddress = ethUtils.privateToAddress(new Buffer(priKey, "hex")).toString('hex');
    if(senderAddress != sender_address) {
        sdk_counter = 0;
        sender_address = senderAddress;
    }
    let inkLimit = "100";
    if(sdk_counter == 0) {
        return queryCounter(senderAddress).then((result) => {
            let sig = signTX(ccId, fcn, args, msg, result.data, inkLimit, priKey);
            sdk_counter = parseInt(result.data) + 1;
            queue_length++;
            mutex_counter = false;
            return _invoke(senderAddress, ccId, fcn, args, msg, result.data, inkLimit, JSON.stringify(sig)).then((result)=> {
                if(result.status_code != 200) throw new Error("invoke fail");
                queue_length--;
                return result;
            }).catch((err)=>{
                sdk_counter = 0;
                queue_length--;
                throw err;
            });
        });
    } else {
        let counter_now = sdk_counter;
        sdk_counter ++;
        queue_length ++;
        mutex_counter = false;
        let sig = signTX(ccId, fcn, args, msg, counter_now, inkLimit, priKey);
        return _invoke(senderAddress, ccId, fcn, args, msg, counter_now, inkLimit, JSON.stringify(sig)).then((result)=> {
            if(result.status_code != 200) throw new Error("invoke fail");
            queue_length--;
            return result;
        }).catch((err)=>{
            sdk_counter = 0;
            queue_length--;
            throw err;
        });
    }
}

async function _invoke(sender, ccId, fcn, args, msg, counter, inkLimit, sig) {
    let data = {
        cc_id: ccId,
        fcn: fcn,
        sender: sender,
        args: args,
        message: msg,
        counter: counter,
        ink_limit: inkLimit,
        sig: sig
    };
    return fetch("http://localhost:8081/invoke",{
        method:"POST",
        headers: {
            "Content-Type": 'application/json'
        },
        body:JSON.stringify(data)
    }).then((result)=>{
        return result.json();
    });
}

async function query(ccId, fcn, args) {
    let data = {
        cc_id: ccId,
        fcn: fcn,
        args: args
    };
    return fetch("http://localhost:8081/query",{
        method:"POST",
        headers: {
            "Content-Type": 'application/json'
        },
        body:JSON.stringify(data)
    }).then((result)=>{
        return result.json();
    });
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
module.exports.transfer = transfer;
module.exports.getAccount = getAccount;
module.exports.queryCounter = queryCounter;
module.exports.queryTx = queryTx;
module.exports.invoke = invoke;
module.exports.query = query;