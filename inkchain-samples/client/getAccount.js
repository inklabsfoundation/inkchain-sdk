/**
 * Created by wangh09 on 2018/1/16.
 */
let inkClient = require("./inkClient");

inkClient.getAccount('3c97f146e8de9807ef723538521fcecd5f64c79a').then((res)=>{
    console.log(res);
});
