/*
qunit adapter for touchstone
*/

(function () {
    if (typeof QUnit === 'undefined') {
        return;
    }

    var results = {
        failed: 0,
        passed: 0,
        total: 0,
        tests: []
    };

    var currentTest;
    var currentModule;
    var id = 1;

    function lineNumber (e) {
        return e.line || e.lineNumber;
    }

    function sourceFile (e) {
        return e.sourceURL || e.fileName;
    }

    function message (e) {
        var msg = (e.name && e.message)
            ? (e.name + ': ' + e.message)
            : e.toString();
        return msg;
    }

    function stacktrace (e) {
        if (e.stack) {
            return e.stack;
        }
        return undefined;
    }

    QUnit.log = function (params, e) {
        if (e) {
            currentTest.items.push({
                passed: params.result,
                line: lineNumber(e),
                file: sourceFile(e),
                stacktrace: stacktrace(e),
                message: message(e),
                source: params.source
            });
        } else {
            currentTest.items.push({
                passed: params.result,
                actual: params.actual,
                expected: params.expected,
                message: params.message,
                source: params.source
            });
        }
    }

    QUnit.testStart = function (params) {
        currentTest = {
            id: id++,
            name: (currentModule ? currentModule + ': ' : '') + params.name,
            items: []
        };
    }

    QUnit.testDone = function (params) {
        currentTest.failed = params.failed;
        currentTest.passed = params.passed;
        currentTest.total = params.total;
        
        results.total++;
        if (currentTest.failed > 0) {
            results.failed++;
        } else {
            results.passed++;
        }
        results.tests.push(currentTest);
    }

    QUnit.moduleStart = function (params) {
        currentModule = params.name;
    }

    QUnit.moduleEnd = function (params) {
        currentModule = undefined;
    }

    QUnit.done = function (params) {
        results.runDuration = params.runtime;
        Touchstone.reportResults(results);
    };
})();
