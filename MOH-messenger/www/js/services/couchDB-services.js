angular.module('couchDB.services', [])
.factory('CouchDBServices', CouchDBServices);

CouchDBServices.$inject = ['$q','pouchDB','SERVER_ADDRESS'];

/**
 * @name CouchDBServices
 * @desc Singleton service class with static methods for actions with CouchDB.
 * @param $q - service that helps you run functions asynchronously, and use their return values
 *              when they are done processing
 * @param pouchDB - service with asynchronous APIs for work with couchDB
 * @param SERVER_ADDRESS - constant - remote url to couchdb instance
 */
function CouchDBServices($q,pouchDB,SERVER_ADDRESS) {
    
    var db = pouchDB(SERVER_ADDRESS);

    var db_contact = new PouchDB('contact', {adapter: 'websql'});
    return {
    searchContactPouchDB:searchContactPouchDB,
    insertContactPouchDB:insertContactPouchDB,
    getDocument:getDocument,
    updateContactPouchDB:updateContactPouchDB,
    getDocuments:getDocuments,
    createDocument:createDocument,
    registeruser:registeruser,
    updateDocument:updateDocument,
    checkUser:checkUser,
    auth:auth,
    conversationExists:conversationExists,
    getUserDetails:getUserDetails,
    updatuserprofile:updatuserprofile
    };
    
    function getUserDetails(id){
        console.log("CouchDBServices.getDocument()");
        var q = $q.defer();
        db_contact.get(id).then(function (doc) {
        console.log("success: "+doc);
        q.resolve(doc);
        }).catch(function (err) {
                 console.log("error; "+err);
                 q.reject(err);
                 });
        return q.promise;
    }
    
    function registeruser(userdata){
        var q = $q.defer();
        db.get(userdata.phone).then(function(doc){
        return db.put(
          {
          _id:doc._id,
          _rev:doc._rev,
          name:doc.name,
          email:userdata.email,
          fbid:userdata.fbid,
          phone:userdata.phone,
          country:"india",
          avatar:doc.avatar,
          isActive:"1",
          gender:userdata.gender,
          status:doc.status
          }
          );
        }).then(function(response){
        console.log("success: "+response);
        q.resolve(response.id);
        }).catch(function (err) {
                 db.put(userdata);
                 // console.log("err"+err);
                 q.resolve(userdata._id);
                 });
        return q.promise;
    }
    
    function searchContactPouchDB(name)
    {
        var query = {
        query: name,
        fields: ['name'],
        include_docs: true,
        highlighting: true
        };
        var q = $q.defer();
        db_contact.search(query).then(function(doc) {
          }).then(function(response) {
                  console.log("success: "+response);
                  q.resolve(response);
                  }).catch(function (err) {
                           console.log("err"+err);
                           q.reject(err);
                           });
        return q.promise;
        
    }
    
    function updatuserprofile(profile){
        var q = $q.defer();
        db.get(profile.phone).then(function(doc){
                                   
           return db.put(
                 {
                 _id:doc._id,
                 _rev:doc._rev,
                 name:profile.name,
                 email:profile.email,
                 fbid:profile.fbid,
                 phone:profile.phone,
                 country:"india",
                 avatar:profile.avatar,
                 isActive:"1",
                 gender:profile.gender,
                 workAt:profile.workAt,
                 about:doc.bio,
                 status:doc.status
                 }
                 );
           }).then(function(response){
                   console.log("success: "+response);
                   q.resolve(db.get(response.id));
                   }).catch(function (err) {
                      console.log("err"+err);
                      q.resolve(userdata._id);
                  });
        return q.promise;
    }
    
    function updateContactPouchDB(id,data)
    {
      
        //alert("update contact data "+JSON.stringify(data))
        console.log("CouchDBServices.updateDocument()");
        var q = $q.defer();
        db_contact.get(id).then(function(doc) {
            return db_contact.put(
                                  {
                                  "_id":data._id,
                                  "name":doc.name,
                                  "phone":data.phone,
                                  "status":data.status,
                                  "email":data.email,
                                  "fbid":data.fbid,
                                  "avatar":data.avatar,
                                  "gender":data.gender,
                                  "about":data.about,
                                  " workAt":data.workAt,
                                  "country":data.country,
                                  "isActive":data.isActive,
                                  "isUser":'1',
                                  "_rev":doc._rev
                                  },
                                  doc._id,
                                  doc._rev
                                  );
            }).then(function(response) {
                    console.log("success: "+response);
                    q.resolve(response);
                    }).catch(function (err) {
                             console.log("err"+err);
                        q.reject(err);
                    });
        return q.promise;
    }
    
    
    function insertContactPouchDB(bulkContact){
        var deferred = $q.defer();

        db_contact.bulkDocs(bulkContact).then(function(response) {
                      deferred.resolve(response);
                      }).catch(function(error) {
                               
                               alert("insert contact error"+error);
                               deferred.reject(error);
                               });
        
        return deferred.promise;
    }
    
    //Document function
    
    /**
     * @name getDocument
     * @desc  function fetch specific document from couchdb database
     * @param id - document id
     * @returns document
     */
    function getDocument(id){
        console.log("CouchDBServices.getDocument()");
        var q = $q.defer();
        db.get(id).then(function (doc) {
                     console.log("success: "+doc);
                     q.resolve(doc);
                     }).catch(function (err) {
                              alert("error"+err);
                              console.log("error; "+err);
                              q.reject(err);
                              });
        return q.promise;
    }
    
    /**
     * @name getDocuments
     * @desc  function fetch document's from couchdb database
     * @param ids - array of documents id
     * @returns documents
     */
    function getDocuments(ids){
        console.log("CouchDBServices.getDocuments()");
        var q = $q.defer();
        db.allDocs({
                   keys:ids,
                   include_docs:true
                   }).then(function (doc) {
                           console.log("success: "+doc);
                           q.resolve(doc);
                           }).catch(function (err) {
                                    alert(err)
                                    console.log("error; "+err);
                                    q.reject(err);
                                    });
        return q.promise;
    }
    
    /**
     * @name createDocument
     * @desc  function create document in couchdb database
     * @param data - object with key - value properties
     * @returns information about successfully or not successfully created document
     */
    function createDocument(data){
        console.log("CouchDBServices.createDocument()");
        var q = $q.defer();
        db.put(data)
        .then(function (response) {
              console.log("success: "+response);
              q.resolve(response);
              }).catch(function (err) {
                       q.reject(err);
                       console.log("err: "+err);
                       });
        return q.promise;
    }
    
    /**
     * @name updateDocument
     * @desc  function update specific document in couchdb database
     * @param id - document id
     * @param data - object with key - value properties
     * @returns information about successfully or not successfully created document
     */
    function updateDocument(id,data){
        console.log("CouchDBServices.updateDocument()");
        var q = $q.defer();
        db.get(id).then(function(doc) {
                        return db.put(
                                      data,
                                      doc._id,
                                      doc._rev
                                      );
                        }).then(function(response) {
                                console.log("success: "+response);
                                q.resolve(response);
                                }).catch(function (err) {
                                         console.log("err"+err);
                                         q.reject(err);
                                         });
        return q.promise;
    }
    
    //Query methods - uses design documents
    
    /**
     * @name checkUser
     * @desc  function checks if user (user document) exists in database
     * @param userId - user id ie. document id
     * @returns object with document id and info that user exists,
     *          empty object if not exists and error if something isn't ok
     */
    function checkUser(userId){
        console.log("CouchDBServices.checkUser()");
        var q = $q.defer();
        db.query('user/userExists', {
                 key          : userId,
                 include_docs : false,
                 limit        : 1
                 }).then(function (res) {
                         console.log("success: "+res);
                         q.resolve(res);
                         }).catch(function (err) {
                                  q.reject(err);
                                  console.log("err: "+err);
                                  });
        return q.promise;
    }
    
    /**
     * @name auth
     * @desc  function checks if user (user document) exists in database
     * @param user - object with user phone and password
     * @returns object with user document if exists,
     *          empty object if not exists and error if something isn't ok
     */
    function auth(user){
        console.log("CouchDBServices.auth()");
        var q = $q.defer();
        db.query('user/auth', {
                 key         : [user.phone,user.password],
                 include_docs : true
                 }).then(function (res) {
                         console.log("success: "+res);
                         q.resolve(res);
                         }).catch(function (err) {
                                  q.reject(err);
                                  console.log("err: "+err);
                                  });
        return q.promise;
    }
    
    /**
     * @name conversationExists
     * @desc  function checks if specific conversation document exists in database
     * @param chatId - id of conversation document
     * @returns object with conversation document if exists,
     *          empty object if not exists and error if something isn't ok
     */
    function conversationExists(chatId){
        console.log("CouchDBServices.conversationExists()");
        var q = $q.defer();
        db.query('conversation/chatExists', {
                 key          : chatId,
                 include_docs : true,
                 limit        : 1
                 }).then(function (res) {
                         console.log("success: "+res);
                         q.resolve(res);
                         }).catch(function (err) {
                                  q.reject(err);
                                  console.log("err: "+err);
                                  });
        return q.promise;
    }
}


