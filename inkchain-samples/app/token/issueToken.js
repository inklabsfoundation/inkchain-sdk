/**
 * Created by wangh09 on 2017/12/14.
 */
require('../config');
let invokeHandler = require('../invoke-transaction');
invokeHandler.invokeChaincodeAdmin(['peer1'],'mychannel','ascc','registerAndIssueToken',['INK','1000000000000000000000000000','18','i411b6f8f24F28CaAFE514c16E11800167f8EBd89'],'admin','org1',null, null).then((result) =>{
    console.log(result);
});