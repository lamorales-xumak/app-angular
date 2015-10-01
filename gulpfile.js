'use strict';
//Modulos necesarios############################################################
var gulp = require('gulp'),
   connect = require('gulp-webserver'),
   jshint = require('gulp-jshint'),
   inject = require('gulp-inject'),
   wiredep = require('wiredep').stream,
   gulpif = require('gulp-if'),
   minify = require('gulp-minify-css'),
   minhtml = require('gulp-minify-html'),
   useref = require('gulp-useref'),
   uglify = require('gulp-uglify'),
   uncss = require('gulp-uncss'),
   del = require('del'),
   cache = require('gulp-ng-template'),
   imgmin = require('gulp-imagemin'),
   svgo = require('imagemin-svgo'),
   png = require('imagemin-optipng'),
   jpeg = require('imagemin-jpegtran'),
   gutil = require('gulp-util'),
   jshintfileoutput = require('gulp-jshint-html-reporter');
//Variables globales############################################################
var hostServer = '127.0.0.1';
var prtDesaLocal = '3595';
var prtDesaRemoto = '3599';
var prtProdLocal = '3695';
var prtProdRemoto = '3699';
var serverLocal = 'http://127.0.0.1:8080/xxxx/api/v.0.1/';
var serverRemoto = 'http://yyyy.azurewebsites.net/xxxx/api/v.0.1/';
var recurso = '/xxxx/api/v.0.1/';
//Supertareas###################################################################
gulp.task('desarrollo', ['server-desarrollo-local', 'vigilar']);
gulp.task('desarrollo-remoto', ['server-desarrollo-remoto', 'vigilar']);
gulp.task('compilar', ['comprimir']);
gulp.task('produccion', ['server-produccion-local']);
gulp.task('produccion-remoto', ['server-produccion-remoto']);
//DESAROLLO#####################################################################
//Tarea para levantar un servidor de desarrollo local
gulp.task('server-desarrollo-local', ['template', 'inyeccion', 'dependencia'], function() {
   gulp.src('app')
      .pipe(connect({
         host: hostServer,
         port: prtDesaLocal,
         livereload: {
            enable: true,
            filter: function(filename) {
               if (filename.match(/.js$/)) {
                  return false;
               }

               return true;
            }
         },
         fallback: 'index.html',
         proxies: [{
            source: recurso,
            target: serverLocal
         }],
         open: true
      }));
});
//Tarea para levantar un servidor de desarrollo remoto
gulp.task('server-desarrollo-remoto', ['template', 'inyeccion', 'dependencia'], function() {
   gulp.src('app')
      .pipe(connect({
         host: hostServer,
         port: prtDesaRemoto,
         livereload: {
            enable: true,
            filter: function(filename) {
               if (filename.match(/.js$/)) {
                  return false;
               }

               return true;
            }
         },
         fallback: 'index.html',
         proxies: [{
            source: recurso,
            target: serverRemoto
         }],
         open: true
      }));
});
//Tarea para buscar estilos y javascript en los archivos del proyecto para inyectarlos en pagina principal
gulp.task('inyeccion', function() {
   var sources = gulp.src(['./app/js/**/*.js', './app/css/**/*.css', '!./app/css/creador*.css']);
   return gulp.src('index.html', {
         cwd: './app'
      })
      .pipe(inject(sources, {
         read: false,
         ignorePath: '/app'
      }))
      .pipe(gulp.dest('./app'));
});
//Tarea para inyectar las librerias de terceros instaladas mediante bower
gulp.task('dependencia', function() {
   return gulp.src('./app/index.html')
      .pipe(wiredep({
         directory: './app/lib'
      }))
      .pipe(gulp.dest('./app'));
});
//Tarea para busqueda de errores y mostrarlos en pantalla
gulp.task('analizar', function() {
   return gulp.src(['./app/js/**/*.js'])
      .pipe(jshint('.jshintrc'))
      .pipe(jshint.reporter('jshint-stylish'))
      .pipe(jshint.reporter('gulp-jshint-html-reporter', {
         filename: 'analisis/resultado-analisis.html',
         createMissingFolders : true
      }));
});
//Task para convertir las plantillas en templates
gulp.task('template', function() {
   return gulp.src('./app/html/**/*.html')
      .pipe(minhtml())
      .pipe(cache({
         prefix: 'html/',
         moduleName: 'templates',
         standalone: true,
         filePath: 'templates.js'
      }))
      .pipe(gulp.dest('./app/js'));
});
//Tarea que vigila cambios en los archivos html, css y ejecuta la tarea de actualizacion del navegdor
gulp.task('vigilar', function() {
   gulp.watch(['./app/css/**/*.css'], ['inyeccion']);
   gulp.watch(['./app/js/**/*.js', '!./app/js/templates.js'], ['inyeccion']);
   gulp.watch(['./app/js/**/*.js', './gulpfile.js'], ['analizar']);
   gulp.watch(['./app/html/**/*.html'], ['template']);
   gulp.watch(['./bower.json'], ['dependencia']);
});
//PRODUCCION####################################################################
//Tarea para el servidor de Produccion Local
gulp.task('server-produccion-local', ['comprimir'], function() {
   gulp.src('dist')
      .pipe(connect({
         host: hostServer,
         port: prtProdLocal,
         livereload: false,
         fallback: 'index.html',
         proxies: [{
            source: recurso,
            target: serverLocal
         }],
         open: true
      }));
});
//Tarea para el servidor de Produccion Remoto
gulp.task('server-produccion-remoto', ['comprimir'], function() {
   gulp.src('dist')
      .pipe(connect({
         host: hostServer,
         port: prtProdRemoto,
         livereload: false,
         fallback: 'index.html',
         proxies: [{
            source: recurso,
            target: serverLocal
         }],
         open: true
      }));
});
//Tarea para limpiar directorio dist
gulp.task('limpiar', function() {
   return del(['./dist/**/*.*']);
});
//Tarea para comprimmir los archivos js y css, para luego copiarlos a la carpeta dist
gulp.task('comprimir', ['copiar'], function() {
   return gulp.src('./app/index.html')
      .pipe(useref.assets())
      .pipe(gulpif('*.js', uglify({
         mangle: true
      })).on('error', gutil.log))
      .pipe(gulpif('*.css', minify()))
      .pipe(gulp.dest('./dist'));
});
//Tarea para copiar index.html a la carpeta dist
gulp.task('copiar', ['limpiar'], function() {
   gulp.src('./app/img/*.svg')
      .pipe(svgo()())
      .pipe(gulp.dest('dist/img'));

   gulp.src('./app/img/*.png')
      .pipe(png({
         optimizationLevel: 3
      })())
      .pipe(gulp.dest('dist/img'));

   gulp.src('./app/img/*.jpg')
      .pipe(jpeg({
         progressive: true
      })())
      .pipe(gulp.dest('dist/img'));

   gulp.src('./app/lib/angular-ui-grid/*.{ttf,woff,eof,svg}')
      .pipe(gulp.dest('./dist/css'));

   return gulp.src('./app/index.html')
      .pipe(useref())
      .pipe(minhtml())
      .pipe(gulp.dest('./dist'));
});
//Tarea para quitar css que no se utiliza
gulp.task('uncss', function() {
   return gulp.src('./dist/css/style.min.css')
      .pipe(uncss({
         html: [
            './app/index.html',
            './app/html/**/*.html'
         ]
      }))
      .pipe(minify())
      .pipe(gulp.dest('./dist/css/style.min.css'));
});
