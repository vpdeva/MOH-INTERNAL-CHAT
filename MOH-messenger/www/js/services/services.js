angular.module('starter.services', [])


.service('UserService', function() {
         
     var setUser = function(user_data) {
     window.localStorage.starter_facebook_user = JSON.stringify(user_data);
     };
     
     var getUser = function(){
     return JSON.parse(window.localStorage.starter_facebook_user || '{}');
     };
     var setUserRes = function(user_data) {
     window.localStorage.starter_facebook_user1 = JSON.stringify(user_data);
     };
     
     var getUserRes = function(){
     return JSON.parse(window.localStorage.starter_facebook_user1 || '{}');
     };
     
     var setUserChat=function(chat_data){
     window.localStorage.starter_facebook_user2 = JSON.stringify(chat_data);
     };
     
     var getUserChat=function()
     {
     return JSON.parse(window.localStorage.starter_facebook_user2 || '{}');
     }
     var setLoginUser=function(LoginUserID){
     window.localStorage.LoginUserID = JSON.stringify(LoginUserID);
     };
     
     var getLoginUser=function()
     {
     return JSON.parse(window.localStorage.LoginUserID || '{}');
     }
     
     var selectedContactId;
     var selectedToUserId;
     var selectedToUserName;
     var selectedToUserImg;
     var selectedImageUrl;
     var loginUserId;
     var loginStatus;
     var toUserProfileId;
     var countrycode;
     return {
     getLoginUser:getLoginUser,
     setLoginUser:setLoginUser,
     getUser: getUser,
     setUser: setUser,
     getUserRes: getUserRes,
     setUserRes: setUserRes,
     getUserChat: getUserChat,
     setUserChat:setUserChat,
     selectedContactId:selectedContactId,
     selectedToUserId:selectedToUserId,
     selectedToUserName:selectedToUserName,
     selectedToUserImg:selectedToUserImg,
     selectedImageUrl:selectedImageUrl,
     loginUserId:loginUserId,
     loginStatus:loginStatus,
     toUserProfileId:toUserProfileId,
     countrycode:countrycode
     };
})

.service('MessagesService',function($q,$rootScope,$state,$cordovaSQLite){
         
         var insertMsg= function(data){
         var q = $q.defer();
         
         var sid=data.senderId;
         var rid=data.receiverId;
         var text=data.message;
         var loginUid=data.loginUserId;
         var unread=data.unReadflag;
         var imgFlag=data.imgFlag;
         // get chatid from database
         var getchatid="select * from tbl_message where(senderId='"+sid+"' and receiverId='"+rid+"') or (senderId='"+rid+"' and receiverId='"+sid+"') ";
         $cordovaSQLite.execute(sqlitedb, getchatid, []).then(function(result){
          if(result.rows.length>0)
          {
          var chatid=result.rows.item(0).chatId;
          var query = "INSERT INTO tbl_message (senderId, receiverId,message,dateCreated,chatId,readUnreadFlg,groupId,groupOwnerId,groupMemberId,groupName,isBlocked,loginUserId,imgFlag) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)";
          $cordovaSQLite.execute(sqlitedb, query, [sid, rid,text,Date(),chatid,unread,'','','','','',loginUid,imgFlag]).then(function(res) {
                                                                                                                            
                     console.log("INSERT ID -> " + res.insertId);
                     q.resolve(res.insertId);
                     
                     }, function (err) {
                     console.error(err);
                     q.reject(err);
                     });
          
          }
          else
          {
          // insert chatid 
          var query = "INSERT INTO tbl_message (senderId, receiverId,message,dateCreated,chatId,readUnreadFlg,groupId,groupOwnerId,groupMemberId,groupName,isBlocked,loginUserId,imgFlag) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)";
          $cordovaSQLite.execute(sqlitedb, query, [sid, rid,text,Date(),'',unread,'','','','','',loginUid,imgFlag]).then(function(res) {
                                                                                                                         //update chat id
             var updatechatid="UPDATE tbl_message SET chatid='"+res.insertId+"' where id='"+res.insertId+"'";
             $cordovaSQLite.execute(sqlitedb, updatechatid, []).then(function(ress){
                         console.log("INSERT ID -> " + ress.insertId);
                         q.resolve(res.insertId);
                         
                         }, function (err) {
                         console.error(err);
                         q.reject(err);
                         
                         });
             })
          }
          })
         return q.promise;
         }
         return{
         insertMsg:insertMsg
         }
})

.directive('actualSrc', function () {
        return{
            link: function postLink(scope, element, attrs) {
                attrs.$observe('actualSrc', function(newVal){
                     if(newVal !== undefined){
                         var img = new Image();
                         img.src = attrs.actualSrc;
                         angular.element(img).bind('load', function () {
                             element.attr("src", attrs.actualSrc);
                         });
                     }
                });
 
            }
        }
})







