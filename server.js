
var express = require('express');
var app = express();
var socket = require('socket.io');

app.set('view engine','ejs');
app.set('views','./views');
app.use(express.static('public'));

app.get("/", function(req,res){
  res.render('index');
});

var server = app.listen(process.env.PORT || 5000, function() {
  console.log("Listening to port: "+ process.env.PORT);
});

// Socket setup & pass server
var io = socket(server);
io.on('connection', (socket) => {

    console.log('made socket connection', socket.id);

    socket.on('userConnected',function(username){
    	io.clients((error, clients) => {
    		if (error) throw error;
    		// My position in clients
    		currentPos = clients.indexOf(socket.id);
    		if(clients[0] != socket.id)
    		{
    			//Send request to first user
    			io.to(clients[0]).emit('userConnected',{
    				socketid:socket.id,
    				username:username
    			});
    		}
    		//clients[currentPos]
    		/*if(client != socket.id)
    			io.to(client).emit('userConnected',socket.id);*/
    		console.log(clients);
    	});
    	//socket.broadcast.emit('userConnected', socket.id);
    })

    socket.on('checkAnotherUser',function(data){
    	console.log(data);
    	initializer = data.socketid;
    	console.log('inin'+initializer);
    	io.clients((error, clients) => {
    		newPos = clients.indexOf(socket.id);
    		if(clients[newPos+1] != undefined)
    		{
    			if(clients[newPos+1] != initializer)
    			io.to(clients[newPos+1]).emit('userConnected',data);
    		}
    		else{
    			io.to(clients[0]).emit('userConnected',data);
    		}
    	});
    })
    
    socket.on('searchuser',function(){ // request recieved to search users
    	socket.broadcast.emit('searchuser',{senderid:socket.id});
    })

    socket.on('availableuser',function(data){
    	io.to(data.sender).emit('connect_to',data.receiver);
    	io.to(data.receiver).emit('connect_to',data.sender);
    })

 /*   socket.on('hangup', function(sendto){

    	console.log('someone just disconnected'+socket.id);
    	console.log('start searching now'+sendto);

    	socket.broadcast.emit('userleft',socket.id);
    })
*/
    socket.on('disconnect',function(){
    	console.log('someone disconnected');
    	io.clients((error, clients) => {
    		if (error) throw error;

    		console.log(clients);
    	});
    	socket.broadcast.emit('redial');
    })
});
