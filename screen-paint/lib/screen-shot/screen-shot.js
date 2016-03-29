/**
 * Created by lja on 2016-3-21.
 */

(function (angular) {
	'use strict';

	angular.module('screenShot', []);

	/**
	 * screenShotService
	 *
	 * @example
	 *
	 * screenShotService.openPaint();
	 * screenShotService.switchPenStatus();
	 * screenShotService.destroy();
	 *
	 * @example
	 */
	angular.module('screenShot').factory('screenShotService',
		['$compile', function ($compile) {

			var penStatus = {
					paint: 'paint',
					eraser: 'eraser'
				},
				hasCanvas = false,
				defaultOptions = {
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
				options,
				compile;

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

	angular.module('screenShot').directive('screenShot',
		['screenShotService',
			function (screenShotService) {

				return {
					restrict: 'AE',
					scope: {},
					link: linkFn
				};

				function linkFn($scope, element) {
					var options = screenShotService.getOptions(),
						canvas;

					function init() {
						var container = $(options.selector),
							h = container.height() - options.marginBottom,
							w = container.width(),
							top = parseInt(options.marginTop) + 'px';

						var canvasBox = createCanvasBox(w, h, top);
						canvas = createCanvas(w, h);
						canvasBox.appendChild(canvas);
						element.append(canvasBox);
					}

					function createCanvasBox(width, height, top) {
						var canvasBox = document.createElement('div');
						canvasBox.setAttribute('style', 'top:' + top);
						canvasBox.width = width;
						canvasBox.height = height;
						canvasBox.className = 'screen-shot-canvas-box';
						return canvasBox;
					}

					function createCanvas(width, height) {
						var canvas = document.createElement('canvas');
						canvas.id = options.canvasId;
						canvas.className = 'pen-canvas';
						canvas.width = width;
						canvas.height = height;

						setTimeout(function () {
							canvas.addEventListener('touchstart', onPanelDragStart, false);
							canvas.addEventListener('touchend', onPanelDragEnd, false);
							canvas.addEventListener('mousedown', onPanelDragStart, false);
							canvas.addEventListener('mouseup', onPanelDragEnd, false);
						}, 200);
						return canvas;
					}

					function onPanelDragStart(e) {
						var ctx = canvas.getContext('2d'),
							x = e.pageX + canvas.offsetLeft,
							y = e.pageY + canvas.offsetTop - options.offsetTop;

						options.preX = x;
						options.preY = y;
						beginNewDraw();
						if (!options.canDrag) {
							ctx.moveTo(x, y);
						}
						options.canDrag = true;
						canvas.onmousemove = onPanelMove;
						canvas.ontouchmove = onPanelMove;
					}

					function onPanelMove(e) {
						var ctx = canvas.getContext('2d'),
							x = e.pageX + canvas.offsetLeft,
							y = e.pageY + canvas.offsetTop - options.offsetTop;
						if (options.canDrag) {
							if (options.penStatus === 'eraser') {
								//use eraser
								canvasEraser(x, y);
							} else {
								ctx.beginPath();
								if (options.preX === 0 && options.preY === 0) {
									ctx.moveTo(x, y);
									ctx.lineTo(x, y);
									ctx.stroke();
									ctx.closePath();
									options.preX = x;
									options.preY = y;
								} else {
									if (options.preX > 0 && options.preY > 0 && x > 0 && y > 0) {
										ctx.moveTo(options.preX, options.preY);
										ctx.lineTo(x, y);
										ctx.stroke();
										ctx.closePath();
										options.preX = x;
										options.preY = y;
									}

								}
							}
						}
					}

					function onPanelDragEnd() {
						options.canDrag = false;
						canvas.onmousemove = null;
						options.preX = 0;
						options.preY = 0;
					}

					function beginNewDraw(penStyle) {
						var context = canvas.getContext('2d');
						penStyle = (penStyle !== undefined) ? penStyle : options.config.penStyle;
						var penWidth = options.config.penWidth;
						context.strokeStyle = penStyle;
						context.lineWidth = penWidth;
					}

					function canvasEraser(x, y) {
						var ctx = canvas.getContext('2d');
						ctx.globalCompositeOperation = 'destination-out';
						ctx.beginPath();
						ctx.arc(x, y, 15, 0, Math.PI * 2);
						ctx.strokeStyle = 'rgba(250,250,250,0)';
						ctx.fill();
						ctx.globalCompositeOperation = 'source-over';
					}

					init();
				}
			}
		]);
})(angular);