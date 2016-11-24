app.controller('ChatingCtrl', function($scope, $stateParams, socket,$sanitize,$ionicHistory, $state, $rootScope, $ionicPopup, $ionicScrollDelegate, $timeout, $interval, $ionicPopover,UserService,$ionicViewService,$ionicModal,$ionicPopover,MessagesService,$cordovaSQLite) {
// alert("stateParams "+ JSON.stringify($scope.toUser))
$scope._toUserDetail=$stateParams.toUserData;
  $scope.$on('$ionicView.enter', function() {
    $scope.toUser=$stateParams.toUserData;
     sqlitedb = $cordovaSQLite.openDB("my.db");

    //update readFlage
    var updatereadflag="UPDATE tbl_message SET readUnreadFlg='0' where(senderId='"+userid+"' and receiverId='"+tousrid+"') or (senderId='"+tousrid+"' and receiverId='"+userid+"')";
    $cordovaSQLite.execute(sqlitedb, updatereadflag, []).then(function(res){       
    })

  })  

  $scope.myGoBack = function()
  {
    $ionicHistory.goBack();
  }

  var usernm=UserService.getUser().name;
  var userid=UserService.loginUserId;
  var useravatar=UserService.getUser().avatar;

  var tousrnm = $scope._toUserDetail.name;
  var tousrid= $scope._toUserDetail.phone;
  var tousravatar= $scope._toUserDetail.avatar;

  $scope.toUser = {
  _id: tousrid,
  pic: tousravatar,
  username: tousrnm
  }
  // this could be on $rootScope rather than in $stateParams
  $scope.user = {
  _id: userid,
  pic: useravatar,
  username: usernm
  };


  var self=this;
  var connected= true;
  var typing = false;
  var lastTypingTime;
  var TYPING_TIMER_LENGTH = 400;
  //Add colors
  var COLORS = [
               '#e21400', '#91580f', '#f8a700', '#f78b00',
               '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
               '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
               ];

  //initializing messages array
  self.messages=[]

  //function called when user hits the send button
  self.sendMessage=function(){

  socket.emit('send message', self.message)

  addMessageToList($stateParams.nickname,true,self.message)
  socket.emit('stop typing',{ oppUser:$scope.toUser._id});
  self.message = ""
  }

  //function called on Input Change
  self.updateTyping=function(){
  sendUpdateTyping()
  }

  // Display message by adding it to the message list
  function addMessageToList(username,style_type,message){
    username = $sanitize(username)
    removeChatTyping(username)
    // var color = style_type ? getUsernameColor(username) : null self.messages.push({content:$sanitize(message),style:style_type,username:username,color:color})
    
  }

  //Generate color for the same user.
  function getUsernameColor (username) {
    // Compute hash code
    var hash = 7;
    for (var i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + (hash << 5) - hash;
    }
    // Calculate color
    var index = Math.abs(hash % COLORS.length);
    return COLORS[index];
  }

  // Updates the typing event
  function sendUpdateTyping(){
    if(connected){
    if (!typing) {
    typing = true;
    socket.emit('typing',{ oppUser:$scope.toUser._id,currentUser:$scope.user._id});
    }
    }
    lastTypingTime = (new Date()).getTime();
    $timeout(function () {
            var typingTimer = (new Date()).getTime();
            var timeDiff = typingTimer - lastTypingTime;
            if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
            socket.emit('stop typing',{ oppUser:$scope.toUser._id});
            typing = false;
            }
            }, TYPING_TIMER_LENGTH)
  }

  // Adds the visual chat typing message
  function addChatTyping (data) {
    self.messages = data.currentUser + " is typing";
    $scope.chatstatus = 'typing...';
  }

  // Removes the visual chat typing message
  function removeChatTyping (username) {
    self.messages = "";
    $scope.chatstatus = 'online';

  }

  function message_string(number_of_users)
  {
  return number_of_users === 1 ? "there's 1 participant":"there are " + number_of_users + " participants"
  }

  $scope.input = {
   message: localStorage['userMessage-' + $scope.toUser._id] || ''
  };

  var messageCheckTimer;

  var viewScroll = $ionicScrollDelegate.$getByHandle('userMessageScroll');
  var footerBar; // gets set in $ionicView.enter
  var scroller;
  var txtInput; // ^^^

  socket.on('typing', function (data) {
           addChatTyping(data);
           });

  // Whenever the server emits 'stop typing', kill the typing message
  socket.on('stop typing', function (data) {
           removeChatTyping("");
           });

  $scope.$on('$ionicView.enter', function() {
            console.log('UserMessages $ionicView.enter');
            
              getMessages();
            
            $timeout(function() {
                     footerBar = document.body.querySelector('#userMessagesView .bar-footer');
                     scroller = document.body.querySelector('#userMessagesView .scroll-content');
                     txtInput = angular.element(footerBar.querySelector('textarea'));
                     }, 0);
            messageCheckTimer = $interval(function() {
                                          
                                          }, 20000);
  });

  $scope.$on('$ionicView.leave', function() {
            
            console.log('leaving UserMessages view, destroying interval');
            if (angular.isDefined(messageCheckTimer)) {
            $interval.cancel(messageCheckTimer);
            messageCheckTimer = undefined;
            }
  });

  $scope.$on('$ionicView.beforeLeave', function() {
            if (!$scope.input.message || $scope.input.message === '') {
            localStorage.removeItem('userMessage-' + $scope.toUser._id);
            }
  });

  $scope.messages=[];

  function getMessages(){

    var selectchat="SELECT * FROM tbl_message where(senderId='"+userid+"' and receiverId='"+tousrid+"') or (senderId='"+tousrid+"' and receiverId='"+userid+"')";

    $cordovaSQLite.execute(sqlitedb, selectchat, []).then(function(res) {
         $scope.messages=[];
         if(res.rows.length >0)
         {
         for(var i=0; i<res.rows.length; i++)
         {
         //alert(i);
         console.log("SELECTED -> " + res.rows.item(i).id + " " + res.rows.item(i).senderId);
         
         if(res.rows.item(i).imgFlag=='2')
         {
         var contactArray=JSON.parse(res.rows.item(i).message);
         var contactName=contactArray.userName;
         var contactData=JSON.stringify(contactArray.contactData);
         $scope.messages.push(
                              {
                              "_id":res.rows.item(i).id,
                              "date":res.rows.item(i).dateCreated,
                              "senderId":res.rows.item(i).senderId,
                              "receiverId":res.rows.item(i).receiverId,
                              "loginUid":res.rows.item(i).loginUserId,
                              "text":contactData,
                              "contactName":contactName,
                              "imgFlag":res.rows.item(i).imgFlag
                              });
         $timeout(function() {
                 // viewScroll.scrollBottom(true);
                 $ionicScrollDelegate.scrollBottom();
                  }, 0);
         }
         else
         {
         $scope.messages.push(
                              {
                              "_id":res.rows.item(i).id,
                              "date":res.rows.item(i).dateCreated,
                              "senderId":res.rows.item(i).senderId,
                              "receiverId":res.rows.item(i).receiverId,
                              "loginUid":res.rows.item(i).loginUserId,
                              "text":res.rows.item(i).message,
                              "contactName":'',
                              "imgFlag":res.rows.item(i).imgFlag
                              });
         $timeout(function() {
                 // viewScroll.scrollBottom(true);
                 $ionicScrollDelegate.scrollBottom();
                  }, 0);
         }
         }
         }
         var jsonArray = JSON.parse(JSON.stringify($scope.messages))
         return jsonArray;
         }, function (err) {
         console.error("-********error------"+JSON.stringify(err));
         });
     
  }

  $scope.$on('whispermsg', function(event,args){
      if(args.nick&&args.message)
      {
        //data.nick,true,data.msg
        var senderId=args.nick;
        var msg=args.message;
        var toId=$scope.toUser._id;
        var touid=$scope.toUser._id;
        var userId=$scope.user._id;
        var imgFlag='0';
        if(senderId==touid)
        {
        var unrdflag='0';
        }
        else
        {
        var unrdflag='1';
        }
        customMsg(senderId,userId,msg,userId,unrdflag,imgFlag);
       // insert msg here
      }
  });

  $scope.$watch('input.message', function(newValue, oldValue) {
             //  socket.emit('typing',{ oppUser:$scope.toUser._id});
             console.log('input.message $watch, newValue ' + newValue);
             if (!newValue) newValue = '';
             localStorage['userMessage-' + $scope.toUser._id] = newValue;
  });
 
  $scope.sendMessage = function(sendMessageForm) {
      var whisperedMsg = "/w "+$scope.toUser._id+" " ;
      socket.emit('send message', whisperedMsg + $scope.input.message)
      socket.emit('stop typing',{ oppUser:$scope.toUser._id});

      var toId=$scope.toUser._id;
      var toUname=$scope.toUser.username;
      var text=$scope.input.message;
      var username=$scope.user.username;
      var userId=$scope.user._id;
      var simg= $scope.user.pic;
      var rimg= $scope.toUser.pic;

      customMsg(userId,toId,text,userId,'0','0');
      // insert msg here

      keepKeyboardOpen();

      $scope.input.message = '';

      $timeout(function() {
              keepKeyboardOpen();
$ionicScrollDelegate.scrollBottom();

             // viewScroll.scrollBottom(true);
              }, 0);

  };

  function customMsg(sid,rid,text,loginUid,unread,imgFlag)
  {
      //alert('custommsge'+sid);
      var message = {};
      
      message.contactName='';
      message.text=text;
      message._id = String(new Date().getTime());
      message.date = new Date();
      message.senderId = sid;
      message.receiverId=rid;
      message.loginUid=loginUid;
      message.imgFlag=imgFlag;
      $scope.messages.push(message);
      $timeout(function() {
              keepKeyboardOpen();
$ionicScrollDelegate.scrollBottom();

             // viewScroll.scrollBottom(true);
              }, 0);
      var ms=JSON.stringify($scope.messages);
        MessagesService.insertMsg({
                  senderId:sid,
                  receiverId:rid,
                  message:text,
                  loginUserId:loginUid,
                  unReadflag:unread,
                  imgFlag:imgFlag
        });

      console.log("*****************message array********"+ms);
  }

  function keepKeyboardOpen() {
    console.log('keepKeyboardOpen');
    txtInput.one('blur', function() {
                console.log('textarea blur, focus back on it');
                txtInput[0].focus();
                });
  }

  // $scope.onMessageHold = function(e, itemIndex, message) {
  // console.log('onMessageHold');
  // console.log('message: ' + JSON.stringify(message, null, 2));
  // $ionicActionSheet.show({
  //                       buttons: [{
  //                                 text: 'Copy Text'
  //                                 }, {
  //                                 text: 'Delete Message'
  //                                 }],
  //                       buttonClicked: function(index) {
  //                       switch (index) {
  //                       case 0: // Copy Text
  //                       //cordova.plugins.clipboard.copy(message.text);
                        
  //                       break;
  //                       case 1: // Delete
  //                       // no server side secrets here :~)
  //                       $scope.messages.splice(itemIndex, 1);
  //                       $timeout(function() {
  //                                viewScroll.resize();
  //                                }, 0);
                        
  //                       break;
  //                       }
                        
  //                       return true;
  //                       }
  //                       });
  // };

  $scope.$on('taResize', function(e, ta) {
          console.log('taResize');
          if (!ta) return;
          
          var taHeight = ta[0].offsetHeight;
          console.log('taHeight: ' + taHeight);
          
          if (!footerBar) return;
          
          var newFooterHeight = taHeight + 10;
          newFooterHeight = (newFooterHeight > 44) ? newFooterHeight : 44;
          
          footerBar.style.height = newFooterHeight + 'px';
          scroller.style.bottom = newFooterHeight + 'px';
          });

})
// fitlers
.filter('nl2br', ['$filter', function($filter) {
                  return function(data) {
                  if (!data) return data;
                  return data.replace(/\n\r?/g, '<br />');
                  };
                  }
                  ])
