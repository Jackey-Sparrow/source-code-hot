var penView = {};
(function () {

	'use strict';

	/**
	 * @ngdoc directive
	 * @description
	 */
	var moduleName = 'screenShot';
	angular.module(moduleName).directive('screenshot',
		['platformsDeviceService',
			function (platformsDeviceService) {

				//still refactory
				return {

					restrict: 'AE',
					scope: {
						selector: '='
					},
					template: '',
					link: linkFn
				}

				function linkFn($scope) {
					var canvasAttrs = "background-color:transparent;";
					var randomId = Math.floor(Math.random() * 1000 + 1).toString();
					var options = {
						id: 'pen_' + randomId,
						title: 'Pen',
						//config
						dragok: false,
						offsetTop: 47,
						eraserStatus: false,
						preX: 0,
						preY: 0,
						config: {
							penStyle: '#ff0000',
							penWidth: 4
						}
					};

					function onPanelDragStart(e) {
						var canvas = getInternalCanvas(),
							ctx = canvas.getContext('2d'),
							x = e.pageX + canvas.offsetLeft,
							y = e.pageY + canvas.offsetTop - options.offsetTop;

						//设置笔颜色和大小
						options.preX = x;
						options.preY = y;
						beginNewDraw();
						if (!options.dragok) {
							ctx.moveTo(x, y);
						}
						options.dragok = true;
						canvas.onmousemove = onPanelMove;
						canvas.ontouchmove = onPanelMove;
					}

					function onPanelMove(e) {
						var canvas = getInternalCanvas(),
							ctx = canvas.getContext('2d'),
							x = e.pageX + canvas.offsetLeft,
							y = e.pageY + canvas.offsetTop - options.offsetTop;
						if (options.dragok) {
							if (options.eraserStatus) {
								//橡皮
								Canvaseraser(x, y);
							} else {
								ctx.beginPath();
								if (options.preX == 0 && options.preY == 0) {
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

					function onPanelDragEnd(e) {
						var canvas = getInternalCanvas();
						options.dragok = false;
						canvas.onmousemove = null;
						options.preX = 0;
						options.preY = 0;
					}

					function onInitialize() {

						var container = jQuery('.paint'),
							h = container.height() - 44,
							w = container.width(),
							top = '55px';
						var canvas = document.createElement('canvas');
						canvas.id = options.id;
						canvas.className = 'pen-canvas';
						if (platformsDeviceService.statusBar) {
							top = '75px';
						}
						canvas.setAttribute('style', "background-color:transparent;");
						canvas.width = w;
						canvas.height = h;

						var div = document.createElement('div');
						div.setAttribute('style', "overflow:visible;-webkit-transform:translateZ(0);-ms-transform:translateZ(0);transform:translateZ(0);background-color:transparent;position: absolute;left: 0;top: " + top + ";z-index:9999");
						div.width = w;
						div.height = h;
						div.className = 'divpen-canvas';
						div.appendChild(canvas);
						document.body.appendChild(div);
						setTimeout(function () {
							canvas.addEventListener("touchstart", onPanelDragStart, false);
							canvas.addEventListener("touchend", onPanelDragEnd, false);
							canvas.addEventListener("mousedown", onPanelDragStart, false);
							canvas.addEventListener("mouseup", onPanelDragEnd, false);
						}, 200);
					}

					function getInternalCanvas() {
						var canvas = document.getElementById(options.id);
						return canvas;
					}

					function beginNewDraw(penStyle) {

						var canvas = getInternalCanvas();
						var context = canvas.getContext('2d');
						penStyle = (penStyle != undefined) ? penStyle : options.config.penStyle;
						var penWidth = options.config.penWidth;
						context.strokeStyle = penStyle;
						context.lineWidth = penWidth;
					}

					function Canvaseraser(x, y) {
						var canvas = getInternalCanvas(),
							ctx = canvas.getContext('2d');
						ctx.globalCompositeOperation = 'destination-out';
						ctx.beginPath();
						ctx.arc(x, y, 15, 0, Math.PI * 2);
						ctx.strokeStyle = 'rgba(250,250,250,0)';
						ctx.fill();
						ctx.globalCompositeOperation = 'source-over';
					}

					penView.clearCanvas = function () {
						//clear
						var me = penView;
						var canvas = getInternalCanvas();
						var context = canvas.getContext('2d');
						context.beginPath();
						context.clearRect(0, 0, ctx.canvas.offsetWidth, ctx.canvas.offsetHeight);

					};
					penView.seteraserStatus = function (boolvalue) {
						options.eraserStatus = boolvalue;
					};

					penView.destroy = function () {
						var canvas = jQuery('#' + options.id).remove();
						jQuery(canvas).remove();
					};
					onInitialize();
				}
			}]);
}());