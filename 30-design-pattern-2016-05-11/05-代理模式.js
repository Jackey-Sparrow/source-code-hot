/**
 * Created by mobilitymacbook on 5/12/16.
 */
var Girl = function(name){
	this.name = name;
};

var Dudu = function(girl){
	this.girl = girl;
	this.sendGift = function(gift){
		console.log('hi'+this.girl.name+', dudu send you '+ gift);
	};
};

var Proxy = function (girl) {
	this.girl = girl;
	this.sendGift= function (gift) {
		(new Dudu(girl)).sendGift(gift);
	};
};

var proxy = new Proxy(new Girl('Cassi'));
proxy.sendGift('flowers');