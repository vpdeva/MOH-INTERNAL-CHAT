app.controller('ContactsNoCtrl', function($scope,$q,$http,$state,UserService,$rootScope,$ionicScrollDelegate) {

   var db=new PouchDB('contact');
   $scope.results=[];
   $scope.myValue=true;
   $scope.mySpinner=false;
   $scope.contactCheck=false;
   $scope.getContact = function(offset)
   {
   $scope.offset=offset;


       console.log("all docs fetch.....");

       db.allDocs({
          include_docs:true,
          attachments:true,
        }, function(err, response){
          
          if(err) { 
            return console.log(err); 
          }

            $scope.contactCheck=true;
            $scope.myValue=false;
            $scope.mySpinner=false;


            response.rows.sort(function(a, b) {
            
                  var keyA = a.doc.name, keyB = b.doc.name; 
                  
                  if(a.doc.name!=undefined && a.doc.name!=null){             
                      keyA=a.doc.name+"";
                  }else{
                      keyA='';
                  }

                  if(b.doc.name!=undefined && b.doc.name!=null) {              
                      keyB=b.doc.name;
                  }else{
                      keyB='';
                  }

                    // sort by active:
                  if (a.doc.isUser < b.doc.isUser) return 1;
                  if (a.doc.isUser > b.doc.isUser) return -1;

                  if (keyA.toUpperCase() < keyB.toUpperCase()) {
                    return -1;
                  }               
                  else if (keyA.toUpperCase() > keyB.toUpperCase()) {   
                    return 1;
                  }
                  else {
                    return 0; 
                  }
        });

            $scope.results=response.rows;
            // handle result
            console.log("all docs contacts >>>"+JSON.stringify($scope.results)); 

            $scope.$apply();


        });

      // db.query(function(doc, emit){
      //   emit(doc.isUser);
      // }, {key:'0',limit :20,skip:offset,include_docs:true}).then(function (result) {
      //   console.log("all 1 contacts >>>"+JSON.stringify(result));  
      // }).catch(function (err){
      //   // handle any errors
      //   console.log("all 1 contacts errors >>>"+JSON.stringify(err));  
      // });

        // function map(doc){
        //       emit(doc.name);
        // }
        // $scope.offset=offset;
        // db.query(map,{limit:20,skip:offset,include_docs:true},
        // // db.query(map,{include_docs:true},
        //     function(err,result){
        //       if(err){ 
        //         return console.log(err); 
        //       }
        //     $scope.contactCheck=true;
        //     $scope.myValue=false;
        //     $scope.mySpinner=false;

        //     $scope.results=result.rows;

        //     // for(i=0;i<result.rows.length;i++)
        //     // {

        //     //     // alert("Contacts Content >>>"+JSON.stringify(result.rows[i].doc.isUser));
        //     //     $scope.results.push(result.rows[i]);

        //     // }
        //     // alert("Results Length >>>"+$scope.results.length);

        //     console.log("Results content >>>"+JSON.stringify($scope.results));
        //     $scope.$apply();

        // });

   }
    
   $scope.chating = function(toUserData){
    if(toUserData.isUser==1)
    {
     $state.go('chating', {toUserData:toUserData})
    }
   } 
})

