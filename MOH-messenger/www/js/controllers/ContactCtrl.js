    	
app.controller('ContactCtrl',function($scope,$state,$ionicLoading,$rootScope,UserService,CouchDBServices,ContactsServices,MessagesService,$ionicHistory,socket){
       
    var userInfo = UserService.getUser();

    $scope.verifyContact = function(contactNumber){
        var _countryCode;
    	if(isNaN(UserService.countrycode))
    	{
    		_countryCode='+91'
    	}
    	else
    	{
    		_countryCode=UserService.countrycode;
    	}

    	var userDetails={
            _id:contactNumber,
            name:userInfo.name,
            phone:contactNumber,
            email:userInfo.email,
            fbId:userInfo.fbid,
            country:"india",
            avatar:userInfo.avatar,
            isActive:"1",
            gender:userInfo.gender,
            status:"Hey there I am using Chat's it"   
        }

		$ionicLoading.show({
			template:'Loading...'
		})

        var updateUserInfo = function(simContacts){
                    // check phone number exits or not
                    CouchDBServices.getDocuments(simContacts).then(function(appUsers){
                            // console.log("fetched app users"+JSON.stringify(appUsers));
                            if(appUsers.rows.length!=0)
                            {
                                    angular.forEach(appUsers.rows,function(user){
                        
                                        if('doc' in user){

                                            if(user.doc!=null){
                                                
                                                CouchDBServices.updateContactPouchDB(user.doc.phone,user.doc).then(function(success){

                                                    
                                                    console.log("updated remote contacts, saving to local storage"+JSON.stringify(success));
                                                        // $state.go('tab.chats');
                                                    

                                                 },function(err){
                                                    console.log("error when updating document");
                                                    q.reject(err);
                                                });

                                            }
                                          }

                                    })

                            }
                    })  
        }

        var fetchContacts = function(){

            ContactsServices.getSimJsonContacts(_countryCode).then(function(responce){

                    $scope.simContacts=responce.mobiles;
                    $scope.simJsonContacts=responce.phones;
                    // alert("Before Insert >>>"+$scope.simJsonContacts);
                    // insert data into pouchDb
                   CouchDBServices.insertContactPouchDB($scope.simJsonContacts).then(function(res){
                    // alert("After Insert >>>"+res);
                       $ionicLoading.hide();
                       
                       updateUserInfo($scope.simContacts);

                        $state.go('tab.chats');
                        

                    })

            })

        };

    	CouchDBServices.registeruser(userDetails).then(function(responce){
        UserService.loginUserId = responce
        UserService.setLoginUser(responce);
         			// alert("Register User Response >>"+responce);
                fetchContacts();
    	})    


        //Socket Integration
    
        socket.emit('new user',contactNumber,function(data){
               if(data){
               } else{
               alert('That username is already taken!  Try again.');
               }
         })

         socket.on('login', function (data) {
                    //Set the value of connected flag
                    self.connected = true
                    self.number_message= message_string(data.numUsers)
                    
                    });
         socket.on('new message', function(data){
                    if(data.msg&&data.nick)
                    {
                    addMessageToList(data.username,true,data.message)
                    }
                    });
         socket.on('user image', function(data){
                    //alert(''+data.nick);
                    var jGeneratedImg={"nick":data.nick,"image":data.image};
                    $scope.$apply(function(){
                                  $rootScope.$broadcast('whisperimg',jGeneratedImg);
                                  });
                    });
         socket.on('share contact',function(data){
                    var jGeneratedContact={"nick":data.nick,"contact":data.contact}
                    
                    $scope.$broadcast('whispercontact',jGeneratedContact);
                    });    
         socket.on('whisper', function(data){
                    
                    if($ionicHistory.currentStateName()=='chating')
                    {                   
                      var jGeneratedMsg ={ "nick" : data.nick , "message" : data.msg };

                        $scope.$digest();
                        $scope.$apply(function(){
                                      $rootScope.$broadcast('whispermsg',jGeneratedMsg);
                                      });
                    }
                    else{
                       MessagesService.insertMsg({
                                  senderId:data.nick,
                                  receiverId:UserService.loginUserId,
                                  message:data.msg,
                                  loginUserId:UserService.loginUserId,
                                  unReadflag:'1',
                                  imgFlag:'0'
                        });
                    }   
                    });
                    
          // Whenever the server emits 'user joined', log it in the chat body
         socket.on('user joined', function (data) {
                    addMessageToList("",false,data.username + " joined")
                    addMessageToList("",false,message_string(data.numUsers))
                    });
         // Whenever the server emits 'user left', log it in the chat body
         socket.on('user left', function (data) {
                    addMessageToList("",false,data.username+" left")
                    addMessageToList("",false,message_string(data.numUsers))
                    });
    }               
})

      
               