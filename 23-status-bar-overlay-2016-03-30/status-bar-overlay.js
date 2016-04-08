/**
 * Created by lja on 2016-4-8.
 */
(function (angular, $) {
	'use strict';
	angular.module('statusBarOverlay', [])
		.directive('statusBarOverlay',
			[function () {
				return {
					restrict: 'AE',
					scope: {},
					replace: true,
					template: '<div class="statusbar-overlay"></div>',
					link: function () {
						function getStatusBarStatus() {//jshint ignore:line
							var ua = navigator.userAgent;
							var ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
							var ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
							var iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/);
							var webView = (iphone || ipad || ipod) && ua.match(/.*AppleWebKit(?!.*Safari)/i);
							// Check for status bar and fullscreen app mode
							var windowWidth = $(window).width();
							var windowHeight = $(window).height();

							if (webView && (windowWidth * windowHeight === screen.width * screen.height)) {
								return true;
							}

							return false;
						}

						function statusBarHandler() {
							var status = getStatusBarStatus();
							if (status) {
								$('body').addClass('with-statusbar-overlay');
								$('.view-container').css('height', parseInt($('.view-container').css('height')) - 20);
							}
						}

						statusBarHandler();
					}
				};
			}]);
})(angular, $);