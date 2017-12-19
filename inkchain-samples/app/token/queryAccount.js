/**
 * Created by wangh09 on 2017/12/19.
 */
require('../config');
let queryHandler = require('../query');

queryHandler.queryChaincode('peer1','mychannel','token',["411b6f8f24F28CaAFE514c16E11800167f8EBd89"],'getAccount','user','org1').then((result)=>{
    console.log(result[0].toString());
});