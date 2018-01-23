/**
 * Created by wangh09 on 2017/12/13.
 */

require('../config');
let invokeSignedHandler = require('../invoke-signed-shot');

invokeSignedHandler.invokeChaincodeSigned(['peer1'],'mychannel','token','transfer',["3c97f146e8de9807ef723538521fcecd5f64c79a", "INK", "1000"],'user','org1','10','hello world','bab0c1204b2e7f344f9d1fbe8ad978d5355e32b8fa45b10b600d64ca970e0dc9').then((result) =>{
    console.log(result);
});