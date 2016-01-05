/**
 * Created by lja on 2015/12/31.
 */

(function (window) {
	/**
	 * XMLHttpRequest
	 *
	 * events:
	 * abort() 取消当前响应
	 * getAllResponseHeaders() 把http响应头部作为未解析的字符串返回
	 * open(method,url,async,username,password) 初始化http请求的参数，但不发送请求(async默认为异步true)
	 * send(body) 发送请求
	 * setRequestHeader(name,value) 想一个打开但没发送的请求设置或者添加一个http请求
	 *      Host Connection Keep-Alive Accept-charset Accept-Encoding
	 *      If-Modified-Since If-Node-Match If-Range Range
	 */

	var readyState = {
		uninitialized: 0,//初始化状态 已被创建或者已被abort()方法重置
		open: 1,//已被调用，但是还没send()
		sent: 2,//已经send(),服务器没有响应
		receiving: 3,//响应头已经收到，响应体开始接收但是没有完成
		loaded: 4//http响应已经完全接收
	};

	var statusCode = {
		continue: 100,//服务器仅收到部分请求，但是一旦服务器并没有拒绝该请求，客户端应该继续发送其余的请求
		switchProtocols: 101,//服务器转换协议，服务器将遵从客户的请求转换到另外一种协议

		ok: 200,//请求成功
		created: 201,//请求被创建完成，同时新的资源被创建
		accepted: 202,//共处理的请求已经被接受，但是没有处理完成
		nonAuthoritativeInfo: 203,//文档已经正常地返回，但一些应答头可能不正确，因为使用的是文档的拷贝
		noContent: 204,//没有新文档。浏览器应该继续显示原来的文档。如果用户定期
		resetContent: 205,//
		partialContent: 206,//

		multipleChoices: 300,//
		movedPermanently: 301,//
		found: 302,//
		seeOther: 303,//
		notModified: 304,//
		useProxy: 305,//
		unUsed: 306,//
		temporaryRedirect: 307,//

		badRequest: 400,
		unAuthorized: 401,
		paymentRequired: 402,
		forbidden: 403,
		notFound: 404,
		methodNotAllowed: 405,
		notAcceptable: 406,
		proxyAuthenticationRequired: 407,
		requestTimeout: 408,
		conflict: 409,
		gone: 410,
		lengthRequired: 411,
		preconditionFailed: 412,
		requestEntityTooLarge: 413,
		requestUrlTooLong: 414,
		unSupportedmediaType: 415,
		unSati: 416,
		expectationFailed: 417,

		internalServerError: 500,
		notImplemented: 501,
		badGateWay: 502,
		serviceUnavailable: 503,
		gateWayTimeout: 504,
		httpVersionNotSupported: 505

	};

	var ajax = function (options) {

		if (!options.url) {
			throw new Error('url can\'t be null!');
		}

		var type = options.type.toUpperCase() || 'GET',
			url = options.url,
			success = options.success || noop,
			error = options.error || noop,
			data = options.data,
			async = options.async || true;

		var xmlHttp = createXMLHttp();

		//add location's search
		if (type === 'GET') {
			url += flattenSearch(data);
		}

		data = data ? type === 'GET' ? null : JSON.stringify(data) : null;

		if (xmlHttp) {
			xmlHttp.onreadystatechange = function () {
				if (xmlHttp.readyState === readyState.loaded) {
					if (xmlHttp.status === statusCode.ok) {
						success(xmlHttp.responseText);
					} else {
						error(xmlHttp.responseText);
					}
				}
			}

			xmlHttp.open(type, url, async);
			xmlHttp.send(data);
		}
	}

	function createXMLHttp() {

		var xmlHttp;

		if (window.XMLHttpRequest) {

			xmlHttp = new XMLHttpRequest();

		} else if (window.ActiveXObject) {
			//IE
			try {
				xmlHttp = new ActiveXObject('Msxml2.XMLHTTP');
			} catch (e) {
				try {
					xmlHttp = new ActiveXObject('Microsoft.XMLHTTP');//IE5 IE6
				} catch (e) {
					throw new Error('can\'t create XMLHttpRequest');
				}
			}
		}

		return xmlHttp;
	}

	function flattenSearch(params) {

		var result = [];

		for (var key in params) {
			if (params.hasOwnProperty(key)) {
				result.push(key + '=' + params[key]);
			}
		}

		if (!result.length) {
			return '';
		}

		return '?' + result.join('&');
	}

	function noop() {
	}

	window.ajax = ajax;

})(window);

