# http1.1 中有8中方法

### options

```
返回服务器针对特定资源所支持的http请求方法
也可以利用向web服务器发送***的请求来测试服务器的功能性

```

### head

```
向服务器索要与get请求一致的响应，只不过响应体将不会被返回
这一方法可以在不必要传输整个响应内容的情况下，就可以获取包含在响应消息头中的元信息

```

### get

```
向特定的资源发出请求。不会产生副作用

```


### post

```
向特定的资源提交数据进行处理请求（例如提交表单或者上传文件）。数据被包含在请求体中。
post请求可能会导致新的资源的建立或者已有资源的修改

```

### put

```
向指定资源位置上传最新内容

```

### delete

```
请求服务器删除request-url所标识的资源

```

### trace

```
回显服务器收到的请求，主要用于测试或者诊断

```

### connect

```
http1.1协议中与l预留给能将连接改为管道方式的代理服务器

```