module.exports = function(req,response,client){

	var email  = req.session.email;
	const query = "SELECT username,gender,subscription FROM users WHERE email = $1";
	const values = [email];
	client.query(query, values, (err, res) => {
		if (err) {
			console.log(err.stack)
		} else {
			var data = res.rows[0]
			var oGender = (data.gender == "male")?"female":"male"
			var userData = {username:data.username,
				gender:data.gender,
				member:data.subscription,
				oGender: oGender
			}
			console.log(userData)
			response.render('index',{userData:userData});
		}
	})
}

