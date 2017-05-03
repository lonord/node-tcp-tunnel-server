# node-tcp-tunnel-server
A tcp tunnel service by node.js powered by [Socket.io](https://socket.io) (server side)

client side is [here](https://github.com/lonord/node-tcp-tunnel-client)

This service is used for port forwarding between different computers.

## Usage
```bash
git clone https://github.com/lonord/node-tcp-tunnel-server.git
npm install
npm start
```

## Config
Some custom configure can be modify in `config.js`

- *`serviceListenPort`* port to listen for the client.
- *`users`* The users allow to access.
- *`username`* The user name for authorization.
- *`password`* The password for authorization.

## License
MIT