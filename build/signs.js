'use strict';

(function () {
    'use strict';

    $('.sgn-collapsable').on('hidden.bs.collapse', function (e) {
        $(e.currentTarget).removeAttr('style');
    });
})();