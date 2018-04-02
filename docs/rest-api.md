Inkchain SDK Api for Node.js
============================

POST/GET返回status_code
-----------------------
    200: 成功  {"status_code":200,"data":XXX}
    500: 失败  {"status_code":500,"error":XXX}
    
新建应用通道
----------
	http:// + server_address + /create-channel
    
    curl -s -X POST 
      http://localhost:8081/create-channel 
      -H "content-type: application/json" 
      -d "{
        "channelName":"mychannel",
        "channelConfigPath":"XXX/mychannel.tx"
    }"
    
    
```
// 成功返回
{
　　"status_code":200,
　　"data":"Channel 'mychannel' created Successfully"
}
```
* channelName : 新建应用通道名称
* channelConfigPath : 新建应用通道交易文件所在路径，用于指定通道成员、访问策略等
* 注意：该接口不对外开放，搭建inkchain网络时通道已经创建完成，无需调用
    
指定peers加入指定通道
---------------
    http:// + server_address + /join-channel
    
    curl -s -X POST 
      http://localhost:8081/join-channel 
      -H "content-type: application/json"
      -d "{
        "channelName":"mychannel",
        "peers":["peer1"]
    }"
    
```
// 成功返回
{
　　"status_code":200,
　　"data":"Successfully joined peers in organization org1 to the channel 'mychannel'"
}
```
* channelName : 指定加入通道名称
* peers : 要加入通道的peer列表
* 注意：该接口不对外开放，搭建inkchain网络是节点已经加入通道，无需调用

安装智能合约
----------
    http:// + server_address + /installcc
    
    curl -s -X POST 
      http://localhost:8081/installcc 
      -H "content-type: application/json" 
      -d "{
        "peers":["peer1","peer2"],
        "chaincodeName":"token",
        "chaincodePath":"$CC_SRC_PATH",
        "chaincodeVersion":"1.0"
    }"
    
```
// 成功返回
{
　　"status_code":200,
　　"data":"Successfully Installed chaincode on organization org1"
}
```
* peers : 链码安装的peer
* chaincodeName : 链码名称
* chaincodePath : 链码源码所在路径
* chaincodeVersion : 链码版本
* 注意：该接口不对外开放，初始搭建inkchain网络时已经安装token合约，用于转账、查询账户余额等。

实例化智能合约
----------
    http:// + server_address + /instantiatecc
    
    curl -s -X POST 
        http://localhost:8081/instantiatecc 
        -H "content-type: application/json" 
        -d "{
	        "chaincodeName":"token",
	        "chaincodeVersion":"1.0",
	        "channelName":"mychannel",
	        "fcn":"init",
	        "args":[]
    }"
    
```
// 成功返回
{
　　"status_code":200,
　　"data":"Chaincode Instantiation is SUCCESS"
}
```
* chaincodeName : 链码名称
* chaincodeVersion : 链码版本
* channelName : 应用通道名称
* fcn : 调用的函数名称，实例化调用用"init"
* args : 实例化传递的参数
* 注意：该接口不对外开放，搭建inkchain网络时已经部署token合约，无需调用

生成INK钱包账户(地址和私钥)
-----------------------
    http:// + server_address + /generate-account
    
    curl -s -X GET
    http://localhost:8081/generate-account

```
// 成功返回
{
　　"address":"i95077167070643129f8832bf9b266550b286bd0f",
　　"private_key":"043059bb6f5a2e7d8c848f4d1be73ef8065d0eb457b44d705c423d732f7dd396"
}
```
* address : 钱包账户地址
* private_key : 账户账户私钥

发行token
--------
	http:// + server_address + /issue-token
	
	curl -s -X POST
	http://localhost:8081/issue-token
	-H "content-type: application/json" 
        -d "{
	        "coin_name":"INK",
	        "totalSupply":"10000000",
	        "decimals":"12",
	        "publish_address":"i95077167070643129f8832bf9b266550b286bd0f"
	}"

```
// 成功返回
{
　　"status_code":200,
　　"data":"60f2168e09c93a0e7dac7d95e18b8217582bc39dd59a7abbf0f7340ef688c5fe"
}
// data是本次交易的tx_id
```
* coin_name : 发行token名称
* totalSupply : 发行数量
* decimals : 小数位
* publish_address : 发行token的账户
* 注意：该接口不对外开放，用户需要发行token，建议管理员内部操作(执行项目中的issuetoken)

转账
---
    http:// + server_address + /transfer
    
    curl -s -X POST 
    http://localhost:8081/transfer 
        -H "content-type: application/json" 
        -d "{
	        "to_address":"i3c97f146e8de9807ef723538521fcecd5f64c79a",
	        "from_address":"i95077167070643129f8832bf9b266550b286bd0f",
	        "coin_type":"tokenId",
	        "amount":"1000",
	        "message":"hello world",
            "counter":"sdk_counter",
	        "ink_limit":"100000",
	        "sig":"sig"
    }"

```
// 成功返回
{
　　"status_code":200,
　　"data":"6ab8c8561a97988b43f00a944547051198f6c0d90124921b6400fb0aa2b46063"
}
// data是本次交易的tx_id
```
* to_address : 转入地址
* from_address : 转出地址
* coin_type : 货币类型
* amount : 货币数量
* message : 存储信息
* counter : 交易计数，标识交易序号
* ink_limit : 消耗gas上限
* sig : 交易签名

查询用户交易次数
-------------
    http:// + server_address + /query-counter
    
    curl -s -X POST
    http://localhost:8081/query-counter
    -H "content-type: application/json"
    -d "{
    	"from_address":"i3c97f146e8de9807ef723538521fcecd5f64c79a"
    }"

```
// 成功返回    
{
    "status_code": 200,
    "data": "1"
}
```
* from_address : 用户地址
* 注意：从0开始计数，此接口用来交易签名时候的查询，交易签名方法，请看下文

查询账户信息
----------
    http:// + server_address + /get-account/:address
    
    curl -s -X GET
    http://localhost:8081/get-account/i95077167070643129f8832bf9b266550b286bd0f

```
// 成功返回    
{
　　"status_code":200,
　　"data":{
　　　　"INK":"999999999999999999993925000"
　　}
}
```
* address : 账户地址,账户中可能存在多种货币，信息包含各种货币及余额

查询账户中指定货币余额
----------
    http:// + server_address + /get-balance/:address/:coin_type
    
    curl -s -X GET
    http://localhost:8081/get-balance/i95077167070643129f8832bf9b266550b286bd0f/INK

