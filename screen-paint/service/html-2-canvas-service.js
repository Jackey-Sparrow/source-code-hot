/**
 * Created by Jackey Li on 2016/3/30.
 */
(function (angular, html2canvas) {
    'use strict';

    angular.module('html2canvasService',
        [
            function (platformsDeviceService) {

                if (!platformsDeviceService) {
                    throw new Error('Please inject the "platformsDeviceService" service');
                }

                var deviceService = platformsDeviceService.getDevice();

                var service = {},
                    projectNames;

                service.setProjectName = function (name) {
                    projectNames = name;
                };

                service.html2Canvas = function () {
                    try {
                        var htmlBody = document.body,
                            myImage;
                        //Android
                        if (deviceService.android) {
                            html2canvas(htmlBody, {
                                onrendered: function (canvas) {
                                    if (canvas.getContext) {
                                        myImage = canvas.toDataURL('image/png');
                                    }
                                    document.getElementById('screenshotdiv').style.display = '';
                                    document.getElementById('Mypix').src = myImage;
                                }
                            });
                        }
                        else if (deviceService.ios) {
                            var iframeWin = document.createElement('iframe');
                            iframeWin.src = 'myApp://screenshot=' + projectNames;
                            iframeWin.style.display = 'none';
                            htmlBody.appendChild(iframeWin);
                            setTimeout(function () {
                                iframeWin.remove();
                                iframeWin = null;
                            }, 3000);
                            //document.location = 'myApp://screenshot=' + projectNames;
                        } else {
                            //computer
                            html2canvas(htmlBody, {
                                onrendered: function (canvas) {
                                    if (canvas.getContext) {
                                        myImage = canvas.toDataURL('image/png');
                                    }
                                    myImage = myImage.replace('image/png', 'image/octet-stream');
                                    window.location.href = myImage;
                                }
                            });
                        }

                    } catch (e) {
                        console.log(e);
                        console.log('screenshot failed.');
                    }
                };


                return service;
            }
        ]);
})(angular, html2canvas);