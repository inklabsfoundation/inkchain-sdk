## INKchain Network Api

### 请求响应数据
```
POST/GET status_code

200: 成功  {"status_code":200,"data":XXX}
500: 失败  {"status_code":500,"error":XXX}
```
### 新建应用通道
拥有创建通道权限的组织管理员身份才能调用此接口，**该接口一般不对外开放，搭建inkchain网络时通道已经创建完成，无需调用**。
#### Example request
```curl
curl -s -X POST
    http://{server_address}/create-channel
    -H "content-type: application/json"
    -d "{
        "channelName":{channel_name},
        "channelConfigPath":{config_path}
}"
```
#### Example request body
```json
{
    "channelName":"mychannel",
    "channelConfigPath":"XXX/mychannel.tx"
}
```
Property | Description
---|---
`channelName` | 新建应用通道的名称
`channelConfigPath` | 新建应用通道交易文件所在路径，用于指定通道成员、访问策略等

#### Example response
```json
{
    "status_code":200,
    "data":"Channel 'mychannel' created Successfully"
}
```

 ### 加入应用通道
让指定的Peer节点加入到指定的应用通道，需要提前拥有所加入应用通道的出事区块文件，并且只有属于通道的某个组织的管理员身份可以执行执行该操作。**该接口一般不对外开放，搭建inkchain网络时节点已经加入应用通道，无需调用**。

#### Example request
```curl
curl -s -X POST
    http://{server_address}/join-channel
    -H "content-type: application/json"
    -d "{
        "channelName":{channel_name},
        "peers":{peer_list}
}"
```
#### Example request body
```json
{
    "channelName":"mychannel",
    "peers":["peer1","peer2"]
}
```
Property | Description
---|---
`channelName` | 指定加入的应用通道名称
`peers` | 要加入应用通道的Peer列表
#### Example response
```json
{
    "status_code":200,
    "data":"Successfully joined peers in organization org1 to the channel 'mychannel'"
}
```

### 安装智能合约
将链码(即智能合约)的源码和环境等内容封装为一个链码安装打包文件，并传输给背书节点。**该接口一般不对外开放，搭建inkchain网络时已经安装token合约，用于转账、查询账户余额等**
#### Example request
```curl
curl -s -X POST
  http://{server_address}/installcc
  -H "content-type: application/json"
  -d "{
    "peers":{peer_list},
    "chaincodeName":{token_name},
    "chaincodePath":{CC_SRC_PATH},
    "chaincodeVersion":{cc_version}
}"
```
#### Example request body
```curl
{
    "peers":["peer1","peer2"],
    "chaincodeName":"token",
    "chaincodePath":"XXX/src/github.com/token/token.go",
    "chaincodeVersion":"1.0"
}
```
Property | Description
---|---
`peers` | 指定在哪些Peer上安装链码
`chaincodeName` | 链码名称
`chaincodePath` | 链码源码所在路径
`chaincodeVersion` | 链码版本
#### Example response
```json
{
    "status_code":200,
    "data":"Successfully Installed chaincode on organization org1"
}
```

### 实例化智能合约
通过构造生命周期管理系统链码(LSCC)的交易，将安装过的链码在指定通道上进行实例化调用，在节点上创建容器启动，并执行初始化操作。**该接口一般不对外开放，搭建inkchain网络时已经实例化token合约，无需调用**。
#### Example request
```curl
curl -s -X POST
    http://{server_address}/instantiatecc
    -H "content-type: application/json"
    -d "{
        "chaincodeName":{token_name},
        "chaincodeVersion":{cc_version},
        "channelName":{channel_name},
        "fcn":{fcn_name},
        "args":{args_array}
}"
```
#### Example request body
```json
{
    "chaincodeName":"token",
    "chaincodeVersion":"1.0",
    "channelName":"mychannel",
    "fcn":"init",
    "args":[]
}
```
Property | Description
---|---
`chaincodeName` | 链码名称
`chaincodeVersion` | 链码版本
`channelName` | 应用通道名称
`fcn` | 调用的函数名称，实例化调用"init"
`args` | init函数的参数
#### Example response
```json
{
    "status_code":200,
    "data":"Chaincode Instantiation is SUCCESS"
}
```

