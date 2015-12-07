/*
Written by: Eli Jackson
notes 
linkes:
http://stackoverflow.com/questions/21919962/share-data-between-angularjs-controllers
https://thinkster.io/a-better-way-to-learn-angularjs/services
factory links ^^

https://www.firebase.com/docs/web/guide/saving-data.html
https://www.firebase.com/blog/2013-10-01-queries-part-one.html#byid
*/

var myApp = angular.module('myApp', ['ui.router','firebase'])
// Configure the app
.config(function($stateProvider) {
	$stateProvider
	.state('home', { // Landing page
	  url:'/',
	  templateUrl: 'assets/html/home.html', // HTML fragment
	  controller: 'HomeController', // Which controller 
	})
	.state('content', { // Content page
	  url:'/content',
	  templateUrl: 'assets/html/content.html', // HTML fragment
	  controller: 'ContentController', // Which controller 
	})
	.state('about', { // About page
	  url:'/about',
	  templateUrl: 'assets/html/about.html', // HTML fragment
	  controller: 'AboutController', // Which controller 
	})
	.state('trip', { // About page
	  url:'/trip',
	  templateUrl: 'assets/html/trip.html', // HTML fragment
	  controller: 'TripController', // Which controller 
	});
})

//factory object for larger scope
myApp.factory('Data', function () {
    var data = { userId: '',
    		 authObj : '',
    		 currentItinerary : '',
    		 ref : '', //firebase ref

    }; 
   return {
        getUserId: function () {
            return data.userId;
        },
        setItinerary: function (id) {
            data.currentItinerary = id;
        }
    };
});

// ---- Configure Controllers for App ---- //

//global controller 
//This controler controls user log ins
var myCtrl = myApp.controller('myCtrl', function($scope,$firebaseAuth,$firebaseObject,Data) {
	var ref = new Firebase("https://ourtrip.firebaseio.com/");
  	Data.ref = ref;
  	var userRef  = ref.child('user');
  	/*ref.child('itinerary').orderByKey().on("child_added", function(snapshot) {
	  //console.log(snapshot.key());
	});*/
    $scope.users = $firebaseObject(userRef);//users
  	$scope.authObj = $firebaseAuth(ref);
  	// Test if already logged in
	  var authData = $scope.authObj.$getAuth();
	  if (authData) {
	    $scope.userId = authData.uid;
	    Data.userId = $scope.userId;
	  } 
	  // SignUp function
	  $scope.signUp = function() {
	    // Create user
	    $scope.authObj.$createUser({
	      email: $scope.email,
	      password: $scope.password,      
	    })
	    // Once the user is created, call the logIn function
	    .then($scope.logIn)
	    // Once logged in, set and save the user data
	    .then(function(authData) {
	      $scope.userId = authData.uid;
	      $scope.users[authData.uid] ={
	        handle:$scope.handle
	      }
	      $scope.users.$save()
	    })
	    // Catch any errors
	    .catch(function(error) {
	      console.error("Error: ", error);
	    });
	  }
	  // SignIn function
	  $scope.signIn = function() {
	    $scope.logIn().then(function(authData){
	      $scope.userId = authData.uid;
	    })
	  }
	  // LogIn function
	  $scope.logIn = function() {
	    return $scope.authObj.$authWithPassword({
	      email: $scope.email,
	      password: $scope.password
	    })
	  }
	  // LogOut function
	  $scope.logOut = function() {
	    $scope.authObj.$unauth()
	    $scope.userId = false
	    Data.userId = false;
	  }
});

