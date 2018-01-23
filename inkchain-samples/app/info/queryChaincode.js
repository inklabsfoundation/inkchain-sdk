/**
 * Created by wangh09 on 2017/12/14.
 */
require('../config');
let queryHandler = require('../query');

queryHandler.queryChaincode('peer1', 'mychannel', 'ascc', ['INK'], 'queryToken', 'user', 'org1').then((result) =>{
    console.log(JSON.stringify(result));
});
