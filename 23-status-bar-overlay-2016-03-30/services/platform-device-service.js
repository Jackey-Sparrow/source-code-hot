(function (angular, $) {
    'use strict';
    angular.module('statusBarOverlay', []).factory('statusBarOverlayService', statusBarOverlayService);

    function statusBarOverlayService() {//jshint ignore:line
        var device = {};
        var ua = navigator.userAgent;

        var ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
        var ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
        var iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/);

        device.webView = (iphone || ipad || ipod) && ua.match(/.*AppleWebKit(?!.*Safari)/i);

        // Check for status bar and fullscreen app mode
        var windowWidth = $(window).width();//todo: use angular if it can
        var windowHeight = $(window).height();
        device.statusBar = false;
        device.statusBar = device.webView && (windowWidth * windowHeight === screen.width * screen.height) ? true : false;

        //todo:
        return device;
    }
})(angular, $);