// Home Controller
// this controller will control displays and functionality to create a new trip
myApp.controller('HomeController', function($scope, $http, $firebaseAuth, $firebaseArray, $firebaseObject,Data){
  $scope.itineraries = $firebaseArray(Data.ref.child('itinerary'));//loads all interary objects in firebase **** NEEDS TO BE FOR USER
  $scope.events = Data.ref.child('events');
  $scope.currentItinerary = Data.currentItinerary;
  $scope.currentUser = Data.userId;
  $scope.itineraryPassword = "";
  $scope.itineraryDesc = "";
  $scope.itineraryLocation = "";
  $scope.itineraryDate = "";
  $scope.itineraryTitle = "";
  $scope.itineraryImage = "";
  $scope.eventDescription = "";
  $scope.eventLocation = "";
  $scope.eventDate = "";
  $scope.eventTitle = "";
  $scope.eventImage = "";
  $scope.eventPrivacy = "";
  $scope.eventPrice = 0;

  //post: new itinerary array item currented with userId attribute = to userId of the user signed in
  $scope.createNewItinerary = function(){
  		$scope.itineraries.$add({
  			creatorId : Data.userId,
        password : $scope.itineraryPassword,
        Description : $scope.itineraryDesc,
        location : $scope.itineraryLocation,
        date : $scope.itineraryDate,
        title : $scope.itineraryTitle,
        image : $scope.itineraryImage,
        contributors : {count:0},
        events : {count:0}
  		}).then(function(ref) {
        $scope.selectItinerary($scope.itineraries.$indexFor(ref.key()));
      });
  };
  //post: the selection for the itinerary to work on is changed and the model is updated.
  $scope.selectItinerary = function(id){
      Data.setItinerary(id);//set global scope so we no witch is currently being worked on  $scope.currentItinerary = '';
      $scope.currentItinerary = id;
  };
  $scope.addNewItem =function(){
      //check the label******
      // ensure not "userId"
      $scope.itineraries[$scope.currentItinerary][$scope.itemLabel] = $scope.itemValue;
      //$scope.itineraries[$scope.currentItinerary].events.count++; counter
      $scope.itineraries.$save($scope.currentItinerary).then(function(ref){
        console.log(ref.key == $scope.itineraries[$scope.currentItinerary].$id);
      });
  }; 
  $scope.createNewEvent = function(){
      $scope.events.$add({
        creatorId : Data.userId,
        desc : eventDescription,
        location : eventLocation,
        date : eventDate,
        title : eventTitle,
        image : eventImage ,
        privacy : eventPrivacy,
        price : eventPrice,
        votes : {count : 0},
        used : 1
      }).then(function(ref) {
        // add to itinerary $scope.selectItinerary[currentItinerary]$scope.itineraries.$indexFor(ref.key()));
      });
  };

});

//time stamp : Firebase.ServerValue.TIMESTAMP


// Content Controller
//this controller will be user for searching for new items
myApp.controller('ContentController', function($scope, $http, $firebaseAuth, $firebaseArray, $firebaseObject,Data){
  $scope.$watch(function () { return Data.getUserId(); }, function (newValue, oldValue) {
        if (newValue !== oldValue) $scope.userId = newValue;
  });
  var baseUrl = 'https://api.spotify.com/v1/search?type=track&query='

  //post: gets tracks
  $scope.getSongs = function() {
    $http.get(baseUrl + $scope.track).success(function(response){
      data = $scope.tracks = response.tracks.items
      
    })
  }
  $scope.play = function(song) {
    if($scope.currentSong == song) {
      $scope.audioObject.pause()
      $scope.currentSong = false
      return
    }
    else {
      if($scope.audioObject.pause != undefined) $scope.audioObject.pause()
      $scope.audioObject = new Audio(song);
      $scope.audioObject.play()  
      $scope.currentSong = song
    }
  }

})


// trip Controller
myApp.controller('TripController', function($scope, $http, $firebaseAuth, $firebaseArray, $firebaseObject,Data){

})



// About Controller
// this control will have all the itineraries items to display
// and the ability to create a new item 
myApp.controller('AboutController', function($scope, $http, $firebaseAuth, $firebaseArray, $firebaseObject,Data){
  $scope.$watch(function () { return Data.getUserId(); }, function (newValue, oldValue) {
        if (newValue !== oldValue) $scope.userId = newValue;
  });
  $scope.about = "Some info"

/*
for (var property in object) {
    if (object.hasOwnProperty(property)) {
        // do stuff
    }
}
design preference : http://getbootstrap.com/javascript/#tabs
*/

})