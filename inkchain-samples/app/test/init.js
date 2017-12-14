/**
 * Created by wangh09 on 2017/12/13.
 */
require('./config');
const CC_PATH = 'github.com/token';
const CC_ID = 'token';
const CC_VERSION = '1.0';
const CHANNEL_NAME = 'mychannel';
let joinChannelHandler = require('../join-channel');

let createChannelHandler = require('../create-channel');
let installCCHandler = require('../install-chaincode');
let instantiateCCHandler = require('../instantiate-chaincode');

createChannelHandler.createChannel(CHANNEL_NAME, "../artifacts/channel/mychannel.tx", 'user', 'org1').then((result) => {
    console.log(result);
    setTimeout(()=>{
        joinChannelHandler.joinChannel(CHANNEL_NAME,['peer1'],'user', 'org1').then((result) => {
            console.log(result);
            installCCHandler.installChaincode(['peer1'], CC_ID, CC_PATH, CC_VERSION, 'user', 'org1').then((result) => {
                console.log(result);
                instantiateCCHandler.instantiateChaincode(CHANNEL_NAME, CC_ID, CC_VERSION, null, null, 'user', 'org1').then((result) => {
                    console.log(result);
                });
            });
        });
    }, 1000);

});