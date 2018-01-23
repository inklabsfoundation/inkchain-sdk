/**
 * Created by wangh09 on 2018/1/16.
 */

let inkClient = require("./inkClient");

inkClient.transfer("3c97f146e8de9807ef723538521fcecd5f64c79a", "INK", "1", 'test', 'bab0c1204b2e7f344f9d1fbe8ad978d5355e32b8fa45b10b600d64ca970e0dc9').then((res)=>{
    console.log(res);
});
