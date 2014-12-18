'use strict';

/**
 * 0.1.1
 * Deferred load js/css file, used for ui-jq.js and Lazy Loading.
 * 
 * @ flatfull.com All Rights Reserved.
 * Author url: http://themeforest.net/user/flatfull
 */

angular.module('parent.query', [])
	.service('parentQuery', ['$document', '$q', '$timeout', '$resource',  function ($document, $q, $timeout, $resource) {

		var Live = $resource('/live/:action',
    {
      action:'@action'
    },
    {
      'getCalendarEvents': { method:'GET',  params: {action: 'get_calendar_events'}}
    });
  return Live;

		
}]);