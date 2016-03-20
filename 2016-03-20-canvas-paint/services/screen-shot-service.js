/**
 * Created by Jackey Li on 2016/3/20.
 */
(function (angular) {
    'use strict';

    angular.module('screenShot').factory('screenShotService',
        ['$compile', function ($compile) {

            var penStatus = {
                paint: 'paint',
                eraser: 'eraser'
            };
            var hasCanvas = false;
            var defaultOptions = {
                    selector: 'body',
                    canvasId: 'pen_canvas',
                    canDrag: false,
                    marginTop: 0,
                    marginBottom: 0,
                    offsetTop: 47,
                    penStatus: penStatus.paint,//or 'eraser'
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

            function switchPenStatus(status) {
                var oppositeStatus = options.penStatus === penStatus.paint ? penStatus.eraser : penStatus.paint;
                options.penStatus = status === void(0) ? oppositeStatus : status;
            }

            function destroy() {
                angular.element(compile).remove();
                options = void(0);
                hasCanvas = false;
            }

            return {
                getOptions: getOptions,
                openPaint: openPaint,
                switchPenStatus: switchPenStatus,
                destroy: destroy
            };
        }]);
})(angular);