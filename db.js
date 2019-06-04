const {Client} = require('pg')
const client = new Client({
    user: "ezyniorsnagogj",
    password: "749930a4416f9f236796fc161005feb68ddab3d7b4717575bde1d426a6400fc7",
    host: "ec2-50-19-114-27.compute-1.amazonaws.com",
    port: 5432,
    database: "dav2n1fo98igs8",
    ssl: true
})

client.connect()
.then(() => console.log("Connected successfuly"))
.catch(e => console.log(e))



// callback
var query = "SELECT * FROM users";
client.query(query, (err, res) => {
  if (err) {
    console.log(err.stack)
  } else {
    console.log(res.rows[0])
  }
})