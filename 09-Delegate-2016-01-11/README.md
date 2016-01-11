
### stopPropagation()

```

因为事件可以在各层级的节点中传递，不管是冒泡还是捕获，有时我们希望事件在特定的节点执行完之后不再传递
可以使用时间对象stopPropagation方法

支持度： IE8及以前版本都不支持

防止对事件流中当前节点的后续节点中的事件侦听器进行处理，此方法会立即生效

```

### stopImmediatePropagation()

```
防止对事件流中当前节点中和所有后续节点中的事件侦听器进行处理，此方法会立即生效

和stopPropagation的区别

$('p').click(function(e){
    console.log('会执行');
});

$('p').click(function(e){
    e.stopImmediatePropagation();
});

$('p').click(function(e){
    //不会执行
    console.log('不会执行');
});

```

### preventDefault()

```
<a href='/home' onclick='alert('hello')'>

点击该链接,显示对话框后，还会跳转页面。

preventDefault 可以阻止默认触发浏览器默认的动作。

```


### return false

```
推出执行。return false之后所有的触发事件和动作都不会被执行。

有时候可以用来代替stopPropagation 和 preventDefault

```