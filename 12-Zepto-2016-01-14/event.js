/**
 * Created by lja on 2016-1-26.
 */
;
(function ($, Type) {

    //                                          IE6/7/8  IE9/10 FIREFOX5 SAFARI5 CHROME12 OPERA11
    // onfocusin                                  Y        Y      N        N        N        Y
    // attachEvent('onfocusin',fn)                Y        Y      N        N        N        Y
    // addEventListener('focusin',fn,false)       N        Y      N        Y        Y        Y
    //除firefox外，都可使用focusin/focusout来代替focus/blur事件，firefox中在捕获阶段监听focus/blur事件

    var _zid = 1, undefined,
        slice = Array.prototype.slice,

        handler = {},
        specialEvents = {},
        focusinSupported = 'onfocusin' in window,
        focus = {
            focus: 'focusin',
            blur: 'focusout'
        },
        hover = {
            mouseenter: 'mouseover',
            mouseleave: 'mouseout'
        };

    specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents';

    var returnTrue = function () {
            return true;
        },
        returnFalse = function () {
            return false;
        },
        ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$)/,
        eventMethods = {
            //阻止默认的行为
            preventDefault: 'isDefaultPrevented',
            //防止对事件流中当前节点中和所有后续节点中的事件侦听器进行处理，此方法会立即生效
            stopImmediatePropagation: 'isImmediatePropagationStopped',
            //因为事件可以在各层级的节点中传递，不管是冒泡还是捕获，有时我们希望事件在特定的节点执行完之后不再传递
            stopPropagation: 'isPropagationStopped'
        };

    function zid(element) {
        return element._zid || (element._zid = _zid++);
    }

    function extend(target, source, deep) {
        for (var key in source)
            if (deep && (Type.isPlainObject(source[key]) || Type.isArray(source[key]))) {
                if (Type.isPlainObject(source[key]) && !Type.isPlainObject(target[key])) {
                    target[key] = {};//把target[key]转换成{}
                }

                if (Type.isArray(source[key]) && !Type.isArray(target[key])) {
                    target[key] = [];//把target[key]转换成数组
                }
                extend(target[key], source[key], deep);//继续extend
            }
            else if (source[key] !== undefined) {
                target[key] = source[key];
            }
    }

    // Copy all but undefined properties from one or more
    // objects to the `target` object.
    $.extend = function (target) {
        var deep, args = slice.call(arguments, 1);
        if (typeof target == 'boolean') {
            deep = target;
            target = args.shift();
        }
        args.forEach(function (arg) {
            extend(target, arg, deep);
        });
        return target;
    }

    $.event = {add: add, remove: remove};

    $.proxy = function (fn, context) {
        var args = (2 in arguments) && slice.call(arguments, 2);//拿到后面的参数
        if (Type.isFunction(fn)) {
            var proxyFn = function () {
                return fn.apply(context, args ? args.concat(slice.call(arguments)) : arguments);
            }

            proxyFn._zid = zid(fn);
            return proxyFn;
        } else if (Type.isString(context)) {
            //如果作用域是个字符串
            if (args) {
                args.unshift(fn[context], fn);//把fn[context]放到第一位
                return $.proxy.apply(null, args);//重新执行proxy
            } else {
                return $.proxy(fn[context], fn);
            }
        } else {
            throw new TypeError('proxy exception');
        }
    }

    function parse(event) {
        var parts = ('' + event).split('.');
        return {
            e: parts[0],
            ns: parts.slice(1).sort().join(' ')
        };
    }

    //兼容event事件
    function compatible(event, source) {
        if (source || !event.isDefaultPrevented) {
            source || (source = event);

            //name => key,
            // predicate => value
            $.each(eventMethods, function (name, predicate) {
                var sourceMethod = source[name];
                event[name] = function () {
                    this[predicate] = returnTrue;
                    return sourceMethod && sourceMethod.apply(source, arguments);
                }
                event[predicate] = returnFalse;
            });

            //IE8及更低版本，使用returnValue
            if (source.defaultPrevented !== undefined ? source.defaultPrevented :
                    'returnValue' in source ? source.returnValue === false :
                    source.getPreventDefault && source.getPreventDefault()) {
                event.isDefaultPrevented = returnTrue;
            }
        }
        return event;
    }

    //转换成真正的事件类型
    function realEvent(type) {
        return hover[type] || (focusinSupported && focus[type]) || type;
    }

    //冒泡还是捕获处理
    function eventCapture(handler, captureSetting) {
        return handler.del &&
            (!focusinSupported && (handler.e in focus)) || !!captureSetting;
    }

    //重新包装event
    function createProxy(event) {
        var key, proxy = {originalEvent: event};
        for (key in event) {
            //ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$)/,
            if (!ignoreProperties.test(key) && event[key] !== undefined) {
                proxy[key] = event[key];
            }
        }

        return compatible(proxy, event);
    }

    function matcherFor(ns) {
        return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)');
    }

    //找到缓存中的handler
    function findHandlers(element, event, fn, selector) {
        event = parse(event)
        if (event.ns) var matcher = matcherFor(event.ns)
        return (handlers[zid(element)] || []).filter(function (handler) {
            return handler
                && (!event.e || handler.e == event.e)
                && (!event.ns || matcher.test(handler.ns))
                && (!fn || zid(handler.fn) === zid(fn))
                && (!selector || handler.sel == selector)
        })
    }


    //把事件绑定到元素
    function add(element, events, fn, data, selector, delegator, capture) {
        var id = zid(element),//get id
            set = (handler[id] || (handler[id] = []));//get handler

        events.split('/\s/').forEach(function (event) {
            //如果是ready事件
            if (event === 'ready') {
                return $(document).ready(fn);
            }

            var handler = parse(event);//{e:event,ns:xxx}
            handler.fn = fn;
            handler.selector = selector;

            //hover = {
            //	mouseenter: 'mouseover',
            //	mouseleave: 'mouseout'
            //}
            //如果是mouseover或者是mouseout事件，则需要改写fn
            if (handler.e in hover) {
                fn = function (e) {
                    //relatedTarget返回与事件的目标结点相关的节点（不支持IE）
                    //对于mouseover事件，该属性是鼠标指针移动到目标节点时所离开的那个节点
                    //对于mouseout事件，该属性是离开目标时，鼠标指针进入的节点，
                    //对于其他事件，这个属性没用
                    var related = e.relatedTarget;
                    if (!related || (related != this && !$.contains(this, related))) {
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

                e.data = data;

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

    //移除事件绑定
    function remove(element, events, fn, selector, capture) {
        var id = zid(element);
        (events || '').split(/\s/).forEach(function (event) {
            findHandlers(element, event, fn, selector).forEach(function (handler) {
                delete handlers[id][handler.i];//删除handler的记录
                if ('removeEventListener' in element) {
                    element.removeEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture));
                }

            })
        });
    }

    //----------------- on -------------------------------
    $.fn.bind = function (event, data, callback) {
        return this.on(event, data, callback)
    }
    $.fn.one = function (event, selector, data, callback) {
        return this.on(event, selector, data, callback, 1)
    }
    $.fn.delegate = function (selector, event, callback) {
        return this.on(event, selector, callback)
    }
    $.fn.on = function (event, selector, data, callback, one) {
        var autoRemove, delegator, $this = this;
        //如果event是数组
        if (event && !Type.isString(event)) {
            $.each(event, function (type, fn) {
                $this.on(type, selector, data, fn, one);
            });

            return $this;
        }

        //参数赋值往后推一位, $().bind(type,callback),没有selector
        if (!Type.isString(selector) && !isFunction(callback) && callback !== false) {
            callback = data;
            data = selector;
            selector = undefined;
        }

        if (callback === undefined || data === false) {
            callback = data;
            data = undefined;
        }


        if (callback === false) {
            callback = returnFalse;
        }

        return $this.each(function (_, element) {
            //只绑定一次，先解绑之前的绑定
            if (one) {
                autoRemove = function (e) {
                    remove(element, e.type, callback);
                    return callback.apply(this, arguments);
                }
            }

            //for $('').delegate(selector,event,callback)==> on(event,selector,callback)
            if (selector) {
                delegator = function (e) {
                    var evt, match = $(e.target).closest(selector, element).get(0);
                    if (match && match !== element) {
                        evt = $.extend(createProxy(e), {currentTarget: match, liveFired: element});
                        return (autoRemove || callback).apply(match, [evt].concat(slice.call(arguments, 1)));
                    }
                }
            }

            add(element, event, callback, data, selector, delegator || autoRemove);
        });
    }

    $.fn.live = function (event, callback) {
        $(document.body).delegate(this.selector, event, callback);
        return this;
    }


    //------------------off--------------------------

    $.fn.undelegate = function (selector, event, callback) {
        return this.off(event, selector, callback);
    }

    $.fn.unbind = function (event, callback) {
        return this.off(event, callback);
    }

    $.fn.off = function (event, selector, callback) {
        var $this = this;
        if (event && !Type.isString(event)) {
            $.each(event, function (type, fn) {
                $this.off(type, selector, fn);
            });
            return $this;
        }

        if (!Type.isString(selector) && !isFunction(callback) && callback !== false)
            callback = selector, selector = undefined;

        if (callback === false) callback = returnFalse;

        //遍历移除事件绑定
        return $this.each(function () {
            remove(this, event, callback, selector);
        })
    }

    $.fn.die = function (event, callback) {
        $(document.body).undelegate(this.selector, event, callback)
        return this
    }

    //-----------------trigger---------------------

    $.fn.trigger = function (event, args) {
        event = (Type.isString(event) || Type.isPlainObject(event)) ? $.Event(event) : compatible(event)
        event._args = args
        return this.each(function () {
            // handle focus(), blur() by calling them directly
            if (event.type in focus && typeof this[event.type] == "function") this[event.type]()
            // items in the collection might not be DOM elements
            else if ('dispatchEvent' in this) this.dispatchEvent(event)
            else $(this).triggerHandler(event, args)
        })
    }

    $.fn.triggerHandler = function (event, args) {
        var e, result;
        this.each(function (i, element) {
            e = createProxy(Type.isString(event) ? $.Event(event) : event);
            e._args = args;
            e.target = element;
            $.each(findHandlers(element, event.type || event), function (i, handler) {
                result = handler.proxy(e);//trigger事件
                if (e.isImmediatePropagationStopped()) {
                    return false;
                }
            });
        });
        return result;
    }


    //--------------event---------------------------

    $.Event = function (type, props) {
        if (!Type.isString(type)) {
            props = type;
            type = props.type;
        }

        var event = document.createEvent(specialEvents[type] || 'Event'),
            bubbles = true;

        if (props) {
            for (var name in props) {
                (name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name]);
            }
        }

        event.initEvent(type, bubbles, true);
        return compatible(event);
    }

        //------------------------------------
        // shortcut methods for `.bind(event, fn)` for each event type
    ;
    ('focusin focusout focus blur load resize scroll unload click dblclick ' +
    'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave ' +
    'change select keydown keypress keyup error').split(' ').forEach(function (event) {
            $.fn[event] = function (callback) {
                return (0 in arguments) ?
                    this.bind(event, callback) :
                    this.trigger(event)
            }
        });

})(Zepto, Type);