'use strict';

//Base controller, that can be used for keeping common logic etc.,
var BaseCtrl = function($routeParams, $scope, $location, media) {
  $scope.is_err = false;
  $scope.err_message = '';

  //will control the display of error display div
  $scope.isError = function(){
    return $scope.is_err;
  }

  $scope.resetError = function(){
    $scope.is_err = false;
  }

  $scope.setError = function(message){
    $scope.err_message = message;
    $scope.is_err = true;    
  }

  $scope.isLoggedIn = function(){
    return global_var.logged_user_id != -1 ? true : false;
  }

  $scope.showMediaPlayer = function(){
    // code to not show media player on hangout
    if($location.path().indexOf("hangout") == -1)
      return true;
    $('#mediaPlayer')[0].pause();
    return false;
  }

  $scope.getPlaylistData = function(){
    media.getTopSongs(function(data){
      $scope.systemPlaylist = data;
      $scope.initMediaPlayer();
    });
  }

  $scope.pagebg = {}
  $scope.pagebg.img = "/images/background.jpg";

  $scope.getPlaylistData();
}

//associate the controller with the app as controller
homeApp.controller('BaseCtrl', BaseCtrl);