import pkg from 'gulp';
const { task, src, dest, watch, series } = pkg;
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
const sass = gulpSass(dartSass);
import prefix from 'gulp-autoprefixer';
import { spawn } from 'child_process';
import browserSync, { reload, notify as _notify } from 'browser-sync';

var jekyll   = process.platform === 'win32' ? 'jekyll.bat' : 'jekyll';

// Build the Jekyll Site
task('jekyll-build', function (done) {
    return spawn( jekyll , ['build'], {stdio: 'inherit'})
        .on('close', done);
});

// Rebuild Jekyll and page reload
task('jekyll-rebuild', series('jekyll-build', function (done) {
    reload();
    done();
}));

// Compile files
task('sass', function () {
    return src('assets/css/scss/main.scss')
        .pipe(sass({
            outputStyle: 'expanded',
            onError: _notify
        }))
        .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(dest('_site/assets/css'))
        .pipe(reload({stream:true}))
        .pipe(dest('assets/css'));
});

// Compression images
task('img', function() {
	return src('assets/img/**/*')
		// .pipe(cache(imagemin()))
    .pipe(dest('_site/assets/img'))
    .pipe(reload({stream:true}));
});

// Watch scss, html, img files
task('watch', function () {
    watch('assets/css/scss/**/*.scss', series('sass'));
    watch('assets/js/**/*.js', series('jekyll-rebuild'));
    watch('assets/img/**/*', series('img'));
    watch(['*.html', '*.md', '_layouts/*.html', '_includes/*.html', '_pages/*.html', '_posts/*'], series('jekyll-rebuild'));
});

// Wait for jekyll-build, then launch the Server
task('browser-sync', series('sass', 'img', 'jekyll-build', function(done) {
    browserSync({
        server: {
            baseDir: '_site'
        },
        notify: false
    });
    done();
}));

//  Default task
task('default', series('browser-sync', 'watch'));
