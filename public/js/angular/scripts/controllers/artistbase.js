'use strict';

//Base Controller for coding all the common methods across artist pages
var ArtistBaseCtrl = function($routeParams, $scope, $resource, $timeout, user, media) {

  //$('body').css('background-image', "url('')");
  $scope.pagebg.img = '';
  $scope.predicate = 'upload_time';
  $scope.artist = {}; 
  $scope.state = { selected: false };
  $scope.cur_tab = 'bio'; 

  $scope.setGlobalVar = function(loggedinId, nw_json){
    nw_json = $.parseJSON(nw_json);
    global_var.logged_user_id = loggedinId;
    global_var.logged_with_fb = nw_json.facebook; 
    global_var.logged_with_twitter = nw_json.twitter;
  }

  $scope.loggedWithFb = function(){
    return (global_var.logged_with_fb == 'true' && global_var.logged_user_id != -1) ? true : false; 
  }
  

  $scope.loggedWithTwitter = function(){
    return (global_var.logged_with_twitter == 'true' && global_var.logged_user_id != -1) ? true : false; 
  }

  $scope.setCurrentTab = function(value){
    $scope.cur_tab = value; 
  }

  $scope.getCurrentTab = function(){
    return $scope.cur_tab; 
  }

  $scope.isOwnProfile = function(){
    return current_artist_id == global_var.logged_user_id? true : false;
  }

  $scope.isLoggedIn = function(){
    return global_var.logged_user_id != -1 ? true : false;
  }


  $scope.toggle  = function(){
    $scope.state.selected = !($scope.state.selected);
  }

  $scope.getState = function(){
    return $scope.state.selected; 
  }

  $scope.loadData = function(){
    $scope.disableSubmit = false; 
    var artist_id = $scope.artist.id;
    $scope.already_liked_artist = false;

    user.getArtistBasicDtls({user_id: current_artist_id}, function(data){
      console.log(data)
      $scope.artist = data[0];
      console.log($scope.artist);

    })

  }
  
  $scope.likeArtist = function(){  
    if(!$scope.already_liked_artist) {
      $('.like').addClass('active');
      if(global_var.logged_user_id == -1) {      
        window.open('/auth/facebook?from=like&object=user&object_id='+$scope.artist.id,'Connect','toolbar=0,status=0,width=548,height=325');
      }
      else {
        user.likeArtist({object_id: $scope.artist.id}, function(data){
          $scope.artist.stats.likes += 1;      
        });
      } 
      $scope.already_liked_artist = true; 
    }   
  }
  
  $scope.likeAudio = function(){
    var self = this;      
    if(global_var.logged_user_id == -1) {      
      window.open('/auth/facebook?from=like&object=media&object_id='+self.audio.id,'Connect','toolbar=0,status=0,width=548,height=325');
    } else {
        media.like({object_id: self.audio.id}, function(data){
          self.audio.stats.likes += 1;   
        });   
    }
    self.audio.already_liked = true;            
  }

  $scope.playAudio = function(){
    var self = this;
    media.play({object_id: self.audio.id}, function(data){
      self.audio.stats.plays += 1;
    });
  }

  $scope.addMediaToPlaylist = function(evt){
    var media_id = -1; 
    if(this.audio) 
      media_id = this.audio.id;
    else if(this.video)       
      media_id = this.video.id;    
    media.addToPlaylist({media_id: media_id}, function(data){
      angular.element(evt.target).addClass('active');
      if (this.audio)
        this.audio.in_playlist = true;
      else if(this.video)
        this.video.in_playlist = true;
    });
  }

  $scope.playVideo = function(){
    media.play({object_id: this.video.id}, function(data){
      //TODO: handle success
    });
  }

  $scope.uploadPhoto = function(image_type,image_url){

    var mediaObj = {};
    mediaObj.image = {};
    mediaObj.image[image_type] = image_url;

    user.updateArtistMedia({media: mediaObj}, function(data){
      //TODO: fix the repeated use of .image, .image on the object in Ruby layer
      if (image_type == 'image'){
        $scope.userMedia.unshift({url: image_url, title: '', media_type: media.types.photo});
        // $scope.userMedia.push({url: image_url, title: '', media_type: media.types.photo, upload_time: (new Date().getTime())});
      } else if (image_type == 'background_image'){
        $('#actualImgView').css('background-image', "url("+image_url+")");
        $('#actualImgView').offset({ top: 0, left: 0 });
      }
    });    
  }

  $scope.changeBackgroundPos = function(url,top,left){
     $('#movableImgView').css('z-index', 10001);
     $('#movableImgView').css('opacity','0.5');
     $('#movableImgView').css('cursor','move');
     $('#movableImgView').css( 'background-color', 'rgba(255,255,255,0.5)');
  }

  $scope.updateBackgroundPos = function(url,top,left){
    var urlObj = {};
    urlObj.url = url;
    urlObj.topPos = top;
    urlObj.leftPos = left;

    $scope.media.image['background_image'] = JSON.stringify(urlObj);
    user.updateArtistMedia({media: $scope.media}, function(data){
      $('#movableImgView').css('z-index', 0);
      $('#movableImgView').css('cursor','auto');
      $('#movableImgView').css( 'background-color', 'rgba(255,255,255,0.1)');
    });
  }

  $scope.removePhoto = function(){
    var self = this;
    user.deleteUserMedia({media_id: this.photo.id}, function(data){
      $scope.userMedia.splice($scope.userMedia.indexOf(self.photo),1);
    });    
  }

  $scope.uploadAudio = function(){
    $scope.disableSubmit = true; 
    user.updateArtistMedia({media: $scope.media}, function(data){
      /*var stringify_metadata = JSON.stringify($scope.media.audio.meta_data);      
      //TODO: fix the repeated use of .image, .image on the object in Ruby layer
      $scope.userMedia.push({meta_data: stringify_metadata, url: $scope.media.audio.url, title: $scope.media.audio.title, media_type: media.types.audio, stats: {likes: 0, plays: 0, shares: 0}, upload_time: (new Date().getTime())});      
      */
      $scope.loadData();
      $scope.resetAudioForm();
    });
  }

  $scope.removeAudio = function(){
    var self = this;
    user.deleteUserMedia({media_id: self.audio.id}, function(data){
      $scope.userMedia.splice($scope.userMedia.indexOf(self.audio),1);
    });
  }

  $scope.uploadVideo = function(){
    $scope.disableSubmit = true; 
    user.updateArtistMedia({media: $scope.media}, function(data){
      //update the media object to current scope
      $scope.userMedia = _.reject($scope.userMedia, function(media_obj){ return media_obj.media_type == media.types.video});
      $scope.userMedia.push({url: $scope.media.video.url, title: $scope.media.video.title, media_type: media.types.video, stats: {likes: 0, plays: 0, shares: 0}, upload_time: (new Date().getTime())}); 
      $scope.resetVideoForm();      
      //location.reload();
    });    
  }

  $scope.updateText = function(key,val){
    $scope.artistdata = {}
    $scope.artistdata[key] = val;
    user.updateAccount($scope.artistdata, function(data){
      // if we need to show a msg, can be done here
    });
  }

  $timeout(function(){
    $scope.loadData();
  }, 0);  
};

