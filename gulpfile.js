'use strict';

// Speeds load of modules required by 'require' by caching their path
require('cache-require-paths');

var argv = require('yargs').argv,
    del = require('del'),
    gulp = require('gulp'),
    plugins = require('gulp-load-plugins')(),
    favicons = require("gulp-favicons"),
    htmlreplace = require("gulp-html-replace"),
    filter = require("gulp-filter"),
    handlebars = require('handlebars'),
    gulpHandlebars = require('gulp-handlebars-html')(handlebars), //default to require('handlebars') if not provided
    data = require('gulp-data'),
    fs = require('fs'),
    dest = 'build';

gulp.task('clean', function() {
    del(['build', 'tmp']);
});

gulp.task('build', ['js', 'sass', 'pages', 'resources']);

gulp.task('rebuild', ['clean', 'build']);

gulp.task('js', function() {
    return gulp.src(['src/js/**/*.js'])
        .pipe(plugins.babel({
            presets: ['es2015']
        }))
        .pipe(plugins.concat('signs.js'))
        .pipe(gulp.dest(dest));
});

gulp.task('sass', function() {
    const sassFilter = filter(['*', '**/*.scss'], {restore: true});

    return gulp.src(['src/sass/**/*.scss'])
        .pipe(sassFilter)
        .pipe(plugins.sass())
        .pipe(sassFilter.restore)
        .pipe(plugins.concat('signs.css'))
        .pipe(gulp.dest(dest));
});

gulp.task('resources', function() {
    return gulp.src(['src/resources/**/*', '!/**/*.json'])
        .pipe(plugins.changed(dest))
        .pipe(gulp.dest(dest));
});

gulp.task('icons', function() {
    let icons =
        gulp.src("src/img/icon.jpg")
        .pipe(plugins.changed('tmp'))
        .pipe(gulp.dest('tmp'))
        .pipe(favicons({
            appName: "Alex's Signs",
            appDescription: "",
            developerName: "goodforener.gy",
            developerURL: "http://goodforener.gy/",
            background: "#ffffff",
            path: "icons/",
            url: "http://signs.azurewebsites.net/",
            display: "standalone",
            orientation: "portrait",
            version: 1.0,
            logging: false,
            online: false,
            html: "icons.html",
            pipeHTML: true,
            replace: false
        }));

    const htmlFilter = filter('**/*.html');
    const noHtmlFilter = filter(['*', '!**/*.html']);

    icons
        .pipe(htmlFilter)
        .pipe(gulp.dest('./tmp'));

    return icons
        .pipe(noHtmlFilter)
        .pipe(gulp.dest('./build/icons'));
});

gulp.task('pages', ['icons', 'handlebars'], function() {
    return gulp.src('src/**/*.html')
        .pipe(plugins.changed(dest))
        .pipe(htmlreplace({
            icons: gulp.src('tmp/icons.html'),
            list: gulp.src('tmp/list.handlebars')
        }))
        .pipe(gulp.dest(dest));

});

gulp.task('watch', ['build'], function() {
    gulp.watch(['src/sass/**/*.scss'], ['sass']);
    gulp.watch('src/resources/**', ['resources']);
    gulp.watch('src/js/**/*.js', ['js']);
    gulp.watch('src/**/*.html', ['pages']);
});

gulp.task('serve', ['build'], function() {
    gulp.src('./build')
        .pipe(plugins.webserver({
            host: argv.host || 'localhost',
            port: argv.port || '8004',
            livereload: true,
            open: 'index.html'
        }));
});

gulp.task('handlebars', function() {
    const dataFile = 'src/resources/signs.json';

    handlebars.registerHelper('toLowerCase', function(str) {
        return str.toLowerCase();
    });

    handlebars.registerHelper('idSanitise', function(str) {
        return str
            .replace(/^[^A-Za-z0-9]+/, '')       // strip leading invalid characters
            .replace(/[^A-Za-z0-9]+$/, '')       // strip trailing invalid characters
            .replace(/[^A-Za-z0-9]+/g, '-');     // replace all blocks of invalid characters with a single hyphen

    });

    return gulp.src('src/hb/list.handlebars')
        .pipe(data(function() {
            let data = JSON.parse(fs.readFileSync(dataFile));
            data.forEach(sign => {
                sign.id = sign.word.toLowerCase().match(/\w+/g).join('-');
            });

            data.sort((a, b) => {
                return a.word.toLowerCase().localeCompare(b.word.toLowerCase());
            });

            return data.reduce((acc, sign) => {
                const letter = sign.word.substr(0, 1);
                acc[letter] = acc[letter] || [];
                acc[letter].push(sign);
                return acc;
            }, {});
        }))
        .pipe(gulpHandlebars())
        .pipe(gulp.dest('tmp'));
});
