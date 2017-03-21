var gulp = require('gulp');
var runSequence = require('run-sequence');
var testRoutes	= require('./tasks/routes');
var configFiles = require('./config');

//console.log("config files", configFiles);
GLOBAL._    = require('lodash');
//GLOBAL.U        = require('../services').utils;
GLOBAL.config     = require('config');
GLOBAL.Promise    = require('bluebird');
config            = _.assign(config, configFiles);
//console.log("config-->", testRoutes)
var plugins   = require('gulp-load-plugins')({
  scope         : ['devDependencies'],
  pattern       : ['gulp-*', 'gulp.*'],
  replaceString : /\bgulp[\-.]/
});


GLOBAL.console      = require('better-console');
GLOBAL.argv         = require('minimist')(process.argv.slice(2));
GLOBAL.NODE_ENV     = argv.NODE_ENV || 'local';
GLOBAL.dummyData    = require('./tasks/data')[NODE_ENV];
//[stats, online, boxoffice]
GLOBAL.currentApp   = argv.app ? '/'+argv.app : "";
GLOBAL.useCookie    = argv.cookie || false;
GLOBAL.cartData     = {};

function getModuleCommand(){
  return argv._[0];
}
var moduleCommand = getModuleCommand()
//console.log("argv->", moduleCommand);
//Set configuration settings
config.settings = config[NODE_ENV] || config['local'];

//Set base url
GLOBAL.baseUrl = config.settings.host+':'+config.settings.port;

GLOBAL.appUrl  = baseUrl + currentApp;


if(ciRequestStatus){
  //GLOBAL.appUrl       = 'http://bron.mappp.dev:3000';
  GLOBAL.appUrl         = 'http://localhost:3000';
  GLOBAL.interfaceTYPE      = 'online';
}

//console.log("appUrl", appUrl);
console.log("Test running on %s app with server url %s and in %s environment", currentApp, baseUrl, NODE_ENV)

process.env.NODE_ENV  = 'test';

//console.log("plugins", plugins);
gulp.task('test-routes', function(){
	return runSequence('test-auth');
});

gulp.task('test-auth', function(){
    return gulp.src('./tasks/routes/auth.js')
  .pipe(plugins.mocha({ reporter: 'spec' }))
    //.on('error', plugins.util.log);
})
