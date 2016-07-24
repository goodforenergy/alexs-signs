(function() {
    'use strict';

    Handlebars.registerHelper('toLowerCase', function(str) {
        return str.toLowerCase();
    });

    Handlebars.registerHelper('idSanitise', function(str) {
        return str
            .replace(/^[^A-Za-z0-9]+/, '')       // strip leading invalid characters
            .replace(/[^A-Za-z0-9]+$/, '')       // strip trailing invalid characters
            .replace(/[^A-Za-z0-9]+/g, '-');     // replace all blocks of invalid characters with a single hyphen
    });

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
    });
}());