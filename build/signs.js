'use strict';

(function () {
    'use strict';

    var template = Handlebars.compile($('#signs-template').html());

    $.getJSON('signs.json', function (data) {

        data.forEach(function (sign) {
            sign.id = sign.word.toLowerCase().match(/\w+/g).join('-');
        });

        data.sort(function (a, b) {
            return a.word.toLowerCase().localeCompare(b.word.toLowerCase());
        });

        var groups = data.reduce(function (acc, sign) {
            var letter = sign.word.substr(0, 1);
            acc[letter] = acc[letter] || [];
            acc[letter].push(sign);
            return acc;
        }, {});

        $('body').append(template(groups));

        $('.sgn-collapsable').on('hidden.bs.collapse', function (e) {
            $(e.currentTarget).removeAttr('style');
        });
    });
})();