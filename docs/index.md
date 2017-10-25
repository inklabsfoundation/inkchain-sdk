
<<<<<<< HEAD
The Hyperledger inkchain SDK for Node.js provides a powerful API to interact with a Hyperledger inkchain v1.0 blockchain. The SDK is designed to be used in the Node.js JavaScript runtime.

### Overview
Hyperledger inkchain is the operating system of an enterprise-strength permissioned blockchain network. For a high-level overview of the inkchain, visit [http://hyperledger-inkchain.readthedocs.io/en/latest/](http://hyperledger-inkchain.readthedocs.io/en/latest/).
=======
The Hyperledger Inkchain SDK for Node.js provides a powerful API to interact with a Hyperledger Inkchain v1.0 blockchain. The SDK is designed to be used in the Node.js JavaScript runtime.

### Overview
Hyperledger Inkchain is the operating system of an enterprise-strength permissioned blockchain network. For a high-level overview of the inkchain, visit [http://hyperledger-inkchain.readthedocs.io/en/latest/](http://hyperledger-inkchain.readthedocs.io/en/latest/).
>>>>>>> 2a93d38... 改名inkchain

Applications can be developed to interact with the blockchain network on behalf of the users. APIs are available to:
* create [channels](http://hyperledger-inkchain.readthedocs.io/en/latest/inkchain_model.html#privacy-through-channels)
* ask [peer nodes](http://hyperledger-inkchain.readthedocs.io/en/latest/arch-deep-dive.html#peer) to join the channel
* install [chaincodes](http://hyperledger-inkchain.readthedocs.io/en/latest/inkchain_model.html#chaincode) in peers
* instantiate chaincodes in a channel
* invoke transactions by calling the chaincode
* query the [ledger](http://hyperledger-inkchain.readthedocs.io/en/latest/inkchain_model.html#ledger-features) for transactions or blocks

<<<<<<< HEAD
### How Different Components of the inkchain Work Together
The [Transaction Flow](http://hyperledger-inkchain.readthedocs.io/en/latest/txflow.html) document provides an excellent description of the application/SDK, peers, and orderers working together to process transactions and producing blocks.

Security on the inkchain is enforced with digital signatures. All requests made to the inkchain must be signed by users with appropriate enrollment certificates. For a user's enrollment certificate to be considered valid on the inkchain, it must be signed by a trusted Certificate Authority (CA). inkchain supports any standard CAs. In addition, inkchain provides a CA server. See this [overview](http://hyperledger-inkchain-ca.readthedocs.io/en/latest/users-guide.html#overview).

### Features of the SDK for Node.js
The Hyperledger inkchain SDK for Node.js is designed in an Object-Oriented programming style. Its modular construction enables application developers to plug in alternative implementations of key functions such as crypto suites, the state persistence store, and logging utility.
=======
### How Different Components of the Inkchain Work Together
The [Transaction Flow](http://hyperledger-inkchain.readthedocs.io/en/latest/txflow.html) document provides an excellent description of the application/SDK, peers, and orderers working together to process transactions and producing blocks.

Security on the Inkchain is enforced with digital signatures. All requests made to the inkchain must be signed by users with appropriate enrollment certificates. For a user's enrollment certificate to be considered valid on the Inkchain, it must be signed by a trusted Certificate Authority (CA). Inkchain supports any standard CAs. In addition, Inkchain provides a CA server. See this [overview](http://hyperledger-inkchain-ca.readthedocs.io/en/latest/users-guide.html#overview).

### Features of the SDK for Node.js
The Hyperledger Inkchain SDK for Node.js is designed in an Object-Oriented programming style. Its modular construction enables application developers to plug in alternative implementations of key functions such as crypto suites, the state persistence store, and logging utility.
>>>>>>> 2a93d38... 改名inkchain

The SDK's list of features include:
* **inkchain-client**:
  * [create a new channel]{@link Client#createChannel}
  * [send channel information to a peer to join]{@link Channel#joinChannel}
  * [install chaincode on a peer]{@link Client#installChaincode}
  * instantiate chaincode in a channel, which involves two steps: [propose]{@link Channel#sendInstantiateProposal} and [transact]{@link Channel#sendTransaction}
  * submitting a transaction, which also involves two steps: [propose]{@link Channel#sendTransactionProposal} and [transact]{@link Channel#sendTransaction}
  * [query a chaincode for the latest application state]{@link Channel#queryByChaincode}
  * various query capabilities:
    * [channel height]{@link Channel#queryInfo}
    * [block-by-number]{@link Channel#queryBlock}, [block-by-hash]{@link Channel#queryBlockByHash}
    * [all channels that a peer is part of]{@link Client#queryChannels}
    * [all installed chaincodes in a peer]{@link Client#queryInstalledChaincodes}
    * [all instantiated chaincodes in a channel]{@link Channel#queryInstantiatedChaincodes}
    * [transaction-by-id]{@link Channel#queryTransaction}
    * [channel configuration data]{@link Channel#getChannelConfig}
  * monitoring events:
    * [connect to a peer's event stream]{@link EventHub#connect}
    * listen on [block events]{@link EventHub#registerBlockEvent}
    * listen on [transactions events]{@link EventHub#registerTxEvent} and find out if the transaction was successfully committed to the ledger or marked invalid
    * listen on [custom events]{@link EventHub#registerChaincodeEvent} produced by chaincodes
  * serializable [User]{@link User} object with signing capabilities
  * [hierarchical configuration]{@link Client.getConfigSetting} settings with multiple layers of overrides: files, environment variable, program arguments, in-memory settings
  * [logging utility]{@link Client.setLogger} with a built-in logger (winston) and can be overriden with a number of popular loggers including log4js and bunyan
<<<<<<< HEAD
  * pluggable [CryptoSuite]{@link api.CryptoSuite} interface describe the cryptographic operations required for successful interactions with the inkchain. Two implementations are provided out of box:
=======
  * pluggable [CryptoSuite]{@link api.CryptoSuite} interface describe the cryptographic operations required for successful interactions with the Inkchain. Two implementations are provided out of box:
>>>>>>> 2a93d38... 改名inkchain
    * [Software-based ECDSA]{@link CryptoSuite_ECDSA_AES}
    * [PKCS#11-compliant ECDSA]{@link CryptoSuite_PKCS11}
  * pluggable [State Store]{@link api.KeyValueStore} interface for persisting state caches such as users
    * [File-based store]{@link FileKeyValueStore}
    * [CouchDB-base store]{@link CouchDBKeyValueStore} which works with both CouchDB database and IBM Cloudant
  * customizable [Crypto Key Store]{@link CryptoKeyStore} for any software-based cryptographic suite implementation
  * supports both TLS (grpcs://) or non-TLS (grpc://) connections to peers and orderers, see {@link Remote} which is the superclass for [peers]{@link Peer} and [orderers]{@link Orderer}

* **inkchain-ca-client**:
<<<<<<< HEAD
  * [register]{@link inkchainCAServices#register} a new user
  * [enroll]{@link inkchainCAServices#enroll} a user to obtain the enrollment certificate signed by the inkchain CA
  * [revoke]{@link inkchainCAServices#revoke} an existing user by enrollment ID or revoke a specific certificate
  * [customizable persistence store]{@link inkchainCAServices}
=======
  * [register]{@link InkchainCAServices#register} a new user
  * [enroll]{@link InkchainCAServices#enroll} a user to obtain the enrollment certificate signed by the Inkchain CA
  * [revoke]{@link InkchainCAServices#revoke} an existing user by enrollment ID or revoke a specific certificate
  * [customizable persistence store]{@link InkchainCAServices}
>>>>>>> 2a93d38... 改名inkchain

### API Reference
The SDK is made up of 3 top-level modules that can be accessed through the navigation menu **Modules**:
* **api**: pluggable APIs for application developers to supply alternative implementations of key interfaces used by the SDK. For each interface there are built-in default implementations.
<<<<<<< HEAD
* **inkchain-client**: this module provides APIs to interact with the core components of a Hypreledger inkchain-based blockchain network, namely the peers, orderers and event streams.
=======
* **inkchain-client**: this module provides APIs to interact with the core components of a Hypreledger Inkchain-based blockchain network, namely the peers, orderers and event streams.
>>>>>>> 2a93d38... 改名inkchain
* **inkchain-ca-client**: this module provides APIs to interact with the optional component, inkchain-ca, that contains services for membership management.
<a rel="license" href="http://creativecommons.org/licenses/by/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by/4.0/88x31.png" /></a><br />This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International License</a>.
