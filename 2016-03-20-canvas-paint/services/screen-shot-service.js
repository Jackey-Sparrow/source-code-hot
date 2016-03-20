/**
 * Created by Jackey Li on 2016/3/20.
 */
(function (angular) {
    'use strict';

    angular.module('screenShot').factory('screenShotService',
        ['$compile', function ($compile) {

            var randomId = Math.floor(Math.random() * 1000 + 1).toString();
            var hasCanvas = false;
            var defaultOptions = {
                selector: 'body',
                canvasId: 'pen_' + randomId,
                title: 'Pen',
                //config
                canDrag: false,
                offsetTop: 47,
                eraserStatus: false,
                preX: 0,
                preY: 0,
                config: {
                    penStyle: '#ff0000',
                    penWidth: 4
                }
            };

            var compile;

            function screenShotOptions(options) {
                defaultOptions = angular.extend(defaultOptions, options);
            }

            function openPaint($scope) {
                if (!hasCanvas) {
                    compile = $compile('<div data-screen-shot id="screen-shot-box"></div>')($scope);
                    angular.element(defaultOptions.selector).append(compile);
                }
            }

            function getOptions() {
                return defaultOptions;
            }

            function destroy() {
                angular.element(compile).remove();
            }

            return {
                screenShotOptions: screenShotOptions,
                getOptions: getOptions,
                openPaint: openPaint,
                destroy: destroy
            };
        }]);
})(angular);