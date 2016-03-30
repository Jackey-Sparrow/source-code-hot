/*
 * $Id: platform-device-service.js 321194 2015-12-21 13:37:19Z tommy $
 * Copyright (c) RIB Software AG
 */
/* globals globalLanguages */

(function () {
	'use strict';
	angular.module('screenShot').factory('statusBarService', platformsDeviceService);

	function platformsDeviceService() {//jshint ignore:line
		var device = {};
		var ua = navigator.userAgent;
		var $ = jQuery;

		var ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
		var ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
		var iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/);

		// Webview
		device.webView = (iphone || ipad || ipod) && ua.match(/.*AppleWebKit(?!.*Safari)/i);

		// Check for status bar and fullscreen app mode
		var windowWidth = $(window).width();
		var windowHeight = $(window).height();
		device.statusBar = false;
		if (device.webView && (windowWidth * windowHeight === screen.width * screen.height)) {
			device.statusBar = true;
		}
		else {
			device.statusBar = false;
		}


		// Export object
		return device;
	}
})();
