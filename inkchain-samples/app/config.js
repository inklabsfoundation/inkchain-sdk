/**
 * Created by wangh09 on 2017/12/12.
 */
var util = require('util');
var path = require('path');
var hfc = require('inkchain-client');
hfc.addConfigFile(path.join(__dirname, '../app', 'network-config.json'));
hfc.addConfigFile(path.join(__dirname, '../config.json'));

module.exports.AddressPrefix = "i";