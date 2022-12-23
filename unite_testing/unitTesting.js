function testNumber(name, expectedResult, precision, result) {
	let message;
	let warning;

	tempResult = Number(result);
	if (tempResult !== result) warning = "⚠️: Result is not a boolean";
	result = tempResult;

	if (result < expectedResult + precision && result > expectedResult - precision) {
		message = `✅: ${name} - Test passed`;
		pass = true;
	} else {
		message = `❌: ${name} - Test failed`;
		pass = false;
	}
	return new UnitTestResult(name, pass, expectedResult, result, message, null, warning);
}




function testBooleanIsTrue(name, expectedResult, funcToCall, ...args) {
	let message;
	let warning;

	tempResult = Boolean(result);
	if (tempResult !== result) warning = "⚠️: Result is not a boolean";
	result = tempResult;

	if (result == expectedResult) {
		message = `✅: ${name} - Test passed`;
		pass = true;
	} else {
		message = `❌: ${name} - Test failed`;
		pass = false;
	}
	return new UnitTestResult(name, pass, expectedResult, result, message, null, warning);
}




function callFunction(funcToCall, ...args) {
	try {
		return funcToCall(...args);
	} catch (error) {
		return error;
	}
}



class UnitTestResult {
	constructor(name, pass, expectedResult, result, message, error, warning) {
		this.name = name;
		this.pass = pass;
		this.expectedResult = expectedResult;
		this.result = result;
		this.message = message;
		this.error = error;
		this.warning = warning;
		console.log(message);
		if (error) console.error(error);
		if (warning) console.warn(warning);
	}
	toString() {
		return this.message;
	}
}

function groupTest(name, tests) {
	let pass = true;
	let toPrint = "";
	for (let test of tests) {
		pass = pass && test.pass
		toPrint += test + "<br>";
	}
	document.write(`<h2>${ (pass? "✅": "❌")+name}</h2><br><div>${toPrint}</div>`);
}