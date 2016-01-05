/**
 * Created by lja on 2016/1/5.
 */
(function () {

	//status:
	// 1 pending
	// 2 fulfilled
	// 3 rejected

	var status = {
		pending: 'pending',
		fulfilled: 'fulfilled',
		rejected: 'rejected'
	};

	function noop() {
	}

	var Promise = function () {
		this.queue = [];
		this.value = null;
		this.status = status.pending;
	};

	Promise.prototype.getQueue = function () {
		return this.queue;
	};

	Promise.prototype.getStatus = function () {
		return this.status;
	};

	Promise.prototype.setStatus = function (statu, value) {
		if (statu === status.fulfilled || statu === status.rejected) {
			this.status = statu;
			this.value = value || null;
			this.queue = [];
			var freezeObject = Object.freeze || noop;
			freezeObject(this);//不可修改
		} else {
			throw new Error('doesn\'t support status: ' + statu);
		}
	};

	Promise.prototype.isFulfilled = function () {
		return this.status === status.fulfilled;
	};

	Promise.prototype.isRejected = function () {
		return this.status === status.rejected;
	};

	Promise.prototype.isPending = function () {
		return this.status === status.pending;
	};

	Promise.prototype.then = function (onFulfilled, onRejected) {

		var handler = {
			fulfilled: onFulfilled,
			rejected: onRejected
		};

		handler.deferred = new Deferred();

		if (!this.isPending()) {
			utils.procedure(this.status, handler, this.value);
		} else {
			this.queue.push(handler);//如果有多有链式then
		}

		return handler.deferred.promise;//important

	};

	var utils = (function () {
		var makeSignaler = function (deferred, type) {
			return function (result) {
				transition(deferred, type, result);
			}
		}

		var procedure = function (type, handler, result) {
			var func = handler[type];
			var defer = handler.deferred;

			if (func) {
				try {
					var newResult = func(result);
					if (newResult && typeof newResult.then === 'function') {
						newResult.then(makeSignaler(defer, status.fulfilled), makeSignaler(defer, status.rejected));
					} else {
						transition(defer, type, newResult);
					}
				} catch (err) {
					transition(defer, status.rejected, err);
				}
			} else {
				transition(defer, type, result);
			}
		}

		function transition(deferred, type, result) {
			if (type === status.fulfilled) {
				deferred.resolve(result);
			} else if (type === status.rejected) {
				deferred.reject(result);
			} else if (type !== status.pending) {
				throw new Error('do not support');
			}
		}

		return {
			procedure: procedure
		}

	})();

	function Deferred() {
		this.promise = new Promise();
	}

	Deferred.prototype.resolve = function (result) {

		if (!this.promise.isPending()) {
			return;
		}

		var queue = this.promise.getQueue(),
			len = queue.length;
		for (var i = 0; i < len; i++) {
			utils.procedure(status.fulfilled, queue[i], result);
		}

		this.promise.setStatus(status.fulfilled, result);
	};

	Deferred.prototype.reject = function (err) {
		if (!this.promise.isPending()) {
			return;
		}

		var queue = this.promise.getQueue(),
			len = queue.length;

		for (var i = 0; i < len; i++) {
			utils.procedure(status.rejected, queue[i], err);
		}

		this.promise.setStatus(status.rejected, err);
	}


	var test = function () {
		var defer = new Deferred();
		setTimeout(function () {
			defer.resolve(1);
			//defer = {
			//	promise: promise
			//}

			//defer.prototype={
			//	resolve,
			//	reject
			//}

			//promise={
			//	queue:[defer],
			//	status:'pending',
			//	value:''
			//}

		}, 5000);
		return defer.promise;
	}

	var t = test().then(function (data) {
		console.log(data);
		return 2;
	}, function (error) {
		console.log(error);
	}).then(function (data) {
		console.log(data);
		return 3;
	}, function (error) {
		console.log(error);
	});

	setTimeout(function () {
		t.then(function (data) {
			console.log(data);
		})
	},7000)


})();