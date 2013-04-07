var tap = require('tap');

module.exports = function (result) {
    var rows = [];
    result.tests.forEach(function (test) {
        if (!test.failed) {
            rows.push({
                id: test.id,
                ok: true,
                name: test.name
            })
        } else {
            var item = test.items.filter(function (i) {
                return !i.passed;
            })[0];
            var line = {
                id: test.id,
                ok: false,
                name: test.name,
                message: item.message
            }
            if (item.stacktrace) line.stacktrace = item.stacktrace
            if (item.source) line.source = item.source
            if (item.stdout) line.stdout = item.stdout
            if (item.stderr) line.stderr = item.stderr
            rows.push(line)
        }
    })
    return tap.Producer.encode(rows, true);
}