var socket = io.connect('https://chattingapp1.herokuapp.com');
//var socket = io.connect('http://localhost');

socket.on('userConnected',function(data){
	console.log(data);
	connectTo(data);
})
search = true;
function login(member) {

	var username = $("#username").val();
	var gender = $("#gender").val();
	var separate = member?true:false;
	$("#member").val(member?"1":"0");

	$('.ptext').html('<p>Attempting to login.</p>');

	var phone = window.phone = PHONE({
	    number        : username || "Anonymous", // listen on username line else Anonymous
	    publish_key   : 'pub-c-e2563117-3654-4974-be3d-1eac0f7727bd', // Your Pub Key
	    subscribe_key : 'sub-c-dd3e2c72-80ac-11e9-bc4f-82f4a771f4c5', // Your Sub Key
	});	
	phone.ready(function(){

			socket.emit('userConnected',{username:username,gender:gender,member:separate});
			//form.login_submit.hidden="true";
			//$('#call').show();
			$('.ptext').html('<p>Logged in successfully.</p>');
			$('.ptext').html('<p>Searching for users.</p>');
			
			//Search for user
			//searchUser();

			phone.receive(function(session){ // Stop searhing if user is connected

				search = false;
				$("#status").val('connected');
				console.log(session);
				session.connected(function(session) { 
					name = session.number;
					$('.ptext').html('<p>You are now connected to '+name+'</p>'); 
					
					//video_out.appendChild(session.video); showModal();
				});
				session.ended(function(session) { // User hangs up
console.log('hung up');
					/*console.log('hung up');
					search = true;
					name = session.number;
					$('.ptext').html('<p>'+name+' ended the session</p>');
					$('.ptext').html('<p>Searching for users.</p>');

					$("#status").val('idle');*/
				});
				return false;
			});

		
			socket.on('searchuser',function(sender){ // someone is searrching for me
				var status = $("#status").val();
				if(status == 'idle' && typeof phone !== 'undefined'){
					console.log('im available'+socket.id);
					console.log('req by'+sender.senderid);
					socket.emit('availableuser',{
						sender:sender.senderid,
						receiver:socket.id
					});
				}
			})

			socket.on('connect_to',function(id){
				$("#status").val('connected');
				phone.dial(id);
				$('.ptext').html('<p>Connecting to '+id+'</p>');
			})


	});
}	

window.onbeforeunload = hangupcall;
function hangupcall(){
	if(typeof phone !== 'undefined'){
		phone.hangup();
		console.log('my num'+phone.number());
		$('.ptext').html('<p>Searching for users</p>'); 
		$("#status").val('idle');	
	}

	socket.emit('closing',name);
	return null;
}


function connectTo(data){
	var id = data.socketid;
	var username = data.username;
	var gender = data.gender;
	var status = $("#status").val();
	var member = $("#member").val();
	var mygender = $("#gender").val();

	if(status == 'idle' && typeof phone !== 'undefined'){
		if(member == "1"){
			// If i'm subscribed to specific call, check the gender of the caller
			if(gender == mygender){
				socket.emit('checkAnotherUser',data);
			}
			else{
				phone.dial(username);
				$('.ptext').html('<p>Connecting to '+username+'</p>');
			}
		}
		else{
			phone.dial(username);
			$('.ptext').html('<p>Connecting to '+username+'</p>');
		}
	}
	else{
	// if this user is not available to connect, then iterate the loop in the server side
	socket.emit('checkAnotherUser',data);
	}
}

function searchUser(){

	$('.ptext').html('<p>Searching for users</p>'); 
	self = $("#username").val();
	socket.emit('searchuser');
}

socket.on('redial',function(){
	// This event fires when the user has lost call with someone
	username = $("#username").val();
	gender = $("#gender").val();
	separate = $("#member").val();
	member = separate=="1"?true:false;

	if(search){
		socket.emit('userConnected',{username:username,gender:gender,member:member});
	}
})

socket.on('startRedial',function(name){
	console.log(name);
	var myusername = $("#username").val();
	if(name == myusername){
		search = true;
		$('.ptext').html('<p>'+name+' ended the session</p>');
		$('.ptext').html('<p>Searching for users.</p>');

		$("#status").val('idle');
		socket.emit('phoneCallEnded');
	}
})

    
function makeCall(form){
	if (!window.phone) alert("Login First!");
	else {
		self = $("#username").val();
		$.get("searchuser.php", function(data, status){
			console.log(data);
			var connectedTo = JSON.parse(data);
			phone.dial(connectedTo);
			$('.ptext').html('<p>You are now connected to '+connectedTo+'</p>'); 
		});
		//phone.dial(form.number.value);
	}
	return false;
}
function errWrap(fxn,params){
	try {
		return fxn(params);
	} catch(err) {
		console.log(err);
		//alert("WebRTC is currently only supported by Chrome, Opera, and Firefox");
		return false;
	}
}
