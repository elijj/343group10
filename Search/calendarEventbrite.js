var data;
var baseUrl = 'https://www.eventbriteapi.com/v3/events/';
var myApp = angular.module('myApp', ['firebase'])



var myCtrl = myApp.controller('myCtrl', function($scope, $http, $firebaseAuth, $firebaseArray, $firebaseObject){
	
	//reference to database
	var ref = new Firebase("https://info343finalfire.firebaseio.com");

	//reference to store events and unique id
	var tripRef = ref.child('trip')
	var eventsRef = ref.child('events')

	//firebaseArray of trip
	$scope.trip = $firebaseArray(tripRef);
	$scope.events = $firebaseObject(eventsRef);


	//authentication code
	$scope.authObj = $firebaseAuth(ref);


	$scope.searchEvent = function() {
		var url = baseUrl + 'search/?token=5TSGMBRNEWKIX4ZN6MMA';


		if($scope.eventName != undefined){
			url += '&q=' + $scope.eventName;
		}

		if($scope.city != undefined){
			url += '&venue.city=' + $scope.city;

		}
		if($scope.date != undefined) {
			url += '&start_date.range_end='+ $scope.date + "T23%3A59%3A59Z";
		}

		$http.get(url).success(function(response){
			$scope.searchedEvents = response.events;
		})
	}
	$scope.getDescription = function(numb, tag) {
		$('#numb').append(tag);
	}
	$scope.addEvent = function(selectedId){
		$scope.events.$add({
			//ID or title& descriptions?
			message: $scope.message,
			eventId: selectedId,
			tripId: $scope.tripId,
			likes: 0,
			dislikes: 0,
		})
	}

	$scope.getEvent = function(tripId){
	}

	$scope.like = function(event) {
		event.likes++;
		$scope.events.$save();
	}

	$scope.dislike = function(event) {
		event.dislikes++;
		$scope.events.$save();
	}
})