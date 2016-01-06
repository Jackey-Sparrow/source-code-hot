/**
 * Created by lja on 2016/1/6.
 */

(function (window, document) {
    'use strict';

    function getTime() {
        return (new Date()).getTime();
    }

    function getRand() {
        return Math.random().toString().substr(2);
    }

    function parseUrl(params) {

        var result = '';

        if (typeof params === 'string') {
            return params;
        }

        if (typeof params === 'object') {
            for (var key in params) {
                result += '&' + key + '=' + encodeURIComponent(params[key]);
            }
        }

        result += '&_time=' + getTime();
        result = result.substr(1);//delete first &
        return result;
    }

    function removeNode(node) {
        var parent = node.parent;
        if (parent && parent.nodeType !== 11) {
            parent.removeChild(node);
        }
    }

    function createScriptElement(id, url) {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;
        script.id = 'id_' + id;
        return script;
    }

    var JSONP = {

        //1 解析和拼凑URL, 检测url里面是否包含callback，选取出callback name
        //2 create script element and append to head
        //3 设置一个callbackName 的函数为window的属性，方便callback的时候调用。在该方法内，删除script和自己
        //4 feedback jsonp format: callbackName({"userName":"Jackey"}),callbackName是传过去的callback函数名

        getJSONP: function (url, data, callback) {

            var callbackName;

            url = url + (url.indexOf('?') === -1 ? '?' : '&') + parseUrl(data);

            var match = /callback=(\w+)/.exec(url);

            if (match && match[1]) {
                callbackName = match[1];
            } else {
                callbackName = 'jsonp_' + getTime() + '_' + getRand();
                url += '&callback=' + callbackName;
            }

            var script = createScriptElement(callbackName, url);

            window[callbackName] = function (json) {
                var elem = document.getElementById('id_' + callbackName);
                removeNode(elem);
                callback(json);
                delete window[callbackName];
            }

            var head = document.getElementsByTagName('head');
            if (head && head[0]) {
                head[0].appendChild(script);
            }

        }
    };

    var param = {
        userName: 'Jackey'
    };

    JSONP.getJSONP('http://localhost:63342/ng-control/js/10-XMLHttprequest/data/test.txt', param, function (json) {
        console.log(json);
    });
})(window, document);