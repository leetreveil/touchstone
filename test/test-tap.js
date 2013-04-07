var test = require('tap').test;
var tapOut = require('../lib/tap');


test('should convert json object to tap output', function (t) {
    t.plan(1);
    var expected =
'\n\
1..0\n\
TAP version 13\n\
# tests 0\n\
\n\
# ok\n'
    t.equal(expected, tapOut({'tests': []}));
});

test('should output ok row for test when failed is false', function (t) {
    t.plan(1);
    var expected =
'TAP version 13\n\
ok 1 haggis\n\
\n\
1..1\n\
# tests 1\n\
# pass  1\n\
\n\
# ok\n';
    t.equal(expected, tapOut({'tests': [{'name': 'haggis', 'failed': false}]}));
});

test('should output error source when test has failed', function (t) {
    t.plan(1);
    var input = {"failed":1,"passed":0,"total":1,"tests":[{"id":1,"name":"abc","items":[{"passed":false,"actual":false,"expected":true,"source":"error_source"}],"failed":1,"passed":0,"total":1}]};
    var expected =
'TAP version 13\n\
not ok 1 abc\n\
  ---\n\
    message: ~\n\
    source:  error_source\n\
  ...\n\
\n\
1..1\n\
# tests 1\n\
# fail  1\n'
    t.equal(expected, tapOut(input));
});