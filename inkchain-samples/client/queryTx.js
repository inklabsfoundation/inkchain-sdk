/**
 * Created by wangh09 on 2018/1/16.
 */

let inkClient = require("./inkClient");

inkClient.queryTx('5b553c7ae8ac860c68c0592685753c6bbc7c7233181d7c1a32d062cc6fcce820').then((res)=>{
    console.log(JSON.stringify(res));
});
