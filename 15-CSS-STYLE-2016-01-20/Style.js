/**
 * Created by Jackey Li on 2016/1/20.
 */

var cssNumber = {//����һЩ����Ҫ��pxΪ��׺��css����
    'column-count': 1,
    'columns': 1,
    'font-weight': 1,
    'line-height': 1,
    'opacity': 1,
    'z-index': 1,
    'zoom': 1
};

//תΪ�շ�
//dd-dd ->ddDd
//dd--dd-> ddDd
///-+(.)?/g һ�����߶��'-'�� ���һ��'.',ȫ������
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

//cssNumber�еĲ���Ҫ��px��׺����������Ҫ
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
                //�Ƴ�����
                this.style.removeProperty(dasherize(property));
            });
        } else {
            //�������
            css = dasherize(property) + ':' + maybeAddPx(property, value);
        }
    } else {
        //$('').css({'width',10});
        for (key in property) {
            if (!property[key] && property[key] !== 0) {
                //�Ƴ�����
                this.each(function () {
                    this.style.removeProperty(dasherize(key));
                });
            } else {
                //�������
                css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';';
            }
        }

    }

    return this.each(function () {
        this.style.cssText += ';' + css;
    });

}
