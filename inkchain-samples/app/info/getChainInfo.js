/**
 * Created by wangh09 on 2017/12/14.
 */

require('../config');
let queryHandler = require('../query');

queryHandler.getChainInfo('peer1', 'user', 'org1').then((result) =>{
    console.log("blockHeight:"+result.height);
    console.log("currentBlockHash:"+result.currentBlockHash.toBuffer().toString('hex'));
    console.log("previousBlockHash:"+result.previousBlockHash.toBuffer().toString('hex'));
});