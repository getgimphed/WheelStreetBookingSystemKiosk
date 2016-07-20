var app = angular.module('app',['ngRoute','bookingsController']);

app.config(['$routeProvider',function($routeProvider){
  $routeProvider.
  when('/Timings',{
    templateUrl: 'partials/timings.html',
    controller:  'TimingsController'
  }).when('/AvailableBikes',{
    templateUrl: 'partials/availableBikes.html',
    controller : 'AvailableBikesController'
  }).when('/RiderDetails',{
    templateUrl: 'partials/riderDetails.html',
    controller: 'RiderDetailsController'
  }).otherwise({
    redirectTo: '/Timings'
  });
}]);
