var bookingsController = angular.module('bookingsController',[]);

bookingsController.service('bookingsService',function(){
    // this.timings = {}; this.address = ''; this.lat     = ''; this.lng     = '';
});

bookingsController.controller('TimingsController',['$rootScope','$scope','$http','$location','bookingsService',function($rootScope,$scope,$http,$location,bookingsService){
  $scope.bookingsService = bookingsService;
  $scope.locationStatus = "Get My Location!";
  $scope.gpsStatus = "gps_not_fixed";
  $scope.btncolor  = "grey lighten-4";
  $scope.getBikes = function(){
    if ($scope.bookingsService.lat && $scope.bookingsService.lng && $scope.bookingsService.timings.dropoffTime && $scope.bookingsService.timings.pickupTime && $scope.bookingsService.timings.pickupDate && $scope.bookingsService.timings.dropoffDate){
      var pickupIsPm = $scope.bookingsService.timings.pickupTime.slice(-2) == 'PM';
      if (pickupIsPm){
        pickupTime = 12 + parseInt($scope.bookingsService.timings.pickupTime.slice(0,2));
      }
      else {
        pickupTime = parseInt($scope.bookingsService.timings.pickupTime.slice(0,2));
      }
      if(parseInt(pickupTime) < 10 )
        pickupTime = '0' + pickupTime;
      pickupTime = pickupTime + ':00:00';

      var dropoffIsPm = $scope.bookingsService.timings.dropoffTime.slice(-2) == 'PM';
      if (dropoffIsPm){
        dropoffTime = 12 + parseInt($scope.bookingsService.timings.dropoffTime.slice(0,2));
      }
      else {
        dropoffTime = parseInt($scope.bookingsService.timings.dropoffTime.slice(0,2));
      }
      if(parseInt(dropoffTime) < 10 )
        dropoffTime = '0' + dropoffTime;
      dropoffTime = dropoffTime + ':00:00';

      pickupDate  = $scope.bookingsService.timings.pickupDate;
      dropoffDate = $scope.bookingsService.timings.dropoffDate;
      start = pickupDate + 'T' + pickupTime;
      end   = dropoffDate + 'T' + dropoffTime;
      lat   = $scope.bookingsService.lat;
      lng   = $scope.bookingsService.lng;

      $http({
        method: 'GET',
        url: 'http://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + ',' + lng + '&sensor=true'
      }).then(function successCallback(response) {
          $scope.bookingsService.address = response.data.results[0].formatted_address;
        },function errorCallback(response) {

      });


      $http({
        method: 'GET',
        url: 'https://wheelstreet-imbs.herokuapp.com/api/getAvailableBikes/?start=' + start  + '&end=' + end + '&lat='+ lat + '&lng=' + lng
      }).then(function successCallback(response) {
        if(response.data.success == true)
        {
          $scope.bookingsService.availableBikes = response.data;
          $location.path('AvailableBikes');
        }
        else {
          Materialize.toast('Error Occured !!! Please Try again after reloading the page!', 6000)
        }
      },function errorCallback(response) {
        Materialize.toast(response.data.message + ' Try again with changed value!',6000);
      });
    }
    else {
      Materialize.toast('Fill all the Fields', 6000)
    }
  }

  $scope.getLocation = function(){
    if( !$scope.lat && !$scope.lng)
      Materialize.toast('Allow Location when prompted', 6000)
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition($scope.showPosition);

    } else {
        alert("Geolocation is not supported by this browser.")
      }
   }

  $scope.showPosition = function(position) {
    $scope.bookingsService.lat = position.coords.latitude;
    $scope.bookingsService.lng = position.coords.longitude;
    $scope.$apply(function(){
    if($scope.bookingsService.lat && $scope.bookingsService.lng){
        $scope.locationStatus = "Location Set!"
        $scope.gpsStatus = "my_location";
        $scope.btncolor  = "";
      }
     });
   }

}]);