### 账户生成
生成十六进制的地址和私钥，地址是公开的，私钥是私有的，向别人转账，需要提供私钥；向你转账，你需要提供给对方地址。
#### Example request
```curl
curl -s -X GET http://{server_address}/generate-account
```
#### Example response
```json
{
    "address":"i95077167070643129f8832bf9b266550b286bd0f",
    "private_key":"043059bb6f5a2e7d8c848f4d1be73ef8065d0eb457b44d705c423d732f7dd396"
}
```
* address : 账户地址
* private_key : 账户私钥

### 发行通证
INKchain集成了账户和通证体系，可以发行通证，在账户间转账流通。**只有属于通道的某个组织的管理员身份可以执行执行该操作。该接口一般不对外开放**。
#### Example request
```curl
curl -s -X POST
http://{server_address}/issue-token
-H "content-type: application/json"
    -d "{
        "coin_name":{token_name},
        "totalSupply":{total_number},
        "decimals":{decimals},
        "publish_address":{user_address}
}"
```
#### Example request body
```json
{
    "coin_name":"INK",
    "totalSupply":"10000000",
    "decimals":"12",
    "publish_address":"i95077167070643129f8832bf9b266550b286bd0f"
}
```
Property | Description
---|---
`coin_name` | 通证合约应该被知道的符号，比如“INK”，虽然没有严格的长度限制，但它在长度上常常是3或4个字母
`totalSupply` | 它是通证合约唯一的强制参数。总供给等于所有账户余额的和
`decimals` | 小数位影响着通证的创建，被创建的数量应该等于通证的全部数量，全部数量=10^小位数*N。例如：通证ABC的小数位为9，发行10亿个，则发行的ABC总数 = 10 (10^8) (10^9)
`publish_address` | 发行通证的账户，成功后，所有的token都存放在该账户余额上
#### Example response
```json
{
    "status_code":200,
    "data":"60f2168e09c93a0e7dac7d95e18b8217582bc39dd59a7abbf0f7340ef688c5fe"
}
// data是本次交易的tx_id
```
* 发行通证也是一笔交易，返回的data是tx_id

### 转账
#### Example request
```curl
curl -s -X POST
    http://{server_address}/transfer
    -H "content-type: application/json"
    -d "{
        "to_address":{receiver},
        "from_address":{sender},
        "coin_type":{toke_name},
        "amount":{number},
        "message":{msg_str},
        "counter":{sdk_counter},
        "ink_limit":{limit_umber},
        "sig":{sig}
}"
```
#### Example request body
```json
{
    "to_address":"i95077167070643129f8832bf9b266550b286bd0f",
    "from_address":"ie59c0c57ede9c4f52d907d1c246d342c2dddef36",
    "coin_type":"tokenId",
    "amount":"1000",
    "message":"hello world",
    "counter":"0",
    "ink_limit":"100000000",
    "sig":"92c441b0bccb614eded6d11e8077f48809192ecb7d49723c70b1d9f33ee762351a2e7f85e9e293fa2e578bdfbe91a6b25b346200d7118af64a26cfa31e1e2fc301"
}
```
Property | Description
---|---
`to_address` | 转入地址
`from_address` | 转出地址
`coin_type` | 转账的通证类型
`amount` | 转账数量
`message` | 存储信息，一些数据可以存储在链上，可以在交易信息的msg字段中得到
`counter` | 转出地址的交易数
`ink_limit` | 发送此笔交易消耗的费用上限，如果超过了上限，交易失败
`sig` | 交易签名，详情见本文的交易签名说明
#### Example response
```json
{
    "status_code":200,
    "data":"6ab8c8561a97988b43f00a944547051198f6c0d90124921b6400fb0aa2b46063"
}
```
* data是本次转账交易的tx_id

### 查询交易数
每个地址都有一个累加的交易数，作为签名参数，用户发送交易，需顺序累加交易数，防止双花。
#### Example request
```curl
curl -s -X POST
    http://{server_address}/query-counter
    -H "content-type: application/json"
    -d "{
    	"from_address":{user_address}
}"
```
#### Example request body
```json
{
    "from_address":"i3c97f146e8de9807ef723538521fcecd5f64c79a"
}
```
Property | Description
---|---
`from_address` | 要查询交易数的地址
#### Example response
```json
{
    "status_code": 200,
    "data": "1"
}
```
* data为交易数

