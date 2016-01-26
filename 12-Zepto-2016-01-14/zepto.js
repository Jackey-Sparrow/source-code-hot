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

        propMap = {
            'tabindex': 'tabIndex',
            'readonly': 'readOnly',
            'for': 'htmlFor',
            'class': 'className',
            'maxlength': 'maxLength',
            'cellspacing': 'cellSpacing',
            'cellpadding': 'cellPadding',
            'rowspan': 'rowSpan',
            'colspan': 'colSpan',
            'usemap': 'useMap',
            'frameborder': 'frameBorder',
            'contenteditable': 'contentEditable'
        },

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

    $.contains = contains;

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

    //查找node默认的display属性值
    function defaultDisplay(nodeName) {
        var element, display;
        if (!elementDisplay[nodeName]) {//如果不存在内存中
            element = document.createElement(nodeName);
            document.appendChild(element);
            display = getComputedStyle(element, '').getPropertyValue('display');
            element.parentNode.removeChild(element);
            display === 'none' && (display = 'block');
            elementDisplay[nodeName] = display;
        }

        return elementDisplay[nodeName];
    }

    //如果arg为function，则执行拿到结果，or 返回arg
    function funcArg(context, arg, index, payload) {
        return Type.isFunction(arg) ? arg.call(context, index, payload) : arg;
    }

    //cssNumber中的不需要加px后缀，其他的需要
    function maybeAddPx(name, value) {
        return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value;
    }

    //转为驼峰
    //dd-dd ->ddDd
    //dd--dd-> ddDd
    ///-+(.)?/g 一个或者多个'-'， 最多一个'.',全局搜索
    function camelize(str) {
        return str.replace(/-+(.)?/g, function (match, chr) {
            return chr ? chr.toUpperCase() : '';
        });
    }

    function dasherize(str) {
        return str.replace(/::/g, '/')//dd::dd -> dd/dd
            .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')//'Ddddd'-> 'dDDD' 'DDdd'->'D_Ddd'
            .replace(/([a-z\d])([A-Z])/g, '$1_$2')//myName-> my_Name
            .replace(/_/g, '-')//
            .toLowerCase();
    }

    //如果value为null,则移除attr
    function setAttribute(node, name, value) {
        value == null ? node.removeAttribute(name) : node.setAttribute(name, value);
    }

    // "true"  => true
    // "false" => false
    // "null"  => null
    // "42"    => 42
    // "42.5"  => 42.5
    // "08"    => "08"
    // JSON    => parse if valid
    // String  => self
    function deserializeValue(value) {
        try {
            return value ?
            value == "true" ||
            ( value == "false" ? false :
                value == "null" ? null :
                    +value + "" == value ? +value :
                        /^[\[\{]/.test(value) ? $.parseJSON(value) :
                            value )
                : value;
        } catch (e) {
            return value;
        }
    }

    function className(node, value) {
        var klass = node.className || '',
            svg = klass && klass.baseVal !== undefined;//是否是svg元素

        if (value === undefined) {
            //取className
            return svg ? klass.baseVal : klass;
        } else {
            //赋值
            svg ? (klass.baseVal = value) : (node.className = value);
        }
    }

    //new RegExp('')生成一个正则表达式
    function classRE(name) {
        return name in classCache ?
            classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'));
    }

    //遍历所有的childrenNodes,执行fun函数
    function traverseNode(node, fun) {
        fun(node);
        for (var i = 0, len = node.childNodes.length; i < len; i++) {
            traverseNode(node.childNodes[i], fun);
        }
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
            return this;
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
            return this.each(function () {
                this.innerHTML = '';
            });
        },

        show: function () {
            return this.each(function () {
                //去掉style.display的属性
                this.style.display === 'none' && (this.style.display = '')

                //getComputedStyle支持度为：IE9+ CHROME FOREFOX OPERA SAFARI
                //获取node的默认display属性值
                if (getComputedStyle(this, '').getPropertyValue('display') === 'none') {
                    this.style.display = defaultDisplay(this.nodeName);
                }
            });
        },

        replaceWith: function (newContent) {
            return this.before(newContent).remove();
        },

        wrap: function (structure) {
            var func = isFunction(structure);
            if (this[0] && !func)
                var dom = $(structure).get(0),
                    clone = dom.parentNode || this.length > 1;

            return this.each(function (index) {
                $(this).wrapAll(
                    func ? structure.call(this, index) :
                        clone ? dom.cloneNode(true) : dom
                );
            });

        },

        wrapAll: function (structure) {
            if (this[0]) {
                //将structure放到第一位
                $(this[0]).before(structure = $(structure));
                var children;
                while ((children = structure.children()).length) {
                    structure = children.first();
                    $(structure).append(this);//把this放到structure的child
                }
            }

            return this;
        },

        wrapInner: function (structure) {
            var func = isFunction(structure);
            return this.each(function (index) {
                var self = $(this), contents = self.contents(),
                    dom = func ? structure.call(this, index) : structure
                contents.length ? contents.wrapAll(dom) : self.append(dom);
            });
        },

        unWrap: function () {
            this.parent().each(function () {
                $(this).replaceWith($(this).children())
            });
            return this;
        },

        clone: function () {
            return this.map(function () {
                return this.cloneNode(true);
            });
        },

        hide: function () {
            return this.css("display", "none");
        },

        toggle: function (setting) {
            return this.each(function () {
                var el = $(this);
                (setting === undefined ? el.css("display") == "none" : setting) ? el.show() : el.hide();
            });
        },

        //查找prev 兄弟节点
        prev: function (selector) {
            return $(this.plunk('previousElementSibling')).filter(selector || '*');
        },

        next: function (selector) {
            return $(this.plunk('nextElementSibling')).filter(selector || '*');
        },

        html: function (html) {
            //如果有html，则为赋值
            //没有参数，则为取值
            if (html) {
                return this.each(function (index) {
                    var originHtml = this.innerHTML;
                    //为了防止html是function，需要执行funcArg
                    $(this).empty().append(funcArg(this, html, index, originHtml));
                });
            } else {
                return this.length > 0 ? this[0].innerHTML : null;
            }
        },

        text: function (text) {
            if (text) {
                return this.each(function (index) {
                    var newText = funcArg(this, text, index, this.textContent);
                    this.textContent = newText == null ? '' : '' + newText;
                });
            } else {
                return this.length ? this[0].textContent : null;
            }
        },

        css: function (property, value) {

            //get property value
            if (arguments.length < 2) {
                var computedStyle, element = this[0];
                if (!element) {
                    return;
                }

                computedStyle = getComputedStyle(element, '');

                if (typeof property === 'string') {
                    //$('').css('width');
                    return element.style[camelize(property)] || computedStyle.getPropertyValue(property);
                } else if (Type.isArray) {
                    //$('').css(['width']);
                    var props = {};
                    $.each(property, function (_, prop) {
                        props[prop] = (element.style[camelize(prop)] || computedStyle.getPropertyValue(prop));
                    });
                    return props;
                }
            }

            //set property value
            var css = '';

            if (typeof property === 'string') {
                //$('').css('width',10);
                if (!value && value !== 0) {
                    //value = false
                    //value = '';
                    //value = undefined
                    //value = null
                    this.each(function () {
                        //移除属性
                        this.style.removeProperty(dasherize(property));
                    });
                } else {
                    //添加属性
                    css = dasherize(property) + ':' + maybeAddPx(property, value);
                }
            } else {
                //$('').css({'width',10});
                for (key in property) {
                    if (!property[key] && property[key] !== 0) {
                        //移除属性
                        this.each(function () {
                            this.style.removeProperty(dasherize(key));
                        });
                    } else {
                        //添加属性
                        css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';';
                    }
                }

            }

            return this.each(function () {
                this.style.cssText += ';' + css;
            });

        },

        attr: function (name, value) {
            var result;

            //get attr
            if (typeof name === 'string' && !value) {
                if (!this.length || this[0].nodeType !== 1) {
                    return;
                }

                result = this[0].getAttribute(name);
                if (!result && this[0][name]) {
                    return this[0][name];
                }
                return result;
            }

            //set attr
            return this.each(function (index) {
                if (this.nodeType !== 1) {
                    return;
                }

                //$('').attr({id:''});
                if (Type.isObject(name)) {
                    for (var key in name) {
                        setAttribute(this, key, name[key]);
                    }
                } else {
                    //$('').attr(id,'');
                    setAttribute(this, name, funcArg(this, value, index, this.getAttribute(name)));
                }
            });

        },

        //$('').removeAttr('xx  xx')
        removeAttr: function (name) {
            return this.each(function () {
                //确保为element对象
                this.nodeType === 1 && name.split(' ').forEach(function (attribute) {
                    setAttribute(this, attribute);
                });
            });
        },

        prop: function (name, value) {
            //如果存在于propMap里面，取出对象的属性
            //和attr不一样的是，prop取得是element自身的属性，attr多偏向于自定义的属性
            name = propMap[name] || name;

            if (arguments.length > 1) {
                //设值
                return this.each(function (index) {
                    this[name] = funcArg(this, value, index, this[name]);
                });
            } else {
                //取值
                return this[0] && this[0][name];
            }
        },

        data: function (name, value) {
            //'myName'->my-name,每个大写的字母都会被转换成‘-x’，最后转换成小写,最主要是将驼峰命名变为 xxx—xxx
            var attrName = 'data-' + name.replace(capitalRE, '-$1').toLocaleLowerCase();

            var data = arguments.length > 1 ? this.attr(attrName, value) : this.attr(attrName);

            //如果data不为空，则转换data,最主要是get value的时候，需要把‘true’之类的字符串转换成boolean
            return data !== null ? deserializeValue(data) : undefined;

        },

        val: function (value) {
            if (arguments.length > 0) {
                //赋值
                return this.each(function (index) {
                    this.value = funcArg(this, value, index, this.value);
                });
            } else {
                //取值
                if (this[0] && this[0].multiple) {
                    //for multiple select
                    var nodes = $(this[0]).find('option').filter(function () {
                        return this.selected;
                    });
                    return nodes.plunk('value');
                } else {
                    return this[0].value;
                }
            }
        },

        //查看element的位置
        index: function (element) {
            //1 如果没有参数
            //2 查看传入的元素的位置
            return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0]);
        },

        hasClass: function (name) {
            if (!name) {
                return;
            }
            //classRE(name): new RegExp('(^|\\s)' + name + '(\\s|$)') 验证是否包含name字符串的正则表达式
            //className(element) 拿到元素的className
            return emptyArray.some.call(this, function (element) {
                return this.test(className(element));//this就是classRE(name)
            }, classRE(name));
        },

        addClass: function (name) {
            if (!name) {
                return this;
            }

            return this.each(function (index) {
                if (!('className' in this)) {
                    return;
                }

                var classList = [];

                var cls = className(this),
                    newName = funcArg(this, name, index, cls);

                //根据空格切割成数组
                newName.split(/\s+/g).forEach(function (klass) {
                    if (!$(this).hasClass(klass)) {//如果还没有存在class
                        classList.push(klass);
                    }
                }, this);

                classList.length && className(this, cls + (cls ? ' ' : '') + classList.join(' '));//赋值
            });
        },

        removeClass: function (name) {
            return this.each(function (index) {
                if (!('className' in this)) {
                    return;
                }

                if (name === undefined) {
                    return className(this, '');
                }

                var classList = className(this);//取出已有className

                //name可能是function，返回的字符串可能包含多个classname.
                funcArg(this, name, index, classList).split(/\s+/g).forEach(function (klass) {
                    classList = classList.replace(classRE(klass), '');//将name换成空字符串
                });
            });
        },

        toggleClass: function (name, when) {
            if (!name) {
                return this;
            }

            return this.each(function (index) {
                var $this = $(this),
                    names = funcArg(this, name, index, className(this));
                names.split(/\s+/g).forEach(function (klass) {
                    //如果没有when，先查看元素是否有klass,再决定toggle的方式
                    (when === undefined ? !$this.hasClass(klass) : when) ? $this.addClass(klass) : $(this).removeClass(klass);
                });
            });
        },

        scrollTop: function (value) {
            if (!this.length) {
                return;
            }

            var hasScrollTop = 'scrollTop' in this[0];

            if (value === undefined) {
                //取值
                return hasScrollTop ? this[0].scrollTop : this[0].pageYOffset;
            }

            //赋值
            //hasScrollTop？scrollTop：scrollTo
            return this.each(hasScrollTop ?
                function () {
                    this.scrollTop = value;
                } :
                function () {
                    this.scrollTo(this.scrollX, value);
                });
        },

        scrollLeft: function (value) {
            if (!this.length) {
                return;
            }

            var hasScrollLeft = 'scrollLeft' in this[0];

            if (value === undefined) {
                //取值
                return hasScrollLeft ? this[0].scrollLeft : this[0].pageXOffset;
            }

            //赋值
            //hasScrollTop？scrollTop：scrollTo
            return this.each(hasScrollLeft ?
                function () {
                    this.scrollLeft = value;
                } :
                function () {
                    this.scrollTo(value, this.scrollY);
                });
        },

        //获取元素相对父元素的偏移
        position: function () {
            if (!this.length) {
                return;
            }

            //获取当前元素的offset和offsetParent的offset属性，进行对比，再减去border（如果存在border）
            var elem = this[0],
                offsetParent = this.offsetParent(),
                offset = this.offset(),
                parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? {top: 0, left: 0} : offsetParent.offset();

            offset.top -= parseFloat($(elem).css('margin-top')) || 0;
            offset.left -= parseFloat($(elem).css('margin-left')) || 0;

            parentOffset.top += parseFloat($(offsetParent[0]).css('border-top-width')) || 0;
            parentOffset.left += parseFloat($(offsetParent[0]).css('border-left-width')) || 0;

            return {
                top: offset.top - parentOffset.top,
                left: offset.left - parentOffset.left
            };

        },

        //offsetParent属性返回一个对象的引用，
        //这个对象是距离调用offsetParent的元素最近的（在包含层次中最靠近的）
        //并且是已经进行过css定位的容器元素，如果这个容器元素未进行css定位，
        //则取根元素
        offsetParent: function () {
            return this.map(function () {
                var parent = this.offsetParent || document.body;

                //如果parent的position是static，则需要再取它的offsetParent
                while (parent && !rootNodeRE.test(parent.nodeName) && $(parent).css('position') == 'static') {
                    parent = parent.offsetParent;
                }

                return parent;
            });
        },

        //元素在当前视口的相对偏移
        offset: function (coordinates) {

            //赋值
            if (coordinates) {
                return this.each(function (index) {
                    var $this = $(this),
                        coords = funcArg(this, coordinates, index, $this.offset()),
                        parentOffset = $this.offsetParent().offset(),
                        props = {
                            top: coords.top - parentOffset.top,
                            left: coords.left - parentOffset.left
                        };

                    if ($this.css('position') == 'static') {
                        props['position'] = 'relative';
                    }

                    $this.css(props);
                });
            }

            //取值
            if (!this.length) {
                return null;
            }

            var obj = this[0].getBoundingClientRect();

            return {
                left: obj.left + window.pageXOffset,
                top: obj.top + window.pageYOffset,
                width: Math.round(obj.width),
                height: Math.round(obj.height)
            };
        }

    };

    ['width', 'height'].forEach(function (dimension) {
        //转为首字母大写
        var dimensionProperty = dimension.replace(/./, function (m) {
            return m[0].toUpperCase();
        });

        $.fn[dimensionProperty] = function (value) {
            var offset,
                el = this[0];

            //拿值
            if (value === undefined) {
                //如果是window: innerWidth
                //如果是document： 拿到html（documentElement）的scrollWidth
                //如果是元素，则取offset()[width];ps:offset = this[0].getBoundingClientRect()
                return Type.isWindow(el) ? el['inner' + dimensionProperty] :
                    Type.isDocument(el) ? el.documentElement['scroll' + dimensionProperty] :
                    (offset = this.offset()) && offset[dimension];
            } else {
                return this.each(function (index) {
                    el = $(this);
                    el.css(dimension, funcArg(this, value, index, el[dimension]()));
                });
            }
        };
    });

    //after prepend before append
    //insertAfter insertBefore appendTo prependTo
    //adjacencyOperators = ['after', 'prepend', 'before', 'append'],//临近操作动作
    //append:添加到自身子元素的最后
    //prepend: 添加到自身子元素的最前
    //before:在自己之前
    //after：在自己后面
    adjacencyOperators.forEach(function (operator, operatorIndex) {
        var inside = operatorIndex % 2;//prepend append ==1

        $.fn[operator] = function () {
            var argType,
                nodes = map(arguments, function (arg) {
                    argType = Type.getType(arg);//类型
                    //如果不是对象或者数组或者是null类型，用碎片处理，以防出现append('li'),添加li元素
                    return argType == 'object' || argType == 'array' || arg == null ?
                        arg : zepto.fragment(arg);
                }),
                parent,
                copyByClone = this.length > 0;

            //如果没有要添加的节点
            if (nodes.length < 1) {
                return this;
            }

            return this.each(function (_, target) {
                //如果是append prepend,则需要用到target.insertBefore(xx),所以是自身
                //如果是before， after,则需要用到targetParentNode.insertBefore(xx,target),所以是parentNode
                parent = inside ? target : target.parentNode;

                //after:nextSibling
                //prepend: firstChild
                //before: target
                //append:null
                target = operatorIndex == 0 ? target.nextSibling :
                    operatorIndex == 1 ? target.firstChild :
                        operatorIndex == 2 ? target : null;

                //检查parent是否是html元素
                var parentInDocument = contains(document.documentElement, parent);

                //遍历操作nodes
                nodes.forEach(function (node) {
                    if (copyByClone) {
                        node = node.cloneNode(true);//深度复制
                    } else if (!parent) {
                        //如果没有parent节点
                        return $(node).remove();
                    }

                    parent.insertBefore(node, target);//关键

                    //parent是html元素的情况
                    if (parentInDocument) {
                        //遍历node的所有子节点，执行回调函数
                        traverseNode(node, function (element) {
                            if (element.nodeName != null && element.nodeName.toUpperCase() === 'SCRIPT' &&
                                (!element.type || element.type == 'text/javascript') && !element.src) {
                                window['eval'].call(window, element.innerHTML);//执行script
                            }
                        });
                    }


                });

            });

        };

        //insertAfter : after
        //prependTo: prepend
        //insertBefore: before
        //appendTo: append
        $.fn[inside ? operator + 'To' : 'insert' + (operatorIndex ? 'Before' : 'After')] = function (html) {
            $(html)[operator](this);
        };
    });

    return $;

})();

window.Zepto = Zepto;
//如果$ 不存在，就将window.$赋值为Zepto
window.$ === undefined && (window.$ = Zepto);