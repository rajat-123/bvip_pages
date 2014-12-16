'use strict';

/*
  @params -- ones starting with @ are provided by AngularJS, injecting 2 of them here 
  @param : user -- our service class injected by AngularJS
*/
var DashboardCtrl = function($routeParams, $scope, $resource, $location, user, media) {
  $scope.loadData = function(){

    $scope.artist_id = global_var.logged_user_id;

    user.getLoggedInUserDetails({}, function(data){      
      $scope.profile_pic_url = data[0].avatar;
      $scope.phase_id = data[0].phase_id;
      
      var statsArr = []
      statsArr.push($scope.buildStatsJson('likes',data[0].stats.likes, 'Likes'));
      statsArr.push($scope.buildStatsJson('views',data[0].stats.views, 'Views'));
      statsArr.push($scope.buildStatsJson('plays',data[0].stats.plays, 'Media Played'));
      statsArr.push($scope.buildStatsJson('shares',data[0].stats.shares, 'Shares'));

      $scope.sortedStats = {};
      $scope.sortedStats = _.sortBy(statsArr, function(stat){ return stat.count; })

    });

    user.getTopArtists({}, function(data){
      $scope.leaderboard_artists = data;
    });

    user.getUserPlaylist({user_id : global_var.logged_user_id}, function(data){
      $scope.userPlaylists = data;
    });

  }

  $scope.loadArtistPage = function(){
    $location.path('a/'+global_var.logged_user_id);
  }

  $scope.loadArtistSubPage = function(subPage){
    $location.path('a/' + $scope.nowPlaying.artist.id + '/' + subPage);
  }

  $scope.removeMediaFromPlaylist = function(){
    var self = this;
    media.removeFromPlaylist({media_id: self.media.id}, function(data){
      $scope.userPlaylists[0].songs.splice($scope.userPlaylists[0].songs.indexOf(self.media),1);
    });
  }

  $scope.playMedia = function(){
    media.play({object_id: this.media.media_id}, function(data){
    });
  }

  $scope.getArtistInfo = function(){
    $scope.nowPlaying = {};
    $scope.nowPlaying.artist = {}
    $scope.nowPlaying.mediaMetadata = {}

    $scope.nowPlaying.mediaMetadata.image = this.media.meta_data.cldy_url;
    $scope.nowPlaying.mediaMetadata.desc = this.media.desc;



    user.getUserDetails({user_id: this.media.artist_info.user_id}, function(data){
      $scope.nowPlaying.artist = data[0];         
      var artistImages = data[0].images;
      if(artistImages && artistImages.length > 0)
      {
        artistImages = artistImages.replace('{','');
        artistImages = artistImages.replace('}','');

        $scope.nowPlaying.artist.photos = artistImages.split(',');
        $scope.photos_length = $scope.nowPlaying.artist.photos.length;
        $scope.last_potrait = false; // Flag to display photos       
      }      
    });

  }

  $scope.buildStatsJson = function(key,val,displayTxt){
    var statsJson = {}
    statsJson.type = key;
    statsJson.count = val;
    statsJson.text = displayTxt;

    return statsJson;
  }  

  $scope.uploadPhoto = function(image_type,image_url){
    var mediaObj = {};
    mediaObj.image = {};
    mediaObj.image[image_type] = image_url;

    user.updateArtistMedia({media: mediaObj}, function(data){
      if (image_type == 'profile_image'){
        $scope.profile_pic_url = image_url;
      } 
    });    
  }
  $scope.loadData();
};
//associate the controller with the app as controller
homeApp.controller('DashboardCtrl', DashboardCtrl);

