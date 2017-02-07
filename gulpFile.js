var NwBuilder = require('nw-builder');
var gulp = require('gulp');
var gutil = require('gulp-util');
var glob = require('simple-glob');
var exec = require('child_process').execSync;
 
var getNW = function (run, dbg) {

    var files = [ 'package.json', 'index.html', 'scripts/**', 'shaders/*', 'images/*', 'fonts/*', 'css/*', 'sounds/*', 'music/*' ];

    //files.push('node_modules/lowdb/**');
    //files.push('node_modules/open/**');

    var nw = new NwBuilder({
        version: '0.20.1',
        files: glob(files),
        flavor: dbg ? 'sdk' : 'normal',
        platforms: run ? ['win64'] : ['win64', 'osx64', 'linux64' ], // change this to 'win' for/on windows
        zip: true
    });

    // Log stuff you want
    nw.on('log', function (msg) {
        gutil.log('nw-builder', msg);
    });

    return nw;

};

var setIcons = function (done, dbg) {
    if (done) {
        done();
    }
};

gulp.task('build', function () {

    var nw = getNW();
 
    // Build returns a promise, return it so the task isn't called in parallel
    return nw.build().catch(function (err) {
        setIcons();
        gutil.log('nw', err);
    });

});

gulp.task('run', function () {

    var nw = getNW(true);
 
    return nw.build().then(function(){
        setIcons(function(){
            exec("BSWR.exe", {
                'cwd': 'build/BSWR/win64/'
            });
        });
    }).catch(function (err) {
        gutil.log('nw', err);
    });

});

gulp.task('debug', function () {

    var nw = getNW(true, true);
 
    return nw.build().then(function(){
        setIcons(function(){
            exec("BSWR.exe", {
                'cwd': 'build/BSWR/win64/'
            });
        }, true);
    }).catch(function (err) {
        gutil.log('nw', err);
    });

});