// directives
.directive('autolinker', ['$timeout', function($timeout) {
  return {
  restrict: 'A',
  link: function(scope, element, attrs) {
  $timeout(function() {
           var eleHtml = element.html();
           if (eleHtml === '') {
           return false;
           }
           var text = Autolinker.link(eleHtml, {
                                      className: 'autolinker',
                                      newWindow: false
                                      });
           
           element.html(text);
           
           var autolinks = element[0].getElementsByClassName('autolinker');
           
           for (var i = 0; i < autolinks.length; i++) {
           angular.element(autolinks[i]).bind('click', function(e) {
                                              var href = e.target.href;
                                              console.log('autolinkClick, href: ' + href);
                                              
                                              if (href) {
                                              //window.open(href, '_system');
                                              window.open(href, '_blank');
                                              }
                                              
                                              e.preventDefault();
                                              return false;
                                              });
           }
           }, 0);
  }
  }
  }
  ])
function onProfilePicError(ele) {
    this.ele.src = ''; // set a fallback
}
// configure moment relative time
moment.locale('en', {
              relativeTime: {
              future: "in %s",
              past: "%s ago",
              s: "%d sec",
              m: "a minute",
              mm: "%d minutes",
              h: "an hour",
              hh: "%d hours",
              d: "a day",
              dd: "%d days",
              M: "a month",
              MM: "%d months",
              y: "a year",
              yy: "%d years"
              }
              });