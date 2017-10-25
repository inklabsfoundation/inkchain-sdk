{
        "test-network": {
                "orderer": {
                        "url": "grpcs://106.75.67.160:7050",
                        "server-hostname": "orderer.example.com",
                        "tls_cacerts": "utils/fixtures/channel/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/tlscacerts/example.com-cert.pem"
                },
                "org1": {
                        "name": "peerOrg1",
                        "mspid": "Org1MSP",
                        "ca": {
                                "url": "https://106.75.36.149:7054",
                                "name": "ca-org1"
                        },
                        "peer1": {
                                "requests": "grpcs://106.75.14.6:7051",
                                "events": "grpcs://106.75.14.6:7053",
                                "server-hostname": "peer0.org1.example.com",
                                "tls_cacerts": "utils/fixtures/channel/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tlscacerts/org1.example.com-cert.pem"
                        }
                },
                "org2": {
                        "name": "peerOrg2",
                        "mspid": "Org2MSP",
                        "ca": {
                                "url": "https://106.75.67.150:8054",
                                "name": "ca-org2"
                        },
                        "peer1": {
                                "requests": "grpcs://106.75.70.15:8051",
                                "events": "grpcs://106.75.70.15:8053",
                                "server-hostname": "peer0.org2.example.com",
                                "tls_cacerts": "utils/fixtures/channel/crypto-config/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tlscacerts/org2.example.com-cert.pem"
                        }
                }
        }
}
