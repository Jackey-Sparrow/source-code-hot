
## 事件冒泡和事件捕获

```

事件冒泡：事件按照最特定的事件目标到嘴不特定的事件目标（document对象）的顺序出发
            事件从事件目标开始，往上冒泡到页面的最上一层标签
事件捕获：事件从最不精确的对象（document对象）开始触发，然后到最精确的特定对象
            事件从最上一层标签开始往下查找，知道捕获时间目标
```

### 用法

```
element.addEventListener(event,fn,useCapture);//事件 回调函数 是否捕获（默认为false，即冒泡）

IE: 只支持事件冒泡，不支持事件捕获，也不支持addEventListener
element.attachEvent(event,fn)

```

### 阻止事件的传播

```
1. stopPropagation()
2. IE下设置cancelBubble = true 或者设置window.event.returnValue = false
3. 阻止默认的时间preventDefault()

```

## 模拟submit/focus/blur/change事件的冒泡

```
blur focus load unload没有冒泡事件

除firefox外，都可使用focusin/focusout来代替focus/blur事件，firefox中在捕获阶段监听focus/blur事件

```
---

### focus blur兼容写法

```
if(document.addEventListener){
    el.addEventListener('focus',handler,true);//使用捕获机制来实现冒泡，这样父元素就能获得目标元素的focus和blur事件
    el.addEventListener('blur',handler,true);
}else{
    //IE:
    el.onfocusin = handler;//IE不支持捕获阶段，但是支持focusin和focusout
    el.onfocusout = handler;
}

```

### submit事件

```
在IE6-8下，submit不会冒泡到顶层，它只执行form元素的submit回调，冒泡到顶层，就提交跳转。
submit事件跟鼠标事件和键盘事件不一样，它是一种符合事件，既可通过鼠标事件也可以通过键盘事件实现

bug:
    如果我们通过鼠标或者键盘来触发submit事件，在IE9+以及其他标准浏览器会触发form元素以及祖先元素一直到window的submit事件，才会跳转。
    IE8-,只触发到form元素的submit事件就跳转了。他们都不会触发form元素绑定的submit事件的回调方法，因为submit事件的回调只能放到form元素中

怎么解决：
    我们对submit事件进行处理，如果出发了submit事件是，使用的是事件代理，那么就在代理元素上绑定2个事件，click keypress.
    如果是键盘事件，根据keycode是否为13，提交数据。
    如果是点击事件，根据input元素的type是否为submit，
    是的话就提交数据，手动模拟冒泡（因为IE8下，只能冒泡到form，因此需要手动模拟），把submit事件冒泡到window对象，就能出发submit事件了

最后：
    如果都没有阻止默认行为，就是通过el.submit()方法提交数据，惊醒跳转，是不会执行submit的回调的。
    而，click blur focus是会同时执行回调和默认行为的

reset事件和submit时间一样，解决方法也一样

```

### oninput事件

```
如果我们需要监听输入框内部的变化
    change: 只能等到失去焦点才会出发回调
    如果使用keydown keypress keyup这个几个键盘事件来监听，就监听不了右键的复制/粘贴/剪贴这些操作
    这个时候，我们就需要oninput事件了。

支持度： IE9 但是对回退键 粘贴复制操作的监听也失灵。用onkeydown解决回退键，oncut onpaste解决复制粘贴
        IE6-8使用onpropertychange事件监听元素的一切属性和特性的变化，因为可以通过它来模拟oninput事件

兼容写法:

    if(window.addEventListener){//IE9+,其他标准浏览器
        el.addEventListener('input',fn);
    }else{
        el.attachEvent('onpropertychange',function(e){
            if(e.propertyName === 'value'){
                fn();
            }
        });
    }

    //补丁
    if(IE9){
        var selectionChange = function(e){
            if(e.type==='focus'){
                document.addEventListener('selectionchange',fn);
            }else{
                document.removeEventListener('selectionchange',fn);
            }
        }

         el.addEventListener('focus',selectionChange);
            el.addEventListener('blur',selectionChange);
    }


```



