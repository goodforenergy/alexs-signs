(function() {
    'use strict';

    $('.sgn-collapsable').on('hidden.bs.collapse', e => $(e.currentTarget).removeAttr('style'));

    const filter$ = $('#sgn-filter');

    $.getJSON('signs.json', signsData => {

        filter$.on('input', () => {
            const val = filter$.val();

            if (!val) {
                $('.hidden').removeClass('hidden');
                return;
            }

            const { show, hide } = signsData.reduce((acc, sign) => {

                const { word, says, notes, id} = sign;

                // Check if word, says or notes contains the search term. If it does, save it to "show". If not, "hide"
                const showHide = `${word} ${says} ${notes}`.toLowerCase().includes(val) ? 'show' : 'hide';

                // Append what we have so far to the container id
                acc[showHide] = `${acc[showHide]}${acc[showHide] ? ', ' : ''}#${id}_container`;
                return acc;

            }, {show: '', hide: ''});

            $(show).removeClass('hidden');
            $(hide).addClass('hidden');

            // Hide all the keys, then show the ones that still have content in
            $('.wrapper .sgn-key').addClass('hidden');
            $(show).closest('.wrapper').find('.sgn-key').removeClass('hidden');
        });
    });
}());
