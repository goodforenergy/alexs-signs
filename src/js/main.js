(function() {
    'use strict';

    const template = Handlebars.compile($('#signs-template').html());

    $.getJSON('signs.json', function(data) {

        data.forEach(sign => {
            sign.id = sign.word.toLowerCase().match(/\w+/g).join('-');
        });

        data.sort((a, b) => {
            return a.word.toLowerCase().localeCompare(b.word.toLowerCase());
        });

        const groups = data.reduce((acc, sign) => {
            const letter = sign.word.substr(0, 1);
            acc[letter] = acc[letter] || [];
            acc[letter].push(sign);
            return acc;
        }, {});

        $('body').append(template(groups));

        $('.sgn-collapsable').on('hidden.bs.collapse', e => {
            $(e.currentTarget).removeAttr('style');
        });
    });
}());
