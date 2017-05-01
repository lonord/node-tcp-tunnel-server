const debug = require('debug')('tunnel:server');
const events = require('./event');
const ServerHandler = require('./server-handler');
const io = require('socket.io')();
const config = require('./config');

io.on('connection', function (client) {
	let handler = new ServerHandler();

	client.on(events.DISCONNECTED, pack => {
		debug('client.on DISCONNECTED');
		handler.handleMsgDisconnect(pack);
	});
	client.on(events.sys.REMOTE_PORT, port => {
		debug('client.on REMOTE_PORT');
		handler.openService(port);
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
io.listen(config.service.remoteListenPort);