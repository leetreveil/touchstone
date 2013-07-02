[![Build Status](https://secure.travis-ci.org/leetreveil/touchstone.png)](http://travis-ci.org/leetreveil/touchstone)

Touchstone
-
Touchstone is a nodejs server and javascript client for collecting test results from browsers in virtualized environments.

```
npm install -g touchstone
```

Usage
-

Start the touchstone test collection server (runs on port 1942 by default):

```
touchstone
```

Instrument your javascript test suite with the script provided by touchstone:

```javascript
 <script src='http://localhost:1942/tsend.js'></script>
```

This script will automatically hook into your test suite and send the test results back to the server. (Supports qunit and jasmine out of the box)

When your test suite has finished running you should see your test results back in the CLI, nicely TAP formatted :)

```bash
TAP version 13
ok 1 abc

1..1
# tests 1
# pass  1

# ok
```

The ``example`` directory contains a quint test suite you can run in your browser.

CLI
-

Touchstone comes with a CLI to collect the test results. The CLI process exits when the test results have been collected from the browser.

```
touchstone [options]

  Options:

    -h, --help         output usage information
    -V, --version      output the version number
    -p, --port [port]  default: 1942
    -h, --host [host]  default: localhost
    -j, --json         output test results in json instead of TAP
```


API
-
The API returns a node http server which you can use to integrate with your own programs. The server object emits test results collected from the browser.

```javascript
var touchstone = require('touchstone');
touchstone.createServer()
  .on('result', function (id, result) {
    console.log(result);
  })
  .listen(1337, 'localhost');
```


Support
-
Supports the qunit and jasmine test frameworks. If your framework isn't there create an issue or send a pull request!

Licence
-

(The MIT License)

Copyright (c) 2013 Lee Treveil <leetreveil@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
