/**
 * Created by Jackey Li on 2016/5/11.
 */
(function () {
    'use strict';

    //大话设计模式：1.9紧耦合和松耦合
    function Operation() {
        this.numberA = 0;
        this.numberB = 0;
    }

    function OperationAdd() {
        Operation.call(this);
    }

    OperationAdd.prototype.getResult = function () {
        return this.numberA + this.numberB;
    };

    function OperationSub() {
        Operation.call(this);
    }

    OperationSub.prototype.getResult = function () {
        return this.numberA - this.numberB;
    };

    var operators = {
        add: '+',
        sub: '-'
    };

    //1.10   简单工厂模式
    function operationFactory(operator) {
        var operation;
        switch (operator) {
            case operator.add:
                operation = new OperationAdd();
                break;
            case operators.sub:
                operation = new OperationSub();
                break;
        }

        return operation;
    }


    var operator = operationFactory('+');
    operator.numberA = 1;
    operator.numberB = 1;
    console.log(operator.getResult());


})();