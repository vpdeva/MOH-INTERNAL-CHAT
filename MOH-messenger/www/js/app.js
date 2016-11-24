// Ionic Starter App
var sqlitedb=null;

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// var app=angular.module('starter', ['ionic','starter.services','intlpnIonic','couchDB.services','contacts.services','pouchdb'])

var app= angular.module('starter',
        ['ionic',
         'starter.services',
         'pouchdb',
         'couchDB.services',
         'contacts.services',
         'angularMoment',
         'ngSanitize',
         'btford.socket-io',
         'ngCordova',
         'angularMoment',
         'intlpnIonic',
         ]
    )
.run(function($ionicPlatform,$cordovaSQLite) {
  $ionicPlatform.ready(function(){

    if(window.cordova && window.cordova.plugins.Keyboard){

      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);

    }

    if(window.StatusBar){
      StatusBar.styleDefault();
    }
     sqlitedb = $cordovaSQLite.openDB("my.db");
       //   db = window.openDatabase("my.db", "1.0", "Cordova Demo", 200000);
       $cordovaSQLite.execute(sqlitedb, 'CREATE TABLE IF NOT EXISTS "tbl_contact" ("id" INTEGER PRIMARY KEY  NOT NULL ,"name" VARCHAR,"phone" VARCHAR,"avatar" VARCHAR,"isActive" INTEGER, "status" VARCHAR,"fbid" VARCHAR, "country" VARCHAR,"gender" VARCHAR, "resid" VARCHAR)');
       
       $cordovaSQLite.execute(sqlitedb,'CREATE TABLE "tbl_message" ("id" INTEGER PRIMARY KEY  NOT NULL ,"senderId" VARCHAR,"receiverId" VARCHAR,"message" TEXT,"dateCreated" DATETIME,"chatId" VARCHAR,"readUnreadFlg" INTEGER,"groupId" INTEGER,"groupOwnerId" INTEGER,"groupMemberId" TEXT DEFAULT (null) , "groupName" TEXT, "isBlocked" INTEGER, "loginUserId" VARCHAR, "imgFlag" INTEGER )')
        // alert("Contacts >>>"+navigator.contacts);
    
  });
})

// .constant('SERVER_ADDRESS', 'http://192.168.1.9:5984/chat')
.constant('SERVER_ADDRESS', 'http://104.236.29.212:5984/registeruser')

.config(function($stateProvider, $urlRouterProvider) {
       
    $stateProvider
      .state('intro', {
         url: '/',
         templateUrl: 'templates/intro.html',
         controller: 'IntroCtrl',
         // onEnter: function($state, UserService,socket){
         //  // var userid=UserService.getUserRes().id;
         //    var _loginStatus=UserService.getLoginUser();
         //    alert(_loginStatus)
         //    if(!isNaN(_loginStatus))
         //       {
         //         // socket.emit('new user', _loginUserId, function(data){
         //         // if(data){
         //         //  } else{
         //         //  alert('That username is already taken!  Try again.');
         //         // }
         //         // });
         //         $state.go('tab.chats');
         //      }
         // }
      })

      .state('login', {
        url: '/login',
        templateUrl: 'templates/sign-in.html',
        controller: 'LoginCtrl'
      })

    // .state('login', {
    //     url: '/',
    //     templateUrl: 'templates/sign-in.html',
    //     controller: 'LoginCtrl'
    //   })
      .state('contact-number', {
        url: '/contact-number',
        templateUrl: 'templates/contact-number.html',
        controller: 'ContactCtrl'
      })

      .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html'
      })
      .state('tab.chats', {
        url: '/chats',
        views: {
          'tab-chats': {
            templateUrl: 'templates/tab-chats.html',
            controller: 'ChatsCtrl'
          }
        }
      })
      .state('tab.contact', {
        url: '/contacts',
        views: {
          'tab-contacts': {
            templateUrl: 'templates/tab-contacts.html',
            controller: 'ContactsNoCtrl'
          }
        }
      })
      .state('chating', {
        url: '/chating',
        templateUrl: 'templates/chating.html',
        controller: 'ChatingCtrl',
        params:{
          toUserData:''
        }
      })


      $urlRouterProvider.otherwise('/');
})
