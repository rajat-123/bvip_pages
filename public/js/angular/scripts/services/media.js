'use strict';

//Model for Media object, we will have the get all, like, share related methods
mmeApp.factory('media', ['$resource', function ($resource, $scope) {

  //REST-API for the user is invoked from here
  var Media = $resource('/media/:action',
    {
      action:'@action'
    },
    {
      //like action for the given media_id
      'like': { method:'POST', params: {action: 'like'}},

      //Share action for a given media
      'share': {method: 'POST', params: {action: 'share'}},

      //Play action for a given media
      'play': {method: 'POST', params: {action: 'play'}},

      // Add media to user's playlist
      'addToPlaylist': {method: 'POST', params: {action: 'add_to_playlist'}},

      'removeFromPlaylist': { method:'DELETE', params: {action: 'remove_from_playlist'}},

      'getTopSongs': { method:'GET', isArray: true, params: {action: 'top_songs'}}

    }
  )
  Media.types = {photo: 0, audio: 1, video: 2};
  return Media;
}]);

