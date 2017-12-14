/**
 * Created by wangh09 on 2017/12/12.
 */
let instantiateCCHandler = require('../instantiate-chaincode');

const CC_ID = 'token';
const CC_VERSION = '1.0';
const CHANNEL_NAME = 'mychannel';

instantiateCCHandler.instantiateChaincode(CHANNEL_NAME, CC_ID, CC_VERSION, null, null, 'user', 'org1').then((result) => {
    console.log(result);
});