```
// 成功返回    
{
　　"status_code":200,
　　"data":{
　　　　"INK":"999999999999999999993925000"
　　}
}
```
* address : 账户地址
* coin_type : 货币类型，如 “INK”

合约调用
------
    http:// + server_address + /invoke
    
    curl -s -X POST 
    http://localhost:8081/invoke 
        -H "content-type: application/json" 
        -d "{
	        "cc_id":"token",
	        "fcn":"transfer",
	        "args":["to_address", "INK", "1000"],
	        "sender":"sender",
	        "message":"msg",
            "ink_limit":"limit",
	        "counter":"counter",
	        "sig":"sig"
    }"
* cc_id : 链码名称，如："token"
* fcn : 调用链码函数名称
* args : 函数参数
* sender : 调用着地址
* message : 存储信息
* ink_limit : 消耗gas上限
* counter : 交易计数，标识交易序号
* sig : 交易签名

合约查询
-------
    http:// + server_address + /query
    
    curl -s -X POST 
    http://localhost:8081/query 
        -H "content-type: application/json" 
        -d "{
	        "cc_id":"token",
	        "fcn":"getbalance",
	        "args":["address", "coin_type"]
    }"
* cc_id : 链码名称，如："token"
* fcn : 查询链码函数名称
* args : 函数参数

Inkchain Explore SDK Api for Node.js
====================================

部署的智能合约信息
--------------
	http:// + server_address + /chaincodes
	
	curl -s -X GET 
	http://localhost:8081/chaincodes
	
```
// 成功返回    
{
　　"status_code":200,
　　"data":[
　　　　"name: token, version: 1.0, path: github.com/token"
　　]
}
```

区块高度
------------
	http:// + server_address + /block-heigth
	
	curl -s -X GET 
	http://localhost:8081/block-height
	
```
// 成功返回    
{
　　"status_code":200,
　　"data":4
}
```
* 当前的区块总数

交易总数
-------
	http:// + server_address + /transaction-count
	
	curl -s -X GET 
	http://localhost:8081/transaction-count
	
```
// 成功返回    
{
　　"status_code":200,
　　"data":4
}
```

区块列表
-------
	http:// + server_address + /block-list
	
	curl -s -X GET 
	http://localhost:8081/block-list
	
```
// 成功返回    
{
　　"status_code":200,
　　"data":[
　　　　{
　　　　　　"data_hash":"73f9d70ecad3a6e568d187570c5c18c60400db093c963b66a035eb07b22af048",
　　　　　　"number":3,
　　　　　　"datetime":"2018-03-25T14:01:04.000Z"
　　　　},
　　　　{
　　　　　　"data_hash":"1e66241fbd7464dcceb3b83532db7569bc613850ebf896112f6c4f7d7e846a79",
　　　　　　"number":2,
　　　　　　"datetime":"2018-03-25T13:50:45.000Z"
　　　　}
　　]
}
```
* 最新的10条block数据

交易列表
-------
	http:// + server_address + /tx-list
	
	curl -s -X GET 
	http://localhost:8081/tx-list

```
// 成功返回    
{
　　"status_code":200,
　　"data":[
　　　　{
　　　　　　"tx_id":"6ab8c8561a97988b43f00a944547051198f6c0d90124921b6400fb0aa2b46063",
　　　　　　"datetime":"2018-03-25T14:01:04.000Z"
　　　　},
　　　　{
　　　　　　"tx_id":"60f2168e09c93a0e7dac7d95e18b8217582bc39dd59a7abbf0f7340ef688c5fe",
　　　　　　"datetime":"2018-03-25T13:50:45.000Z"
　　　　}
　　]
}
```
* 最新的10条交易数据

历史交易
-------
	http:// + server_address + /tx-history
	
	curl -s -X GET
	http://localhost:8081/tx-history
	
```
// 成功返回   
{
　　"status_code":200,
　　"data":[
　　　　{
　　　　　　"datetime":"2018-03-24T16:00:00.000Z",
　　　　　　"count":4
　　　　}
　　]
}
```
* 最近14天每天的交易量统计，制作趋势图

查询区块
-------
	http:// + server_address + /block/hash/:block_hash
	
	curl -s -X GET 
	http://localhost:8081/block/hash/f4933756d54a92d6dfc60efe1bbadf12cbe1315654de7b6f50f847d702e294ac
	
	http:// + server_address + /block/number/:number
	
	curl -s -X GET
	http://localhost:8081/block/number/1
* block_hash ：根据block_hash查询区块信息
* number ：根据区块number查询区块信息

