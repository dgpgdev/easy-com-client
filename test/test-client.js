var Client = require('../lib/Client');
var c = new Client('ws://localhost:8080');
c.on('open', (evt) => console.log(evt))
c.on('close', (evt) => console.log(evt))
c.on('error', (evt) => console.log(evt))
c.on('connected', (msg) => {
	console.log('received message => ', msg);
})

c.connect()
