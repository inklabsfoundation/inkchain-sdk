# ink-sdk 使用方法

## 安装
将fabric-client拷贝到项目文件夹下，并在npm中将其加入编译目录中。当fabric-client有更新时：

```javascript
npm install fabric-client
```

将inkchain目录下的`utils`目录，`config.json`, `inkUtils.js`, `wallet.js` 拷贝到工程目录下即可使用。使用方法见其他四个文件夹中的示例。

## api_chain
此目录下是链相关的接口调用方法。当链进行初始化时，将按照`api_chain/init.js`中的步骤依次进行；
此外，`api_chain/info`文件夹下将包含对链信息的获取（持续更新中）。
## api_cc
此目录下包括了对链码的操作，`func-install-cc.js`,`func-instantiate-cc.js`中是对链码的安装和初始化；

另外两个是sdk最重要的方法，链码的invode和query。要注意的是除非是管理员调用特殊的系统链码，
否则所有的invoke都需要用户进行签名。这是ink sdk与fabric sdk最大的区别。

## api_token

针对token的使用单独列出的接口（实际是特殊的invoke和query），包括token cc的安装和初始化；
token的发行、查询和转账。`example_get_account.js` 是对某账户所有token的列表获取，
`example_get_balance.js`是对某账户的某种token的查询。