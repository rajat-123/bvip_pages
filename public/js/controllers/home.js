'use strict';

/* Controllers */

app
  // Flot Chart controller 
  .controller('FlotChartDemoCtrl', ['$scope', '$stateParams', '$state',  function($scope, $stateParams, $state) {
    var initDate;
    
    

    

    
  }]);


app
  // Flot Chart controller 
  .controller('HomeController', ['$scope', '$stateParams', 'event', function($scope, $stateParams ,event) {
    $scope.loading = true;
    event.get({ id: $stateParams.id }, function(response) {
      console.log(response);
      $scope.loading = false;
      $scope.tables_sold = response.stats.reservations.total;
      $scope.tables_unsold = response.event.tables.length - response.stats.reservations.total;
      $scope.tables_percentage = Math.round(($scope.tables_sold / response.event.tables.length) * 100);
      
      $scope.data = response;
    }, function(err) {
      $scope.loading = false;
    })
  }]);