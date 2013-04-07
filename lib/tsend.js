(function () {

    var id = getQueryVariable('id') || generateShortUUID();

    function getServerHostAndPort () {
        var script = document.getElementById('touchstone');
        if (script) {
            return script.src.split('tsend.js')[0];
        } else {
            return 'http://localhost:1942/';
        }
    }

    function getQueryVariable (variable) {
        var query = window.location.search.substring(1);
        var vars = query.split('&');
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');
            if (decodeURIComponent(pair[0]) == variable) {
                return decodeURIComponent(pair[1]);
            }
        }
    }

    function generateShortUUID () {
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

    function submit (params) {
        var prefix = getServerHostAndPort() + 'send.gif?id=' + encodeURIComponent(id);
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

    function detectAndInstall (frameworks) {
        for (var key in frameworks) {
            if (frameworks[key].detect()) {
                frameworks[key].install();
                return key;
            }
        }
        return false;
    }

    detectAndInstall({
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
    });
})();