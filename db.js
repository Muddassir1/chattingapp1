const {Client} = require('pg')

const client = new Client({
	user: "zrnvnykmyrizqm",
	password: "2d5fb2eebc45f1dcfa0c10b86ae87d9f570dc65963c807ecddfa110e2d3debf8",
	host: "ec2-54-83-9-169.compute-1.amazonaws.com",
	port: 5432,
	database: "daskiiapem4hqj",
	ssl: true
})

client.connect()
.then(() => console.log("Connected successfuly"))	
.catch(e => console.log(e))

module.exports = client;