### 合约调用
#### Example request
```curl
curl -s -X POST
    http://{server_address}/invoke
    -H "content-type: application/json"
    -d "{
        "cc_id":{token_name},
        "fcn":{fcn_name},
        "args":{args_array},
        "sender":{sender_address},
        "message":{msg_str},
        "ink_limit":{limit_number},
        "counter":{sdk_counter},
        "sig":{sig}
}"
```
#### Example request body
```json
{
    "cc_id":"token",
    "fcn":"transfer",
    "args":["i3c97f146e8de9807ef723538521fcecd5f64c79a", "INK", "1000"],
    "sender":"i95077167070643129f8832bf9b266550b286bd0f",
    "message":"hello world",
    "ink_limit":"100000000",
    "counter":"100",
    "sig":"92c441b0bccb614eded6d11e8077f48809192ecb7d49723c70b1d9f33ee762351a2e7f85e9e293fa2e578bdfbe91a6b25b346200d7118af64a26cfa31e1e2fc301"
}
```
Property | Description
---|---
`cc_id` | 链码名称，如："token"
`fcn` | 要调用的链码函数名称, 如："transfer"为token合约的转账函数
`args` | 要调用的链码函数参数，示例中的参数是"transfer"函数的参数：转入地址,转出币种类型，转出数量
`sender` | 调用者的地址
`message` | 存储信息，一些数据可以存储在链上，可以在交易信息的msg字段中得到
`ink_limit` | 发送此笔交易消耗的费用上限，如果超过了上限，交易失败
`counter` | 调用者的交易数
`sig` | 交易签名
#### Example response
```json
{
    "status_code":200,
    "data":"6ab8c8561a97988b43f00a944547051198f6c0d90124921b6400fb0aa2b46063"
}
```
* 合约调用也是一笔交易，data是本次调用交易的tx_id

### 合约查询
#### Example request
```curl
curl -s -X POST
http://{server_address}/query
    -H "content-type: application/json"
    -d "{
        "cc_id":{toke_name},
        "fcn":{fcn_name},
        "args":{args_array}
}"
```
#### Example request body
```json
{
    "cc_id":"token",
    "fcn":"getbalance",
    "args":["i3c97f146e8de9807ef723538521fcecd5f64c79a", "INK"]
}
```
Property | Description
---|---
`cc_id` | 链码名称，如："token"
`fcn` | 链码的查询函数名称， 如："getbalance"为token合约的查询余额的函数
`args` | 链码的查询函数参数，示例中的参数是"getbalance"函数的参数：要查询的用户地址,币种类型
#### Example response
```json
{
    "status_code":200,
    "data":{
        "INK":"999999999999999999993925000"
    }
}
```

### 查询账户
#### Example request
```curl
curl -s -X GET http://{server_address}/get-account/{user_address}
```
#### Example request params
```json
http://localhost/get-account/i3c97f146e8de9807ef723538521fcecd5f64c79a
```
Property | Description
---|---
`user_address` | 查询的账户地址
#### Example response
```json
{
    "status_code":200,
    "data":{
        "INK":"999999999999999999993925000"
    }
}
```
* data：查询得到的user_address中所有持有的token类型及其数量

