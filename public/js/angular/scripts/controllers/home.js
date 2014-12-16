'use strict';

/*
  @params -- ones starting with @ are provided by AngularJS, injecting 2 of them here 
  @param : user -- our service class injected by AngularJS
*/
var HomeCtrl = function($routeParams, $scope, $resource, $location, user) {
  $scope.loadData = function(){
    user.getTopArtists({}, function(data){
      $scope.top_artists = data;
    });
  }

  $scope.loadArtist = function(artist_name){
    $location.path('a/'+artist_name);
  }

  //used for getting the filtered list
  $scope.filterArtist = function(item, artist_type){
    console.log('filter: item = '+item+', type = '+artist_type);
    return item.artist_type === artist_type? true : false;
  }

  $scope.loadData();
  $scope.pagebg.img = "/images/background.jpg";
};
 
//associate the controller with the app as controller
homeApp.controller('HomeCtrl', HomeCtrl);