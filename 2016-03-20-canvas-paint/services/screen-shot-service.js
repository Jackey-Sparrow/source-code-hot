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
                    canDrag: false,
                    marginTop: 50,
                    offsetTop: 47,
                    eraserStatus: false,
                    preX: 0,
                    preY: 0,
                    config: {
                        penStyle: '#ff0000',
                        penWidth: 4
                    }
                },
                options;

            var compile;

            function openPaint($scope, op) {
                if (!hasCanvas) {
                    options = angular.copy(defaultOptions);
                    angular.extend(options, op);
                    compile = $compile('<div data-screen-shot id="screen-shot"></div>')($scope);
                    angular.element(options.selector).append(compile);
                    hasCanvas = true;
                }
            }

            function getOptions() {
                return options ? options : defaultOptions;
            }

            function switchToPaintOrEraser(boolVal) {
                options.eraserStatus = boolVal === void(0) ? !options.eraserStatus : boolVal;
            }

            function destroy() {
                angular.element(compile).remove();
                options = void(0);
                hasCanvas = false;
            }

            return {
                getOptions: getOptions,
                openPaint: openPaint,
                switchToPaintOrEraser: switchToPaintOrEraser,
                destroy: destroy
            };
        }]);
})(angular);