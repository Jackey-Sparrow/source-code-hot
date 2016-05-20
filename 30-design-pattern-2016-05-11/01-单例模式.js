/**
 * Created by Jackey on 5/12/16.
 */


//单例模式

//1 对象字面量
var singleton1 = {
	name: ''
};


//2 普通单例
var singleton2 = function () {
	var name = 'Jackey';

	function showName() {
		console.log(name);
	}

	return {
		showName: showName
	};
};

var single = singleton2();
single.showName();


//3 使用的时候再初始化
var singleton3 = (function () {
	var instance;

	function init() {

		return {
			showName: function () {
				console.log('ddd');
			}
		}
	}

	return {
		getInstance: function () {
			if (!instance) {
				instance = init();
			}

			return instance;
		}
	}
})();

//4 其它实现方法
function Singleton4() {
	if (typeof Singleton4.instance === 'object') {
		return Singleton4.instance;
	}

	this.name = 'Jackey';
	Singleton4.instance = this;
}

var s1 = new Singleton4();
var s2 = new Singleton4();
//s1===s2;

//5 修改构造函数
function Singleton5() {
	var instance = this;

	this.name = 'Jackey';

	//rewrite constructor
	Singleton5 = function () {
		return instance;
	}
}