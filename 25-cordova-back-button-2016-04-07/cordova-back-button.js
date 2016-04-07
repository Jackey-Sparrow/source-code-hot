/**
 * Created by lja on 2016-4-7.
 */
(function (angular) {
	'use strict';

	angular.module('ngCordova.plugins.backButton', [])

		.factory('$cordovaBackButton',
			[
				'$rootScope',
				'$timeout',
				function ($rootScope,
				          $timeout) {

					/**
					 * Fires offline a event
					 */
					var backButtonEvent = function () {
						$timeout(function () {
							$rootScope.$broadcast('$cordovaBackButton');
						});
					};

					document.addEventListener('deviceready', function () {
						document.addEventListener('backbutton', backButtonEvent, false);
					});

					return {

						//var Backbutton = {
                        //
						//	goHome: function(successCallback, failureCallback) {
						//		cordova.exec(successCallback, failureCallback, 'BackbuttonPlugin',
						//			'goHome', []);
						//	},
						//	goBack: function(successCallback, failureCallback) {
						//		cordova.exec(successCallback, failureCallback, 'BackbuttonPlugin',
						//			'goBack', []);
						//	}
						//};

						clearBackButtonWatch: function () {
							document.removeEventListener('backbutton', backButtonEvent);
							$rootScope.$$listeners['$cordovaNetwork'] = [];
						}
					};
				}])
		.run(['$injector', function ($injector) {
			$injector.get('$cordovaBackButton'); //ensure the factory always gets initialised
		}]);

})(angular);