var SubtabCtrl = function($routeParams, $scope, $resource, user) {

  $scope.loadData = function(){

    var subtabName = $routeParams.subtab;
    $scope.subtab = {};
    $scope.subtab.name = subtabName;
    if(subtabName == 'create_event')
      $scope.subtab.url = "js/angular/views/dashboard/createEvent.html";
    else if(subtabName == 'playlist')
      $scope.subtab.url = "js/angular/views/dashboard/playlist.html";
    else if(subtabName == 'audition')
      $scope.subtab.url = "js/angular/views/dashboard/audition.html";
    else if(subtabName == 'account')
      $scope.subtab.url = "js/angular/views/dashboard/account.html";
    else if(subtabName == 'settings')
      $scope.subtab.url = "js/angular/views/dashboard/settings.html";
    else if(subtabName == 'funding')
      $scope.subtab.url = "js/angular/views/dashboard/funding.html";
    else if(subtabName == 'booked_event')
      $scope.subtab.url = "js/angular/views/dashboard/booked_event.html";
  }

  $scope.dashboardTemplateUrl = '/dashboard'
  $scope.pagebg.img = '/images/userbg.jpg';

  $scope.loadData();
 
};
//associate the controller with the app as controller
homeApp.controller('SubtabCtrl', SubtabCtrl);

var AccountCtrl = function($routeParams, $scope, $resource, $location, user) {
  $scope.loadData = function(){
    $scope.disableSubmit = false; 
    user.getLoggedInUserDetails({}, function(data){      
      $scope.user_info = {};
      $scope.address = {};
      $scope.user_info.first_name = data[0].first_name;
      $scope.user_info.last_name = data[0].last_name;
      $scope.user_info.phone_number = data[0].phone_number;
      $scope.user_info.email = data[0].email;
    });
  }

  //invoked from step2 form
  $scope.updateAccountInfo = function(){
    $scope.disableSubmit = true; 
    user.updateAccount($scope.user_info, function(data){
      //redirect the user to dashboard page now
      $location.path('/dashboard');
      $scope.disableSubmit = false; 
    });    
  }

  $scope.loadData();
};

var SettingsCtrl = function($routeParams, $scope, $resource, $location, user) {
  $scope.loadData = function(){
    $scope.disableSubmit = false; 
    $scope.selectedLevels = {};
    
    user.getSupporterLevels({}, function(data){   
      $scope.crowd_levels = data.crowd_levels;
      $scope.stats = data.stats;
      var preChosenLevels = _.filter($scope.crowd_levels, function(level){ return level.is_selected == true; });
      
      _.each(preChosenLevels, function(d) {$scope.selectedLevels[d.id] = true;})
    });
  }

  //invoked from st
  $scope.updateSupporterLevels = function(){
    $scope.disableSubmit = true; 
    //var currentChosenLevels = _.filter($scope.selectedLevels, function(level){ return level == true; });

    user.updateSupporterLevels($scope.selectedLevels, function(data){
      //redirect the user to dashboard page now
      $location.path('/dashboard');
      $scope.disableSubmit = false; 
    });  
  }

  $scope.loadData();
};

//associate the controller with the app as controller
homeApp.controller('AccountCtrl', AccountCtrl);

