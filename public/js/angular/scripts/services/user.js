'use strict';

//Model for User object, consumed on listing / create flows
mmeApp.factory('user', ['$resource', function ($resource, $scope) {

  //REST-API for the user is invoked from here
  var User = $resource('/user/:action',
    {
      action:'@action'
    },
    {
      //define the user create as POST method
      'register': { method:'POST', params: {action: 'register'}},

      //define the user login as POST method
      'login': { method:'POST', params: {action: 'login'}},
      
      'hangoutMessage': { method:'POST', params: {action: 'hangout_message'}},      

      //define the user create as POST method
      'getTopArtists': { method:'GET', isArray: true, params: {action: 'top_artists'}},

      'getArtistBasicDtls': { method:'GET', isArray: true, params: {action: 'artist_basic_dtls'}}, 
      //updates the user artist page
      'updateArtist': { method:'PUT', params: {action: 'update_artist'}},

      'likeArtist': { method:'POST', params: {action: 'like'}},

      //updates the artist media
      'updateArtistMedia': { method:'PUT', params: {action: 'update_artist_media'}},

      //updates the user account page
      'updateAccount': { method:'PUT', params: {action: 'update_account'}},

      'getLoggedInUserDetails': { method:'GET', isArray: true, params: {action: 'loggedin_user_details'}},

      'getUserDetails': { method:'GET', isArray: true, params: {action: 'user_details'}},

      'getUserMedia': { method:'GET', isArray: true, params: {action: 'user_media'}}, 

      'getUserPlaylist': { method:'GET', isArray: true, params: {action: 'user_playlist'}}, 

      'getLikedItems': { method:'GET',  params: {action: 'liked_items'}}, 

      'deleteUserMedia': { method:'DELETE', params: {action: 'remove_user_media'}},

      'getContests': { method:'GET', isArray: true, params: {action: 'all_contests'}},

      'buyTickets': { method:'POST', params: {action: 'buy_tickets'}},    

      'createEvent': {method: 'POST', params: {action: 'create_event'}},

      'pledgeFund': {method: 'POST', params: {action: 'pledge_fund'}},

      'createGoal': {method: 'POST',isArray: true, params: {action: 'create_goal'}},

      'getGoalsDetails':{method: 'GET', params: {action: 'goal_details'}},

      'getFundingData': {method: 'GET', params: {action: 'supporter_details'}},

      'getBookedEvents': {method: 'GET',isArray: true, params: {action: 'booked_events'}},

      'getOTSession': { method:'GET', params: {action: 'ot_session'}},

      'getSupporterLevels': { method:'GET', params: {action: 'supporter_levels'}},

      'updateSupporterLevels': { method:'PUT', params: {action: 'update_supporter_levels'}}

    });

  return User;
 }]);