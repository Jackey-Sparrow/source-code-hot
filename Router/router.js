/**
 * Created by lja on 2016/1/4.
 */

(function (window) {
	function Router() {
	}

	Router.prototype.setUp = function (routeMap, defaultFn) {
		var that = this,
			rule, fn;

		this.routeMap = [];
		this.defaultFn = defaultFn;

		for (var rule in routeMap) {
			if (!routeMap.hasOwnProperty(rule)) {
				continue;
			}

			that.routeMap.push({
				rule: new RegExp(rule, 'i'),
				func: routeMap[rule]
			});
		}
	};

	Router.prototype.start = function () {
		var hash = location.hash,
			route, matchResult;
		for (var routeIndex in this.routeMap) {
			route = this.routeMap[routeIndex];
			matchResult = hash.match(route.rule);
			if (matchResult) {
				route.func.apply(window, matchResult.slice(1));
				return;
			}
		}
		this.defaultFn();
	};

	window.Router = Router;
})(window);

var router = new Router();

router.setUp({
	'#/list/(.*)/(.*)': function (cate, id) {
		console.log('list', cate, id);
	},
	'#/show/(.*)': function (cate, id) {
		console.log('list', cate, id);
	}
}, function () {
	console.log('dafault router');
});

router.start();