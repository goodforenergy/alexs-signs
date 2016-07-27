'use strict';

(function () {
    'use strict';

    $('.sgn-collapsable').on('hidden.bs.collapse', function (e) {
        return $(e.currentTarget).removeAttr('style');
    });

    var filter$ = $('#sgn-filter');

    $.getJSON('signs.json', function (signsData) {

        filter$.on('input', function () {
            var val = (filter$.val() || '').toLowerCase();

            if (!val) {
                $('.hidden').removeClass('hidden');
                return;
            }

            var _signsData$reduce = signsData.reduce(function (acc, sign) {
                var word = sign.word;
                var says = sign.says;
                var notes = sign.notes;
                var id = sign.id;

                // Check if word, says or notes contains the search term. If it does, save it to "show". If not, "hide"

                var showHide = (word + ' ' + says + ' ' + notes).toLowerCase().includes(val) ? 'show' : 'hide';

                // Append what we have so far to the container id
                acc[showHide] = '' + acc[showHide] + (acc[showHide] ? ', ' : '') + '#' + id + '_container';
                return acc;
            }, { show: '', hide: '' });

            var show = _signsData$reduce.show;
            var hide = _signsData$reduce.hide;


            $(show).removeClass('hidden');
            $(hide).addClass('hidden');

            // Hide all the keys, then show the ones that still have content in
            $('.wrapper .sgn-key').addClass('hidden');
            $(show).closest('.wrapper').find('.sgn-key').removeClass('hidden');
        });
    });
})();