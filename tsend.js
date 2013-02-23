function generateShortUUID() {
    return ("0000" + (Math.random()*Math.pow(36,4) << 0).toString(36)).substr(-4);
}

function chunkString (str, len) {
    var chunks = [];
    while (str) {
        if (str.length < len) {
            chunks.push(str);
            break;
        }
        else {
            chunks.push(str.substr(0, len));
            str = str.substr(len);
        }
    }
    return chunks;
}

var id = generateShortUUID();

function submit (params) {
    var prefix = 'http://localhost:1942/send.gif?id=' + encodeURIComponent(id);
    var payload = JSON.stringify(params);
    var url = prefix + '&d=' + payload;
    var splits = chunkString(payload, 500);

    for (var i = 0; i < splits.length; i++) {
        var chunk = splits[i];
        var part = i + 1 + 'of' + splits.length;
        var qs = '&p=' + encodeURIComponent(part) + '&d=' + encodeURIComponent(chunk);

        var image = new Image(1, 1);
        image.onload = function () {};
        image.src = prefix + qs;
    }
}

function detectAndInstall () {
    var key;
    for (key in testFrameworks) {
        if (testFrameworks[key].detect()) {
            testFrameworks[key].install();
            return key;
        }
    }
    return false;
}

var testFrameworks = {

    'QUnit': {
        detect: function () {
            return typeof QUnit !== 'undefined';
        },
        install: function () {
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
                submit(results);
            };
        }
    },

    'jasmine': {
        detect: function () {
            return typeof jasmine !== 'undefined';
        },
        install: function () {
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
                submit(results);
            }

            jasmine.getEnv().addReporter(new JasmineAdapterReporter);
        }
    }
}
detectAndInstall();