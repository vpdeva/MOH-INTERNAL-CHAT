app.controller('ChatsCtrl',function($scope,$state,UserService,$cordovaSQLite,CouchDBServices) {


	$scope.getChats = function()
	{
	chatrefresh();
	}

	function chatrefresh()
	{
		var username=UserService.getUser().name;
		var userid=UserService.loginUserId;
		var useravatar=UserService.getUser().avatar;
		var selectchat="SELECT * FROM tbl_message where(senderId='"+userid+"' or receiverId='"+userid+"') group by chatId ORDER BY dateCreated DESC";
		$scope.perviouschat=[];
		var count = 0;
		var m;
		var i=0;
		var cnt=0;
		$cordovaSQLite.execute(sqlitedb, selectchat, []).then(function(data) {
			if(data.rows.length >0)
			{
				for(i=0; i<data.rows.length; i++)
 				{
				    if(data.rows.item(i).senderId!=data.rows.item(i).loginUserId)
					{
						CouchDBServices.getUserDetails(data.rows.item(i).senderId).then(function(response){
	   			        var countUchat="select * from tbl_message where chatId='"+data.rows.item(count).chatId+"' and readUnreadFlg='1'" ;
						$cordovaSQLite.execute(sqlitedb, countUchat, []).then(function(res) {
						            // var d=JSON.stringify(res.rows.item(0))
						            //alert("message"+d)
						            var m1=data.rows.item(cnt);
						            m1.unreadmessage=res.rows.length;
						            //m1.message=res.rows.item(0).message;
						            
						            var m2=response;
						            var m3=$.extend({}, m1, m2);
						            $scope.perviouschat.push(m3);
						            cnt++;
						    })
						      count++;
				        })
					}
					else
					{
						CouchDBServices.getUserDetails(data.rows.item(i).receiverId).then(function(response){
			           
			           var countUchat="select * from tbl_message where chatId='"+data.rows.item(count).chatId+"' and readUnreadFlg='1'" ;
			           $cordovaSQLite.execute(sqlitedb, countUchat, []).then(function(res) {			                                                                 
			             var m1=data.rows.item(cnt);
			             m1.unreadmessage=res.rows.length;
			             //m1.message=res.rows.item(0).message;
			             var m2=response;
			             var m3=$.extend({}, m1, m2);
			             $scope.perviouschat.push(m3);
			             cnt++;
			             })	
			           count++;
			           })				
					}	
				}	
		    }
		}, function (err) {
		console.error(JSON.stringify(err))
		});
	}
	$scope.chating = function(toUserData){
		if(toUserData.isUser==1)
		{
		 $state.go('chating', {toUserData:toUserData})
		}
    } 
})