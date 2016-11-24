app.factory('socket',function(socketFactory){
	//Create socket and connect to http://chat.socket.io 
   //var socket = io.connect('http://192.254.67.45:3000');
   //var socket = io.connect('http://192.168.1.12:3000');
   var socket = io.connect('http://192.168.1.12:3000');
   
  	mySocket = socketFactory({
    	ioSocket: socket
  	})
	return mySocket;
})