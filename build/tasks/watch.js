/*
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
*/
var gulp = require('gulp'),
	watch = require('gulp-watch'),
	debug = require('gulp-debug'),
	ca = require('./ca.js');

gulp.task('watch', function () {
	watch(ca.DEPS, { ignoreInitial: false, base: 'inkchain-client/' })
	.pipe(debug())
	.pipe(gulp.dest('inkchain-ca-client/'));

	watch([
		'inkchain-client/index.js',
		'inkchain-client/config/**/*',
		'inkchain-client/lib/**/*',
		'inkchain-ca-client/index.js',
		'inkchain-ca-client/config/**/*',
		'inkchain-ca-client/lib/**/*'
	], { ignoreInitial: false, base: './' })
	.pipe(debug())
	.pipe(gulp.dest('node_modules'));
});
