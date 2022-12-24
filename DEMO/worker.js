self.onmessage = function handleMessageFromMain(msg) {
	/* postMessage("1 jump " + msg.data); */
	postMessage(msg.data);
	/* let test = {
		x: 32
	}
	postMessage(test) */
};