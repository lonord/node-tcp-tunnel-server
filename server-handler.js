const debug = require('debug')('tunnel:server-handler');
const events = require('./event');
const net = require('net');
const shortid = require('shortid');
const EventEmitter = require('events');

const HOST = '0.0.0.0';

class ServerHandler extends EventEmitter {
	constructor() {
		super();
		this.clients = {};
		this.onClientConnected = this.onClientConnected.bind(this);
	}

	createSockListener() {
		this.server = net.createServer();
		this.server.listen(this.port, HOST);
		this.server.on('connection', this.onClientConnected);
		debug('createSockListener port: %d', this.port);
	}

	onClientConnected(client) {
		let id = shortid.generate();
		debug('onClientConnected id: %s', id);
		this.clients[id] = client;
		this.emit(events.CONNECTED, {
			id: id
		});
		client.on('close', () => {
			this.emit(events.DISCONNECTED, {
				id: id
			});
			delete this.clients[id];
			debug('client.on close id: %s', id);
		});
		client.on('data', data => {
			this.emit(events.DATA, {
				id: id,
				data: data
			});
			debug('client.on data id: %s', id);
		});
	}

	handleMsgDisconnect(pack) {
		debug('handleMsgDisconnect id: %s', pack.id);
		let client = this.clients[pack.id];
		if (client) {
			client.end();
			client.destroy();
			delete this.clients[pack.id];
		}
	}

	handleMsgData(pack) {
		debug('handleMsgData id: %s', pack.id);
		let client = this.clients[pack.id];
		if (client) {
			client.write(pack.data);
		}
	}

	closeAll() {
		debug('closeAll');
		for (let id in this.clients) {
			let client = this.clients[id];
			client.end();
			client.destroy();
		}
		this.clients = {};
		if (this.server) {
			this.server.removeAllListeners();
			this.server.close();
			this.server = null;
		}
	}

	openService(port) {
		this.port = port;
		this.createSockListener();
	}
}
module.exports = ServerHandler;