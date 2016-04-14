var exec = require('cordova/exec');

module.exports = {
	take: function (title, message, success, failed) {
		exec(success, failed, 'CordovaRibScreenshot', 'screenshot', [title, message]);
	}
};
