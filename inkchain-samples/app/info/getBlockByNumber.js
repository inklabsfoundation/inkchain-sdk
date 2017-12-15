/**
 * Created by wangh09 on 2017/12/14.
 */

require('../config');
let queryHandler = require('../query');

let number = "11033";
queryHandler.getBlockByNumber('peer1', number, 'user', 'org1').then((result) =>{
    console.log(JSON.stringify(result));
});