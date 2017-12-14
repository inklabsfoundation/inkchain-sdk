/**
 * Created by wangh09 on 2017/12/12.
 */
let createChannelHandler = require('../create-channel');
createChannelHandler.createChannel("mychannel", "../artifacts/channel/mychannel.tx", 'user', 'org1').then((result) => {
   console.log(result);
});