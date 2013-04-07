#!/usr/bin/env node
var program = require('commander');
var trecv = require('../lib/trecv');
var pkg = require('../package');
var tapOut = require('../lib/tap');

program
    .version(pkg.version)
    .option('-p, --port [port]', 'default: 1942')
    .option('-h, --host [host]', 'default: localhost')
    .option('-j, --json', 'output test results in json instead of TAP')
    .parse(process.argv);

program.port = program.port || 1942;
program.host = program.host || 'localhost';

var server = trecv.createServer().listen(program.port, program.host);

server.on('result', function (id, result) {
    if (program.json) {
        console.log(require('util').inspect(result, { showHidden: false, depth: null }));
    } else {
        console.log(tapOut(result));
    } 
    process.exit(result['failed'] !== 0);
});