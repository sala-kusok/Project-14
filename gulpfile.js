const gulp = require('gulp');
const sass = require('gulp-sass');
const plumber = require('gulp-plumber');
const autoprefixer = require('gulp-autoprefixer');
const sourceMaps = require('gulp-sourcemaps');
const cleanCss = require('gulp-clean-css');
const gulpIf = require("gulp-if");
const browserSync = require('browser-sync').create();
const del = require("del");
const svgSprite = require("gulp-svg-sprite");
const svgmin = require("gulp-svgmin");
const cheerio = require("gulp-cheerio");
const replace = require("gulp-replace");

//Массив путей
const config = {
    paths: {
        scss: 'scss/**/*.scss',
        html: '*.html',
        js: 'js/**/*.js',
        css: 'css/**/*.css',
        img: './images/img/**',
        svg: './images/svg/**/*.svg'
    },
    output: {
        path: 'build',
        pathJs: 'build/js',
        pathCss: 'build/css',
        pathImg: './build/img/'
    },
    isDevelop: true // false
}

//Таск для обработки sass файлов
gulp.task('sass', function () {
    return gulp.src('scss/style.scss')
        .pipe(plumber())
        .pipe(gulpIf(config.isDevelop, sourceMaps.init()))
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(gulpIf(!config.isDevelop, cleanCss()))
        .pipe(gulpIf(config.isDevelop, sourceMaps.write()))
        .pipe(gulp.dest(config.output.pathCss))
        .pipe(browserSync.reload({stream: true}));
});

//Таск для обработки html файлов
gulp.task('html', function () {
    return gulp.src(config.paths.html)
        .pipe(gulp.dest(config.output.path))
        .pipe(browserSync.reload({stream: true}));
});

//Таск для обработки js файлов
gulp.task('js', function () {
    return gulp.src(config.paths.js)
        .pipe(gulp.dest(config.output.pathJs))
        .pipe(browserSync.reload({stream: true}));
});

//Таск для обработки css файлов
gulp.task('css', function () {
    return gulp.src(config.paths.css)
        .pipe(gulp.dest(config.output.pathCss))
        .pipe(browserSync.reload({stream: true}));
});

//Таск для обработки png, jpg
gulp.task('img', function () {
    return gulp.src(config.paths.img)
        .pipe(gulp.dest(config.output.pathImg))
        .pipe(browserSync.reload({stream: true}));
});

//Таск для обработки svg
gulp.task('svg', function () {
    return gulp.src(config.paths.svg)
        .pipe(svgmin({
            js2svg: {
                pretty: true
            }
        }))
        .pipe(cheerio({
            run: function ($) {
                $('[fill]').removeAttr('fill');
                $('[stroke]').removeAttr('stroke');
                $('[style]').removeAttr('style');
            },
            parserOptions: {xmlMode: true}
        }))
        .pipe(replace('&gt;', '>'))
        // build svg sprite
        .pipe(svgSprite({
            mode: {
                symbol: {
                    sprite: "sprite.svg"
                }
            }
        }))
        .pipe(gulp.dest(config.output.pathImg));
});

//Таск для отслеживания изменений в файлах
gulp.task('serve', function () {
    browserSync.init({
        server: config.output.path
    });

    gulp.watch(config.paths.scss, gulp.series('sass'));
    gulp.watch(config.paths.html, gulp.series('html'));
    gulp.watch(config.paths.js, gulp.series('js'));
    gulp.watch(config.paths.css, gulp.series('css'));
    gulp.watch(config.paths.img, gulp.series('img'));
    gulp.watch(config.paths.svg, gulp.series('svg'));
});

//Таск для копирования файлов
gulp.task('copy', function () {
    return gulp.src([
        'js/**',
        'css/**',
        '*.html'
    ], {
        base: '.'
    })
        .pipe(gulp.dest(config.output.path));
});

//Таск для очистки папки build
gulp.task('clean', function () {
    return del(config.output.path);
});

//Таск по умолчанию, Запускает clean, copy, sass и serve
gulp.task('default', gulp.series('clean', gulp.parallel('copy', 'img', 'svg'), 'sass', 'serve'));