### 查询余额
#### Example request
```curl
curl -s -X GET http://{server_address}/get-balance/{user_address}/{coin_type}
```
#### Example request params
```json
http://localhost/get-balance/i3c97f146e8de9807ef723538521fcecd5f64c79a/INK
```
Property | Description
---|---
`user_address` | 查询的账户地址
`coin_type` | 查询持有的币种类型，如:INK
#### Example response
```json
{
    "status_code":200,
    "data":{
        "INK":"999999999999999999993925000"
    }
}
```
### 查询区块
#### Example request
```curl
curl -s -X GET http://{server_address}/block/hash/{block_hash}

curl -s -X GET http://{server_address}/block/number/{number}
```
#### Example request params
```json
http://localhost/block/hash/06e49d34a5e96de1db257d8a0eeb9f029e5a7611b8c898348fbbbfe559d9ac28

http://localhost/block/number/1
```
Property | Description
---|---
`block_hash` | 区块hash,根据block_hash查询得到区块信息
`number` | 区块高度,根据区块高度查询得到区块信息
#### Example response
```json
{
    "status_code":200,
    "data":{
        "header":Object{...},
        "data":Object{...},
        "metadata":Object{...},
        "blockSize":14096
    }
}
```
* 联盟链区块信息组成部分主要有header，data， metadata。
* blockSize：区块大小,单位bytes
* **详情见本文的区块解析**。

### 查询交易
#### Example request
```curl
curl -s -X GET http://{server_address}/get-transaction/{tx_id}
```
#### Example request params
```json
http://localhost/get-transaction/8ad6d1c84bea69c34a4b9deb2b87db8200a15e70a517d45c4f0250a022cd2f61
```
Property | Description
---|---
`tx_id` | 交易ID,根据tx_id查询得到交易信息
#### Example response
```json
{
    "status_code":200,
    "data":{
        "validationCode":0,
        "transactionEnvelope":Object{...},
        "blockHash":"f02f93f6f8937092a66fe6ad9f1cbe68c227d8ecd45822991dbbff3f21f3bece",
        "inkFee":"13425000"
    }
}
```
#### Example response data
Property | Description
---|---
`validationCode` | 交易验证错误码，0成功，其他各种验证失败原因
`transactionEnvelope` | 交易信封，交易内容，也是区块里存储的交易内容
`blockHash` | 交易所在区块的hash
`inkFee` | 交易费用
* **详情见本文的交易解析**

### 搜索查询
#### Example request
```curl
curl -s -X GET http://{server_address}/query/{query_id}
```
#### Example request params
```json
http://localhost/query/100
```
Property | Description
---|---
`query_id` | 支持tx_id, blockhash, blocknumber, address查询相关信息

### 部署合约数
#### Example request
```curl
curl -s -X GET http://{server_address}/chaincodes
```
#### Example response
```json
{
    "status_code":200,
    "data":[
        "name: token, version: 1.0, path: github.com/token"
    ]
}
```
* data是个数组，列出所有已部署合约的信息：名称，版本，路径

### 当前区块高度
#### Example request
```curl
curl -s -X GET http://{server_address}/block-heigth
```
#### Example response
```json
{
    "status_code":200,
    "data":4
}
```
* data为当前的区块高度

## INKchain Explorer Api
### 交易总数
#### Example request
```curl
curl -s -X GET http://{server_address}/transaction-count
```
#### Example response
```json
{
    "status_code":200,
    "data":4
}
```
* data为交易总数

### 区块列表
#### Example request
```curl
curl -s -X GET http://{server_address}/block-list
```
#### Example response
```json
{
    "status_code":200,
    "data":[
        {
            "block_hash":"73f9d70ecad3a6e568d187570c5c18c60400db093c963b66a035eb07b22af048",
            "number":3,
            "tx_count":10,
            "datetime":"2018-03-25T14:01:04.000Z"
        },
        {
            "block_hash":"1e66241fbd7464dcceb3b83532db7569bc613850ebf896112f6c4f7d7e846a79",
            "number":2,
            "tx_count":10,
            "datetime":"2018-03-25T13:50:45.000Z"
        }
    ]
}
```
* 最新的10条block数据
#### Example response data
Property | Description
---|---
`block_hash` | 区块hash
`number` | 区块高度
`tx_count` | 该区块处理的交易数量
`datetime` | 区块生成时间

