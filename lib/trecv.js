var http = require('http');
var URL = require('url');
var util = require('util');
var events = require('events');
var fs = require('fs');
var path = require('path');

var IMG_HEX = '47494638396101000100800000dbd' +
              'fef00000021f90401000000002c00' +
              '000000010001000002024401003b';

function beaconResponse (res) {
    res.writeHead(200, {'Content-Type': 'image/gif'});
    res.end(new Buffer(IMG_HEX, 'hex'), 'binary');
}

function joinParts (qs, testResult) {
    var parts = qs['p'].split('of');
    parts[0] = parseInt(parts[0]);
    parts[1] = parseInt(parts[1]);
    testResult.total = parts[1];
    testResult.parts[parts[0]-1] = qs['d'];

    if (testResult.total === testResult.parts.filter(String).length) {
        return JSON.parse(testResult.parts.join(''));
    }
}

function sendHandler (url, results, callback) {
    var id = url.query['id'];
    if (!id) {
        return;
    }
    if (!results[id]) {
        results[id] = {parts: []};
    }
    var testResult = joinParts(url.query, results[id]);
    if (testResult) {
        callback(id, testResult);
        delete results[id];
    }
}

module.exports = {
    'requestHandler': function (callback) {
        var results = {};
        return function (req, res) {
            var url = URL.parse(req.url, true);
            if (url.pathname === '/send.gif') {
                beaconResponse(res);
                sendHandler(url, results, callback);
            } else if (url.pathname === '/tsend.js') {
                res.writeHead(200, {'Content-Type': 'application/json'});
                fs.createReadStream(path.join(__dirname, 'tsend.js')).pipe(res);
            } else {
                res.writeHead(404);
                res.end();
            }
        }
    },
    'createServer': function () {
        var server = http.createServer(require(__filename).requestHandler(function (id, result) {
            server.emit('result', id, result);
        }));
        return server;
    }
}