var EventCtrl = function($routeParams, $scope, $resource, $location, user){

  $scope.imgUploaded = function(){
    if(_.isEmpty($scope.event_image)) 
      return false;    
    return true; 
  }

  $scope.isFormInValid = function(){
    if($scope.image_upload_in_progress || (!$scope.imgUploaded()) )
      return true;
    return false; 
  }


  $scope.loadData = function(){
    $scope.disableSubmit = false; 
    $scope.time_slots = [  {name:"00:00", value:'12:00am'},{name:"00:30", value:"12:30am"},
                           {name:"01:00", value:"1:00am"}, {name:"01:30", value:"1:30am"},
                           {name:"02:00", value:"2:00am"}, {name:"02:30", value:"2:30am"},
                           {name:"03:00", value:"3:00am"}, {name:"03:30", value:"3:30am"},
                           {name:"04:00", value:"4:00am"}, {name:"04:30", value:"4:30am"},
                           {name:"05:00", value:"5:00am"}, {name:"05:30", value:"5:30am"},
                           {name:"06:00", value:"6:00am"}, {name:"06:30", value:"6:30am"},
                           {name:"07:00", value:"7:00am"}, {name:"07:30", value:"7:30am"},
                           {name:"08:00", value:"8:00am"}, {name:"08:30", value:"8:30am"},
                           {name:"09:00", value:"9:00am"}, {name:"09:30", value:"9:30am"},
                           {name:"10:00", value:"10:00am"},{name:"10:30", value:"10:30am"},
                           {name:"11:00", value:"11:00am"}, {name:"11:30", value:"11:30am"},
                           {name:"12:00", value:"12:00pm"}, {name:"12:30", value:"12:30pm"},
                           {name:"13:00", value:"1:00pm"}, {name:"13:30", value:"1:30pm"},
                           {name:"14:00", value:"2:00pm"}, {name:"14:30", value:"2:30pm"},
                           {name:"15:00", value:"3:00pm"}, {name:"15:30", value:"3:30pm"},
                           {name:"16:00", value:"4:00pm"}, {name:"16:30", value:"4:30pm"},
                           {name:"17:00", value:"5:00pm"}, {name:"17:30", value:"5:30pm"},
                           {name:"18:00", value:"6:00pm"}, {name:"18:30", value:"6:30pm"},
                           {name:"19:00", value:"7:00pm"}, {name:"19:30", value:"7:30pm"},
                           {name:"20:00", value:"8:00pm"}, {name:"20:30", value:"8:30pm"},
                           {name:"21:00", value:"9:00pm"}, {name:"21:30", value:"9:30pm"},
                           {name:"22:00", value:"10:00pm"}, {name:"22:30", value:"10:30pm"},
                           {name:"23:00", value:"11:00pm"}, {name:"23:30", value:"11:30pm"}
                           ];

  }

  $scope.createEvent = function(){
    $scope.event.timezone = $scope.timezone; 
    $scope.disableSubmit = true;
    $scope.event.image = $scope.event_image; 
    user.createEvent($scope.event, function(data){
      $location.path('/dashboard');
      $scope.disableSubmit = false;
    });
  }

  $scope.loadData();
  
};
homeApp.controller('EventCtrl', EventCtrl);

var FundingDtlsCtrl = function($routeParams, $scope, $resource, $location, user){

  $scope.loadData = function(){
    $scope.disableSubmit = false; 
    user.getGoalsDetails({user_id : global_var.logged_user_id}, function(data){ 
      $scope.rewards = [];
      $scope.goal_amount = data.goal_amount;      
      for(var i = 0; i < data.rewards.length; i++) {
        $scope.rewards.push(data.rewards[i]);
      } 
      var j = 4 - data.rewards.length;
      for(var i =0; i < j; i++){
        $scope.rewards.push({});
      }      
    });
  }

  $scope.recordFunding = function(){ 
    $scope.disableSubmit = true; 
    var check = _.reject($scope.rewards, function(v){
      return _.isEmpty(v.comment) && _.isEmpty(v.amount);
    });    
    if(check.length == 0) {
      $scope.setError("Please enter at least 1 reward");
      $scope.disableSubmit = false;
      return false;
    }    
    var goal_amt = {goal_amount: $scope.goal_amount};
    user.createGoal(goal_amt, check, function(data) {
      $scope.resetError();
      $scope.disableSubmit = false; 
      $location.path('/dashboard');
    });     
  }
  
  $scope.loadData();
};
homeApp.controller('FundingDtlsCtrl', FundingDtlsCtrl);

var BookedEventCtrl = function($routeParams, $scope, $resource, user, $location){

  $scope.loadData = function(){
    user.getBookedEvents({user_id : global_var.logged_user_id}, function(data){       
      $scope.booked_events = data; 
      $scope.link_url = $location.host();   
    });
  }
  $scope.loadData();
};
homeApp.controller('BookedEventCtrl', BookedEventCtrl);

