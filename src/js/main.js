(function() {
    'use strict';

    var template = Handlebars.compile($('#signs-template').html());

    $.getJSON('signs.json', function(data) {

        data.forEach(function(sign) {
            sign.id = sign.word.toLowerCase().match(/\w+/g).join('-');
        });

        $('body').append(template(data));
    });
}());
