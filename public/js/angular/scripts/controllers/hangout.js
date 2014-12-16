'use strict';

/*
  @params -- ones starting with @ are provided by AngularJS, injecting 2 of them here 
  @param : user -- our service class injected by AngularJS
*/
var HangoutCtrl = function($routeParams, $scope, $resource, media, user, event, live) {
  $scope.chat = {};
  $scope.pagebg.img = '/images/bandbg2.jpg';
  $scope.hangoutTemplateUrl = '/hngout/' + $routeParams.eventId + '/' + $routeParams.token;

  $scope.sendMessage = function(){
    user.hangoutMessage({is_artist: $scope.isPublisher(), message_type: "text", message_body: $scope.chat.msg, event_id: $scope.event_id}, function(data){
      $scope.chat.msg = '';
    })
  }

 $scope.loadEvent = function(event_id, ticket_token){
    //$scope.cur_event = _.findWhere(live.events(), {eventId: parseInt($routeParams.eventId)})
    user.getOTSession({event_id: event_id, ticket_token : ticket_token}, function(data){
      
      console.log(data);
      $scope.artist_first_name = data.artist_first_name;
      $scope.artist_last_name = data.artist_last_name;

      $scope.userMedia = []; // Making object for images. 
      $scope.role = data.role; 
      $scope.event_id = data.event_id;

      //this will trigger the directive to kickin
      $scope.max_publishers = 1;
      $scope.video_streams = data;
      user.hangoutMessage({is_artist: $scope.isPublisher(), message_type: "text", message_body: "has joined chat", event_id: $scope.event_id});
    }, function(err){      
      $scope.setError(err.data.err_message);
    });
  }

  $scope.isPublisher = function(){
    return $scope.role == "publisher";
  }

  $scope.uploadPhoto = function(image_url){
    user.hangoutMessage({is_artist: $scope.isPublisher(), message_type: "image", message_body: image_url, event_id: $scope.event_id })    
    // user.sendMessage({msg: "Artist has uploaded a photo"});    
  }

};
 
//associate the controller with the app as controller
homeApp.controller('HangoutCtrl', HangoutCtrl);