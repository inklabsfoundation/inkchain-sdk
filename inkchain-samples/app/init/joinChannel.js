/**
 * Created by wangh09 on 2017/12/12.
 */
require('../config');
let joinChannelHandler = require('../join-channel');

joinChannelHandler.joinChannel("mychannel",['peer1'],'user', 'org1').then((result) => {
    console.log(result);
}).then(()=>{
    joinChannelHandler.joinChannel("mychannel",['peer1'],'user', 'org2').then((result) => {
        console.log(result);
    })
});