```
// 成功返回
      
{
　　"status_code":200,
　　"data":{
　　　　"header":{
　　　　　　"number":{
　　　　　　　　"low":3,
　　　　　　　　"high":0,
　　　　　　　　"unsigned":true
　　　　　　},
　　　　　　"previous_hash":"e4472878f82c960f808a4fb3948c2fa3860101ced844054110688eb5e90839a2",
　　　　　　"data_hash":"dac4cc98f48e397d15966fb25a87e36a693b9300b3e10a98876ca9528cc6b541"
　　　　},
　　　　"data":{
　　　　　　"data":[
　　　　　　　　{
　　　　　　　　　　"signature":"3045022100be0de048564005f82c1bb19ef0d816d269bb03d62dc2cf3b792f16cab02213d702203f7621ae9cddb2642612077934976c21fa2c789128bcdaccfc0e07e55b58dfa1",
　　　　　　　　　　"payload":{
　　　　　　　　　　　　"header":{
　　　　　　　　　　　　　　"channel_header":{
　　　　　　　　　　　　　　　　"type":"ENDORSER_TRANSACTION",
　　　　　　　　　　　　　　　　"version":3,
　　　　　　　　　　　　　　　　"timestamp":"Sun Mar 25 2018 16:57:23 GMT+0800 (CST)",
　　　　　　　　　　　　　　　　"channel_id":"mychannel",
　　　　　　　　　　　　　　　　"tx_id":"537ee3bda915c37691b8c3f7af3fe5441f14d868124ead55e80b5091b8227ff7",
　　　　　　　　　　　　　　　　"epoch":0,
　　　　　　　　　　　　　　　　"extension":"12071205746f6b656e"
　　　　　　　　　　　　　　},
　　　　　　　　　　　　　　"signature_header":{
　　　　　　　　　　　　　　　　"creator":{
　　　　　　　　　　　　　　　　　　"Mspid":"Org1MSP",
　　　　　　　　　　　　　　　　　　"IdBytes":"-----BEGIN CERTIFICATE-----
MIIB8TCCAZegAwIBAgIUGPB6nlSrXlq6HpW9IF8WATs3hxIwCgYIKoZIzj0EAwIw
czELMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNh
biBGcmFuY2lzY28xGTAXBgNVBAoTEG9yZzEuZXhhbXBsZS5jb20xHDAaBgNVBAMT
E2NhLm9yZzEuZXhhbXBsZS5jb20wHhcNMTgwMzI1MDg1MjAwWhcNMTkwMzI1MDg1
MjAwWjAQMQ4wDAYDVQQDEwV1c2VyMjBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IA
BLuZdv6uo1O43tV8VJJ2mzqkiwKjyl/QeSMGOt+bP0LuEEiLduMQM1vIbbLH3/CK
Sj2rILsZE4DFyLaKAoXpAmyjbDBqMA4GA1UdDwEB/wQEAwIHgDAMBgNVHRMBAf8E
AjAAMB0GA1UdDgQWBBQSTnh90cgXFfi7yrkhYHXIWYz7nTArBgNVHSMEJDAigCAO
cpIk6LPzF4TIqTxbjvb0wckdnm5XfEXDMWNgn+QAETAKBggqhkjOPQQDAgNIADBF
AiEAswH+WsK2T5hjktyIqjJWLrhHopLP5kE4yCxTe4UsY80CIA5bIgGKs0oYWIDF
iHfCYr6RLOa1KryFsHiJpvwnz6Um
-----END CERTIFICATE-----
"
　　　　　　　　　　　　　　　　},
　　　　　　　　　　　　　　　　"nonce":"930b27d1dabc25d476689b1cba34e1001cf8298b7eff072b"
　　　　　　　　　　　　　　}
　　　　　　　　　　　　},
　　　　　　　　　　　　"data":{
　　　　　　　　　　　　　　"actions":[
　　　　　　　　　　　　　　　　{
　　　　　　　　　　　　　　　　　　"header":{
　　　　　　　　　　　　　　　　　　　　"creator":{
　　　　　　　　　　　　　　　　　　　　　　"Mspid":"Org1MSP",
　　　　　　　　　　　　　　　　　　　　　　"IdBytes":"-----BEGIN CERTIFICATE-----
MIIB8TCCAZegAwIBAgIUGPB6nlSrXlq6HpW9IF8WATs3hxIwCgYIKoZIzj0EAwIw
czELMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNh
biBGcmFuY2lzY28xGTAXBgNVBAoTEG9yZzEuZXhhbXBsZS5jb20xHDAaBgNVBAMT
E2NhLm9yZzEuZXhhbXBsZS5jb20wHhcNMTgwMzI1MDg1MjAwWhcNMTkwMzI1MDg1
MjAwWjAQMQ4wDAYDVQQDEwV1c2VyMjBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IA
BLuZdv6uo1O43tV8VJJ2mzqkiwKjyl/QeSMGOt+bP0LuEEiLduMQM1vIbbLH3/CK
Sj2rILsZE4DFyLaKAoXpAmyjbDBqMA4GA1UdDwEB/wQEAwIHgDAMBgNVHRMBAf8E
AjAAMB0GA1UdDgQWBBQSTnh90cgXFfi7yrkhYHXIWYz7nTArBgNVHSMEJDAigCAO
cpIk6LPzF4TIqTxbjvb0wckdnm5XfEXDMWNgn+QAETAKBggqhkjOPQQDAgNIADBF
AiEAswH+WsK2T5hjktyIqjJWLrhHopLP5kE4yCxTe4UsY80CIA5bIgGKs0oYWIDF
iHfCYr6RLOa1KryFsHiJpvwnz6Um
-----END CERTIFICATE-----
"
　　　　　　　　　　　　　　　　　　　　},
　　　　　　　　　　　　　　　　　　　　"nonce":"930b27d1dabc25d476689b1cba34e1001cf8298b7eff072b"
　　　　　　　　　　　　　　　　　　},
　　　　　　　　　　　　　　　　　　"payload":{
　　　　　　　　　　　　　　　　　　　　"chaincode_proposal_payload":{
　　　　　　　　　　　　　　　　　　　　　　"input":{
　　　　　　　　　　　　　　　　　　　　　　　　"id_generation_alg":"",
　　　　　　　　　　　　　　　　　　　　　　　　"sig":"f5e5d4722a503612134342c0ba3c815e4951caa526ed4f2dc530587f823d61c36e282aed83ac7f0584240d55172b97eb175606e37b9731684359e3c00b466c3b01",
　　　　　　　　　　　　　　　　　　　　　　　　"chaincode_spec":{
　　　　　　　　　　　　　　　　　　　　　　　　　　"type":"GOLANG",
　　　　　　　　　　　　　　　　　　　　　　　　　　"chaincode_id":{
　　　　　　　　　　　　　　　　　　　　　　　　　　　　"path":"",
　　　　　　　　　　　　　　　　　　　　　　　　　　　　"name":"token",
　　　　　　　　　　　　　　　　　　　　　　　　　　　　"version":""
　　　　　　　　　　　　　　　　　　　　　　　　　　},
　　　　　　　　　　　　　　　　　　　　　　　　　　"input":{
　　　　　　　　　　　　　　　　　　　　　　　　　　　　"args":[
　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　"transfer",
　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　"i3c97f146e8de9807ef723538521fcecd5f64c79a",
　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　"INK",
　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　"1000"
　　　　　　　　　　　　　　　　　　　　　　　　　　　　]
　　　　　　　　　　　　　　　　　　　　　　　　　　},
　　　　　　　　　　　　　　　　　　　　　　　　　　"timeout":0
　　　　　　　　　　　　　　　　　　　　　　　　},
　　　　　　　　　　　　　　　　　　　　　　　　"sender_spec":{
　　　　　　　　　　　　　　　　　　　　　　　　　　"sender":"i411b6f8f24f28caafe514c16e11800167f8ebd89",
　　　　　　　　　　　　　　　　　　　　　　　　　　"counter":{
　　　　　　　　　　　　　　　　　　　　　　　　　　　　"low":0,
　　　　　　　　　　　　　　　　　　　　　　　　　　　　"high":0,
　　　　　　　　　　　　　　　　　　　　　　　　　　　　"unsigned":true
　　　　　　　　　　　　　　　　　　　　　　　　　　},
　　　　　　　　　　　　　　　　　　　　　　　　　　"ink_limit":"100000000",
　　　　　　　　　　　　　　　　　　　　　　　　　　"msg":"fasdf"
　　　　　　　　　　　　　　　　　　　　　　　　}
　　　　　　　　　　　　　　　　　　　　　　}
　　　　　　　　　　　　　　　　　　　　},
　　　　　　　　　　　　　　　　　　　　"action":{
　　　　　　　　　　　　　　　　　　　　　　"proposal_response_payload":{
　　　　　　　　　　　　　　　　　　　　　　　　"proposal_hash":"359ff70d2e5b2c0e94c854e6cc6eb88a5ce82252e69f2f88c6b6b009614d30f3",
　　　　　　　　　　　　　　　　　　　　　　　　"extension":{
　　　　　　　　　　　　　　　　　　　　　　　　　　"results":{
　　　　　　　　　　　　　　　　　　　　　　　　　　　　"TxRwSet":{
　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　"data_model":0,
　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　"ns_rwset":Array[2]
　　　　　　　　　　　　　　　　　　　　　　　　　　　　},
　　　　　　　　　　　　　　　　　　　　　　　　　　　　"Transet":Object{...}
　　　　　　　　　　　　　　　　　　　　　　　　　　},
　　　　　　　　　　　　　　　　　　　　　　　　　　"events":Object{...},
　　　　　　　　　　　　　　　　　　　　　　　　　　"response":{
　　　　　　　　　　　　　　　　　　　　　　　　　　　　"status":200,
　　　　　　　　　　　　　　　　　　　　　　　　　　　　"message":"",
　　　　　　　　　　　　　　　　　　　　　　　　　　　　"payload":""
　　　　　　　　　　　　　　　　　　　　　　　　　　}
　　　　　　　　　　　　　　　　　　　　　　　　}
　　　　　　　　　　　　　　　　　　　　　　},
　　　　　　　　　　　　　　　　　　　　　　"endorsements":[
　　　　　　　　　　　　　　　　　　　　　　　　{
　　　　　　　　　　　　　　　　　　　　　　　　　　"endorser":{
　　　　　　　　　　　　　　　　　　　　　　　　　　　　"Mspid":"Org1MSP",
　　　　　　　　　　　　　　　　　　　　　　　　　　　　"IdBytes":"-----BEGIN -----
MIICGDCCAb+gAwIBAgIQPcMFFEB/vq6mEL6vXV7aUTAKBggqhkjOPQQDAjBzMQsw
CQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5pYTEWMBQGA1UEBxMNU2FuIEZy
YW5jaXNjbzEZMBcGA1UEChMQb3JnMS5leGFtcGxlLmNvbTEcMBoGA1UEAxMTY2Eu
b3JnMS5leGFtcGxlLmNvbTAeFw0xNzA2MjMxMjMzMTlaFw0yNzA2MjExMjMzMTla
MFsxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMRYwFAYDVQQHEw1T
YW4gRnJhbmNpc2NvMR8wHQYDVQQDExZwZWVyMC5vcmcxLmV4YW1wbGUuY29tMFkw
EwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEzS9k2gCKHcat8Wj4T2nB1uyC8R2zg3um
xdTL7nmgFWp0uyCCbQQxD/VS+8R/3DNvEFkvzhcjc9NU/nRqMirpLqNNMEswDgYD
VR0PAQH/BAQDAgeAMAwGA1UdEwEB/wQCMAAwKwYDVR0jBCQwIoAgDnKSJOiz8xeE
yKk8W4729MHJHZ5uV3xFwzFjYJ/kABEwCgYIKoZIzj0EAwIDRwAwRAIgHBdxbHUG
rFUzKPX9UmmN3SwigWcRUREUy/GTb3hDIAsCIEF1BxTqv8ilQYE8ql0wJL4mTber
HE6DFYvvBCUnicUh
-----END -----
"
　　　　　　　　　　　　　　　　　　　　　　　　　　},
　　　　　　　　　　　　　　　　　　　　　　　　　　"signature":"3045022100ade6c84d5056737d8205cbc0304769644156dcb7f65e63b6316e051e6b1cc7ea0220142ad11827ba38536f8ea605cea592955e1b3862758471cbf15f6350c8f56cd1"
　　　　　　　　　　　　　　　　　　　　　　　　}
　　　　　　　　　　　　　　　　　　　　　　]
　　　　　　　　　　　　　　　　　　　　}
　　　　　　　　　　　　　　　　　　}
　　　　　　　　　　　　　　　　}
　　　　　　　　　　　　　　]
　　　　　　　　　　　　}
　　　　　　　　　　}
　　　　　　　　}
　　　　　　]
　　　　},
　　　　"metadata":{
　　　　　　"metadata":[
　　　　　　　　{
　　　　　　　　　　"value":"",
　　　　　　　　　　"signatures":[
　　　　　　　　　　　　{
　　　　　　　　　　　　　　"signature_header":{
　　　　　　　　　　　　　　　　"creator":{
　　　　　　　　　　　　　　　　　　"Mspid":"OrdererMSP",
　　　　　　　　　　　　　　　　　　"IdBytes":"-----BEGIN -----
MIICDTCCAbOgAwIBAgIRALFafJiTFN/47AvAGfvj1ZEwCgYIKoZIzj0EAwIwaTEL
MAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNhbiBG
cmFuY2lzY28xFDASBgNVBAoTC2V4YW1wbGUuY29tMRcwFQYDVQQDEw5jYS5leGFt
cGxlLmNvbTAeFw0xNzA2MjMxMjMzMTlaFw0yNzA2MjExMjMzMTlaMFgxCzAJBgNV
BAYTAlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMRYwFAYDVQQHEw1TYW4gRnJhbmNp
c2NvMRwwGgYDVQQDExNvcmRlcmVyLmV4YW1wbGUuY29tMFkwEwYHKoZIzj0CAQYI
KoZIzj0DAQcDQgAEYtguLKFBLLc0VSwyPHHHNe76HH71oOXK6wun8Y/5vtMawPZ/
WTm/vBVUWdfNlzc9eA28aXx6zBAB8iRm16EeU6NNMEswDgYDVR0PAQH/BAQDAgeA
MAwGA1UdEwEB/wQCMAAwKwYDVR0jBCQwIoAgDUbM8OlDbBvDtuK/gM2yAsSUNgT5
XHLuD/g50+wwBxkwCgYIKoZIzj0EAwIDSAAwRQIhANJuEGHBftrtlWgie9zgc60J
/XVytPN/D0rPlkMV17n7AiBBbStggGBfFYcQ2LhDhcKut8nScJ2OFrt+dJSdJbod
7A==
-----END -----
"
　　　　　　　　　　　　　　　　},
　　　　　　　　　　　　　　　　"nonce":"bbeaab175d6d04cc5603472feecbbb2989e071883c879701"
　　　　　　　　　　　　　　},
　　　　　　　　　　　　　　"signature":{
　　　　　　　　　　　　　　　　"type":"Buffer",
　　　　　　　　　　　　　　　　"data":Array[71]
　　　　　　　　　　　　　　}
　　　　　　　　　　　　}
　　　　　　　　　　]
　　　　　　　　},
　　　　　　　　{
　　　　　　　　　　"value":{
　　　　　　　　　　　　"index":{
　　　　　　　　　　　　　　"low":0,
　　　　　　　　　　　　　　"high":0,
　　　　　　　　　　　　　　"unsigned":true
　　　　　　　　　　　　}
　　　　　　　　　　},
　　　　　　　　　　"signatures":[
　　　　　　　　　　　　{
　　　　　　　　　　　　　　"signature_header":{
　　　　　　　　　　　　　　　　"creator":{
　　　　　　　　　　　　　　　　　　"Mspid":"OrdererMSP",
　　　　　　　　　　　　　　　　　　"IdBytes":"-----BEGIN -----
MIICDTCCAbOgAwIBAgIRALFafJiTFN/47AvAGfvj1ZEwCgYIKoZIzj0EAwIwaTEL
MAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNhbiBG
cmFuY2lzY28xFDASBgNVBAoTC2V4YW1wbGUuY29tMRcwFQYDVQQDEw5jYS5leGFt
cGxlLmNvbTAeFw0xNzA2MjMxMjMzMTlaFw0yNzA2MjExMjMzMTlaMFgxCzAJBgNV
BAYTAlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMRYwFAYDVQQHEw1TYW4gRnJhbmNp
c2NvMRwwGgYDVQQDExNvcmRlcmVyLmV4YW1wbGUuY29tMFkwEwYHKoZIzj0CAQYI
KoZIzj0DAQcDQgAEYtguLKFBLLc0VSwyPHHHNe76HH71oOXK6wun8Y/5vtMawPZ/
WTm/vBVUWdfNlzc9eA28aXx6zBAB8iRm16EeU6NNMEswDgYDVR0PAQH/BAQDAgeA
MAwGA1UdEwEB/wQCMAAwKwYDVR0jBCQwIoAgDUbM8OlDbBvDtuK/gM2yAsSUNgT5
XHLuD/g50+wwBxkwCgYIKoZIzj0EAwIDSAAwRQIhANJuEGHBftrtlWgie9zgc60J
/XVytPN/D0rPlkMV17n7AiBBbStggGBfFYcQ2LhDhcKut8nScJ2OFrt+dJSdJbod
7A==
-----END -----
"
　　　　　　　　　　　　　　　　},
　　　　　　　　　　　　　　　　"nonce":"963302b2360983ecca5437187f2bc8aeb2318e017a9a074f"
　　　　　　　　　　　　　　},
　　　　　　　　　　　　　　"signature":{
　　　　　　　　　　　　　　　　"type":"Buffer",
　　　　　　　　　　　　　　　　"data":Array[70]
　　　　　　　　　　　　　　}
　　　　　　　　　　　　}
　　　　　　　　　　]
　　　　　　　　},
　　　　　　　　Array[1]
　　　　　　]
　　　　}
　　}
}
```


