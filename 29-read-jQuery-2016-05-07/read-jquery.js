/**
 * Created by Jackey Li on 2016/5/7.
 */
(function (global, factory) {

    if (typeof module === 'object' && typeof module.exports === 'object') {
        //var jQuery = require("jquery")(window);
        module.exports = global.document ?
            factory(global, true) :
            function (w) {
                if (!w.document) {
                    throw new Error('jQuery requires a window with a document');
                }
                return factory(w);
            };
    } else {
        //normal call fn
        factory(global);
    }


})(typeof window !== 'undefined' ? window : this, function (window, noGlobal) {
        var arr = [];
        //get Array fn
        var slice = arr.slice,
            concat = arr.concat,
            push = arr.push,
            indexOf = arr.indexOf;

        var class2type = {};

        var toString = class2type.toString,//for type teller
            hasOwn = class2type.hasOwnProperty;//just get object's hasOwnProperty fn

        var trim = ''.trim;

        var support = {};

        //==== begin ===

        var document = window.document,
            version = '2.1.0',

            jQuery = function (selector, context) {
                return new jQuery.fn.init(selector, context);
            },

            rmsPrefix = /^-ms-/,
            rdashAlpha = /-([\da-z])/gi,

            fcamelCase = function (all, letter) {
                return letter.toUpperCase();
            };

        jQuery.fn = jQuery.prototype = {
            jquery: version,
            constructor: jQuery,
            selector: '',
            length: 0,
            toArray: function () {
                return slice.call(arguments);//convert arguments to array
            }
        };
    }
);