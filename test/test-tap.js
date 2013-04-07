var test = require('tap').test;
var tapOut = require('../lib/tap');


test('should convert json object to tap output', function (t) {
    t.plan(1);
    var expected = '\n1..0\nTAP version 13\n# tests 0\n\n# ok\n'
    t.equal(expected, tapOut({'tests': []}));
});

test('should output ok row for test when failed is false', function (t) {
    t.plan(1);
    var expected = 'TAP version 13\nok 1 haggis\n\n1..1\n# tests 1\n# pass  1\n\n# ok\n';
    t.equal(expected, tapOut({'tests': [{'name': 'haggis', 'failed': false}]}));
});