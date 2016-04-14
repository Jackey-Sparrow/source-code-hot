## function

```
take the screen shot and email the pic

```

## usage


``` cordova
cordova plugin add https://github.com/Jackey-Sparrow/cordova-rib-screenshot.git

```


```js
 window.ribScreenshot.take('RIB Controlling Report', '', function (data) {
            //alert('data:' + data);
          }, function (err) {
            alert(err);
          });

```

## plugman usage

```
plugman create --name cordova-rib-screenshot --plugin_id cordova.rib.screenshot --plugin_version 0.0.1

cd cordova-rib-screenshot

plugman platform add --platform_name android
plugman platform add --platform_name ios

```