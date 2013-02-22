var http = require('http');
var url  = require('url');
var util = require('util');

var HOST = '127.0.0.1';
var PORT = 1337;

var expected = parseInt(process.argv[2]) || 1;
var results = {};
var count = { passed: 0, total: 0 };

function beaconResponse (req, res) {
    var imgHex = '47494638396101000100800000dbd' +
                 'fef00000021f90401000000002c00' +
                 '000000010001000002024401003b';
    var imgBinary = new Buffer(imgHex, 'hex');
    res.writeHead(200, {'Content-Type': 'image/gif'});
    res.end(imgBinary, 'binary');
}

function joinParts (req, res, parsedUrl, testResult) {
    var parts = parsedUrl['query']['p'].split('of');
    parts[0] = parseInt(parts[0]);
    parts[1] = parseInt(parts[1]);
    testResult.total = parts[1];
    testResult.parts[parts[0]-1] = parsedUrl['query']['d'];

    if (testResult.total === testResult.parts.filter(String).length) {
        return JSON.parse(testResult.parts.join(''));
    }
}

http.createServer(function (req, res) {
    var requestURL = url.parse(req.url, true);
    if (requestURL['pathname'] === '/send.gif') {
        // console.log(requestURL['query']);
        beaconResponse(req, res);

        var id = requestURL['query']['id'];
        if (!results[id]) {
            results[id] = {parts: []};
        }

        var testResult = joinParts(req, res, requestURL, results[id]);
        if (testResult) {
            console.log(util.inspect(testResult, false, null, false));
            count['passed'] += testResult.passed;
            count['total'] += testResult.total;

            if (Object.keys(results).length === expected) {
                process.exit(count['passed'] !== count['total']);
            }
        }
    } else {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('nothing here!');
    }
}).listen(PORT, HOST);

console.log('Server running at http://' + HOST + ':' + PORT);