/**
 * Created by wangh09 on 2017/12/19.
 */
require('../config');
let queryHandler = require('../query');

queryHandler.queryChaincode('peer1','mychannel','token',["iACAdB8391bc793495C203D58d57776DcD5CA83AD"],'getAccount','user','org1').then((result)=>{
    console.log(result[0].toString());
});