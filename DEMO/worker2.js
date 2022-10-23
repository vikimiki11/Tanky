self.onmessage = function handleMessageFromMain(msg) {
	postMessage("2 jump " + msg.data);
};