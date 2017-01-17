#!/usr/bin/env node
'use strict';

var argv = require('minimist')(process.argv.slice(2));

const browserify = require('browserify');
const es6ify = require('es6ify');
const brfs = require('brfs');
const fs = require('fs');

var output = './bundle.js';
var w;
var debug = argv.d || false;

var i = 0;
if (argv.w) {
  let watchify = require('watchify');
  let b = browserify({cache: {}, packageCache: {}, debug: debug});

  applyTransforms(b);
  
  w = watchify(b);
  w.on('update', bundle);
  bundle();
}
else {
  var b = browserify({debug: debug});
  applyTransforms(b);
  b.bundle().pipe(process.stdout);
}

function bundle() {
  console.log('bundled', ++i);
  w.bundle()
    .on('error', function(e) {
      console.error(String(e))
    })
    .pipe(fs.createWriteStream(output))
  ;
}

function applyTransforms(b) {
  return b
    .add(es6ify.runtime)
    .transform(es6ify)
    .transform(brfs)
    .require(require.resolve('./'), {entry: true})
  ;
}
