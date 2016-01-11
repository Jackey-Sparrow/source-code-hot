/**
 * Created by lja on 2016/1/11.
 */
(function ($) {
    'use strict';

    /**
     * 类似jquery的delegate的实现原理
     *
     */

    /**
     * 基于jq zepto等等的dom选择器
     * $('xxx')会返回一个装有html collections的数组
     * 那么
     * $('xxx').delegate(selector,event,callback);
     */

    var slice = Array.prototype.slice,
        handler = {},
        _id = 1,
        focusinSupported = 'onfocusin' in window,
        focus = {focus: 'focusin', blur: 'focusout'},
        hover = {mouseenter: 'mouseover', mouseleave: 'mouseout'};
    //
    $.fn.delegate = function (selector, event, callback) {
        return this.on(event, selector, callback);
    };

    $.fn.on = function (event, selector, callback) {

        var autoRemove,
            delegator,
            $this = this;//html collections

        //如果是event数组,则遍历并执行on
        if (event && !isString(event)) {
            each(event, function (type, fn) {
                $this.on(type, selector, callback);
            });

            return $this;
        }


        if (!callback) {
            callback = empty;
        }

        return each($this, function (_, element) {
            if (selector) {
                delegator = function (e) {
                    var evt,
                        match = $(e.target).closest(selector, element).get(0);//查找子元素selector是否匹配
                    if (match && match !== element) {
                        evt = $.extend(createProxy(e), {currentTarget: match, liveFired: element});
                        return (autoRemove || callback).apply(match, [evt].concat(slice.call(arguments, 1)));
                    }
                }
            }

            add(element, event, callback, selector, delegator || autoRemove);
        });

    }

    function empty() {
    }

    function createProxy(event) {
        var key,
            proxy = {originalEvent: event};

        for (var key in event) {
            var ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$)/;//可以忽略的属性
            //key存在，而且不存在ignoreProperties中
            if (!ignoreProperties.test(key) && event[key] !== undefined) {
                proxy[key] = event[key];
            }
        }

        return compatible(proxy, event);
    }


    //处理Prevented事件
    function compatible(event, source) {
        //
        if (source || !event.isDefaultPrevented) {
            source || (source = event);

            var eventMethods = {
                preventDefault: 'isDefaultPrevented',
                stopImmediatePropagation: 'isImmediatePropagationStopped',
                stopPropagation: 'isPropagationStopped'
            }

            each(eventMethods, function (name, predicate) {
                var sourceMethod = source[name];
                event[name] = function () {
                    this[predicate] = returnTrue;
                    return sourceMethod && sourceMethod.apply(source, arguments);
                }

                event[predicate] = returnFalse;
            });

            //1 source.defaultPrevented 存在 则取source.defaultPrevented
            //1 source.defaultPrevented 不存在
            //      1.2 'returnValue' in source？
            //                        source.returnValue === false
            //                        source.getPreventDefault && source.getPreventDefault()
            if (source.defaultPrevented !== undefined ? source.defaultPrevented :
                    'returnValue' in source ? source.returnValue === false :
                    source.getPreventDefault && source.getPreventDefault()) {
                event.isDefaultPrevented = returnTrue;
            }

        }

        return event;

    }

    function returnTrue() {
        return true;
    }

    function returnFalse() {
        return false;
    }

    function likeArray(obj) {
        return typeof obj.length == 'number'
    }

    function getId(element) {
        return element._id || (element._id = _id++)
    }

    function parse(event) {
        var parts = ('' + event).split('.');
        return {
            e: parts[0],
            ns: parts.slice(1).sort().join(' ')
        }
    }

    function realEvent(type) {
        return hover[type] || (focusinSupported && focus[type]) || type;
    }

    function eventCapture(handler, captureSetting) {
        return handler.del && (!focusinSupported && (handler.e in focus)) || !!captureSetting;
    }

    function each(elements, callback) {
        var i, key;
        if (likeArray(elements)) {
            for (i = 0; i < elements.length; i++)
                if (callback.call(elements[i], i, elements[i]) === false) return elements
        } else {
            for (key in elements)
                if (callback.call(elements[key], key, elements[key]) === false) return elements
        }

        return elements;
    }

    function add(element, events, fn, selector, delegator, capture) {
        var id = getId(element),
            set = (handler[id] || (handler[id] = []));

        events.split(/\s/).forEach(function (event) {

            if (event === 'ready') {
                return $(document).ready(fn);
            }

            //拼凑handler
            var handler = parse(event);//feedback {e,ns}
            handler.fn = fn;
            handler.sel = selector;

            //如果事件为mouseenter or mouseleave
            if (handler.e in hover) {
                fn = function (e) {
                    var related = e.relatedTarget;
                    if (!related || (related !== this && !$.contains(this, related))) {
                        return handler.fn.apply(this, arguments);
                    }
                }
            }

            handler.del = delegator;
            var callback = delegator || fn;

            handler.proxy = function (e) {
                e = compatible(e);

                if (e.isImmediatePropagationStopped()) {
                    return;
                }

                e.data = undefined;

                var result = callback.apply(element, e._args == undefined ? [e] : [e].concat(e._args));

                if (result === false) {
                    e.preventDefault();
                    e.stopPropagation();
                }

                return result;

            }

            handler.i = set.length;
            set.push(handler);

            if ('addEventListener' in element) {
                element.addEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture));
            }


        });
    }

})(JQuery);