### 交易列表
#### Example request
```curl
curl -s -X GET http://{server_address}/tx-list
```
#### Example response
```json
{
    "status_code":200,
    "data":[
        {
            "tx_id":"e310b6a3a7dfe0fc4b63e55187b54a6b38ede1479de5407e73349c65205935d1",
            "sender":"if92ac76a4b94b60614e5454aa23f983997fde209",
            "function":"transfer",
            "status":200,
            "datetime":"2018-04-23T15:31:24.000Z"
        },
        {
            "tx_id":"512d1a672790599ad5231a0fd7025237574c769a76dd1e624ef34174c6171d5d",
            "sender":"if92ac76a4b94b60614e5454aa23f983997fde209",
            "function":"transfer",
            "status":200,
            "datetime":"2018-04-23T14:32:02.000Z"
        }
    ]
}
```
* 最新的10条交易数据
#### Example response data
Property | Description
---|---
`tx_id` | 交易ID
`sender` | 交易的发起者
`function` | 交易处理的函数
`status` | 交易处理结果
`datetime` | 交易生成时间

### 历史交易
#### Example request
```curl
curl -s -X GET http://{server_address}/tx-history
```
#### Example response
```json
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


### Token合约总数
#### Example request
```curl
curl -s -X GET http://{server_address}/token-count
```
#### Example response
```json
{
    "status_code":200,
    "data":3
}
```
* data为Token合约总数

### Token持有详情
#### Example request
```curl
curl -s -X GET http://{server_address}/token-holders
```
#### Example response
```json
{
    "status_code":200,
    "data":[
        {
            "address":"i3c97f146e8de9807ef723538521fcecd5f64c79a",
            "amount":"{"INK":"3000"}"
        },
        {
            "address":"i411b6f8f24f28caafe514c16e11800167f8ebd89",
            "amount":"{"AAA":"1000000000000000000000000000","BBB":"1000000000000000000000000000","INK":"999999999999999999981197000"}"
        }
    ]
}
```
* 链上所有持有token的用户持有详情


### 用户转账记录
指定用户的所有转账记录
#### Example request
```curl
curl -s -X GET http://{server_address}/transfer-record/address/{user_address}
```
#### Example request params
```json
http://localhost/transfer-record/address/i411b6f8f24f28caafe514c16e11800167f8ebd89
```
#### Example response
```json
{
    "status_code":200,
    "data":[
        {
            "tx_id":"a249672bcc1bd73c78f3bbcd839ed1826a88c51459e3998f96fb0bde35320204",
            "from_address":"i411b6f8f24f28caafe514c16e11800167f8ebd89",
            "to_address":"i3c97f146e8de9807ef723538521fcecd5f64c79a",
            "token_name":"INK",
            "amounts":1000,
            "datetime":"2018-04-20T12:13:45.000Z"
        },
        {
            "tx_id":"950b320ef5d5d2ceff3568fe927a86ea9d02c94f9b4de6018a25e48c67fd9a39",
            "from_address":"i411b6f8f24f28caafe514c16e11800167f8ebd89",
            "to_address":"i3c97f146e8de9807ef723538521fcecd5f64c79a",
            "token_name":"INK",
            "amounts":1000,
            "datetime":"2018-04-20T12:13:15.000Z"
        }
    ]
}
```
#### Example response data
Property | Description
---|---
`tx_id` | 转账交易ID
`from_address` | 转出地址
`to_address` | 转入地址
`token_name` | 转出的token名称
`amounts` | 转出数量
`datetime` | 交易生成时间

### Token转账记录
指定token的所有转账记录
#### Example request
```curl
curl -s -X GET http://{server_address}/transfer-record/token/{token_name}
```
#### Example request params
```json
http://localhost/transfer-record/token/INK
```
#### Example response
```json
{
    "status_code":200,
    "data":[
        {
            "tx_id":"a249672bcc1bd73c78f3bbcd839ed1826a88c51459e3998f96fb0bde35320204",
            "from_address":"i411b6f8f24f28caafe514c16e11800167f8ebd89",
            "to_address":"i3c97f146e8de9807ef723538521fcecd5f64c79a",
            "token_name":"INK",
            "amounts":1000,
            "datetime":"2018-04-20T12:13:45.000Z"
        },
        {
            "tx_id":"950b320ef5d5d2ceff3568fe927a86ea9d02c94f9b4de6018a25e48c67fd9a39",
            "from_address":"i411b6f8f24f28caafe514c16e11800167f8ebd89",
            "to_address":"i3c97f146e8de9807ef723538521fcecd5f64c79a",
            "token_name":"INK",
            "amounts":1000,
            "datetime":"2018-04-20T12:13:15.000Z"
        }
    ]
}
```
#### Example response data
Property | Description
---|---
`tx_id` | 转账交易ID
`from_address` | 转出地址
`to_address` | 转入地址
`token_name` | 转出的token名称
`amounts` | 转出数量
`datetime` | 交易生成时间

### 指定token所有持有者
#### Example request
```curl
curl -s -X GET http://{server_address}/token-holders/token/{token_name}
```
#### Example request params
```json
http://localhost/token-holders/token/INK
```
#### Example response
```json
{
    "status_code":200,
    "data":[
        {
            "address":"i3c97f146e8de9807ef723538521fcecd5f64c79a",
            "balance":"3000"
        },
        {
            "address":"i411b6f8f24f28caafe514c16e11800167f8ebd89",
            "balance":"999999999999999999981197000"
        }
    ]
}
```
* data : 查询得到持有该通证的所有用户地址和持有量

### Token持有详情分页显示
#### Example request
```curl
curl -s -X GET	http://{server_address}/token-holders/page/{page}
```
#### Example request params
```json
http://localhost/token-holders/page/1
```
#### Example response
```json
{
    "status_code":200,
    "total":24302,
    "totalPages":2431,
    "currentPage":"1",
    "data":[
        {
            "address":"i0003535655d4011ef128a69cc93b94eaf63ecd64",
            "amount":"{"INK":"93700000"}"
        },
        {
            "address":"i0007ff1a85cafe33ae5765dd7eae5fa2ee9ed660",
            "amount":"{"INK":"100000000"}"
        }
    ]
}
```
#### Example response data
Property | Description
---|---
`total` | 持有token的账户总数
`totalPages` | 总页数
`currentPage` | 当前页数，每页10条
`address` | 持有者地址
`amount` | 持有者持有token详情
`tx_count` | 该区块处理的交易数量

### 发币详情
链上所有发行的token及其详情
#### Example request
```curl
curl -s -X GET http://{server_address}/asset
```
#### Example response
```json
{
    "status_code":200,
    "data":[
        {
            "symbol":"AAA",
            "total_supply":"1000000000000000000000000000",
            "decimals":18,
            "publish_address":"i411b6f8f24F28CaAFE514c16E11800167f8EBd89",
            "describe":"",
            "datetime":"2018-04-20T12:13:51.000Z"
        },
        {
            "symbol":"BBB",
            "total_supply":"1000000000000000000000000000",
            "decimals":18,
            "publish_address":"i411b6f8f24F28CaAFE514c16E11800167f8EBd89",
            "describe":"",
            "datetime":"2018-04-20T12:14:23.000Z"
        }
    ]
}
```
#### Example response data
Property | Description
---|---
`symbol` | 通证合约应该被知道的符号，比如“INK”，虽然没有严格的长度限制，但它在长度上常常是3或4个字母
`total_supply` | 总供给，它是通证合约唯一的强制参数。总供给等于所有账户余额的和
`decimals` | 小数位影响着通证的创建，被创建的数量应该等于通证的全部数量，全部数量=10^小位数*N。例如：通证ABC的小数位为9，发行10亿个，则发行的ABC总数 = 10 (10^8) (10^9)
`publish_address` | 发行通证的账户，成功后，所有的token都存放在该账户余额上
`describe` | 该字段需要手动在数据库中添加token描述信息，也可将描述信息存储到链上，具体依需求而定
`datetime` | token发行时间

### 全部区块分页显示
#### Example request
```curl
curl -s -X GET http://{server_address}/block-page/{page}
```
#### Example request params
```json
http://localhost/block-page/1
```
#### Example request params
```json
http://localhost/token-holders/token/INK
```
#### Example response
```json
{
    "status_code":200,
    "total":3201,
    "totalPages":1,
    "currentPage":"1",
    "data":[
        {
            "block_hash":"fc38d5768d7810d5a68ed3a50b7fe581426679a791c4679bbcee25ef4331ed6d",
            "number":1,
            "tx_count":1,
            "datetime":"2018-03-25T13:13:36.000Z"
        },
        {
            "block_hash":"f4933756d54a92d6dfc60efe1bbadf12cbe1315654de7b6f50f847d702e294ac",
            "number":0,
            "tx_count":1,
            "datetime":"2018-03-25T12:59:57.000Z"
        }
    ]
}
```
#### Example response data
Property | Description
---|---
`total` | 区块总数
`totalPages` | 总页数
`currentPage` | 当前页数，每页10条
`block_hash` | 区块hash
`number` | 区块高度
`tx_count` | 该区块处理的交易数量
`datetime` | 区块生成时间

### 全部交易分页显示
#### Example request
```curl
curl -s -X GET http://{server_address}/tx-page/{page}
```
#### Example request params
```json
http://localhost/tx-page/1
```
#### Example response
```json
{
    "status_code":200,
    "total":45000,
    "totalPages":4500,
    "currentPage":"1",
    "data":[
        {
            "tx_id":"e310b6a3a7dfe0fc4b63e55187b54a6b38ede1479de5407e73349c65205935d1",
            "sender":"if92ac76a4b94b60614e5454aa23f983997fde209",
            "function":"transfer",
            "status":200,
            "datetime":"2018-04-23T15:31:24.000Z"
        },
        {
            "tx_id":"512d1a672790599ad5231a0fd7025237574c769a76dd1e624ef34174c6171d5d",
            "sender":"if92ac76a4b94b60614e5454aa23f983997fde209",
            "function":"transfer",
            "status":200,
            "datetime":"2018-04-23T14:32:02.000Z"
        }
    ]
}
```
#### Example response data
Property | Description
---|---
`total` | 交易总数
`totalPages` | 总页数
`currentPage` | 当前页数，每页10条
`tx_id` | 交易ID
`sender` | 交易的发起者
`function` | 交易处理的函数
`status` | 交易处理结果
`datetime` | 交易生成时间

## 区块解析
```
{
　　"status_code":200,
　　"data":{
　　　　"header":Object{...},
　　　　"data":Object{...},
　　　　"metadata":Object{...},
　　　　"blockSize":14096
　　}
}
```
* 联盟链区块信息组成部分主要有header，data， metadata
```
"header":{
    "number":{
		"low":3,
		"high":0,
		"unsigned":true
		},
	"previous_hash":"9362cd38f7f9f78147f8070321f70c22e34c56d75fa042e30c81d73df84c64ab",
	"data_hash":"25e89e149345d57ffc4065d49da866b03272483cd3382e98124d0c44d7ad335d"
}
```
* number：区块高度(low)
* previous_hash：上个区块hash
* data_hash：区块数据的hash，MerkleTree 根节点Hash值

```
"data":Array[1]
```
* data是个数组，存放的是区块中每笔交易的详细信息（下面交易解析）,data.length是交易数量，区块生成时间可由最大交易时间确定（区块中没有时间，交易信封中有时间）

* metadata:共识可能会引入的一些可选的元数据

## 交易解析
```
{
　　"status_code":200,
　　"data":{
　　　　"validationCode":0,
　　　　"transactionEnvelope":Object{...},
　　　　"blockHash":"f02f93f6f8937092a66fe6ad9f1cbe68c227d8ecd45822991dbbff3f21f3bece",
　　　　"inkFee":"13425000"
　　}
}
```
* validationCode: 交易验证错误码，0成功，其他各种验证失败原因
* transactionEnvelope： 交易信封，交易内容，也是区块里存储的交易内容
* blockHash：交易 所在区块的hash
* inkFee：消耗的gas

```
"transactionEnvelope":{
    "signature":"3045022100d6e159b61c37d2917eba21e3c107001ffa197aedeb30ea7a059399f6c800199e022031f3b9cf02edaacc49dd7dc5b4bfcadd924fcda374bb9e9115df9851c77f3677",
    "payload":{
　　　  "header":Object{...},
　　　  "data":Object{...}
　　    }
}
```
* signature: 交易签名
* payload：交易内容，由header，data组成

```
"header":{
　　"channel_header":{
　　　　"type":"ENDORSER_TRANSACTION",
　　　　"version":1,
　　　　"timestamp":"Sat Mar 31 2018 16:28:50 GMT+0800 (CST)",
　　　　"channel_id":"mychannel",
　　　　"tx_id":"b93976d64df6627b6cc5e30e31d75135f068daaba07997bc2881fb75558b0ccb",
　　　　"epoch":0,
　　　　"extension":"12071205746f6b656e"
　　},
　　"signature_header":Object{...}
}
```
常用：
* channel_id：tx(交易)所在通道
* tx_id：交易id
* timestamp：交易处理时间

```
            "data":{
　　　　　　　　　　"actions":[
　　　　　　　　　　　　{
　　　　　　　　　　　　　　"header":Object{...},
　　　　　　　　　　　　　　"payload":{
　　　　　　　　　　　　　　　　"chaincode_proposal_payload":Object{...},
　　　　　　　　　　　　　　　　"action":{
　　　　　　　　　　　　　　　　　　"proposal_response_payload":Object{...},
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
　　　　　　　　　　　　　　　　　　　　　　"signature":"304402202c9753da917fd6fd5a1e1420222ac2d12a14025b7b050de0411617550bc9b20302203e6f82e096319d9252d0d271a8344425c310d38babf49b9a4b10d48f7a6a9b4d"
　　　　　　　　　　　　　　　　　　　　}
　　　　　　　　　　　　　　　　　　]
　　　　　　　　　　　　　　　　}
　　　　　　　　　　　　　　}
　　　　　　　　　　　　}
　　　　　　　　　　]
　　　　　　　　}
```
常用：
* chaincode_proposal_payload：合约调用数据，包括调用函数，参数，调用者等数据
* endorsements：背书详情

```
"chaincode_proposal_payload":{
　　"input":{
　　　　"id_generation_alg":"",
　　　　"sig":"11f133afdf34f3b699be6d24f6a7fec87306d60698dbb22bce4dde0620725dfc35c3bf6d4278b47f9ebceca7a1108ab0a558d105df6cfaeba321d37c8f268e3901",
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
　　　　　　　　　　"10000"
　　　　　　　　]
　　　　　　},
　　　　　　"timeout":0
　　　　},
　　　　"sender_spec":{
　　　　　　"sender":"i411b6f8f24f28caafe514c16e11800167f8ebd89",
　　　　　　"counter":{
　　　　　　　　"low":212,
　　　　　　　　"high":0,
　　　　　　　　"unsigned":true
　　　　　　},
　　　　　　"ink_limit":"100000000000",
　　　　　　"msg":"31303030317c323031383033323331343337313031323731303430303030303133317ce799bde5b08fe799bd7c32303139337ce5a5b3e5ad90e58d8ae7a88b7c30313a32343a31397ce7acace4b880e5908d7c62346336336336323131663434353463366266383733303531346635613734377ce7bab8e8b4b5e78988e69d837c7a696767757261742e636e"
　　　　}
　　}
}
```
常用：
* chaincode_spec：调用的合约名称，args中第一个参数为函数名称，其他的是函数参数
* sender_spec： 调用者的地址，counter第几笔交易，msg备注存储留言信息

## Transction SignSDK
### SignSDK For Nodejs
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

### SignSDK for JAVA
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

### 案例一：转账
```
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
```

### 案例二：invoke调用
```
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
```
* 签名数据要和请求数据保持一致
* counter记录的是发起交易的用户当前总共交易次数，需要先调用query-counter接口(见上文API)，得到counter

## 使用总结
* 如果用户还没有账号，调用生成INK钱包账的API(generate-account),获得账号的address和private_key
* 用户发行token，此接口一般不对外开放，管理员内部操作，用生成的账户地址发行
* 用户发行成功后，可在外部调用转账接口，例如：从发行token的账户地址向另一个账户地址转账
* 合约的invoke调用，如果用户在区块链网络中部署了业务相关的智能合约，可以通过invoke接口，调用合约函数，注意参数有个交易签名，可调用提供的SDK获得
* 合约query查询，如果用户在区块链网络中部署了业务相关的智能合约，可以通过query接口，查询合约信息
* 浏览器接口提供了区块链网络数据的查询，可根据接口，自定义浏览器内容

