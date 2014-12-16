// Base App for Angular, that would wire up the remaining controllers / services etc.,

'use strict';


//all the directives will be added to this
var componentModule = angular.module('component', []);

//all the common / models are added to this.. so we can re-use across apps
var mmeApp = angular.module('mmeApp', ['ngResource', 'ngSanitize', 'component', 'ui.mask']);

var homeApp = angular.module('homeApp', ['mmeApp'])
  .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

    $locationProvider.html5Mode(false)
    $locationProvider.hashPrefix('!');


    $routeProvider
      .when('/home', {
        templateUrl: '/js/angular/views/home.html',
        controller: 'HomeCtrl'
      })
      .when('/live', {
        templateUrl: '/js/angular/views/live.html',
        controller: 'LiveCtrl'
      })
      .when('/hangout/:eventId/:token', {
        templateUrl: '/js/angular/views/hangout.html',
        controller: 'HangoutCtrl'
      })
      .when('/dashboard', {
        redirectTo: '/dashboard/playlist'
      })
      .when('/dashboard/:subtab', {
        templateUrl: '/js/angular/views/dashboard.html',
        controller: 'SubtabCtrl'
      })
      .when('/register', {
        templateUrl: '/register',
        controller: 'RegisterCtrl'
      })
      .when('/login', {
        templateUrl: '/js/angular/views/login.html',
        controller: 'LoginCtrl'
      })
      .when('/register/:subtab', {
        templateUrl: '/register',
        controller: 'RegisterCtrl'
      })
      .when('/artist', {
        redirectTo: '/artist/bio'
      })
      .when('/a/:user_id', {
        templateUrl: '/js/angular/views/artistbase.html',
        controller: 'ArtistSubtabCtrl'
      })
      .when('/a/:user_id/:subtab', {
        templateUrl: '/js/angular/views/artistbase.html',
        controller: 'ArtistSubtabCtrl'
      })
      .when('/artist/:subtab', {
        templateUrl: '/js/angular/views/artistbase.html',
        controller: 'ArtistSubtabCtrl'
      })
      .otherwise({
        redirectTo: '/home'
      });
  }]);
