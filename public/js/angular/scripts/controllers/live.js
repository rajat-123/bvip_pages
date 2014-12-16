'use strict';

/*
  @params -- ones starting with @ are provided by AngularJS, injecting 2 of them here 
  @param : user -- our service class injected by AngularJS
*/

var LiveCtrl = function($routeParams, $scope, $resource, $location, user, live) {

 $scope.events = '';
 $scope.pagebg.img = "/images/background.jpg";
 var monthNames = [ "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December" ];
 
 $scope.scroll = {};

 $scope.redirectToArtist = function(artist_id){
  $location.path('a/'+artist_id);
 }

 $scope.getPrevious = function(){
  $scope.scroll.nextprev = "prev";  
  console.log($scope.scroll)
  var prev_date  = _.min($scope.events, function(e){
    return e.date.compareTime;
  })
  $scope.scroll.start_time = prev_date.start_time; 
  $scope.loadData();
 }

 $scope.getNext = function(){
  $scope.scroll.nextprev = "next";
  var next_date = _.max($scope.events, function(event){
    return event.date.compareTime;
  });
  $scope.scroll.start_time = next_date.start_time;
  $scope.loadData();
 }

$scope.getDaySuffix = function(day){
  switch (day)
    {
      case 1:
      case 21:
      case 31:
        return "st";
      case 2:
      case 22:
          return "nd";
      case 3:
      case 23:
          return "rd";
      default:
          return "th";
    }
}


 $scope.loadData = function(){    
  if(!_.isEmpty($scope.timezone)){
    $scope.scroll.timezone = $scope.timezone;
  } 
  live.getCalendarEvents($scope.scroll, function(data){

    $scope.events = data; 
    _.each($scope.events, function(event){
      console.log(event)
      event.date = {};
      var time = new Date(event.start_time);
      var hours = time.getHours();
      var minutes = time.getMinutes();
      var ampm = hours >= 12 ? 'P' : 'A';
      hours = hours % 12;
      hours = hours ? hours : 12; 
      minutes = minutes < 10 ? '0'+minutes : minutes;

      event.date.compareTime  = time.getTime(); // Used for comparing date objects
      event.date.time = hours + ":" + minutes  +  ampm;
      event.date.day = time.getDate();
      event.date.suffix = $scope.getDaySuffix(event.date.day);
      event.date.month = monthNames[time.getMonth()].toUpperCase(); 
      event.artist_truncatedbio = event.artist_bio.substring(0, 72) + "...";
    }) 
  });
 }

  $scope.loadData();

};

//associate the controller with the app as controller
homeApp.controller('LiveCtrl', LiveCtrl);
