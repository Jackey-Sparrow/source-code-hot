/**
 * Created by lja on 2016/1/14.
 */
var type = (function () {

    var class2type = {},
        toString = class2type.toString,
        type = {};

    function type(obj) {
        return obj == null ? String(obj) :
        class2type[toString.call(obj)] || "object"
    }

    function isFunction(value) {
        return type(value) == "function"
    }

    function isWindow(obj) {
        return obj != null && obj == obj.window
    }

    function isDocument(obj) {
        return obj != null && obj.nodeType == obj.DOCUMENT_NODE
    }

    function isObject(obj) {
        return type(obj) == "object"
    }

    function isPlainObject(obj) {
        return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
    }

    function likeArray(obj) {
        return typeof obj.length == 'number'
    }

    var isArray = Array.isArray ||
        function (object) {
            return object instanceof Array
        };

    type.isFunction = isFunction;
    type.isWindow = isWindow;
    type.isDocument = isDocument;
    type.isObject = isObject;
    type.isPlainObject = isPlainObject;
    type.likeArray = likeArray;
    type.isArray = isArray;

    return type;
})();

window.type = type;