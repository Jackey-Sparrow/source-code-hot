```

/**
@param {string} [sName]
@param {string} [location]
@return {XMLHttpRequest}
*/
ActiveXObject = function(sName,location) {};

/**
@static
@type {number}
@const
*/
XMLHttpRequest.UNSENT = 0;
/**
@static
@type {number}
@const
*/
XMLHttpRequest.OPENED = 1;
/**
@static
@type {number}
@const
*/
XMLHttpRequest.HEADERS_RECEIVED = 2;
/**
@static
@type {number}
@const
*/
XMLHttpRequest.LOADING = 3;
/**
@static
@type {number}
@const
*/
XMLHttpRequest.DONE = 4;
/**
@type {Function}
*/
Object.defineProperty(XMLHttpRequest, "onreadystatechange", { set: function(value) {} });
/**
@type {number}
*/
XMLHttpRequest.prototype.readyState = 0;
/**
@type {string}
@const
*/
XMLHttpRequest.prototype.responseText = null;
/**
@type {string}
@const
*/
XMLHttpRequest.prototype.statusText = null;
/**
@type {number}
@const
*/
XMLHttpRequest.prototype.status = 0;
/**
@type {Document}
*/
XMLHttpRequest.prototype.responseXML = 0;
/**
@param {...Object} [options]
@constructor
*/
function XMLHttpRequest(options) {}
XMLHttpRequest.prototype.abort = function() {};
/**
@return {string}
*/
XMLHttpRequest.prototype.getAllResponseHeaders = function() {};
/**
@param {string} headerName
@return {string}
*/
XMLHttpRequest.prototype.getResponseHeader = function(headerName) {};
/**
@param {string} method
@param {string} url
@param {boolean} [async]
@param {string} [user]
@param {string} [password]
*/
XMLHttpRequest.prototype.open = function(method,url,async,user,password) {};
/**
@param {String|ArrayBuffer|Blob|Document|FormData} [data]
*/
XMLHttpRequest.prototype.send = function(data) {};
/**
@param {string} header
@param {string} value
*/
XMLHttpRequest.prototype.setRequestHeader = function(header,value) {};

/**
@static
@type {number}
@const
*/
XMLHttpRequestException.NETWORK_ERR = 101;
/**
@static
@type {number}
@const
*/
XMLHttpRequestException.ABORT_ERR = 102;
/**
@type {number}
@const
*/
XMLHttpRequestException.prototype.code = 0;
XMLHttpRequestException = {};

```