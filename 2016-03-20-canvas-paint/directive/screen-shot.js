(function (angular,$) {

    'use strict';

    /**
     * @ngdoc directive
     * @description
     */
    var moduleName = 'screenShot';
    angular.module(moduleName).directive('screenShot',
        ['platformsDeviceService', 'screenShotService',
            function (platformsDeviceService, screenShotService) {

                //still refactor
                return {
                    restrict: 'AE',
                    scope: {},
                    template: '',
                    link: linkFn
                };

                function linkFn($scope, element) {
                    var options = screenShotService.getOptions();
                    var canvas;

                    function onInitialize() {

                        //todo
                        var container = $(options.selector),
                            h = container.height() - 44,
                            w = container.width(),
                            top = '55px';

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
                        if (platformsDeviceService.statusBar) {
                            top = '75px';
                        }

                        canvas.width = width;
                        canvas.height = height;

                        setTimeout(function () {
                            canvas.addEventListener("touchstart", onPanelDragStart, false);
                            canvas.addEventListener("touchend", onPanelDragEnd, false);
                            canvas.addEventListener("mousedown", onPanelDragStart, false);
                            canvas.addEventListener("mouseup", onPanelDragEnd, false);
                        }, 200);
                        return canvas;
                    }

                    function onPanelDragStart(e) {
                        var ctx = canvas.getContext('2d'),
                            x = e.pageX + canvas.offsetLeft,
                            y = e.pageY + canvas.offsetTop - options.offsetTop;

                        //设置笔颜色和大小
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
                        options.canDrag = false;
                        canvas.onmousemove = null;
                        options.preX = 0;
                        options.preY = 0;
                    }

                    function beginNewDraw(penStyle) {
                        var context = canvas.getContext('2d');
                        penStyle = (penStyle != undefined) ? penStyle : options.config.penStyle;
                        var penWidth = options.config.penWidth;
                        context.strokeStyle = penStyle;
                        context.lineWidth = penWidth;
                    }

                    function Canvaseraser(x, y) {
                        var ctx = canvas.getContext('2d');
                        ctx.globalCompositeOperation = 'destination-out';
                        ctx.beginPath();
                        ctx.arc(x, y, 15, 0, Math.PI * 2);
                        ctx.strokeStyle = 'rgba(250,250,250,0)';
                        ctx.fill();
                        ctx.globalCompositeOperation = 'source-over';
                    }

                    onInitialize();
                }
            }
        ])
    ;
}
)(angular,$);