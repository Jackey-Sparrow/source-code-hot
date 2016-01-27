/**
 * Created by lja on 2016-1-27.
 */
;
(function ($, Type) {
    'use strict';

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

    //-webkit-
    //webkit
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
})(Zepto, Type)
