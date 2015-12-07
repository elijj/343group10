var myApp = angular.module('myApp', ['ui.router'])

// sets up the config states
.config(function($stateProvider) {
  
  $stateProvider  
    
    .state('discover', {
      url:'',
      templateUrl: 'templates/discover.html',
      controller: 'DiscoverController',
    })

    .state('trips', {
      url:'/trips',
      templateUrl: 'templates/trips.html',
      controller: 'TripsController',
    })

    .state('trip', {
      url:'/trip',
      templateUrl: 'templates/trip.html',
      controller: 'TripController',
    })

})

