
module.exports = function(req,response,client){

	const bcrypt = require('bcryptjs');
	const saltRounds = 10;
	const username = req.body.username;
	const email = req.body.email;
	const password = req.body.password;
	const gender = req.body.gender;

	const query = "SELECT * FROM users WHERE email = $1";
	const values = [email];
	client.query(query, values, (err, res) => {
		if(res.rows.length > 0) {
			response.render('register',{error: "User already exists"})
		}
		else{
			bcrypt.hash(password, saltRounds, function(err, hash) {
				var query = "INSERT INTO users (username,password,email,gender)";
				query+= " VALUES ($1,$2,$3,$4)";
				const values = [username,hash,email,gender];

				client.query(query, values, (err, res) => {
					if (err) {
						console.log(err)
					} else {
						req.session.loggedin = true;
						req.session.email = email;
						response.redirect('./')
					}
				})
			});
		}
	})
}