bookingsController.controller('AvailableBikesController',['$rootScope','$scope','$http','$location','bookingsService',function($rootScope,$scope,$http,$location,bookingsService){
  $scope.bookingsService = bookingsService;
  $scope.count = {};
  if( typeof bookingsService.timings == "undefined" || bookingsService.timings == null )
    $location.path('Timings');
  $scope.address         = bookingsService.address;
  $scope.timings         = bookingsService.timings;
  $scope.availableBikes  = bookingsService.availableBikes;

  $scope.selectMyBike = function(bikeloc){
    if(bikeloc.bikes_quantity <= 0 ){
      Materialize.toast('Not available for this Selected Time Period ', 2000);
      return;
    }
    $scope.bookingsService.selectedBike = bikeloc;
  }

  $scope.modalConfirm = function(){
      if(! $scope.bookingsService.selectedBike){
        Materialize.toast('Select a Bike First! ', 3000);
        return;
      }
      if ( $scope.timings.dropoffTime && $scope.timings.pickupTime && $scope.timings.pickupDate && $scope.timings.dropoffDate ){
        $('#modalWindow').closeModal();
        $location.path('RiderDetails');
      }
      else{
        Materialize.toast('Input Data is not correct. Kindly Refresh the page and try again! ', 5000);
        return;
      }
  }
  $scope.setHours = function(){
    if (! $scope.timings.dropoffTime || ! $scope.timings.pickupTime || ! $scope.timings.pickupDate || ! $scope.timings.dropoffDate){
      Materialize.toast('Time Not Selected! ', 5000);
      return;
    }
    $scope.hours= 0;
    var pickupIsPm = $scope.bookingsService.timings.pickupTime.slice(-2) == 'PM';
    if (pickupIsPm){
      pickupTime = 12 + parseInt($scope.bookingsService.timings.pickupTime.slice(0,2));
    }
    else {
      pickupTime = parseInt($scope.bookingsService.timings.pickupTime.slice(0,2));
    }
    if(parseInt(pickupTime) < 10 )
      pickupTime = '0' + pickupTime;
    pickupTime = pickupTime + ':00:00';

    var dropoffIsPm = $scope.bookingsService.timings.dropoffTime.slice(-2) == 'PM';
    if (dropoffIsPm){
      dropoffTime = 12 + parseInt($scope.bookingsService.timings.dropoffTime.slice(0,2));
    }
    else {
      dropoffTime = parseInt($scope.bookingsService.timings.dropoffTime.slice(0,2));
    }
    if(parseInt(dropoffTime) < 10 )
      dropoffTime = '0' + dropoffTime;
    dropoffTime = dropoffTime + ':00:00';
    pickupDate  = $scope.timings.pickupDate;
    dropoffDate = $scope.timings.dropoffDate;
    start       = pickupDate + 'T' + pickupTime;
    end         = dropoffDate + 'T' + dropoffTime;
    hours       = ((moment.utc(moment(end).diff(moment(start)))._i)/3600000);
    $scope.hours= hours;
    return hours;
  }
  $scope.modifySearch = function(){
    if ($scope.bookingsService.lat && $scope.bookingsService.lng && $scope.bookingsService.timings.dropoffTime && $scope.bookingsService.timings.pickupTime && $scope.bookingsService.timings.pickupDate && $scope.bookingsService.timings.dropoffDate){
      var pickupIsPm = $scope.bookingsService.timings.pickupTime.slice(-2) == 'PM';
      if (pickupIsPm){
        pickupTime = 12 + parseInt($scope.bookingsService.timings.pickupTime.slice(0,2));
      }
      else {
        pickupTime = parseInt($scope.bookingsService.timings.pickupTime.slice(0,2));
      }
      if(parseInt(pickupTime) < 10 )
        pickupTime = '0' + pickupTime;
      pickupTime = pickupTime + ':00:00';

      var dropoffIsPm = $scope.bookingsService.timings.dropoffTime.slice(-2) == 'PM';
      if (dropoffIsPm){
        dropoffTime = 12 + parseInt($scope.bookingsService.timings.dropoffTime.slice(0,2));
      }
      else {
        dropoffTime = parseInt($scope.bookingsService.timings.dropoffTime.slice(0,2));
      }
      if(parseInt(dropoffTime) < 10 )
        dropoffTime = '0' + dropoffTime;
      dropoffTime = dropoffTime + ':00:00';

      pickupDate  = $scope.bookingsService.timings.pickupDate;
      dropoffDate = $scope.bookingsService.timings.dropoffDate;
      start = pickupDate + 'T' + pickupTime;
      end   = dropoffDate + 'T' + dropoffTime;
      lat   = $scope.bookingsService.lat;
      lng   = $scope.bookingsService.lng;

      $http({
        method: 'GET',
        url: 'https://wheelstreet-imbs.herokuapp.com/api/getAvailableBikes/?start=' + start  + '&end=' + end + '&lat='+ lat + '&lng=' + lng
      }).then(function successCallback(response) {
        if(response.data.success == true)
        {
          $scope.bookingsService.availableBikes = response.data;
        }
        else {
          Materialize.toast('Error Occured !!! Please Try again after reloading the page!', 6000)
        }
      },function errorCallback(response) {
        Materialize.toast(response.data.message + ' T with changed value!',6000);
      });
    }
    else {
      Materialize.toast('Fill all Time Fields', 6000)
    }
  }

}]);

