/**
 * Created by lja on 2016-1-27.
 */
;
(function ($, Type) {
    'use strict';

//      transform : translate|rotate|scale)(X|Y|Z|3d)?|matrix(3d)?|perspective|skew(X|Y)
//		transitionProperty,
//		transitionDuration,
//		transitionTiming,
//		transitionDelay
// 支持度： IE10 FIREFOX OPERA CHROME SAFARI

//
//		animationName,
//		animationDuration,
//		animationTiming,
//		animationDelay
// 支持度： IE10 FIREFOX OPERA CHROME SAFARI

    //高版本的浏览器是不需要加前缀的�?�只有低版本浏览器才�?要加
    //-ms- 低版本的IE
    //-webkit- webkit内核 chrome safari
    //-moz- firefox
    //-o- opera
    //use 'webkitTransition' in element.style will be better

    var prefix = '',
        eventPrefix,
        vendors = {Webkit: 'webkit', Moz: '', O: 'o'},
        testEl = document.createElement('div'),
        supportedTransforms = /^((translate|rotate|scale)(X|Y|Z|3d)?|matrix(3d)?|perspective|skew(X|Y)?)$/i,

        transform,
        transitionProperty,
        transitionDuration,
        transitionTiming,
        transitionDelay,

        animationName,
        animationDuration,
        animationTiming,
        animationDelay,

        cssReset = {};

    function normalizeEvent(name) {
        return eventPrefix ? eventPrefix + name : name.toLowerCase();
    }

    //小写和大写之间加�?�?'-',并全部小写输�?
    function dasherize(str) {
        return str.replace(/([a-z])([A-Z])/, '$1-$2').toLowerCase()
    }

    //-webkit-
    //webkit
    //判断前缀�?-webkit- || -o- || -moz-
    $.each(vendors, function (vendor, event) {
        if (testEl.style[vendor + 'TransitionProperty'] !== undefined) {
            prefix = '-' + vendor.toLowerCase() + '-';
            eventPrefix = event;
            return false;
        }
    });

    transform = prefix + 'transform';
    cssReset[transitionProperty = prefix + 'transition-property'] =
        cssReset[transitionDuration = prefix + 'transition-duration'] =
            cssReset[transitionDelay = prefix + 'transition-delay'] =
                cssReset[transitionTiming = prefix + 'transition-timing-function'] =
                    cssReset[animationName = prefix + 'animation-name'] =
                        cssReset[animationDuration = prefix + 'animation-duration'] =
                            cssReset[animationDelay = prefix + 'animation-delay'] =
                                cssReset[animationTiming = prefix + 'animation-timing-function'] = '';


    $.fx = {
        off: (eventPrefix === undefined && testEl.style.transitionProperty === undefined),
        speeds: {_default: 400, fast: 200, slow: 600},
        cssPrefix: prefix,
        transitionEnd: normalizeEvent('TransitionEnd'),
        animationEnd: normalizeEvent('AnimationEnd')
    };

    $.fn.animate = function (properties, duration, ease, callback, delay) {
        //$('').animate(properties,function(){});

        if (Type.isFunction(duration)) {
            callback = duration;
            ease = undefined;
            duration = undefined;
        }

        //$('').animate(properties, duration, callback)
        if (Type.isFunction(ease)) {
            callback = ease;
            ease = undefined;
        }

        //$().animate(properties,{})
        if (Type.isPlainObject(duration)) {
            ease = duration.easing;
            callback = duration.complete;
            delay = duration.delay;
            duration = duration.duration;
        }

        //may be 'fast' or 'slow'
        if (duration) {
            duration = (typeof duration === 'number' ? duration :
                    ($.fx.speeds[duration] || $.fx.speeds._default)) / 1000;
        }

        return this.anim(properties, duration, ease, callback, delay);
    }

    $.fn.anim = function (properties, duration, ease, callback, delay) {
        var key,
            cssValues = {},
            cssProperties,
            transforms = '',
            that = this,
            wrappedCallback,
            endEvent = $.fx.transitionEnd,
            fired = false;

        //确保duration有�??
        if (duration === undefined) {
            duration = $.fx.speeds._default / 1000;
        }

        //确保delay有�??
        if (delay === undefined) {
            delay = 0;
        }

        if ($.fx.off) {
            duration = 0;
        }

        if (typeof properties === 'string') {
            //$('').animate(animationName,xxxx)
            //animationName:css里面预先定义的keyframes样式
            //@keyframes animateName{
            // 0%:{}
            // 100%:{}
            // }
            cssValues[animationName] = properties;
            cssValues[animationDuration] = duration + 's';
            cssValues[animationDelay] = delay + 's';
            cssValues[animationTiming] = (ease || 'linear');
            endEvent = $.fx.animationEnd;
        } else {
            cssProperties = [];
            //properties为对�?
            for (key in properties) {
                // /^((translate|rotate|scale)(X|Y|Z|3d)?|matrix(3d)?|perspective|skew(X|Y)?)$/i,
                //transition
                if (supportedTransforms.test(key)) {
                    //transform样式
                    transforms += key + '(' + properties[key] + ') ';
                } else {
                    //$('').animate({left:'',top:''},xxxx);
                    //�?般用得最多的还是平常的属�?
                    cssValues[key] = properties[key];
                    cssProperties.push();
                }
            }

            ////transition
            if (transforms) {
                cssValues[transform] = transforms;
                cssProperties.push(transform);
            }

            if (duration > 0 && typeof properties == 'object') {
                cssValues[transitionProperty] = cssProperties.join(', ')
                cssValues[transitionDuration] = duration + 's'
                cssValues[transitionDelay] = delay + 's'
                cssValues[transitionTiming] = (ease || 'linear')
            }
        }

        //绑定后的回调事件
        wrappedCallback = function (event) {
            if (typeof event !== 'undefined') {
                if (event.target !== event.currentTarget) {
                    return;
                }

                $(event.target).unbind(endEvent, wrappedCallback);
            } else {
                $(this).unbind(endEvent, wrappedCallback);
            }

            //reset
            fired = true;
            $(this).css(cssReset);
        }

        if (duration > 0) {
            this.bind(endEvent, wrappedCallback);
            setTimeout(function () {
                if (fired) {
                    return;
                }

                wrappedCallback.call(that);
            }, ((duration + delay) * 1000) + 25);
        }

        // trigger page reflow so new elements can animate
        this.size() && this.get(0).clientLeft;

        this.css(cssValues);//设置动画

        //遍历执行
        if (duration <= 0) {
            setTimeout(function () {
                that.each(function () {
                    wrappedCallback.call(this);
                });
            }, 0);
        }

        return this;

    }

    testEl = null;
})(Zepto, Type)
