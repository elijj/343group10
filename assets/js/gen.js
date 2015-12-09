
var myApp = angular.module('myApp', ['firebase'])
// Configure the app
/*.config(function($stateProvider) {
  $stateProvider
  .state('landing', { // Landing page
    url:'/',
    templateUrl: 'assets/html/landing.html', // HTML fragment
    controller: 'myCtrl', // Which controller 
  })
   .state('search', { // Landing page
    url:'/search',
    templateUrl: 'assets/html/search.html', // HTML fragment
    controller: 'myCtrl', // Which controller 
  })
  .state('current', { // About page
    url:'/current',
    templateUrl: 'assets/html/trip.html', // HTML fragment
    controller: 'AboutController', // Which controller 
  })
  .state('trips', { // About page
    url:'/trips',
    templateUrl: 'assets/html/trips.html', // HTML fragment
    controller: 'myCtrl', // Which controller 
  });*/


myApp.controller('myCtrl', function($scope, $http, $firebaseAuth, $firebaseArray, $firebaseObject){
    $http.get('/getCardInfo.php', function(data) {
       $scope.card = data;
    });
})