查询交易
--------
	http:// + server_address + /get-transaction/:transaction_id
	
	curl -s -X GET
	http://localhost:8081/get-transaction/d551e95f4306d4ad3962c8bdb2e6a7c9ad92488ede1b4b48c6952f931da3f2bf
	
```
// 成功返回
{
　　"status_code":200,
　　"data":{
　　　　"validationCode":0,
　　　　"transactionEnvelope":{
　　　　　　"signature":"304402202218ca0e86f6446ffbdf6a22176837fb3103026139464032f1732a0b812a708d02205e4f45889fa57386e9dadc6613bd05087662fab15a8febbf4e03d1e983196dfb",
　　　　　　"payload":{
　　　　　　　　"header":{
　　　　　　　　　　"channel_header":{
　　　　　　　　　　　　"type":"ENDORSER_TRANSACTION",
　　　　　　　　　　　　"version":3,
　　　　　　　　　　　　"timestamp":"Sun Mar 25 2018 17:07:57 GMT+0800 (CST)",
　　　　　　　　　　　　"channel_id":"mychannel",
　　　　　　　　　　　　"tx_id":"d551e95f4306d4ad3962c8bdb2e6a7c9ad92488ede1b4b48c6952f931da3f2bf",
　　　　　　　　　　　　"epoch":0,
　　　　　　　　　　　　"extension":"12071205746f6b656e"
　　　　　　　　　　},
　　　　　　　　　　"signature_header":{
　　　　　　　　　　　　"creator":{
　　　　　　　　　　　　　　"Mspid":"Org1MSP",
　　　　　　　　　　　　　　"IdBytes":"-----BEGIN CERTIFICATE-----
MIIB8TCCAZegAwIBAgIUGPB6nlSrXlq6HpW9IF8WATs3hxIwCgYIKoZIzj0EAwIw
czELMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNh
biBGcmFuY2lzY28xGTAXBgNVBAoTEG9yZzEuZXhhbXBsZS5jb20xHDAaBgNVBAMT
E2NhLm9yZzEuZXhhbXBsZS5jb20wHhcNMTgwMzI1MDg1MjAwWhcNMTkwMzI1MDg1
MjAwWjAQMQ4wDAYDVQQDEwV1c2VyMjBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IA
BLuZdv6uo1O43tV8VJJ2mzqkiwKjyl/QeSMGOt+bP0LuEEiLduMQM1vIbbLH3/CK
Sj2rILsZE4DFyLaKAoXpAmyjbDBqMA4GA1UdDwEB/wQEAwIHgDAMBgNVHRMBAf8E
AjAAMB0GA1UdDgQWBBQSTnh90cgXFfi7yrkhYHXIWYz7nTArBgNVHSMEJDAigCAO
cpIk6LPzF4TIqTxbjvb0wckdnm5XfEXDMWNgn+QAETAKBggqhkjOPQQDAgNIADBF
AiEAswH+WsK2T5hjktyIqjJWLrhHopLP5kE4yCxTe4UsY80CIA5bIgGKs0oYWIDF
iHfCYr6RLOa1KryFsHiJpvwnz6Um
-----END CERTIFICATE-----
"
　　　　　　　　　　　　},
　　　　　　　　　　　　"nonce":"66e4e4c883d4ac46fb09afa3564f6d35b71e2985d9bacf1a"
　　　　　　　　　　}
　　　　　　　　},
　　　　　　　　"data":{
　　　　　　　　　　"actions":[
　　　　　　　　　　　　{
　　　　　　　　　　　　　　"header":{
　　　　　　　　　　　　　　　　"creator":{
　　　　　　　　　　　　　　　　　　"Mspid":"Org1MSP",
　　　　　　　　　　　　　　　　　　"IdBytes":"-----BEGIN CERTIFICATE-----
MIIB8TCCAZegAwIBAgIUGPB6nlSrXlq6HpW9IF8WATs3hxIwCgYIKoZIzj0EAwIw
czELMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNh
biBGcmFuY2lzY28xGTAXBgNVBAoTEG9yZzEuZXhhbXBsZS5jb20xHDAaBgNVBAMT
E2NhLm9yZzEuZXhhbXBsZS5jb20wHhcNMTgwMzI1MDg1MjAwWhcNMTkwMzI1MDg1
MjAwWjAQMQ4wDAYDVQQDEwV1c2VyMjBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IA
BLuZdv6uo1O43tV8VJJ2mzqkiwKjyl/QeSMGOt+bP0LuEEiLduMQM1vIbbLH3/CK
Sj2rILsZE4DFyLaKAoXpAmyjbDBqMA4GA1UdDwEB/wQEAwIHgDAMBgNVHRMBAf8E
AjAAMB0GA1UdDgQWBBQSTnh90cgXFfi7yrkhYHXIWYz7nTArBgNVHSMEJDAigCAO
cpIk6LPzF4TIqTxbjvb0wckdnm5XfEXDMWNgn+QAETAKBggqhkjOPQQDAgNIADBF
AiEAswH+WsK2T5hjktyIqjJWLrhHopLP5kE4yCxTe4UsY80CIA5bIgGKs0oYWIDF
iHfCYr6RLOa1KryFsHiJpvwnz6Um
-----END CERTIFICATE-----
"
　　　　　　　　　　　　　　　　},
　　　　　　　　　　　　　　　　"nonce":"66e4e4c883d4ac46fb09afa3564f6d35b71e2985d9bacf1a"
　　　　　　　　　　　　　　},
　　　　　　　　　　　　　　"payload":{
　　　　　　　　　　　　　　　　"chaincode_proposal_payload":{
　　　　　　　　　　　　　　　　　　"input":{
　　　　　　　　　　　　　　　　　　　　"id_generation_alg":"",
　　　　　　　　　　　　　　　　　　　　"sig":"cadbbf48e4201932de2ab801c5426982f304759674b29e5d39e8118223bad0673c2988a46e1fe8beb24990f275b813f6437b25a42a5c2f568f9f5e17684b49a200",
　　　　　　　　　　　　　　　　　　　　"chaincode_spec":{
　　　　　　　　　　　　　　　　　　　　　　"type":"GOLANG",
　　　　　　　　　　　　　　　　　　　　　　"chaincode_id":{
　　　　　　　　　　　　　　　　　　　　　　　　"path":"",
　　　　　　　　　　　　　　　　　　　　　　　　"name":"token",
　　　　　　　　　　　　　　　　　　　　　　　　"version":""
　　　　　　　　　　　　　　　　　　　　　　},
　　　　　　　　　　　　　　　　　　　　　　"input":{
　　　　　　　　　　　　　　　　　　　　　　　　"args":[
　　　　　　　　　　　　　　　　　　　　　　　　　　"transfer",
　　　　　　　　　　　　　　　　　　　　　　　　　　"i3c97f146e8de9807ef723538521fcecd5f64c79a",
　　　　　　　　　　　　　　　　　　　　　　　　　　"INK",
　　　　　　　　　　　　　　　　　　　　　　　　　　"1000"
　　　　　　　　　　　　　　　　　　　　　　　　]
　　　　　　　　　　　　　　　　　　　　　　},
　　　　　　　　　　　　　　　　　　　　　　"timeout":0
　　　　　　　　　　　　　　　　　　　　},
　　　　　　　　　　　　　　　　　　　　"sender_spec":{
　　　　　　　　　　　　　　　　　　　　　　"sender":"i411b6f8f24f28caafe514c16e11800167f8ebd89",
　　　　　　　　　　　　　　　　　　　　　　"counter":{
　　　　　　　　　　　　　　　　　　　　　　　　"low":24,
　　　　　　　　　　　　　　　　　　　　　　　　"high":0,
　　　　　　　　　　　　　　　　　　　　　　　　"unsigned":true
　　　　　　　　　　　　　　　　　　　　　　},
　　　　　　　　　　　　　　　　　　　　　　"ink_limit":"100000000",
　　　　　　　　　　　　　　　　　　　　　　"msg":"fasdf"
　　　　　　　　　　　　　　　　　　　　}
　　　　　　　　　　　　　　　　　　}
　　　　　　　　　　　　　　　　},
　　　　　　　　　　　　　　　　"action":{
　　　　　　　　　　　　　　　　　　"proposal_response_payload":{
　　　　　　　　　　　　　　　　　　　　"proposal_hash":"4701c321036b40d84f1aa455049405213182cc451298d0c05e6b76a7072296dc",
　　　　　　　　　　　　　　　　　　　　"extension":{
　　　　　　　　　　　　　　　　　　　　　　"results":{
　　　　　　　　　　　　　　　　　　　　　　　　"TxRwSet":{
　　　　　　　　　　　　　　　　　　　　　　　　　　"data_model":0,
　　　　　　　　　　　　　　　　　　　　　　　　　　"ns_rwset":Array[2]
　　　　　　　　　　　　　　　　　　　　　　　　},
　　　　　　　　　　　　　　　　　　　　　　　　"Transet":Object{...}
　　　　　　　　　　　　　　　　　　　　　　},
　　　　　　　　　　　　　　　　　　　　　　"events":Object{...},
　　　　　　　　　　　　　　　　　　　　　　"response":{
　　　　　　　　　　　　　　　　　　　　　　　　"status":200,
　　　　　　　　　　　　　　　　　　　　　　　　"message":"",
　　　　　　　　　　　　　　　　　　　　　　　　"payload":""
　　　　　　　　　　　　　　　　　　　　　　}
　　　　　　　　　　　　　　　　　　　　}
　　　　　　　　　　　　　　　　　　},
　　　　　　　　　　　　　　　　　　"endorsements":[
　　　　　　　　　　　　　　　　　　　　{
　　　　　　　　　　　　　　　　　　　　　　"endorser":{
　　　　　　　　　　　　　　　　　　　　　　　　"Mspid":"Org1MSP",
　　　　　　　　　　　　　　　　　　　　　　　　"IdBytes":"-----BEGIN -----
MIICGDCCAb+gAwIBAgIQPcMFFEB/vq6mEL6vXV7aUTAKBggqhkjOPQQDAjBzMQsw
CQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5pYTEWMBQGA1UEBxMNU2FuIEZy
YW5jaXNjbzEZMBcGA1UEChMQb3JnMS5leGFtcGxlLmNvbTEcMBoGA1UEAxMTY2Eu
b3JnMS5leGFtcGxlLmNvbTAeFw0xNzA2MjMxMjMzMTlaFw0yNzA2MjExMjMzMTla
MFsxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMRYwFAYDVQQHEw1T
YW4gRnJhbmNpc2NvMR8wHQYDVQQDExZwZWVyMC5vcmcxLmV4YW1wbGUuY29tMFkw
EwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEzS9k2gCKHcat8Wj4T2nB1uyC8R2zg3um
xdTL7nmgFWp0uyCCbQQxD/VS+8R/3DNvEFkvzhcjc9NU/nRqMirpLqNNMEswDgYD
VR0PAQH/BAQDAgeAMAwGA1UdEwEB/wQCMAAwKwYDVR0jBCQwIoAgDnKSJOiz8xeE
yKk8W4729MHJHZ5uV3xFwzFjYJ/kABEwCgYIKoZIzj0EAwIDRwAwRAIgHBdxbHUG
rFUzKPX9UmmN3SwigWcRUREUy/GTb3hDIAsCIEF1BxTqv8ilQYE8ql0wJL4mTber
HE6DFYvvBCUnicUh
-----END -----
"
　　　　　　　　　　　　　　　　　　　　　　},
　　　　　　　　　　　　　　　　　　　　　　"signature":"30440220309564876918df7387095654ffdc65a5bae48a7fa1bc24ff01cff7914322462902206df9f5648748fe32425e0193930d65eab8b40437035704c2bdba7e910746479f"
　　　　　　　　　　　　　　　　　　　　}
　　　　　　　　　　　　　　　　　　]
　　　　　　　　　　　　　　　　}
　　　　　　　　　　　　　　}
　　　　　　　　　　　　}
　　　　　　　　　　]
　　　　　　　　}
　　　　　　}
　　　　},
　　　　"blockHash":"39cd78be54e1ffb03dc15586970a6816342c4864a9e37a22b8c777beee9f933c",
　　　　"inkFee":"6400000"
　　}
}
```
* transaction_id : 要查询的交易id

