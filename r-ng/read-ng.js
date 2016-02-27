/**
 * Created by lja on 2016-2-24.
 */
(function (window, document, undefined) {

	function minErr(module, ErrorConstructor) {
		ErrorConstructor = ErrorConstructor || Error;
		return function () {
			var SKIP_INDEXES = 2;

			var templateArgs = arguments,
				code = templateArgs[0],
				message = '[' + (module ? module + ':' : '') + code + '] ',
				template = templateArgs[1],
				paramPrefix, i;
				

			message += template.replace(/\{\d+\}/g, function (match) {
				var index = +match.slice(1, -1),
					shiftedIndex = index + SKIP_INDEXES;

				if (shiftedIndex < templateArgs.length) {
					return toDebugString(templateArgs[shiftedIndex]);
				}

				return match;
			});

			message += '\nhttp://errors.angularjs.org/1.4.6/' +
				(module ? module + '/' : '') + code;

			for (i = SKIP_INDEXES, paramPrefix = '?'; i < templateArgs.length; i++, paramPrefix = '&') {
				message += paramPrefix + 'p' + (i - SKIP_INDEXES) + '=' +
					encodeURIComponent(toDebugString(templateArgs[i]));
			}

			return new ErrorConstructor(message);
		};
	}


	function toDebugString(obj) {
		if (typeof obj === 'function') {
			return obj.toString().replace(/ \{[\s\S]*$/, '');
		} else if (isUndefined(obj)) {
			return 'undefined';
		} else if (typeof obj !== 'string') {
			return serializeObject(obj);
		}
		return obj;
	}

	function isUndefined(value) {
		return typeof value === 'undefined';
	}

	function serializeObject(obj) {
		var seen = [];

		return JSON.stringify(obj, function (key, val) {
			val = toJsonReplacer(key, val);
			if (isObject(val)) {

				if (seen.indexOf(val) >= 0) return '...';

				seen.push(val);
			}
			return val;
		});
	}

	function toJsonReplacer(key, value) {
		var val = value;

		if (typeof key === 'string' && key.charAt(0) === '$' && key.charAt(1) === '$') {
			val = undefined;
		} else if (isWindow(value)) {
			val = '$WINDOW';
		} else if (value && document === value) {
			val = '$DOCUMENT';
		} else if (isScope(value)) {
			val = '$SCOPE';
		}

		return val;
	}

	function isObject(value) {
		// http://jsperf.com/isobject4
		return value !== null && typeof value === 'object';
	}



})(window, document);
