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
var baseUrl = 'https://www.eventbriteapi.com/v3/events/'; //for API
var myApp = angular.module('myApp', ['ui.router','firebase'])
//to get rid of error //Jessica

// Configure the app
.config(function($stateProvider) {
	$stateProvider
	.state('discover', { // Landing page
	  url:'/',
	  templateUrl: 'assets/html/discover.html', // HTML fragment
	  controller: 'ContentController', // Which controller 
	})
  .state('search', {
    url:'/search',
    templateUrl: 'assets/html/search.html', //HTML fragment
    controller: 'SearchController',
  })
	.state('login', { // Content page
	  url:'/login',
	  templateUrl: 'assets/html/login.html', // HTML fragment
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
	  controller: 'TripController', // Which controller 
	});
})

//factory object for larger scope
myApp.factory('Data', function () {
    var data = { userId: '',
    		 authObj : '',
    		 currentItinerary : '',
    		 ref : '', //firebase ref
         discover : true
    }; 
   return {
        getUserId: function () {
            return data.userId;
        },
        setItinerary: function (id) {
            data.currentItinerary = id;
        },
        setDiscover: function (id) {
            data.currentItinerary = id;
        }
    };
});

// ---- Configure Controllers for App ---- //

//global controller 
//This controler controls user log ins
var myCtrl = myApp.controller('myCtrl', function($scope, $http, $firebaseAuth,$firebaseObject,Data) {
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

    $scope.fbLogin = function(){
      return $scope.authObj.$authWithOAuthPopup({
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

// Trip Controller 
// this controller will control displays and functionality to create a new trip
myApp.controller('TripController', function($scope, $http, $firebaseAuth, $firebaseArray, $firebaseObject,Data){
  $scope.itineraries = $firebaseArray(Data.ref.child('itinerary'));//loads all interary objects in firebase **** NEEDS TO BE FOR USER
  $scope.events = $firebaseArray(Data.ref.child('events'));
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
    console.log($scope.itineraries);
  		$scope.itineraries.$add({
  			creatorId : Data.userId,
        password : $scope.itineraryPassword,
        description : $scope.itineraryDesc,
        location : $scope.itineraryLocation,
        startDate : $scope.itineraryDate,
        title : $scope.itineraryTitle,
        image : $scope.itineraryImage,
        addedTime : Firebase.ServerValue.TIMESTAMP,
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

  //post: adds new item to object
  $scope.addNewItem =function(){
      if($scope.itemLabel != 'userId'){
        $scope.itineraries[$scope.currentItinerary][$scope.itemLabel] = $scope.itemValue;
        //$scope.itineraries[$scope.currentItinerary].events.count++; counter
        $scope.itineraries.$save($scope.currentItinerary).then(function(ref){
          console.log(ref.key == $scope.itineraries[$scope.currentItinerary].$id);
        });
      } else {
        bootbox.alert('Invalid label!',function(){
          $scope.itemLabel = "";
        });
      }
  }; 

  //**** doesnt work needs work
  //post: new event array item currented with userId attribute = to userId of the user signed in
  $scope.createNewEvent = function(){
      $scope.events.$add({
        creatorId : Data.userId,
        addedTime : Firebase.ServerValue.TIMESTAMP,
        desc : $scope.eventDescription,
        location : $scope.eventLocation,
        date : $scope.eventDate,
        title : $scope.eventTitle,
        image : $scope.eventImage ,
        //privacy : $scope.eventPrivacy,
        price : $scope.eventPrice,
        start : $scope.eventStart ,
        end : $scope.eventEnd ,
        votes : {count : 0},
        used : 1
      }).then(function(ref) {
        $scope.saveAttribute(Data.ref.child('itinerary/'+$scope.currentItinerary),'events',$scope.itineraries[$scope.currentItinerary].events.count, ref.key()); 
        $scope.saveAttribute($scope.itineraries[$scope.currentItinerary].events,'count',$scope.itineraries[$scope.currentItinerary].events.count+1);//incriment
      });
  };

  //post: Remove a record from the database and from the local array.
  //index == attributes name
  $scope.removeAttribute = function(refrence,index){
    var list = $firebaseArray(refrence);
    var item = list[index];
    list.$remove(item).then(function(ref){
      ref.key() === item.$id;
    })
  };

  //post: This method saves an existing, modified local record back to the database. 
  //pre: It accepts either an array index or a reference to an item that exists in the array.
  $scope.saveAttribute = function(ref,key,attr,val){
    var list = $firebaseArray(ref);
    list[key][attr] = val;
    list.$save(key).then(function(ref) {
      console.log(ref.key() === list[key].$id); // true
    });
  };

  $scope.currentDate = function(){
    //pulls last event from current itinerary
  };
  $scope.itineraries = $firebaseArray(Data.ref.child('itinerary'));//loads all interary objects in firebase **** NEEDS TO BE FOR USER
  $scope.events = $firebaseArray(Data.ref.child('events'));
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
      alert();
      $scope.itineraries.$add({
        creatorId : Data.userId,
        password : $scope.itineraryPassword,
        description : $scope.itineraryDesc,
        location : $scope.itineraryLocation,
        startDate : $scope.itineraryDate,
        title : $scope.itineraryTitle,
        image : $scope.itineraryImage,
        addedTime : Firebase.ServerValue.TIMESTAMP,
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

  //post: adds new item to object
  $scope.addNewItem =function(){
      if($scope.itemLabel != 'userId'){
        $scope.itineraries[$scope.currentItinerary][$scope.itemLabel] = $scope.itemValue;
        //$scope.itineraries[$scope.currentItinerary].events.count++; counter
        $scope.itineraries.$save($scope.currentItinerary).then(function(ref){
          console.log(ref.key == $scope.itineraries[$scope.currentItinerary].$id);
        });
      } else {
        bootbox.alert('Invalid label!',function(){
          $scope.itemLabel = "";
        });
      }
  }; 

  //**** doesnt work needs work
  //post: new event array item currented with userId attribute = to userId of the user signed in
  $scope.createNewEvent = function(){
      $scope.events.$add({
        creatorId : Data.userId,
        addedTime : Firebase.ServerValue.TIMESTAMP,
        desc : $scope.eventDescription,
        location : $scope.eventLocation,
        date : $scope.eventDate,
        title : $scope.eventTitle,
        image : $scope.eventImage ,
        //privacy : $scope.eventPrivacy,
        price : $scope.eventPrice,
        start : $scope.eventStart ,
        end : $scope.eventEnd ,
        votes : {count : 0},
        used : 1
      }).then(function(ref) {
        $scope.saveAttribute(Data.ref.child('itinerary/'+$scope.currentItinerary),'events',$scope.itineraries[$scope.currentItinerary].events.count, ref.key()); 
        $scope.saveAttribute($scope.itineraries[$scope.currentItinerary].events,'count',$scope.itineraries[$scope.currentItinerary].events.count+1);//incriment
      });
  };

  //post: Remove a record from the database and from the local array.
  //index == attributes name
  $scope.removeAttribute = function(refrence,index){
    var list = $firebaseArray(refrence);
    var item = list[index];
    list.$remove(item).then(function(ref){
      ref.key() === item.$id;
    })
  };

  //post: This method saves an existing, modified local record back to the database. 
  //pre: It accepts either an array index or a reference to an item that exists in the array.
  $scope.saveAttribute = function(ref,key,attr,val){
    var list = $firebaseArray(ref);
    list[key][attr] = val;
    list.$save(key).then(function(ref) {
      console.log(ref.key() === list[key].$id); // true
    });
  };

  $scope.currentDate = function(){
    //pulls last event from current itinerary
  };

  //Jessica Search

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
    if($scope.searchDate != undefined) { //date
      url += '&start_date.range_end='+ $scope.searchDate + "T23%3A59%3A59Z";
    }

    $http.get(url).success(function(response){

      $scope.searchedEvents = response.events;
    })
  }
  
  $scope.addEvent = function(savingEventId){
    $scope.events.$add({
      //ID or title& descriptions?
      eventId: savingEventId,
      likes: 0,
      dislikes: 0,
    })
  } 

  $scope.like = function(theEvent) {
    theEvent.likes++;
    $scope.events.$save();
  }

  $scope.dislike = function(theEvent) {
    theEvent.dislikes++;
    $scope.events.$save();
  }
});





// Content Controller
//this controller will be user for searching for new items
myApp.controller('ContentController', function($scope, $http, $firebaseAuth, $firebaseArray, $firebaseObject,Data){
  $scope.discover = true;
})

//search controller
.controller('SearchController', function($scope, $http, $firebaseAuth, $firebaseArray, $firebaseObject,Data){
})
// trip Controller
myApp.controller('TripController', function($scope, $http, $firebaseAuth, $firebaseArray, $firebaseObject,Data){

})


// About Controller
// this control will have all the itineraries items to display
// and the ability to create a new item 
myApp.controller('AboutController', function($scope, $http, $firebaseAuth, $firebaseArray, $firebaseObject,Data){

})