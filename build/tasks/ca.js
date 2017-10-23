/*
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
*/
'use strict';

var gulp = require('gulp');
var debug = require('gulp-debug');

const DEPS = [
	'inkchain-client/lib/api.js',
	'inkchain-client/lib/hash.js',
	'inkchain-client/lib/utils.js',
	'inkchain-client/lib/BaseClient.js',
	'inkchain-client/lib/Config.js',
	'inkchain-client/lib/Remote.js',
	'inkchain-client/lib/User.js',
	'inkchain-client/lib/impl/CouchDBKeyValueStore.js',
	'inkchain-client/lib/impl/CryptoSuite_ECDSA_AES.js',
	'inkchain-client/lib/impl/ecdsa/*',
	'inkchain-client/lib/impl/CryptoKeyStore.js',
	'inkchain-client/lib/impl/FileKeyValueStore.js',
	'inkchain-client/lib/msp/identity.js',
	'inkchain-client/lib/msp/msp.js',
	'inkchain-client/lib/protos/msp/identities.proto',
	'inkchain-client/lib/protos/msp/msp_config.proto'
];

gulp.task('ca', function() {
	return gulp.src(DEPS, { base: 'inkchain-client/' })
		.pipe(debug())
		.pipe(gulp.dest('inkchain-ca-client/'))
		.pipe(gulp.dest('node_modules/inkchain-ca-client'));
});

module.exports.DEPS = DEPS;
