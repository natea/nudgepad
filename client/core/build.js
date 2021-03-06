var fs = require("fs"),
    exec = require('child_process').exec,
    os = require('os'),
    Space = require('space'),
    wrench = require('wrench'),
    util = require('util'),
    _ = require('underscore'),
    async = require('async')


var publicPath = __dirname + '/../public/'
var appsPath = __dirname + '/../apps/'
var corePath = __dirname + '/'
var JSINCLUDES = ''
var JSMIN = ''
var CSSINCLUDES = ''
var CSSMIN = ''
var HTMLCOMPONENTS = ''


/*** LIB FILES ***/
var externalLibs = 'jquery-1.9.1.min.js jquery.dimensions.js Lasso.js validateEmail.js ParseQueryString.js Permalink.js jquery.scrollbar.js ToProperCase.js ParseName.js jquery.topdiv.js blinker.js Spectrum.js underscore.js marked.js natural_sort.js store.js goog.js events.js parseCookie.js MoveCursorToEnd.js socket.io.js moment.min.js jquery.sha256.min.js space.js scraps.js thumbs.js platform.js'.split(/ /)
_.each(externalLibs, function (filename) {
  JSINCLUDES += '    <script type="text/javascript" src="/nudgepad/public/js/' + filename + '"></script>\n'
  JSMIN += fs.readFileSync(publicPath + 'js/' + filename, 'utf8') + ';'
})


/*** CORE FILES ***/

var jsFiles = _.without(fs.readdirSync(corePath + 'js'), '.DS_Store')
// Do some reordering
jsFiles = _.without(jsFiles, 'Nudgepad.js', 'App.js')
jsFiles.unshift('Nudgepad.js')
jsFiles.unshift('App.js')
_.each(jsFiles, function (filename) {
  JSINCLUDES += '    <script type="text/javascript" src="/nudgepad/core/js/' + filename + '"></script>\n'
  JSMIN += fs.readFileSync(corePath + 'js/' + filename, 'utf8') + ';'
})

var cssFiles = _.without(fs.readdirSync(corePath + 'css'), '.DS_Store')
_.each(cssFiles, function (filename) {
  CSSINCLUDES += '    <link rel="stylesheet" href="/nudgepad/core/css/' + filename + '" type="text/css"/>\n'
  CSSMIN += fs.readFileSync(corePath + 'css/' + filename, 'utf8')
})

var htmlFiles = _.without(fs.readdirSync(corePath + 'html'), '.DS_Store')
_.each(htmlFiles, function (filename) {
  HTMLCOMPONENTS += fs.readFileSync(corePath + 'html/' + filename, 'utf8')
})


/*** APPS ***/

var apps = _.without(fs.readdirSync(appsPath), '.DS_Store')
_.each(apps, function (appName) {
  var appDir = appsPath + appName + '/'
  
  var cssFiles = _.without(fs.readdirSync(appDir + 'css'), '.DS_Store')
  _.each(cssFiles, function (filename) {
    CSSMIN += fs.readFileSync(appDir + 'css/' + filename, 'utf8')
    CSSINCLUDES += '    <link rel="stylesheet" href="/nudgepad/apps/' + appName + '/css/' + filename + '" type="text/css"/>\n'
  })
  
  var jsFiles = _.without(fs.readdirSync(appDir + 'js'), '.DS_Store')
  _.each(jsFiles, function (filename) {
    JSMIN += fs.readFileSync(appDir + 'js/' + filename, 'utf8') + ';'
    JSINCLUDES += '    <script type="text/javascript" src="/nudgepad/apps/' + appName + '/js/' + filename + '"></script>\n'
  })
  
  var htmlFiles = _.without(fs.readdirSync(appDir + 'html'), '.DS_Store')
  _.each(htmlFiles, function (filename) {
    HTMLCOMPONENTS += fs.readFileSync(appDir + 'html/' + filename, 'utf8')
  })

})


// BUILD HTML FILES
var buildTemplate = function (destination, source) {
  var file = fs.readFileSync(source, 'utf8')
  file = file.replace(/\nCSSINCLUDES\n/, '\n' + CSSINCLUDES + '\n')
  file = file.replace(/\nJSINCLUDES\n/, '\n' + JSINCLUDES + '\n')
  file = file.replace(/\nHTMLCOMPONENTS\n/, '\n' + HTMLCOMPONENTS + '\n')
  fs.writeFileSync(destination, file, 'utf8')  
}

buildTemplate(publicPath + 'nudgepad.dev.html', corePath + '/nudgepad.dev.html')
buildTemplate(publicPath + 'nudgepad.min.html', corePath + '/nudgepad.min.html')

fs.writeFileSync(publicPath + 'nudgepad.dev.css', CSSMIN, 'utf8')
fs.writeFileSync(publicPath + 'nudgepad.dev.js', JSMIN, 'utf8')

// min.css and min.js are generated by makefile

