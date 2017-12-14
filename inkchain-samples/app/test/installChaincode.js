/**
 * Created by wangh09 on 2017/12/12.
 */
let installCCHandler = require('../install-chaincode');

const TOKEN_CC_PATH = 'github.com/token';
const TOKEN_CC_ID = 'token';
installCCHandler.installChaincode(['peer1', 'peer2'], TOKEN_CC_ID, TOKEN_CC_PATH, '1.0', 'user', 'org1').then((result) => {
    console.log(result);
});