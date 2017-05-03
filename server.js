const debug = require('debug')('tunnel:server');
const md5 = require('js-md5');
const events = require('./event');
const ServerHandler = require('./server-handler');
const io = require('socket.io')();
const config = require('./config');

const users = config.users.map(u => {
	u.password = md5(u.password);
	return u;
});

io.on('connection', function (client) {
	let handler = new ServerHandler();

	client.on(events.DISCONNECTED, pack => {
		debug('client.on DISCONNECTED');
		handler.handleMsgDisconnect(pack);
	});
	client.on(events.sys.INIT, info => {
		debug('client.on INIT');
		if (!findUser(info.username, info.password)) {
			client.emit(events.sys.ERROR, 'authorization failed');
		}
		try {
			handler.openService(info.port);
		}
		catch (e) {
			client.emit(events.sys.ERROR, e.message);
		}
	});
	client.on(events.DATA, pack => {
		debug('client.on DATA');
		handler.handleMsgData(pack);
	});
	client.on('disconnect', () => {
		debug('client.on disconnect');
		handler.closeAll();
	});

	handler.on(events.CONNECTED, pack => {
		debug('handler.on CONNECTED');
		client.emit(events.CONNECTED, pack);
	});
	handler.on(events.DISCONNECTED, pack => {
		debug('handler.on DISCONNECTED');
		client.emit(events.DISCONNECTED, pack);
	});
	handler.on(events.DATA, pack => {
		debug('handler.on DATA');
		client.emit(events.DATA, pack);
	});
});
io.listen(config.serviceListenPort);

function findUser(username, password) {
	for (let u of users) {
		if (u.username == username && u.password == password) {
			return true;
		}
	}
	return false;
}