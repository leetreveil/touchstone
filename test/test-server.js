var test = require('tap').test;
var eventEmitter = require('events').EventEmitter;
var handler = require('../lib/trecv').requestHandler;


var noop = function (){};
var noopObj = {'writeHead': noop, 'end': noop};


test('should serve 1x1px web tracking beacon', function (t) {
    t.plan(3);

    var res = {
        'writeHead': function (statusCode, headers) {
            t.equal(statusCode, 200);
            t.deepEqual(headers, {'Content-Type': 'image/gif'});
        },
        'end': function (data, encoding) {
            var imgHex = '47494638396101000100800000dbd' +
                         'fef00000021f90401000000002c00' +
                         '000000010001000002024401003b';
            t.deepEqual(data, new Buffer(imgHex, 'hex'));
            t.end();
        }
    };

    handler(null)({'url': 'http://localhost/send.gif'}, res);
});

test('should serve client side javascript client', function (t) {
    t.plan(2);

    var res = new eventEmitter();
    res.writeHead = function (statusCode, headers) {
        t.equal(statusCode, 200);
        t.deepEqual(headers, {'Content-Type': 'application/json'});
    }
    res.end = noop;
    res.write = function (chunk) { t.end(); }

    handler(null)({'url': 'http://localhost/tsend.js'}, res);
});

test('should respond with 404 on all other urls', function (t) {
    t.plan(1);

    var res = {
        'writeHead': function (statusCode, headers) {
            t.equal(statusCode, 404);
        },
        'end': function (data, encoding) {
            t.end();
        }
    };

    handler(null)({'url': 'http://localhost/haggis'}, res);
});

test('should be able to send json string in one part', function (t) {
    t.plan(2);

    handler(function (id, result) {
        t.equal(id, 'abc');
        t.deepEqual(result, {});
        t.end();
    })({'url': 'http://localhost/send.gif?id=abc&p=1of1&d={}'}, noopObj);
});

test('should be able to send json string in multiple parts', function (t) {
    t.plan(2);

    var hdler = handler(function (id, result) {
        t.equal(id, 'abc');
        t.deepEqual(result, {});
        t.end();
    });

    hdler({'url': 'http://localhost/send.gif?id=abc&p=1of2&d={'}, noopObj);
    hdler({'url': 'http://localhost/send.gif?id=abc&p=2of2&d=}'}, noopObj);
});

test('should handle when results are sent out of order', function (t) {
    t.plan(2);

    var hdler = handler(function (id, result) {
        t.equal(id, 'abc');
        t.deepEqual(result, {});
        t.end();
    });

    hdler({'url': 'http://localhost/send.gif?id=abc&p=1of2&d={'}, noopObj);
    hdler({'url': 'http://localhost/send.gif?id=efg&p=1of2&d=_'}, noopObj);
    hdler({'url': 'http://localhost/send.gif?id=abc&p=2of2&d=}'}, noopObj);
});