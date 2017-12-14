/**
 * Created by wangh09 on 2017/12/14.
 */
require('../config');
let queryHandler = require('../query');

let type = 'installed'; //'instantiated'

queryHandler.getInstalledChaincodes('peer1', type, 'user', 'org1').then((result) =>{
    console.log(result);
});