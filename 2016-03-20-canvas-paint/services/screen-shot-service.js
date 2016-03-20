/**
 * Created by Jackey Li on 2016/3/20.
 */
(function (angular) {
    'use strict';

    angular.module('screenShot').factory('screenShotService',
        ['$compile', function ($compile) {

            var defaultOptions = {
                selector: 'body'
            };

            function screenShotOptions(options) {
                defaultOptions = angular.extend(defaultOptions, options);
            }

            function openPaint($scope) {
                var compile = $compile('<div data-screen-shot></div>')($scope);
                angular.element(defaultOptions.selector).append(compile);
            }

            return {
                screenShotOptions: screenShotOptions,
                openPaint: openPaint
            };
        }]);
})(angular);