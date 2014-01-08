/*
jasmine adapter for touchstone
*/

(function () {
    if (typeof jasmine === 'undefined') {
        return;
    }

    var results = {
        failed: 0,
        passed: 0,
        total: 0,
        tests: []
    };

    function JasmineAdapterReporter () {};

    JasmineAdapterReporter.prototype.reportSpecResults = function (spec) {
        if (spec.results().skipped) {
            return;
        }

        var test = {
            passed: 0,
            failed: 0,
            total: 0,
            id: spec.id + 1,
            name: spec.getFullName(),
            items: []
        };
        
        var items = spec.results().getItems();
        
        for (var i = 0, len = items.length; i < len; i++) {
            var item = items[i];
            if (item.type === 'log') { 
                continue;
            }
            var passed = item.passed();
            test.total++;
            if (passed) {
                test.passed++;
            } else {
                test.failed++;
            }
            test.items.push({
                passed: passed,
                message: item.message,
                stacktrace: item.trace.stack ? item.trace.stack : undefined
            });
        }

        results.tests.push(test);

        results.total++;
        if (test.failed > 0) {
            results.failed++;
        } else {
            results.passed++;
        }
    }

    JasmineAdapterReporter.prototype.reportRunnerResults = function (runner) {
        Touchstone.reportResults(results);
    }

    jasmine.getEnv().addReporter(new JasmineAdapterReporter);
})();
