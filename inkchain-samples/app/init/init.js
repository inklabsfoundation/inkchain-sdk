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
let invokeHandler = require('../invoke-transaction');

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
                        }).then(()=>{
                            invokeHandler.invokeChaincodeAdmin(['peer1'],'mychannel','ascc','registerAndIssueToken',['INK','1000000000000000000000000000','18','411b6f8f24F28CaAFE514c16E11800167f8EBd89'],'admin','org1',null, null).then((result) =>{
                                console.log(result);
                            });
                        });
                    });
                });
            });
        }).then((result));

    }, 1000);

});