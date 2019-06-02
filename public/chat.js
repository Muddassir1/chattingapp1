var socket = io.connect('https://chattingapp1.herokuapp.com');

socket.on('userConnected',function(data){
	console.log(data);
	connectTo(data);
})
search = true;
function login() {
	var username = $("#username").val();
	console.log(username);
	$('.ptext').html('<p>Attempting to login.</p>');

	var phone = window.phone = PHONE({
	    number        : username || "Anonymous", // listen on username line else Anonymous
	    publish_key   : 'pub-c-e2563117-3654-4974-be3d-1eac0f7727bd', // Your Pub Key
	    subscribe_key : 'sub-c-dd3e2c72-80ac-11e9-bc4f-82f4a771f4c5', // Your Sub Key
	});	
	phone.ready(function(){

			socket.emit('userConnected',username);
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
					var name = session.number;
					$('.ptext').html('<p>You are now connected to '+name+'</p>'); 
					
					//video_out.appendChild(session.video); showModal();
				});
				session.ended(function(session) { // User hangs up
					
					console.log('hung up');
					search = true;
					var name = session.number;
					socket.emit('closing');

					$('.ptext').html('<p>'+name+' ended the session</p>');
					$('.ptext').html('<p>Searching for users.</p>');

					/*$.get("updateuser.php?name="+name+"&connected=0", function(data, status){ // Set idle to 0
						console.log(data);
					});*/
					$("#status").val('idle');
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

	/*window.onbeforeunload = closingCode;
	function closingCode(){
		$.get("deleteuser.php?name="+form.username.value, function(data, status){
			
		});
		return null;
	} */

function connectTo(data){
	var id = data.socketid;
	var username = data.username;
	var status = $("#status").val();
	if(status == 'idle' && typeof phone !== 'undefined'){
		phone.dial(username);
		$('.ptext').html('<p>Connecting to '+username+'</p>');
	}
	else{
	// if this user is not available to connect, then iterate the loop in the server side
	socket.emit('checkAnotherUser',{
		socketid: id,
		username: username
	});
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
	if(search){
		socket.emit('userConnected',username);
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
function errWrap(fxn){
	try {
		return fxn();
	} catch(err) {
		console.log(err);
		//alert("WebRTC is currently only supported by Chrome, Opera, and Firefox");
		return false;
	}
}
