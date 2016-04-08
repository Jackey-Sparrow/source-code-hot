/**
 * Created by lja on 2016-4-8.
 */
(function (angular) {
	'use strict';

	/**
	 * $cordovaNetWorkTips
	 *
	 * @example
	 *
	 * // 1. inject to main app modules
	 * angular.module('mainApp',['$cordovaNetWorkTips']);
	 *
	 * // 2. make sure disconnect has value
	 * $rootScope.disConnect = 'disConnect'; // you can do the global translation here
	 *
	 * @example
	 */
	angular.module('$cordovaNetWorkTips', ['ngCordova'])
		.factory('$cordovaNetWorkTipsService',
			['$rootScope', '$cordovaNetwork', '$compile',
				function ($rootScope, $cordovaNetwork, $compile) {

					var element,
						template = '<div class="networkTips" id="networkTips" style="display: none;">{{disConnect}}</div>';

					function appendNetWorkTips() {

						element = $compile(template)($rootScope);
						angular.element('body').append(element);

					}

					function netWorkWatch() {

						$rootScope.$on('$cordovaNetwork:online', function () {
							hideNetWorkTips();
						});

						$rootScope.$on('$cordovaNetwork:offline', function () {
							showNetWorkTips();
						});
					}

					function clearNetWorkWatch() {
						$cordovaNetwork.clearOfflineWatch();
						$cordovaNetwork.clearOnlineWatch();
					}

					function showNetWorkTips() {
						element.css('display', 'block');
					}

					function hideNetWorkTips() {
						element.css('display', 'none');
					}

					function init() {
						appendNetWorkTips();
						netWorkWatch();
					}

					init();

					return {
						showNetWorkTips: showNetWorkTips,
						hideNetWorkTips: hideNetWorkTips,
						clearNetWorkWatch: clearNetWorkWatch
					};
				}])
		.run(['$injector', function ($injector) {
			$injector.get('$cordovaNetWorkTipsService');
		}]);
})(angular);