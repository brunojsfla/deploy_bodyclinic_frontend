const gulp = require('gulp');
const watch = require('gulp-watch');
const webServer = require('gulp-webserver');

gulp.task('server', ['watch'], function(){
    return gulp.src('public').pipe(webServer({
        livereload: true,
        port: process.env.PORT || 8085,
        open: false
    }));
});

gulp.task('watch', function(){
    watch('app/**/*.html', () => gulp.start('app.html'));
    watch('app/**/*.css', () => gulp.start('app.css'));
    watch('app/**/*.js', () => gulp.start('app.js'));
    watch('assets/**/*.*', () => gulp.start('app.assets'));
});