//associate the controller with the app as controller
homeApp.controller('ArtistBaseCtrl', ArtistBaseCtrl);


var ArtistSubtabCtrl = function($routeParams, $scope, $resource, user) {

  $scope.loadData = function(){

    var subtabName = $routeParams.subtab;
    var artistId = $routeParams.user_id;

    $scope.subtab = {};
    $scope.subtab.name = subtabName;

    if(subtabName == 'bio')
      $scope.subtab.url = "/artist/bio";
    else if(subtabName == 'photos')
      $scope.subtab.url = "/artist/photos";
    else if(subtabName == 'supporter')
      $scope.subtab.url = "/artist/funding";
    // else if(subtabName == 'contest')
    //   $scope.subtab.url = "/artist/contest";
    // else if(subtabName == 'funding')
    //   $scope.subtab.url = "/artist/funding";
    else
      $scope.subtab.url = "/artist/funding";

    $scope.artistTemplateUrl = '/base/'+$routeParams.user_id;
  }

  $scope.loadData();
 
};
//associate the controller with the app as controller
homeApp.controller('ArtistSubtabCtrl', ArtistSubtabCtrl);

//Base Controller for coding all the common methods across artist pages
var ContestCtrl = function($routeParams, $scope, $resource, $timeout, user) {

  $scope.loadContest = function(){
    $scope.disableSubmit = false; 
    var artist_id = $scope.artist.id;
    user.getContests({user_id: artist_id}, function(data){     
      $scope.contests = data; 
    });
  }

  $scope.buyTickets = function(){ 
    $scope.disableSubmit = true;    
    var self = this;
    this.contest.available_seats -= 1; // Decrementing counter for responsive UI    
    user.buyTickets({event_id: self.contest.id});    
    $scope.disableSubmit = false;    
  }

  $timeout(function(){
    $scope.loadContest();
  }, 0);  
};

