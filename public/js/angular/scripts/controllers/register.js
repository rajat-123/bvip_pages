'use strict';

//Controller for handling registration related flows
/*
  @params -- ones starting with @ are provided by AngularJS, injecting 2 of them here 
  @param : user -- our service class injected by AngularJS
*/
var LoginCtrl = function($routeParams, $scope, $resource, $location, user) {

  $scope.loginUser = function(){
    $scope.disableSubmit = true; 
    user.login($scope.account, function(data){
      //redirect the user to event page now
      global_var.logged_user_id = data.id; 
      $location.path('/dashboard');   
    }, function(err){
      $scope.setError(err.data.err_message);
      $scope.disableSubmit = false; 
    });
  }
  $scope.subtab = {};
  $scope.subtab.url = "/register/login";
};

homeApp.controller('LoginCtrl', LoginCtrl);

var RegisterCtrl = function($routeParams, $scope, $resource, $location, user) {

  //TODO: we need to move this out to a constants file
  $scope.states = ['CA', 'IO', 'NY', 'NJ'];
  $scope.disableSubmit = false; 
  $scope.artist_types = [{name:1, value:'I Represent Myself'}, {name:2, value:"I'm member of a Band"}, {name:3, value:"I'm a Music Freak"}];
  $scope.pagebg.img = "/images/background.jpg";

  var subtabName = $routeParams.subtab;
  $scope.subtab = {};
  $scope.subtab.name = subtabName;
  if(subtabName == 'step1')
    $scope.subtab.url = "/register/step1";
  else if(subtabName == 'step2')
  {
    if(global_var.logged_user_id == -1) {
      $location.path('/register/step1');          
      $scope.subtab.url = "/register/step1";      
    }   
    else
      $scope.subtab.url = "/register/step2";
  }  
  else
    $scope.subtab.url = "/register/step1";

  $scope.createAccount = function(){
    $scope.disableSubmit = true;
    $scope.account = _.extend($scope.user_info, {address: _.extend($scope.address, {country: 'USA'})});
    $scope.account = _.extend($scope.account, {access: {}})
    
    user.register($scope.account, function(data){
      //redirect the user to event page now
      $scope.setError("Thanks for creating an account");
      global_var.logged_user_id = data.id;       
      $location.path('/register/step2');      
    }, function(err){
      //some error occurred in user creation, need to stay on same page            
      $scope.setError(err.data.err_message);
      $scope.disableSubmit = false; 
    })
  }

  $scope.isStep2FormInValid = function() {
    if($scope.audio_upload_in_progress || $scope.image_upload_in_progress)
      return true;
    return false;
  }  

  $scope.skipToDashboard = function(){
    $location.path('/dashboard');
  }

  //invoked from step2 form
  $scope.saveArtistInfo = function(){
    $scope.disableSubmit = true; 
    user.updateArtist({user_info: $scope.user_info, media: $scope.media}, function(data){
      //TO-DO - merge update artist and media calls
    }); 

     user.updateArtistMedia({media: $scope.media}, function(data){
      //TO-DO - update the media object to current scope
      $location.path('/dashboard');
    });   
    $scope.disableSubmit = true; 
  }

  
};

//associate the controller with the app as controller
homeApp.controller('RegisterCtrl', RegisterCtrl);
