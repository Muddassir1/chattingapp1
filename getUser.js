module.exports = function(req,response,client){

	var email  = req.session.email;
	const query = "SELECT username,gender FROM users WHERE email = $1";
	const values = [email];
	client.query(query, values, (err, res) => {
		if (err) {
			console.log(err.stack)
		} else {
			var data = res.rows[0]
			var userData = {username:data.username,gender:data.gender}
			console.log(userData)
			response.render('index',{userData:userData});
		}
	})
}

