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
	$scope.itineraries = $firebaseArray($scope.ref.child('itinerary'));//loads all interary objects in firebase **** NEEDS TO BE FOR USER
	$scope.events = $firebaseArray($scope.ref.child('events'));
	$scope.currentItinerary = key;
});
})