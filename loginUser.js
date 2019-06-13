
module.exports = function(req,response,client){


	const bcrypt = require('bcryptjs');

	const email = req.body.email;
	const password = req.body.password;

// callback
const query = "SELECT * FROM users WHERE email = $1";
const values = [email];
client.query(query, values, (err, res) => {
	if (err) {
		console.log(err.stack)
	} else if(res.rows.length > 0) {
		data = res.rows[0];
		hashedpass = data.password;
		bcrypt.compare(password, hashedpass, function(err, res) {
			if(res){
				//redirect user to homepage
				req.session.loggedin = true;
				req.session.email = email;
				response.redirect('./')
			}
		});
	}
	else{
		response.render('login',{error: "Invalid Credentials"})
	}
})
}