全部区块分页显示
--------------
	http:// + server_address + /block-page/:page
	
	curl -s -X GET
	http://localhost:8081/block-page/1

```
// 成功返回
{
　　"status_code":200,
　　"totalPages":1,
　　"currentPage":"1",
　　"data":[
　　　　{
　　　　　　"data_hash":"fc38d5768d7810d5a68ed3a50b7fe581426679a791c4679bbcee25ef4331ed6d",
　　　　　　"number":1,
　　　　　　"datetime":"2018-03-25T13:13:36.000Z"
　　　　},
　　　　{
　　　　　　"data_hash":"f4933756d54a92d6dfc60efe1bbadf12cbe1315654de7b6f50f847d702e294ac",
　　　　　　"number":0,
　　　　　　"datetime":"2018-03-25T12:59:57.000Z"
　　　　}
　　]
}
```
* page : 显示第几页，每页10条

全部交易分页显示
--------------
	http:// + server_address + /tx-page/:page
	
	curl -s -X GET
	http://localhost:8081/tx-page/1

```
// 成功返回
{
　　"status_code":200,
　　"totalPages":1,
　　"currentPage":"1",
　　"data":[
　　　　{
　　　　　　"tx_id":"495ae62813a7c0f63203599e170d30f457bbc39bb0675dad402ddb3bf1379261",
　　　　　　"datetime":"2018-03-25T13:13:36.000Z"
　　　　},
　　　　{
　　　　　　"tx_id":"",
　　　　　　"datetime":"2018-03-25T12:59:57.000Z"
　　　　}
　　]
}
```
* page : 显示第几页，每页10条

