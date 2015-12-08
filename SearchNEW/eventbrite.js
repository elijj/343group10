var data;
var baseUrl = 'https://www.eventbriteapi.com/v3/events/';
var myApp = angular.module('myApp', ['firebase', "ui.bootstrap.modal"])
.config(['$httpProvider', function($httpProvider) {
        delete $httpProvider.defaults.headers.common["X-Requested-With"]
    }])


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

    //Gains data from Eventbrite API with given key, city, and/or date, 
    //and save those data as searchedEvents
    $scope.searchEvent = function() {
        var url = baseUrl + 'search/?token=5TSGMBRNEWKIX4ZN6MMA';
        //token gotten from my eventbrite app. We COULD(Not have to) 
        //further develop with giving option to type in their 
        //token number for private events they made on Eventbrite page

        if($scope.eventName != undefined){ //key
            url += '&q=' + $scope.eventName;
        }

        if($scope.city != undefined){ //city name of venue
            url += '&venue.city=' + $scope.city;

        }
        if($scope.date != undefined) { //date
            url += '&start_date.range_end='+ $scope.date + "T23%3A59%3A59Z";
        }

        $http.get(url).success(function(response){

            $scope.searchedEvents = response.events;
        })
    }
    
    //NEEDS TO BE FIXED. NO JQUERY WHEN USING ANGULAR
    //Helps to use html code received from eventbrite api
    $scope.getDescription = function(tag) {
        

    }   

    //for your trip page to get saved events layed out
    $scope.getEvent = function(eventId){
    }

    $scope.like = function(theEvent) {
        theEvent.likes++;
        $scope.events.$save();
    }

    $scope.dislike = function(theEvent) {
        theEvent.dislikes++;
        $scope.events.$save();
    }
    
    

    //happens on modal, and saves the event to yourtrip when save is clicked
    $scope.addEvent = function(savingEventId){
        $scope.events.$add({
            //ID or title& descriptions?
            eventId: savingEventId,
            likes: 0,
            dislikes: 0,
        })


    }

    /*//open up the modal, and pass data of the clicked 
        

    $scope.cancel = function() {
        $scope.clickedModal = false;
    }
    */
})


$(function(){
    $('.description').load
})
