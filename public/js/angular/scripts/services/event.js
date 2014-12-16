'use strict';

//Model for Event object, consumed on listing / create flows
mmeApp.factory('event', ['$resource', function ($resource, $scope) {

  //REST-API for the user is invoked from here
  var Event = $resource('http://mme-api.herokuapp.com/v1/videochat/join/:eventId',
    {_jsonp: '@callback',eventId:'@eventId'},
    {
      'getOTSession': { method:'JSONP', params: {_jsonp: 'JSON_CALLBACK'}}
    });


  return Event;
 }]);