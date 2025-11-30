import {ExpressionResolver} from "../../../index.js";
import {EXECUTERNAME} from "../../../src/executer/EsprimaExecuter.js"

describe("resolve test:", () => {
	const executerReset = ExpressionResolver.defaultExecuter;
	beforeAll(() => {
		ExpressionResolver.defaultExecuter = EXECUTERNAME;
	});

	afterAll(() => {
		ExpressionResolver.defaultExecuter = executerReset;
	});

	
	it('"test"', async () => {
		const result = await ExpressionResolver.resolve("test", { test: "success" });
		expect(result).toBe("success");
	});

	it('"${test}"', async () => {
		const result = await ExpressionResolver.resolve("${test}", { test: "success" });
		expect(result).toBe("success");
	});
	

	it('"${test?.value}"', async () => {
		const result = await ExpressionResolver.resolve("${test?.value}", { test: "success" });
		expect(typeof result === "undefined").toBe(true);
	});

	
	it("resolve \"${typeof test !== \\\"undefined\\\" ? test : undefined}\" to default", async () => {
		const expression = "${typeof test !== \"undefined\" ? test : undefined}";
		const result = await ExpressionResolver.resolve(expression, {}, "fail");
		expect(result).toBe("fail");
	});

	it("resolve \"${test instanceof Array }\" to default", async () => {
		const expression = "${test instanceof Array }";
		const result = await ExpressionResolver.resolve(expression, {}, false);
		expect(result).toBe(false);
	});
	
	
	it("resolve \"${test}\" but no default", async () => {
		const expression = "${typeof test !== \"undefined\" ? test : undefined}";
		const result = await ExpressionResolver.resolve(expression, {});
		expect(result).toBeUndefined();
	});

	it("resolve \"${new Array()}\" to new Array", async () => {
		const expression = "${new Array()}";
		const result = await ExpressionResolver.resolve(expression, {});
		expect(result instanceof Array).toBe(true);
	});

	it("resolve \"${await fetch(url)}\"", async () => {
		const expression = "${await fetch(url)}";
		console.log(new URL(document.location))
		const result = await ExpressionResolver.resolve(expression, {url: "/"});
		expect(result != null).toBe(true);
	});

	it("resolve \"${Object.freeze(url) || true}\"", async () => {
		const expression = "${Object.freeze(url) || true}";
		const result = await ExpressionResolver.resolve(expression, {url: new URL(location)});
		expect(result != null).toBe(true);
	});

	it("resolve complex arrow function", async () => {
		const expression = `\${		
			await (async (value) => {			
				return value;			
			})(url)	
		}`;
		const result = await ExpressionResolver.resolve(expression, {url: new URL(location)});
		expect(result != null).toBe(true);
	});

	it("resolve complex function", async () => {
		const expression = `\${		
			await (async function(value){			
				return value;			
			})(url)	
		}`;
		const result = await ExpressionResolver.resolve(expression, {url: new URL(location)});
		expect(result != null).toBe(true);
	});
	
	
	it("resolve \"${test}\" throw an error with no default", async () => {
		const expression = "${test}";
		const result = await ExpressionResolver.resolve(expression, {}, expression);
		expect(result).toBe(expression);
	});
	
	it("resolve \"${test}\" as Object", async () => {
		const result = await ExpressionResolver.resolve("${test}", {"test": {"type" : "object"}}, "fail");
		expect(typeof result).toBe("object");
		expect(result.type).toBeDefined();
		expect(result.type).toBe("object");
	});
	
	it("resolve \"${test}\" as function", async () => {
		const result = await ExpressionResolver.resolve("${test}", {"test": function(){return "function";}}, "fail");
		expect(typeof result).toBe("function");
		expect(result()).toBe("function");
	});
	
	it("resolve \"${test}\" with timeout", async () => {
		const result = await ExpressionResolver.resolve("${test}", {"test":"success"}, "fail", 1000);
		expect(result).toBe("success");
	});
	
	it("resolve \"test\"", async () => {
		const result = await ExpressionResolver.resolve("test", {"test":"success"}, "fail");
		expect(result).toBe("success");
	});
	
	it("resolve \"test\" with timeout", async () => {
		const result = await ExpressionResolver.resolve("test", {"test":"success"}, "fail", 1000);
		expect(result).toBe("success");
	});
	
	it("resolve \"${getPromise()}\" as a promise", async () => {
		const result = await ExpressionResolver.resolve("${getPromise()}", {"getPromise":async () => "success"}, "fail");
		expect(result).toBe("success");
	});
	
	it("resolve \"${await promise1 + ' ' + await promise2}\" combine multiple promises", async () => {
		const toPromise = async (value) => value;
		
		const result = await ExpressionResolver.resolve("${await promise1 + ' ' + await promise2}", {"promise1":toPromise("value1"), "promise2":toPromise("value2")}, "fail");
		expect(result).toBe("value1 value2");
	});
	
	it("resolve \"${value}\" value = 0", async () => {
		const result = await ExpressionResolver.resolve("${value}", {"value":0}, "fail");
		expect(result).toBe(0);
	});
	
	it("resolve escaped expression \"\\${test}\" to \"${test}\"", async () => {
		const expression = "${test}";
		const result = await ExpressionResolver.resolve("\\" + expression, {});
		expect(result).toBe(expression);
	});

	it("resolve \"${`${test}`}\"", async () => {
		const expression = "${`${test}`}";
		const result = await ExpressionResolver.resolve(expression, {test: "test"});
		expect(result).toBe("test");
	});

	it("resolve \"${test.map(item => item)}\"", async () => {
		const expression = "${test.map(item => item)}";
		const result = await ExpressionResolver.resolve(expression, {test: ["1", "2", "3"]});
		expect(result instanceof Array).toBe(true);
	});
	
});
