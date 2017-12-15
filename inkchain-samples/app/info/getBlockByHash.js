/**
 * Created by wangh09 on 2017/12/14.
 */

require('../config');
let queryHandler = require('../query');

let hash = "169b89540413b7f3e6d4d7d91c697bfae07e179c1f8586cf93c905a804bf8a55";
queryHandler.getBlockByHash('peer1', new Buffer(hash, 'hex'), 'user', 'org1').then((result) =>{
   console.log(JSON.stringify(result));
});