Inkchain Transction Sign SDK for Node.js
========================================
```
let _ccProto = grpc.load('xxx/chaincode.proto').protos;
let ethUtils = require('ethereumjs-util');
const Long = require('long');
function signTX(ccId, fcn, arg, msg, counter, inkLimit, priKey) {
    let args = [];
    let senderAddress = ethUtils.privateToAddress(new Buffer(priKey, "hex"));
    let senderSpec = {
        sender: Buffer.from(settingsConfig.AddressPrefix + senderAddress.toString("hex")),
        counter: Long.fromString(counter.toString()),
        ink_limit: Buffer.from(inkLimit),
        msg: Buffer.from(msg)
    };
    args.push(Buffer.from(fcn ? fcn : 'invoke', 'utf8'));
    for (let i=0; i<arg.length; i++) {
        args.push(Buffer.from(arg[i], 'utf8'));
    }
    let invokeSpec = {
        type: _ccProto.ChaincodeSpec.Type.GOLANG,
        chaincode_id: {
            name: ccId
        },
        input: {
            args: args
        }
    };
    let cciSpec = new _ccProto.ChaincodeInvocationSpec();
    let signContent = new _ccProto.SignContent();
    signContent.setChaincodeSpec(invokeSpec);
    signContent.setSenderSpec(senderSpec);
    signContent.id_generation_alg = cciSpec.id_generation_alg;
    let signHash = ethUtils.sha256(signContent.toBuffer());
    let sigrsv = ethUtils.ecsign(signHash, new Buffer(priKey, "hex"));

    return Buffer.concat([
        ethUtils.setLengthLeft(sigrsv.r, 32),
        ethUtils.setLengthLeft(sigrsv.s, 32),
        ethUtils.toBuffer(sigrsv.v - 27)
    ]);
}
```

