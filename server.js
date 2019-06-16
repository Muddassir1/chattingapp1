
var express = require('express');
var app = express();
var socket = require('socket.io');
var session = require('express-session')

app.set('view engine','ejs');
app.set('views','./views');
app.use(express.static('public'));
app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'testsession',
    resave: false,
    saveUninitialized: true
}))

app.get("/", function(req,res){
    if(req.session.loggedin){
        var client = require('./db')    
        var getUser = require('./getUser')(req,res,client)
    }
    else{
        res.redirect('/login')
    }
});

app.get('/membership',function(req,res){
    res.render('membership')
})

app.get("/login", function(req,res){
    res.render('login');
});

app.get("/register",function(req,res){
    res.render('register');
})

app.post("/register",function(req,res){
    var client = require('./db')
    var createUser = require('./createUser')(req,res,client)
})

app.post("/login",function(req,res){
    var client = require('./db')
    var loginUser = require('./loginUser')(req,res,client)
})

//testing purpose for subscription
app.get('/subscribe',function(req,res){
    var payment = require('./payments')(req,res);
})

app.get('/payment-cancel',function(req,res){
    console.log(req);
})


var server = app.listen(process.env.PORT || 80, function() {
    console.log("Listening to port: "+process.env.PORT);
});

//require('./db.js');

// Socket setup & pass server
var io = socket(server);
io.on('connection', (socket) => {

    console.log('made socket connection', socket.id);

    socket.on('userConnected',function(data){
        username = data.username;
        socket.gender = data.gender; //Attach gender to the user's socket
        socket.member = data.member    // User has special call or random

        io.clients((error, clients) => {
            if (error) throw error;
    		// My position in clients
    		currentPos = clients.indexOf(socket.id);

             // Adding condition for members
             if(socket.member){

                // Get gender specific users
                clients = getClientsForMember(clients,socket.gender);
                console.log('members' + clients);
            }
            if(clients.length > 1)
            {
                //check if its not the current user
                if(clients[0] != socket.id){

    			//Send request to first user
    			io.to(clients[0]).emit('userConnected',{
    				socketid:socket.id,
    				username:username,
                    gender:socket.gender,
                    member:socket.member
                });
            }
               else{// if the first user logins after the second user, then do this. SPECIFIC for FIRST USER ONLY
                   io.to(clients[1]).emit('userConnected',{
                       socketid:socket.id,
                       username:username,
                       gender:socket.gender,
                       member:socket.member
                   });
               }
           }
    		//clients[currentPos]
    		/*if(client != socket.id)
            io.to(client).emit('userConnected',socket.id);*/
            console.log(clients);
        });
    	//socket.broadcast.emit('userConnected', socket.id);
    })

    socket.on('checkAnotherUser',function(data){
    	initializer = data.socketid;
        console.log('inin'+initializer);
        io.clients((error, clients) => {
             // Adding condition for members
             if(data.member){

                // Get gender specific users
                clients = getClientsForMember(clients,data.gender);
                console.log('membersafter checking ' + clients);
            }
            newPos = clients.indexOf(socket.id); 
            if(clients[newPos+1] != undefined)
            {
                if(clients[newPos+1] != initializer)
                    io.to(clients[newPos+1]).emit('userConnected',data);

                else if(clients[newPos+2] != undefined) 
                    io.to(clients[newPos+2]).emit('userConnected',data);
            }
    		/*else{
    			io.to(clients[0]).emit('userConnected',data);
    		}*/ //commented this to prevent continuous loop of search
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
    /*socket.on('disconnect',function(){
    	console.log('someone disconnected');
    	io.clients((error, clients) => {
    		if (error) throw error;

    		console.log(clients);
    	});
    	socket.broadcast.emit('redial');
    })*/

    socket.on('closing',function(name){
        console.log('he clcosed '+ name);
        socket.broadcast.emit('startRedial',name);
    })

    socket.on('phoneCallEnded',function(){
        io.sockets.emit('redial');
    })

    function getClientsForMember(clients,gender){

        oppositeGender = gender=="male"?"female":"male";
        //var newClients = clients.filter(i => io.sockets.connected[i].gender == oppositeGender);
        clients.forEach(function(value,index){
            if(io.sockets.connected[value].gender != oppositeGender){
                //newClients = newClients.filter(i => i != );
                delete clients[index]
            }
        })
        return clients;
    }

});

