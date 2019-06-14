var paypal = require('paypal-rest-sdk');


paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AXXX3nR0hSm-hC3eMNakMGLUDV-Wa6LOjpAq5Jk3SQov_7lVeAWnQRRcmAQ0Q7CZdi8qlFgoLxK9LNdv',
  'client_secret': 'EFTYvuL-YpXUtKncq9chLEd2xcfV3Wt0rp5hJYvZQVuIjXnEIDd0Vhus-Fga9xFZRnSobUbvofbN8seD'
});
//P-85G20577UY138270KLT7L33I
var data = {
	"plan_id": "P-85G20577UY138270KLT7L33I",
	"subscriber": {
		"name": {
			"given_name": "Muddassir",
			"surname": "Ahmed"
		},
		"email_address": "muddassir.ah@gmail.com"
	},
	"auto_renewal": true,
	"application_context": {
		"brand_name": "Chat App",
		"locale": "en-US",
		"shipping_preference": "SET_PROVIDED_ADDRESS",
		"user_action": "SUBSCRIBE_NOW",
		"payment_method": {
			"payer_selected": "PAYPAL",
			"payee_preferred": "IMMEDIATE_PAYMENT_REQUIRED"
		},
		"return_url": "https://localhost/payment-done",
		"cancel_url": "https://localhost/payment-cancel"
	}
}


module.exports = function(req,res){

	id = req.query.subscriptionID
	//id="I-U0TXULKGSWT4"
	paypal.subscription.get("I-D6BS299TPE47",function (error, billingPlan) {
		if (error) {
			res.send("There was an error processing your request")
		} else {
			client = require ('./db')
			const email = req.session.email
			console.log(email)
			const query = "UPDATE users SET subscription_id=$1,subscription=true WHERE email = $2";
			const values = [id,email];
			client.query(query, values, (err, result) => {
				if (err) {
					console.log(err.stack)
				} else {
					res.redirect('./')
				}
			})
			//res.redirect(billingPlan.links[0].href);
		}
	});
}

//console.log(paypal);