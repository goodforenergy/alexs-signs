'use strict';

// Speeds load of modules required by 'require' by caching their path
require('cache-require-paths');

var argv = require('yargs').argv,
    del = require('del'),
    gulp = require('gulp'),
    plugins = require('gulp-load-plugins')(),

    dest = 'build';

gulp.task('clean', function() {
    del(['build']);
});

gulp.task('build', ['js', 'sass', 'pages', 'resources']);

gulp.task('js', function() {
    return gulp.src('src/js/**/*.js')
        .pipe(plugins.babel({
            presets: ['es2015']
        }))
        .pipe(plugins.concat('signs.js'))
        .pipe(gulp.dest(dest));
});

gulp.task('sass', function() {
    return gulp.src('src/sass/**/*.scss')
        .pipe(plugins.sass())
        .pipe(plugins.concat('signs.css'))
        .pipe(gulp.dest(dest));
});

gulp.task('resources', function() {
    return gulp.src('src/resources/**/*')
        .pipe(plugins.changed(dest))
        .pipe(gulp.dest(dest));
});

gulp.task('pages', function() {
    return gulp.src('src/**/*.html')
        .pipe(plugins.changed(dest))
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
