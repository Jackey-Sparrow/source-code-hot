/**
 * Created by Jackey Li on 2016/2/5.
 */
(function () {
    'use strict';

    var methods = ['set', 'get'];

    //one param: string
    //multi param
    //function
    //array
    function create() {
        if (arguments.length == 1) {
            //if(){}
        }

        //todo: loop
        var propertyName = '';
        var self = this;
        methods.forEach(function (method) {
            self[method + propertyName] = function () {

            };
        });
    }
})();