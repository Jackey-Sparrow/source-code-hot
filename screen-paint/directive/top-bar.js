(function () {

	'use strict';

	/**
	 * @ngdoc directive
	 * @description
	 */
	var moduleName = 'screenShot';
	angular.module(moduleName).directive('itwoTopBar',
		['platformsDeviceService',
			'$compile',
			function (platformsDeviceService,
			          $compile) {

				//still refactory
				return {

					restrict: 'AE',
					scope: {
						type: '='
					},
					templateUrl: 'template/screen-shot.html',
					link: linkFn
				};
				function linkFn($scope, $element, $attrs) {
					$scope.penStatus = {
						pencil: 'penOn',
						eraser: 'penOff',
						email: 'penOff'
					};
					/*
					 * open screenshot action
					 * */
					$scope.openScreenshot = function () {
						var toolbar = jQuery('.slide'),
							pencilButton = jQuery('.pencilButton');
						pencilButton.hasClass('on') ? pencilButton.removeClass('on') : pencilButton.addClass('on');
						if (toolbar.hasClass('in')) {
							toolbar.removeClass('in').addClass('out');
							if (penView) {
								penView.destroy();
								$scope.penStatus = {
									pencil: 'penOn',
									eraser: 'penOff',
									email: 'penOff'
								};
							}
						}
						else {
							toolbar.removeClass('out').addClass('in');
							var canvas = document.getElementsByClassName('pen-canvas');
							if (!canvas || (canvas && canvas.length == 0)) {
								var pluginCompile = $compile('<screenshot></screenshot>')($scope);
								jQuery('body').append(pluginCompile);
							}
						}

					};
					/*
					 * pencil toolbar
					 * */
					$scope.pencilTap = function () {
						if (penView) {
							$scope.penStatus = {
								pencil: 'penOn',
								eraser: 'penOff',
								email: 'penOff'
							};
							penView.seteraserStatus(false);
						}
					};
					/*
					 * eraser toolbar
					 * */
					$scope.eraserTap = function () {
						if (penView) {
							$scope.penStatus = {
								pencil: 'penOff',
								eraser: 'penOn',
								email: 'penOff'
							};
							penView.seteraserStatus(true);
						}
					};
					/*
					 * send email
					 * */
					$scope.emailTap = function () {
						try {
							var selectProject = JSON.parse(localStorage.getItem("selectProject")), projectNames = '';
							if (selectProject) {
								projectNames = selectProject.projectName;
								projectNames = encodeURI(projectNames);
							}
							var htmlbody = document.body, myImage, screenshottitle, screenshotbody;
							screenshottitle = "Control Tower Screenshot[Project:" + projectNames + "]";
							screenshotbody = "Attached is a screenshot from the RIB iTWO Control Tower:";
							//Android
							if (platformsDeviceService.android) {
								html2canvas(htmlbody, {
									onrendered: function (canvas) {
										if (canvas.getContext) {
											var ctx = canvas.getContext("2d");
											myImage = canvas.toDataURL("image/png");
										}
										var mydiv = document.getElementById("screenshotdiv");
										mydiv.style.display = '';
										var imageElement = document.getElementById("Mypix");
										imageElement.src = myImage;
									}
								});
							}
							else if (platformsDeviceService.ios) {
								var iframeWin = document.createElement('iframe');
								iframeWin.src = 'myApp://screenshot=' + projectNames;
								iframeWin.style.display = 'none';
								document.body.appendChild(iframeWin);
								setTimeout(function () {
									iframeWin.remove();
									iframeWin = null;
								}, 3000);
								//document.location = 'myApp://screenshot=' + projectNames;
							} else {
								//computer
								html2canvas(htmlbody, {
									onrendered: function (canvas) {
										if (canvas.getContext) {
											var ctx = canvas.getContext("2d");
											myImage = canvas.toDataURL("image/png");
										}
										myImage = myImage.replace("image/png", "image/octet-stream");
										window.location.href = myImage;
									}
								});
							}

						} catch (e) {
							console.log(e);
							console.log('screenshot failed.');
						}

					};

				};
			}]);

}());

