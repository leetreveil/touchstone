var Touchstone = (function () {

    var id = getQueryVariable('id') || generateShortUUID();

    function getServerHostAndPort () {
        var allScripts = document.getElementsByTagName('script');
        for (var i = 0; i < allScripts.length; i++) {
            var script = allScripts[i];
            if (script && script.src && script.src.indexOf('tsend.js') !== -1) {
                return script.src.split('tsend.js')[0];
            }
        }
        return 'http://localhost:1942/';
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
        return ('0000' + (Math.random()*Math.pow(36,4) << 0).toString(36)).substr(-4);
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

    return {
        'reportResults' : function (params) {
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
    }
})();
