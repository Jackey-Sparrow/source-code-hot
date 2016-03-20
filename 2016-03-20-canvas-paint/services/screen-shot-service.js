/**
 * Created by Jackey Li on 2016/3/20.
 */
(function (angular) {
    'use strict';

    angular.module('screenShot').factory('screenShotService',
        [function () {

            var defaultOptions = {
                selector: 'body'
            };

            function screenShotOptions(options) {
                angular.extend(defaultOptions, options);
            }

            return {
                screenShotOptions: screenShotOptions
            };
        }]);
})(angular);