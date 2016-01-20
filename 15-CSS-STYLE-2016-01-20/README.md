## $('xx').css('') or  $('xx').css(property,value)
###### 发生什么事情，当你使用css方法的时候
---

关键知识点：
1. get property的时候
			element.style[camelize(property)] || getComputedStyle(element, '').computedStyle.getPropertyValue(property);
			getComputedStyle(element, '').computedStyle.getPropertyValue(property); 支持度为ie9+ chrome firefox opera safari
2 set property的时候
		this.style.cssText += ';' + css;//兼容写法

```

 var css = function(property, value) {

            //get property value
            if (arguments.length < 2) {
                var computedStyle, element = this[0];
                if (!element) {
                    return;
                }

                computedStyle = getComputedStyle(element, '');

                if (typeof property === 'string') {
                    //$('').css('width');
                    return element.style[camelize(property)] || computedStyle.getPropertyValue(property);
                } else if (Type.isArray) {
                    //$('').css(['width']);
                    var props = {};
                    $.each(property, function (_, prop) {
                        props[prop] = (element.style[camelize(prop)] || computedStyle.getPropertyValue(prop));
                    });
                    return props;
                }
            }

            //set property value
            var css = '';

            if (typeof property === 'string') {
                //$('').css('width',10);
                if (!value && value !== 0) {
                    //value = false
                    //value = '';
                    //value = undefined
                    //value = null
                    this.each(function () {
                        //移除属性
                        this.style.removeProperty(dasherize(property));
                    });
                } else {
                    //添加属性
                    css = dasherize(property) + ':' + maybeAddPx(property, value);
                }
            } else {
                //$('').css({'width',10});
                for (key in property) {
                    if (!property[key] && property[key] !== 0) {
                        //移除属性
                        this.each(function () {
                            this.style.removeProperty(dasherize(key));
                        });
                    } else {
                        //添加属性
                        css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';';
                    }
                }

            }

            return this.each(function () {
                this.style.cssText += ';' + css;
            });

        },

```
