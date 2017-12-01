/**
 * Created by wangh09 on 2017/10/17.
 */
var path = require('path');
var utils = require('inkchain-client/lib/utils.js');
var logger = utils.getLogger('query');

var tape = require('tape');
var _test = require('tape-promise');
var test = _test(tape);


var Client = require('inkchain-client');

var inkUtils = require('../../InkUtils.js');


var util = require('util');

var testUtil = require('../../utils/unit/util.js');

test('  ---->>>>> Query channel working <<<<<-----', function(t) {
    inkUtils.queryChainInfo().then((result)=>{
        console.log('blockHeight:'+ result.height);
        console.log('currentBlockHash:'+ result.currentBlockHash.toBuffer().toString('hex'));
        console.log('previousBlockHash:'+ result.previousBlockHash.toBuffer().toString('hex'));
        t.pass('success');
        t.end();
    }).catch((err) => {
       t.fail('fail');
       t.end();
    });
});