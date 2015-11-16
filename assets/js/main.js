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
	});
})

//factory object for larger scope
myApp.factory('Data', function () {
    var data = { userId: '',
    		 authObj : '',
    		 itineraryIndex : '',
    		 ref : '' }; //wat do for ref?
   return {
        getUserId: function () {
            return data.userId;
        },
        setItinerary: function (index) {
            data.itineraryIndex = index;
        }
    };
});

// ---- Configure Controllers for App ---- //

//global controller 
//controls user log ins
var myCtrl = myApp.controller('myCtrl', function($scope,$firebaseAuth,$firebaseObject,Data) {
	var ref = new Firebase("https://sbv15.firebaseio.com/");
  	Data.ref = ref;
  	var userRef  = ref.child('user');
  	ref.child('itinerary').orderByKey().on("child_added", function(snapshot) {
	  console.log(snapshot.key());
	});
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
myApp.controller('HomeController', function($scope, $http, $firebaseAuth, $firebaseArray, $firebaseObject,Data){
  var ref = new Firebase("https://sbv15.firebaseio.com/");
  var itineraryRef  = ref.child('itinerary');
  $scope.itinerarys = $firebaseArray(itineraryRef);//users
  $scope.currentItinerary = '';
  $scope.$watch(function () { return Data.getUserId(); }, function (newValue, oldValue) {
        if (newValue !== oldValue) $scope.userId = newValue;
  });
  $scope.$watch('currentItinerary', function (newValue, oldValue) {
        if (newValue !== oldValue) Data.setItinerary(newValue);
    });
  $scope.createNewItinerary = function(){
  		$scope.itinerary = $scope.itineraryId;
  		$scope.itinerarys.$add({
  			id: $scope.itineraryId
  		});
  		$scope.currentItinerary = $scope.itinerarys.length - 1;
  		console.log('test',$scope.currentItinerary);
  };

  
})




// Content Controller
myApp.controller('ContentController', function($scope, $http, $firebaseAuth, $firebaseArray, $firebaseObject,Data){
  $scope.$watch(function () { return Data.getUserId(); }, function (newValue, oldValue) {
        if (newValue !== oldValue) $scope.userId = newValue;
  });
  $scope.url = 
  	// long colapsable
  	"data:image/jpeg;base64,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"
})




// About Controller
myApp.controller('AboutController', function($scope, $http, $firebaseAuth, $firebaseArray, $firebaseObject,Data){
  $scope.$watch(function () { return Data.getUserId(); }, function (newValue, oldValue) {
        if (newValue !== oldValue) $scope.userId = newValue;
  });
  $scope.about = "Some info"
})