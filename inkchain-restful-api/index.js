/**
 * Created by wangh09 on 2018/1/20.
 */

const express = require('express');
const app = express();
const Client = require('inkchain-client');
const bodyParser = require('body-parser');
app.use(bodyParser.json());
require('./inkchain-samples/app/config');
let helper = require('./inkchain-samples/app/helper');
const ccHelper = require('./inkchain-samples/app/invoke-server');
const Wallet = require('./inkchain-samples/wallet').Wallet;
helper.getRegisteredUsers('user', 'org1');

app.get('/generate-account', (req, res)=>{
    Wallet.generate();
    res.json({"address": Wallet.getAddress(), "private_key": Wallet.getPriKey()});
});
app.get('/get-account/:address', (req, res)=>{
    const address = req.params.address;
    ccHelper.query('peer1','mychannel','token','getAccount',[address])
        .then((result) => {
            res.json({"status_code":200,"data":JSON.parse(result[0].toString().replace(":\"{", ":{").replace("}\"}", "}}"))});
        }, (err) => {
            res.json({"status_code":500, "error":err});
        }).catch((err) => {
        res.json({"status_code":500, "error":err});
    });
});
app.get('/get-balance/:address/:coin_type', (req, res)=>{
    const address = req.params.address;
    const coin_type = req.params.coin_type;
    ccHelper.query('peer1','mychannel','token','getBalance',[address, coin_type])
        .then((result) => {
            res.json({"status_code":200,"data":JSON.parse(result[0].toString())});
        }, (err) => {
            res.json({"status_code":500, "error":err});
        }).catch((err) => {
        res.json({"status_code":500, "error":err});
    });
});
app.post('/transfer', (req, res)=>{
    const to_address = req.body.to_address;
    const from_address = req.body.from_address;
    const coin_type = req.body.coin_type;
    const amount = req.body.amount;
    const message = req.body.message;
    const counter = req.body.counter;
    const ink_limit = req.body.ink_limit;
    const sig = new Buffer(JSON.parse(req.body.sig));
    ccHelper.invoke(['peer1'],'mychannel', 'token', 'transfer', [to_address, coin_type, amount], from_address, message, ink_limit, counter, sig)
        .then((result) => {
            if(result.length == undefined) {
                res.json({"status_code":500, "error": "transfer failed"});
            } else {
                res.json({"status_code":200, "data": result});
            }
        }, (err) => {
            res.json({"status_code":500, "error":err});
        }).catch((err) => {
        res.json({"status_code":500, "error":err});
    });
});

app.post('/query-counter', (req, res)=>{
    const from_address = req.body.from_address;
    ccHelper.query('peer1','mychannel', 'token', 'counter', [from_address]).then((result) => {
        res.json({"status_code":200, "data": result[0].toString()});
    }, (err) => {
        res.json({"status_code":500, "error":err});
    }).catch((err) => {
        res.json({"status_code":500, "error":err});
    });
});

app.get('/get-transaction/:transaction_id', (req, res)=>{
    const transaction_id = req.params.transaction_id;
    ccHelper.query('peer1','mychannel','qscc','GetTransactionByID', ["mychannel", transaction_id])
        .then((result) => {
            res.json({"status_code":200,"data":Client.decodeTransaction(result[0])});
        }, (err) => {
            res.json({"status_code":500, "error":err});
        }).catch((err) => {
        res.json({"status_code":500, "error":err});
    });
});

app.post('/invoke', (req, res)=>{
    const args = req.body.args;
    const cc_id = req.body.cc_id;
    const fcn = req.body.fcn;
    const message = req.body.message;
    const counter = req.body.counter;
    const sender = req.body.sender;
    const ink_limit = req.body.ink_limit;
    const sig = new Buffer(JSON.parse(req.body.sig));
    ccHelper.invoke(['peer1'],'mychannel', cc_id, fcn, args, sender, message, ink_limit, counter, sig)
        .then((result) => {
            res.json({"status_code":200, "data": result});
        }, (err) => {
            res.json({"status_code":500, "error":err});
        }).catch((err) => {
        res.json({"status_code":500, "error":err});
    });
});

app.post('/query', (req, res)=>{
    const args = req.body.args;
    const cc_id = req.body.cc_id;
    const fcn = req.body.fcn;
    ccHelper.query('peer1','mychannel',cc_id,fcn, args)
        .then((result) => {
            res.json({"status_code":200, "data":result[0]});
        }, (err) => {
            res.json({"status_code":500, "error":err});
        }).catch((err) => {
        res.json({"status_code":500, "error":err});
    });
});

let server = app.listen(8081, ()=>{

    let host = server.address().address;
    let port = server.address().port;

    console.log("inkchain restful api, help http://%s:%s/help", host, port)
});