//associate the controller with the app as controller
homeApp.controller('ContestCtrl', ContestCtrl);

var SupporterCtrl = function($routeParams, $scope, $resource, $timeout, user) {

  $scope.loadData = function(){
    var artist_id = $scope.artist.id;
    // user.getFundingData({user_id: current_artist_id}, function(data){                 
    //   var recd_data = data;        
    //   _.each(recd_data.support_levels, function(level){        
    //       var crowd_data = (recd_data.crowd_supporters[level.id]);
    //       if(!_.isEmpty(crowd_data)) {
    //         level.max_participants = level.max_participants - crowd_data.count;
    //         level.crowds = crowd_data.crowds; 
    //       }                          
    //   });      
    //   $scope.recd_data = recd_data; 
    // });
  }

  $scope.pledge = function(){
    if($scope.artist.phase_id != 2)
      return;    
    if(global_var.logged_user_id == -1) {          
        window.open('/auth/facebook?payment=true&artist_id='+$scope.artist.id,'Connect','toolbar=0,status=0,width=548,height=325');
    } else {   
        $('.cardModal').show();
    }
  }

  $scope.closePreview = function() {
        $('#payment-form :input').val('');
        $('.cardModal').hide();
        $('#payment-form').find('.payment-errors').text(''); 
      }

  $scope.callStripe = function(){    
    var $form = $("#payment-form"); 
    Stripe.setPublishableKey('pk_test_9SBCSgDUGXSWmeBJ0bEdO6Ls');     
    $form.find('button').prop('disabled', true);      
    Stripe.createToken($form, $scope.stripeResponseHandler);      
  }

  $scope.stripeResponseHandler = function(status, response) {      
    var $form = $('#payment-form');   
    console.log(response);      
    if (response.error) {
      // Show the errors on the form
      $form.find('.payment-errors').text(response.error.message);
      $form.find('button').prop('disabled', false);
    } else {       
      $scope.funding.artist_id = $scope.artist.id;
      $scope.funding.stripe_token = response.id;
      user.pledgeFund($scope.funding, function(data){
        $form.find('.payment-errors').text('');     
        $form.find(':input').val('');
        $form.find('button').prop('disabled', false);      
        $('.cardModal').hide();  
        $scope.recd_data.artist_stats.pledged_amount += parseInt($scope.funding.amount);
        $scope.recd_data.crowd_stats.pledged_amount += parseInt($scope.funding.amount);
      }, function(err){          
        $form.find('button').prop('disabled', false);                     
        $form.find('.payment-errors').text(err.data.err_message);
      }); 
        
    }
  }

  $scope.loadData();  
}

homeApp.controller('SupporterCtrl', SupporterCtrl);