(function() {
    'use strict';

    $('.sgn-collapsable').on('hidden.bs.collapse', e => {
        $(e.currentTarget).removeAttr('style');
    });
}());
