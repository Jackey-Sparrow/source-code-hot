### arguments 到底是什么
---

#### arguments类型
####### [object Arguments]

```
var string = {}.toString;

var f = function () {

        string.call(arguments);//[object Arguments]
        typeof arguments;//object
        console.log(arguments);// [1,2,3,'d','e']
                               // callee:function f;(指向调用的函数，就是f)
                               // length:5
                               // Symbol(Symbol.iterator):function values()
                               //__proto_: Object

    }

f(1, 2, 3, 'd', 'e');

1 不是数组，但是能使用arguments[index], 不具备数组的方法，如果需要，可以转换
    var xx = Array.prototype.slice.call(arguments,0);


```