bookingsController.controller('RiderDetailsController',['$rootScope','$scope','$http','$location','$window','bookingsService',function($rootScope,$scope,$http,$location,$window,bookingsService){
  if( typeof bookingsService.timings == "undefined" || bookingsService.timings == null || typeof bookingsService.selectedBike == 'undefined' || bookingsService.timings == null ){
    $location.path('Timings');
    return;
  }
  $scope.selectedBike = bookingsService.selectedBike;
  $scope.timings = bookingsService.timings;

  $scope.setHours = function(){
    $scope.hours= 0;
    if (! $scope.timings.dropoffTime || ! $scope.timings.pickupTime || ! $scope.timings.pickupDate || ! $scope.timings.dropoffDate){
      Materialize.toast('Time Not Selected! ', 5000);
      return false;
    }
    var pickupIsPm = $scope.timings.pickupTime.slice(-2) == 'PM';
    if (pickupIsPm){
      pickupTime = 12 + parseInt($scope.timings.pickupTime.slice(0,2));
    }
    else {
      pickupTime = parseInt($scope.timings.pickupTime.slice(0,2));
    }
    if(parseInt(pickupTime) < 10 )
      pickupTime = '0' + pickupTime;
    $scope.pickupTime = pickupTime + ':00:00';

    var dropoffIsPm = $scope.timings.dropoffTime.slice(-2) == 'PM';
    if (dropoffIsPm){
      dropoffTime = 12 + parseInt($scope.timings.dropoffTime.slice(0,2));
    }
    else {
      dropoffTime = parseInt($scope.timings.dropoffTime.slice(0,2));
    }
    if(parseInt(dropoffTime) < 10 )
      dropoffTime = '0' + dropoffTime;
    $scope.dropoffTime = dropoffTime + ':00:00';
    pickupDate         = $scope.timings.pickupDate;
    dropoffDate        = $scope.timings.dropoffDate;
    $scope.begin       = pickupDate + 'T' + $scope.pickupTime;
    $scope.end         = dropoffDate + 'T' + $scope.dropoffTime;
    $scope.hours       = ((moment.utc(moment($scope.end).diff(moment($scope.begin)))._i)/3600000);
    return $scope.hours;
  }

  $scope.hours = $scope.setHours();
  $scope.isDisabled = false;
  $scope.bookFinal = function(){
    if (typeof $scope.rider.riderName == "undefined" || $scope.rider.riderName == null || $scope.rider.riderName.length < 2 ){
      Materialize.toast('Provide right Rider name !', 3000);
      return false;
    }
    else if (typeof $scope.rider.riderMobile == "undefined" || $scope.rider.riderMobile == null || $scope.rider.riderMobile.length != 10 ){
      Materialize.toast('Provide right Rider mobile number !', 3000);
      return false;
    }
    else{
    }
    $scope.isDisabled = true;
    if ( $scope.begin && $scope.end ){
      if(!$scope.setHours()){
        Materialize.toast('Conflict in final booking! Timings not set ', 5000);
        return false;
      }
      $http({
        method: 'POST',
        url: 'https://wheelstreet-imbs.herokuapp.com/api/bookBikes/',
        data: {
          "bikes":
             [
                 {
                     "booking_quantity": "1",
                     "ven_loc_bikes_id": $scope.selectedBike.id
                 }
             ],
          "pickup_date": $scope.begin,
          "drop_off_date": $scope.end,
          "discount_amount": 0,
          "status": "initiated",
          "booking_source": "website",
          "delivery_amount": 0
          }
      }).then(function successCallback(response) {
        if(response.data.success == true)
        {
          $scope.booking_identifier = response.data.bookings.bookingDetails.booking_identifier
          $http({
            method: 'POST',
            url: 'https://wheelstreet-imbs.herokuapp.com/api/riderDetails/',
            data: {
            "booking_identifier": $scope.booking_identifier,
            "riderName" : $scope.rider.riderName,
            "riderMobile" : $scope.rider.riderMobile,
            "riderExtraHelmet" : $scope.rider.extraHelmet
            }
          }).then(function successCallback(response) {
            Materialize.toast('Rider Details Updated', 6000);
              $http({
                method: 'PATCH',
                url: 'https://wheelstreet-imbs.herokuapp.com/api/bookBikes/',
                data: {
                "booking_identifier": $scope.booking_identifier,
                "payment_status"    : "paid",
                "payment_method"    : "cash"
                }
              }).then(function successCallback(response) {
                Materialize.toast('Booking Successfully made', 6000);
                Materialize.toast('Your Order Id is WS' + response.data.booking.order_id, 600000);
                alert('Your Order Id is WS' + response.data.booking.order_id + '\nKindly note it Down for future reference');
                // $window.location = 'http://'+ window.location.hostname + ':8080/' ;
              },function errorCallback(response) {
                Materialize.toast(response.data.message,6000);
                Materialize.toast("Reload the page and retry !",6000);
            });

            },function errorCallback(response) {
              Materialize.toast(response.data.message,6000);
              $scope.isDisabled = false;

          });

        }
        else {
          Materialize.toast('Error Occured! Please Try again!', 6000);
        }

      },function errorCallback(response) {
        Materialize.toast(response.data.message,6000);
        Materialize.toast("Reload the page and retry !",6000);
        $scope.isDisabled = false;

      });
    }
    else {
      Materialize.toast('Rider Details are required. Timings Unevenly Modified! Reload the page and try again.', 5000);
    }
  }
}]);