Inkchain Transction Sign SDK for JAVA
======================================
```
package com.sign;

import com.google.protobuf.ByteString;
import org.web3j.crypto.*;
import org.web3j.utils.Numeric;

import java.math.BigInteger;
import java.util.Arrays;

public class SignTx {

    private byte[] concat(byte[] b1, byte[] b2) {
        byte[] result = Arrays.copyOf(b1, b1.length + b2.length);
        System.arraycopy(b2, 0, result, b1.length, b2.length);
        return result;
    }
    
    //@param ccId: 链码名称
    //@param fcn : 调用链码函数名
    //@param args : 函数参数
    //@param msg : 需要存储在链上的信息
    //@param counter : 用户的调用计数
    //@param inklimit : 本次交易需要消耗的最大gas消耗上线,超过交易失败
    //@param prikey : 用户私钥
    public String getSign(String ccId, String fcn,String[] args,String msg,long counter,String inkLimit,String priKey) {

        BigInteger pubKey = Sign.publicKeyFromPrivate(new BigInteger(Numeric.cleanHexPrefix(priKey), 16));
        String signerAddress = 'i' + Keys.getAddress(pubKey);

        Chaincode.ChaincodeInput.Builder input = Chaincode.ChaincodeInput.newBuilder();
        input.addArgs(ByteString.copyFromUtf8(fcn != null ? fcn : "invoke"));
        for(String arg : args){
            input.addArgs(ByteString.copyFromUtf8(arg));
        }

        Chaincode.SignContent.Builder builder = Chaincode.SignContent.newBuilder();
        Chaincode.ChaincodeSpec ccSpec = Chaincode.ChaincodeSpec.newBuilder().setType(Chaincode.ChaincodeSpec.Type.GOLANG)
                .setChaincodeId(Chaincode.ChaincodeID.newBuilder().setName(ccId).build())
                .setInput(input.build()).build();

        Chaincode.ChaincodeInvocationSpec.Builder cciSpec = Chaincode.ChaincodeInvocationSpec.newBuilder();

        Chaincode.SenderSpec senderSpec = Chaincode.SenderSpec.newBuilder().setSender(ByteString.copyFromUtf8(signerAddress))
                .setCounter(counter).setInkLimit(ByteString.copyFromUtf8(inkLimit)).setMsg(ByteString.copyFromUtf8(msg)).build();

        builder.setChaincodeSpec(ccSpec);
        builder.setIdGenerationAlg(cciSpec.getIdGenerationAlg());
        builder.setSenderSpec(senderSpec);

        // Message to sign
        byte[] hexMessage = Hash.sha256(builder.build().toByteArray());

        // Use java to sign
        Credentials credentials = Credentials.create(priKey);
        Sign.SignatureData signMessage = Sign.signMessage(hexMessage, credentials.getEcKeyPair(), false);

        // Now use java signature to verify from the blockchain
        byte[] v = Numeric.toBytesPadded(BigInteger.valueOf(signMessage.getV()-27), 1);
        byte[] result = concat(concat(signMessage.getR(), signMessage.getS()), v);

        return  Numeric.cleanHexPrefix(Numeric.toHexString(result));
    }
}
```

