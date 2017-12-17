/**
 * Created by wangh09 on 2017/12/12.
 */
require('../config');
let instantiateCCHandler = require('../instantiate-pre');

const CC_ID = 'token';
const CC_VERSION = '1.0';
const CC_PATH = 'github.com/token';
const CHANNEL_NAME = 'mychannel';

instantiateCCHandler.instantiateChaincode(CHANNEL_NAME, 'org1', CC_ID, CC_PATH, CC_VERSION, false).then((result) =>{
   console.log(result);
});
/*
instantiateCCHandler.instantiateChaincode(CHANNEL_NAME, CC_ID, CC_VERSION, 'init',[], 'Admin', 'org1').then((result) => {
    console.log(result);
});
*/
