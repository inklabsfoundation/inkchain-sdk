/**
 * Created by wangh09 on 2018/1/20.
 */

const Long = require('long');
let invokeHandler = require('./invoke-transaction');
let queryHandler = require('./query');

require('./config');
let helper = require('./helper');
helper.getRegisteredUsers('user', 'org1');

let queue_length = 0;
let max_queue_length = 100;
async function invoke(peerNames, channelName, chaincodeName, fcn, args, senderAddress, msg, inkLimit, counter, sig) {
    while(queue_length >= max_queue_length) {
        await sleep(300);
    }
    queue_length++;
    let username = 'user';
    let org = 'org1';
    let senderSpec = {
        sender: Buffer.from(senderAddress),
        counter: Long.fromString(counter.toString()),
        ink_limit: Buffer.from(inkLimit),
        msg: Buffer.from(msg)
    };
    try {
        return invokeHandler.invokeChaincodePersist(peerNames, channelName, chaincodeName, fcn, args, username, org, senderSpec, sig).then((result)=>{
            queue_length--;
            return result;
        }).catch((err)=>{
            queue_length--;
            return err;
        });
    } catch(err) {
        queue_length--;
        throw err;
    }
}
function query(peer, channelName, CC_ID, fcn, args) {
    let username = 'user';
    let org = 'org1';
    try {
        return queryHandler.queryChaincode(peer, channelName, CC_ID, args, fcn, username, org);
    } catch(err) {
        throw err;
    }
}
module.exports.invoke = invoke;
module.exports.query = query;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