案例一：转账
----------
	// 返回十六进制签名字符串
	String sign = new SignTx().getSign("token","transfer", new String[]{"i3c97f146e8de9807ef723538521fcecd5f64c79a", "INK", "10000"},"test",1,"100000000000","bab0c1204b2e7f344f9d1fbe8ad978d5355e32b8fa45b10b600d64ca970e0dc9");
 	
	request:
	curl -s -X POST 
	http://localhost:8081/transfer
	-H "content-type: application/json"
	-d "{
		"to_address": "i3c97f146e8de9807ef723538521fcecd5f64c79a",
		"from_address": "i411b6f8f24f28caafe514c16e11800167f8ebd89",
		"coin_type": "INK",
		"amount": "10000",
		"message": "test",
		"counter": "1",
		"ink_limit": "100000000000",
		"sig":sign
	}"
	
	// 成功返回
	{
		"status_code": 200,
		"data": "d5904cb74d5b5f2ceb436a27c70e92c16e4c1bb7d040e47ccafda6e6a1323330"
	}
	

案例二：invoke调用
----------------
	// 返回十六进制签名字符串
	String sign = new SignTx().getSign("token","transfer", new String[]{"i3c97f146e8de9807ef723538521fcecd5f64c79a", "INK", "10000"},"test",1,"100000000000","bab0c1204b2e7f344f9d1fbe8ad978d5355e32b8fa45b10b600d64ca970e0dc9");
	
	request:
	curl -s -X POST 
	http://localhost:8081/invoke
	-H "content-type: application/json"
	-d "{
		"cc_id": "token",
		"fcn": "transfer",
		"sender": "i411b6f8f24f28caafe514c16e11800167f8ebd89",
		"args": ["i3c97f146e8de9807ef723538521fcecd5f64c79a", "INK", "10000"],
		"message": "test",
		"counter": "1",
		"ink_limit": "100000000000",
		"sig": sig
	}"
	
	// 成功返回
	{
		"status_code": 200,
		"data": "d5904cb74d5b5f2ceb436a27c70e92c16e4c1bb7d040e47ccafda6e6a1323330"
	}
	
* 签名数据要和请求数据保持一致 
* counter记录的是发起交易的用户当前总共交易次数，需要先调用query-counter接口(见上文API)，得到counter
	
SDK使用总结:
==========
* 如果用户还没有账号，调用生成INK钱包账的API(generate-account),获得账号的address和private_key
* 用户发行token，此接口一般不对外开放，管理员内部操作，用生成的账户地址发行
* 用户发行成功后，可在外部调用转账接口，例如：从发行token的账户地址向另一个账户地址转账
* 合约的invoke调用，如果用户在区块链网络中部署了业务相关的智能合约，可以通过invoke接口，调用合约函数，注意参数有个交易签名，可调用提供的SDK获得
* 合约query查询，如果用户在区块链网络中部署了业务相关的智能合约，可以通过query接口，查询合约信息
* 浏览器接口提供了区块链网络数据的查询，可根据接口，自定义浏览器内容
