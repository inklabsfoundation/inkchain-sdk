/**
 * Created by wangh09 on 2017/12/13.
 */
require('../config');
const CC_PATH = 'github.com/token';
const CC_ID = 'token';
const CC_VERSION = '1.0';
const CHANNEL_NAME = 'mychannel';
let joinChannelHandler = require('../join-channel');
let createChannelHandler = require('../create-channel');
let installCCHandler = require('../install-chaincode');
let instantiateCCHandler = require('../instantiate-pre');

createChannelHandler.createChannel(CHANNEL_NAME, "../artifacts/channel/mychannel.tx", 'user', 'org1').then((result) => {
    console.log(result);
    setTimeout(()=>{
        joinChannelHandler.joinChannel(CHANNEL_NAME,['peer1'],'user', 'org1').then((result) => {
            console.log(result);
        }).then(()=>{
            joinChannelHandler.joinChannel(CHANNEL_NAME,['peer1'],'user', 'org2').then((result) => {
                console.log(result);
            }).then(()=>{
                installCCHandler.installChaincode(['peer1','peer2'], CC_ID, CC_PATH, '1.0', 'user', 'org1').then((result) => {
                    console.log(result);
                }).then(()=>{
                    installCCHandler.installChaincode(['peer1','peer2'], CC_ID, CC_PATH, '1.0', 'user', 'org2').then((result) => {
                        console.log(result);
                    }).then(()=>{
                        instantiateCCHandler.instantiateChaincode(CHANNEL_NAME, 'org1', CC_ID, CC_PATH, CC_VERSION, false).then((result) =>{
                            console.log(result);
                        });
                    })
                });
            })
        }).then((result));

    }, 1000);

});