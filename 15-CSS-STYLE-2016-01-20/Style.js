/**
 * Created by Jackey Li on 2016/1/20.
 */

var cssNumber = {//这是一些不需要加px为后缀的css集合
    'column-count': 1,
    'columns': 1,
    'font-weight': 1,
    'line-height': 1,
    'opacity': 1,
    'z-index': 1,
    'zoom': 1
};

//转为驼峰
//dd-dd ->ddDd
//dd--dd-> ddDd
///-+(.)?/g 一个或者多个'-'， 最多一个'.',全局搜索
function camelize(str) {
    return str.replace(/-+(.)?/g, function (match, chr) {
        return chr ? chr.toUpperCase() : '';
    });
}

function dasherize(str) {
    return str.replace(/::/g, '/')//dd::dd -> dd/dd
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')//'Ddddd'-> 'dDDD' 'DDdd'->'D_Ddd'
        .replace(/([a-z\d])([A-Z])/g, '$1_$2')//myName-> my_Name
        .replace(/_/g, '-')//
        .toLowerCase();
}

//cssNumber中的不需要加px后缀，其他的需要
function maybeAddPx(name, value) {
    return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value;
}

var css = function (property, value) {

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

}
