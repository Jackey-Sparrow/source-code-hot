/**
 * Created by lja on 2016-1-22.
 */
(function () {
	'use strict';

	var arr = [1, 2, 3];
	arr.forEach(function (item) {
		console.log(this);
	}, 5);

	var isFunc = true;

	if (!isFunc)
		console.log('1');
	return
})();