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
var baseUrl = 'https://www.eventbriteapi.com/v3/events/';
var myApp = angular.module('myApp', ['ui.router','firebase','cgBusy'])
// Configure the app
.config(function($stateProvider) {
  $stateProvider
  .state('discover', { // Landing page
    url:'/',
    templateUrl: 'assets/html/discover.html', // HTML fragment
    controller: 'DiscoverController', // Which controller 
  })
   .state('search', { // Landing page
    url:'/search',
    templateUrl: 'assets/html/search.html', // HTML fragment
    controller: 'SearchController', // Which controller 
  })
    .state('trip', {
            url: '/trip/:pw',
            controller : 'myCtrl',
           /* controller: function($scope, $stateParams) {
                // get the id
                $scope.pw = $stateParams.pw;
                alert($scope.pw);
            },*/
    templateUrl: 'assets/html/temp.html', 
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
        setUser: function (id) {
            data.userId = id;
        },
        setDiscover: function (id) {
            data.currentItinerary = id;
        }
    };
});
// ---- Configure Controllers for App ---- //
//global controller 
//This controler controls user log ins
var myCtrl = myApp.controller('myCtrl', function($stateParams,$timeout,$scope,$firebaseAuth,$firebaseObject,$firebaseArray,Data) {
  $scope.ref = new Firebase("https://ourtrip.firebaseio.com/");
    var userRef  = $scope.ref.child('user');
    /*ref.child('itinerary').orderByKey().on("child_added", function(snapshot) {
    //console.log(snapshot.key());
  });*/

    $scope.users = $firebaseObject(userRef);//users
    $scope.authObj = $firebaseAuth($scope.ref);
    $scope.itineraries = $firebaseArray($scope.ref.child('itinerary'));//loads all interary objects in firebase **** NEEDS TO BE FOR USER
    
    $scope.pw = $stateParams.pw;
    $intinObject = $scope.itineraries[$scope.pw];

    $scope.events = $firebaseArray($scope.ref.child('events'));
    $scope.currentItinerary = Data.currentItinerary;
    $scope.currentUser = Data.getUserId();
    $scope.itineraryPassword = "";
    $scope.itineraryDesc = "";
    $scope.itineraryLocation = "";
    $scope.itineraryDate = "";
    $scope.itineraryTitle = "";
    $scope.itineraryImage = "";
    $scope.eventDescription = "";
    $scope.eventLocation = "";
    $scope.eventDate = "";
    $scope.eventDateEnd = "";
    $scope.eventTitle = "";
    $scope.eventImage = "";
    $scope.eventPrivacy = "";
    $scope.eventEnd = "";
    $scope.eventStart = "";
    $scope.eventPrivacy = false;
    $scope.eventPrice = 0;
    $scope.userMadeObj = {};
    //post: new itinerary array item currented with userId attribute = to userId of the user signed in
    $scope.createNewItinerary = function(){
        $scope.itineraries.$add({
          creatorId : Data.userId,
          password : $scope.itineraryPassword,
          description : $scope.itineraryDesc,
          location : $scope.itineraryLocation,
          startDate : $scope.itineraryDate,
          title : $scope.itineraryTitle,
          image : $scope.itineraryImage,
          addedTime : Firebase.ServerValue.TIMESTAMP,
          events : {count:0}
        }).then(function(ref) {
          $scope.selectItinerary($scope.itineraries.$indexFor(ref.key()));
          $scope.itineraries[$scope.currentItinerary].link = "#/trip/"+ref.key();
          $scope.itineraries.$save($scope.currentItinerary).then(function(ref) {
          });
        });
    };
    //post: the selection for the itinerary to work on is changed and the model is updated.
    $scope.selectItinerary = function(id){
        Data.setItinerary(id);//set global scope so we no witch is currently being worked on  $scope.currentItinerary = '';
        $scope.currentItinerary = id;
    };
    //post: new event array item currented with userId attribute = to userId of the user signed in
    $scope.createNewEvent = function(){
        $scope.events.$add({
          creatorId : Data.userId,
          addedTime : Firebase.ServerValue.TIMESTAMP,
          desc : $scope.eventDescription,
          location : $scope.eventLocation,
          date : $scope.eventDate,
          dateEnd : eventDateEnd,
          title : $scope.eventTitle,
          image : $scope.eventImage ,
          privacy : $scope.eventPrivacy,
          price : $scope.eventPrice,
          start : $scope.eventStart ,
          end : $scope.eventEnd ,
          votes : {count : 0},
          used : 1 
        }).then(function(ref) {
          var ar = $scope.itineraries[$scope.currentItinerary].events
          ar[$scope.itineraries[$scope.currentItinerary].events.count] = ref.key();
          $scope.itineraries[$scope.currentItinerary].events = ar;
          $scope.itineraries[$scope.currentItinerary].events.count = $scope.itineraries[$scope.currentItinerary].events.count + 1;
          $scope.itineraries.$save($scope.currentItinerary).then(function(ref) {
            ref.key() === $scope.itineraries[$scope.currentItinerary].$id; // true
          });
        });
    };

    $scope.saveChange = function(){
     
      $scope.itineraries.$save($scope.currentItinerary).then(function(ref) {
            ref.key() === $scope.itineraries[$scope.currentItinerary].$id; // true
      });

    }

    $scope.updateItinerary = function(){
      var method = 'POST';
      var url = '/assets/php/makelink.php';
      $scope.codeStatus = "";
      var FormData = {
        'itin' : $scope.itineraries[$scope.currentItinerary]
      };
      $http({
        method: method,
        url: url,
        data: FormData,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        cache: $templateCache
      }).
      success(function(response) {
          $scope.codeStatus = response.data;
      }).
      error(function(response) {
          $scope.codeStatus = response || "Request failed";
      });
      
    }
    /*
    //luxuries>>>>>>>>>>>>>>>>>>>>>>
    $scope.currentDate = function(){
      //pulls last event from current itinerary
    };
    //post: adds new item to object
    $scope.addNewItem =function(){
        if($scope.itemLabel != 'userId'){
          $scope.userMadeObj[$scope.itemLabel] = $scope.itemValue;
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
    //post: Remove a record from the database and from the local array.
    //index == attributes name
    $scope.removeAttribute = function(refrence,index){
      var list = $firebaseArray(refrence);
      var item = list[index];
      list.$remove(item).then(function(ref){
        ref.key() === item.$id;
      })
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
    //luxuries>>>>>>>>>>>>>>>>>>>>>>
    */
    // Test if already logged in
    var authData = $scope.authObj.$getAuth();
    if (authData) {
      $scope.userId = authData.uid;
      Data.setUser($scope.userId)
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
          handle:$scope.handle,
          joinDate : Firebase.ServerValue.TIMESTAMP,
          email : $scope.email,
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
      $scope.currentItinerary = false;
    }


    $scope.like = function(theEvent) {
        theEvent.likes++;
        $scope.events.$save();
    }

    $scope.dislike = function(theEvent) {
        theEvent.dislikes++;
        $scope.events.$save();
    }
    
    

    $scope.addEvent = function(savingEventId){
      var duplicate = false;
      angular.forEach($scope.events, function(value, key) {
              console.log( value.id + ' : ' + savingEventId.id)
              if (value.id == savingEventId.id){
                  value.used = value.used + 1;
                  $scope.events.$save(key).then(function(ref) {
                    //choose which itinerary // true
                  });
                  duplicate = true;
              }
              
      });
      if (!duplicate) {
        savingEventId.used = 1;
        savingEventId.addedTime = Firebase.ServerValue.TIMESTAMP;
        savingEventId.description = savingEventId.description.text;
        savingEventId.title = savingEventId.name.text;
        savingEventId.votes = {up : 0,
        down : 0};
        $scope.events.$add(savingEventId).then(function(ref) {
            //choose which itinerary // true
        });
      }
      if($scope.currentItinerary){
        $scope.added = "added to";
      }else{
        $scope.added = "select an itinerary from your trips";
      }
      $timeout(function(){$scope.added = ""}, 3000);
      
    }

    
});


// Trip Controller
// this controller will control displays and functionality to create a new trip
myApp.controller('SearchController', function($scope, $http, $firebaseAuth, $firebaseArray, $firebaseObject,Data, $sce){
    $scope.currentUser = Data.getUserId();
  // Search

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

        $scope.myPromise = $http.get(url).success(function(response){
            $scope.searchedEvents = response.events;
            angular.forEach($scope.searchedEvents, function(value, key) {
              var sd = new Date(value.start.utc);
              var ed = new Date(value.end.utc);
              value.start.utc = sd.toLocaleString();
              value.end.utc = ed.toLocaleString();
            });

      })
    }
});

myApp.controller('DiscoverController', function($scope, $http, $firebaseAuth, $firebaseArray, $firebaseObject,Data){
  $scope.currentUser = Data.getUserId();
});

myApp.controller('TripController', function($scope, $http, $firebaseAuth, $firebaseArray, $firebaseObject,Data){
  $scope.currentUser = Data.getUserId();
});
