const myWorker = new Worker("worker2.js");
myWorker.onmessage = (message) => { postMessage(message.data) };
self.onmessage = function handleMessageFromMain(msg) {
	postMessage("1 jump " + msg.data);
	myWorker.postMessage("1 jump " + msg.data);
	let test = {
		x: 32
	}
	test.test = (x) => { return x * this.x };
	postMessage(JSON.stringify([test]))
};