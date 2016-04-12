/**
 * Created by mobilitymacbook on 4/13/16.
 */
module.exports = {
	alert: function(title, message, buttonLabel, successCallback) {
		cordova.exec(successCallback,
			null, // No failure callback
			"Alert",
			"alert",
			[title, message, buttonLabel]);
	}
};