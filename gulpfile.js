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
    fs = require('fs');

const paths = {
    src: {
        js: ['src/js/**/*.js'],
        sass: ['src/sass/**/*.scss'],
        resources: ['src/resources/**/*'],
        icons: ['src/img/icon.jpg'],
        pages: ['src/**/*.html'],
        handlebars: ['src/hb/list.handlebars']
    },
    tmp: {
        _base: 'tmp',
        icons: 'tmp/icons.html',
        list: 'tmp/list.handlebars'
    },
    dest: {
        _base: 'build',
        icons: 'build/icons',
        signs: '/build/signs.json'
    }
};

gulp.task('clean', function() {
    del([paths.dest._base, paths.tmp._base]);
});

gulp.task('build', ['js', 'sass', 'pages', 'resources']);

gulp.task('rebuild', ['clean', 'build']);

gulp.task('js', function() {
    return gulp.src(paths.src.js)
        .pipe(plugins.babel({
            presets: ['es2015']
        }))
        .pipe(plugins.concat('signs.js'))
        .pipe(gulp.dest(paths.dest._base));
});

gulp.task('sass', function() {
    const sassFilter = filter(['*', '**/*.scss'], { restore: true });

    return gulp.src(paths.src.sass)
        .pipe(sassFilter)
        .pipe(plugins.sass())
        .pipe(sassFilter.restore)
        .pipe(plugins.concat('signs.css'))
        .pipe(gulp.dest(paths.dest._base));
});

gulp.task('resources', function() {
    return gulp.src([...paths.src.resources, '!/**/*.json'])
        .pipe(plugins.changed(paths.dest._base))
        .pipe(gulp.dest(paths.dest._base));
});

gulp.task('icons', function() {
    let icons =
        gulp.src(paths.src.icons)
            .pipe(plugins.changed(paths.tmp._base))
            .pipe(gulp.dest(paths.tmp._base))
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
        .pipe(gulp.dest(paths.tmp._base));

    return icons
        .pipe(noHtmlFilter)
        .pipe(gulp.dest(paths.dest.icons));
});

gulp.task('pages', ['icons', 'handlebars'], function() {
    return gulp.src(paths.src.pages)
        .pipe(plugins.changed(paths.dest._base))
        .pipe(htmlreplace({
            icons: gulp.src(paths.tmp.icons),
            list: gulp.src(paths.tmp.list)
        }))
        .pipe(gulp.dest(paths.dest._base));

});

gulp.task('watch', ['build'], function() {
    gulp.watch(paths.src.sass, ['sass']);
    gulp.watch(paths.src.resources, ['resources', 'pages']);
    gulp.watch(paths.src.js, ['js']);
    gulp.watch(paths.src.pages, ['pages']);
});

gulp.task('serve', ['build'], function() {
    gulp.src(paths.dest._base)
        .pipe(plugins.webserver({
            host: argv.host || 'localhost',
            port: argv.port || '8004',
            livereload: true,
            open: 'index.html'
        }));
});

gulp.task('handlebars', function() {
    const dataFile = 'src/resources/signs.json';

    const sanitise = word => {
        if (!word.match(/\w+/g)) {
            return null;
        }
        return word.toLowerCase().match(/\w+/g).join('-');
    };

    handlebars.registerHelper('idSanitise', sanitise);

    return gulp.src(paths.src.handlebars)
        .pipe(data(function() {
            let data = JSON.parse(fs.readFileSync(dataFile));
            data.forEach(sign => {
                sign.id = sanitise(sign.word);
            });

            data.sort((a, b) => {
                return a.word.toLowerCase().localeCompare(b.word.toLowerCase());
            });

            // Save data so we can use it in the JavaScript to search through
            fs.writeFileSync(__dirname + paths.dest.signs, JSON.stringify(data, null, 4));

            return data.reduce((acc, sign) => {
                const letter = sign.word.substr(0, 1);
                acc[letter] = acc[letter] || [];
                acc[letter].push(sign);
                return acc;
            }, {});

        }))
        .pipe(gulpHandlebars())
        .pipe(gulp.dest(paths.tmp._base));
});
