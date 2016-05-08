/**
 * Created by Jackey Li on 2016/5/7.
 */
(function (global, factory) {

    if (typeof module === 'object' && typeof module.exports === 'object') {
        //var jQuery = require("jquery")(window);
        module.exports = glbal.document ? factory(global, true) : function (w) {
            if (!w.document) {
                throw new Error('');
            }
            return factory(w);
        };
    } else {
        factory(global);
    }


})(typeof window !== 'undefined' ? window : this, function (window, noGlobal) {

    }
);