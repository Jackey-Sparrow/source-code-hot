/**
 * Created by lja on 2016/1/14.
 */

var Zepto = (function () {
    var undefined,
        key,
        $,//zepto对象
        classList,
        emptyArray = [],//是为了可以使用concat filter and slice这些数组的方法
        concat = emptyArray.concat,
        filter = emptyArray.filter,
        slice = emptyArray.slice,
        document = window.document,
        elementDisplay = {},
        classCache = {},
        cssNumber = {//这是一些不需要加px为后缀的css集合
            'column-count': 1,
            'columns': 1,
            'font-weight': 1,
            'line-height': 1,
            'opacity': 1,
            'z-index': 1,
            'zoom': 1
        },
        containers = {//parent element
            'tr': document.createElement('tbody'),
            'tbody': document.createElement('table'),
            'thead': document.createElement('table'),
            'tfoot': document.createElement('table'),
            'td': document.createElement('tr'),
            'th': document.createElement('tr'),
            '*': document.createElement('div')
        },
        fragmentRE = /^\s*<(\w+|!)[^>]*>/,//碎片检测，包含<tag1></tag1><tag2></tag2>
        singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,//单个tag检测，只能检测<tag></tag>,而且前面不能有空格
        tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,//tag扩展
        rootNodeRE = /^(?:body|html)$/i,//html或者body的节点元素校验
        capitalRE = /([A-Z])/g,//大写校验
        simpleSelectorRE = /^[\w-]*$/,//简单的选择器校验
        readyRE = /complete|loaded|interactive/,//ready状态校验

    //我已经把类型判断抽到type.js
    //class2type = {},//type mapping
    //toString = class2type.toString,//为检测类型做准备toString.call(obj)==>'[object xxx]'

        methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],//一些特别的属性，需要设置set get方法
        adjacencyOperators = ['after', 'prepend', 'before', 'append'],//临近操作动作
        zepto = {};

    //去掉null的item
    function compact(array) {
        return filter.call(array, function (item) {
            return item != null;
        })
    }

    //搭建$('selector',context)这样的调用方式
    $ = function (selector, context) {
        return zepto.init(selector, context);
    };

    zepto.isZ = function (object) {
        //如果是通过zepto.Z()出来的实例，返回true
        return object instanceof zepto.Z;
    };

    //1 挂方法到dom原型上
    zepto.Z = function (dom, selector) {
        dom = dom || [];
        dom.__proto__ = $.fn;//把方法挂在返回的dom的原型上
        dom.selector = selector;//修饰dom
        return dom;
    };

    zepto.init = function (selector, context) {
        var dom;

        if (!selector) {
            return zepto.Z();
        }

        else if (typeof  selector === 'string') {

            /** 有三种情况
             * 1 $('<a>',context)
             * 2 $('.name','.context')
             * 3 $('.name')
             */

            selector = selector.trim();

            if (selector[0] === '<' && fragmentRE.test(selector)) {
                //$('<a>',context)
                //如果是html碎片，<tag></tag>
                dom = zepto.fragment(selector, RegExp.$1, context);
                selector = null;
            }
            else if (context !== undefined) {
                //$('.name','.context')
                //如果context存在，则查找context先，再用find去找selector
                return $(context).find(selector);
            }
            else {
                //$('.name')
                dom = zepto.qsa(document, selector);
            }
        }

        else if (Type.isFunction(selector)) {
            //$(function(){
            //do something
            // })
            return $(document).ready(selector);
        }

        else if (zepto.isZ(selector)) {
            //如果已经是实例,直接返回
            return selector;
        }

        else {
            if (Type.isArray(selector)) {
                //如果已经是数组，则去掉null
                dom = compact(selector);
            }
            else if (Type.isObject(selector)) {
                //如果是个对象，则放到数组里面
                dom = [selector];
                selector = null;
            }

            else if (fragmentRE.test(selector)) {

            }

            else if (context !== undefined) {
                return $(context).find(selector);
            }
            else {
                dom = zepto.qsa(document, selector);
            }

        }

        return zepto.Z(dom, selector);
    };

    /**
     * 在element上查找符合selector的元素
     *
     * getElementById
     * getElementsByTagName
     * getElementsByClassName
     * querySelectorAll
     *
     * @param element
     * @param selector
     * @returns []
     */
    zepto.qsa = function (element, selector) {
        var found,
            maybeId = selector[0] === '#',
            maybeClass = selector[0] === '.',
            nameOnly = maybeId || maybeClass ? selector.slice(1) : selector,//确保一个字符的tag也能检测出来
            isSimple = simpleSelectorRE.test(nameOnly);

        //如果不是dom元素,直接返回空数组
        if (element.nodeType !== 1 && element.nodeType !== 9) {
            return [];
        }

        //Id
        if (Type.isDocument(element) && isSimple && maybeId) {
            found = element.getElementById(nameOnly);
            if (found) {
                return [found];
            }
            return [];
        } else {
            //简单的isSimple用class或者tag
            //复杂的用querySelectorAll,例如selector: '.panel a'
            if (isSimple && !maybeId) {
                if (maybeClass) {
                    found = element.getElementsByClassName(nameOnly);
                } else {
                    found = element.getElementsByTagName(selector);
                }
            } else {
                found = element.querySelectorAll(selector);
            }

            return slice.call(found);//转为数组对象
        }
    };

    /**
     * $('<a>',element)
     *
     * @param html: fragment
     * @param name tag
     * @param properties context
     */
    zepto.fragment = function (html, name, properties) {

        var dom,
            nodes,
            container;

        //单个tag检测
        if (singleTagRE.test(html)) {
            //创建该标签元素
            dom = $(document.createElement(RegExp.$1));
        }

        //如果都没不存在
        // $('<li><a>'), still get li
        if (!dom) {
            if (html.replace) {
                html = html.replace(tagExpanderRE, '<$1></$2>')
            }

            if (name === undefined) {
                name = fragmentRE.test(html) && RegExp.$1;//如果name为undefined，则取出tag
            }

            if (!(name in containers)) {
                //如果name不属于table tbody tr td等元素，则赋值为*，他的parent element就是div
                name = '*';
            }

            container = containers[name];

            container.innerHTML = '' + html;

            //通过拿设置父亲元素来把自己append父亲元素里面实现转化成childNodes,再遍历赋值给dom
            dom = $.each(slice.call(container.childNodes), function () {
                container.removeChild(this);
            });

        }

        if (Type.isPlainObject(properties)) {

            nodes = $(dom);

            $.each(properties, function (key, value) {
                if (methodAttributes.indexOf(key) > -1) {
                    nodes[key](value);// ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'] 的使用规则为直接赋值
                } else {
                    nodes.attr(key, value);//其它的则设置为attr
                }
            });
        }

        return dom;

    };

    $.each = function (elements, callback) {
        var i, key;
        if (Type.isArray(elements)) {
            for (i = 0; i < elements.length; i++) {
                if (callback.call(elements[i], i, elements[i]) === false) {
                    return elements;
                }
            }
        } else {
            for (key in elements) {
                if (callback.call(elements[i], key, elements[key]) === false) {
                    return elements;
                }
            }
        }

        return elements;
    };

    //
    function flatten(array) {
        return array.length ? emptyArray.concat.apply([], array) : array;
    }

    //map 查找符合callback function处理过的items
    function map(elements, callback) {
        var value, values = [], i, key;

        if (Type.likeArray(elements)) {
            for (i = 0; i < elements.length; i++) {
                value = callback(elements[i], i);
                if (value != null) {
                    values.push(value);
                }
            }
        } else {
            for (key in elements) {
                value = callback(elements[key], key);
                if (value != null) {
                    values.push(value);
                }
            }
        }

        return flatten(values);
    }

    $.fn = {

        forEach: emptyArray.forEach,
        reduce: emptyArray.reduce,
        push: emptyArray.push,
        sort: emptyArray.sort,
        indexOf: emptyArray.indexOf,
        concat: emptyArray.concat,

        map: function (fn) {//类似数组map，查找符合的元素
            return $(map(this, function (el, i) {
                return fn.call(el, i, el);
            }));
        },

        slice: function () {
            return $(slice.apply(this, arguments));
        },

        ready: function (callback) {
            if (readyRE.test(document.readyState) && document.body) {
                callback($);
            } else {
                document.addEventListener('DOMContentLoaded', function () {
                    callback($);
                }, false);
            }
            return this;
        },

        //获取相应下表的元素
        get: function (index) {
            return index === undefined ? slice.call(this) : this[index >= 0 ? index : index + this.length];
        },

        //
        toArray: function () {
            return this.get();
        },

        //数量
        size: function () {
            return this.length;
        },

        //通过父亲节点移除自己
        remove: function () {
            return this.each(function () {
                if (this.parentNode) {
                    this.parentNode.removeChild(this);
                }
            });
        },

        each: function (callback) {
            emptyArray.every.call(this, function (element, index) {
                return callback.call(element, index, element) !== false;
            });
        }

    };

    return $;

})();

window.Zepto = Zepto;
//如果$ 不存在，就将window.$赋值为Zepto
window.$ === undefined && (window.$ = Zepto);