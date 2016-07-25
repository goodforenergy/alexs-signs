(function() {
    'use strict';

    (function initAfterglow() {
        if (typeof afterglow !== 'undefined') {
            afterglow.init();
        } else {
            setTimeout(initAfterglow, 50);
        }
    }());

    $('.sgn-collapsable').on('hidden.bs.collapse', e => {
        $(e.currentTarget).removeAttr('style');
    });
}());
