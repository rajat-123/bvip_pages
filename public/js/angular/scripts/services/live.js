'use strict';

mmeApp.factory('live', ['$resource', function ($resource, $scope) {

  var Live = $resource('/live/:action',
    {
      action:'@action'
    },
    {
      'getCalendarEvents': { method:'GET', isArray: true, params: {action: 'get_calendar_events'}}
    });
  return Live;

 }]);  