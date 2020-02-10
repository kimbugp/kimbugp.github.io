"use strict";

// Load plugins
const autoprefixer = require("gulp-autoprefixer");
const browsersync = require("browser-sync").create();
const cleanCSS = require("gulp-clean-css");
const del = require("del");
const gulp = require("gulp");
const header = require("gulp-header");
const merge = require("merge-stream");
const plumber = require("gulp-plumber");
const rename = require("gulp-rename");
const sass = require("gulp-sass");
const imagemin = require('gulp-imagemin')
const uglify = require("gulp-babel-minify");
const changed = require('gulp-changed');
const useref = require('gulp-useref');



// Load package.json for banner
const pkg = require('./package.json');

// Set the banner content
const banner = ['/*!\n',
    ' * Kimbugwe Simon - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
    ' * Copyright 2019-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
    ' * Licensed under <%= pkg.license %> (https://github.com/kimbugp/<%= pkg.name %>/blob/master/LICENSE)\n',
    ' */\n',
    '\n'
].join('');

// BrowserSync
function browserSync(done) {
    browsersync.init({
        server: {
            baseDir: "./"
        },
        port: 3000
    });
    done();
}

// BrowserSync reload
function browserSyncReload(done) {
    browsersync.reload();
    done();
}

// Clean vendor
function clean() {
    return del(["./build/vendor/"]);
}

// Bring third party dependencies from node_modules into vendor directory
function modules() {
    let dst = './build/vendor/'
    // Bootstrap
    let bootstrap = gulp.src('./node_modules/bootstrap/dist/**/*')
        .pipe(gulp.dest(`${dst}bootstrap`));
    // Font Awesome CSS
    let fontAwesomeCSS = gulp.src('./node_modules/@fortawesome/fontawesome-free/css/**/*')
        .pipe(gulp.dest(`${dst}fontawesome-free/css`));
    // Font Awesome Webfonts
    let fontAwesomeWebfonts = gulp.src('./node_modules/@fortawesome/fontawesome-free/webfonts/**/*')
        .pipe(gulp.dest(`${dst}fontawesome-free/webfonts`));
    // jQuery Easing
    let jqueryEasing = gulp.src('./node_modules/jquery.easing/*.js')
        .pipe(gulp.dest(`${dst}jquery-easing`));
    // jQuery
    let jquery = gulp.src([
        './node_modules/jquery/dist/*',
        '!./node_modules/jquery/dist/core.js'
    ])
        .pipe(gulp.dest(`${dst}jquery`));
    return merge(bootstrap, fontAwesomeCSS, fontAwesomeWebfonts, jquery, jqueryEasing);
}

// CSS task
function css() {
    let cssSrc = "./src/scss/**/*.scss", cssDst = 'build/css';
    return gulp
        .src(cssSrc)
        .pipe(plumber())
        .pipe(sass({
            outputStyle: "expanded",
            includePaths: "./node_modules",
        }))
        .on("error", sass.logError)
        .pipe(autoprefixer({
            cascade: false
        }))
        .pipe(header(banner, {
            pkg: pkg
        }))
        .pipe(gulp.dest(cssDst))
        .pipe(rename({
            suffix: ".min"
        }))
        .pipe(cleanCSS())
        .pipe(gulp.dest(cssDst))
        .pipe(browsersync.stream());
}


// JS task
function js() {
    let jsSrc = './src/js/*.js', jsDst = 'build/js';
    return gulp
        .src([
            jsSrc
        ])
        .pipe(uglify())
        .pipe(header(banner, {
            pkg: pkg
        }))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(jsDst))
        .pipe(browsersync.stream());
}

//image task
function imgSquash() {
    let imgSrc = 'src/images/*.+(png|jpg|gif)', imgDst = 'build/images';
    return gulp.src(imgSrc)
        .pipe(changed(imgDst))
        .pipe(imagemin())
        .pipe(gulp.dest(imgDst))
        .pipe(browsersync.stream());
}

// Watch files
function watchFiles() {
    gulp.watch("./src/scss/**/*", css);
    gulp.watch(["./src/js/**/*", "!./js/**/*.min.js"], js);
    gulp.watch("./**/*.html", browserSyncReload);
}

function indexFile() {
    let src = '*.html', dst = 'build/';

    return gulp.src(src)
        .pipe(useref())
        .pipe(gulp.dest(dst))

}

// Define complex tasks
const vendor = gulp.series(clean, modules);
const build = gulp.series(vendor, gulp.parallel(css, js, imgSquash, indexFile));
const watch = gulp.series(build, gulp.parallel(watchFiles, browserSync));

// Export tasks
exports.css = css;
exports.js = js;
exports.image = imgSquash
exports.clean = clean;
exports.vendor = vendor;
exports.build = build;
exports.watch = watch;
exports.default = build;