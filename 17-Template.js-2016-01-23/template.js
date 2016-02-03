/**
 * Created by lja on 2016-1-22.
 */
(function () {
    
    'use strict';

    //todo: not finish
    var TemplateEngine = function (tpl, data) {
        //todo:
        var reg = /<%([^%>]+)?%>/g;

        var match;// = reg.exec(tpl);

        while (match = reg.exec(tpl)) {
            tpl = tpl.replace(match[0], data[match[1]]);
        }

        return tpl;
    };

    var template = '<p>Hello, my name is <%name%>. I\'m <%age%> year old.</p>';

    console.log(TemplateEngine(template, {
        name: 'Jackey',
        age: 25
    }));

})();