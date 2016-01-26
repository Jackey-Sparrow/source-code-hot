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

    function parse(event) {
        var parts = ('' + event).split('.');
        return {
            e: parts[0],
            ns: parts.slice(1).sort().join(' ')
        };
    }

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

    function realEvent(type) {
        return hover[type] || (focusinSupported && focus[type]) || type;
    }

    function eventCapture(handler, captureSetting) {
        return handler.del &&
            (!focusinSupported && (handler.e in focus)) || !!captureSetting;
    }

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

})(Zepto, Type);