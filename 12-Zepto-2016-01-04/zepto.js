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

    zepto.matches = function (element, selector) {

        if (!element || !selector || element.nodeType !== 1) {
            return false;
        }

        var matchesSelector = element.webkitMatchesSelector
            || element.mozMatchesSelector
            || element.oMatchesSelector
            || element.matchesSelector;

        if (matchesSelector) {
            return matchesSelector.call(element, selector);
        }

        //todo:
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

    //去重
    function unique(array) {
        return filter.call(array, function (item, index) {
            return array.indexOf(item) === index;
        });
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

    //过滤，如果没有selector，则直接返回实例化，如果有，则执行filter
    function filtered(nodes, selector) {
        return selector == null ? $(nodes) : $(nodes).filter(selector);
    }

    //拿children
    function children(element) {

        if (element.children) {
            return slice.call(element.children);
        }

        return map(element.childNodes, function (child) {
            if (child.nodeType === 1) {
                return child;
            }
        });
    }

    //是否parent包含node
    var contains = document.documentElement.contains ?
        function (parent, node) {
            return parent !== node && parent.contains(node);
        } :
        function (parent, node) {
            //从node开始查找parentNode，看是否和parent符合
            while (node) {
                node = node.parentNode;
                if (node === parent) {
                    return true;
                }
            }
            return false;
        };

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

        //数组化
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

        //遍历执行回调函数
        each: function (callback) {
            emptyArray.every.call(this, function (element, index) {
                return callback.call(element, index, element) !== false;
            });
        },

        //添加
        add: function (selector, context) {
            //
            return $(unique(this.concat($(selector, context))));
        },

        //过滤自身
        filter: function (selector) {
            //$('li').filter('.hi1')
            if (Type.isFunction(selector)) {
                //反反得正
                //第一次是function进去，得到not的nodelist
                //第二次not,则直接排除不适合的。得到filter的结果
                return this.not(this.not(selector));
            }

            //使用matches filter出
            //matches的用法是：matches(element,selector),如果element上具有selector的标识符，则为true
            //<div id='test' class='eeee'> matches(document.getElementById('test','.eeee')) //true
            return $(filter.call(this, function (element) {
                return zepto.matches(element, selector);
            }));
        },

        //是否返回的数组的第一个符合selector
        is: function (selector) {
            return this.length > 0 && zepto.matches(this[0], selector);
        },

        //选择自身不符合selector的元素
        not: function (selector) {
            //$('li').not('.hi1')
            var nodes = [];
            if (Type.isFunction(selector) && selector.call !== undefined) {
                //expression
                //$('li').not(function(index){
                //
                // });
                this.each(function (index) {
                    //查找不符合的selector
                    if (!selector.call(this, index)) {
                        nodes.push(this);
                    }
                });
            } else {
                //如果是字符串，则使用filter方法
                //如果是数组，且item为函数，则直接返回数组化，否则实例化selector转化为zepto对象
                var excludes = typeof selector === 'string' ? this.filter(selector) :
                    (Type.likeArray(selector) && Type.isFunction(selector.item)) ? slice.call(selector) : $(selector);

                //选取不包含selector元素的节点
                this.forEach(function (element) {
                    if (excludes.indexOf(element) < 0) {
                        nodes.push(element);
                    }
                });
            }

            return $(nodes);
        },

        //查找子元素是否包含selector
        find: function (selector) {
            var result, $this = this;

            if (!selector) {
                return $();//[]
            }

            else if (Type.isObject(selector)) {
                //result
                result = $(selector).filter(function () {
                    var node = this;
                    return emptyArray.some.call($this, function (parent) {
                        return contains(parent, node);
                    });
                });
            }

            else if (this.length === 1) {
                result = $(zepto.qsa(this[0], selector));
            }
            else {
                result = this.map(function () {
                    return zepto.qsa(this, selector);
                });
            }

            return result;
        },

        //循环遍历， 查看子元素是否具有selector，深度遍历
        has: function (selector) {
            return this.filter(function () {
                //如果已经是文档对象，则直接使用contains,否则转化成zepto实例，再使用find
                return Type.isObject(selector) ? contains(this, selector) : $(this).find(selector).size();
            });
        },

        //
        eq: function (index) {
            return index === -1 ? this.slice(index) : this.slice(index, index + 1);
        },

        first: function () {
            var element = this[0];
            return element && !Type.isObject(element) ? element : $(element);
        },

        last: function () {

            var element = this[this.length - 1];

            return element && !Type.isObject(element) ? element : $(element);
        },

        closest: function (selector, context) {
            var node = this[0],//只拿数组第一个
                collection = false;

            if (Type.isObject(selector)) {
                collection = $(selector);
            }

            //查找自身是否符合selector，没有则网上找parentNode
            while (node && !(collection ? collection.indexOf(node) >= 0 : zepto.matches(node, selector))) {
                //一直遍历到context或者document对象
                node = node !== context && !Type.isDocument(node) && node.parentNode;
            }

            return $(node);
        },

        //查找所有parentNode,只到document对象，选取出符合selector的元素
        parents: function (selector) {

            var ancestors = [],
                nodes = this;

            while (nodes.length > 0) {
                nodes = map(nodes, function (node) {
                    node = node.parentNode;
                    if (node && !Type.isDocument(node) && ancestors.indexOf(node) < 0) {
                        ancestors.push(node);
                        return node;
                    }
                });
            }

            //选取出所有的parentNode,再过滤selector
            return filtered(ancestors, selector);
        },

        //返回nodeList的属性的集合
        //例如：$('li').plunk('parentNode');
        plunk: function (property) {
            return map(this, function (element) {
                return element[property];
            });
        },

        //或者parentNode,不做深度，只取一层
        parent: function (selector) {
            return filtered(unique(this.plunk('parentNode')), selector);
        },

        //拿children
        children: function (selector) {
            return filtered(map(this, function (element) {
                return children(element);
            }), selector);
        },

        contents: function () {
            return filtered(map(this, function (element) {
                return slice.call(element.childNodes);
            }));
        },

        //选取兄弟节点
        siblings: function (selector) {
            return filtered(map(this, function (element) {
                //通过选取父亲节点去拿到所有的子节点，再filter掉自己
                return filter.call(children(element.parentNode), function (child) {
                    return child !== element;
                })
            }), selector);
        },

        //-----------------attr css content操作 -------------------
        empty: function () {
            return map(this, function (element) {
                element.innerHTML = '';
            });
        },

        show: function () {

        }


    };

    return $;

})();

window.Zepto = Zepto;
//如果$ 不存在，就将window.$赋值为Zepto
window.$ === undefined && (window.$ = Zepto);