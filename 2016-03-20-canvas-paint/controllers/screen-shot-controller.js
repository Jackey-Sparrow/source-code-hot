/**
 * Created by Jackey Li on 2016/3/20.
 */
(function (angular) {
    'use strict';

    angular.module('screenShot').controller('screenShotController',
        ['$scope', 'screenShotService',
            function ($scope, screenShotService) {
                $scope.openPaint = function () {
                    screenShotService.screenShotOptions(
                        {
                            selector: '.paint'
                        }
                    );
                    screenShotService.openPaint($scope);
                };

                $scope.closePaint = function () {
                    screenShotService.destroy();
                };

            }]);
})(angular);