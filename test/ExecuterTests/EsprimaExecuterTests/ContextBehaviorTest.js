import {ExpressionResolver} from "../../../index.js";
import {EXECUTERNAME, setDebug} from "../../../src/executer/EsprimaExecuter.js"

describe(`${EXECUTERNAME} context behavior test:`, () => {
	const executerReset = ExpressionResolver.defaultExecuter;
	beforeAll(() => {		
		ExpressionResolver.defaultExecuter = EXECUTERNAME;
		const global = window || global || self || this || {};
		global.test = "global context";
	});

	afterAll(function() {
		ExpressionResolver.defaultExecuter = executerReset;
		const global = window || global || self || this || {};
		delete global.test;
	});
	

	it("\"${window.test}\" from global context", async () => {
		const result = await ExpressionResolver.resolveText("${window.test}");
		expect(result).toBe("global context");
	});

	it("\"${test}\" from local context (override global context)", async () => {
		const result = await ExpressionResolver.resolveText("${test}", { test: "local context" });
		expect(result).toBe("local context");
	});

	it("\"${window.document.location}\" from browser window context", async () => {
		const result = await ExpressionResolver.resolveText("${window.document.location}");
		expect(result).toBeDefined();
		//console.log(result)
		expect(result == document.location).toBe(true);
	});

	it("\"${document.location}\" with overrided browser window context", async () => {
		const result = await ExpressionResolver.resolveText("${document.location}", { document: { location: "overrided" } });
		expect(result).toBeDefined();
		expect(result == document.location).toBe(false);
		expect(result == "overrided").toBe(true);
	});

	it("\"${document.location}\" from browser window context and local context", async () => {
		let result = await ExpressionResolver.resolveText("${document.location}", { test: "local context" });
		expect(result).toBe("undefined");
		
		result = await ExpressionResolver.resolveText("${test}", { test: "local context" });
		expect(result == "local context").toBe(true);
	});
});