const gulp = require('gulp');
const util = require('gulp-util');

require('./gulptasks/app');
require('./gulptasks/deps');
require('./gulptasks/server');

gulp.task('default', function(){
    if(util.env.production){
        gulp.start('deps', 'server'); 
    }else{
        gulp.start('deps', 'app', 'server'); 
    }
});