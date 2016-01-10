/**
 * Created by Jackey Li on 2016/1/10.
 */
var type = (function () {
    'use strict';

    var class2type = {},
        toString = class2type.toString;

    ('Boolean Number String Function Array Date RegExp Object Error').split(' ').forEach(function (name) {
        class2type['[object ' + name + ']'] = name.toLowerCase();
    });

    function type(obj) {
        return class2type[toString.call(obj)];
    }

    function isWindow(obj) {
        return obj !== null && obj.window && obj === obj.window;
    }

    function isFunction(obj) {
        return type(obj) === 'function';
    }

    function isDocument(obj) {
        return obj && obj.nodeType === obj.DOCUMENT_NODE;
    }

    function isObject(obj) {
        return type(obj) === 'object';
    }

    function isArray(obj) {
        return type(obj) === 'array';
    }

    function isNumber(obj) {
        return class2type[toString.call(obj)] === 'number';
    }

    function isPlainObject(obj) {
        return isObject(obj) && !isWindow(obj) &&
            Object.getPrototypeOf(obj) === Object.prototype;
    }

    function isString(str) {
        return class2type[toString.call(str)] === 'string';
    }

    return {
        isWindow: isWindow,
        isFunction: isFunction,
        isDocument: isDocument,
        isObject: isObject,
        isPlainObject: isPlainObject,
        isArray: isArray,
        isNumber: isNumber,
        isString: isString
    };
})();
